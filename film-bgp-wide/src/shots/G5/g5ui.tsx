import React from 'react';
import {clamp01, easeOutCubic, rnd} from '../../common';
import {GREY_LINE, GREY_LIGHT, GREY_MID, WHITE, abs} from '../../ui';

/**
 * G5 组内共用小图元与承接常量（不进 ui.tsx，见 BUILD_NOTES）：
 *   qbez        二次贝塞尔采样（弧线/连线用；与 G1/g1ui 同式样，组间不互相 import）
 *   MapNodeChip 地图内匿名小芯片（SC12 框内相连小芯片 = AsChip 母题的无字缩小版）
 *   Spinner     单枚刷新光标（缺口圆弧旋转，N 驱动）
 *   RefreshWall 4×6 刷新墙（SC12 下半左主角；SC13/G6 章首承接复用，几何见 CARRY_G6）
 *   KeyGhost    钥匙简笔虚影（SC11 `password?`）
 *   CARRY_G6    SC12 → SC13(G6) 刷新墙承接常量（世界坐标 = SC12 末帧屏幕坐标）
 */

/** 二次贝塞尔取点（弧线/连线用） */
export const qbez = (p0: Array<number>, p1: Array<number>, p2: Array<number>, t: number): [number, number] => [
  (1 - t) * (1 - t) * p0[0] + 2 * (1 - t) * t * p1[0] + t * t * p2[0],
  (1 - t) * (1 - t) * p0[1] + 2 * (1 - t) * t * p1[1] + t * t * p2[1],
];

/** 钥匙简笔虚影（SC11 password? 的被否定物）：圆环柄 + 杆 + 两齿，灰描边 */
export const KeyGhost: React.FC<{cx: number; cy: number; w?: number; opacity?: number; stroke?: string; sw?: number}> = ({cx, cy, w = 124, opacity = 1, stroke = GREY_MID, sw = 3.5}) => {
  const h = 52;
  const s = w / 124;
  return (
    <svg width={w} height={h * s * 2} viewBox={`0 0 124 104`} style={{...abs(cx - w / 2, cy - h * s), overflow: 'visible', opacity}}>
      <g stroke={stroke} strokeWidth={sw} fill="none" strokeLinecap="round">
        <circle cx={26} cy={52} r={19} />
        <circle cx={26} cy={52} r={7} />
        <line x1={45} y1={52} x2={116} y2={52} />
        <line x1={92} y1={52} x2={92} y2={70} />
        <line x1={108} y1={52} x2={108} y2={64} />
      </g>
    </svg>
  );
};

/** 地图内匿名小芯片（SC12 框内相连网络）：圆角方 + 四侧单引脚 + 右下状态灯；无字（避免 <22px 小字） */
export const MapNodeChip: React.FC<{cx: number; cy: number; s?: number; lit?: number; opacity?: number; dim?: number}> = ({cx, cy, s = 56, lit = 1, opacity = 1, dim = 0}) => {
  const k = clamp01(lit) * (1 - clamp01(dim));
  const stroke = dim > 0.5 ? GREY_MID : GREY_LIGHT;
  return (
    <svg width={s} height={s} viewBox="0 0 56 56" style={{...abs(cx - s / 2, cy - s / 2), overflow: 'visible', opacity}}>
      <g stroke={GREY_MID} strokeWidth={3}>
        <line x1={0} y1={28} x2={6} y2={28} />
        <line x1={50} y1={28} x2={56} y2={28} />
        <line x1={28} y1={0} x2={28} y2={6} />
        <line x1={28} y1={50} x2={28} y2={56} />
      </g>
      <rect x={6} y={6} width={44} height={44} rx={8} fill="#000" stroke={stroke} strokeWidth={2.5} opacity={1 - 0.45 * clamp01(dim)} />
      <circle cx={43} cy={43} r={3.6} fill={k > 0.05 ? WHITE : '#5a5a5c'} opacity={0.35 + 0.65 * k} />
      {k > 0.05 ? <circle cx={43} cy={43} r={7} fill="none" stroke={WHITE} strokeWidth={1.2} opacity={0.5 * k} /> : null}
    </svg>
  );
};

/** 单枚刷新光标（缺口圆弧）：在 (x,y) 处旋转，转速/相位由 rnd(i,seed) 播种（确定性） */
const SpinnerCell: React.FC<{x: number; y: number; N: number; i: number; seed: number; r: number; appear: number; opacity: number}> = ({x, y, N, i, seed, r, appear, opacity}) => {
  if (appear < 0) return null;
  const s = 0.3 + 0.7 * easeOutCubic(clamp01(appear / 8));
  const a = (N * (5.4 + rnd(i, seed) * 3.6) + rnd(i, seed + 9) * 360) % 360;
  const C = 2 * Math.PI * r;
  return (
    <g transform={`translate(${x} ${y}) scale(${s.toFixed(3)}) rotate(${a.toFixed(1)})`} opacity={opacity}>
      <circle r={r} fill="none" stroke={WHITE} strokeWidth={3.5} strokeDasharray={`${(C * 0.74).toFixed(1)} ${(C * 0.26).toFixed(1)}`} strokeLinecap="round" />
      <circle r={2.2} fill={GREY_MID} opacity={0.55} />
    </g>
  );
};

/**
 * 刷新墙（SC12 高光动作）：cols×rows 网格的刷新光标，enter = N − 墙起始帧（<0 全隐藏）；
 * 逐枚 2 帧错峰缩入（scaleIn 8f）后永续旋转。SC13 承接时传 enter ≥ 24×2+8 即全亮形态。
 */
export const RefreshWall: React.FC<{
  cx: number; cy: number; N: number; enter: number;
  cols?: number; rows?: number; pitchX?: number; pitchY?: number; r?: number;
  opacity?: number; dim?: number; seed?: number;
}> = ({cx, cy, N, enter, cols = 6, rows = 4, pitchX = 62, pitchY = 50, r = 15, opacity = 1, dim = 0, seed = 5}) => {
  const cells: React.ReactNode[] = [];
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const i = row * cols + col;
      const x = cx + (col - (cols - 1) / 2) * pitchX;
      const y = cy + (row - (rows - 1) / 2) * pitchY;
      cells.push(<SpinnerCell key={i} x={x} y={y} N={N} i={i} seed={seed} r={r} appear={enter - i * 2} opacity={opacity * (1 - 0.55 * clamp01(dim))} />);
    }
  }
  return (
    <svg width={1280} height={720} viewBox="0 0 1280 720" style={{...abs(0, 0), overflow: 'visible', filter: 'drop-shadow(0 0 3px rgba(255,255,255,0.4))'}}>
      {cells}
    </svg>
  );
};

/** SC12 → SC13(G6) 承接常量：SC12 末帧相机已拉回 s=1（中心 640,360），世界坐标 = 屏幕坐标。
 *  SC13 章首「刷新墙缩微左下角」用同 seed 的 RefreshWall 缩微（r 8~10、pitch 同比）即可逐像素同源。 */
export const CARRY_G6 = {
  wall: {cx: 285, cy: 527, cols: 6, rows: 4, pitchX: 62, pitchY: 50, r: 15, seed: 5},
  wallText: {cx: 285, cy: 420, size: 24, text: 'billions hit reload'},
  clock: {cx: 995, cy: 458, r: 58},
  hint: 'SC13 承接：RefreshWall 同 seed=5 缩微到左下角；enter 传 ≥56（24 枚 ×2f + 8f 余量）为全亮永续形态',
};
