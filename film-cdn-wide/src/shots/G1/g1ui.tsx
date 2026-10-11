import React from 'react';
import {clamp01} from '../../common';
import {CText, RackIcon, Svg, Cross, GREY, GREY_MID, WHITE, PURPLE_LIGHT, CORAL, abs} from '../../ui';

/**
 * G1 组内共用小图元（不进 ui.tsx，见 BUILD_NOTES）：
 *   CONT_L / CONT_R / WORLD / dashArcD / WorldMapCore
 * 「世界简图」同一套路径：SC01 全幅使用；SC03 以 0.55× 包一层 transform 复用（组内承接逐像素一致）。
 * 坐标一律用 SC01 屏幕坐标（世界图全幅版），SC03 的缩小/平移在外面套 transform 完成。
 */

export const CONT_L =
  'M492,272 C468,306 476,352 498,384 C486,416 505,450 540,462 C552,492 592,504 620,488 C654,498 688,478 692,444 C716,428 720,394 702,368 C718,338 704,304 668,294 C656,266 618,246 588,258 C554,244 514,246 492,272 Z';
export const CONT_R =
  'M948,252 C922,282 926,330 946,362 C932,394 950,428 984,438 C996,468 1036,478 1062,462 C1096,472 1130,452 1132,420 C1154,404 1156,370 1138,346 C1152,316 1136,282 1100,274 C1086,246 1048,230 1020,242 C988,232 962,232 948,252 Z';

/** 世界图关键点（SC01 屏幕坐标） */
export const WORLD = {
  you: {x: 560, y: 450},
  rack: {x: 1055, y: 380},
  arc: {p0: [575, 435], p1: [808, 235], p2: [1040, 360]},
  km: {x: 808, y: 285}, // `8,000 km` 标签（弧顶点上方）
  cross: {x: 808, y: 308}, // SC03 远弧中点红 Cross
  led: {x: 1094, y: 334}, // 机架右上角指示灯
};

const qbez = (p0: number[], p1: number[], p2: number[], t: number): [number, number] => [
  (1 - t) * (1 - t) * p0[0] + 2 * (1 - t) * t * p1[0] + t * t * p2[0],
  (1 - t) * (1 - t) * p0[1] + 2 * (1 - t) * t * p1[1] + t * t * p2[1],
];

/** 虚线弧 draw-on：沿二次贝塞尔采样出 dash 子路径，p 0→1 自 you 端生长 */
export const dashArcD = (p: number, dashOn = 5, dashOff = 4, segs = 72): string => {
  const k = clamp01(p);
  if (k <= 0) return '';
  const lim = Math.round(k * segs);
  let d = '';
  let open = false;
  for (let i = 0; i < lim; i++) {
    if (Math.floor(i / dashOn) % 2 !== 0) {
      open = false;
      continue;
    }
    const a = qbez(WORLD.arc.p0, WORLD.arc.p1, WORLD.arc.p2, i / segs);
    const b = qbez(WORLD.arc.p0, WORLD.arc.p1, WORLD.arc.p2, (i + 1) / segs);
    d += (open ? '' : `M${a[0].toFixed(1)},${a[1].toFixed(1)}`) + `L${b[0].toFixed(1)},${b[1].toFixed(1)}`;
    open = true;
  }
  return d;
};

/** 实线弧 draw-on（本地线用）：p 0→1 */
export const solidArcD = (p0: number[], p1: number[], p2: number[], k: number, segs = 40): string => {
  const p = clamp01(k);
  if (p <= 0) return '';
  const lim = Math.max(1, Math.round(p * segs));
  let d = '';
  for (let i = 0; i <= lim; i++) {
    const [x, y] = qbez(p0, p1, p2, (i / segs) * p);
    d += (i === 0 ? 'M' : 'L') + `${x.toFixed(1)},${y.toFixed(1)}`;
  }
  return d;
};

/** 弧上取点（光点沿线跑用） */
export const arcPoint = (p0: number[], p1: number[], p2: number[], t: number): [number, number] => qbez(p0, p1, p2, clamp01(t));

/**
 * 世界简图本体（SC01 坐标系）。SC01 直接使用；SC03 外面套
 * `translate(tx,ty) scale(0.55)`（transform-origin 0 0）后再使用。
 * labelNode 由调用方传入：SC01 = GlitchIn(rgbSplit 4) 的 `8,000 km`；SC03 = 灰化普通版。
 */
export const WorldMapCore: React.FC<{
  contP: number; // 大陆轮廓 draw-on 0–1
  arcP: number; // 虚线远弧 draw-on 0–1
  arcColor?: string; // 远弧颜色（SC03 灰化传入灰）
  arcOp?: number;
  rackS: number; // 机架缩放入场 0–1
  rackOp: number;
  youOp: number;
  ledOn: boolean; // 机架指示灯亮
  crossP?: number; // SC03 红十字 draw-on 0–1
  labelNode?: React.ReactNode; // `8,000 km` 标签
}> = ({contP, arcP, arcColor = WHITE, arcOp = 1, rackS, rackOp, youOp, ledOn, crossP = 0, labelNode}) => (
  <>
    <Svg bloom={false}>
      {contP > 0 ? (
        <>
          <path d={CONT_L} fill="rgba(0,0,0,.4)" stroke={GREY_MID} strokeWidth={2.5} strokeLinejoin="round" pathLength={100} strokeDasharray={100} strokeDashoffset={100 * (1 - clamp01(contP))} />
          <path d={CONT_R} fill="rgba(0,0,0,.4)" stroke={GREY_MID} strokeWidth={2.5} strokeLinejoin="round" pathLength={100} strokeDasharray={100} strokeDashoffset={100 * (1 - clamp01(contP))} />
          <path d={dashArcD(arcP)} fill="none" stroke={arcColor} strokeWidth={3} strokeLinecap="round" opacity={arcOp} />
        </>
      ) : null}
      {crossP > 0 ? <Cross cx={WORLD.cross.x} cy={WORLD.cross.y} size={100} color={CORAL} sw={10} p={crossP} /> : null}
    </Svg>
    {youOp > 0 ? (
      <div style={{...abs(0, 0, 1280, 720), opacity: youOp}}>
        <Svg bloom={false}>
          <circle cx={WORLD.you.x} cy={WORLD.you.y} r={7} fill="#000" stroke={WHITE} strokeWidth={2.5} />
        </Svg>
        <CText cx={WORLD.you.x} cy={WORLD.you.y + 36} size={22} weight={600} color={GREY}>you</CText>
      </div>
    ) : null}
    {rackOp > 0 ? (
      <div style={{...abs(0, 0, 1280, 720), opacity: rackOp, transform: `scale(${rackS.toFixed(3)})`, transformOrigin: `${WORLD.rack.x}px ${WORLD.rack.y}px`}}>
        <RackIcon cx={WORLD.rack.x} cy={WORLD.rack.y} w={84} h={118} units={6} lit={5} label="origin" labelSize={22} />
        <div
          style={{
            position: 'absolute',
            left: WORLD.led.x - 5,
            top: WORLD.led.y - 5,
            width: 10,
            height: 10,
            borderRadius: '50%',
            background: ledOn ? PURPLE_LIGHT : '#333',
            boxShadow: ledOn ? '0 0 9px rgba(161,117,241,.95)' : 'none',
          }}
        />
      </div>
    ) : null}
    {labelNode}
  </>
);
