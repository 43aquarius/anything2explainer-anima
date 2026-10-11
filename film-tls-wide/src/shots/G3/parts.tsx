import React from 'react';
import {clamp01, easeInOutPow} from '../../common';
import {BrowserWin, RackIcon, CText, PacketIcon, GREY, EXAMPLE, abs} from '../../ui';

/**
 * G3 共用件（SC08–SC10，第 2 章上半 · 握手）。
 * 双端图 = 浏览器（BrowserWin 整体 transform 缩放）+ 机架服务器（RackIcon），三镜头同一套形状做承接：
 *   SC08 全尺寸（对峙） → SC09 缩到两端角（让位 hello 卡） → SC10 长回全尺寸（回信）。
 */

export const END_FULL = {
  browser: {x: 140, y: 328, s: 0.45}, // BrowserWin 原生 470×380 → 211×171，y 328–499
  rack: {cx: 985, cy: 408, w: 100, h: 170, units: 5},
} as const;

export const END_BADGE = {
  browser: {x: 112, y: 188, s: 0.3}, // → 141×114，y 188–302
  rack: {cx: 1130, cy: 245, w: 76, h: 128, units: 4},
} as const;

/** 浏览器端（w/h 用 BrowserWin 原生 470×380，外层统一 scale）。barP：载入条 0→1。 */
export const BrowserEnd: React.FC<{x: number; y: number; s: number; op?: number; barP?: number}> = ({x, y, s, op = 1, barP = 0}) => (
  <div style={{position: 'absolute', inset: 0, opacity: op}}>
    <div style={{...abs(x, y, 470, 380), transform: `scale(${s.toFixed(4)})`, transformOrigin: '0 0'}}>
      <BrowserWin x={0} y={0} w={470} h={380} url={EXAMPLE.url} skeleton={3} barP={barP} />
    </div>
  </div>
);

/** 机架服务器端（lit：亮灯层数）。labelOp 控制下方 shop.example 标签。 */
export const RackEnd: React.FC<{cx: number; cy: number; w: number; h: number; units: number; lit: number; labelOp?: number; op?: number}> = ({cx, cy, w, h, units, lit, labelOp = 1, op = 1}) => (
  <div style={{position: 'absolute', inset: 0, opacity: op}}>
    <RackIcon cx={cx} cy={cy} w={w} h={h} units={units} lit={lit} />
    {labelOp > 0.01 ? <CText cx={cx} cy={cy + h / 2 + 20} size={22} weight={600} color={GREY} opacity={labelOp}>shop.example</CText> : null}
  </div>
);

// ---- 二次贝塞尔（弧线 / 飞行轨迹） ----
export type Pt = [number, number];
export const qBez = (t: number, p0: Pt, c: Pt, p1: Pt): Pt => {
  const u = 1 - t;
  return [u * u * p0[0] + 2 * u * t * c[0] + t * t * p1[0], u * u * p0[1] + 2 * u * t * c[1] + t * t * p1[1]];
};
/** 弧长近似（两段弦长 ×0.99），供 stroke-dasharray draw-on */
export const qBezLen = (p0: Pt, c: Pt, p1: Pt) =>
  (Math.hypot(c[0] - p0[0], c[1] - p0[1]) + Math.hypot(p1[0] - c[0], p1[1] - c[1])) * 0.99;

/** 弧线（stroke-dasharray draw-on + 末端小箭头随末 18% 长出）。p 0→1。 */
export const ArcPath: React.FC<{p0: Pt; c: Pt; p1: Pt; p?: number; color?: string; sw?: number; opacity?: number}> = ({p0, c, p1, p = 1, color = '#FFF', sw = 2.5, opacity = 1}) => {
  if (p <= 0 || opacity <= 0) return null;
  const L = qBezLen(p0, c, p1);
  const headK = clamp01((p - 0.82) / 0.18);
  const [hx, hy] = p1;
  const dx = p1[0] - c[0], dy = p1[1] - c[1];
  const dl = Math.hypot(dx, dy) || 1;
  const ux = dx / dl, uy = dy / dl;
  const hl = 15 * headK, hw = 11 * headK;
  return (
    <g opacity={opacity} stroke={color} fill="none">
      <path d={`M ${p0[0]} ${p0[1]} Q ${c[0]} ${c[1]} ${p1[0]} ${p1[1]}`} strokeWidth={sw} strokeLinecap="round" strokeDasharray={`${L}`} strokeDashoffset={L * (1 - clamp01(p))} />
      {headK > 0 ? <polygon points={`${hx},${hy} ${hx - ux * hl - uy * hw},${hy - uy * hl + ux * hw} ${hx - ux * hl + uy * hw},${hy - uy * hl - ux * hw}`} fill={color} stroke="none" /> : null}
    </g>
  );
};

/** 跑在弧线上的小信封（PacketIcon + 微倾摆） */
export const Envelope: React.FC<{cx: number; cy: number; w?: number; tilt?: number; opacity?: number; accent?: boolean}> = ({cx, cy, w = 46, tilt = 0, opacity = 1, accent = false}) => (
  <div style={{position: 'absolute', left: 0, top: 0, opacity}}>
    <div style={{transform: `translate(${cx.toFixed(1)}px,${cy.toFixed(1)}px) rotate(${tilt.toFixed(1)}deg)`}}>
      <PacketIcon cx={0} cy={0} w={w} h={w * 0.68} accent={accent} />
    </div>
  </div>
);

/** 一趟往返的相位：[t, leg]——leg 0 去程（t 0→1）、leg 1 回程（t 1→0，沿回程弧线）。n<0 → null */
export const tripPhase = (n: number, outLen = 30, backLen = 24): [number, 0 | 1] | null => {
  if (n < 0) return null;
  const cyc = outLen + backLen;
  const m = n % cyc;
  if (m < outLen) return [easeInOutPow(1.6)(m / outLen), 0];
  return [easeInOutPow(1.6)((m - outLen) / backLen), 1];
};
