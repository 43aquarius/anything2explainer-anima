import React from 'react';
import {useCurrentFrame} from 'remotion';
import {clamp01, GlitchIn, FONT_ORB} from '../../common';
import {GlowBlob} from '../../fx';
import {CText, MonoText, SoftIn, BLOOM, GREY, GREY_MID, WHITE, TEXT_GLOW, abs, softOp, firstOp, exitOp, glowOffK, scaleIn, mix} from '../../ui';
import {MiniWire, riseIn} from './parts';

/**
 * SC05 IP 与它的承诺 · N 950–1182（S07 958–1065 + S08 1076–1180，S08 后接 G2/SC06）
 * 版式：SC02 的白线+两股流量缩到下方 1/3（MiniWire，y 500–560 ≈ 0.45×，流量持续右行）；
 *       线上方居中 IP 圆形徽章（Orbitron 84px 白 + 圆环 160px + GlowBlob 紫柔光，主角）；
 *       徽章下 `the Internet Protocol` 灰 26px；徽章两侧各三枚小问号（灰，每 36 帧左右两组交替明暗）；
 *       再下 `promises:` 灰字打字机打 3 字（pro）后停住 + 光标闪烁 + 待填虚线空槽（悬念留到 SC06 的 NOTHING.）。
 * 节拍（字幕块，timeline.md）：958「That delivery service is called IP,」徽章缩放入场 + `IP` GlitchIn
 *       （本镜唯一 glitch，白名单 rgbSplit 4）+ 圆环 draw-on 20 帧 + 柔光点亮；
 *       1032「the Internet Protocol.」副行 SoftIn + 六枚问号 2 帧错峰 SoftIn；
 *       1076「And here is the strange part:」打字机 3 字停住（1080）→ 1086 虚线空槽 clipPath draw-on 18 帧（1104 落位）。
 * 运镜：无（分镜表 Ch1 运镜清单 SC05 未列；持续动作 = 缩微线流量 + 问号轮换 + 光标闪烁 + 徽章光呼吸）。
 * 离场：¶ 段末，末 8 帧归零（1175–1182；徽章柔光 1168–1174 先灭光）。
 * 停留：末元素（虚线槽）落位 1104 → 离场 1175，71 帧 ✓（S08 末块 57）。
 * 主角：IP 徽章（圆环 160px + 柔光 ≈220px）；光 = 徽章紫柔光（GlowBlob 呼吸）+ 圆环白 BLOOM。
 */
const F0 = 950;
const TO = 1182;

const T_BADGE = 958, T_RING = 960, T_SUB = 1032, T_Q = 1032, T_PROM = 1076, T_SLOT = 1086;

const CX = 640, CY = 250, RING_R = 80, RING_C = 2 * Math.PI * RING_R;
const PROM_TEXT = 'promises:';
const PROM_MAX = 3; // 打字机 3 字后停住（分镜表原文），悬念留给 SC06

/** 六枚问号：徽章两侧各三枚（左侧 l / 右侧 r 两组交替明暗） */
const QMARKS: Array<{x: number; y: number; side: 'l' | 'r'}> = [
  {x: 462, y: 212, side: 'l'},
  {x: 413, y: 264, side: 'l'},
  {x: 460, y: 318, side: 'l'},
  {x: 818, y: 212, side: 'r'},
  {x: 867, y: 264, side: 'r'},
  {x: 820, y: 318, side: 'r'},
];

export const SC05: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const exOp = exitOp(N, TO, 8);

  // 缩微线承接：首帧即有亮度，16 帧上滑 24px 入位，之后流量持续右行
  const wire = riseIn(N - F0, 24, 16);

  // 徽章：21 帧缩放入场；圆环 draw-on 20 帧；柔光 8 帧点亮后 30 帧呼吸（GlowBlob 内建），离场前 6 帧先灭光
  const bn = N - T_BADGE;
  const bScale = 0.55 + 0.45 * scaleIn(bn, 21);
  const bOp = firstOp(bn, 5);
  const ringP = clamp01((N - T_RING) / 20);
  const glowK = softOp(N - (T_BADGE + 4), 10) * glowOffK(N, TO, 6, 8);

  // 问号轮换：72 帧一循环（左右两组各亮 36 帧，末 10 帧交叉渐变）
  const qp = Math.max(0, N - T_Q);
  const ph = qp % 72;
  const half = Math.floor(ph / 36); // 0: 左亮右暗 → 1: 左暗右亮
  const tt = clamp01(((ph % 36) - 26) / 10);
  const lB = half === 0 ? mix(0.85, 0.35, tt) : mix(0.35, 0.85, tt);
  const rB = 1.2 - lB;

  // promises: 打字机（2 帧 1 字，3 字停住）+ 光标闪烁（持续动作到离场）
  const pn = N - T_PROM;
  const typed = PROM_TEXT.slice(0, Math.min(PROM_MAX, Math.max(0, Math.floor(pn / 2) + 1)));
  const caret = pn >= 0 && Math.floor(pn / 8) % 2 === 0 ? '▌' : '';

  // 虚线空槽 clipPath draw-on（18 帧）
  const slotP = clamp01((N - T_SLOT) / 18);

  return (
    <div style={{position: 'absolute', inset: 0, opacity: exOp}}>
      {/* 承接：SC02 线+两股流量缩微（下方 1/3，y 500–560），1.3px/帧持续右行 */}
      <div style={{position: 'absolute', inset: 0, opacity: wire.op, transform: `translateY(${wire.dy.toFixed(2)}px)`}}>
        <MiniWire N={N} />
      </div>

      {/* IP 徽章（主角）：柔光 → 圆环+暗底 → IP 字（glitch） */}
      <div style={{position: 'absolute', inset: 0, opacity: bOp, transform: `scale(${bScale.toFixed(4)})`, transformOrigin: `${CX}px ${CY}px`}}>
        <GlowBlob cx={CX} cy={CY} r={112} N={N} k={glowK} />
        <svg width={240} height={240} viewBox="0 0 240 240" style={{...abs(CX - 120, CY - 120), filter: BLOOM}}>
          <circle cx={120} cy={120} r={RING_R} fill="rgba(102,48,248,0.10)" opacity={softOp(N - (T_RING + 6), 10)} />
          <circle cx={120} cy={120} r={RING_R} fill="none" stroke={WHITE} strokeWidth={3} strokeLinecap="round" strokeDasharray={RING_C} strokeDashoffset={RING_C * (1 - ringP)} transform="rotate(-90 120 120)" />
        </svg>
        <GlitchIn N={N} f0={T_BADGE} rgbSplit={4} seed={5}>
          <CText cx={CX} cy={CY} size={84} family={FONT_ORB} weight={700} color={WHITE} letterSpacing={6} shadow={TEXT_GLOW}>IP</CText>
        </GlitchIn>
      </div>

      {/* the Internet Protocol（灰 26px） */}
      <SoftIn N={N} f0={T_SUB}>
        <CText cx={640} cy={392} size={26} weight={600} color={GREY} letterSpacing={0.5}>the Internet Protocol</CText>
      </SoftIn>

      {/* 六枚小问号（两侧各三，每 36 帧左右交替明暗，“它到底承诺什么”的悬念） */}
      {QMARKS.map((q, i) => (
        <SoftIn key={`q${i}`} N={N} f0={T_Q + i * 2}>
          <CText cx={q.x} cy={q.y} size={34} weight={700} color={GREY} opacity={q.side === 'l' ? lB : rB}>?</CText>
        </SoftIn>
      ))}

      {/* promises: 打字机 3 字停住（pro▌）—— 灰字 + 闪烁光标 */}
      {pn >= 0 ? (
        <div style={{position: 'absolute', inset: 0, opacity: softOp(pn, 6)}}>
          <MonoText x={504} y={430} size={28} color={GREY}>{typed}{caret}</MonoText>
        </div>
      ) : null}

      {/* 待填的虚线空槽（clipPath 自左 draw-on，黑底灰虚描边；悬念留到 SC06） */}
      {slotP > 0 ? (
        <svg width={176} height={46} viewBox="0 0 176 46" style={{...abs(601, 424)}}>
          <defs>
            <clipPath id="sc05-slot"><rect x={0} y={0} width={Math.max(0.1, 176 * slotP)} height={46} /></clipPath>
          </defs>
          <g clipPath="url(#sc05-slot)">
            <rect x={1.5} y={1.5} width={173} height={43} rx={9} fill="#000" stroke={GREY_MID} strokeWidth={2.5} strokeDasharray="7 7" />
          </g>
        </svg>
      ) : null}
    </div>
  );
};
