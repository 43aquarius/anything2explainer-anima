import React from 'react';
import {useCurrentFrame} from 'remotion';
import {clamp01, easeInOutPow, easeOutCubic, FONT_ORB} from '../../common';
import {CameraRig} from '../../fx';
import {
  CText, MapFrame, RouteNote, Svg, CORAL, GREY, GREY_MID, GREY_LINE, PURPLE_LIGHT, WHITE,
  abs, softOp, firstOp, exitOp, mixHex,
} from '../../ui';
import {MapChip, qbez} from './g6ui';

/**
 * SC15 还在说 · N 3641–3926（S28 3649「And the map still redraws itself,」/ 3716「every few seconds,」
 *   + S29 3762「a hundred thousand diplomats」/ 3812「saying where everything is.」
 *   + S30 3877「It works because they keep talking.」；段内不判，S30 末块 48；终镜承接 SC16（地图不清场）
 * 画面：全幅 MapFrame 大地图（1010×336）+ 20 枚匿名小芯片 + 连线网；纸条流（带封小 RouteNote 快速掠过芯片间）；
 *   局部连线周期断开重画（红 4 帧 → 亮紫 8f → 回灰，三条错相循环）；芯片涟漪错峰 + 3877 全网「齐声」波；
 *   中央上方 `every few seconds`（Orbitron 52px 白+紫描边）+ 10 格 tick（每 30 帧一格逐格点亮）；
 *   3877 换标题 `they keep talking`（Noto 900 52px 白+紫描边）。
 * 运镜：慢推 1→1.12（3641–3856）→ 段末拉远 33f 1.12→1.0（3877–3910，为终镜收束）。
 * 零 glitch（白名单）。末 8 帧只淡文字层；地图/芯片/纸条流保留到末帧（SC16 缩微承接）。
 */
const F0 = 3641;
const TO = 3926;

// 节拍
const B_MAP = 3644;   // 大地图 draw-on（18f）
const B_CHIPS = 3652; // 芯片 2 帧错峰缩入
const B_LINKS = 3672; // 连线网 draw-on（12f/条，2 帧错峰）
const B_TICK = 3716;  // tick 刻度条 + 首轮断开→重连
const B_FLOW = 3762;  // 纸条流 + 芯片涟漪
const B_SAY = 3812;   // 灰字 + 纸条流加密
const B_TALK = 3877;  // they keep talking + 全网齐声波 + 拉远

// 版式
const MAP = {cx: 640, cy: 424, w: 1010, h: 336};
const CENTER = [640, 424];

/** 20 枚匿名小芯片（手工布点，均匀带随机感） */
const CHIPS: Array<[number, number]> = [
  [205, 316], [348, 288], [502, 320], [660, 284], [818, 318], [972, 288], [1102, 332],
  [178, 432], [322, 416], [482, 448], [642, 408], [802, 448], [952, 412], [1092, 452],
  [242, 548], [402, 558], [572, 532], [732, 556], [892, 542], [1042, 552],
];
const d2 = (a: number, b: number) => (CHIPS[a][0] - CHIPS[b][0]) ** 2 + (CHIPS[a][1] - CHIPS[b][1]) ** 2;
/** 连线网：每芯片接最近的前辈 + 每 3 个补一条次近弦 */
const LINKS: Array<[number, number]> = [];
for (let i = 1; i < CHIPS.length; i++) {
  const near = [...Array(i).keys()].sort((a, b) => d2(a, i) - d2(b, i));
  LINKS.push([near[0], i]);
  if (i % 3 === 0) LINKS.push([near[1], i]);
}
const LANES = [2, 6, 10, 14, 18, 22].filter((i) => i < LINKS.length); // 纸条流航线
const BREAKS = [5, 11, 19].filter((i) => i < LINKS.length);            // 周期断开重画的连线
const CYCLE = 120;
const BREAK_PHASE = [0, 40, 80];
const FLY_LEN = 20;

const linkGeom = (li: number) => {
  const [a, b] = LINKS[li];
  const [x0, y0] = CHIPS[a], [x1, y1] = CHIPS[b];
  const mx = (x0 + x1) / 2, my = (y0 + y1) / 2;
  const dx = x1 - x0, dy = y1 - y0;
  const L = Math.hypot(dx, dy) || 1;
  const off = (li % 2 ? 26 : -26);
  return {x0: x0 + (dx / L) * 26, y0: y0 + (dy / L) * 26, x1: x1 - (dx / L) * 26, y1: y1 - (dy / L) * 26, cx: mx + (-dy / L) * off, cy: my + (dx / L) * off};
};

export const SC15: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const tExit = exitOp(N, TO, 6); // 文字层末 6 帧归零（变陡，保尾部稳定期）；地图层保留（承接 SC16）

  // 地图 wipe draw-on
  const mapP = easeOutCubic(clamp01((N - B_MAP) / 18));
  const mapOp = firstOp(N - B_MAP, 6);

  // tick 组 slideUp + 标题
  const tickDy = 34 * Math.pow(1 - clamp01((N - B_TICK) / 14), 2.5);
  const titleFade = 1 - Math.pow(clamp01((N - 3864) / 12), 1.5); // every few seconds 让位

  // 纸条流：lane l 最近一次出发帧
  const laneDep = (l: number): number => {
    let best = -1;
    for (const [t0, P] of [[B_FLOW + l * 14, 96], [B_SAY + l * 11, 96]] as Array<[number, number]>) {
      if (N < t0) continue;
      const d = t0 + Math.floor((N - t0) / P) * P;
      if (d > best) best = d;
    }
    return best;
  };

  // 连线周期断开重画状态
  const linkCycle = (bi: number): {mode: 'red' | 'gap' | 'draw' | 'settle' | 'grey'; p: number} => {
    const t0 = B_TICK + BREAK_PHASE[bi];
    if (N < t0) return {mode: 'grey', p: 0};
    const ph = (N - t0) % CYCLE;
    if (ph < 4) return {mode: 'red', p: ph / 4};
    if (ph < 6) return {mode: 'gap', p: 0};
    if (ph < 14) return {mode: 'draw', p: (ph - 6) / 8};
    if (ph < 34) return {mode: 'settle', p: (ph - 14) / 20};
    return {mode: 'grey', p: 0};
  };

  // 芯片涟漪（周期）+ 3877 齐声波
  const rippleT = (i: number): number => {
    const t0 = B_FLOW + i * 9;
    if (N < t0) return -1;
    const P = 84 + (i % 4) * 6;
    const ph = (N - t0) % P;
    return ph < 24 ? ph / 24 : -1;
  };
  const waveT = (i: number): number => {
    const d = Math.hypot(CHIPS[i][0] - CENTER[0], CHIPS[i][1] - CENTER[1]);
    const wt = B_SAY + d / 24; // 齐声波提前到 S29 拍（3812），末段留出 ≥30f 安静区
    const n = N - wt;
    return n >= 0 && n < 16 ? n / 16 : -1;
  };

  return (
    <CameraRig
      N={N}
      keys={[
        {f: F0, x: 640, y: 360, s: 1},
        {f: 3811, x: 640, y: 352, s: 1.12},
        {f: 3844, x: 640, y: 352, s: 1.12},
        {f: 3877, x: 640, y: 360, s: 1},
      ]}
    >
      {/* ---- 地图层（保留到末帧，SC16 缩微承接） ---- */}
      <div style={{...abs(0, 0, 1280, 720)}}>
        <div style={{...abs(0, 0, 1280, 720), clipPath: `inset(-8% ${(100 * (1 - mapP)).toFixed(2)}% -8% 0)`, opacity: mapOp}}>
          <MapFrame cx={MAP.cx} cy={MAP.cy} w={MAP.w} h={MAP.h} glow />
        </div>

        {/* 连线网 + 断开重画 */}
        <Svg bloom={false}>
          {LINKS.map(([a, b], li) => {
            const bi = BREAKS.indexOf(li);
            const p = clamp01((N - (B_LINKS + li * 2)) / 12);
            if (p <= 0) return null;
            const g = linkGeom(li);
            if (bi >= 0) {
              const st = linkCycle(bi);
              if (st.mode === 'red') {
                return <line key={li} x1={g.x0} y1={g.y0} x2={g.x1} y2={g.y1} stroke={CORAL} strokeWidth={3} opacity={0.6 + 0.4 * Math.sin(st.p * Math.PI)} />;
              }
              if (st.mode === 'gap') return null;
              if (st.mode === 'draw') {
                return <line key={li} x1={g.x0} y1={g.y0} x2={g.x1} y2={g.y1} stroke={PURPLE_LIGHT} strokeWidth={3} pathLength={100} strokeDasharray={100} strokeDashoffset={100 * (1 - st.p)} opacity={0.95} />;
              }
              if (st.mode === 'settle') {
                return <line key={li} x1={g.x0} y1={g.y0} x2={g.x1} y2={g.y1} stroke={mixHex(PURPLE_LIGHT, GREY_MID, st.p)} strokeWidth={1.8} opacity={0.9} />;
              }
            }
            return <line key={li} x1={g.x0} y1={g.y0} x2={g.x1} y2={g.y1} stroke={GREY_MID} strokeWidth={1.8} opacity={0.8 * p} />;
          })}
        </Svg>

        {/* 匿名芯片群（2 帧错峰缩入） */}
        {CHIPS.map(([cx, cy], i) => {
          const n = N - (B_CHIPS + i * 2);
          if (n < 0) return null;
          const s = 0.4 + 0.6 * easeOutCubic(clamp01(n / 12));
          return <MapChip key={i} cx={cx} cy={cy} s={s} opacity={softOp(n, 5)} />;
        })}

        {/* 纸条流（带封小 RouteNote 沿连线掠过） */}
        {LANES.map((li, l) => {
          const dep = laneDep(l);
          if (dep < B_FLOW || N - dep > FLY_LEN + 3) return null;
          const t = easeInOutPow(2)(clamp01((N - dep) / FLY_LEN));
          const g = linkGeom(li);
          const [px, py] = qbez([g.x0, g.y0], [g.cx, g.cy], [g.x1, g.y1], t);
          const op = clamp01((N - dep) / 3) * (1 - clamp01((N - dep - 16) / 7));
          if (op <= 0.02) return null;
          const rot = (l % 2 ? 5 : -5) * Math.sin(Math.PI * t);
          return (
            <div key={`fly-${l}`} style={{...abs(px - 75, py - 47, 150, 94), opacity: op, transform: `rotate(${rot.toFixed(1)}deg)`, transformOrigin: '50% 50%'}}>
              <RouteNote x={0} y={0} w={150} h={94} prefix="" signed />
            </div>
          );
        })}

        {/* 芯片涟漪 + 3877 齐声波 */}
        <Svg bloom={false}>
          {CHIPS.map(([cx, cy], i) => {
            const rt = rippleT(i);
            return rt >= 0 ? <circle key={`rip-${i}`} cx={cx} cy={cy} r={14 + 26 * rt} fill="none" stroke={WHITE} strokeWidth={2} opacity={(0.5 * (1 - rt)).toFixed(3)} /> : null;
          })}
          {CHIPS.map(([cx, cy], i) => {
            const wt = waveT(i);
            return wt >= 0 ? <circle key={`wave-${i}`} cx={cx} cy={cy} r={16 + 30 * wt} fill="none" stroke={PURPLE_LIGHT} strokeWidth={2.6} opacity={(0.75 * (1 - wt)).toFixed(3)} /> : null;
          })}
        </Svg>
      </div>

      {/* ---- 文字层（末 8 帧归零） ---- */}
      <div style={{...abs(0, 0, 1280, 720), opacity: tExit}}>
        {/* every few seconds（Orbitron 52 白+紫描边；3864 让位） */}
        <div style={{...abs(0, 0, 1280, 720), opacity: softOp(N - 3712, 8) * titleFade}}>
          <CText cx={640} cy={160} size={52} weight={700} family={FONT_ORB} color={WHITE} letterSpacing={3}
            shadow="0 0 20px rgba(102,48,248,0.45)"
            style={{WebkitTextStroke: '2px rgba(161,117,241,0.9)', paintOrder: 'stroke fill'}}>every few seconds</CText>
        </div>

        {/* tick 刻度条（每 30 帧一格逐格点亮） */}
        <div style={{...abs(0, 0, 1280, 720), opacity: softOp(N - B_TICK, 8), transform: `translateY(${tickDy.toFixed(2)}px)`}}>
          {Array.from({length: 10}, (_, i) => {
            const litAt = 3720 + i * 30;
            const lk = clamp01((N - litAt) / 4);
            return (
              <div key={i} style={{
                position: 'absolute', left: 640 - 9.5 * 28 + i * 28 - 1.5, top: 190,
                width: 3, height: 14 + 6 * lk,
                background: mixHex(GREY_LINE, PURPLE_LIGHT, lk),
                boxShadow: lk > 0.5 ? `0 0 8px rgba(161,117,241,${(0.6 * lk).toFixed(2)})` : undefined,
              }} />
            );
          })}
        </div>

        {/* saying where everything is */}
        <div style={{...abs(0, 0, 1280, 720), opacity: softOp(N - B_SAY, 8)}}>
          <CText cx={640} cy={236} size={26} weight={500} color={GREY} letterSpacing={1}>saying where everything is</CText>
        </div>

        {/* they keep talking（Noto 900 52 白+紫描边） */}
        <div style={{...abs(0, 0, 1280, 720), opacity: softOp(N - (B_TALK - 6), 8)}}>
          <CText cx={640} cy={160} size={52} weight={900} color={WHITE} letterSpacing={1}
            shadow="0 0 22px rgba(102,48,248,0.5)"
            style={{WebkitTextStroke: '2.5px rgba(161,117,241,0.95)', paintOrder: 'stroke fill'}}>they keep talking</CText>
        </div>
      </div>
    </CameraRig>
  );
};
