import React from 'react';
import {useCurrentFrame} from 'remotion';
import {BEZ_SCALE_IN, GlitchIn, clamp01, emphasisPulse, FONT_ORB} from '../../common';
import {abs, CText, EXAMPLE, GREY, ORANGE, WHITE, exitOp, fadeIn, firstOp, mixHex, SoftIn} from '../../ui';
import {countTo} from '../../fx';
import {CamRigV, OrangeGlow, tri} from './g3ui';

/**
 * SC09 七秒 · N 1397–1588（S10 1405–1566 ¶）—— **全片最高潮 · 大数字型高光时刻（竖版）**
 * 上半：等式 `1 + 2 + 4 =` Orbitron 64px 白（三数字 0.42→1 各 21 帧缩放落位、6 帧错峰，1399 起 = S10 块1 −6）。
 * 中央：`7 s` 130px 橙 20 帧计数 0→7（1435–1455）→ GlitchIn（rgbSplit 6，本镜唯一 glitch）+ emphasisPulse 1.11 +
 *   橙光晕爆发（8 帧）+ 扩散环 + 30 帧呼吸（持续到离场；全片唯一大面积橙光）。
 * 下方：`server log: 60 ms` 灰 30px（1459 = S10 块2）+ 灰删除线 wipe（1490 = S10 块3，12 帧落位 1502）。
 * 运镜：1467–1499 推近 1→1.2 推向 7 s（glitch 结束后起、删除线落位前收，运镜不与 glitch 重叠）。
 * 停留：¶ 段末，删除线落位 1502 → 离场 1580，78 帧 ✓。末 8 帧归零。
 * 主角：`7 s` 130px + 橙光晕。数字依据：RFC 6298（RTO 翻倍 1+2+4=7 s）+ EXAMPLE.requestMs。
 */
const F0 = 1397, TO = 1588;
const T_EQ = 1399, EQ_GAP = 6; // 等式首数字（S10 块1 1405 −6）
const T_7 = 1435, T_GLOW = 1455, T_PULSE = 1467;
const T_LOG = 1459, T_STRIKE = 1490;
const CAM_KEYS = [
  {f: 1467, x: 360, y: 640, s: 1},
  {f: 1499, x: 360, y: 670, s: 1.2},
];
const EQ = {y: 430, nums: [202, 307, 412], ops: [254, 359], eq: 514};
const BIG = {cx: 360, cy: 670, size: 130};
const LOG = {cx: 360, cy: 880, w: 270};

/** `7 s` 大数字（Orbitron 130 橙 + 橙硬投影 + 橙光，pulse 时增强光） */
const BigSeven: React.FC<{value: React.ReactNode; pulse?: number}> = ({value, pulse = 1}) => (
  <CText
    cx={BIG.cx}
    cy={BIG.cy}
    size={BIG.size}
    weight={800}
    family={FONT_ORB}
    color={ORANGE}
    letterSpacing={4}
    shadow={`6px 6px 0 rgba(70,18,4,.9), 0 0 ${Math.round(46 * pulse)}px rgba(240,95,65,.85), 0 0 ${Math.round(110 * pulse)}px rgba(240,95,65,.4)`}
    style={{fontVariantNumeric: 'tabular-nums'}}
  >
    {value} s
  </CText>
);

export const SC09: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const op = exitOp(N, TO, 8);
  // 橙光晕：爆发（8 帧）+ 30 帧呼吸（持续）
  const glowK = clamp01((N - T_GLOW) / 8);
  const ringK = clamp01((N - T_GLOW) / 24);
  const pulse = emphasisPulse(N - T_PULSE, {peak: 1.11});
  const strikeP = clamp01((N - T_STRIKE) / 12);
  return (
    <div style={{position: 'absolute', inset: 0, opacity: op}}>
      <CamRigV N={N} keys={CAM_KEYS}>
        {/* ===== 上半：等式 1 + 2 + 4 =（三数字缩放落位 0.42→1 / 21 帧 / 6 帧错峰） ===== */}
        {EQ.nums.map((cx, i) => {
          const cn = N - (T_EQ + i * EQ_GAP);
          if (cn < 0) return null;
          const sc = 0.42 + 0.58 * BEZ_SCALE_IN(clamp01(cn / 21));
          return (
            <div key={`n${i}`} style={{position: 'absolute', inset: 0, opacity: fadeIn(cn, 5), transform: `scale(${sc.toFixed(4)})`, transformOrigin: `${cx}px ${EQ.y}px`}}>
              <CText cx={cx} cy={EQ.y} size={64} weight={700} family={FONT_ORB} color={WHITE} letterSpacing={2} shadow="0 0 12px rgba(255,255,255,.45)" style={{fontVariantNumeric: 'tabular-nums'}}>
                {[1, 2, 4][i]}
              </CText>
            </div>
          );
        })}
        {[0, 1].map((i) => (
          <SoftIn key={`p${i}`} N={N} f0={T_EQ + i * EQ_GAP + 2}>
            <CText cx={EQ.ops[i]} cy={EQ.y - 4} size={52} weight={600} color={GREY}>+</CText>
          </SoftIn>
        ))}
        <SoftIn N={N} f0={T_EQ + 3 * EQ_GAP + 3}>
          <CText cx={EQ.eq} cy={EQ.y - 4} size={52} weight={600} color={GREY}>=</CText>
        </SoftIn>
        {/* ===== 中央：橙光晕（爆发 + 呼吸；稳定尾段呼吸幅度收敛，避免大面积光的逐帧差盖过落位停留） ===== */}
        <OrangeGlow cx={BIG.cx} cy={BIG.cy} r={300} k={glowK} N={N} alpha={0.5} amp={0.15 - 0.1 * clamp01((N - 1520) / 20)} />
        {ringK > 0 && ringK < 1 ? (
          <svg width={460} height={460} viewBox="-230 -230 460 460" style={{position: 'absolute', left: BIG.cx - 230, top: BIG.cy - 230, opacity: (1 - ringK) * 0.85}}>
            <ellipse cx={0} cy={0} rx={150 * (0.45 + 0.9 * ringK)} ry={110 * (0.45 + 0.9 * ringK)} fill="none" stroke={ORANGE} strokeWidth={3} />
          </svg>
        ) : null}
        {/* ===== 7 s：阶段一 20 帧计数 0→7；阶段二 GlitchIn（rgbSplit 6，本镜唯一 glitch）+ 脉冲落定 ===== */}
        {N >= T_7 && N < T_GLOW ? (
          <div style={{position: 'absolute', inset: 0, opacity: firstOp(N - T_7, 5)}}>
            <BigSeven value={countTo(N - T_7, 0, 7, 20)} pulse={1} />
          </div>
        ) : null}
        {N >= T_GLOW ? (
          <GlitchIn N={N} f0={T_GLOW} rgbSplit={6} seed={33}>
            <div style={{position: 'absolute', inset: 0, transform: pulse === 1 ? undefined : `scale(${pulse.toFixed(4)})`, transformOrigin: `${BIG.cx}px ${BIG.cy}px`}}>
              <BigSeven value={7} pulse={pulse} />
            </div>
          </GlitchIn>
        ) : null}
        {/* ===== 下方：server log: 60 ms（灰 30px 对照 + 灰删除线感） ===== */}
        <SoftIn N={N} f0={T_LOG}>
          <CText cx={LOG.cx} cy={LOG.cy} size={30} weight={600} color={GREY} letterSpacing={1}>
            {`server log: ${EXAMPLE.requestMs}`}
          </CText>
        </SoftIn>
        {strikeP > 0 ? (
          <div style={{...abs(LOG.cx - LOG.w / 2, LOG.cy - 1.5, LOG.w * strikeP, 2.5), background: mixHex('#000000', GREY, 0.9)}} />
        ) : null}
      </CamRigV>
    </div>
  );
};
