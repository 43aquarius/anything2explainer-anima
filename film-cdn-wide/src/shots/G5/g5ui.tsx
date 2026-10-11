import React from 'react';
import {clamp01, easeInOutPow, FONT_ORB} from '../../common';
import {CText, GREY_MID, GREY_LINE, WHITE, CORAL, abs, softOp} from '../../ui';

/**
 * G5 组内共用图元（SC12–SC14：九十年代 → Akamai → 跟随者）。
 * 只放三个镜头都要用的形状；风格沿用 ui.tsx（黑填充 + 白描边 2–3px + BLOOM_SOFT）。
 */

// ---- 年份滚动落定（DNS 片模板：全程模糊 ≥9px，14 帧归 0；分镜表 SC12 `1990s` / SC13 `1998`）----
export const YearRoll: React.FC<{
  N: number; f0: number; cx: number; cy: number; size?: number; color?: string;
  from: number; to: number; suffix?: string; len?: number; shadow?: string;
}> = ({N, f0, cx, cy, size = 96, color = '#C9C9C9', from, to, suffix = '', len = 14, shadow}) => {
  const n = N - f0;
  if (n < 0) return null;
  const roll = clamp01(n / len);
  const year = Math.round(from + (to - from) * roll);
  const text = roll < 1 ? String(year) : `${to}${suffix}`;
  const dy = -18 * Math.pow(1 - roll, 2); // 滚落：自上 18px 落定
  return (
    <div style={{...abs(0, 0, 1280, 720), opacity: softOp(n, 4)}}>
      <CText cx={cx} cy={cy + dy} size={size} weight={700} family={FONT_ORB} color={color} letterSpacing={2} shadow={shadow}
        style={{filter: roll < 1 ? 'blur(9px)' : undefined}}>
        {text}
      </CText>
    </div>
  );
};

// ---- 世界简图（SC13 承载网底图；viewBox 520×300，两块大陆 + 次级陆块的"简图"折线风格）----
export const WORLD_PATHS: string[] = [
  // 北美
  'M50,64 L120,42 L168,56 L176,84 L196,96 L170,116 L150,140 L118,126 L88,132 L62,110 L48,88 Z',
  // 格陵兰
  'M196,26 L226,20 L232,38 L210,46 Z',
  // 南美
  'M196,160 L228,156 L248,176 L236,206 L218,244 L204,238 L196,196 L186,172 Z',
  // 欧洲
  'M282,72 L318,58 L344,66 L338,86 L312,92 L296,104 L278,94 L272,80 Z',
  // 非洲
  'M288,112 L326,108 L348,130 L340,168 L316,208 L296,200 L282,164 L278,132 Z',
  // 亚洲
  'M352,58 L446,38 L486,60 L478,88 L448,98 L462,124 L436,142 L398,128 L374,140 L348,120 L362,92 Z',
  // 印度
  'M398,124 L420,120 L426,152 L404,156 Z',
  // 东南亚群岛
  'M452,152 L482,146 L492,158 L466,164 Z',
  // 澳洲
  'M444,188 L486,182 L502,206 L482,232 L456,226 L444,206 Z',
];

/** 边缘节点（18 座城市点，520×300 图内坐标） */
export const WORLD_NODES: Array<[number, number]> = [
  [64, 96], [102, 80], [138, 98], [204, 190], [214, 34], [236, 168], [286, 80], [288, 132], [312, 88],
  [318, 182], [336, 102], [356, 108], [386, 128], [414, 118], [452, 92], [466, 206], [468, 158], [472, 126],
];

/** 邻接边（WORLD_NODES 下标对，西→东连成一张网） */
export const WORLD_EDGES: Array<[number, number]> = [
  [0, 1], [1, 2], [1, 4], [2, 4], [2, 5], [5, 3], [3, 7], [5, 7], [4, 6], [6, 8], [6, 7], [7, 9],
  [8, 10], [8, 11], [10, 11], [11, 12], [12, 13], [13, 14], [14, 17], [17, 16], [16, 15], [12, 14],
];

/** 世界轮廓 draw-on：f0 起每条陆块线 1 帧错峰、各 16 帧（stroke-dasharray，pathLength 归一） */
export const WorldSketch: React.FC<{cx: number; cy: number; N: number; f0: number; w?: number; h?: number; opacity?: number}> = ({cx, cy, N, f0, w = 520, h = 300, opacity = 1}) => {
  const n = N - f0;
  if (n < 0) return null;
  return (
    <svg width={w} height={h} viewBox="0 0 520 300" style={{...abs(cx - w / 2, cy - h / 2, w, h), opacity: softOp(n, 4), overflow: 'visible'}}>
      <g stroke={WHITE} strokeWidth={2.4} fill="rgba(0,0,0,.72)" strokeLinejoin="round" filter="drop-shadow(0 0 2px rgba(255,255,255,.35))">
        {WORLD_PATHS.map((d, i) => {
          const p = clamp01((n - i) / 16);
          if (p <= 0) return null;
          return <path key={i} d={d} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - p} />;
        })}
      </g>
    </svg>
  );
};

// ---- 方点节点（"表现多用方点阵列"；k 0→1 点亮，glowK 联动柔光）----
export const NodeDot: React.FC<{cx: number; cy: number; k?: number; size?: number; color?: string; dim?: string; glowK?: number; opacity?: number}> = ({cx, cy, k = 1, size = 9, color = '#A175F1', dim = GREY_LINE, glowK, opacity = 1}) => {
  const kk = clamp01(k);
  if (kk <= 0.01) return null;
  const g = clamp01(glowK ?? kk);
  const lit = kk >= 0.55;
  return (
    <div style={{...abs(cx - size / 2, cy - size / 2, size, size), borderRadius: 2, opacity,
      background: lit ? color : '#0a0a0a',
      border: `1.6px solid ${lit ? color : dim}`,
      boxShadow: g > 0.02 ? `0 0 ${(6 * g).toFixed(1)}px ${(2.4 * g).toFixed(1)}px rgba(161,117,241,${(0.5 * g).toFixed(2)}), 0 0 ${(22 * g).toFixed(0)}px ${(7 * g).toFixed(1)}px rgba(102,48,248,${(0.32 * g).toFixed(2)})` : undefined}} />
  );
};

// ---- SC11 海图缩微（SC12 章首承接：波浪 + 跨海虚线弧 + 红 Cross + 近侧 edge 小架）----
export const SeaMapMini: React.FC<{N: number; x: number; y: number; s: number; opacity?: number}> = ({N, x, y, s, opacity = 1}) => {
  const wob = 2.2 * Math.sin((N / 40) * Math.PI * 2); // 海浪持续微动（SC11 母题）
  return (
    <div style={{...abs(x - 180 * s, y - 100 * s, 360 * s, 200 * s), opacity}}>
      <svg viewBox="0 0 360 200" width="100%" height="100%" style={{overflow: 'visible'}}>
        <g transform={`translate(0,${wob.toFixed(2)})`}>
          <path d="M20,150 q30,-13 60,0 t60,0 t60,0 t60,0 t60,0" fill="none" stroke={GREY_MID} strokeWidth={3} strokeLinecap="round" />
          <path d="M20,166 q30,10 60,0 t60,0 t60,0 t60,0 t60,0" fill="none" stroke={GREY_LINE} strokeWidth={2} opacity={0.7} />
        </g>
        {/* 跨海虚线弧（被红 Cross 盖中段：不过海） */}
        <path d="M36,158 Q180,18 324,66" fill="none" stroke={GREY_MID} strokeWidth={2.4} strokeDasharray="10 9" />
        <g stroke={CORAL} strokeWidth={6} strokeLinecap="round">
          <line x1={168} y1={78} x2={194} y2={104} />
          <line x1={194} y1={78} x2={168} y2={104} />
        </g>
        {/* you 点 + 近侧 edge 小架 */}
        <circle cx={30} cy={158} r={6} fill="#000" stroke={WHITE} strokeWidth={2.4} />
        <g transform="translate(318,54)">
          <rect x={0} y={0} width={26} height={22} rx={3} fill="#000" stroke={WHITE} strokeWidth={2.2} />
          <line x1={5} y1={9} x2={21} y2={9} stroke={GREY_MID} strokeWidth={2} />
          <line x1={5} y1={15} x2={16} y2={15} stroke={GREY_MID} strokeWidth={2} />
        </g>
      </svg>
    </div>
  );
};

// ---- ISP 里的开放设备（SC14 卡 1：1U 小盒 + 散热栅 + 指示灯）----
export const ApplianceIcon: React.FC<{cx: number; cy: number; N: number; f0: number; opacity?: number}> = ({cx, cy, N, f0, opacity = 1}) => {
  const n = N - f0;
  if (n < 0) return null;
  const led = n > 22 ? (Math.sin(((N - f0) / 22) * Math.PI * 2) > -0.25 ? 1 : 0.22) : 1; // 入场后指示灯循环闪
  return (
    <div style={{...abs(cx - 29, cy - 13, 58, 26), opacity, borderRadius: 4, background: '#000', border: '2.2px solid #C9C9C9', boxShadow: '0 0 14px rgba(255,255,255,.18)'}}>
      {[0, 1, 2].map(i => <div key={i} style={{position: 'absolute', left: 8 + i * 9, top: 6, width: 5, height: 14, borderRadius: 2, background: GREY_LINE}} />)}
      <div style={{position: 'absolute', right: 8, top: 10, width: 6, height: 6, borderRadius: '50%', background: '#8FF740', opacity: led, boxShadow: `0 0 ${6 * led}px rgba(143,247,64,.8)`}} />
    </div>
  );
};

export const lerpPt = (a: [number, number], b: [number, number], t: number): [number, number] => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
export const GREY_TEXT = '#C9C9C9';
