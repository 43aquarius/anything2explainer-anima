import React from 'react';
import {useCurrentFrame} from 'remotion';
import {GlitchIn, clamp01, powOutRemain, FONT_ORB} from '../../common';
import {Box, CText, GLOW_RED, GREY, RED_DEEP, WHITE, abs, softOp, firstOp, scaleIn, exitOp, glowOffK} from '../../ui';
import {GlowBlob} from '../../fx';

/**
 * SC03 IP 什么都不保证 · N 319–528（S03 327–423 + S04 434–526 ¶；块 327/434+）
 * 版式：上部 (360,450) `IP` 圆形徽章——圆环 190px（draw-on 20 帧）+ Orbitron 100px IP
 *   （GlitchIn rgbSplit 4，本镜唯一 glitch）+ the Internet Protocol 灰 24px；
 *   下半三枚大号否定条 520×88（y 700/810/920 中心）：no receipts / no retries / no order（Noto 900 44px 白），
 *   逐枚自下滑入（每 14 帧一枚）→ 红 6px 删除线 L→R wipe 12 帧划过 → 条变暗 40%。
 * 节拍：321 徽章缩放入 + IP GlitchIn + 圆环 draw-on（=327−6）；345 副标 SoftIn；
 *   428 起否定条逐枚（=434−6 前挂，每 14 帧；划线 +8 帧）→ 末条划完 476。
 * 徽章紫柔光 30 帧呼吸（持续动作，GlowBlob）。
 * 运镜：无（分镜表清单不含 SC03）。离场：末 8 帧归零（521–528，¶）；徽章光先灭。
 * 停留：末条划完+变暗 ≈481 → 离场 521，≥30 帧 ✓（分镜表原算式 434+80，本表更保守）。
 */
const F0 = 319;
const TO = 528;

const T_BADGE = 321, RING_LEN = 20, T_SUB = 345;
const T_BAR = 428, BAR_D = 14, BAR_SLIDE = 12, STRIKE_OFF = 8, STRIKE_LEN = 12, DIM_OFF = STRIKE_OFF + STRIKE_LEN;

const BARS = [
  {cy: 700, text: 'no receipts'},
  {cy: 810, text: 'no retries'},
  {cy: 920, text: 'no order'},
];

export const SC03: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const exOp = exitOp(N, TO, 8);
  if (exOp <= 0) return null;

  const bn = N - T_BADGE;
  const badgeS = 0.3 + 0.7 * scaleIn(bn, 21);
  const ringP = clamp01(bn / RING_LEN);
  const glowK = softOp(N - (T_BADGE + RING_LEN), 8) * glowOffK(N, TO, 6, 8);
  const R = 95;
  const CIRC = 2 * Math.PI * R;

  return (
    <div style={{position: 'absolute', inset: 0, opacity: exOp}}>
      {/* ---- IP 徽章（主角 190px + 紫柔光呼吸）---- */}
      <GlowBlob cx={360} cy={450} r={145} N={N} k={glowK} />
      <div style={{position: 'absolute', inset: 0, opacity: firstOp(bn, 6), transform: `scale(${badgeS.toFixed(4)})`, transformOrigin: '360px 450px'}}>
        <svg width={720} height={1280} viewBox="0 0 720 1280" style={{position: 'absolute', inset: 0}}>
          <circle cx={360} cy={450} r={R} fill="none" stroke={WHITE} strokeWidth={3}
            strokeDasharray={CIRC} strokeDashoffset={CIRC * (1 - ringP)} transform="rotate(-90 360 450)"
            style={{filter: 'drop-shadow(0 0 3px rgba(255,255,255,0.5))'}} />
          <circle cx={360} cy={450} r={R - 9} fill="none" stroke="rgba(255,255,255,0.22)" strokeWidth={1.5} strokeDasharray="4 10" />
        </svg>
        <GlitchIn N={N} f0={T_BADGE} rgbSplit={4} seed={7}>
          <CText cx={360} cy={452} size={100} weight={700} family={FONT_ORB} color={WHITE} letterSpacing={3}
            style={{fontVariantNumeric: 'tabular-nums', textShadow: '0 0 18px rgba(102,45,248,.55)'}}>
            IP
          </CText>
        </GlitchIn>
      </div>
      {/* 副标 */}
      <div style={{position: 'absolute', inset: 0, opacity: softOp(N - T_SUB, 8)}}>
        <CText cx={360} cy={592} size={24} weight={600} color={GREY} letterSpacing={1}>the Internet Protocol</CText>
      </div>

      {/* ---- 三枚否定条（逐枚滑入 → 红删除线划过 → 变暗 40%）---- */}
      {BARS.map((b, i) => {
        const t0 = T_BAR + i * BAR_D;
        const n = N - t0;
        if (n < 0) return null;
        const slide = 64 * powOutRemain(n, BAR_SLIDE, 2.5); // 自下滑入 Δ64
        const strikeP = clamp01((N - (t0 + STRIKE_OFF)) / STRIKE_LEN);
        const dimK = clamp01((N - (t0 + DIM_OFF)) / 5); // 划完后 5 帧内变暗
        const dim = 1 - 0.4 * dimK;
        return (
          <React.Fragment key={b.text}>
            <Box x={100} y={b.cy - 44 + slide} w={520} h={88} r={12} sw={2.5} stroke={WHITE} fill="#000" opacity={softOp(n, 8) * dim} />
            <div style={{position: 'absolute', inset: 0, opacity: softOp(n, 8) * dim}}>
              <CText cx={360} cy={b.cy + slide} size={44} weight={900} color={WHITE} letterSpacing={1}>{b.text}</CText>
            </div>
            {/* 红删除线（L→R wipe，随条滑入位移一致） */}
            {strikeP > 0 ? (
              <div style={{...abs(110, b.cy + slide - 3, 500 * strikeP, 6), borderRadius: 3, background: RED_DEEP, boxShadow: GLOW_RED, opacity: softOp(n, 8)}} />
            ) : null}
          </React.Fragment>
        );
      })}
    </div>
  );
};
