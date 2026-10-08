import React from 'react';
import {useCurrentFrame} from 'remotion';
import {GlitchIn, clamp01, easeOutCubic, emphasisPulse, kf, powOutRemain, FONT_ORB} from '../../common';
import {CText, LineArrow, PURPLE, WHITE, exitOp, glowOffK, softOp} from '../../ui';
import {GlowBlob} from '../../fx';
import {MiniHex, SplitRow} from './g3ui';

/**
 * SC14 两字节 P·K · N 1998–2089（S14 2006–2052 ¶：2006「Two bytes in: P, K.」）。
 * 承接：SC13 末帧未归零的 SplitChip 行以 scale(1.1)（复现 SC13 末帧相机，锚点 360,648）同参数再现——交界帧像素一致，
 *   1998–2008 先灭光（2002–2007）再淡出（「SplitChip 淡出」）。
 * 2006（节拍）：缩微 HexDump（VertHex 0.45×，首两格 50 4B 保持紫亮、其余 dim 0.3）淡入 + 引线 draw-on（10 帧）→
 *   `P, K`（Orbitron 150px 白+紫描边）GlitchIn（rgbSplit 6，本镜唯一 glitch；落位 2006+21=2027）+
 *   emphasisPulse（2018）+ 紫光晕爆发（2018，r 150→300→190）后 30 帧收敛呼吸（持续）；
 * 2010 起其余区域变暗 30%（压在字节窗/承接层之上、大字与紫晕之下的黑罩 α0.3）。
 * 末 8 帧归零（2082–2089，紫晕先灭 6 帧）。停留：大字入场 2006 → 离场 2082，76 帧 ✓
 *   （分镜表「离场 2054−8」为 S14.to+2 旧口径——横版 SC15 BUILD_NOTES 已裁定同类情况按镜头区间末 8 帧执行，
 *    否则 2055–2089 空场 35 帧；本片镜头区间到 2089）。
 * 主角：`P, K` 150px；光：大字紫晕（爆发→呼吸）+ 缩微窗首两格紫亮。
 */
const F0 = 1998;
const TO = 2089;
const T_CHIP_EXIT = 2008; // 承接芯片淡出终点（10 帧，自 1998 起与 SC13 末帧无缝衔接）
const T_CHIP_GLOW_OFF = 2002; // base 紫光先灭（5 帧）
const T_BEAT = 2006; // S14 唯一节拍：缩微窗 + 引线 + 大字 glitch 同拍进场
const T_DIM = 2010; // 其余区域变暗 30%（12 帧渐入）
const T_LAND = T_BEAT + 12; // 2018：glitch 满态 → 脉冲 + 紫晕爆发
const T_PULSE = T_LAND;
const TEXT_C = {cx: 360, cy: 720};
const HEX_C = {cx: 360, cy: 472}; // 缩微字节窗中心（0.45× ≈ 194×144）
const LEADER = {x0: 291, y0: 446, x1: 338, y1: 642}; // 首两格中点 → 大字上方（10 帧 draw-on）

export const SC14: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const exOp = exitOp(N, TO, 8);
  const gk = glowOffK(N, TO, 6, 8); // 紫晕先灭

  // —— 承接：SC13 末帧相机（s=1.1 @ 360,648）下的 SplitChip 行，先灭光再淡出 ——
  const chipOp = exitOp(N, T_CHIP_EXIT, 10);
  const chipGlow = 1 - clamp01((N - T_CHIP_GLOW_OFF) / 5);

  // —— 缩微字节窗 + 引线 ——
  const hexOp = softOp(N - T_BEAT, 10) * exOp;
  const leaderP = clamp01((N - T_BEAT) / 10);

  // —— 大字：脉冲 + 紫晕爆发→收敛呼吸（持续） ——
  const pulse = emphasisPulse(N - T_PULSE, {peak: 1.11});
  const burstT = N - T_LAND;
  const blobR = kf(N, [[T_LAND, 150], [T_LAND + 9, 300], [T_LAND + 39, 190]], easeOutCubic) + (burstT > 39 ? 12 * Math.sin((2 * Math.PI * N) / 30) : 0);
  const blobA = kf(N, [[T_LAND, 0.16], [T_LAND + 9, 0.45], [T_LAND + 39, 0.28]]) + (burstT > 39 ? 0.05 * Math.sin((2 * Math.PI * N) / 30) : 0);
  const breathe = 0.7 + 0.3 * Math.sin((2 * Math.PI * N) / 30);
  const blur = 30 + 46 * powOutRemain(Math.max(0, burstT), 39, 1.6) + 6 * Math.sin((2 * Math.PI * N) / 30) * (burstT > 39 ? 1 : 0.3);

  return (
    <div style={{position: 'absolute', inset: 0}}>
      {/* ——— 承接层：SplitChip（SC13 末帧相机 1.1，锚点 360,648 → 与 SC13 末帧像素一致） ——— */}
      <div style={{position: 'absolute', inset: 0, transformOrigin: '360px 648px', transform: 'scale(1.1)'}}>
        <SplitRow N={N} strike2={1} strike3={1} opacity={chipOp} glowK={chipGlow} />
      </div>

      {/* ——— 缩微字节窗（0.45×，首两格 50 4B 紫亮；其余变暗 30%）+ 引线 ——— */}
      <MiniHex cx={HEX_C.cx} cy={HEX_C.cy} scale={0.45} dimK={0.3} opacity={hexOp} />
      <LineArrow x0={LEADER.x0} y0={LEADER.y0} x1={LEADER.x1} y1={LEADER.y1} p={leaderP} rodW={2.5} headL={16} headW={16} opacity={0.85 * exOp} />

      {/* 其余区域变暗 30%（压字节窗/承接层，让位大字；不压紫晕与大字） */}
      <div style={{position: 'absolute', inset: 0, background: '#000', opacity: (0.3 * clamp01((N - T_DIM) / 12) * exOp).toFixed(3)}} />

      {/* 紫晕（爆发 → 30 帧收敛 → 呼吸，持续） */}
      <GlowBlob cx={TEXT_C.cx} cy={TEXT_C.cy} r={Math.max(10, blobR)} N={N} alpha={Math.max(0, blobA * gk)} />

      {/* ——— 大字 P, K（本镜唯一 glitch） ——— */}
      {N >= T_BEAT ? (
        <div style={{position: 'absolute', inset: 0, transformOrigin: `${TEXT_C.cx}px ${TEXT_C.cy}px`, transform: pulse === 1 ? undefined : `scale(${pulse.toFixed(4)})`}}>
          <GlitchIn N={N} f0={T_BEAT} rgbSplit={6} seed={14} style={{opacity: exOp}}>
            <CText
              cx={TEXT_C.cx}
              cy={TEXT_C.cy}
              size={150}
              weight={700}
              family={FONT_ORB}
              color={WHITE}
              letterSpacing={6}
              shadow={`0 0 ${blur.toFixed(1)}px 10px rgba(102,48,248,${(0.45 * gk).toFixed(3)})`}
              style={{WebkitTextStroke: `3.5px ${PURPLE}`, paintOrder: 'stroke fill'}}
            >
              P, K
            </CText>
          </GlitchIn>
        </div>
      ) : null}
    </div>
  );
};
