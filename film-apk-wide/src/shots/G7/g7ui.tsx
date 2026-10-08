import React from 'react';
import {rnd, FONT_MONO} from '../../common';
import {abs, Box, GREY_MID, WHITE, PURPLE_LIGHT, BLOOM_SOFT, glowPurpleS, mixHex} from '../../ui';

/**
 * G7 组内图元（第 3 章下半：SC40–SC44）。
 * - TickerRow：等宽字符滚动行（字节码 / 机器码「运行感」纹理；纯函数，槽位内容由 rnd 决定，无状态）
 * - CompileGear：编译齿轮（白 3px，调用方传 rot = 1.5°×帧）
 * - PointHand：解释器手指（简笔，指尖在 (x+27, y+17)）
 * - DexFileCard：classes.dex 卡（白边 + 折角 dex 图标 + 3 行滚动 hex）
 * - UpdateHat：手机顶部的「更新帽」（圆顶 + 帽檐 + ↑ 徽记）
 * - AppDot：环绕手机的 app 图标（白边圆 → 紫光点亮）
 */

const HEXC = '0123456789ABCDEF';
/** 一个字节 token："A4 "（3 个等宽字符）。 */
export const hexTok = (seed: number, slot: number) =>
  HEXC[Math.floor(rnd(seed, slot) * 16)] + HEXC[Math.floor(rnd(seed, slot, 7) * 16)] + ' ';
/** 一个机器码 token："0xA9BF "（7 个等宽字符，AArch64 样式）。 */
export const mcTok = (seed: number, slot: number) =>
  '0x' +
  HEXC[Math.floor(rnd(seed, slot) * 16)] +
  HEXC[Math.floor(rnd(seed, slot, 7) * 16)] +
  HEXC[Math.floor(rnd(seed, slot, 11) * 16)] +
  HEXC[Math.floor(rnd(seed, slot, 13) * 16)] +
  ' ';

/**
 * 滚动字符行：容器 (x,y,w) 裁切；dir=1 内容右行（新字符自左缘进入），dir=-1 左行。
 * 槽位内容由 glyph(slot) 生成（确定性）；滚动 = 「槽位内容随 j0 换字 + 整行平移 frac×unitPx」，换字与平移互相抵消 → 无缝循环。
 * mono 字宽按 0.6em 估算（SF Mono / Menlo / Consolas / DejaVu Sans Mono 均约 0.60–0.61em）。
 */
export const TickerRow: React.FC<{
  x: number; y: number; w: number; N: number;
  speed?: number; phase?: number; size?: number; color?: string; opacity?: number;
  unitCh?: number; dir?: 1 | -1; glyph: (slot: number) => string;
}> = ({x, y, w, N, speed = 3.2, phase = 0, size = 18, color, opacity = 1, unitCh = 3, dir = 1, glyph}) => {
  const unitPx = unitCh * size * 0.6;
  const t = N * speed + phase;
  const j0 = Math.floor(t / unitPx);
  const frac = t / unitPx - j0;
  const cols = Math.ceil(w / unitPx) + 2;
  const toks: string[] = [];
  for (let m = 0; m < cols; m++) toks.push(glyph(dir === 1 ? m - j0 : m + j0));
  return (
    <div style={{...abs(x, y, w, size + 8), overflow: 'hidden', opacity}}>
      <div
        style={{
          position: 'absolute',
          left: dir === 1 ? -unitPx : 0,
          top: 0,
          whiteSpace: 'pre',
          fontFamily: FONT_MONO,
          fontSize: size,
          lineHeight: 1.35,
          color,
          transform: `translateX(${((dir === 1 ? 1 : -1) * frac * unitPx).toFixed(2)}px)`,
        }}
      >
        {toks.join('')}
      </div>
    </div>
  );
};

/** 编译齿轮：外圈 + 10 齿 + 轮毂 + 4 根辐条（旋转可读）。rot 单位度，调用方持续递增。 */
export const CompileGear: React.FC<{cx: number; cy: number; r?: number; rot?: number; sw?: number; color?: string; opacity?: number}> = ({cx, cy, r = 34, rot = 0, sw = 3, color = WHITE, opacity = 1}) => {
  const pad = 10;
  const c = r + pad;
  return (
    <div style={{...abs(cx - c, cy - c, 2 * c, 2 * c), opacity}}>
      <svg width={2 * c} height={2 * c} viewBox={`0 0 ${2 * c} ${2 * c}`} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible', filter: BLOOM_SOFT}}>
        <g transform={`rotate(${rot.toFixed(2)} ${c} ${c})`} stroke={color} strokeWidth={sw} fill="#000" strokeLinejoin="round">
          <circle cx={c} cy={c} r={r} />
          <circle cx={c} cy={c} r={r * 0.3} />
          {Array.from({length: 10}, (_, i) => (
            <rect key={i} x={c - 5.5} y={pad - 9} width={11} height={13} rx={2} transform={`rotate(${(i * 36).toFixed(1)} ${c} ${c})`} />
          ))}
          {Array.from({length: 4}, (_, i) => {
            const a = ((i * 90 + 45) * Math.PI) / 180;
            return <line key={`s${i}`} x1={c + Math.cos(a) * r * 0.3} y1={c + Math.sin(a) * r * 0.3} x2={c + Math.cos(a) * (r - 2)} y2={c + Math.sin(a) * (r - 2)} />;
          })}
        </g>
      </svg>
    </div>
  );
};

/** 解释器手指（简笔侧视）：食指水平指向右侧，下方握拳 + 拇指。指尖 ≈ (x+27, y+17)。 */
export const PointHand: React.FC<{x: number; y: number; scale?: number; opacity?: number}> = ({x, y, scale = 1, opacity = 1}) => (
  <div style={{...abs(x, y, 40 * scale, 46 * scale), opacity}}>
    <svg width={40 * scale} height={46 * scale} viewBox="0 0 40 46" style={{position: 'absolute', left: 0, top: 0, overflow: 'visible', filter: BLOOM_SOFT}}>
      <g fill="#000" stroke={WHITE} strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round">
        <rect x={0} y={12} width={27} height={10} rx={5} />
        <rect x={2} y={22} width={18} height={19} rx={6} />
        <path d="M20,23 q7,1 7,6 l0,4 q0,4 -4,4" fill="none" />
        <path d="M8,31 l0,4 M13,31 l0,4" fill="none" strokeWidth={2} />
      </g>
    </svg>
  </div>
);

/** classes.dex 卡：白边黑底 + 折角 dex 图标 + 标题 + 3 行滚动 hex（源码流动感）。 */
export const DexFileCard: React.FC<{x: number; y: number; w?: number; h?: number; N: number; seed?: number; opacity?: number; title?: string}> = ({x, y, w = 250, h = 160, N, seed = 77, opacity = 1, title = 'classes.dex'}) => (
  <div style={{...abs(x, y, w, h), opacity}}>
    <Box x={0} y={0} w={w} h={h} r={10} stroke={WHITE} sw={2.5} fill="rgba(0,0,0,0.9)" />
    <svg width={34} height={42} viewBox="0 0 34 42" style={{position: 'absolute', left: 16, top: 14, filter: BLOOM_SOFT}}>
      <path d="M2,2 H22 L32,12 V40 H2 Z" fill="#000" stroke={WHITE} strokeWidth={2.5} strokeLinejoin="round" />
      <path d="M22,2 V12 H32" fill="none" stroke={WHITE} strokeWidth={2.5} strokeLinejoin="round" />
      <line x1={9} y1={22} x2={25} y2={22} stroke={GREY_MID} strokeWidth={2} />
      <line x1={9} y1={28} x2={25} y2={28} stroke={GREY_MID} strokeWidth={2} />
      <line x1={9} y1={34} x2={18} y2={34} stroke={GREY_MID} strokeWidth={2} />
    </svg>
    <div style={{position: 'absolute', left: 60, top: 22, fontFamily: FONT_MONO, fontSize: 20, color: WHITE, lineHeight: 1}}>{title}</div>
    <TickerRow x={16} y={68} w={w - 32} N={N} speed={2.6} size={16} color={GREY_MID} unitCh={3} dir={1} glyph={(s) => hexTok(seed * 3 + 5, s)} />
    <TickerRow x={16} y={94} w={w - 32} N={N} speed={3.4} size={16} color={GREY_MID} unitCh={3} dir={1} phase={37} glyph={(s) => hexTok(seed * 3 + 6, s)} />
    <TickerRow x={16} y={120} w={w - 32} N={N} speed={2.9} size={16} color={GREY_MID} unitCh={3} dir={1} phase={71} glyph={(s) => hexTok(seed * 3 + 7, s)} />
  </div>
);

/** 更新帽：圆顶 + 帽檐 + 紫色 ↑ 徽记（「手机在更新自己」）。y 为帽顶基线，总高 30×scale。 */
export const UpdateHat: React.FC<{cx: number; y: number; w?: number; scale?: number; opacity?: number}> = ({cx, y, w = 64, scale = 1, opacity = 1}) => {
  const ww = w * scale;
  return (
    <div style={{...abs(cx - ww / 2, y, ww, 30 * scale), opacity}}>
      <svg width={ww} height={30 * scale} viewBox={`0 0 ${w} 30`} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible', filter: BLOOM_SOFT}}>
        <path d={`M${w * 0.14},25 Q${w * 0.14},4 ${w / 2},4 Q${w * 0.86},4 ${w * 0.86},25 Z`} fill="#000" stroke={WHITE} strokeWidth={2.5} strokeLinejoin="round" />
        <line x1={1} y1={25} x2={w - 1} y2={25} stroke={WHITE} strokeWidth={3.5} strokeLinecap="round" />
        <path d={`M${w / 2},9 V19 M${w / 2 - 4.5},${13.5} L${w / 2},${9} L${w / 2 + 4.5},${13.5}`} fill="none" stroke={PURPLE_LIGHT} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
};

/** 环绕 app 图标：白边圆 + 内嵌小方块；k 0→1 白边渐变紫 + 紫光；flash 0–1 白闪罩。 */
export const AppDot: React.FC<{cx: number; cy: number; r?: number; k?: number; flash?: number; scale?: number; opacity?: number}> = ({cx, cy, r = 22, k = 0, flash = 0, scale = 1, opacity = 1}) => {
  const edge = mixHex('#FFFFFF', PURPLE_LIGHT, k);
  return (
    <div style={{...abs(cx - r, cy - r, 2 * r, 2 * r), opacity, transform: `scale(${scale.toFixed(3)})`, transformOrigin: '50% 50%'}}>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: '50%',
          border: `2.5px solid ${edge}`,
          background: k > 0.02 ? `rgba(102,48,248,${(0.16 * k).toFixed(3)})` : 'rgba(0,0,0,0.75)',
          boxShadow: k > 0.02 ? glowPurpleS(k) : 'none',
        }}
      />
      <div style={{position: 'absolute', left: r - 8, top: r - 8, width: 16, height: 16, borderRadius: 5, border: `2px solid ${edge}`, background: k > 0.5 ? PURPLE_LIGHT : 'rgba(0,0,0,0.4)'}} />
      {flash > 0.02 ? <div style={{position: 'absolute', inset: -3, borderRadius: '50%', background: '#FFF', opacity: Number((0.85 * flash).toFixed(3))}} /> : null}
    </div>
  );
};
