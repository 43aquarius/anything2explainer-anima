import React from 'react';
import {useCurrentFrame} from 'remotion';
import {GlitchIn, clamp01, emphasisPulse, powOutRemain, FONT_ORB} from '../../common';
import {CText, Box, Pill, ArrowH, PacketIcon, WHITE, PURPLE_LIGHT, GREY, fadeIn, SoftIn, exitOp, mixHex, glowPurpleS, glowOffK} from '../../ui';

/**
 * SC12 Ethereal → Wireshark · N 2191–2531（S14 2199–2431 + S15 2442–2529）
 * 版式：左 卡 A（300×260，中心 (300,380)）：Pill `Ethereal` + `1998`（Orbitron 44 灰）+ 小放大镜（图形分析器）+ `Gerald Combs` 灰小字；
 *   中 `→`（白，draw-on 16 帧）；右 卡 B（420×280，中心 (940,380)）：`Wireshark`（Noto 900 72px 白）+ `2006`（Orbitron 44 灰）+
 *   简笔鲨鱼鳍（白描边几何致敬，非官方 logo，draw-on 20 帧）；2442 下方中央灰字 `debugs the internet's networks`。
 * 节拍：2199 卡 A 缩放入场（21 帧）；2205 `Gerald Combs` SoftIn；2251 箭头 draw-on + 放大镜 draw-on（「图形分析器」）；
 *   2330 卡 B 自右滑入（Δ260/18 帧）+ `Wireshark` GlitchIn（rgbSplit 4，本镜唯一 glitch）+ 鲨鱼鳍 draw-on；2346 `2006` SoftIn；
 *   2442 两卡 1.0→1.04 微脉冲对撞一次 + 卡 B 边框白→紫、紫柔光点亮 + 灰字 SoftIn。
 *   2355 起：两卡上方 y≈200 一条“线路”（白 2px，draw-on 15 帧）上三枚信封持续右行（2.6px/帧，持续动作——
 *   “debugs the internet's networks”的意象，也修复 v1 卡 B 落位后 3.7s 静止）。
 * 章末镜头：末 10 帧整组归零淡出（进章节卡 How It Works）。停留：卡 B 落位 2330+22 ≈ 2352 → 离场 2531−10 ≈ 90 帧。
 */
const F0 = 2191, TO = 2531;
const T_A = 2199, T_COMBS = 2205, T_ARROW = 2251, T_B = 2330, T_2006 = 2346, T_LINE = 2442, T_WIRE = 2275;
const EXIT_LEN = 10;
const CARD_A = {x: 150, y: 250, w: 300, h: 260};
const CARD_B = {x: 730, y: 240, w: 420, h: 280};
/** 鲨鱼鳍：简笔几何白描边（160×104 视图内，非官方 logo 的几何致敬） */
const FIN = {w: 160, h: 104, path: 'M25,94 C36,56 58,24 100,14 C82,46 86,72 106,94 Z', len: 290};

export const SC12: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const exOp = exitOp(N, TO, EXIT_LEN);
  // 卡 A：21 帧缩放入场（0.7 → 1）
  const an = N - T_A;
  const aS = an < 0 ? 0 : 0.7 + 0.3 * (1 - Math.pow(1 - clamp01(an / 21), 3));
  const aOp = an < 0 ? 0 : fadeIn(an, 8);
  // 箭头 / 放大镜 draw-on
  const arrowP = clamp01((N - T_ARROW) / 16);
  const magP = clamp01((N - T_ARROW) / 14);
  // 卡 B：自右滑入（Δ260 / 18 帧）+ 前 6 帧渐入
  const bn = N - T_B;
  const bDx = bn < 0 ? 260 : 260 * powOutRemain(bn, 18, 2.5);
  const bOp = bn < 0 ? 0 : fadeIn(bn, 6);
  // 鲨鱼鳍 draw-on（20 帧，2332 起）
  const finP = clamp01((N - (T_B + 2)) / 20);
  // 2442：脉冲对撞（A 撞向右、B 撞向左）+ 卡 B 紫光点亮
  const pulseA = emphasisPulse(N - (T_LINE + 2), {peak: 1.04});
  const pulseB = emphasisPulse(N - T_LINE, {peak: 1.04});
  const borderK = clamp01((N - T_LINE) / 11);
  const glowK = borderK * glowOffK(N, TO, 6, EXIT_LEN);
  const borderB = mixHex(WHITE, PURPLE_LIGHT, borderK);
  // 顶部“线路”与持续右行的信封（2355 起，三枚等距，帧帧有位移）
  const wireP = clamp01((N - T_WIRE) / 15);
  const wireOp = fadeIn(N - T_WIRE, 10) * (1 - clamp01((N - (TO - 57)) / 10)); // v2: 2474 起 10 帧淡出，给段末 hold ≥30f
  const ENVELOPES = [0, 1, 2, 3].map((i) => {
    const span = 1140; // x 60→1200
    const sp = 285; // 信封间距（v2: 4 枚更密）
    const x = 60 + (((N - T_WIRE - 12) * 3.4 + i * sp) % span);
    return {x, op: wireOp * Math.min(1, Math.max(0, Math.min((x - 60) / 60, (1200 - x) / 80)))};
  });

  return (
    <div style={{position: 'absolute', inset: 0, opacity: exOp}}>
      {/* 顶部线路 + 持续右行的信封（持续动作：internet 的网络流量） */}
      {wireP > 0 ? (
        <div style={{position: 'absolute', inset: 0, opacity: wireOp}}>
          <div style={{position: 'absolute', left: 80, top: 207, width: 1120 * wireP, height: 2, background: 'rgba(255,255,255,.55)'}} />
          {ENVELOPES.map((e, i) => (e.op > 0.02 ? <PacketIcon key={i} cx={e.x} cy={198} w={68} h={46} opacity={e.op} /> : null))}
        </div>
      ) : null}
      {/* 卡 A：Ethereal · 1998 · 放大镜 · Gerald Combs */}
      {aOp > 0 ? (
        <div
          style={{
            position: 'absolute',
            left: CARD_A.x,
            top: CARD_A.y,
            width: CARD_A.w,
            height: CARD_A.h,
            opacity: aOp,
            transformOrigin: '300px 130px',
            transform: pulseA === 1 ? undefined : `scale(${pulseA.toFixed(4)})`,
          }}
        >
          <div style={{position: 'absolute', inset: 0, transformOrigin: '150px 130px', transform: aS === 1 ? undefined : `scale(${aS.toFixed(4)})`}}>
            <Box x={0} y={0} w={CARD_A.w} h={CARD_A.h} r={12} sw={2.5} />
            <Pill x={CARD_A.w / 2 - 85} y={16} w={170} h={46} sw={2} text="Ethereal" fontSize={26} weight={700} textDy={0} />
            <CText cx={CARD_A.w / 2} cy={112} size={44} weight={700} family={FONT_ORB} color={GREY} letterSpacing={2} style={{fontVariantNumeric: 'tabular-nums'}}>
              1998
            </CText>
            {/* 放大镜（图形分析器；draw-on：镜圈 → 镜柄） */}
            {magP > 0 ? (
              <svg width={80} height={80} viewBox="0 0 80 80" style={{position: 'absolute', left: CARD_A.w / 2 - 40, top: 138, overflow: 'visible', filter: 'drop-shadow(0 0 2px rgba(255,255,255,.35))'}}>
                <circle cx={34} cy={34} r={23} fill="#000" stroke={WHITE} strokeWidth={3.5} strokeDasharray={145} strokeDashoffset={145 * (1 - clamp01(magP * 1.4))} />
                <line x1={50} y1={50} x2={72} y2={72} stroke={WHITE} strokeWidth={5} strokeLinecap="round" strokeDasharray={31} strokeDashoffset={31 * (1 - clamp01(Math.max(0, magP * 1.4 - 0.6)))} />
              </svg>
            ) : null}
            {N >= T_COMBS ? (
              <CText cx={CARD_A.w / 2} cy={244} size={22} weight={600} color={GREY} opacity={fadeIn(N - T_COMBS, 8)}>
                Gerald Combs
              </CText>
            ) : null}
          </div>
        </div>
      ) : null}
      {/* 中间箭头（draw-on，自根部长出；居两卡之间） */}
      {arrowP > 0 ? <ArrowH x={538} y={342} w={104} h={42} p={arrowP} /> : null}
      {/* 卡 B：Wireshark · 2006 · 鲨鱼鳍（主角，2442 起紫柔光） */}
      {bOp > 0 ? (
        <div
          style={{
            position: 'absolute',
            left: CARD_B.x + bDx,
            top: CARD_B.y,
            width: CARD_B.w,
            height: CARD_B.h,
            opacity: bOp,
            transformOrigin: '0px 140px',
            transform: pulseB === 1 ? undefined : `scale(${pulseB.toFixed(4)})`,
          }}
        >
          <Box x={0} y={0} w={CARD_B.w} h={CARD_B.h} r={12} sw={2.5} stroke={borderB} glow={glowK > 0.02 ? glowPurpleS(glowK) : undefined} />
          {/* Wireshark（本镜唯一 glitch，rgbSplit 4） */}
          <GlitchIn N={N} f0={T_B} rgbSplit={4} seed={12}>
            <CText cx={CARD_B.w / 2} cy={76} size={72} weight={900} color={WHITE} shadow="0 0 14px rgba(255,255,255,.35)">
              Wireshark
            </CText>
          </GlitchIn>
          {/* 2006（改名年份） */}
          {N >= T_2006 ? (
            <CText cx={CARD_B.w / 2} cy={142} size={44} weight={700} family={FONT_ORB} color={GREY} letterSpacing={2} opacity={fadeIn(N - T_2006, 8)} style={{fontVariantNumeric: 'tabular-nums'}}>
              2006
            </CText>
          ) : null}
          {/* 鲨鱼鳍（draw-on） */}
          {finP > 0 ? (
            <svg width={FIN.w} height={FIN.h} viewBox={`0 0 ${FIN.w} ${FIN.h}`} style={{position: 'absolute', left: CARD_B.w / 2 - FIN.w / 2, top: 166, overflow: 'visible', filter: 'drop-shadow(0 0 3px rgba(255,255,255,.45))'}}>
              <path d={FIN.path} fill="#000" stroke={WHITE} strokeWidth={3.5} strokeLinejoin="round" strokeDasharray={FIN.len} strokeDashoffset={FIN.len * (1 - finP)} />
            </svg>
          ) : null}
        </div>
      ) : null}
      {/* 下方中央灰字（S15「互联网用它调试网络」） */}
      {N >= T_LINE ? (
        <SoftIn N={N} f0={T_LINE}>
          <CText cx={640} cy={562} size={26} weight={600} color={GREY}>
            debugs the internet's networks
          </CText>
        </SoftIn>
      ) : null}
    </div>
  );
};
