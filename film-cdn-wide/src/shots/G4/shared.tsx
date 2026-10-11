import React from 'react';
import {GREY_LINE, PURPLE_LIGHT, WHITE, abs} from '../../ui';

/**
 * G4 共用（第 3 章：S13–S15）。原 shared.tsx 是 pcap 片模板残留（SC20/SC21 文件卡），已整体替换。
 * - BEATS：三句的字幕块起始帧（timeline.md 实测块界，S15 与分镜表节拍列有一块偏移，以此为准）
 * - G4Shelf：无文字缩微货架（CacheShelf 的 0.5× 呼应件；ui.tsx CacheShelf 自带 24px "edge cache"
 *   头部文字，缩小后会低于最小字号 → 配角尺寸用本组件，主尺度货架仍用 ui.tsx CacheShelf 保持全片一致）
 */

/** 字幕块起始帧（= 各镜头部拍的权威帧号；元素入场 −6…+3 对齐这里） */
export const BEATS = {
  S13: [1958, 2043, 2099],
  S14: [2133, 2166, 2225, 2288, 2354],
  S15: [2404, 2459, 2507, 2598, 2626],
};

/** 二次贝塞尔取点（信封弧线 / 海弧 / 近线共用） */
export const quadPt = (t: number, p0: [number, number], p1: [number, number], p2: [number, number]): [number, number] => {
  const u = 1 - t;
  return [u * u * p0[0] + 2 * u * t * p1[0] + t * t * p2[0], u * u * p0[1] + 2 * u * t * p1[1] + t * t * p2[1]];
};

/** 缩微货架（配角 60–110 档）：外框 + 两块隔板 + 3×2 内容格；lit → 中格紫亮（内容在架上）。
 *  flash 0..1：新副本入架时的短促增量辉光（SC10 miss 回源落地）。 */
export const G4Shelf: React.FC<{cx: number; cy: number; s?: number; lit?: boolean; opacity?: number; flash?: number}> = ({cx, cy, s = 1, lit = false, opacity = 1, flash = 0}) => {
  const W = 180 * s, H = 150 * s;
  const rows = [18, 68, 118];
  const cols = [14, 68, 122];
  return (
    <div style={{...abs(cx - W / 2, cy - H / 2, W, H), opacity}}>
      <svg width={W} height={H} viewBox="0 0 180 150" style={{position: 'absolute', inset: 0, overflow: 'visible', filter: 'drop-shadow(0 0 2px rgba(255,255,255,.3))'}}>
        <rect x={4} y={4} width={172} height={142} rx={8} fill="#000" stroke={WHITE} strokeWidth={3} />
        <line x1={7} y1={55} x2={173} y2={55} stroke={GREY_LINE} strokeWidth={2} />
        <line x1={7} y1={105} x2={173} y2={105} stroke={GREY_LINE} strokeWidth={2} />
        {rows.map((ry, r) => cols.map((cx0, c) => {
          const hot = lit && r === 1 && c === 1;
          return (
            <rect key={`${r}-${c}`} x={cx0} y={ry} width={44} height={26} rx={4}
              fill={hot ? 'rgba(102,48,248,0.42)' : '#0d0d10'}
              stroke={hot ? PURPLE_LIGHT : GREY_LINE} strokeWidth={2}
              style={hot ? {filter: `drop-shadow(0 0 ${(4 + 8 * flash).toFixed(1)}px rgba(102,48,248,${0.55 + 0.35 * flash}))`} : undefined} />
          );
        }))}
      </svg>
    </div>
  );
};
