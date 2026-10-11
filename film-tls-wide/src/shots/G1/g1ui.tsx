import React from 'react';
import {clamp01} from '../../common';
import {WHITE, abs} from '../../ui';

/**
 * G1 组内共用小图元（不进 ui.tsx，见 BUILD_NOTES）：
 *   WifiArc      Wi-Fi 弧线图标（draw-on p 0→1，三弧自下而上逐条画出）
 *   MouseCursor  鼠标指针（SC04 双击 bob 行）
 *   GlobeIcon    小站点图标（SC04 受害者行尾）
 */

/** Wi-Fi 弧线：底点 + 三段同心弧；p 0→1 时弧自内向外逐条 draw-on（每条约占 p 的 1/3） */
export const WifiArc: React.FC<{cx: number; cy: number; r?: number; color?: string; p?: number; opacity?: number}> = ({cx, cy, r = 34, color = WHITE, p = 1, opacity = 1}) => {
  if (p <= 0) return null;
  const arcs = [0.42, 0.72, 1].map((k, i) => {
    const rr = r * k;
    const per = Math.PI * rr; // 半圆弧长
    const seg = clamp01(p * 3 - i);
    return <path key={i} d={`M ${cx - rr * 0.92} ${cy + r * 0.28 - rr * 0.2} A ${rr} ${rr} 0 0 1 ${cx + rr * 0.92} ${cy + r * 0.28 - rr * 0.2}`} fill="none" stroke={color} strokeWidth={i === 0 ? 3.4 : 2.6} strokeLinecap="round" strokeDasharray={per} strokeDashoffset={per * (1 - seg)} />;
  });
  return (
    <svg width={r * 2 + 8} height={r * 2 + 8} viewBox={`${cx - r - 4} ${cy - r - 4} ${r * 2 + 8} ${r * 2 + 8}`} style={{...abs(0, 0, 0, 0), position: 'absolute', left: 0, top: 0, width: 1280, height: 720, overflow: 'visible', opacity}}>
      {arcs}
      <circle cx={cx} cy={cy + r * 0.42} r={3.6} fill={color} opacity={clamp01(p * 3)} />
    </svg>
  );
};

/** 鼠标指针（白底黑边箭头）；(x,y) 为尖端 */
export const MouseCursor: React.FC<{x: number; y: number; s?: number; opacity?: number}> = ({x, y, s = 1, opacity = 1}) => (
  <svg width={30 * s} height={40 * s} viewBox="0 0 30 40" style={{position: 'absolute', left: x, top: y, overflow: 'visible', opacity, filter: 'drop-shadow(0 0 4px rgba(255,255,255,.6))'}}>
    <path d="M4 2 L4 30 L11 23.5 L16 35 L21 32.5 L16 21.5 L25 20.5 Z" fill="#fff" stroke="#000" strokeWidth={2} strokeLinejoin="round" />
  </svg>
);

/** 小站点图标（地球仪）：圆 + 赤道线 + 一条经线 */
export const GlobeIcon: React.FC<{cx: number; cy: number; r?: number; color?: string; opacity?: number}> = ({cx, cy, r = 14, color = WHITE, opacity = 1}) => (
  <svg width={r * 2 + 6} height={r * 2 + 6} viewBox={`${-r - 3} ${-r - 3} ${r * 2 + 6} ${r * 2 + 6}`} style={{position: 'absolute', left: cx - r - 3, top: cy - r - 3, overflow: 'visible', opacity}}>
    <g stroke={color} strokeWidth={1.8} fill="none">
      <circle cx={0} cy={0} r={r} />
      <ellipse cx={0} cy={0} rx={r * 0.45} ry={r} />
      <line x1={-r} y1={0} x2={r} y2={0} />
    </g>
  </svg>
);
