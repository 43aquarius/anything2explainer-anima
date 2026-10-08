import React from 'react';
import {useCurrentFrame} from 'remotion';
import {GlitchIn, powOutRemain, easeOutCubic, clamp01} from '../../common';
import {CText, Box, Svg, PURPLE_LIGHT, WHITE, GREY, exitOp, glowOffK, softOp, fadeIn} from '../../ui';
import {CameraRig} from '../../fx';
import {AccordionCard, DirectoryCard} from './g4ui';

/**
 * SC16 其实是索引（2326–2439，S16）
 * 节拍：2334 手风琴卡自左滑入 + 褶皱展开（压缩动画反演）→ 2384 灰删除线 wipe（12f）→ 卡变暗 40%
 *      → 2409 `an index` 大字 GlitchIn（本镜唯一 glitch，rgbSplit 5）+ 目录卡 slideUp + 页签错峰弹出。
 * 运镜：整镜 1.0→1.05 慢推（分镜表）。停留：段内不判。
 */
export const F0 = 2326;
const B_IN = 2334, B_EXPAND = 2340, B_STRIKE = 2384, B_DIM = 2396, B_INDEX = 2409, B_TOC = 2411, TO = 2439, EXIT_LEN = 8;

const ACC = {cx: 260, cy: 330, w: 240, h: 170};
const TOC = {x: 665, y: 335, w: 290, h: 180};

export const SC16: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const op = exitOp(N, TO, EXIT_LEN);
  if (op <= 0) return null;

  // 手风琴卡：自左滑入（Δ260，18f）+ 褶皱展开（w 90→240，10f）
  const nIn = N - B_IN;
  const dx = -260 * powOutRemain(nIn, 18, 2.5);
  const cardOp = softOp(nIn, 8);
  const w = 90 + (ACC.w - 90) * easeOutCubic(clamp01((N - B_EXPAND) / 10));
  // 删除线（灰，非红——"不是重点"不是"错误"）+ 卡整体变暗 40%
  const pStrike = easeOutCubic(clamp01((N - B_STRIKE) / 12));
  const dimK = clamp01((N - B_DIM) / 10);
  // 目录卡 slideUp + 页签错峰弹出
  const tocDy = 65 * powOutRemain(N - B_TOC, 14, 2.5);
  const tocOp = softOp(N - B_TOC, 8);
  const tabP = clamp01((N - (B_TOC + 8)) / 12);
  // 大字紫光晕呼吸（离场先灭光）
  const gk = glowOffK(N, TO, 6, EXIT_LEN);
  const glow = 10 + 7 * Math.sin((N / 30) * Math.PI * 2);

  return (
    <CameraRig N={N} keys={[{f: 2326, x: 640, y: 360, s: 1}, {f: 2439, x: 640, y: 360, s: 1.05}]}>
      <div style={{position: 'absolute', inset: 0, opacity: op}}>
        {/* 左半：压缩图标（手风琴褶皱卡） */}
        {nIn >= 0 ? (
          <div style={{position: 'absolute', inset: 0, opacity: cardOp * (1 - 0.4 * dimK), transform: `translateX(${dx.toFixed(2)}px)`}}>
            <AccordionCard cx={ACC.cx} cy={ACC.cy} w={w} h={ACC.h} />
            <CText cx={ACC.cx} cy={ACC.cy + ACC.h / 2 + 32} size={24} weight={600} color={GREY} opacity={fadeIn(N - (B_EXPAND + 10), 8)}>compression</CText>
          </div>
        ) : null}
        {/* 灰删除线 */}
        <Svg>
          {pStrike > 0 ? <line x1={128} y1={296} x2={128 + 268 * pStrike} y2={296 + 68 * pStrike} stroke={GREY} strokeWidth={5} strokeLinecap="round" opacity={0.95} /> : null}
        </Svg>

        {/* 右半：an index 大字（本镜唯一 glitch） */}
        <GlitchIn N={N} f0={B_INDEX} rgbSplit={5} seed={16}>
          <CText
            cx={810}
            cy={262}
            size={72}
            weight={900}
            color={WHITE}
            letterSpacing={1}
            style={{
              WebkitTextStroke: `2.5px rgba(161,117,241,${(0.95 * gk).toFixed(3)})`,
              paintOrder: 'stroke fill',
              textShadow: `0 0 ${(glow * gk).toFixed(1)}px rgba(102,48,248,.55)`,
            }}
          >
            an index
          </CText>
        </GlitchIn>

        {/* 右半下方：目录卡简笔（卡片 + 三行目录线 + 页签） */}
        {N >= B_TOC ? (
          <div style={{position: 'absolute', inset: 0, opacity: tocOp, transform: `translateY(${tocDy.toFixed(2)}px)`}}>
            <Box x={TOC.x} y={TOC.y} w={TOC.w} h={TOC.h} r={10} stroke={WHITE} sw={2.5} />
            <DirectoryCard x={TOC.x + 14} y={TOC.y + 22} w={TOC.w - 28} h={TOC.h - 44} showLabel={false} tabP={tabP} />
          </div>
        ) : null}
      </div>
    </CameraRig>
  );
};

export default SC16;
