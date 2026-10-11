import React from 'react';
import {clamp01} from '../../common';
import {EdgeNode, GREY, GREY_MID, WHITE, abs} from '../../ui';

/**
 * G2 组内共用小图元（不改 ui.tsx；风格：白描边 2–3px + 黑填充）。
 * CityMini / ShelfBig 为 SC04↔SC05↔SC06 的跨镜承接件，位置参数由两个镜头共享，保证组界帧逐像素衔接。
 */

/** SC03 城市圈缩微（章界承接）：圆圈 + 小 EdgeNode + 信封堆。SC04 右上角在场（不清场），SC05 世界图从它"放大"出来。 */
export const CityMini: React.FC<{cx: number; cy: number; r?: number; opacity?: number; scale?: number}> = ({cx, cy, r = 52, opacity = 1, scale = 1}) => (
  <div style={{position: 'absolute', left: cx - r, top: cy - r, width: 2 * r, height: 2 * r, opacity, transform: `scale(${scale.toFixed(4)})`, transformOrigin: '50% 50%'}}>
    <svg width={2 * r} height={2 * r} viewBox="0 0 120 120" style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
      <circle cx={60} cy={60} r={57} fill="rgba(0,0,0,0.55)" stroke={WHITE} strokeWidth={2.5} />
      {/* 信封堆（右下两枚，SC03 圈内元素的缩微） */}
      <rect x={72} y={72} width={20} height={14} fill="#000" stroke={GREY_MID} strokeWidth={1.5} />
      <rect x={77} y={57} width={20} height={14} fill="#000" stroke={GREY} strokeWidth={1.5} />
    </svg>
    <EdgeNode cx={r} cy={r * 0.94} w={r * 0.82} h={r * 0.96} lit />
  </div>
);

/** SC04 价签卡卡体（切角 + 挂孔 + 挂绳），内容（bandwidth Pill / $ 数字 / 对勾）由 SC04 绝对定位叠加。 */
export const PriceTag: React.FC<{cx: number; cy: number; w?: number; h?: number; opacity?: number}> = ({cx, cy, w = 350, h = 260, opacity = 1}) => (
  <div style={{...abs(cx - w / 2, cy - h / 2, w, h), opacity}}>
    <svg width={w} height={h} viewBox="0 0 360 260" style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
      <path d="M14 14 H346 V192 L284 246 H14 Z" fill="#000" stroke={WHITE} strokeWidth={3} strokeLinejoin="round" />
      <path d="M46 38 Q28 14 4 6" fill="none" stroke={GREY} strokeWidth={2} />
      <circle cx={48} cy={46} r={10} fill="#000" stroke={WHITE} strokeWidth={2.5} />
    </svg>
  </div>
);

/** SC04 光速限速牌：橙红圆环 + 衬线斜体 `c`（物理光速记号）。glow 0–1 = 撞击时的橙色光晕强度。 */
export const SpeedSign: React.FC<{cx: number; cy: number; r?: number; scale?: number; opacity?: number; glow?: number}> = ({cx, cy, r = 44, scale = 1, opacity = 1, glow = 0}) => (
  <div style={{position: 'absolute', left: cx - r, top: cy - r, width: 2 * r, height: 2 * r, opacity, transform: `scale(${scale.toFixed(4)})`}}>
    {glow > 0.01 ? <div style={{position: 'absolute', inset: -16, borderRadius: '50%', boxShadow: `0 0 ${(16 + 12 * glow).toFixed(0)}px ${(4 + 5 * glow).toFixed(1)}px rgba(240,95,65,${(0.5 * glow).toFixed(2)})`}} /> : null}
    <svg width={2 * r} height={2 * r} viewBox="0 0 100 100" style={{position: 'absolute', inset: 0}}>
      <circle cx={50} cy={50} r={44} fill="#000" stroke="#F05F41" strokeWidth={8} />
      <text x={50} y={54} textAnchor="middle" fontFamily="'Times New Roman', Times, serif" fontStyle="italic" fontWeight={700} fontSize={56} fill={WHITE}>c</text>
    </svg>
  </div>
);

/** SC05 世界简图（两块大陆 + 右上岛弧，低多边形轮廓，呼应 SC01）。p / islandP = draw-on 进度（pathLength=1）。 */
const CONT_L = 'M300 245 L335 222 L392 230 L438 252 L452 292 L436 322 L448 362 L430 412 L448 462 L420 512 L388 552 L366 520 L378 470 L352 428 L330 372 L302 330 L284 288 Z';
const CONT_R = 'M610 268 L648 236 L716 224 L796 232 L872 252 L946 246 L1016 262 L1048 296 L1032 330 L968 338 L918 360 L936 400 L908 442 L862 470 L836 516 L806 548 L786 512 L772 462 L726 430 L682 392 L654 340 L628 304 Z';
const ISLAND = 'M1058 352 L1092 344 L1114 366 L1096 390 L1062 382 Z';

export const WorldMap: React.FC<{p: number; islandP: number; opacity?: number}> = ({p, islandP, opacity = 1}) => (
  <svg width={1280} height={720} viewBox="0 0 1280 720" style={{position: 'absolute', inset: 0, opacity}}>
    {[CONT_L, CONT_R].map((d, i) => (
      <path key={i} d={d} fill="none" stroke={WHITE} strokeWidth={2.5} strokeLinejoin="round" opacity={0.72}
        pathLength={1} strokeDasharray={1} strokeDashoffset={1 - clamp01(p)} />
    ))}
    <path d={ISLAND} fill="none" stroke={WHITE} strokeWidth={2} opacity={0.6}
      pathLength={1} strokeDasharray={1} strokeDashoffset={1 - clamp01(islandP)} />
  </svg>
);

/** SC06 最近货架（3 层隔板 × 每层 3 内容块；中层中块紫高亮 = `2 GB movie` 副本，带小播放键）。litK = 高亮强度。 */
export const ShelfBig: React.FC<{cx: number; cy: number; w?: number; h?: number; litK?: number; opacity?: number; tagOp?: number}> = ({cx, cy, w = 380, h = 340, litK = 1, opacity = 1, tagOp = 1}) => {
  const blocks: Array<{x: number; y: number; hi: boolean}> = [];
  const ys = [34, 146, 258], xs = [22, 140, 258];
  ys.forEach((y, row) => xs.forEach((x, col) => blocks.push({x, y, hi: row === 1 && col === 1})));
  return (
    <div style={{...abs(cx - w / 2, cy - h / 2, w, h), opacity}}>
      <svg width={w} height={h} viewBox="0 0 380 340" style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
        <rect x={6} y={6} width={368} height={328} rx={10} fill="#000" stroke={WHITE} strokeWidth={3} />
        <line x1={6} y1={112} x2={374} y2={112} stroke={WHITE} strokeWidth={2.5} />
        <line x1={6} y1={224} x2={374} y2={224} stroke={WHITE} strokeWidth={2.5} />
        {blocks.map((b, i) => (
          <g key={i}>
            <rect x={b.x} y={b.y} width={100} height={54} rx={5}
              fill={b.hi ? `rgba(102,48,248,${(0.32 * litK).toFixed(3)})` : '#0d0d10'}
              stroke={b.hi ? `rgba(161,117,241,${(clamp01(litK) * 0.5 + 0.5).toFixed(2)})` : GREY_MID}
              strokeWidth={b.hi ? 2.5 : 1.8}
              opacity={b.hi ? 0.5 + 0.5 * clamp01(litK) : 0.85} />
            {b.hi ? (
              <g opacity={clamp01(tagOp)}>
                <polygon points={`${b.x + 40},${b.y + 16} ${b.x + 40},${b.y + 38} ${b.x + 60},${b.y + 27}`} fill={WHITE} />
                <line x1={b.x + 70} y1={b.y + 20} x2={b.x + 86} y2={b.y + 20} stroke={GREY} strokeWidth={2} />
                <line x1={b.x + 70} y1={b.y + 28} x2={b.x + 80} y2={b.y + 28} stroke={GREY} strokeWidth={2} />
              </g>
            ) : (
              <g>
                <line x1={b.x + 14} y1={b.y + 20} x2={b.x + 58} y2={b.y + 20} stroke={GREY_MID} strokeWidth={2} opacity={0.7} />
                <line x1={b.x + 14} y1={b.y + 32} x2={b.x + 44} y2={b.y + 32} stroke={GREY_MID} strokeWidth={2} opacity={0.7} />
              </g>
            )}
          </g>
        ))}
      </svg>
    </div>
  );
};
