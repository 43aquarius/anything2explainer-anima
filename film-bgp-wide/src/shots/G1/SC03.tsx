import React from 'react';
import {useCurrentFrame} from 'remotion';
import {clamp01, kf, easeInOutPow, FONT_ORB} from '../../common';
import {CameraRig} from '../../fx';
import {CText, TechText, MapFrame, Svg, GREY, GREY_MID, WHITE, abs, fadeIn, exitOp, glowOffK} from '../../ui';
import {CARRY, MiniChip, chipScaleIn} from './g1ui';

/**
 * SC03 没有地图（556–686）。S05（¶ 章末；TO=686=C2−54，离场让位章节卡 687–731）。
 * 节拍：556 空 MapFrame 承接 SC02 屏位 (430,490) 358×256 → 16 帧放大居中 (640,360) 640×457
 *       ｜564 芯片 3 帧错峰缩入（各 14f；位置随放大框骑行）+ 各自涟漪一次 + `?` 淡出
 *       ｜632 芯片间细线 draw-on（16f）+ 灰字 `announced — and believed` SoftIn + 全部涟漪再次错峰（持续到离场）
 * 运镜：33 帧 1→1.10 推向框中心（601–634；分镜表写在 632，因 TO=686 提前——运镜不进末拍）。
 * 停留：段末（¶+gap20 章末），细线织成 650 → 离场 680（6f），hold 30 ✓；涟漪为持续动作。
 * 主角：地图+芯片群 330px（框白柔光 + 涟漪白 + 芯片灯灰白）。零 glitch（白名单）。
 */
const F0 = 556;
const TO = 686;
const EASE = easeInOutPow(2.5);

/** 8 枚匿名小芯片（最终世界坐标：框内四角 + 四边中点） */
const CHIP_AT: Array<[number, number]> = [
  [410, 210], [870, 210], [410, 510], [870, 510], // 四角
  [640, 175], [365, 360], [915, 360], [640, 545], // 边中
];
/** 连线（下标对：环 8 条 + F-G 弦），细灰线 draw-on */
const LINKS: Array<[number, number, boolean]> = [
  [0, 4, false], [4, 1, false], [1, 6, false], [6, 3, false],
  [3, 7, false], [7, 2, false], [2, 5, false], [5, 0, false],
  [5, 6, true], // F-G 弦（微弓）
];

export const SC03: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const exit = exitOp(N, TO, 6); // 段末 6 帧归零（章节卡 687 起）
  const glowFade = glowOffK(N, TO, 6, 6); // 框白柔光先灭再淡出

  // ---- 地图框（556 承接 → 572 放大落位）----
  const fcx = kf(N, [[F0, CARRY.from.cx], [F0 + 16, CARRY.to.cx]], EASE);
  const fcy = kf(N, [[F0, CARRY.from.cy], [F0 + 16, CARRY.to.cy]], EASE);
  const fw = kf(N, [[F0, CARRY.from.w], [F0 + 16, CARRY.to.w]], EASE);
  const fh = kf(N, [[F0, CARRY.from.h], [F0 + 16, CARRY.to.h]], EASE);
  const fx0 = fcx - fw / 2, fy0 = fcy - fh / 2;

  // 芯片按最终框比例骑行（放大时跟着框铺开）
  const FR = CHIP_AT.map(([x, y]) => [(x - CARRY.to.cx) / CARRY.to.w, (y - CARRY.to.cy) / CARRY.to.h] as [number, number]);
  const chipPos = (i: number) => ({x: fcx + FR[i][0] * fw, y: fcy + FR[i][1] * fh});

  // ---- `?`（随框移动，564 起让位给芯片）----
  const qOp = N < 564 ? 1 : 1 - clamp01((N - 564) / 18);

  // ---- 芯片（564+3i 缩入 14f；灯亮；涟漪两波）----
  const entry = (i: number) => 564 + 3 * i;
  const rippleAt = (i: number, w: number) => (w === 0 ? entry(i) + 8 : 641 + 3 * i);

  const glowBreath = 0.09 + 0.03 * Math.sin((2 * Math.PI * N) / 30);

  return (
    <CameraRig N={N} keys={[{f: F0, x: 640, y: 360, s: 1}, {f: 601, x: 640, y: 360, s: 1}, {f: 634, x: 640, y: 360, s: 1.1}]}>
      <div style={abs(0, 0, 1280, 720)}>
        <div style={{...abs(0, 0, 1280, 720), opacity: exit}}>
          {/* ---- 地图框 + 白柔光（主角）---- */}
          <div style={{...abs(fx0, fy0, fw, fh), borderRadius: 10, boxShadow: `0 0 36px 12px rgba(255,255,255,${(glowBreath * glowFade).toFixed(3)})`}} />
          <MapFrame cx={fcx} cy={fcy} w={fw} h={fh} />

          {/* `?`（SC02 承接；564 淡出） */}
          <div style={{...abs(0, 0, 1280, 720), opacity: qOp.toFixed(3)}}>
            <CText cx={fcx} cy={fcy} size={110} weight={700} family={FONT_ORB} color={GREY_MID}>?</CText>
          </div>

          {/* ---- 芯片间细线（632+ 微错峰 draw-on 15f，织成稀疏网）---- */}
          <Svg bloom={false}>
            {LINKS.map(([a, b, arc], li) => {
              const p = clamp01((N - 632 - (li % 3)) / 15);
              if (p <= 0) return null;
              const pa = chipPos(a), pb = chipPos(b);
              const dx = pb.x - pa.x, dy = pb.y - pa.y;
              const d = Math.hypot(dx, dy) || 1;
              const ux = dx / d, uy = dy / d;
              const x0 = pa.x + ux * 36, y0 = pa.y + uy * 36;
              const x1 = pb.x - ux * 36, y1 = pb.y - uy * 36;
              if (!arc) {
                return <line key={li} x1={x0} y1={y0} x2={x1} y2={y1} stroke={GREY_MID} strokeWidth={1.8} opacity={0.85} pathLength={100} strokeDasharray={100} strokeDashoffset={100 * (1 - p)} />;
              }
              const cxm = (x0 + x1) / 2, cym = (y0 + y1) / 2 - 24;
              return (
                <path
                  key={li}
                  d={`M${x0.toFixed(1)},${y0.toFixed(1)} Q${cxm.toFixed(1)},${cym.toFixed(1)} ${x1.toFixed(1)},${y1.toFixed(1)}`}
                  fill="none"
                  stroke={GREY_MID}
                  strokeWidth={1.8}
                  opacity={0.85}
                  pathLength={100}
                  strokeDasharray={100}
                  strokeDashoffset={100 * (1 - p)}
                />
              );
            })}
          </Svg>

          {/* ---- 8 枚匿名芯片（缩入 + 灯亮）---- */}
          {CHIP_AT.map((_, i) => {
            const e = entry(i);
            if (N < e) return null;
            const p = chipPos(i);
            const op = fadeIn(N - e, 5);
            const s = chipScaleIn(N - e);
            const ledK = clamp01((N - (e + 10)) / 6);
            return <MiniChip key={i} cx={p.x} cy={p.y} s={s} ledK={ledK} opacity={op} />;
          })}

          {/* ---- 涟漪（两波：落地一圈 ｜ 641 起再一圈错峰，持续到离场）---- */}
          <Svg bloom={false}>
            {CHIP_AT.map((_, i) =>
              [0, 1].map((w) => {
                const t = clamp01((N - rippleAt(i, w)) / 26);
                if (N < rippleAt(i, w) || t >= 1) return null;
                const p = chipPos(i);
                return (
                  <g key={`r${i}-${w}`}>
                    <circle cx={p.x} cy={p.y} r={8 + 27 * t} fill="none" stroke={WHITE} strokeWidth={2.4} opacity={(0.7 * (1 - t)).toFixed(3)} />
                    <circle cx={p.x} cy={p.y} r={5 + 19 * t} fill="none" stroke={WHITE} strokeWidth={1.5} opacity={(0.45 * (1 - t)).toFixed(3)} />
                  </g>
                );
              }),
            )}
          </Svg>

          {/* ---- 灰字（632 SoftIn，Exo 2）---- */}
          <div style={{...abs(0, 0, 1280, 720), opacity: fadeIn(N - 632, 10)}}>
            <TechText cx={640} cy={248} text="announced — and believed" fontSize={30} color={GREY} glow={false} />
          </div>
        </div>
      </div>
    </CameraRig>
  );
};
