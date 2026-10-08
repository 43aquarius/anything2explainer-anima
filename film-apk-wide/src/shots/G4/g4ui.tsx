import React from 'react';
import {clamp01, easeOutCubic} from '../../common';
import {CText, PURPLE, PURPLE_LIGHT, WHITE, GREY, GREY_LINE, GREY_MID, GREY_LIGHT, BLOOM_SOFT, abs} from '../../ui';

/**
 * G4 组共用图元（第 2 章下半：SC16–SC25）。
 * 全部纯函数（动画量由调用方按 N 算好传入）；随机只用 rnd（本文件不需要）。
 * ZIP 结构图三镜头（SC17 全幅 → SC18 0.55× 上方 → SC19 0.4× 左侧）共用同一套世界坐标 DIAG，
 * 保证承接镜头里几何一致（agent-build-rules §3「承接」）。
 */

// ---------- ZIP 结构图几何（世界坐标，全幅态） ----------
/** 三枚文件条目块（竖排，右缘对齐 x=240，索引树叶子） */
export const DIAG = {
  blocks: [
    {x: 150, y: 240, w: 90, h: 65}, // block1 = AndroidManifest.xml（SC18/SC19 取出/命中的那一枚）
    {x: 150, y: 317, w: 90, h: 65},
    {x: 150, y: 394, w: 90, h: 65},
  ],
  label: {cx: 195, cy: 487}, // 'local file headers'
  card: {x: 600, y: 230, w: 250, h: 150}, // 中央目录卡
  eocd: {x: 1060, y: 275, w: 110, h: 60}, // EOCD 条
  flag: {x: 1168, y: 275}, // 尾端小旗
  conn: {x0: 850, x1: 1060, y: 305}, // 目录—EOCD 点线
  lines: [ // 目录卡左缘 → 各块右缘 的索引引线
    {x0: 600, y0: 262, x1: 240, y1: 272},
    {x0: 600, y0: 305, x1: 240, y1: 349},
    {x0: 600, y0: 348, x1: 240, y1: 426},
  ],
  caption: {cx: 1090, cy: 372}, // 'where everything is'
  center: {x: 646, y: 357}, // 包围盒中心（缩放基准）
};

/** 文件条目块：黑底白边 + 3 行灰线（被动样式；高亮/发光由调用方包 wrapper） */
export const FileEntryBlock: React.FC<{x: number; y: number; w?: number; h?: number; dim?: number; opacity?: number; stroke?: string}> = ({x, y, w = 90, h = 65, dim = 0, opacity = 1, stroke = WHITE}) => (
  <div style={{...abs(x, y, w, h), opacity}}>
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible', filter: BLOOM_SOFT}}>
      <rect x={1.25} y={1.25} width={w - 2.5} height={h - 2.5} rx={6} fill="#000" stroke={dim > 0.5 ? GREY_MID : stroke} strokeWidth={2.5} opacity={1 - dim * 0.55} />
      {[0, 1, 2].map((i) => (
        <rect key={i} x={13} y={15 + i * 17} width={i === 2 ? w * 0.52 : w * 0.66} height={3} rx={1.5} fill={GREY_LINE} opacity={0.9 - dim * 0.5} />
      ))}
    </svg>
  </div>
);

/** 中央目录卡：白边卡 + 表头 + 3 行目录行 + 右缘页签 */
export const DirectoryCard: React.FC<{x: number; y: number; w?: number; h?: number; showLabel?: boolean; opacity?: number; tabP?: number}> = ({x, y, w = 250, h = 150, showLabel = true, opacity = 1, tabP = 1}) => (
  <div style={{...abs(x, y, w, h), opacity}}>
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible', filter: BLOOM_SOFT}}>
      <rect x={1.25} y={1.25} width={w - 2.5} height={h - 2.5} rx={8} fill="#000" stroke={WHITE} strokeWidth={2.5} />
      {[0, 1, 2].map((i) => {
        const ty = 44 + i * 34;
        return (
          <g key={i}>
            <circle cx={16} cy={ty + 6} r={3} fill={GREY_MID} />
            <rect x={26} y={ty} width={w * (i === 2 ? 0.42 : 0.6)} height={3} rx={1.5} fill={GREY_LIGHT} opacity={0.85} />
            <rect x={26 + w * 0.62} y={ty + 0.5} width={26} height={2.5} rx={1.2} fill={GREY_LINE} />
          </g>
        );
      })}
      <line x1={12} y1={36} x2={w - 12} y2={36} stroke={GREY_LINE} strokeWidth={1.5} />
      {/* 右缘页签（索引页签）：tabP 逐个弹出 */}
      {[0, 1, 2].map((i) => {
        const p = clamp01((tabP - i) / 0.34);
        if (p <= 0) return null;
        return <rect key={`t${i}`} x={w - 1} y={44 + i * 34} width={10 + 8 * p} height={11} rx={2} fill="#000" stroke={PURPLE_LIGHT} strokeWidth={1.8} opacity={0.55 + 0.45 * p} />;
      })}
    </svg>
    {showLabel ? <CText cx={w / 2} cy={18} size={22} weight={700} family="'SF Mono', Menlo, Consolas, monospace" color={WHITE} dy={0}>central directory</CText> : null}
  </div>
);

/** EOCD 条：小卡 + 内标（labels=false 时略去文字，缩影态不出现不可读小字） */
export const EocdStrip: React.FC<{x: number; y: number; w?: number; h?: number; showLabel?: boolean; opacity?: number; flash?: number}> = ({x, y, w = 110, h = 60, showLabel = true, opacity = 1, flash = 0}) => {
  const c = flash > 0 ? PURPLE_LIGHT : WHITE;
  return (
    <div style={{...abs(x, y, w, h), opacity}}>
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible', filter: flash > 0 ? 'drop-shadow(0 0 8px rgba(161,117,241,.9))' : BLOOM_SOFT}}>
        <rect x={1.25} y={1.25} width={w - 2.5} height={h - 2.5} rx={6} fill="#000" stroke={c} strokeWidth={2.5} />
        <line x1={10} y1={h - 16} x2={w - 10} y2={h - 16} stroke={GREY_LINE} strokeWidth={1.5} />
      </svg>
      {showLabel ? <CText cx={w / 2} cy={h / 2 - 6} size={22} weight={700} family="'SF Mono', Menlo, Consolas, monospace" color={WHITE} dy={0}>EOCD</CText> : null}
    </div>
  );
};

/** 引线上的巡行紫点（索引被读取的暗示；N 驱动，沿线往返单向流动） */
export const LineDot: React.FC<{x0: number; y0: number; x1: number; y1: number; t: number; r?: number; color?: string; opacity?: number}> = ({x0, y0, x1, y1, t, r = 2.6, color = PURPLE_LIGHT, opacity = 1}) => (
  <circle cx={x0 + (x1 - x0) * clamp01(t)} cy={y0 + (y1 - y0) * clamp01(t)} r={r} fill={color} opacity={opacity} />
);

/**
 * ZIP 结构图（终态，承接用）：SC18（0.55× 上方）/ SC19（0.4× 左侧）。
 * labels=false 时隐藏内部小字（缩小后不可读，只留图形），小旗/页签/引线齐全；
 * dots 按 N 沿三条引线巡行（持续动作）；dimOthers>0 时把 block1 以外的文件块压灰（SC19 目标点亮时的对照）。
 */
export const ZipDiagramFinal: React.FC<{N: number; cx: number; cy: number; scale: number; opacity?: number; labels?: boolean; dotFrom?: number; hideFirst?: boolean; dimOthers?: number}> = ({N, cx, cy, scale, opacity = 1, labels = false, dotFrom = 0, hideFirst = false, dimOthers = 0}) => {
  const t = (i: number) => clamp01((((N - dotFrom) * 0.016 + i * 0.37) % 1 + 1) % 1);
  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        top: 0,
        width: 1280,
        height: 720,
        transformOrigin: '0 0',
        transform: `translate(${(cx - DIAG.center.x * scale).toFixed(2)}px, ${(cy - DIAG.center.y * scale).toFixed(2)}px) scale(${scale})`,
        opacity,
      }}
    >
      {DIAG.blocks.map((b, i) => (hideFirst && i === 0 ? null : (
        <FileEntryBlock key={i} x={b.x} y={b.y} w={b.w} h={b.h} dim={i > 0 ? dimOthers : 0} />
      )))}
      {labels ? <CText cx={DIAG.label.cx} cy={DIAG.label.cy} size={22} weight={600} family="'SF Mono', Menlo, Consolas, monospace" color={GREY} dy={0}>local file headers</CText> : null}
      <DirectoryCard x={DIAG.card.x} y={DIAG.card.y} w={DIAG.card.w} h={DIAG.card.h} showLabel={labels} />
      <EocdStrip x={DIAG.eocd.x} y={DIAG.eocd.y} w={DIAG.eocd.w} h={DIAG.eocd.h} showLabel={labels} />
      <svg width={1280} height={720} viewBox="0 0 1280 720" style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
        {/* 引线（目录 → 各文件块） */}
        {DIAG.lines.map((l, i) => (
          <line key={i} x1={l.x0} y1={l.y0} x2={l.x1} y2={l.y1} stroke={GREY_MID} strokeWidth={1.6} />
        ))}
        {/* 巡行紫点（每线 1 枚 + 半程错位 1 枚） */}
        {DIAG.lines.map((l, i) => (
          <React.Fragment key={`d${i}`}>
            <LineDot x0={l.x0} y0={l.y0} x1={l.x1} y1={l.y1} t={t(i)} r={2.8} />
            <LineDot x0={l.x0} y0={l.y0} x1={l.x1} y1={l.y1} t={(t(i) + 0.5) % 1} r={2.2} opacity={0.75} />
          </React.Fragment>
        ))}
        {/* 目录—EOCD 点线 */}
        <line x1={DIAG.conn.x0} y1={DIAG.conn.y} x2={DIAG.conn.x1} y2={DIAG.conn.y} stroke={GREY_MID} strokeWidth={1.6} strokeDasharray="6 6" />
        {/* 尾端小旗 */}
        <g>
          <line x1={DIAG.flag.x} y1={DIAG.flag.y} x2={DIAG.flag.x} y2={DIAG.flag.y - 26} stroke={WHITE} strokeWidth={2.5} strokeLinecap="round" />
          <polygon points={`${DIAG.flag.x},${DIAG.flag.y - 26} ${DIAG.flag.x + 20},${DIAG.flag.y - 20} ${DIAG.flag.x},${DIAG.flag.y - 14}`} fill="#000" stroke={PURPLE_LIGHT} strokeWidth={1.8} />
        </g>
      </svg>
    </div>
  );
};

/** 放大镜（SC18 捞文件块）：镜头圆 + 手柄 + 内侧高光弧 */
export const Magnifier: React.FC<{cx: number; cy: number; r?: number; opacity?: number; glow?: boolean}> = ({cx, cy, r = 42, opacity = 1, glow = false}) => (
  <svg width={1280} height={720} viewBox="0 0 1280 720" style={{position: 'absolute', left: 0, top: 0, overflow: 'visible', opacity, pointerEvents: 'none'}}>
    <g style={{filter: glow ? 'drop-shadow(0 0 10px rgba(161,117,241,.85))' : 'drop-shadow(0 0 2px rgba(255,255,255,.35))'}}>
      <line x1={cx + r * 0.72} y1={cy + r * 0.72} x2={cx + r * 1.55} y2={cy + r * 1.55} stroke={WHITE} strokeWidth={7} strokeLinecap="round" />
      <circle cx={cx} cy={cy} r={r} fill="rgba(255,255,255,0.05)" stroke={WHITE} strokeWidth={3.5} />
      <path d={`M ${cx - r * 0.55} ${cy - r * 0.5} A ${r * 0.75} ${r * 0.75} 0 0 1 ${cx + r * 0.1} ${cy - r * 0.72}`} fill="none" stroke={GREY_LIGHT} strokeWidth={2.5} strokeLinecap="round" opacity={0.8} />
    </g>
  </svg>
);

// ---------- SC20 工具图标（7 枚白线条简笔，中心对齐 (cx,cy)，≈52px） ----------
export const ToolIcon: React.FC<{i: number; cx: number; cy: number; lit?: number; opacity?: number}> = ({i, cx, cy, lit = 0, opacity = 1}) => {
  const col = lit > 0.5 ? WHITE : GREY;
  const op = lit > 0.5 ? 0.9 : 0.38;
  const S = {stroke: col, fill: 'none', strokeWidth: 2.5, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const};
  const flash = lit > 0 && lit < 1 ? 1 + 0.5 * Math.sin(Math.PI * lit) : 1; // 点亮瞬间的白闪（外发光近似）
  return (
    <svg width={1280} height={720} viewBox="0 0 1280 720" style={{position: 'absolute', left: 0, top: 0, overflow: 'visible', opacity, pointerEvents: 'none'}}>
      <g transform={`translate(${cx} ${cy})`} style={{filter: lit > 0.5 ? `drop-shadow(0 0 ${6 * flash}px rgba(255,255,255,.75))` : undefined}} opacity={op}>
        {i === 0 ? ( // zip：小包裹 + 拉链齿（复用 ParcelIcon 语言）
          <g>
            <rect x={-24} y={-17} width={48} height={34} rx={3} fill="#000" stroke={col} strokeWidth={2.5} />
            {[-9, 0, 9].map((ty) => <rect key={ty} x={-4} y={ty - 2.5} width={8} height={5} fill={col} stroke="none" />)}
          </g>
        ) : i === 1 ? ( // 软盘
          <g>
            <rect x={-22} y={-22} width={44} height={44} rx={2} fill="#000" stroke={col} strokeWidth={2.5} />
            <path d="M 8 -22 V -8 H 22" fill="none" stroke={col} strokeWidth={2} />
            <rect x={-13} y={2} width={26} height={16} fill="#000" stroke={col} strokeWidth={2} />
            <line x1={-8} y1={7} x2={8} y2={7} stroke={col} strokeWidth={2} />
          </g>
        ) : i === 2 ? ( // 光驱 / 光盘
          <g>
            <circle cx={0} cy={0} r={22} fill="#000" stroke={col} strokeWidth={2.5} />
            <circle cx={0} cy={0} r={6.5} fill="#000" stroke={col} strokeWidth={2.5} />
            <path d="M -14 -16 A 22 22 0 0 1 4 -21.7" fill="none" stroke={col} strokeWidth={2} opacity={0.85} />
          </g>
        ) : i === 3 ? ( // 终端
          <g>
            <rect x={-24} y={-17} width={48} height={34} rx={4} fill="#000" stroke={col} strokeWidth={2.5} />
            <path d="M -15 -6 L -8 0 L -15 6" fill="none" stroke={col} strokeWidth={2.5} />
            <line x1={-3} y1={7} x2={12} y2={7} stroke={col} strokeWidth={2.5} />
          </g>
        ) : i === 4 ? ( // 压缩器：两侧箭头压向中间方块
          <g>
            <rect x={-8} y={-11} width={16} height={22} rx={2} fill="#000" stroke={col} strokeWidth={2.5} />
            <path d="M -24 -8 H -14 M -19 -12 L -13 -8 L -19 -4" fill="none" stroke={col} strokeWidth={2.2} />
            <path d="M 24 -8 H 14 M 19 -12 L 13 -8 L 19 -4" fill="none" stroke={col} strokeWidth={2.2} />
            <path d="M -24 8 H -14 M -19 4 L -13 8 L -19 12" fill="none" stroke={col} strokeWidth={2.2} transform="translate(0 0)" />
            <path d="M 24 8 H 14 M 19 4 L 13 8 L 19 12" fill="none" stroke={col} strokeWidth={2.2} />
          </g>
        ) : i === 5 ? ( // 罐头（jar/can）
          <g>
            <rect x={-15} y={-14} width={30} height={34} rx={4} fill="#000" stroke={col} strokeWidth={2.5} />
            <ellipse cx={0} cy={-14} rx={15} ry={4.5} fill="#000" stroke={col} strokeWidth={2.2} />
            <rect x={-11} y={-24} width={22} height={7} rx={2} fill="#000" stroke={col} strokeWidth={2.2} />
            <line x1={-9} y1={2} x2={9} y2={2} stroke={col} strokeWidth={2} opacity={0.8} />
            <line x1={-9} y1={8} x2={5} y2={8} stroke={col} strokeWidth={2} opacity={0.8} />
          </g>
        ) : ( // 扳手
          <g>
            <path d="M 14 -20 A 10.5 10.5 0 1 0 20 -6 L 2 12 L -4 6 L 14 -12 Z" fill="#000" stroke={col} strokeWidth={2.4} transform="rotate(-18)" />
            <line x1={-2} y1={10} x2={-17} y2={25} stroke={col} strokeWidth={5.5} strokeLinecap="round" />
          </g>
        )}
      </g>
    </svg>
  );
};

// ---------- SC21 咖啡杯 + 热气 ----------
export const CoffeeCup: React.FC<{cx: number; cy: number; N: number; opacity?: number}> = ({cx, cy, N, opacity = 1}) => {
  // 两缕热气：每缕 2 枚小点循环上升 1px/帧，顶部渐隐
  const steam = (sx: number) =>
    [0, 1].map((k) => {
      const ph = ((N + k * 24 + (sx > 0 ? 11 : 0)) % 48) / 48;
      const y = -34 - ph * 34;
      const o = Math.sin(Math.PI * ph) * 0.65;
      return <circle key={`${sx}-${k}`} cx={cx + sx + Math.sin((N + k * 12) * 0.3 + sx) * 2.5} cy={cy + y} r={2.6} fill={GREY_LIGHT} opacity={o} />;
    });
  return (
    <div style={{...abs(cx - 70, cy - 70, 140, 150), opacity}}>
      <svg width={140} height={150} viewBox="0 0 140 150" style={{position: 'absolute', left: 0, top: 0, overflow: 'visible', filter: BLOOM_SOFT}}>
        <g transform="translate(35 42)">
          {steam(28)}
          {steam(52)}
          {/* 杯身 + 杯口 */}
          <path d="M 8 22 H 66 L 60 74 Q 37 82 14 74 Z" fill="#000" stroke={WHITE} strokeWidth={2.8} strokeLinejoin="round" />
          <ellipse cx={37} cy={22} rx={29} ry={7} fill="#000" stroke={WHITE} strokeWidth={2.8} />
          {/* 杯柄 */}
          <path d="M 66 32 Q 86 36 82 52 Q 78 66 62 64" fill="none" stroke={WHITE} strokeWidth={2.8} />
          {/* 杯碟 */}
          <path d="M 6 84 H 68" stroke={WHITE} strokeWidth={2.8} strokeLinecap="round" />
          {/* 杯面液体线 */}
          <path d="M 16 26 Q 37 33 58 26" fill="none" stroke={GREY_MID} strokeWidth={2} opacity={0.9} />
        </g>
      </svg>
    </div>
  );
};

// ---------- SC21 JAR 罐（盖可旋开） ----------
export const JarGlyph: React.FC<{cx: number; cy: number; lidA?: number; opacity?: number; children?: React.ReactNode}> = ({cx, cy, lidA = 0, opacity = 1, children}) => (
  <div style={{...abs(cx - 60, cy - 75, 120, 160), opacity}}>
    <svg width={120} height={160} viewBox="0 0 120 160" style={{position: 'absolute', left: 0, top: 0, overflow: 'visible', filter: BLOOM_SOFT}}>
      {/* 罐盖（lidA 0→1 旋开 25°） */}
      <g transform={`rotate(${(-lidA * 25).toFixed(1)} 60 18)`}>
        <rect x={30} y={8} width={60} height={16} rx={4} fill="#000" stroke={WHITE} strokeWidth={2.8} />
        <line x1={38} y1={16} x2={82} y2={16} stroke={GREY_MID} strokeWidth={2} />
      </g>
      {/* 罐颈 + 罐身 */}
      <path d="M 40 24 H 80 V 34 Q 94 40 94 54 V 128 Q 94 144 78 146 H 42 Q 26 144 26 128 V 54 Q 26 40 40 34 Z" fill="#000" stroke={WHITE} strokeWidth={2.8} strokeLinejoin="round" />
      {/* 玻璃高光 */}
      <path d="M 36 52 Q 33 90 36 126" fill="none" stroke={GREY_MID} strokeWidth={2} opacity={0.9} />
    </svg>
    {children}
  </div>
);

// ---------- SC22 灯泡 ----------
export const BulbGlyph: React.FC<{cx: number; cy: number; flash?: number; opacity?: number}> = ({cx, cy, flash = 0, opacity = 1}) => {
  const f = clamp01(flash);
  const col = f > 0 ? WHITE : GREY_LIGHT;
  return (
    <svg width={1280} height={720} viewBox="0 0 1280 720" style={{position: 'absolute', left: 0, top: 0, overflow: 'visible', opacity, pointerEvents: 'none'}}>
      <g style={{filter: f > 0 ? `drop-shadow(0 0 ${8 + 10 * f}px rgba(255,255,255,.9))` : undefined}}>
        <circle cx={cx} cy={cy} r={15} fill="#000" stroke={col} strokeWidth={2.6} />
        <path d={`M ${cx - 6} ${cy + 3} L ${cx - 2} ${cy - 3} L ${cx + 2} ${cy + 3} L ${cx + 6} ${cy - 3}`} fill="none" stroke={col} strokeWidth={1.8} />
        <rect x={cx - 7} y={cy + 15} width={14} height={8} rx={2} fill="#000" stroke={col} strokeWidth={2.2} />
        {/* 闪亮光线 */}
        {f > 0.05
          ? [[-1, -1], [0, -1], [1, -1], [-1, 0], [1, 0], [-1, 1], [0, 1], [1, 1]].map(([dx, dy], i) => {
              const a = Math.atan2(dy, dx);
              const r0 = 24 + 4 * f;
              return <line key={i} x1={cx + Math.cos(a) * r0} y1={cy + Math.sin(a) * r0} x2={cx + Math.cos(a) * (r0 + 9 * f)} y2={cy + Math.sin(a) * (r0 + 9 * f)} stroke={WHITE} strokeWidth={2.4} strokeLinecap="round" opacity={f} />;
            })
          : null}
      </g>
    </svg>
  );
};

// ---------- SC16/SC23 手风琴褶皱卡（"压缩"） ----------
/** 褶皱卡：w 动画（压缩态窄 → 展开）；pleats 条竖折 */
export const AccordionCard: React.FC<{cx: number; cy: number; w: number; h?: number; color?: string; opacity?: number}> = ({cx, cy, w, h = 160, color = WHITE, opacity = 1}) => {
  const W = Math.max(60, w);
  const n = 5;
  const topPts: string[] = [];
  const botPts: string[] = [];
  for (let i = 0; i <= n; i++) {
    const px = (W * i) / n;
    const dy = i % 2 === 0 ? 0 : 14;
    topPts.push(`${px.toFixed(1)},${dy}`);
    botPts.push(`${px.toFixed(1)},${h - dy}`);
  }
  return (
    <div style={{...abs(cx - W / 2, cy - h / 2, W, h), opacity}}>
      <svg width={W} height={h} viewBox={`0 0 ${W} ${h}`} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible', filter: BLOOM_SOFT}}>
        {/* 顶/底锯齿折边（褶皱） */}
        <polyline points={topPts.join(' ')} fill="none" stroke={color} strokeWidth={2.5} strokeLinejoin="round" />
        <polyline points={botPts.join(' ')} fill="none" stroke={color} strokeWidth={2.5} strokeLinejoin="round" />
        {/* 主体竖折面 */}
        {[1, 2, 3, 4].map((i) => (
          <line key={i} x1={(W * i) / 5} y1={i % 2 === 0 ? 8 : 20} x2={(W * i) / 5} y2={i % 2 === 0 ? h - 8 : h - 20} stroke={color} strokeWidth={1.6} opacity={0.55} />
        ))}
        <line x1={0} y1={h / 2} x2={W} y2={h / 2} stroke={GREY_LINE} strokeWidth={1.6} opacity={0.7} />
      </svg>
    </div>
  );
};

// ---------- SC23 文件块（DEFLATED 带褶 / STORED 平直） ----------
export const EntryFile: React.FC<{x: number; y: number; w: number; h?: number; pleat?: number; color?: string; opacity?: number}> = ({x, y, w, h = 160, pleat = 0, color = WHITE, opacity = 1}) => {
  const W = Math.max(120, w);
  return (
    <div style={{...abs(x, y, W, h), opacity}}>
      <svg width={W} height={h} viewBox={`0 0 ${W} ${h}`} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible', filter: BLOOM_SOFT}}>
        <rect x={1.25} y={1.25} width={W - 2.5} height={h - 2.5} rx={8} fill="#000" stroke={color} strokeWidth={2.8} />
        {/* 内容行：pleat>0 时行随褶皱错位（压缩感） */}
        {[0, 1, 2, 3].map((i) => {
          const ly = 22 + i * 32;
          const off = pleat > 0 ? Math.sin(i * 2.1) * 7 * pleat : 0;
          const lw = (W - 44) * (i === 3 ? 0.55 : 0.92 - 0.14 * ((i * 7) % 3));
          return (
            <g key={i}>
              <rect x={22 + off} y={ly} width={lw * (1 - 0.18 * pleat)} height={4} rx={2} fill={i === 0 && pleat > 0 ? color : GREY_LIGHT} opacity={pleat > 0 ? 0.75 : 0.9} />
            </g>
          );
        })}
        {/* 竖褶（DEFLATED） */}
        {pleat > 0
          ? [1, 2, 3].map((i) => <path key={i} d={`M ${22 + i * ((W - 44) / 4)} 16 q ${4 * pleat} ${h / 2 - 16} 0 ${h - 32}`} fill="none" stroke={color} strokeWidth={1.4} opacity={0.4} />)
          : null}
      </svg>
    </div>
  );
};

// ---------- SC24 字节网格带 ----------
/** 24 列 × rows 行字节格；右 12 列 = resources.arsc 段（紫）；每 4 列加强竖线 */
export const ByteGrid: React.FC<{N: number; f0: number; litFrom: number; rows?: number; x?: number; y?: number; cellW?: number; cellH?: number; cols?: number; opacity?: number}> = ({N, f0, litFrom, rows = 4, x = 160, y = 360, cellW = 40, cellH = 34, cols = 24, opacity = 1}) => {
  const appear = (c: number) => clamp01((N - (f0 + c * 2)) / 3); // 每列 2 帧，3 帧淡入
  const arsc0 = cols / 2;
  return (
    <div style={{...abs(x, y, cols * cellW, rows * cellH), opacity}}>
      <svg width={cols * cellW} height={rows * cellH} viewBox={`0 0 ${cols * cellW} ${rows * cellH}`} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
        {Array.from({length: cols}, (_, c) => {
          const a = appear(c);
          if (a <= 0) return null;
          const arsc = c >= arsc0;
          return (
            <g key={c} opacity={a}>
              <rect x={c * cellW + 2} y={2} width={cellW - 4} height={rows * cellH - 4} fill={arsc ? 'rgba(102,48,248,0.30)' : 'rgba(255,255,255,0.03)'} stroke={arsc ? PURPLE_LIGHT : GREY_LINE} strokeWidth={1.2} rx={3} />
              {arsc ? <rect x={c * cellW + 2} y={2} width={cellW - 4} height={rows * cellH - 4} fill={PURPLE} rx={3} opacity={0.16 * a} /> : null}
            </g>
          );
        })}
      </svg>
    </div>
  );
};

/** 4 字节边界加强竖线（每 4 列一条，自顶 draw-on） */
export const BoundaryLines: React.FC<{N: number; f0: number; x?: number; y?: number; w?: number; h?: number; cols?: number; opacity?: number}> = ({N, f0, x = 160, y = 356, w = 960, h = 140, cols = 24, opacity = 1}) => {
  const H = h;
  return (
    <svg width={1280} height={720} viewBox="0 0 1280 720" style={{position: 'absolute', left: 0, top: 0, overflow: 'visible', opacity, pointerEvents: 'none'}}>
      {Array.from({length: cols / 4 + 1}, (_, k) => {
        const p = clamp01((N - (f0 + k * 4)) / 6);
        if (p <= 0) return null;
        const bx = x + k * 4 * (w / cols);
        return (
          <g key={k} style={{filter: 'drop-shadow(0 0 5px rgba(161,117,241,.8))'}}>
            <line x1={bx} y1={y} x2={bx} y2={y + H * easeOutCubic(p)} stroke={PURPLE_LIGHT} strokeWidth={k % 3 === 0 ? 2.6 : 1.8} />
          </g>
        );
      })}
    </svg>
  );
};

/** 小工具：draw-on 直线（dashoffset） */
export const DrawLine: React.FC<{x0: number; y0: number; x1: number; y1: number; p?: number; w?: number; color?: string; dashed?: boolean; opacity?: number}> = ({x0, y0, x1, y1, p = 1, w = 1.6, color = GREY_MID, dashed = false, opacity = 1}) => {
  const L = Math.hypot(x1 - x0, y1 - y0);
  return <line x1={x0} y1={y0} x2={x1} y2={y1} stroke={color} strokeWidth={w} strokeDasharray={dashed ? '6 6' : `${L}`} strokeDashoffset={dashed ? undefined : L * (1 - clamp01(p))} opacity={opacity} />;
};

/** 打字机文本进度（每 2 帧 1 字） */
export const typeN = (N: number, f0: number, chars: number) => Math.max(0, Math.min(chars, Math.floor((N - f0) / 2) + 1));
