import React from 'react';
import {useCurrentFrame} from 'remotion';
import {GlitchIn, clamp01, powOutRemain, emphasisPulse, FONT_MONO, FONT_ORB, FONT_WIDE} from '../../common';
import {
  CText, Box, Pill, LineArrow, abs, softOp, exitOp, glowOffK, exitAccel, SoftIn,
  WHITE, GREY, GREY_MID, PURPLE, PURPLE_LIGHT, PURPLE_DEEP, ORANGE, BLOOM,
} from '../../ui';
import {HeroGlow} from '../../fx';

/**
 * SC11 反转：QUIC · N 1376–1644（S12 1384–1489 + S13 1500–1642 ¶+gap12 段末）
 * 版式（竖版安全区 y240–990 / x40–620，中轴 360）：
 *   竖版三层堆叠卡（各 480×200，cy 350/580/810——分镜表原 y 320/560/800 上移 +30 保顶卡不出 y240 安全区）：
 *   顶层 `HTTP/3`（Noto 900 64px 白+紫描边 + `2022` 等宽 24px 灰）；中层 `QUIC`（Audiowide 60px + `2021` 打字机 +
 *   卡内 2×2 四枚机制 Pill `handshake` `recovery` `encryption` `streams` 24px 紫边）；底层 `UDP`（Orbitron 56px + 橙边卡）；
 *   三层间两条短竖线（x360，draw-on）；左侧一支竖直大箭头 x68 自顶贯底（y268–892，wipe 20 帧）+ `rides on` 24px 旋转 90°。
 * 节拍：1384 `plot twist` 灰字 SoftIn（=S12 块首）→ 1412–1428 淡出；1418 顶层卡 slideUp Δ80/22 帧 + `HTTP/3`
 *   GlitchIn（本镜唯一 glitch，rgbSplit 6）+ 1440 落位白闪 2 帧 + 1444 `2022` SoftIn（对齐块内 the newest HTTP ~1420）；
 *   1500 中层 QUIC 卡 slideUp + 紫光点亮 + 竖线① draw-on（20 帧）+ 1524 `2021` 打字机（2 帧/字）；
 *   1536/1546/1556/1566 四枚机制 Pill 逐个 SoftIn（10 帧错峰 = 「rebuilt TCP's promises」的持续动作感）；
 *   1571 底层 UDP 卡 slideUp（18 帧）+ 橙光点亮 + 竖线② + 大箭头 20 帧自顶 wipe → 1591；1589 `rides on` SoftIn；
 *   1594/1600/1606 三层卡自上而下 1.03 微脉冲一轮（已落位元素的强调，非新入场）。
 * 停留：底层+箭头落位 1591 → 离场 1636（末 8 帧归零），45 帧 ✓（分镜表按 1571+18 计；微脉冲至 1618 属强调非末拍）。
 * 运镜：无（分镜表清单不含 SC11）。零扫光。主角：三层堆叠卡组 y250–910（660px 高）；光 = 顶/中紫光、底橙光。
 */
const F0 = 1376;
const TO = 1644;
const T_TWIST = 1384;
const T_TOP = 1418, TOP_LEN = 22, T_GLI = 1420, T_FLASH = 1440, T_Y1 = 1444;
const T_MID = 1500, MID_LEN = 22, T_CONN1 = 1508, T_TYPE = 1524;
const T_PILL = [1536, 1546, 1556, 1566];
const T_BOT = 1571, BOT_LEN = 18, T_CONN2 = 1574, T_ARROW = 1571, ARROW_LEN = 20, T_RIDE = 1589;
const T_PULSE = [1572, 1578, 1584]; // 成片 v2c：再前挂 6 帧，1596 前收尾
const EXIT = TO - 8; // 1636

const CARD = {x: 120, w: 480, h: 200};
const TOP = {cy: 350}, MID = {cy: 580}, BOT = {cy: 810};
const CONN = [{y0: 452, y1: 478}, {y0: 682, y1: 708}];
const ARROW = {x: 68, y0: 268, y1: 892};
const RIDE = {cx: 104, cy: 582};

const YEAR1 = '2022';
const YEAR2 = '2021';
const PILLS = [
  {text: 'handshake', x: 203, y: 572, w: 158},
  {text: 'recovery', x: 375, y: 572, w: 144},
  {text: 'encryption', x: 203, y: 616, w: 172},
  {text: 'streams', x: 389, y: 616, w: 130},
];

const cardIn = (N: number, t: number, len = 22) => {
  const n = N - t;
  if (n < 0) return null;
  return {dy: 80 * powOutRemain(n, len, 2.5), op: Math.min(1, (n + 1) / 9)};
};

export const SC11: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const exOp = exitOp(N, TO, 6); // 成片 v2：离场 6 帧腾稳定期
  if (exOp <= 0) return null;
  const exDy = exitAccel(Math.max(0, N - EXIT), 0.15);
  const gk = glowOffK(N, TO, 3, 4); // 成片 v2c：光灭推迟到 1637（避免 1635 假性大变化）

  // —— plot twist（灰字过场，1412 起淡出）——
  const twistOp = softOp(N - T_TWIST, 8) * (1 - clamp01((N - 1412) / 16));

  // —— 卡入场（slideUp Δ80 + 淡入）——
  const top = cardIn(N, T_TOP);
  const mid = cardIn(N, T_MID);
  const bot = cardIn(N, T_BOT, BOT_LEN);
  const topFlash = N >= T_FLASH && N < T_FLASH + 2;

  // —— `2021` 打字机 + 光标 ——
  const tyN = N - T_TYPE;
  const tyShown = Math.max(0, Math.min(YEAR2.length, Math.floor(tyN / 2)));
  const tyDone = tyShown >= YEAR2.length;
  const cursor = Math.floor(N / 8) % 2 === 0;

  // —— 竖线 draw-on（20/16 帧）——
  const connP = [clamp01((N - T_CONN1) / 20), clamp01((N - T_CONN2) / 16)];
  const arrowP = clamp01((N - T_ARROW) / ARROW_LEN);

  // —— 三层卡 1.03 微脉冲（自上而下一轮）——
  const pulse = (t: number) => emphasisPulse(N - t, {peak: 1.03, up: 5, hold: 2, down: 5});
  const pT = pulse(T_PULSE[0]), pM = pulse(T_PULSE[1]), pB = pulse(T_PULSE[2]);

  return (
    <div style={{position: 'absolute', inset: 0, opacity: exOp, transform: exDy ? `translateY(${exDy.toFixed(1)}px)` : undefined}}>
      {/* ===== plot twist（灰字过场）===== */}
      {twistOp > 0 ? (
        <CText cx={360} cy={560} size={28} weight={500} family={FONT_MONO} color={GREY} opacity={twistOp} dy={0}>plot twist</CText>
      ) : null}

      {/* ===== 顶层卡 HTTP/3（紫光；slideUp + GlitchIn + 落位白闪）===== */}
      {top ? (
        <>
          <HeroGlow x={CARD.x} y={TOP.cy - CARD.h / 2} w={CARD.w} h={CARD.h} r={14} N={N} k={top.op * gk} />
          <div style={{position: 'absolute', inset: 0, opacity: top.op, transform: `translateY(${top.dy.toFixed(1)}px) scale(${pT.toFixed(4)})`, transformOrigin: '360px 350px',
            filter: topFlash ? 'brightness(1.5)' : undefined}}>
            <Box x={CARD.x} y={TOP.cy - CARD.h / 2} w={CARD.w} h={CARD.h} r={14} stroke={WHITE} sw={2.5} fill="rgba(0,0,0,0.82)" />
            <GlitchIn N={N} f0={T_GLI} rgbSplit={6} seed={33}>
              <CText cx={324} cy={348} size={64} weight={900} color={WHITE} letterSpacing={1}
                shadow={`0 0 26px rgba(102,48,248,${(0.5 * gk).toFixed(2)})`}
                style={{WebkitTextStroke: `2.5px ${PURPLE}`, paintOrder: 'stroke fill'}}>HTTP/3</CText>
            </GlitchIn>
            <SoftIn N={N} f0={T_Y1} dy={0}>
              <CText cx={482} cy={352} size={24} weight={600} family={FONT_MONO} color={GREY} dy={0}>2022</CText>
            </SoftIn>
          </div>
        </>
      ) : null}

      {/* ===== 竖线① ===== */}
      {connP[0] > 0 ? (
        <svg width={720} height={1280} viewBox="0 0 720 1280" style={{position: 'absolute', inset: 0, filter: BLOOM}}>
          <line x1={360} y1={CONN[0].y0} x2={360} y2={CONN[0].y1} stroke={WHITE} strokeWidth={2.5}
            pathLength={100} strokeDasharray="100" strokeDashoffset={100 * (1 - connP[0])} />
          <circle cx={360} cy={CONN[0].y1 - 3} r={2.6} fill={WHITE} opacity={connP[0]} />
        </svg>
      ) : null}

      {/* ===== 中层卡 QUIC（紫光 + 2021 打字机 + 四枚机制 Pill）===== */}
      {mid ? (
        <>
          <HeroGlow x={CARD.x} y={MID.cy - CARD.h / 2} w={CARD.w} h={CARD.h} r={14} N={N} k={mid.op * gk} />
          <div style={{position: 'absolute', inset: 0, opacity: mid.op, transform: `translateY(${mid.dy.toFixed(1)}px) scale(${pM.toFixed(4)})`, transformOrigin: '360px 580px'}}>
            <Box x={CARD.x} y={MID.cy - CARD.h / 2} w={CARD.w} h={CARD.h} r={14} stroke={WHITE} sw={2.5} fill="rgba(0,0,0,0.82)" />
            <CText cx={324} cy={528} size={60} weight={400} family={FONT_WIDE} letterSpacing={4} color={WHITE}
              shadow={`5px 5px 0 ${PURPLE_DEEP}, 0 0 30px rgba(102,48,248,${(0.5 * gk).toFixed(2)})`}>QUIC</CText>
            {tyN >= 0 ? (
              <div style={{...abs(432, 516, 62, 26), fontFamily: FONT_MONO, fontSize: 24, color: GREY, lineHeight: '26px', whiteSpace: 'pre'}}>
                {YEAR2.slice(0, tyShown)}{(!tyDone || N < 1560) && cursor ? <span style={{color: PURPLE_LIGHT}}>▌</span> : null}
              </div>
            ) : null}
            {PILLS.map((p, i) => (
              <SoftIn key={p.text} N={N} f0={T_PILL[i]} dy={0}>
                <Pill x={p.x} y={p.y} w={p.w} h={36} r={18} stroke={PURPLE_LIGHT} sw={2} fill="#000"
                  text={p.text} fontSize={24} weight={600} family={FONT_MONO} color={WHITE} textDy={0} />
              </SoftIn>
            ))}
          </div>
        </>
      ) : null}

      {/* ===== 竖线② ===== */}
      {connP[1] > 0 ? (
        <svg width={720} height={1280} viewBox="0 0 720 1280" style={{position: 'absolute', inset: 0, filter: BLOOM}}>
          <line x1={360} y1={CONN[1].y0} x2={360} y2={CONN[1].y1} stroke={WHITE} strokeWidth={2.5}
            pathLength={100} strokeDasharray="100" strokeDashoffset={100 * (1 - connP[1])} />
          <circle cx={360} cy={CONN[1].y1 - 3} r={2.6} fill={WHITE} opacity={connP[1]} />
        </svg>
      ) : null}

      {/* ===== 底层卡 UDP（橙边 + 橙光）===== */}
      {bot ? (
        <>
          <HeroGlow x={CARD.x} y={BOT.cy - CARD.h / 2} w={CARD.w} h={CARD.h} r={14} N={N} k={bot.op * gk} color={ORANGE} />
          <div style={{position: 'absolute', inset: 0, opacity: bot.op, transform: `translateY(${bot.dy.toFixed(1)}px) scale(${pB.toFixed(4)})`, transformOrigin: '360px 810px'}}>
            <Box x={CARD.x} y={BOT.cy - CARD.h / 2} w={CARD.w} h={CARD.h} r={14} stroke={ORANGE} sw={2.5} fill="rgba(0,0,0,0.82)" />
            <CText cx={360} cy={802} size={56} weight={700} family={FONT_ORB} letterSpacing={6} color={WHITE}
              shadow={`5px 5px 0 rgba(179,74,46,.9), 0 0 30px rgba(240,95,65,${(0.5 * gk).toFixed(2)})`}>UDP</CText>
          </div>
        </>
      ) : null}

      {/* ===== 左侧竖直大箭头（自顶贯底 wipe 20 帧）+ rides on ===== */}
      {arrowP > 0 ? (
        <>
          <svg width={720} height={1280} viewBox="0 0 720 1280" style={{position: 'absolute', inset: 0, filter: BLOOM}}>
            <LineArrow x0={ARROW.x} y0={ARROW.y0} x1={ARROW.x} y1={ARROW.y1} p={arrowP} rodW={5} headL={36} headW={42} color={WHITE} />
          </svg>
          <div style={{position: 'absolute', inset: 0, opacity: softOp(N - T_RIDE, 8)}}>
            <div style={{position: 'absolute', left: RIDE.cx, top: RIDE.cy, transform: 'translate(-50%,-50%) rotate(90deg)', fontFamily: FONT_MONO, fontSize: 24, color: GREY, whiteSpace: 'nowrap'}}>rides on</div>
          </div>
        </>
      ) : null}
    </div>
  );
};
