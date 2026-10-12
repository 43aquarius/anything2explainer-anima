import React from 'react';
import {useCurrentFrame} from 'remotion';
import {clamp01, easeInOutPow, easeOutCubic, GlitchIn, FONT_ORB} from '../../common';
import {CameraRig} from '../../fx';
import {
  AsChip, CText, RouteNote, EXAMPLE, GREY, PURPLE_LIGHT, WHITE, abs, SoftIn, softOp, exitOp, glowOffK, scaleIn, Svg,
} from '../../ui';

/**
 * SC06 BGP 递纸条 · N 1199–1446（S09：1207「These diplomats trade notes」/ 1252「with a protocol called BGP:」
 *   S10：1326「I can reach this address block,」/ 1378「through these networks." Pass it on.」）
 * 版式：三枚 AsChip 三角站位（左 `AS64512` / 右 `AS1299` / 右上 `AS65500`，120×120，虚线互连）；
 *   顶部标题 `BGP`（Orbitron 88px 白+紫描边）；一枚 RouteNote（270×172：`203.0.113.0/24` + `via AS1299 · AS64512`）
 *   从左芯片弹出 → kf 弧线飞向右芯片（残影）→ 右芯片灯双闪 + 纸条缩小停靠 → 分身拉出 → 飞向右上芯片停靠（「传下去」）；
 *   下方灰字 `pass it on`；三线光点持续流动。
 * 动效：1207 芯片 2 帧错峰缩入 + 连线 draw-on（1214/17/20）；1252 `BGP` GlitchIn（rgbSplit 6，本镜唯一 glitch）
 *   + 紫光晕 + 连线脉冲一次（光点 A→B→C）；1258 起三线低密度光点（1385 加密，持续动作）；
 *   1326 纸条弹出（0.3→1，8f）→ 1334 弧线飞行 22f（2 道残影）→ 1358 停靠 + 右芯片灯双闪 + 双圈读信涟漪；
 *   1378 分身 6 帧拉出 → 1384 飞向右上芯片 20f → 1404 停靠 + C 芯片描边转紫 + 落地圈；1406 `pass it on` SoftIn。
 * 运镜：33f 1→1.12 推向纸条航线（1328–1361，不进末拍）。停留：段内不判（S10 末块 67）。末 8 帧归零。
 */
const F0 = 1199;
const TO = 1446;
const T_CHIPS = 1207, T_BGP = 1252, T_PULSE = 1254, T_DOTS = 1258;
const T_NOTE = 1326, T_FLY = 1334, T_DOCK = 1357, T_COPY = 1378, T_FLY2 = 1384, T_LAND2 = 1404, T_PASS = 1406;

// 三芯片三角站位
const CHIPS = [
  {asn: EXAMPLE.asnYou, cx: 330, cy: 430},   // 左：AS64512
  {asn: EXAMPLE.asnMid1, cx: 890, cy: 470},  // 右：AS1299
  {asn: EXAMPLE.asnSide, cx: 1000, cy: 220},  // 右上：AS65500
];
// 虚线连接（自源芯片一侧 wipe 生长）
const LINES: Array<{x0: number; y0: number; x1: number; y1: number; t0: number; side: 'right' | 'bottom'; dur: number}> = [
  {x0: 390, y0: 448, x1: 830, y1: 462, t0: 1214, side: 'right', dur: 16}, // A—B
  {x0: 372, y0: 372, x1: 948, y1: 272, t0: 1217, side: 'right', dur: 16}, // A—C
  {x0: 940, y0: 412, x1: 1005, y1: 282, t0: 1220, side: 'bottom', dur: 16}, // B—C
];
// 纸条航线（二次贝塞尔，中心坐标）
const FLY1_P0: [number, number] = [455, 340], FLY1_C: [number, number] = [615, 305], FLY1_P1: [number, number] = [950, 390];
const FLY2_P0: [number, number] = [985, 368], FLY2_C: [number, number] = [1080, 325], FLY2_P1: [number, number] = [895, 306];
const NOTE = {w: 270, h: 172};

const bez = (t: number, P0: [number, number], C: [number, number], P1: [number, number]): [number, number] => {
  const u = 1 - t;
  return [u * u * P0[0] + 2 * u * t * C[0] + t * t * P1[0], u * u * P0[1] + 2 * u * t * C[1] + t * t * P1[1]];
};

/** 纸条渲染件（中心定位 + 旋转缩放 + 白微光） */
const NoteAt: React.FC<{cx: number; cy: number; s: number; rot?: number; op: number; glow?: boolean; children?: React.ReactNode}> = ({cx, cy, s, rot = 0, op, glow = true, children}) => (
  <div style={{
    position: 'absolute', left: cx - NOTE.w / 2, top: cy - NOTE.h / 2, width: NOTE.w, height: NOTE.h, opacity: op,
    transformOrigin: '50% 50%', transform: `rotate(${rot.toFixed(1)}deg) scale(${s.toFixed(3)})`,
    filter: glow ? 'drop-shadow(0 0 5px rgba(255,255,255,0.35))' : undefined,
  }}>
    <RouteNote x={0} y={0} w={NOTE.w} h={NOTE.h} prefix={EXAMPLE.prefix} via={`via ${EXAMPLE.asnMid1} \u00b7 ${EXAMPLE.asnYou}`} />
    {children}
  </div>
);

export const SC06: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const exit = exitOp(N, TO, 8);
  const gk = glowOffK(N, TO);

  // 连线亮度：1252 脉冲一次时提亮
  const pulseN = N - T_PULSE;
  const lineBoost = pulseN >= 0 && pulseN < 24 ? Math.sin((Math.PI * pulseN) / 24) : 0;

  // 脉冲光点：A→B（12f）→ B→C（10f）
  let pulseDot: {x: number; y: number} | null = null;
  if (pulseN >= 0 && pulseN < 22) {
    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
    if (pulseN < 12) {
      const t = easeInOutPow(2)(pulseN / 12);
      pulseDot = {x: lerp(LINES[0].x0, LINES[0].x1, t), y: lerp(LINES[0].y0, LINES[0].y1, t)};
    } else {
      const t = easeInOutPow(2)((pulseN - 12) / 10);
      pulseDot = {x: lerp(LINES[2].x0, LINES[2].x1, t), y: lerp(LINES[2].y0, LINES[2].y1, t)};
    }
  }

  // 三线光点（低密度 1258 起；1385 加密，持续动作）
  const dotA = 0.28 + 0.5 * clamp01((N - 1385) / 8);

  // ---- 纸条状态机 ----
  // 原件：1326 弹出（0.3→1，8f）→ 1334 弧线 22f → 1357 停靠缩小（1→0.5，10f）→ 常驻 B 右上角
  let orig: {cx: number; cy: number; s: number; rot: number} | null = null;
  const nNote = N - T_NOTE;
  if (nNote >= 0 && N < T_FLY) {
    orig = {cx: FLY1_P0[0], cy: FLY1_P0[1], s: 0.3 + 0.7 * scaleIn(nNote, 8), rot: -3};
  } else if (N >= T_FLY && N < T_DOCK) {
    const u = easeInOutPow(2)(clamp01((N - T_FLY) / 22));
    const [px, py] = bez(u, FLY1_P0, FLY1_C, FLY1_P1);
    orig = {cx: px, cy: py, s: 1, rot: 5 * Math.sin(Math.PI * clamp01(u))};
  } else if (N >= T_DOCK) {
    const k = 1 - 0.5 * easeOutCubic(clamp01((N - T_DOCK) / 10)); // 1 → 0.5
    orig = {cx: FLY1_P1[0], cy: FLY1_P1[1], s: k, rot: -4};
  }
  const origOp = softOp(nNote, 5) * exit;

  // 副本：1378 从停靠位拉出（6f）→ 1384 飞向 C 20f（末端缩到 0.55）→ 停靠 C 左下
  let copy: {cx: number; cy: number; s: number; rot: number; op: number} | null = null;
  if (N >= T_COPY && N < T_FLY2) {
    const k = clamp01((N - T_COPY) / 6);
    copy = {cx: FLY1_P1[0] + 35 * k, cy: FLY1_P1[1] - 22 * k, s: 0.5 + 0.45 * k, rot: -4 + 9 * k, op: 0.4 + 0.6 * k};
  } else if (N >= T_FLY2 && N < T_LAND2) {
    const u = easeInOutPow(2)(clamp01((N - T_FLY2) / 20));
    const [px, py] = bez(u, FLY2_P0, FLY2_C, FLY2_P1);
    const s = N >= T_LAND2 - 8 ? 0.95 - 0.4 * clamp01((N - (T_LAND2 - 8)) / 8) : 0.95;
    copy = {cx: px, cy: py, s, rot: -5 * Math.sin(Math.PI * clamp01(u)), op: 1};
  } else if (N >= T_LAND2) {
    copy = {cx: FLY2_P1[0], cy: FLY2_P1[1], s: 0.55, rot: 5, op: 1};
  }
  const copyOp = copy ? copy.op * exit : 0;

  // B 读信：灯双闪（2 次）+ 双圈涟漪
  const bFlash = N >= T_DOCK && N <= T_DOCK + 14 && ((N - T_DOCK) % 7) < 4;
  const bRing = (k: number) => {
    const n = N - (T_DOCK + k * 7);
    if (n < 0 || n > 12) return null;
    const p = n / 12;
    return {r: 66 + 44 * easeOutCubic(p), op: 0.7 * (1 - p)};
  };
  // C 落地圈
  const cRingN = N - T_LAND2;

  return (
    <CameraRig N={N} keys={[{f: F0, x: 640, y: 360, s: 1}, {f: 1328, x: 640, y: 360, s: 1}, {f: 1361, x: 620, y: 400, s: 1.12}]}>
      <div style={{...abs(0, 0, 1280, 720), opacity: exit}}>
        {/* 虚线连接（draw-on + 脉冲提亮） */}
        {LINES.map((L, i) => {
          const p = easeOutCubic(clamp01((N - L.t0) / L.dur));
          if (p <= 0) return null;
          const clip = L.side === 'right' ? `inset(0 ${(100 - 100 * p).toFixed(2)}% 0 0)` : `inset(0 0 ${(100 - 100 * p).toFixed(2)}% 0)`;
          return (
            <div key={i} style={{...abs(0, 0, 1280, 720), clipPath: clip}}>
              <Svg bloom={false}>
                <line x1={L.x0} y1={L.y0} x2={L.x1} y2={L.y1} stroke={GREY} strokeWidth={2} strokeDasharray="8 7" opacity={0.5 + 0.5 * lineBoost} />
              </Svg>
            </div>
          );
        })}

        {/* 三线光点（持续） */}
        {N >= T_DOTS ? (
          <Svg>
            {[
              {L: LINES[0], t: ((N - T_DOTS) / 44) % 1, d: 0},
              {L: LINES[0], t: ((N - T_DOTS) / 44 + 0.5) % 1, d: 1},
              {L: LINES[2], t: ((N - T_DOTS) / 30 + 0.3) % 1, d: 2},
              {L: LINES[1], t: ((N - T_DOTS) / 52 + 0.15) % 1, d: 3},
            ].map(({L, t, d}) => {
              const op = dotA * clamp01(Math.min(t * 6, (1 - t) * 6)) * gk;
              if (op <= 0.03) return null;
              const px = L.x0 + (L.x1 - L.x0) * t, py = L.y0 + (L.y1 - L.y0) * t;
              return (
                <g key={d} opacity={op.toFixed(2)}>
                  <circle cx={px.toFixed(1)} cy={py.toFixed(1)} r={6.5} fill="rgba(102,48,248,0.32)" />
                  <circle cx={px.toFixed(1)} cy={py.toFixed(1)} r={3.2} fill={WHITE} />
                </g>
              );
            })}
            {/* 1252 连线脉冲光点 */}
            {pulseDot ? (
              <g>
                <circle cx={pulseDot.x.toFixed(1)} cy={pulseDot.y.toFixed(1)} r={11} fill="rgba(102,48,248,0.4)" />
                <circle cx={pulseDot.x.toFixed(1)} cy={pulseDot.y.toFixed(1)} r={5} fill={WHITE} />
              </g>
            ) : null}
          </Svg>
        ) : null}

        {/* 三枚 AsChip（2 帧错峰缩入；C 收到纸条后描边转紫） */}
        {CHIPS.map((ch, i) => {
          const st = T_CHIPS + i * 2;
          const op = softOp(N - st, 6);
          if (op <= 0.02) return null;
          const s = scaleIn(N - st, 14);
          return (
            <div key={ch.asn} style={{...abs(0, 0, 1280, 720), transform: `scale(${s.toFixed(4)})`, transformOrigin: `${ch.cx}px ${ch.cy}px`, opacity: op}}>
              <AsChip cx={ch.cx} cy={ch.cy} w={120} h={120} asn={ch.asn} led="on" accent={i === 2 && N >= T_LAND2 - 2} glow />
            </div>
          );
        })}

        {/* B 读信：灯双闪 + 涟漪 */}
        {bFlash ? <div style={{...abs(CHIPS[1].cx + 50 - 7, CHIPS[1].cy + 50 - 7, 14, 14), borderRadius: '50%', background: WHITE, boxShadow: `0 0 12px rgba(255,255,255,${(0.85 * gk).toFixed(2)})`}} /> : null}
        <Svg bloom={false}>
          {[0, 1].map((k) => {
            const r = bRing(k);
            if (!r) return null;
            return <circle key={k} cx={CHIPS[1].cx} cy={CHIPS[1].cy} r={r.r.toFixed(1)} fill="none" stroke={WHITE} strokeWidth={2.5} opacity={(r.op * gk).toFixed(2)} />;
          })}
          {/* C 落地圈（分身到达） */}
          {cRingN >= 0 && cRingN <= 12 ? (
            <circle cx={CHIPS[2].cx} cy={CHIPS[2].cy} r={(64 + 40 * easeOutCubic(cRingN / 12)).toFixed(1)} fill="none" stroke={PURPLE_LIGHT} strokeWidth={2.5} opacity={(0.7 * (1 - cRingN / 12) * gk).toFixed(2)} />
          ) : null}
        </Svg>

        {/* 顶部标题 BGP（Orbitron 88 白+紫描边，本镜唯一 glitch：rgbSplit 6） */}
        <GlitchIn N={N} f0={T_BGP} rgbSplit={6} seed={9}>
          <CText cx={640} cy={185} size={88} weight={700} family={FONT_ORB} color={WHITE} letterSpacing={6}
            shadow={`0 0 26px rgba(102,48,248,${(0.5 * gk).toFixed(2)})`}
            style={{WebkitTextStroke: '2.5px rgba(161,117,241,0.9)', paintOrder: 'stroke fill'}}>BGP</CText>
        </GlitchIn>

        {/* 纸条（原件）：弹出 → 弧线飞行（残影）→ 停靠 B */}
        {orig && N < T_DOCK ? (
          <>
            {(() => {
              const u = easeInOutPow(2)(clamp01((N - T_FLY) / 22));
              if (u <= 0.09) return null;
              const [gx, gy] = bez(Math.max(0, u - 0.09), FLY1_P0, FLY1_C, FLY1_P1);
              return <NoteAt cx={gx} cy={gy} s={1} rot={orig.rot} op={0.2 * origOp} glow={false} />;
            })()}
            {(() => {
              const u = easeInOutPow(2)(clamp01((N - T_FLY) / 22));
              if (u <= 0.18) return null;
              const [gx, gy] = bez(Math.max(0, u - 0.18), FLY1_P0, FLY1_C, FLY1_P1);
              return <NoteAt cx={gx} cy={gy} s={1} rot={orig.rot} op={0.09 * origOp} glow={false} />;
            })()}
          </>
        ) : null}
        {orig ? <NoteAt cx={orig.cx} cy={orig.cy} s={orig.s} rot={orig.rot} op={origOp} /> : null}

        {/* 纸条（副本）：拉出 → 飞向 C → 停靠（残影） */}
        {copy && N >= T_FLY2 && N < T_LAND2 ? (
          (() => {
            const u = easeInOutPow(2)(clamp01((N - T_FLY2) / 20));
            if (u <= 0.12) return null;
            const [gx, gy] = bez(Math.max(0, u - 0.12), FLY2_P0, FLY2_C, FLY2_P1);
            return <NoteAt cx={gx} cy={gy} s={0.95} rot={copy.rot} op={0.18 * copyOp} glow={false} />;
          })()
        ) : null}
        {copy ? <NoteAt cx={copy.cx} cy={copy.cy} s={copy.s} rot={copy.rot} op={copyOp} /> : null}

        {/* pass it on */}
        <SoftIn N={N} f0={T_PASS}>
          <CText cx={640} cy={572} size={26} weight={600} color={GREY}>pass it on</CText>
        </SoftIn>
      </div>
    </CameraRig>
  );
};
