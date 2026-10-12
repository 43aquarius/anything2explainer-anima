import React from 'react';
import {useCurrentFrame} from 'remotion';
import {clamp01, GlitchIn, emphasisPulse, FONT_WIDE} from '../../common';
import {CameraRig, LightSweep} from '../../fx';
import {AirPulse, CText, EXAMPLE, GREY, WHITE, PURPLE_LIGHT, abs} from '../../ui';

/**
 * SC14 金句：一片天空（2827–2898）。S26–S27（¶段末片末；endingFade=2 → 压黑 2898–2997）。
 * ⚠ 台词极短（S26 20f / S27 32f）：弃双段结构——残波底纹 → 第一行 GlitchIn（2837）
 * → 扫光三轮（2839/2849/2859）→ 第二行 SoftIn（2861 = S27.c1−4）+ 小路由器横移 + 小灰字（2865）。
 * 终镜不用 exitOp（endingFade 压黑接管）。扫光白名单①（全片唯一）。
 */
const F0 = 2827;
const TO = 2898;

// 残波底纹：满屋弧的静态余韵（SC01 呼应）
const WAVES: Array<[number, number]> = [
  [180, 200], [430, 150], [700, 190], [980, 160], [1150, 230],
  [280, 480], [640, 520], [1000, 470],
];

export const SC14: React.FC = () => {
  const N = useCurrentFrame() + F0;

  // 残波：入帧即淡、随金句浮现而让位
  const waveOp = 0.3 * clamp01((N - 2827) / 10) * (1 - clamp01((N - 2857) / 12));
  const L1 = N - 2837;
  const L2 = N - 2861; // S27.c1−4（32 帧短句：第二行提前到拍前落位）
  const fly2 = Math.max(0, N - 2861);

  return (
    <CameraRig N={N} keys={[{f: F0, x: 640, y: 360, s: 1}]}>
      <div style={abs(0, 0, 1280, 720)}>
        {/* 残波底纹 */}
        {waveOp > 0.005 ? (
          <div style={{...abs(0, 0, 1280, 720), opacity: waveOp}}>
            {WAVES.map(([x, y], i) => (
              <AirPulse key={i} cx={x} cy={y} N={0} r={16} speed={14} arcs={2} maxR={72} opacity={0.9} up={(i % 2) === 0} />
            ))}
          </div>
        ) : null}

        {/* 金句（扫光①：三轮紧凑版） */}
        <LightSweep N={N} rounds={[2839, 2849, 2859]} alphas={[0.5, 0.45, 0.45]} dy={-40} />
        {L1 >= 0 ? (
          <GlitchIn N={N} f0={2837} rgbSplit={8} slices={16}>
            <div style={{...abs(0, 0, 1280, 720)}}>
              <CText cx={640} cy={300} size={72} weight={900} color={WHITE} letterSpacing={0.5}
                style={{WebkitTextStroke: '2.5px rgba(161,117,241,0.95)', paintOrder: 'stroke fill', transform: `scale(${emphasisPulse(L1, {peak: 1.11})})`}}>
                {EXAMPLE.finale1}</CText>
            </div>
          </GlitchIn>
        ) : null}
        {L2 >= 0 ? (
          <SoftIn2 N={N} f0={2861} len={3}>
            <div style={{...abs(0, 0, 1280, 720)}}>
              <CText cx={640} cy={420} size={64} weight={400} family={FONT_WIDE} color={WHITE} letterSpacing={1}
                style={{WebkitTextStroke: `4px ${PURPLE_LIGHT}`, paintOrder: 'stroke fill', textShadow: '0 0 22px rgba(161,117,241,.55), 0 0 5px rgba(161,117,241,.5)'}}>
                {EXAMPLE.finale2}</CText>
            </div>
          </SoftIn2>
        ) : null}
        {/* 小路由器横移（两行之间，18px/帧） */}
        {N >= 2861 ? (
          <div style={{...abs(0, 0, 1280, 720)}}>
            <AirPulse cx={140 + 18 * fly2} cy={360} N={N} r={8} speed={20} arcs={2} maxR={44} opacity={0.9} up />
          </div>
        ) : null}
        {N >= 2865 ? (
          <SoftIn2 N={N} f0={2865} len={3}>
            <CText cx={640} cy={540} size={24} weight={400} color={GREY}>{EXAMPLE.credit}</CText>
          </SoftIn2>
        ) : null}
      </div>
    </CameraRig>
  );
};

/** SoftIn 的本地薄封装 */
const SoftIn2: React.FC<{N: number; f0: number; len?: number; children: React.ReactNode}> = ({N, f0, len = 8, children}) => {
  const n = N - f0;
  if (n < 0) return null;
  const t = clamp01((n + 1) / (len + 1));
  const e = 1 - Math.pow(1 - t, 2.5);
  return <div style={{position: 'absolute', inset: 0, opacity: e, transform: `translateY(${((1 - e) * 8).toFixed(2)}px)`}}>{children}</div>;
};
