import React from 'react';
import {useCurrentFrame} from 'remotion';
import {clamp01, easeOutCubic, rnd, FONT_HEAVY} from '../../common';
import {GlowBlob} from '../../fx';
import {CText, GREY, GREY_MID, ORANGE, WHITE, abs, softOp, firstOp, exitOp, glowOffK} from '../../ui';

/**
 * SC02 信封瀑布 · N 210–318（S02 218–316 段内；块 218/284）
 * 版式：全屏竖向信封瀑布——10 枚白描边信封（72×50 基准，rnd 固定种子）自顶部持续下落
 *   （速度 4–5px/帧，x 90–580 分布；首批 3 枚 212 起自顶滑入，其余分段补位到全屏）；
 *   284 中央一枚信封从瀑布流中"定格"：kf 16 帧减速 + 放大 1.4× 居中 (360,600) + 紫光点亮（本镜主角），
 *   带 #1 编号章（stampIn）+ packet = envelope 灰 25px。
 * 节拍：212 瀑布启动（=218−6）；278 起定格（284−6）；294 编号章；296 公式 SoftIn。
 * 下落信封在 y≈1000 起淡出（分镜表"落出画底"在竖版按字幕带 y1002–1056 硬规则截断，见 BUILD_NOTES）。
 * 零 glitch（本镜不在闪烁白名单）。运镜：无（分镜表运镜清单不含 SC02）。中央信封紫光 = GlowBlob（呼吸）+ 信封投影。
 * 离场：末 8 帧归零（311–318，段内镜头按分镜表仍归零）；主角紫光先灭。
 * 停留：段内不判（分镜表；motion_check 若报 hold 见 BUILD_NOTES 说明——瀑布持续动作直到离场）。
 */
const F0 = 210;
const TO = 318;

const T_FLOW = 212, T_HERO = 222, T_FREEZE = 278, T_STAMP = 294, T_EQ = 296;

/** 瀑布信封（rnd 固定种子）：cx / 速度 / 尺度 / 出场时刻与初始 y（后期补位覆盖全屏） */
const FALL = Array.from({length: 10}, (_, i) => ({
  cx: 92 + rnd(i, 3) * 488,
  speed: 4.0 + rnd(i, 5) * 1.0,
  scale: 0.85 + rnd(i, 7) * 0.45,
  t0: i < 3 ? T_FLOW + i * 3 : i === 9 ? 284 : 214 + (i - 3) * 8, // 9 号 = 定格段补位顶部
  y0: i < 3 || i === 9 ? -80 : 120 + (i - 3) * 145,
}));

const fallY = (i: number, N: number) => FALL[i].y0 + FALL[i].speed * Math.max(0, N - FALL[i].t0);

export const SC02: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const exOp = exitOp(N, TO, 8);
  if (exOp <= 0) return null;

  // 中央信封：从瀑布流中定格（减速 + 放大 + 紫光点亮）
  const fr = clamp01((N - T_FREEZE) / 16);
  const heroY = N < T_HERO ? 345 : N < T_FREEZE ? 345 + 4.2 * (N - T_HERO) : 580.4 + 19.6 * easeOutCubic(fr);
  const heroS = 1 + 0.4 * easeOutCubic(fr);
  const heroK = N < T_FREEZE ? 0 : clamp01((N - (T_FREEZE + 8)) / 8) * glowOffK(N, TO, 6, 8);
  // 编号章 stampIn（1.5→1）
  const stS = 1.5 - 0.5 * easeOutCubic(clamp01((N - T_STAMP) / 10));

  return (
    <div style={{position: 'absolute', inset: 0, opacity: exOp}}>
      {/* ---- 瀑布（10 枚循环下落，顶部淡入 / 底部 1000 前淡出避开字幕带）---- */}
      {FALL.map((e, i) => {
        if (N < e.t0) return null;
        const y = fallY(i, N);
        const op = softOp(N - e.t0, 8) * clamp01((1000 - y) / 110);
        if (op <= 0.01) return null;
        return (
          <div key={`f${i}`} style={{...abs(e.cx - (72 * e.scale) / 2, y - (50 * e.scale) / 2, 72 * e.scale, 50 * e.scale), opacity: op}}>
            <svg width={72 * e.scale} height={50 * e.scale} viewBox="0 0 72 50" style={{position: 'absolute', inset: 0, filter: 'drop-shadow(0 0 2px rgba(255,255,255,0.35))'}}>
              <rect x={1.25} y={1.25} width={69.5} height={47.5} fill="#000" stroke={WHITE} strokeWidth={2.5} />
              <path d="M1.25,48.75 L36,21 L70.75,48.75" fill="none" stroke={WHITE} strokeWidth={2.2} strokeLinejoin="round" />
            </svg>
          </div>
        );
      })}

      {/* ---- 中央定格信封（主角，1.4× + 紫光 GLOW_PURPLE_S）---- */}
      {N >= T_HERO ? (
        <>
          <GlowBlob cx={360} cy={heroY + 8} r={92} N={N} k={heroK * 1.35} alpha={0.5} />
          <div style={{...abs(360 - (72 * heroS) / 2, heroY - (50 * heroS) / 2, 72 * heroS, 50 * heroS), opacity: firstOp(N - T_HERO, 5)}}>
            <svg width={72 * heroS} height={50 * heroS} viewBox="0 0 72 50" style={{position: 'absolute', inset: 0, filter: heroK > 0.01 ? `drop-shadow(0 0 24px 8px rgba(102,48,248,${(0.6 * heroK).toFixed(3)}))` : 'drop-shadow(0 0 2px rgba(255,255,255,0.35))'}}>
              <rect x={1.25} y={1.25} width={69.5} height={47.5} fill="#000" stroke={WHITE} strokeWidth={3} />
              <path d="M1.25,48.75 L36,21 L70.75,48.75" fill="none" stroke={WHITE} strokeWidth={2.8} strokeLinejoin="round" />
              <line x1={44} y1={38} x2={66} y2={38} stroke={GREY_MID} strokeWidth={1.8} opacity={0.8} />
              <line x1={44} y1={43} x2={60} y2={43} stroke={GREY_MID} strokeWidth={1.8} opacity={0.8} />
            </svg>
          </div>
          {/* #1 编号章（橙描边方章，stampIn） */}
          {N >= T_STAMP ? (
            <div style={{...abs(360 + 32 - 22 * stS, heroY - 35 - 22 * stS, 44 * stS, 44 * stS), opacity: softOp(N - T_STAMP, 6)}}>
              <div style={{position: 'absolute', inset: 0, border: `2.5px solid ${ORANGE}`, borderRadius: 6, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Orbitron','Audiowide',sans-serif", fontSize: 44 * stS * 0.44, color: ORANGE, paddingTop: 2}}>#1</div>
            </div>
          ) : null}
        </>
      ) : null}

      {/* packet = envelope */}
      <div style={{position: 'absolute', inset: 0, opacity: softOp(N - T_EQ, 8)}}>
        <CText cx={360} cy={708} size={25} weight={600} family={FONT_HEAVY} color={GREY} letterSpacing={1}>packet = envelope</CText>
      </div>
    </div>
  );
};
