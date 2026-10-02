import React from 'react';
import {useCurrentFrame} from 'remotion';
import {clamp01, GlitchIn, emphasisPulse, FONT_HEAVY} from '../../common';
import {CText, GREY, PURPLE, WHITE, slideUp, softOp, exitOp, glowOffK} from '../../ui';
import {HaloRing} from '../../fx';
import {PcapFileIcon} from './shared';

/**
 * SC22 证据，不是证词 · N 4980–5144（S29 4988–5142 ¶ 段末）——**高光时刻·论点型**（变体：清场 + 大字 GlitchIn，不用扫光）
 * 4988 `EVIDENCE,` Noto 900 88px 白 + 紫描边 + 紫柔光，GlitchIn rgbSplit 6（本镜唯一 glitch）；
 *   `NOT TESTIMONY.` 自下滑入 Δ80/22（SoftIn 淡入）；两行之间白短线 300 宽 scaleX 0→1（12 帧）；
 * 5072 pcap 文件图标（120px，PcapFileIcon 同参数供 G5 章界承接复用）缩放入场 + 脚下 HaloRing draw-on 20 帧（波纹 2 帧一相位持续）；
 * 5113 `It just remembers.` 灰 26 SoftIn + 图标微脉冲一次；末 10 帧整组归零（进章节卡）。
 * 停留：⚠ S29 末块 30 帧（timeline ⚠）：灰字前挂至 5107（−6 容差）入场，落位 5115 → 离场 5136，稳定期 ~21 帧
 *   （分镜表自称 45 帧为笔误；HaloRing 波纹持续动作继续跑）。建议主会话给 S29 加 `## gap 20`。
 */
const F0 = 4980, TO = 5144;
const T1 = 4988; // EVIDENCE, GlitchIn（S29 首块）
const T2 = 4998; // NOT TESTIMONY. slideUp
const T_LINE = 5006; // 白线
const T_ICON = 5072; // 文件图标 + HaloRing（"It never argues"）
const T_TEXT = 5107; // It just remembers.（前挂 −6）
const EXIT_LEN = 8;

const LINE1 = {cy: 228, text: 'EVIDENCE,'};
const LINE2 = {cy: 348, text: 'NOT TESTIMONY.'};
const RULE = {cx: 640, cy: 292, w: 300};
const ICON = {cx: 640, cy: 462};
const HALO = {cx: 640, cy: 512, rxo: 96, ryo: 24, rxi: 70, ryi: 15};

export const SC22: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const op = exitOp(N, TO, EXIT_LEN);
  const n1 = N - T1;
  const n2 = N - T2;
  const nl = N - T_LINE;
  const ni = N - T_ICON;
  const nt = N - T_TEXT;
  const pulse = emphasisPulse(N - T_ICON, {peak: 1.06, up: 8, hold: 4, down: 10});
  // HaloRing：draw-on 20 帧 + 波纹 2 帧一相位（持续动作），离场前 6 帧先灭光
  const ringP = clamp01(ni / 20);
  const ringFill = glowOffK(N, TO, 6, EXIT_LEN) * clamp01((N - (T_ICON + 8)) / 12);
  const phase = Math.floor(Math.max(0, ni) / 2) * 5;

  return (
    <div style={{position: 'absolute', inset: 0, opacity: op}}>
      {/* 第一行：GlitchIn rgbSplit 6 */}
      {n1 >= 0 ? (
        <GlitchIn N={N} f0={T1} rgbSplit={6} seed={22}>
          <CText cx={640} cy={LINE1.cy} size={88} weight={900} family={FONT_HEAVY} color={WHITE} letterSpacing={2}
            style={{WebkitTextStroke: `2.5px ${PURPLE}`, paintOrder: 'stroke fill'}} shadow="0 0 24px rgba(102,48,248,.65)">
            {LINE1.text}
          </CText>
        </GlitchIn>
      ) : null}
      {/* 第二行：自下滑入 Δ80/22 */}
      {n2 >= 0 ? (
        <div style={{position: 'absolute', inset: 0, opacity: softOp(n2, 8), transform: `translateY(${slideUp(n2, 80).toFixed(2)}px)`}}>
          <CText cx={640} cy={LINE2.cy} size={88} weight={900} family={FONT_HEAVY} color={WHITE} letterSpacing={2}
            style={{WebkitTextStroke: `2.5px ${PURPLE}`, paintOrder: 'stroke fill'}} shadow="0 0 24px rgba(102,48,248,.65)">
            {LINE2.text}
          </CText>
        </div>
      ) : null}
      {/* 中间白短线 scaleX 0→1（12 帧） */}
      {nl >= 0 ? (
        <div style={{position: 'absolute', left: RULE.cx - RULE.w / 2, top: RULE.cy, width: RULE.w * clamp01(nl / 12), height: 3, background: WHITE, boxShadow: '0 0 8px 2px rgba(255,255,255,.5)', transform: 'translateY(-50%)'}} />
      ) : null}

      {/* pcap 文件图标（缩放入场 + 微脉冲） + 脚下 HaloRing */}
      {ni >= 0 ? (
        <>
          <HaloRing cx={HALO.cx} cy={HALO.cy} rxo={HALO.rxo} ryo={HALO.ryo} rxi={HALO.rxi} ryi={HALO.ryi} p={ringP} fillOp={0.8 * ringFill} phase={phase} />
          <div style={{position: 'absolute', inset: 0, transformOrigin: `${ICON.cx}px ${ICON.cy}px`, transform: pulse === 1 ? undefined : `scale(${pulse.toFixed(4)})`, opacity: softOp(ni, 8)}}>
            <PcapFileIcon cx={ICON.cx} cy={ICON.cy} w={96} h={120} glow />
          </div>
        </>
      ) : null}

      {/* It just remembers.（灰，最后） */}
      {nt >= 0 ? (
        <CText cx={640} cy={584} size={26} weight={600} color={GREY} opacity={softOp(nt, 8)}>It just remembers.</CText>
      ) : null}
    </div>
  );
};
