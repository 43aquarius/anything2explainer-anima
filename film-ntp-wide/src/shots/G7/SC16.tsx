import React from 'react';
import {useCurrentFrame} from 'remotion';
import {clamp01, GlitchIn, emphasisPulse, FONT_WIDE} from '../../common';
import {CameraRig, LightSweep} from '../../fx';
import {ClockFace, CText, EXAMPLE, GREY, WHITE, PURPLE_LIGHT, abs} from '../../ui';

/**
 * SC16 金句：议定（3361–3425）。S31–S32（¶段末片末；endingFade=2 → 压黑 3425–3524）。
 * ⚠ 台词极短（S31 25f / S32 20f），弃"上半场景→清场→金句"双段结构，改为：
 * 残环底纹（SC15 钟环余韵，静态淡出）→ 第一行 GlitchIn（3371）→ 扫光三轮（3373/3383/3393）
 * → 第二行 SoftIn（3400 = S32.c1−4）+ 小钟横移 + 小灰字（3404）。
 * 终镜不用 exitOp（endingFade 压黑接管——TLS/CDN/BGP 成熟模式）。扫光白名单①（全片唯一）。
 */
const F0 = 3361;
const TO = 3425;

const RING = {cx: 640, cy: 360};

// 残环：SC15 钟环缩微余韵（静态淡出，不抢金句）
const RING_CLOCKS: Array<[number, number]> = [
  [RING.cx - 300, RING.cy - 130], [RING.cx, RING.cy - 210], [RING.cx + 300, RING.cy - 130],
  [RING.cx - 360, RING.cy + 40], [RING.cx + 360, RING.cy + 40],
  [RING.cx - 260, RING.cy + 190], [RING.cx + 260, RING.cy + 190], [RING.cx, RING.cy + 235],
];

export const SC16: React.FC = () => {
  const N = useCurrentFrame() + F0;

  // 残环底纹：入帧即淡、全程渐隐到 3404 归零
  const ringOp = 0.3 * clamp01((N - 3361) / 10) * (1 - clamp01((N - 3396) / 10));
  const L1 = N - 3371;
  const L2 = N - 3400; // S32.c1−4（20 帧短句：第二行提前到拍前落位）
  const fly2 = Math.max(0, N - 3400);

  return (
    <CameraRig N={N} keys={[{f: F0, x: 640, y: 360, s: 1}]}>
      <div style={abs(0, 0, 1280, 720)}>
        {/* 残环底纹（静态，随金句浮现而让位） */}
        {ringOp > 0.005 ? (
          <div style={{...abs(0, 0, 1280, 720), opacity: ringOp}}>
            {RING_CLOCKS.map(([x, y], i) => (
              <ClockFace key={i} cx={x} cy={y} r={34} N={0} ghost opacity={0.9} />
            ))}
          </div>
        ) : null}

        {/* 金句（扫光①：三轮紧凑版） */}
        <LightSweep N={N} rounds={[3373, 3383, 3393]} alphas={[0.5, 0.45, 0.45]} dy={-40} />
        {L1 >= 0 ? (
          <GlitchIn N={N} f0={3371} rgbSplit={8} slices={16}>
            <div style={{...abs(0, 0, 1280, 720)}}>
              <CText cx={640} cy={300} size={64} weight={900} color={WHITE} letterSpacing={0.5}
                style={{WebkitTextStroke: '2.5px rgba(161,117,241,0.95)', paintOrder: 'stroke fill', transform: `scale(${emphasisPulse(L1, {peak: 1.11})})`}}>
                {EXAMPLE.finale1}</CText>
            </div>
          </GlitchIn>
        ) : null}
        {L2 >= 0 ? (
          <SoftIn2 N={N} f0={3400} len={3}>
            <div style={{...abs(0, 0, 1280, 720)}}>
              <CText cx={640} cy={420} size={84} weight={400} family={FONT_WIDE} color={WHITE} letterSpacing={1}
                style={{WebkitTextStroke: `4px ${PURPLE_LIGHT}`, paintOrder: 'stroke fill', textShadow: '0 0 22px rgba(161,117,241,.55), 0 0 5px rgba(161,117,241,.5)'}}>
                {EXAMPLE.finale2}</CText>
            </div>
          </SoftIn2>
        ) : null}
        {/* 小钟横移（两行之间，18px/帧） */}
        {N >= 3400 ? (
          <div style={{...abs(0, 0, 1280, 720)}}>
            <ClockFace cx={150 + 18 * fly2} cy={360} r={30} N={N} glow opacity={0.9} />
          </div>
        ) : null}
        {N >= 3404 ? (
          <SoftIn2 N={N} f0={3404} len={3}>
            <CText cx={640} cy={540} size={24} weight={400} color={GREY}>{EXAMPLE.credit}</CText>
          </SoftIn2>
        ) : null}
      </div>
    </CameraRig>
  );
};

/** SoftIn 的本地薄封装（避免与 ui 层重复 import 冲突） */
const SoftIn2: React.FC<{N: number; f0: number; len?: number; children: React.ReactNode}> = ({N, f0, len = 8, children}) => {
  const n = N - f0;
  if (n < 0) return null;
  const t = clamp01((n + 1) / (len + 1));
  const e = 1 - Math.pow(1 - t, 2.5);
  return <div style={{position: 'absolute', inset: 0, opacity: e, transform: `translateY(${((1 - e) * 8).toFixed(2)}px)`}}>{children}</div>;
};
