import React from 'react';
import {CText, GREY, GREY_LIGHT, abs} from '../../ui';

/**
 * G6 组内共用小图元（不进 ui.tsx，见 BUILD_NOTES）：
 *   SpinnerWall  SC12「刷新墙」的缩微承接件（SC13 章首；4×6 圆弧 spinner 永续旋转 + 灰字 billions hit reload）
 *   MapChip      SC15 大地图里的匿名小芯片（AsChip 母题的匿名版，同 G1/SC03 MiniChip 造型思路）
 *   qbez         二次贝塞尔采样（纸条飞行弧线用）
 */

/** 刷新墙（SC12 下半左面板的缩微版）：4×6 圆弧 spinner 全部循环旋转；label 不随 scale 缩（保 22px 最小字号） */
export const SpinnerWall: React.FC<{cx: number; cy: number; scale: number; N: number; opacity?: number}> = ({cx, cy, scale, N, opacity = 1}) => {
  const COLS = 4, ROWS = 6, CELL = 30;
  const W = COLS * CELL, H = ROWS * CELL;
  return (
    <>
      <div style={{...abs(cx - (W * scale) / 2, cy - (H * scale) / 2, W * scale, H * scale), opacity}}>
        <svg width={W * scale} height={H * scale} viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
          {Array.from({length: COLS * ROWS}, (_, i) => {
            const gx = (i % COLS) * CELL + CELL / 2;
            const gy = Math.floor(i / COLS) * CELL + CELL / 2;
            const ang = (N * 9 + i * 23) % 360; // 永续旋转（纯函数）
            return <circle key={i} cx={gx} cy={gy} r={9} fill="none" stroke={GREY_LIGHT} strokeWidth={3} strokeDasharray="42 14.5" transform={`rotate(${ang} ${gx} ${gy})`} />;
          })}
        </svg>
      </div>
      <div style={{...abs(0, 0, 1280, 720), opacity}}>
        <CText cx={cx} cy={cy - (H * scale) / 2 - 15} size={22} weight={500} color={GREY}>billions hit reload</CText>
      </div>
    </>
  );
};

/** 匿名小芯片（=「十万个网络」的群众版 AsChip）：圆角方 + 两侧引脚 + 常亮小白灯；无编号 */
export const MapChip: React.FC<{cx: number; cy: number; s?: number; opacity?: number}> = ({cx, cy, s = 1, opacity = 1}) => (
  <div style={{...abs(cx - 23 * s, cy - 23 * s, 46 * s, 46 * s), opacity}}>
    <svg width={46 * s} height={46 * s} viewBox="0 0 46 46" style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
      <g stroke="#747474" strokeWidth={2.4}>
        <line x1={0} y1={15} x2={3.5} y2={15} />
        <line x1={0} y1={31} x2={3.5} y2={31} />
        <line x1={42.5} y1={15} x2={46} y2={15} />
        <line x1={42.5} y1={31} x2={46} y2={31} />
      </g>
      <rect x={3.5} y={3.5} width={39} height={39} rx={7} fill="#000" stroke={GREY_LIGHT} strokeWidth={2.2} />
      <circle cx={36} cy={36} r={3} fill="#FFF" opacity={0.92} />
    </svg>
  </div>
);

/** 二次贝塞尔取点（弧线飞行用） */
export const qbez = (p0: Array<number>, p1: Array<number>, p2: Array<number>, t: number): [number, number] => [
  (1 - t) * (1 - t) * p0[0] + 2 * (1 - t) * t * p1[0] + t * t * p2[0],
  (1 - t) * (1 - t) * p0[1] + 2 * (1 - t) * t * p1[1] + t * t * p2[1],
];
