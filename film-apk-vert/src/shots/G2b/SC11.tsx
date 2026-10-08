import React from 'react';
import {useCurrentFrame} from 'remotion';
import {clamp01, emphasisPulse, FONT_WIDE} from '../../common';
import {CText, ZipperLine, WHITE, PURPLE_LIGHT, exitOp, glowOffK, softOp} from '../../ui';
import {GlowBlob} from '../../fx';

/**
 * SC11 从未解压 · N 1646–1718（S11 1654–1716 单块：「The zip itself? Never unzipped.」段内不判）
 * 清场（SC10 已归零）→ 1652 大字 `never` / `unzipped`（Audiowide 102px 白+紫描边，两行——
 * 单行 104px 估宽 ≈570px 超竖版安全宽 560，改两行 102px，见 BUILD_NOTES 偏离）SoftIn 8f
 * + emphasisPulse（1662 起）+ 紫描边光晕 30f 周期呼吸（**不 glitch**——分镜表明示留给段末）；
 * 1660 大字下一条小拉链 ZipperLine（openP 0.1±0.05 呼吸 = 持续动作）。
 * 末 8 帧归零（1710–1718，紫光先灭 6f）。停留：段内不判（末元素 1660 落位 → 离场 1710，50f）。
 * 主角：大字 102px×2 行；光：大字紫描边光 + 落位光池 GlowBlob。
 * 事实：「never unzipped」= S11 原文（research §7：包从不解压）。零 glitch；无扫光；无运镜。
 */
export const F0 = 1646;
const TO = 1718, EXIT_LEN = 8;
const B_BIG = 1652, B_PULSE = 1662, B_ZIP = 1660;

export const SC11: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const op = exitOp(N, TO, EXIT_LEN);
  if (op <= 0) return null;
  const gk = glowOffK(N, TO, 6, EXIT_LEN); // 紫光先灭

  // 大字落位光池（淡紫，随 GlowBlob 呼吸；大字落地后收敛让位）
  const blobK = clamp01((N - (B_BIG - 2)) / 10) * (1 - 0.4 * clamp01((N - B_BIG) / 8)) * gk;
  // 大字脉冲 + 紫晕呼吸
  const pulse = emphasisPulse(N - B_PULSE, {peak: 1.1, up: 11, hold: 4, down: 13});
  const glow = 18 + 9 * Math.sin((2 * Math.PI * N) / 30);
  // 拉链开齿呼吸 ±0.05（持续动作）
  const zipOpen = 0.1 + 0.05 * Math.sin((2 * Math.PI * N) / 48);

  const strokeGlow = (size: number): React.CSSProperties => ({
    WebkitTextStroke: `${(size / 102) * 2.5}px ${PURPLE_LIGHT}`,
    paintOrder: 'stroke fill',
    textShadow: `0 0 ${glow.toFixed(1)}px rgba(102,48,248,${(0.55 * gk).toFixed(2)})`,
  });

  return (
    <div style={{position: 'absolute', inset: 0, opacity: op}}>
      {/* 大字落位光池（淡紫，大面积光活动来源） */}
      <GlowBlob cx={360} cy={628} r={205} N={N} k={blobK} alpha={0.3} />

      {/* 大字 never / unzipped（SoftIn + emphasisPulse + 紫描边光；零 glitch） */}
      <div style={{position: 'absolute', inset: 0, transformOrigin: '360px 628px', transform: `scale(${pulse.toFixed(4)})`}}>
        <div style={{position: 'absolute', inset: 0, opacity: softOp(N - B_BIG, 8), transform: `translateY(${(10 * (1 - clamp01((N - B_BIG) / 8))).toFixed(1)}px)`}}>
          <CText cx={360} cy={566} size={102} weight={400} family={FONT_WIDE} letterSpacing={2} color={WHITE} dy={0} style={strokeGlow(102)}>
            never
          </CText>
          <CText cx={360} cy={690} size={102} weight={400} family={FONT_WIDE} letterSpacing={2} color={WHITE} dy={0} style={strokeGlow(102)}>
            unzipped
          </CText>
        </div>
      </div>

      {/* 大字下一条小拉链（开齿呼吸 = 持续动作） */}
      <ZipperLine cx={360} y={806} w={340} openP={zipOpen} opacity={softOp(N - B_ZIP, 8)} />
    </div>
  );
};

export default SC11;
