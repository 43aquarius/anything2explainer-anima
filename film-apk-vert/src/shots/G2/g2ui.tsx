import React from 'react';
import {clamp01, kf, powIn, easeOutCubic, rnd, FONT_MONO} from '../../common';
import {
  Box, abs, WHITE, GREY, GREY_MID, GREY_LINE, GREY_LIGHT,
  PURPLE_LIGHT, ORANGE, RED_DEEP, CORAL, BLOOM_SOFT,
} from '../../ui';

/**
 * G2 组内图元（竖版 720×1280，安装流水线 SC05–SC08）。
 * 几何/动效模式移植自横版 g5ui/g7ui（火漆落章 SC31 / 覆盖弧 SC32 / 红字节·冲击波·裂纹 g5ui /
 * 编译齿轮·滚动字符行·dex 卡 g7ui），坐标全部换算到竖版安全区（内容 x 40–620、y 240–990）。
 * 全部纯函数（动画量由调用方按 N 算好传入）；随机只用 rnd。
 */

/** 全画布 SVG 容器（竖版 720×1280） */
export const SvgV: React.FC<{children: React.ReactNode; opacity?: number; bloom?: boolean}> = ({children, opacity = 1, bloom = false}) => (
  <svg width={720} height={1280} viewBox="0 0 720 1280" style={{position: 'absolute', left: 0, top: 0, overflow: 'visible', opacity, filter: bloom ? 'drop-shadow(0 0 3px rgba(255,255,255,0.5))' : undefined}}>
    {children}
  </svg>
);

/** stampIn（横版 g5ui 同源）：n<0 未入场；scale 1.35→1（powIn 2.2）+ 前 2 帧白闪 */
export const stampIn = (n: number, len = 8): {s: number; flash: number} => {
  if (n < 0) return {s: 0, flash: 0};
  return {s: kf(n, [[0, 1.35], [len, 1]], powIn(2.2)), flash: n < 2 ? 1 - n * 0.4 : 0};
};

// ---------- SC05：覆盖弧（"整个文件"兜一圈） ----------
/** 覆盖弧：绕 (cx,cy) 椭圆一圈的紫色虚线，p 为自顶部顺时针 draw-on 进度（24 帧），march 为完成后虚线巡行帧数（持续动作） */
export const CovArcV: React.FC<{cx: number; cy: number; rx: number; ry: number; p: number; march?: number; opacity?: number; glowK?: number; segs?: number}> = ({cx, cy, rx, ry, p, march = 0, opacity = 1, glowK = 1, segs = 56}) => {
  if (p <= 0 || opacity <= 0) return null;
  const pts: Array<[number, number]> = [];
  for (let i = 0; i <= segs; i++) {
    const th = (((-90 + (i / segs) * 360) * Math.PI) / 180);
    pts.push([cx + rx * Math.cos(th), cy + ry * Math.sin(th)]);
  }
  const pl = p >= 1 ? pts : pts.slice(0, Math.max(2, Math.round(pts.length * clamp01(p))));
  return (
    <SvgV opacity={opacity}>
      <g style={{filter: `drop-shadow(0 0 ${(6 * glowK).toFixed(1)}px rgba(161,117,241,${(0.6 * glowK).toFixed(2)}))`}}>
        <polyline
          points={pl.map((q) => `${q[0].toFixed(1)},${q[1].toFixed(1)}`).join(' ')}
          fill="none"
          stroke={PURPLE_LIGHT}
          strokeWidth={4}
          strokeDasharray="16 10"
          strokeDashoffset={-0.9 * march}
          strokeLinecap="round"
          opacity={clamp01(p * 8)}
        />
      </g>
    </SvgV>
  );
};

// ---------- SC06：红字节 / 冲击波 / 裂纹（横版 g5ui 同源，竖版画布） ----------
/** 红字节小方块（26×26 + 尾迹鬼影） */
export const ByteGlyphV: React.FC<{x: number; y: number; s?: number; trail?: Array<{x: number; y: number; op: number}>; opacity?: number}> = ({x, y, s = 26, trail = [], opacity = 1}) => (
  <SvgV opacity={opacity}>
    {trail.map((t, i) => (
      <rect key={i} x={t.x - s / 2} y={t.y - s / 2} width={s} height={s} rx={3} fill={RED_DEEP} opacity={t.op * 0.4} />
    ))}
    <rect x={x - s / 2} y={y - s / 2} width={s} height={s} rx={3} fill={RED_DEEP} stroke={WHITE} strokeWidth={1.6} style={{filter: 'drop-shadow(0 0 7px rgba(236,8,31,.9))'}} />
  </SvgV>
);

/** 冲击波环（t0 起、r 8→rMax、len 帧） */
export const ShockRingV: React.FC<{N: number; t0: number; rMax: number; len?: number; cx: number; cy: number; color?: string}> = ({N, t0, rMax, len = 12, cx, cy, color = RED_DEEP}) => {
  if (N < t0) return null;
  const t = clamp01((N - t0) / len);
  if (t >= 1) return null;
  return (
    <SvgV>
      <circle cx={cx} cy={cy} r={8 + (rMax - 8) * easeOutCubic(t)} fill="none" stroke={color} strokeWidth={3 * (1 - t) + 1} opacity={(1 - t) * 0.85} />
    </SvgV>
  );
};

/** 裂纹（锯齿红线 draw-on；点列屏幕坐标） */
export const CrackLineV: React.FC<{pts: Array<[number, number]>; p: number; opacity?: number}> = ({pts, p, opacity = 1}) => {
  if (p <= 0 || opacity <= 0 || pts.length < 2) return null;
  const segs = pts.length - 1;
  const pl = pts.slice(0, Math.max(1, Math.round(segs * clamp01(p))) + 1).map((q) => `${q[0]},${q[1]}`).join(' ');
  return (
    <SvgV opacity={opacity}>
      <polyline points={pl} fill="none" stroke={CORAL} strokeWidth={3.5} strokeLinecap="round" strokeLinejoin="round" style={{filter: 'drop-shadow(0 0 6px rgba(236,8,31,.8))'}} />
    </SvgV>
  );
};

// ---------- SC07：放大镜 / 面单卡 ----------
/** 放大镜（白描边 + 玻璃反光弧 + 45° 手柄），(cx,cy) 为镜片中心 */
export const MagnifierV: React.FC<{cx: number; cy: number; r?: number; opacity?: number; color?: string}> = ({cx, cy, r = 24, opacity = 1, color = WHITE}) => {
  const c = r + 6; // 容器内圆心
  const hw = c + r * 0.72 + 28;
  const hh = c + r * 0.72 + 28;
  return (
    <div style={{...abs(cx - c, cy - c, hw, hh), opacity}}>
      <svg width={hw} height={hh} viewBox={`0 0 ${hw} ${hh}`} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible', filter: BLOOM_SOFT}}>
        <circle cx={c} cy={c} r={r} fill="rgba(0,0,0,0.55)" stroke={color} strokeWidth={3} />
        <path d={`M${c - r * 0.55},${c - r * 0.1} A${r * 0.58} ${r * 0.58} 0 0 1 ${c - r * 0.1},${c - r * 0.55}`} fill="none" stroke={GREY_LIGHT} strokeWidth={2.4} strokeLinecap="round" opacity={0.85} />
        <line x1={c + r * 0.72} y1={c + r * 0.72} x2={c + r * 0.72 + 24} y2={c + r * 0.72 + 24} stroke={color} strokeWidth={5} strokeLinecap="round" />
      </svg>
    </div>
  );
};

/**
 * 面单卡（竖版大卡，SC07 主角）：黑底白边 + 左缘装订圈 + 表头 title + 分隔线 + 4 行字段（permission 行 k 列橙色）。
 * rowOp[i] 为各行显隐进度（0 隐藏；>0 起算 10 帧上浮淡入）；cursorRow 为读取光标所在行（-1 无；白色块光标按 blinkOn 闪烁）。
 */
export const ManifestCardV: React.FC<{
  x: number; y: number; w: number; h: number; title: string;
  rows: Array<{k: string; v: string}>;
  rowsY: number[];
  rowOp: number[];
  cursorRow: number;
  blinkOn: boolean;
  opacity?: number;
  glowK?: number;
}> = ({x, y, w, h, title, rows, rowsY, rowOp, cursorRow, blinkOn, opacity = 1, glowK = 1}) => {
  const kX = 44;
  const vX = 224;
  return (
    <div style={{...abs(x, y, w, h), opacity}}>
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible', filter: `drop-shadow(0 0 3px rgba(255,255,255,${(0.35 * glowK).toFixed(2)}))`}}>
        <path d={`M4,4 H${w - 4} V${h - 4} H4 Z`} fill="#000" stroke={WHITE} strokeWidth={3} strokeLinejoin="round" />
        {rowsY.map((ry, i) => (
          <circle key={i} cx={4} cy={ry - y} r={4.5} fill="#000" stroke={GREY_MID} strokeWidth={1.4} />
        ))}
        <line x1={20} y1={72} x2={w - 20} y2={72} stroke={GREY_LINE} strokeWidth={1.6} />
      </svg>
      <div style={{position: 'absolute', left: 44, top: 36, fontFamily: FONT_MONO, fontSize: 26, color: WHITE, lineHeight: 1, whiteSpace: 'nowrap'}}>{title}</div>
      {rows.map((row, i) => {
        const t = rowOp[i];
        if (t <= 0) {
          // 未揭示行：淡灰虚线占位（结构线，非文字）
          return <div key={i} style={{position: 'absolute', left: kX, top: rowsY[i] - y + 12, width: w - kX - 40, borderTop: `2px dashed ${GREY_LINE}`, opacity: 0.4}} />;
        }
        const e = 1 - Math.pow(1 - clamp01(t), 2.5);
        const isCur = i === cursorRow;
        return (
          <div key={i} style={{position: 'absolute', left: 0, top: rowsY[i] - y - 13, width: w, transform: `translateY(${((1 - e) * 14).toFixed(1)}px)`, opacity: e}}>
            <span style={{position: 'absolute', left: kX, fontFamily: FONT_MONO, fontSize: 26, lineHeight: 1.1, color: row.k === 'permission' ? ORANGE : isCur ? WHITE : GREY, whiteSpace: 'nowrap'}}>{row.k}</span>
            <span style={{position: 'absolute', left: vX, fontFamily: FONT_MONO, fontSize: 26, lineHeight: 1.1, color: WHITE, whiteSpace: 'nowrap'}}>{row.v}</span>
          </div>
        );
      })}
      {cursorRow >= 0 ? (
        <div style={{position: 'absolute', left: 16, top: rowsY[cursorRow] - y - 13, width: 10, height: 27, background: WHITE, opacity: blinkOn ? 0.95 : 0.15, boxShadow: '0 0 8px rgba(255,255,255,.5)'}} />
      ) : null}
    </div>
  );
};

// ---------- SC08：编译齿轮 / 滚动字符行 / dex 卡（横版 g7ui 同源） ----------
const HEXC = '0123456789ABCDEF';
/** 一个字节 token："A4 "（3 个等宽字符），确定性 rnd。 */
export const hexTok = (seed: number, slot: number) =>
  HEXC[Math.floor(rnd(seed, slot) * 16)] + HEXC[Math.floor(rnd(seed, slot, 7) * 16)] + ' ';

/**
 * 滚动字符行：容器 (x,y,w) 裁切；dir=1 内容右行（新字符自左缘进入）。槽位内容由 glyph(slot) 生成（确定性）；
 * 滚动 = 「槽位内容随 j0 换字 + 整行平移 frac×unitPx」，换字与平移互相抵消 → 无缝循环。mono 字宽按 0.6em 估算。
 */
export const TickerRow: React.FC<{
  x: number; y: number; w: number; N: number;
  speed?: number; phase?: number; size?: number; color?: string; opacity?: number;
  unitCh?: number; dir?: 1 | -1; glyph: (slot: number) => string;
}> = ({x, y, w, N, speed = 3.2, phase = 0, size = 24, color, opacity = 1, unitCh = 3, dir = 1, glyph}) => {
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
          fontFamily: FONT_MONO,
          fontSize: size,
          lineHeight: `${size + 8}px`,
          color,
          whiteSpace: 'pre',
          transform: `translateX(${((dir === 1 ? 1 : -1) * frac * unitPx).toFixed(2)}px)`,
        }}
      >
        {toks.join('')}
      </div>
    </div>
  );
};

/** 编译齿轮：外圈 stroke-dasharray draw-on（drawP）+ 10 齿 + 轮毂 + 4 辐条；rot 由调用方持续递增（1.5°/帧）。 */
export const CompileGearV: React.FC<{cx: number; cy: number; r?: number; rot?: number; sw?: number; color?: string; opacity?: number; drawP?: number}> = ({cx, cy, r = 40, rot = 0, sw = 3, color = WHITE, opacity = 1, drawP = 1}) => {
  const pad = 10;
  const c = r + pad;
  const circ = 2 * Math.PI * r;
  const innerOp = clamp01((drawP - 0.25) / 0.6);
  return (
    <div style={{...abs(cx - c, cy - c, 2 * c, 2 * c), opacity}}>
      <svg width={2 * c} height={2 * c} viewBox={`0 0 ${2 * c} ${2 * c}`} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible', filter: BLOOM_SOFT}}>
        <g transform={`rotate(${rot.toFixed(2)} ${c} ${c})`} stroke={color} strokeWidth={sw} fill="#000" strokeLinejoin="round">
          <circle cx={c} cy={c} r={r} strokeDasharray={circ} strokeDashoffset={circ * (1 - clamp01(drawP))} transform={`rotate(-90 ${c} ${c})`} />
          {innerOp > 0 ? (
            <g opacity={innerOp}>
              <circle cx={c} cy={c} r={r * 0.3} />
              {Array.from({length: 10}, (_, i) => (
                <rect key={i} x={c - 5.5} y={pad - 9} width={11} height={13} rx={2} transform={`rotate(${(i * 36).toFixed(1)} ${c} ${c})`} />
              ))}
              {Array.from({length: 4}, (_, i) => {
                const a = ((i * 90 + 45) * Math.PI) / 180;
                return <line key={`s${i}`} x1={c + Math.cos(a) * r * 0.3} y1={c + Math.sin(a) * r * 0.3} x2={c + Math.cos(a) * (r - 2)} y2={c + Math.sin(a) * (r - 2)} />;
              })}
            </g>
          ) : null}
        </g>
      </svg>
    </div>
  );
};

/** classes.dex 卡（竖版 300×160：白边 + 折角 dex 图标 + 标题 + 3 行滚动 hex） */
export const DexFileCardV: React.FC<{x: number; y: number; w?: number; h?: number; N: number; seed?: number; opacity?: number; title?: string}> = ({x, y, w = 300, h = 160, N, seed = 77, opacity = 1, title = 'classes.dex'}) => (
  <div style={{...abs(x, y, w, h), opacity}}>
    <Box x={0} y={0} w={w} h={h} r={10} stroke={WHITE} sw={2.5} fill="rgba(0,0,0,0.9)" />
    <svg width={34} height={42} viewBox="0 0 34 42" style={{position: 'absolute', left: 16, top: 12, filter: BLOOM_SOFT}}>
      <path d="M2,2 H22 L32,12 V40 H2 Z" fill="#000" stroke={WHITE} strokeWidth={2.5} strokeLinejoin="round" />
      <path d="M22,2 V12 H32" fill="none" stroke={WHITE} strokeWidth={2.5} strokeLinejoin="round" />
      <line x1={9} y1={22} x2={25} y2={22} stroke={GREY_MID} strokeWidth={2} />
      <line x1={9} y1={28} x2={25} y2={28} stroke={GREY_MID} strokeWidth={2} />
      <line x1={9} y1={34} x2={18} y2={34} stroke={GREY_MID} strokeWidth={2} />
    </svg>
    <div style={{position: 'absolute', left: 60, top: 18, fontFamily: FONT_MONO, fontSize: 26, color: WHITE, lineHeight: 1}}>{title}</div>
    <TickerRow x={16} y={62} w={w - 32} N={N} speed={2.6} size={24} color={GREY_MID} unitCh={3} dir={1} glyph={(s) => hexTok(seed * 3 + 5, s)} />
    <TickerRow x={16} y={94} w={w - 32} N={N} speed={3.4} size={24} color={GREY_MID} unitCh={3} dir={1} phase={37} glyph={(s) => hexTok(seed * 3 + 6, s)} />
    <TickerRow x={16} y={126} w={w - 32} N={N} speed={2.9} size={24} color={GREY_MID} unitCh={3} dir={1} phase={71} glyph={(s) => hexTok(seed * 3 + 7, s)} />
  </div>
);

/** 打字机辅助：f0 起 perChar 帧/字，返回可见文本与是否完成 */
export const typedText = (text: string, N: number, f0: number, perChar = 1.5) => {
  const shown = Math.max(0, Math.min(text.length, Math.floor((N - f0) / perChar)));
  return {text: text.slice(0, shown), done: shown >= text.length};
};
