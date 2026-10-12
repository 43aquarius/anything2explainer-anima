import React from 'react';
import {useCurrentFrame} from 'remotion';
import {clamp01, easeInOutPow, easeOutCubic, powOutRemain, FONT_ORB} from '../../common';
import {CameraRig} from '../../fx';
import {
  RackIcon, PacketIcon, LineArrow, CText, EXAMPLE, GREY, GREY_LIGHT, GREY_MID, WHITE, mixHex,
  abs, SoftIn, softOp, exitOp, glowOffK, scaleIn, Svg,
} from '../../ui';
import {LaptopGlyph, quadPt} from './g2ui';

/**
 * SC07 问服务器 · N 1321–1503
 *   S12：1329「But your laptop can't afford」/ 1370「an atomic clock.」
 *   S13：1413「So it asks a server —」/ 1460「and that server asks another,」（块起 1329/1370/1413/1460）
 * 版式：中央对角递升链 your laptop（320,500，屏内石英钟灰）→ time.example 服务器×2（700,415 白 116×196 /
 *   985,285 灰 94×160，越往上越小越灰）→ 末端虚化问号轮廓（1145,178 虚线圈 + ?，虚线缓爬）；
 *   连线 LineArrow×2 + 询问信封（PacketIcon）逐跳上行，到站白圈 + 灯闪；`further from the source` 灰字。
 * 动效：1323 笔记本缩入（拍 1329 前挂 −6）+ 1333 摇头小弧动一拍（「没有」）；
 *   1370 `can't afford one` SoftIn；1413 服务器一 slideUp（Δ60/16f）+ 连线一 draw-on + 信封第一跳（16f）+ 到站圈/灯闪；
 *   1454 服务器二轻落（拍 1460 前挂 −6；缩入+淡入，不做大滑——「越往上越远」的远处感）+ 全链亮度自下而上递减（10f）
 *   + 连线二 draw-on + 信封第二跳（12f）+ `?` SoftIn + 1458 `further from the source` SoftIn；
 *   此后信封停靠 server2→? 方向、低幅小跳（持续）。段末 5 帧归零、光先灭。
 * 运镜：1.0→1.05 慢推（1321–1453，末 key = TO−50 ✓）。停留：段内不判（S13 末块 41）。
 * 尾部硬规则：末拍拍点 1458 ≤ TO−45 ✓（分镜表 1460+26 的级联/问号/灰字全部前挂）。
 */
const F0 = 1321;
const TO = 1503;
const T_LAPTOP = 1323, T_SHAKE = 1333, T_CANT = 1370;
const T_S1 = 1413, T_ARROW1 = 1419, T_HOP1 = 1413, T_LAND1 = 1429;
const T_S2 = 1454, T_ARROW2 = 1454, T_HOP2 = 1456, T_LAND2 = 1468, T_Q = 1456, T_FURTHER = 1458, T_CASCADE = 1456;

const LAPTOP = {cx: 320, cy: 500, w: 120};
const S1 = {cx: 700, cy: 415, w: 116, h: 196, units: 6};
const S2 = {cx: 985, cy: 285, w: 94, h: 160, units: 5};
const QG = {cx: 1145, cy: 178};
// 信封航线（二次贝塞尔）
const HOP1 = {p0: [385, 458] as [number, number], c: [515, 398] as [number, number], p1: [642, 448] as [number, number]};
const HOP2 = {p0: [722, 328] as [number, number], c: [825, 272] as [number, number], p1: [932, 318] as [number, number]};
const DOCK = {cx: 1075, cy: 238}; // 停靠位（server2 → ? 方向上）

export const SC07: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const exit = exitOp(N, TO, 5);
  const gk = glowOffK(N, TO, 3, 5);

  // 摇头小弧动（一拍，衰减正弦）
  const shakeN = N - T_SHAKE;
  const shakeRot = shakeN >= 0 && shakeN < 20 ? 4 * Math.sin((Math.PI * 2 * shakeN) / 20) * powOutRemain(shakeN, 20, 1.2) : 0;

  // 全链亮度自下而上递减（server1 随 server2 到场而压灰；laptop 保持最亮 = 链条近端）
  const casK = clamp01((N - T_CASCADE) / 10);
  const s1Color = mixHex(WHITE, GREY_MID, 0.35 * casK);
  const s2Color = mixHex(WHITE, GREY_MID, 0.45);

  // 服务器一：slideUp Δ60/16f；到站灯闪（lit 6→5）
  const s1Op = N < T_S1 ? 0 : softOp(N - T_S1, 8);
  const s1Dy = 60 * powOutRemain(N - T_S1, 16, 2.5);
  const s1Lit = N >= T_LAND1 && N < T_LAND1 + 14 ? S1.units : S1.units - 1;
  // 服务器二：轻落（缩入 + 淡入，无大滑）
  const s2Op = N < T_S2 ? 0 : softOp(N - T_S2, 10) * 0.95;
  const s2S = 0.95 + 0.05 * scaleIn(N - T_S2, 8);
  const s2Lit = N >= T_LAND2 && N < T_LAND2 + 12 ? S2.units : 3;

  // 到站白圈（涟漪）
  const ring = (t0: number, cx: number, cy: number) => {
    const n = N - t0;
    if (n < 0 || n > 12) return null;
    const p = n / 12;
    return <circle cx={cx} cy={cy} r={(14 + 26 * easeOutCubic(p)).toFixed(1)} fill="none" stroke={WHITE} strokeWidth={2.5} opacity={(0.75 * (1 - p) * gk).toFixed(2)} />;
  };

  // 信封状态机：第一跳 → 停靠 server1 肩 → 第二跳 → 停靠 DOCK 低幅小跳（持续）
  let env: {cx: number; cy: number; rot: number; op: number} | null = null;
  if (N >= T_HOP1 && N < T_HOP2) {
    const t = easeInOutPow(2)(clamp01((N - T_HOP1) / 16));
    const [px, py] = quadPt(t, HOP1.p0, HOP1.c, HOP1.p1);
    env = {cx: px, cy: py, rot: 6 * Math.sin(Math.PI * t), op: 1};
  } else if (N >= T_HOP2 && N < T_LAND2) {
    const t = easeInOutPow(2)(clamp01((N - T_HOP2) / 12));
    const [px, py] = quadPt(t, HOP2.p0, HOP2.c, HOP2.p1);
    env = {cx: px, cy: py, rot: -6 * Math.sin(Math.PI * t), op: 1};
  } else if (N >= T_LAND2) {
    const bob = 3 * Math.sin((Math.PI * 2 * (N - T_LAND2)) / 36) * powOutRemain(N - T_LAND2, 90, 0.6);
    env = {cx: DOCK.cx, cy: DOCK.cy + bob, rot: -4, op: 1};
  }
  const envOp = env ? env.op * exit : 0;

  // 残影（飞行中的信封尾迹）
  const ghostAt = (t0: number, hop: {p0: [number, number]; c: [number, number]; p1: [number, number]}, dur: number) => {
    const t = easeInOutPow(2)(clamp01((N - t0) / dur)) - 0.09;
    if (t <= 0.02) return null;
    const [px, py] = quadPt(t, hop.p0, hop.c, hop.p1);
    return <PacketIcon cx={px} cy={py} opacity={0.16 * envOp} />;
  };

  return (
    <CameraRig N={N} keys={[{f: F0, x: 640, y: 360, s: 1}, {f: 1453, x: 640, y: 360, s: 1.05}]}>
      <div style={{...abs(0, 0, 1280, 720), opacity: exit}}>
        {/* 连线一（laptop → server1，LineArrow draw-on 14f）+ 连线二（server1 → server2，12f） */}
        <Svg bloom={false} style={{opacity: exit}}>
          <g opacity={softOp(N - T_ARROW1, 5)}>
            <LineArrow x0={390} y0={485} x1={630} y1={448} p={easeOutCubic(clamp01((N - T_ARROW1) / 14))}
              rodW={2.2} headL={18} headW={18} color={GREY} dashed />
          </g>
          <g opacity={softOp(N - T_ARROW2, 5)}>
            <LineArrow x0={728} y0={330} x1={924} y1={322} p={easeOutCubic(clamp01((N - T_ARROW2) / 12))}
              rodW={2.2} headL={16} headW={16} color={GREY_MID} dashed />
          </g>
        </Svg>

        {/* 笔记本（缩入 + 摇头一拍 + 屏内石英钟） */}
        <div style={{...abs(0, 0, 1280, 720), opacity: N < T_LAPTOP ? 0 : softOp(N - T_LAPTOP, 8)}}>
          <div style={{...abs(0, 0, 1280, 720), transform: `scale(${(0.7 + 0.3 * scaleIn(N - T_LAPTOP, 14)).toFixed(4)})`, transformOrigin: `${LAPTOP.cx}px ${LAPTOP.cy}px`}}>
            <LaptopGlyph cx={LAPTOP.cx} cy={LAPTOP.cy} w={LAPTOP.w} N={N} rot={shakeRot} screenClock="grey" glow />
          </div>
          <CText cx={LAPTOP.cx} cy={556} size={22} weight={600} color={GREY_LIGHT} opacity={softOp(N - T_LAPTOP - 4, 8)}>{EXAMPLE.laptop}</CText>
        </div>
        {/* can't afford one（1370） */}
        <SoftIn N={N} f0={T_CANT} style={{opacity: exit}}>
          <CText cx={LAPTOP.cx} cy={592} size={24} weight={600} color={GREY}>can&apos;t afford one</CText>
        </SoftIn>

        {/* 服务器一 time.example（slideUp + 到站灯闪；级联后压灰） */}
        {s1Op > 0.02 ? (
          <div style={{...abs(0, 0, 1280, 720), opacity: s1Op, transform: `translateY(${s1Dy.toFixed(1)}px)`}}>
            <RackIcon cx={S1.cx} cy={S1.cy} w={S1.w} h={S1.h} units={S1.units} lit={s1Lit}
              color={s1Color} label={EXAMPLE.server} labelSize={22} glow={N < TO - 8} />
          </div>
        ) : null}

        {/* 服务器二 time.example（轻落 + 略小 + 描边渐灰） */}
        {s2Op > 0.02 ? (
          <div style={{...abs(0, 0, 1280, 720), opacity: s2Op, transform: `scale(${s2S.toFixed(4)})`, transformOrigin: `${S2.cx}px ${S2.cy}px`}}>
            <RackIcon cx={S2.cx} cy={S2.cy} w={S2.w} h={S2.h} units={S2.units} lit={s2Lit}
              color={s2Color} label={EXAMPLE.server} labelSize={22} />
          </div>
        ) : null}

        {/* 末端虚化问号轮廓（虚线缓爬 = 「还有上一台吗」） */}
        <SoftIn N={N} f0={T_Q} style={{opacity: exit}}>
          <div style={{...abs(0, 0, 1280, 720), opacity: 0.72}}>
            <Svg bloom={false}>
              <circle cx={QG.cx} cy={QG.cy} r={26} fill="none" stroke={GREY_MID} strokeWidth={2.5}
                strokeDasharray="5 7" strokeDashoffset={-(N * 0.9).toFixed(1)} />
            </Svg>
            <CText cx={QG.cx} cy={QG.cy} size={40} weight={700} family={FONT_ORB} color={GREY}>?</CText>
          </div>
        </SoftIn>

        {/* 信封（逐跳上行 + 残影 + 停靠低幅小跳） */}
        {env && N >= T_HOP1 && N < T_HOP2 ? ghostAt(T_HOP1, HOP1, 16) : null}
        {env && N >= T_HOP2 && N < T_LAND2 ? ghostAt(T_HOP2, HOP2, 12) : null}
        {env ? (
          <div style={{...abs(0, 0, 1280, 720), transform: `rotate(${env.rot.toFixed(2)}deg)`, transformOrigin: `${env.cx}px ${env.cy}px`, opacity: envOp}}>
            <PacketIcon cx={env.cx} cy={env.cy} glow={N < TO - 8} />
          </div>
        ) : null}

        {/* 到站白圈 + 服务器一压灰后的呼吸收束 */}
        <Svg style={{opacity: exit}}>
          {ring(T_LAND1, HOP1.p1[0], HOP1.p1[1])}
          {ring(T_LAND2, HOP2.p1[0], HOP2.p1[1])}
        </Svg>

        {/* further from the source（级联文字，前挂至 1458） */}
        <SoftIn N={N} f0={T_FURTHER} style={{opacity: exit}}>
          <CText cx={1000} cy={452} size={24} weight={600} color={GREY}>further from the source</CText>
        </SoftIn>
      </div>
    </CameraRig>
  );
};
