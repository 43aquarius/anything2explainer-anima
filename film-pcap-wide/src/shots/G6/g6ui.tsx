import React from 'react';
import {FONT_MONO, FONT_ORB, TEXT_DY} from '../../common';
import {ORANGE, PURPLE_LIGHT, WHITE, abs, mixHex} from '../../ui';

/**
 * G6 组内共用小图元（跨镜头复用；不进 ui.tsx 以免污染共用层）。
 */

/** 精简 Wireshark 行（No / Time / Proto / Info 四字段等宽；[TCP …] 行 Info 自动橙显）。
 *  字段几何（行内相对 x）：no 16–76 ｜ time 84–192 ｜ proto 204–290 ｜ info 306→…
 *  SC29 的 Time 列橙框按 time 段几何对齐。markK：0→1 紫左边条点亮（SC29 checkout 行）。 */
export const MiniRow: React.FC<{
  x: number; y: number; w: number; h?: number;
  no: number | string; t: string; proto: string; info: string;
  active?: boolean; markK?: number; opacity?: number; timeColor?: string;
}> = ({x, y, w, h = 50, no, t, proto, info, active = false, markK = 0, opacity = 1, timeColor}) => {
  const hot = info.startsWith('[TCP');
  const mk = Math.max(0, Math.min(1, markK));
  return (
    <div
      style={{
        ...abs(x, y, w, h),
        opacity,
        borderBottom: `2px solid #4A4A4A`,
        background: active ? 'rgba(102,48,248,.16)' : 'transparent',
        borderLeft: `5px solid ${mk > 0 ? mixHex('#000000', PURPLE_LIGHT, mk) : 'transparent'}`,
        boxShadow: active ? 'inset 0 0 22px rgba(102,45,248,.28)' : undefined,
      }}
    >
      <span style={{...abs(16, 0, 60, h), display: 'flex', alignItems: 'center', fontFamily: FONT_MONO, fontSize: 23, color: '#A0A0A1', lineHeight: 1}}>{no}</span>
      <span style={{...abs(84, 0, 108, h), display: 'flex', alignItems: 'center', fontFamily: FONT_MONO, fontSize: 24, fontWeight: 700, color: timeColor ?? (active ? WHITE : '#D4D4D4'), lineHeight: 1}}>{t}</span>
      <span style={{...abs(204, 0, 86, h), display: 'flex', alignItems: 'center', fontFamily: FONT_MONO, fontSize: 23, color: '#A0A0A1', lineHeight: 1}}>{proto}</span>
      <span style={{...abs(306, 0, w - 306 - 12, h), display: 'flex', alignItems: 'center', fontFamily: FONT_MONO, fontSize: 23, color: hot ? ORANGE : active ? WHITE : '#D4D4D4', lineHeight: 1, whiteSpace: 'nowrap'}}>{info}</span>
    </div>
  );
};

/** 双向水平箭头（间隔标注线）：自中点向两端 draw-on（p 0→1），两端箭头在 p>0.8 时长出。 */
export const DoubleArrow: React.FC<{x0: number; x1: number; y: number; p?: number; color?: string; rodW?: number; headL?: number; headW?: number; opacity?: number}> = ({x0, x1, y, p = 1, color = WHITE, rodW = 3, headL = 16, headW = 18, opacity = 1}) => {
  const cm = (x0 + x1) / 2;
  const half = ((x1 - x0) / 2) * Math.max(0, Math.min(1, p));
  const heads = p > 0.8;
  return (
    <svg width={x1 - x0 + 40} height={headW + 8} viewBox={`0 0 ${x1 - x0 + 40} ${headW + 8}`} style={{position: 'absolute', left: x0 - 20, top: y - (headW + 8) / 2, overflow: 'visible', opacity}}>
      <line x1={20 + (x1 - x0) / 2 - half} y1={(headW + 8) / 2} x2={20 + (x1 - x0) / 2 + half} y2={(headW + 8) / 2} stroke={color} strokeWidth={rodW} />
      {heads ? (
        <>
          <polygon points={`${20},${(headW + 8) / 2} ${20 + headL},${(headW + 8) / 2 - headW / 2} ${20 + headL},${(headW + 8) / 2 + headW / 2}`} fill={color} />
          <polygon points={`${20 + (x1 - x0)},${(headW + 8) / 2} ${20 + (x1 - x0) - headL},${(headW + 8) / 2 - headW / 2} ${20 + (x1 - x0) - headL},${(headW + 8) / 2 + headW / 2}`} fill={color} />
        </>
      ) : null}
    </svg>
  );
};

/** 橙色圆形柔光斑（SC33 大数字脚下的大面积橙光 / SC32 表盘光）：k 强度 0→1，N 传入时 30 帧呼吸 ±15%。 */
export const OrangeGlow: React.FC<{cx: number; cy: number; r: number; k?: number; N?: number; alpha?: number}> = ({cx, cy, r, k = 1, N, alpha = 0.5}) => {
  const breathe = N === undefined ? 1 : 1 + 0.15 * Math.sin((2 * Math.PI * N) / 30);
  const a = Math.max(0, Math.min(1, k)) * breathe;
  if (a <= 0.01) return null;
  return (
    <div
      style={{
        ...abs(cx - r, cy - r, 2 * r, 2 * r),
        borderRadius: '50%',
        background: `radial-gradient(circle, rgba(240,95,65,${(alpha * a).toFixed(3)}) 0%, rgba(240,95,65,${(alpha * 0.55 * a).toFixed(3)}) 38%, rgba(240,95,65,0) 70%)`,
      }}
    />
  );
};

/** expert 角标（SC33）：黑底 + 橙边 + 橙色感叹号。 */
export const ExBadge: React.FC<{cx: number; cy: number; s?: number; opacity?: number}> = ({cx, cy, s = 1, opacity = 1}) => (
  <div style={{position: 'absolute', left: cx - 23, top: cy - 23, width: 46, height: 46, opacity, transform: `scale(${s.toFixed(3)})`, borderRadius: 9, background: '#000', border: `3px solid ${ORANGE}`, boxShadow: '0 0 16px 4px rgba(240,95,65,.3)', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
    <span style={{fontFamily: FONT_ORB, fontSize: 30, fontWeight: 800, color: ORANGE, lineHeight: 1, transform: `translateY(${TEXT_DY}px)`}}>!</span>
  </div>
);
