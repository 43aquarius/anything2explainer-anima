import React from 'react';
import {useCurrentFrame} from 'remotion';
import {FONT_HEAVY, W, H} from './lib';
import {kf} from './easing';
import {fitSize} from './textfit';
import {TOTAL_FRAMES, CHAPTER_STARTS, SENTENCES} from './timeline';

/**
 * 底部章节进度条（竖版：半透明条体 y1240–1280、填充右缘 x=720·N/TOTAL）。单章片无分隔线与章名。
 * 交付修订：BAR_H 原为 `720 - BAR_TOP`（模板横版 720 高残留）→ 负值，条体/填充完全不渲染（进度条消失）；
 * 改用 lib 的 H=1280 计算，并把硬编码 720 全部换为 W，与 Root 合成尺寸同源。
 */
export const PROGRESS_ALPHA = 0.52;
export const FILL_RGBA = 'rgba(190,170,250,0.52)';
export const TRACK_RGBA = 'rgba(243,243,243,0.32)';
export const BAR_TOP = 1240;
export const BAR_H = H - BAR_TOP;
// 当前章高亮切在**章节卡起始帧**（上一章末句 to+3），不是本章首句帧——否则章节卡宣告新章的 45 帧里进度条还亮着上一章（QC v1 C2 #1；lessons「覆盖层」）
const cardStart = (c: {n: number; from: number}) => {
  const prev = [...SENTENCES].reverse().find((x) => x.chapter < c.n);
  return prev ? prev.to + 3 : c.from;
};
const NCH = Math.max(1, CHAPTER_STARTS.length);
// 实际章节边界（px）：0 | cardStart₂..ₙ | W（与横版同规则；单章片退化为 [0, W]）
const BOUNDS = [0, ...CHAPTER_STARTS.slice(1).map((c) => (W * cardStart(c)) / TOTAL_FRAMES), W];
export const DIVIDERS = BOUNDS.slice(1, -1).map((x) => Math.round(x));
export const DIVIDER_W = 4;
const CENTERS = BOUNDS.slice(0, -1).map((x, i) => Math.round((x + BOUNDS[i + 1]) / 2));
export const CHAPTERS: Array<{text: string; cx: number; from: number; slotW: number}> = CHAPTER_STARTS.map((c, i) => ({text: c.title, cx: CENTERS[i] ?? W / 2, from: i === 0 ? c.from : cardStart(c), slotW: Math.round(BOUNDS[i + 1] - BOUNDS[i]) - 30}));
export const CHAPTER_HIGHLIGHT_END = TOTAL_FRAMES + 1;
export const LABEL_SIZE = 24;
export const LABEL_SCALE_Y = 0.9;
export const LABEL_TOP = BAR_TOP + 3.5;
export const LABEL_SKEW = -10;
export const LABEL_DIM_ALPHA = 0.55;

export const currentChapter = (N: number) => {
  if (N >= CHAPTER_HIGHLIGHT_END) return -1;
  let idx = -1;
  for (let i = 0; i < CHAPTERS.length; i++) if (N >= CHAPTERS[i].from) idx = i;
  return idx; // 片头（第一章开始前）无高亮
};

export const ProgressBar: React.FC<{dimKf?: Array<[number, number]>; frame?: number}> = ({dimKf = [], frame}) => {
  const cur = useCurrentFrame();
  const N = frame ?? cur + 1;
  const fillW = (W * N) / TOTAL_FRAMES;
  const dim = dimKf.length ? kf(N, dimKf) : 1;
  const ch = currentChapter(N);
  return (
    <div style={{position: 'absolute', left: 0, top: BAR_TOP, width: W, height: BAR_H, pointerEvents: 'none'}}>
      <div style={{position: 'absolute', left: 0, top: 0, width: W, height: BAR_H, transform: 'translateY(0.25px)'}}>
        <div style={{position: 'absolute', left: fillW, top: 0, width: W - fillW, height: BAR_H, background: TRACK_RGBA}} />
        <div style={{position: 'absolute', left: 0, top: 0, width: fillW, height: BAR_H, background: FILL_RGBA}} />
        {dim < 0.999 ? <div style={{position: 'absolute', left: 0, top: 0, width: W, height: BAR_H, background: '#000', opacity: 1 - dim}} /> : null}
      </div>
      {DIVIDERS.map((x) => (
        <div key={x} style={{position: 'absolute', left: x - DIVIDER_W / 2, top: 6, width: DIVIDER_W, height: 22, background: 'rgba(255,255,255,0.9)'}} />
      ))}
      {CHAPTERS.map((c, i) => (
        <div
          key={c.text}
          style={{
            position: 'absolute', left: c.cx, top: LABEL_TOP - BAR_TOP,
            transform: `translateX(-50%) skewX(${LABEL_SKEW}deg) scaleY(${LABEL_SCALE_Y})`, transformOrigin: '50% 50%',
            whiteSpace: 'nowrap', fontFamily: FONT_HEAVY, fontWeight: 900, fontSize: fitSize(c.text, c.slotW, LABEL_SIZE, 17), lineHeight: 1,
            color: i === ch ? 'rgba(255,255,255,1)' : `rgba(255,255,255,${LABEL_DIM_ALPHA})`,
          }}
        >
          {c.text}
        </div>
      ))}
    </div>
  );
};
