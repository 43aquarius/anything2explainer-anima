import React from 'react';
import {clamp01, easeInOutPow, kf, easeOutCubic} from '../../common';
import {MonoText, TechText, PURPLE, PURPLE_LIGHT, WHITE, GREY, GREY_LIGHT, GREY_LINE, abs, softOp} from '../../ui';
import {HeroGlow} from '../../fx';

/**
 * G4 共用：pcap 文件卡（SC20 全尺寸 ↔ SC21 承接缩到左侧，共用同一组件同一 N 驱动状态 → 交界帧像素一致）。
 * 全部状态由绝对帧号 N 驱动（SC20/SC21 各自传入），SC20 末尾 4638–4654 把放大的 #2 行收回到 1.0，
 * 使 4659 交接时卡片处于"常规"姿态，SC21 直接复用。
 */

// ---- 全局节拍（分镜表 SC20 行）----
export const T_CARD = 4313; // 卡片 slideUp（S25 首块 4319 − 6）
export const T_ROWS = 4362; // 三条记录行逐行 wipe
export const T_PCAP = 4415; // `pcap` 紫大字（卡右上角）
export const T_ZOOM = 4485; // #2 行放大 1.35×（S26 首块）
export const T_LBL_A = 4572; // timestamp 标签
export const T_LBL_B = 4584; // length 标签
export const T_LBL_C = 4624; // bytes 标签 + hex 逐格点亮（S26 末块）
export const T_HEX = 4624; // hex 网格起点（4 帧/格，24 格 → 4720 全亮，跨入 SC21 继续）
export const T_UNZOOM = 4638; // #2 行收回 1.0（16 帧，交还承接姿态）
export const T_SCAN = 4375; // 写入扫描条：逐行扫过三行，字节块随之变紫（“lands in a capture file”，14px/帧）

// ---- 卡片几何（SC20 全尺寸基准）----
export const CARD = {x: 400, y: 200, w: 480, h: 360};
const HEADER_Y = 262; // 分隔线
const ROWS = [284, 372, 460]; // 三行 y（行高 76）
const ROW_H = 76;
// #2 行内三段（局部 x，行盒 x 430–850）
const SEG = {
  a: {x: 476, w: 168, label: 'timestamp'},
  b: {x: 652, w: 82, label: 'length'},
  c: {x: 744, w: 106, label: 'bytes'},
};
// hex 网格 6×4（cell 12 + gap 3）
const HEXG = {x: 752, y: 380, cols: 6, rows: 4, cell: 12, gap: 3};

const zoomKf = (N: number) =>
  kf(N, [
    [T_ZOOM, 1],
    [T_ZOOM + 16, 1.35],
    [T_UNZOOM, 1.35],
    [T_UNZOOM + 16, 1],
  ], easeInOutPow(2.5));

/** 已点亮的 hex 格数（4 帧/格；SC20/SC21 共用同一公式） */
export const hexLit = (N: number) => Math.floor(clamp01((N - T_HEX) / 4) * (HEXG.cols * HEXG.rows) * 100) / 100;

/** pcap 文件图标（折角文档 + pcap 标签）：SC22 主角之一；G5 章界承接（分镜表 Ch2→Ch3）同参数复用 */
export const PcapFileIcon: React.FC<{cx: number; cy: number; w?: number; h?: number; opacity?: number; glow?: boolean}> = ({cx, cy, w = 96, h = 120, opacity = 1, glow = false}) => {
  const f = w * 0.3;
  return (
    <div style={{...abs(cx - w / 2, cy - h / 2, w, h), opacity}}>
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible', filter: glow ? 'drop-shadow(0 0 14px rgba(102,48,248,.55))' : 'drop-shadow(0 0 2px rgba(255,255,255,.35))'}}>
        <path d={`M2.5,2.5 H${w - f - 2.5} L${w - 2.5},${f + 2.5} V${h - 2.5} H2.5 Z`} fill="#000" stroke={WHITE} strokeWidth={2.5} strokeLinejoin="round" />
        <path d={`M${w - f - 2.5},2.5 V${f + 2.5} H${w - 2.5}`} fill="none" stroke={WHITE} strokeWidth={2.5} strokeLinejoin="round" />
        {[0, 1, 2].map((i) => <rect key={i} x={w * 0.18} y={h * 0.3 + i * h * 0.14} width={w * 0.5} height={4} fill={GREY} opacity={0.8} />)}
      </svg>
      <TechText cx={w / 2} cy={h * 0.78} text="pcap" fontSize={Math.max(22, w * 0.26)} />
    </div>
  );
};

/** 记录行（#1/#3 灰块行 / #2 三段解剖行）。zoom 只作用于 #2。 */
const RecordRow: React.FC<{N: number; idx: number; zoom: number}> = ({N, idx, zoom}) => {
  const y = ROWS[idx];
  const isMid = idx === 1;
  const dim = isMid ? 1 : kf(N, [[T_ZOOM, 1], [T_ZOOM + 12, 0.3]]); // #1/#3 让位变暗
  const rowOp = softOp(N - (T_ROWS + idx * 2), 8);
  const wipe = easeOutCubic(clamp01((N - (T_ROWS + idx * 2) - 2) / 10));
  if (rowOp <= 0) return null;
  const lit = hexLit(N);
  const lastLit = Math.floor(lit);
  // 写入扫描：行 idx 的扫描窗口 [T_SCAN + idx*30, +30]，扫过字节块变紫（#2 行在放大时由三段接管）
  const scanN = N - (T_SCAN + idx * 30);
  const scanX = 430 + 14 * clamp01(scanN / 30);
  const scanning = scanN > 0 && scanN < 30;
  const midBlocksFade = isMid ? 1 - clamp01((N - T_ZOOM) / 8) : 1; // #2 的占位字节块在放大时让位
  const body = (
    <div style={{...abs(0, 0, CARD.w, ROW_H), opacity: dim}}>
      {/* 扫描条（写入头：紫条 + 光晕，14px/帧横扫） */}
      {scanning ? (
        <div style={{position: 'absolute', left: scanX - CARD.x, top: y - CARD.y + 6, width: 18, height: ROW_H - 12, background: 'rgba(140,90,250,.9)', boxShadow: '0 0 16px 5px rgba(102,48,248,.7)', borderRadius: 3}} />
      ) : null}
      <div style={{...abs(430 - CARD.x, y - CARD.y, 420, ROW_H), overflow: 'hidden', width: 420 * wipe}}>
        {/* 行号 */}
        <MonoText x={438 - CARD.x} y={y - CARD.y + (ROW_H - 26) / 2 - 2} size={24} color={GREY}>#{idx + 1}</MonoText>
        {/* 字节块（扫描过后变紫；#2 行放大前为占位） */}
        {Array.from({length: 9}, (_, k) => {
          const bx = 480 + k * 42;
          const on = scanX > bx + 26;
          return (
            <div key={k} style={{
              position: 'absolute', left: bx - CARD.x, top: y - CARD.y + 25,
              width: 26, height: 26, boxSizing: 'border-box',
              background: on ? PURPLE : '#000',
              border: `1.5px solid ${on ? PURPLE_LIGHT : GREY_LINE}`,
              opacity: (isMid ? midBlocksFade : 1) * (on ? 0.9 : 0.75),
              boxShadow: on ? '0 0 8px 2px rgba(102,48,248,.45)' : undefined,
            }} />
          );
        })}
        {isMid ? (
          <>
            {/* 段 A：timestamp */}
            <div style={{...abs(SEG.a.x - CARD.x, y - CARD.y + 14, SEG.a.w, 46), boxSizing: 'border-box', border: `2px solid ${WHITE}`, borderRadius: 6, background: '#000', opacity: softOp(N - T_ZOOM, 10)}}>
              <MonoText x={SEG.a.x - CARD.x + 10} y={y - CARD.y + 26} size={22} color={WHITE}>{`t = 4.104 s`}</MonoText>
            </div>
            {/* 段 B：length */}
            <div style={{...abs(SEG.b.x - CARD.x, y - CARD.y + 14, SEG.b.w, 46), boxSizing: 'border-box', border: `2px solid ${WHITE}`, borderRadius: 6, background: '#000', opacity: softOp(N - T_ZOOM, 10)}}>
              <MonoText x={SEG.b.x - CARD.x + 10} y={y - CARD.y + 26} size={22} color={WHITE}>{`len 57`}</MonoText>
            </div>
            {/* 段 C：hex 网格 */}
            <div style={{...abs(SEG.c.x - CARD.x, y - CARD.y + 8, SEG.c.w, 58), opacity: softOp(N - T_ZOOM, 10)}}>
              {Array.from({length: HEXG.cols * HEXG.rows}, (_, k) => {
                const c = k % HEXG.cols, r = Math.floor(k / HEXG.cols);
                const on = k < lit;
                const last = k === lastLit - 1 && N - T_HEX - 4 * k < 10;
                return (
                  <div key={k} style={{
                    position: 'absolute',
                    left: c * (HEXG.cell + HEXG.gap),
                    top: r * (HEXG.cell + HEXG.gap),
                    width: HEXG.cell, height: HEXG.cell,
                    boxSizing: 'border-box',
                    background: on ? PURPLE : '#000',
                    border: `1.5px solid ${last ? WHITE : on ? PURPLE_LIGHT : GREY_LINE}`,
                    opacity: on ? 0.95 : 0.6,
                    boxShadow: last ? '0 0 8px 2px rgba(102,48,248,.8)' : undefined,
                  }} />
                );
              })}
            </div>
            {/* 三段标签（Pill 风，随行缩放） */}
            {(['a', 'b', 'c'] as const).map((key, i) => {
              const t = [T_LBL_A, T_LBL_B, T_LBL_C][i];
              const s = SEG[key];
              return (
                <div key={key} style={{...abs(s.x - CARD.x, y - CARD.y - 16, s.w, 26), opacity: softOp(N - t, 8) * 0.95, display: 'flex', justifyContent: 'center'}}>
                  <span style={{fontFamily: "'Exo 2',sans-serif", fontStyle: 'italic', fontSize: 22, color: GREY_LIGHT, lineHeight: '26px', whiteSpace: 'nowrap'}}>{s.label}</span>
                </div>
              );
            })}
          </>
        ) : null}
      </div>
    </div>
  );
  if (!isMid) return body;
  // #2：绕行中心 (640, y+38) 缩放
  return (
    <div style={{position: 'absolute', inset: 0, transformOrigin: `${640 - CARD.x}px ${y - CARD.y + ROW_H / 2}px`, transform: zoom === 1 ? undefined : `scale(${zoom.toFixed(4)})`}}>
      {body}
    </div>
  );
};

/** pcap 文件卡（SC20 基准几何；SC21 外层做承接位移/缩放） */
export const PcapFileCard: React.FC<{N: number; opacity?: number}> = ({N, opacity = 1}) => {
  const cn = N - T_CARD;
  if (cn < 0) return null;
  const zoom = zoomKf(N);
  const t = clamp01(cn / 22);
  const cardOp = Math.min(1, 0.35 + 0.65 * t);
  const cardY = CARD.y + 100 * Math.pow(1 - t, 2.5); // slideUp Δ100/22
  const pcapOp = softOp(N - T_PCAP, 10);
  return (
    <div style={{...abs(CARD.x, cardY, CARD.w, CARD.h), opacity: opacity * cardOp}}>
      {/* 主角光：卡片紫柔光呼吸 30 帧 ±15% */}
      <HeroGlow x={-8} y={-8} w={CARD.w + 16} h={CARD.h + 16} r={14} N={N} k={0.9} />
      {/* 折角文档外框 */}
      <svg width={CARD.w} height={CARD.h} viewBox={`0 0 ${CARD.w} ${CARD.h}`} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible', filter: 'drop-shadow(0 0 2px rgba(255,255,255,.35))'}}>
        <path d={`M2.5,2.5 H${CARD.w - 60.5} L${CARD.w - 2.5},${60.5} V${CARD.h - 2.5} H2.5 Z`} fill="#000" stroke={WHITE} strokeWidth={2.5} strokeLinejoin="round" />
        <path d={`M${CARD.w - 60.5},2.5 V${60.5} H${CARD.w - 2.5}`} fill="none" stroke={WHITE} strokeWidth={2.5} strokeLinejoin="round" />
      </svg>
      {/* 文件名 + pcap 大字 */}
      <MonoText x={26} y={20} size={26} color={WHITE}>capture.pcap</MonoText>
      <div style={{position: 'absolute', left: 0, top: 0, opacity: pcapOp}}>
        <TechText cx={CARD.w - 92} cy={52} text="pcap" fontSize={44} />
      </div>
      {/* 头部分隔线 */}
      <div style={{...abs(24, HEADER_Y - CARD.y - 6, CARD.w - 48, 2), background: GREY_LINE}} />
      {/* 三条记录行 */}
      {[0, 1, 2].map((i) => <RecordRow key={i} N={N} idx={i} zoom={zoom} />)}
    </div>
  );
};

/** SC21 承接插值：SC20 末姿态（中心 640,380 s1.05 慢推末值）→ 左侧（中心 330,380 s0.62），16 帧 */
export const handoffKf = (N: number) => {
  const t = kf(N, [[4659, 0], [4675, 1]], easeInOutPow(2.5));
  return {t, cx: 640 + (330 - 640) * t, cy: 380, s: 1.05 + (0.62 - 1.05) * t};
};

export const hexLitCount = HEXG.cols * HEXG.rows;
