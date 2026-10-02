import React from 'react';
import {FONT_MONO, FONT_ORB} from '../../common';
import {BLOOM, BLOOM_SOFT, GREY, GREY_LINE, GREY_LIGHT, ORANGE, PURPLE, PURPLE_LIGHT, WHITE, abs} from '../../ui';

/**
 * G2 组内共用图元（竖版 720×1280；SC05–SC08）。不进 ui.tsx 以免污染共用层。
 * - VSvg          竖版全幅 SVG 容器（ui.tsx 的 Svg 是 1280×720 横版，竖版不能直接用）
 * - WSChromeV     Wireshark 窗口 chrome（外框 + 标题栏）。WSWindow 的内建 pane 几何（0.46/0.74/0.98 累加）
 *                 在高窗（h>245）下 pane2 会溢出窗口底（49+1.2h），竖版 h=680 会画到字幕带 → 自绘同款 chrome，
 *                 三区矩形/分隔线/紫边由 SC06 自己画
 * - MiniRowV      压缩列宽的 Wireshark 列表行（No/Time/Proto/Info，字号 22–24；ui.tsx WSRow 的固定列宽 730px 装不进 580 宽安全区）
 * - LaptopIcon    笔记本（SC05 卡①）
 * - NumBadge      站位数字徽章：虚线圆 + Orbitron 数字（lit 紫 / 未亮灰）；fillPill 形态给 SC06 的 ①②③
 * - MiniScreen    分析器小屏 + copies 计数（SC05 卡②③）
 * - DoubleArrow   双向水平箭头（SC08 间隔标注，自中点向两端 draw-on）
 */

/** 竖版全幅 SVG 容器 */
export const VSvg: React.FC<{children: React.ReactNode; style?: React.CSSProperties; opacity?: number}> = ({children, style, opacity = 1}) => (
  <svg width={720} height={1280} viewBox="0 0 720 1280" style={{position: 'absolute', left: 0, top: 0, overflow: 'visible', filter: BLOOM, opacity, ...style}}>
    {children}
  </svg>
);

/** Wireshark 窗口 chrome（视觉与 ui.tsx WSWindow 同款：3px 白边 + #101013 标题栏 + 三灰点 + 标题） */
export const WSChromeV: React.FC<{x: number; y: number; w: number; h: number; title?: string; opacity?: number; children?: React.ReactNode}> = ({x, y, w, h, title = 'Wireshark', opacity = 1, children}) => (
  <div style={{...abs(x, y, w, h), opacity}}>
    <div style={{position: 'absolute', inset: 0, background: '#000', border: `3px solid ${WHITE}`, borderRadius: 10}} />
    <div style={{position: 'absolute', left: 3, top: 3, width: w - 6, height: 44, background: '#101013', borderTopLeftRadius: 8, borderTopRightRadius: 8, borderBottom: `2px solid ${GREY_LINE}`, display: 'flex', alignItems: 'center', gap: 12}}>
      {[0, 1, 2].map((i) => <div key={i} style={{width: 11, height: 11, borderRadius: 6, background: GREY_LINE, marginLeft: i === 0 ? 12 : 0}} />)}
      <span style={{fontFamily: FONT_MONO, fontSize: 24, fontWeight: 700, color: WHITE, lineHeight: 1}}>{title}</span>
    </div>
    {children}
  </div>
);

export type RowT = {no: number; t: string; src: string; dst: string; proto: string; info: string};

/** 压缩列宽 Wireshark 列表行：No(44) Time(68) Proto(110) Info(其余)；[TCP …] 行 Info 橙显；active → 紫底光行 */
export const MiniRowV: React.FC<{x: number; y: number; w: number; h?: number; row: RowT; active?: boolean; dim?: boolean; opacity?: number}> = ({x, y, w, h = 52, row, active = false, dim = false, opacity = 1}) => {
  const hot = row.info.startsWith('[TCP');
  // 重传行 Info 过长（27ch×13.2≈356px > 列宽），按词边界截断为 '[TCP Retransmission]'（EXAMPLE 字段的完整前缀）
  const info = hot ? '[TCP Retransmission]' : row.info;
  return (
    <div style={{...abs(x, y, w, h), opacity, background: active ? 'rgba(102,48,248,.16)' : 'transparent', borderBottom: `2px solid ${GREY_LINE}`, boxShadow: active ? 'inset 0 0 22px rgba(102,45,248,.28)' : undefined}}>
      <span style={{...abs(14, 0, 44, h), display: 'flex', alignItems: 'center', fontFamily: FONT_MONO, fontSize: 22, color: active ? PURPLE_LIGHT : GREY, lineHeight: 1}}>{row.no}</span>
      <span style={{...abs(66, 0, 68, h), display: 'flex', alignItems: 'center', fontFamily: FONT_MONO, fontSize: 23, fontWeight: 700, color: active ? WHITE : GREY_LIGHT, lineHeight: 1}}>{row.t}</span>
      <span style={{...abs(142, 0, 110, h), display: 'flex', alignItems: 'center', fontFamily: FONT_MONO, fontSize: 22, color: active ? PURPLE_LIGHT : GREY_LIGHT, lineHeight: 1}}>{row.proto}</span>
      <span style={{...abs(260, 0, w - 272, h), display: 'flex', alignItems: 'center', fontFamily: FONT_MONO, fontSize: 22, color: hot ? ORANGE : active ? WHITE : GREY_LIGHT, lineHeight: 1, whiteSpace: 'nowrap', textShadow: hot && active ? '0 0 10px rgba(240,95,65,.6)' : undefined}}>{info}</span>
    </div>
  );
};

/** 笔记本：屏幕（含 OS 芯片 + 两根文本线）+ 平底座；lit → OS 芯片紫光（SC05 卡①「自己的机器看得见」） */
export const LaptopIcon: React.FC<{cx: number; cy: number; w: number; lit?: boolean; op?: number}> = ({cx, cy, w, lit = false, op = 1}) => {
  const sH = Math.round(0.58 * w);
  const bH = Math.round(0.11 * w);
  const H = sH + bH + 4;
  return (
    <div style={{...abs(cx - w / 2, cy - H / 2, w, H), opacity: op}}>
      <svg width={w} height={H} viewBox={`0 0 ${w} ${H}`} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible', filter: BLOOM_SOFT}}>
        <rect x={1.5} y={1.5} width={w - 3} height={sH - 3} rx={6} fill="#000" stroke={WHITE} strokeWidth={2.5} />
        <rect x={w * 0.09} y={sH / 2 - 15} width={30} height={30} rx={4} fill="#000" stroke={lit ? PURPLE_LIGHT : GREY_LINE} strokeWidth={2} style={lit ? {filter: 'drop-shadow(0 0 9px rgba(102,45,248,.8))'} : undefined} />
        <rect x={w * 0.09 + 42} y={sH / 2 - 11} width={w * 0.52} height={5} fill={lit ? GREY_LIGHT : GREY_LINE} />
        <rect x={w * 0.09 + 42} y={sH / 2 + 3} width={w * 0.38} height={5} fill={GREY_LINE} />
        <rect x={2} y={sH + 2} width={w - 4} height={bH} rx={4} fill="#000" stroke={WHITE} strokeWidth={2.5} />
      </svg>
    </div>
  );
};

/** 站位数字徽章：dashed 圆 + Orbitron 数字（lit 紫 / 未亮灰）；fill=true 且 lit → 紫底白字实心（SC06 的 ①②③ Pill） */
export const NumBadge: React.FC<{cx: number; cy: number; r?: number; digit: string; lit?: boolean; digitSize?: number; fill?: boolean; op?: number}> = ({cx, cy, r = 24, digit, lit = false, digitSize = 30, fill = false, op = 1}) => (
  <div style={{...abs(cx - r, cy - r, r * 2, r * 2), opacity: op}}>
    <svg width={r * 2} height={r * 2} viewBox={`0 0 ${r * 2} ${r * 2}`} style={{overflow: 'visible', filter: lit ? 'drop-shadow(0 0 8px rgba(102,45,248,.7))' : BLOOM_SOFT}}>
      <circle cx={r} cy={r} r={r - 2.5} fill={fill && lit ? PURPLE : 'rgba(0,0,0,.55)'} stroke={lit ? PURPLE_LIGHT : GREY_LINE} strokeWidth={fill ? 0 : 2.5} strokeDasharray={fill ? undefined : '7 6'} />
      <text x={r} y={r} textAnchor="middle" dy="0.36em" fontFamily={FONT_ORB} fontWeight={700} fontSize={digitSize} fill={lit ? (fill ? WHITE : PURPLE_LIGHT) : GREY}>
        {digit}
      </text>
    </svg>
  </div>
);

/** 分析器小屏：黑底白边 + copies 标签 + Orbitron 计数（SC05 卡②③ 副本落点） */
export const MiniScreen: React.FC<{cx: number; cy: number; w?: number; h?: number; count: number; op?: number; scale?: number; pulse?: number}> = ({cx, cy, w = 96, h = 60, count, op = 1, scale = 1, pulse = 1}) => (
  <div style={{...abs(cx - w / 2, cy - h / 2, w, h), opacity: op, transform: scale === 1 && pulse === 1 ? undefined : `scale(${(scale * pulse).toFixed(4)})`, transformOrigin: '50% 50%'}}>
    <div style={{position: 'absolute', inset: 0, background: '#000', border: `2.5px solid ${WHITE}`, borderRadius: 8, filter: BLOOM_SOFT}} />
    <div style={{position: 'absolute', left: 10, top: 8, fontFamily: FONT_MONO, fontSize: 22, color: GREY, lineHeight: 1}}>copies</div>
    <div style={{position: 'absolute', right: 12, top: h - 40, fontFamily: FONT_ORB, fontSize: 30, fontWeight: 700, color: PURPLE_LIGHT, lineHeight: 1, letterSpacing: 1, textShadow: '0 0 10px rgba(161,117,241,.7)', fontVariantNumeric: 'tabular-nums'}}>{count}</div>
  </div>
);

/** 双向水平箭头（间隔标注线）：自中点向两端 draw-on（p 0→1），两端箭头 p>0.8 长出 */
export const DoubleArrow: React.FC<{x0: number; x1: number; y: number; p?: number; color?: string; rodW?: number; headL?: number; headW?: number; opacity?: number}> = ({x0, x1, y, p = 1, color = WHITE, rodW = 3, headL = 16, headW = 18, opacity = 1}) => {
  const cm = (x0 + x1) / 2;
  const half = ((x1 - x0) / 2) * Math.min(1, Math.max(0, p));
  if (half <= 0) return null;
  const hk = Math.min(1, Math.max(0, (p - 0.8) / 0.2));
  const hL = headL * hk;
  const hW = (headW / 2) * hk;
  return (
    <div style={{position: 'absolute', left: 0, top: 0, opacity}}>
      <div style={{...abs(cm - half, y - rodW / 2, half * 2, rodW), background: color}} />
      {hk > 0 ? (
        <>
          <div style={{...abs(cm - half - hL + 1, y - hW, hL, hW * 2), clipPath: 'polygon(100% 0, 100% 100%, 0 50%)', background: color}} />
          <div style={{...abs(cm + half - 1, y - hW, hL, hW * 2), clipPath: 'polygon(0 0, 0 100%, 100% 50%)', background: color}} />
        </>
      ) : null}
    </div>
  );
};

/** 三次贝塞尔求点（副本信封沿弧飞行用） */
export const bez = (t: number, p0: number, p1: number, p2: number, p3: number) => {
  const u = 1 - t;
  return u * u * u * p0 + 3 * u * u * t * p1 + 3 * u * t * t * p2 + t * t * t * p3;
};
