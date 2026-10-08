import React from 'react';
import {FONT_MONO} from '../../common';
import {abs, Box, ParcelIcon, BLOOM_SOFT, GREY, GREY_LINE, GREY_MID, WHITE, PURPLE_LIGHT} from '../../ui';

/**
 * G8 组内图元（第 4 章上半：SC49–SC54）。只服务本组，不进 ui.tsx。
 * - StoreBadge：Play 商店简化标（白边圆角方 + 内白描边播放三角），底边贴传送带
 * - MiniPhone：0.35× 缩微手机（张口接收：左缘带凹口 + 屏闪绿）
 * - SplitChipG8：split APK 卡（放大的 SplitChip： parcel + 等宽标签 + 顶部天线位）
 * - Antenna：小天线（竖杆 + 端点圆）
 * - SignalWaves：天线上方的下载波纹（3 段圆弧 24 帧循环，纯函数）
 * - GreyStamp：小灰章（not yours，旋转 -12°，stampIn 缩放由调用方传）
 * - AppCircle：app 图标（白边圆 + 内小方块）
 */

/** Play 商店简化标：s 为边长，底边中心在 (cx, yBase)。 */
export const StoreBadge: React.FC<{cx: number; yBase: number; s?: number; opacity?: number}> = ({cx, yBase, s = 58, opacity = 1}) => (
  <div style={{...abs(cx - s / 2, yBase - s, s, s), opacity}}>
    <svg width={s} height={s} viewBox="0 0 58 58" style={{position: 'absolute', left: 0, top: 0, overflow: 'visible', filter: BLOOM_SOFT}}>
      <rect x={2} y={2} width={54} height={54} rx={12} fill="#000" stroke={WHITE} strokeWidth={2.5} strokeLinejoin="round" />
      <path d="M23.5,17.5 L41,29 L23.5,40.5 Z" fill="#000" stroke={WHITE} strokeWidth={2.5} strokeLinejoin="round" />
    </svg>
  </div>
);

/** 缩微手机（组装线右端）：白边圆角矩形 + 灰屏 + 左缘「张口」凹口；flashK>0 屏幕闪绿。 */
export const MiniPhone: React.FC<{x: number; y: number; w: number; h: number; flashK?: number; opacity?: number}> = ({x, y, w, h, flashK = 0, opacity = 1}) => (
  <div style={{...abs(x, y, w, h), opacity}}>
    <div style={{position: 'absolute', inset: 0, border: `2.5px solid ${WHITE}`, borderRadius: 12, background: 'rgba(0,0,0,0.92)', filter: BLOOM_SOFT}} />
    <div style={{position: 'absolute', left: 9, right: 9, top: 20, bottom: 24, border: `1.5px solid ${GREY_LINE}`, borderRadius: 5, background: flashK > 0.02 ? `rgba(143,247,64,${(0.30 * flashK).toFixed(3)})` : 'rgba(255,255,255,0.03)'}} />
    {/* 听筒刻痕 */}
    <div style={{position: 'absolute', left: '50%', top: 8, transform: 'translateX(-50%)', width: w * 0.3, height: 4, borderRadius: 2, background: GREY_MID}} />
    {/* 左缘张口（凹口，正对传送带高度） */}
    <div style={{position: 'absolute', left: -3, top: h * 0.36, width: 10, height: h * 0.17, background: '#000', boxShadow: `inset 0 2px 0 ${GREY_LINE}, inset 0 -2px 0 ${GREY_LINE}`, borderLeft: `2px dashed ${GREY_MID}`}} />
  </div>
);

/** split APK 卡（G8 放大版 SplitChip）：260×132，parcel 116×82 + 底部等宽标签；active 紫边。 */
export const SplitChipG8: React.FC<{cx: number; cy: number; label: string; dim?: boolean; active?: boolean; opacity?: number; glow?: string}> = ({cx, cy, label, dim = false, active = false, opacity = 1, glow}) => {
  const edge = active ? PURPLE_LIGHT : dim ? GREY_LINE : WHITE;
  return (
    <div style={{...abs(cx - 130, cy - 66, 260, 132), opacity}}>
      <Box x={0} y={0} w={260} h={132} r={12} stroke={edge} sw={active ? 2.5 : 2} fill="rgba(0,0,0,0.9)" glow={glow} />
      <ParcelIcon cx={130} cy={46} w={116} h={82} color={dim ? GREY : WHITE} accent={active} label={''} />
      <div style={{position: 'absolute', left: 0, right: 0, top: 98, textAlign: 'center', fontFamily: FONT_MONO, fontSize: 16, color: dim ? GREY_MID : WHITE, whiteSpace: 'nowrap'}}>{label}</div>
    </div>
  );
};

/** 小天线：竖杆自 (cx,yBase) 向上到 (cx,yTop)，顶端小圆。 */
export const Antenna: React.FC<{cx: number; yBase: number; yTop: number; color?: string; opacity?: number}> = ({cx, yBase, yTop, color = WHITE, opacity = 1}) => (
  <div style={{...abs(cx - 2, yTop, 4, yBase - yTop), opacity}}>
    <div style={{position: 'absolute', inset: 0, background: color, filter: BLOOM_SOFT}} />
    <div style={{position: 'absolute', left: -3, top: -9, width: 10, height: 10, borderRadius: '50%', background: '#000', border: `2px solid ${color}`}} />
  </div>
);

/** 下载波纹：3 段以 (cx,cy) 为心的上开口圆弧，半径/透明度随 N 循环（period 帧一圈，相位错开 1/3）。 */
export const SignalWaves: React.FC<{cx: number; cy: number; N: number; period?: number; color?: string; opacity?: number}> = ({cx, cy, N, period = 24, color = PURPLE_LIGHT, opacity = 1}) => {
  const arcs = [0, 1, 2].map((i) => {
    const t = (N / period + i / 3) % 1; // 0→1
    return {r: 12 + t * 44, op: (1 - t) * 0.85};
  });
  return (
    <svg width={140} height={70} viewBox="0 0 140 70" style={{...abs(cx - 70, cy - 66, 140, 70), overflow: 'visible', filter: BLOOM_SOFT, opacity}}>
      {arcs.map((a, i) => (
        <path
          key={i}
          d={`M${(70 - a.r * 0.766).toFixed(1)},${(66 - a.r * 0.643).toFixed(1)} A${a.r.toFixed(1)},${a.r.toFixed(1)} 0 0 1 ${(70 + a.r * 0.766).toFixed(1)},${(66 - a.r * 0.643).toFixed(1)}`}
          fill="none"
          stroke={color}
          strokeWidth={2.5}
          strokeLinecap="round"
          opacity={Number(a.op.toFixed(3))}
        />
      ))}
    </svg>
  );
};

/** 小灰章：100×34 灰边黑底 + 等宽 16px 灰字；s/rot 由调用方按 stampIn 传。 */
export const GreyStamp: React.FC<{cx: number; cy: number; text: string; s?: number; opacity?: number; rot?: number}> = ({cx, cy, text, s = 1, opacity = 1, rot = -12}) => (
  <div style={{...abs(cx - 50, cy - 17, 100, 34), opacity, transform: `rotate(${rot}deg) scale(${s.toFixed(3)})`}}>
    <Box x={0} y={0} w={100} h={34} r={4} stroke={GREY} sw={2} fill="rgba(0,0,0,0.88)" />
    <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FONT_MONO, fontSize: 16, color: GREY, letterSpacing: 1, whiteSpace: 'nowrap'}}>{text}</div>
  </div>
);

/** app 图标：白边圆 + 内嵌小方块。 */
export const AppCircle: React.FC<{cx: number; cy: number; r?: number; opacity?: number; scale?: number}> = ({cx, cy, r = 26, opacity = 1, scale = 1}) => (
  <div style={{...abs(cx - r, cy - r, 2 * r, 2 * r), opacity, transform: `scale(${scale.toFixed(3)})`}}>
    <div style={{position: 'absolute', inset: 0, borderRadius: '50%', border: `2.5px solid ${WHITE}`, background: 'rgba(0,0,0,0.9)', filter: BLOOM_SOFT}} />
    <div style={{position: 'absolute', left: r - 9, top: r - 9, width: 18, height: 18, borderRadius: 5, border: `2px solid ${WHITE}`}} />
  </div>
);
