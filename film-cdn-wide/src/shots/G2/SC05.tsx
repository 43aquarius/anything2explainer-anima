import React from 'react';
import {useCurrentFrame} from 'remotion';
import {clamp01, easeInOutPow, easeOutCubic, FONT_ORB, emphasisPulse} from '../../common';
import {CameraRig, HeroGlow} from '../../fx';
import {CText, Pill, EdgeNode, GREY, PURPLE_LIGHT, WHITE, abs, Svg, SoftIn, softOp, exitOp, glowOffK, scaleIn} from '../../ui';
import {CityMini, WorldMap} from './g2ui';

/**
 * SC05 边缘网络 · N 1096–1276（S09：1104「CDN 把内容副本」/ 1165「放进几百座城」/ 1209「PoP 边缘节点」）
 * 版式：世界简图（两块大陆 + 岛弧，呼应 SC01）+ 9 个 EdgeNode 城市节点（各带 `copy` 小标签）；
 *   图中央上方灰 Pill `points of presence`；下角 `hundreds of cities` Orbitron 40px 灰。主角 = 边缘节点群 300px（节点紫光轮闪）。
 * 动效：1104 世界图 draw-on 20f + 从 SC04 缩微城市圈"放大"（zoom 0.22→1 / 20f，城市圈淡出）；
 *   1165 节点 2 帧错峰缩入（各 14f，自 origin 方向一座接一座亮）+ 复制波纹（origin 方向三圈虚线弧扩散）；
 *   1209 Pill SoftIn + `hundreds of cities` 计数落定 + 节点指示灯 40 帧周期轮闪（持续）。
 * 运镜：33 帧 1→1.18 推向节点群（1187–1220，1165 拍中段）。停留：段内不判（S09 末块 65）。零 glitch。
 */
const F0 = 1096;
const TO = 1276;
const T_MAP = 1104, T_ISLAND = 1130, T_NODES = 1165, T_PILL = 1209, T_CNT = 1213, T_FLASH = 1215;

const MINI = {cx: 1080, cy: 185, r: 52};
const ZOOM_TO = {x: 640, y: 400}; // 地图满幅中心
const RC = {x: 1150, y: 330};      // 复制波纹圆心（origin 方向 = 图右外侧）
const RING_STARTS = [1165, 1191, 1217];
const NODES = [
  {x: 960, y: 280}, {x: 875, y: 310}, {x: 830, y: 430}, {x: 790, y: 255}, {x: 755, y: 405},
  {x: 695, y: 262}, {x: 668, y: 335}, {x: 395, y: 315}, {x: 345, y: 450},
];

export const SC05: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const exit = exitOp(N, TO, 8);
  const gk = glowOffK(N, TO);

  // 世界图：从缩微城市圈放大（translate+scale 插值 20 帧）+ 轮廓 draw-on
  const kZ = easeInOutPow(2.5)(clamp01((N - T_MAP) / 20));
  const ax = MINI.cx + (ZOOM_TO.x - MINI.cx) * kZ;
  const ay = MINI.cy + (ZOOM_TO.y - MINI.cy) * kZ;
  const ks = 0.22 + 0.78 * kZ;
  const mapOp = softOp(N - T_MAP, 6);
  const mapP = easeOutCubic(clamp01((N - T_MAP) / 20));
  const islandP = easeOutCubic(clamp01((N - T_ISLAND) / 18));

  // 承接城市圈：地图放大时淡出
  const miniOp = N < T_MAP ? 1 : 1 - clamp01((N - T_MAP) / 10);

  // 复制波纹（origin 方向三圈虚线弧）
  const rings = RING_STARTS.map((st) => {
    const t = clamp01((N - st) / 66);
    return t <= 0 || t >= 1 ? null : {r: 26 + 734 * easeOutCubic(t), op: (1 - t) * 0.32 * gk};
  });

  // 节点指示灯轮闪（40 帧周期，逐点错相）
  const flashOp = (i: number) => {
    const ph = (((N - T_FLASH) / 40) + i / 9) % 1;
    return 0.15 + 0.85 * (0.5 - 0.5 * Math.cos(2 * Math.PI * ph)) * gk;
  };

  return (
    <>
      <div style={{...abs(0, 0, 1280, 720), opacity: exit}}>
        <CameraRig N={N} keys={[{f: F0, x: 640, y: 360, s: 1}, {f: 1187, x: 640, y: 360, s: 1}, {f: 1220, x: 690, y: 380, s: 1.18}]}>
          <div style={{position: 'absolute', inset: 0, transform: `translate(${ax.toFixed(1)}px,${ay.toFixed(1)}px) scale(${ks.toFixed(4)}) translate(-640px,-400px)`, opacity: mapOp}}>
            <HeroGlow x={330} y={205} w={640} h={370} N={N} k={0.5 * clamp01((N - T_MAP) / 24) * gk} />
            <WorldMap p={mapP} islandP={islandP} />
            {rings.some((r) => r) ? (
              <Svg bloom={false}>
                {rings.map((r, i) => r ? (
                  <circle key={i} cx={RC.x} cy={RC.y} r={r.r.toFixed(1)} fill="none" stroke={WHITE} strokeWidth={2} strokeDasharray="5 9" opacity={r.op} />
                ) : null)}
              </Svg>
            ) : null}
            {NODES.map((n, i) => {
              const st = T_NODES + i * 2;
              const s = scaleIn(N - st, 14);
              const op = softOp(N - st, 6);
              return op <= 0.02 ? null : (
                <div key={i} style={{position: 'absolute', inset: 0, opacity: op, transform: `translate(${n.x}px,${n.y}px) scale(${s.toFixed(4)}) translate(${-n.x}px,${-n.y}px)`}}>
                  <EdgeNode cx={n.x} cy={n.y} w={56} h={66} lit label="copy" labelSize={22} />
                </div>
              );
            })}
            {N >= T_FLASH ? (
              <Svg>
                {NODES.map((n, i) => (
                  <circle key={i} cx={n.x} cy={n.y - 22} r={5} fill={PURPLE_LIGHT} opacity={flashOp(i).toFixed(3)} />
                ))}
              </Svg>
            ) : null}
          </div>
        </CameraRig>

        {/* 1209：PoP 术语（灰 Pill，屏幕空间不随运镜） */}
        <SoftIn N={N} f0={T_PILL}>
          <Pill x={495} y={130} w={290} h={46} r={23} fontSize={26} weight={700}
            text="points of presence" color={GREY} stroke={GREY} sw={2} />
        </SoftIn>
        {/* 1213：城市计数落定 */}
        <SoftIn N={N} f0={T_CNT}>
          <CText cx={330} cy={597} size={40} weight={700} family={FONT_ORB} color={GREY} letterSpacing={1}
            style={{transform: `scale(${emphasisPulse(N - (T_CNT + 10), {peak: 1.06, up: 4, hold: 2, down: 8})})`}}>hundreds of cities</CText>
        </SoftIn>
      </div>

      {/* SC04 承接的缩微城市圈（地图放大时融入并淡出） */}
      {miniOp > 0.01 ? <CityMini cx={MINI.cx} cy={MINI.cy} r={MINI.r} opacity={miniOp} /> : null}
    </>
  );
};
