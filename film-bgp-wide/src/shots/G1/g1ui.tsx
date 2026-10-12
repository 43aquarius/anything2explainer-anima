import React from 'react';
import {clamp01, easeInOutPow, kf, BEZ_SCALE_IN} from '../../common';
import {Svg, GREY_LIGHT, abs} from '../../ui';

/**
 * G1 组内共用小图元与承接常量（不进 ui.tsx，见 BUILD_NOTES）：
 *   CARRY    SC02 → SC03 空 MapFrame 的跨镜头承接（两侧屏幕坐标逐像素一致）
 *   MiniChip 无编号小芯片（SC03「每个网络」；AsChip 母题的匿名版）
 *   qbez     二次贝塞尔采样（供弧线/连线用）
 */

/** SC02 → SC03 地图框承接：SC02 末态（相机推到 (965,320)×1.12）屏幕上框 = (430,490) 心、358×256；
 *  SC03 相机 s=1 首帧用同一屏幕位置起，再 16 帧放大到 (640,360) 640×457。 */
export const CARRY = {
  /** SC03 起始（= 屏幕坐标）：SC02 末帧空框在屏幕上的矩形 */
  from: {cx: 430, cy: 490, w: 358, h: 256},
  /** SC02 内的世界坐标（相机推 (965,320)×1.12 后正好落在 from 矩形上） */
  world: {cx: 777, cy: 436, w: 320, h: 229},
  /** SC03 落位（16 帧放大承接终点） */
  to: {cx: 640, cy: 360, w: 640, h: 457},
};

/** 无编号小芯片（=「每个网络」的匿名 AsChip）：圆角方 + 两侧引脚 + 右下状态灯；灰白描边 */
export const MiniChip: React.FC<{cx: number; cy: number; s?: number; ledK?: number; opacity?: number}> = ({cx, cy, s = 1, ledK = 0, opacity = 1}) => (
  <div style={{...abs(cx - 32 * s, cy - 32 * s, 64 * s, 64 * s), opacity}}>
    <svg width={64 * s} height={64 * s} viewBox="0 0 64 64" style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
      <g stroke="#747474" strokeWidth={3}>
        <line x1={0} y1={20} x2={4} y2={20} />
        <line x1={0} y1={44} x2={4} y2={44} />
        <line x1={60} y1={20} x2={64} y2={20} />
        <line x1={60} y1={44} x2={64} y2={44} />
      </g>
      <rect x={4} y={4} width={56} height={56} rx={9} fill="#000" stroke={GREY_LIGHT} strokeWidth={2.5} />
      <circle cx={51} cy={51} r={3.6} fill={ledK > 0.05 ? '#FFF' : '#5a5a5c'} opacity={0.35 + 0.65 * clamp01(ledK)} />
      {ledK > 0.05 ? <circle cx={51} cy={51} r={7.5} fill="none" stroke="#FFF" strokeWidth={1.2} opacity={0.5 * clamp01(ledK)} /> : null}
    </svg>
  </div>
);

/** 二次贝塞尔取点（弧线/连线用） */
export const qbez = (p0: Array<number>, p1: Array<number>, p2: Array<number>, t: number): [number, number] => [
  (1 - t) * (1 - t) * p0[0] + 2 * (1 - t) * t * p1[0] + t * t * p2[0],
  (1 - t) * (1 - t) * p0[1] + 2 * (1 - t) * t * p1[1] + t * t * p2[1],
];

/** 16 帧放大承接的插值（easeInOutPow 2.5） */
export const carryKf = (N: number, f0: number, a: number, b: number) => kf(N, [[f0, a], [f0 + 16, b]], easeInOutPow(2.5));

/** 21 帧缩放入场曲线别名（芯片缩入用） */
export const chipScaleIn = (n: number) => 0.5 + 0.5 * BEZ_SCALE_IN(clamp01(n / 14));
