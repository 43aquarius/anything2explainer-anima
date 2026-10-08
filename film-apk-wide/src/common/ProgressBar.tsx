import React from 'react';
import {useCurrentFrame} from 'remotion';
import {FONT_HEAVY} from './lib';
import {kf} from './easing';
import {fitSize} from './textfit';
import {TOTAL_FRAMES, CHAPTER_STARTS, SENTENCES} from './timeline';

/**
 * 底部章节进度条（半透明条体 y687–720、填充右缘 x=1280·N/TOTAL、n−1 根分隔线、章节名粗黑斜体 24px），来源于一条 MG 科普原片的实测模型，
 * 章节切换帧来自 timeline.ts（tts_build.py 自动生成），当前章高亮保持到片尾。章名 ≤6 字为宜。
 * 交付修订：分隔线与章名槽位改为**实际章节边界**（等宽分隔与真实章起点差最多 ~7%，进度条与内容不对齐）。
 * 边界帧 = cardStart（章节卡出现 = 观众感知的换章时刻，与 currentChapter 高亮切换同帧）→
 * 填充右缘扫过分隔线的瞬间恰好是章名点亮/暗下的瞬间。
 */
export const PROGRESS_ALPHA = 0.52;
export const FILL_RGBA = 'rgba(190,170,250,0.52)';
export const TRACK_RGBA = 'rgba(243,243,243,0.32)';
export const BAR_TOP = 687;
export const BAR_H = 720 - BAR_TOP;
// 当前章高亮切在**章节卡起始帧**（上一章末句 to+3），不是本章首句帧——否则章节卡宣告新章的 45 帧里进度条还亮着上一章（QC v1 C2 #1；lessons「覆盖层」）
const cardStart = (c: {n: number; from: number}) => {
  const prev = [...SENTENCES].reverse().find((x) => x.chapter < c.n);
  return prev ? prev.to + 3 : c.from;
};
const NCH = Math.max(1, CHAPTER_STARTS.length);
// 实际章节边界（px）：0 | cardStart₂..ₙ | 1280 —— 第一章从片头起算，末章到片尾
const BOUNDS = [0, ...CHAPTER_STARTS.slice(1).map((c) => (1280 * cardStart(c)) / TOTAL_FRAMES), 1280];
export const DIVIDERS = BOUNDS.slice(1, -1).map((x) => Math.round(x)); // 真实章边界分隔
export const DIVIDER_W = 4;
const CENTERS = BOUNDS.slice(0, -1).map((x, i) => Math.round((x + BOUNDS[i + 1]) / 2)); // 章名在自己段内居中
export const CHAPTERS: Array<{text: string; cx: number; from: number; slotW: number}> = CHAPTER_STARTS.map((c, i) => ({text: c.title, cx: CENTERS[i] ?? 640, from: i === 0 ? c.from : cardStart(c), slotW: Math.round(BOUNDS[i + 1] - BOUNDS[i]) - 30}));
export const CHAPTER_HIGHLIGHT_END = TOTAL_FRAMES + 1;
export const LABEL_SIZE = 24;
export const LABEL_SCALE_Y = 0.9;
export const LABEL_TOP = 690.5;
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
  const fillW = (1280 * N) / TOTAL_FRAMES;
  const dim = dimKf.length ? kf(N, dimKf) : 1;
  const ch = currentChapter(N);
  return (
    <div style={{position: 'absolute', left: 0, top: BAR_TOP, width: 1280, height: BAR_H, pointerEvents: 'none'}}>
      <div style={{position: 'absolute', left: 0, top: 0, width: 1280, height: BAR_H, transform: 'translateY(0.25px)'}}>
        <div style={{position: 'absolute', left: fillW, top: 0, width: 1280 - fillW, height: BAR_H, background: TRACK_RGBA}} />
        <div style={{position: 'absolute', left: 0, top: 0, width: fillW, height: BAR_H, background: FILL_RGBA}} />
        {dim < 0.999 ? <div style={{position: 'absolute', left: 0, top: 0, width: 1280, height: BAR_H, background: '#000', opacity: 1 - dim}} /> : null}
      </div>
      {DIVIDERS.map((x) => (
        <div key={x} style={{position: 'absolute', left: x - DIVIDER_W / 2, top: 693 - BAR_TOP, width: DIVIDER_W, height: 22, background: 'rgba(255,255,255,0.9)'}} />
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
