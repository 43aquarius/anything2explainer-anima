import React from 'react';
import {useCurrentFrame} from 'remotion';
import {clamp01, easeInOutPow, kf, powOutRemain} from '../../common';
import {Check, CText, Cross, PacketIcon, Pill, CORAL, GREEN, GREY, ORANGE, PURPLE, WHITE, abs, firstOp, exitOp, scaleIn, SoftIn, mixHex} from '../../ui';
import {GateTurnstile, PermitCard, tri} from './g7ui';

/**
 * SC38 许可 · N 8560–8871（S49 8568–8805 / S50 8816–8869：8568 其次许可 / 8613 未经授权抓包
 *   / 8686 很多地方是犯罪 / 8742 到处是开除理由 / 8816 先拿到明确许可）
 * 版式：顶部 `PERMISSION` Audiowide 72px SoftIn（无 glitch，重词已够多）；左半闸机 A：
 *   窃听信封滑向门 → Cross 拦下（12 帧）+ 红光闪 + 门上红 ✕ + 红边加强（8742）+ 两枚红 Pill
 *   `a crime in many places` / `career risk`；右半闸机 B（闸臂旋开）+ 许可状（`authorized` 紫 Pill
 *   + 签名线 + 章印 scale 1.3→1.0 白闪）+ 信封通过 + 绿 Check；门禁灯绿橙交替呼吸（持续）。
 * 主角：闸门 + 许可状（~365px 组高）；光：许可章紫光 / Cross 红。末 8 帧归零。零 glitch。
 */
const F0 = 8560, TO = 8871;
const T_TITLE = 8568, T_GATE = 8566, T_ENV_A = 8613, T_CROSS = 8629, T_XMARK = 8641;
const T_PILL1 = 8686, T_PILL2 = 8742, T_DOC = 8816, T_STAMP = 8828, T_CHECK = 8846;
const GATE_A = {cx: 310, y: 255, w: 150, h: 240};
const GATE_B = {cx: 940, y: 255, w: 150, h: 240};
const DOC = {cx: 1115, cy: 345, w: 180, h: 235};

export const SC38: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const op = exitOp(N, TO, 8);
  // 左：窃听信封滑向闸机（16 帧）→ 被拦
  const envAN = N - T_ENV_A;
  const envAX = 120 + (238 - 120) * (1 - powOutRemain(envAN, 16, 2.5));
  const crossP = clamp01((N - T_CROSS) / 12);
  const redFlash = tri(N - T_CROSS, 10);
  const redK = clamp01((N - T_PILL2) / 11);
  const lampA = N >= T_CROSS ? {color: CORAL, glow: 0.55 + 0.45 * Math.sin((2 * Math.PI * N) / 24)} : {color: GREY, glow: 0.2};
  // 右：闸臂旋开（10 帧）+ 信封通过（40 帧）+ 章印 1.3→1.0 + 白闪
  const armOpen = kf(N, [[T_DOC, 0], [T_DOC + 10, 1]], easeInOutPow(2.5));
  const envBN = N - T_DOC;
  const envBX = 790 + 240 * easeInOutPow(2)((clamp01(envBN / 40)));
  const stampS = kf(N, [[T_STAMP, 1.3], [T_STAMP + 10, 1]], easeInOutPow(2.5));
  const stampFlash = tri(N - (T_STAMP + 10), 8);
  // 门禁灯绿橙呼吸（持续）
  const lampBMix = 0.5 + 0.5 * Math.sin((2 * Math.PI * N) / 30);
  const lampB = {color: N >= T_DOC ? mixHex(GREEN, ORANGE, lampBMix) : GREY, glow: N >= T_DOC ? 0.5 + 0.5 * Math.sin((2 * Math.PI * N) / 30) : 0.2};
  return (
    <div style={{position: 'absolute', inset: 0, opacity: op}}>
      {/* ===== 顶部大字（SoftIn，无 glitch） ===== */}
      <SoftIn N={N} f0={T_TITLE}>
        <CText cx={640} cy={142} size={72} weight={400} letterSpacing={6} shadow={`6px 6px 0 ${PURPLE}, 0 0 28px rgba(102,45,248,.45)`} style={{fontFamily: "'Audiowide','Orbitron',sans-serif"}}>PERMISSION</CText>
      </SoftIn>
      {/* ===== 左半：未授权 ===== */}
      <div style={{position: 'absolute', inset: 0, opacity: firstOp(N - T_GATE, 8)}}>
        <GateTurnstile cx={GATE_A.cx} y={GATE_A.y} w={GATE_A.w} h={GATE_A.h} drawP={clamp01((N - T_GATE) / 16)} redK={redK} lampColor={lampA.color} lampGlow={lampA.glow} />
        {/* 窃听信封（滑向闸机 → 停在门线） */}
        {envAN >= 0 ? (
          <div style={{position: 'absolute', inset: 0, opacity: envAN < 3 ? envAN / 3 : 1}}>
            <PacketIcon cx={envAX} cy={375} w={62} h={44} />
          </div>
        ) : null}
        {/* Cross 划掉（draw-on 12 帧） */}
        <Cross cx={238} cy={375} size={58} p={crossP} />
        {/* 门上红 ✕ */}
        {N >= T_XMARK ? (
          <svg width={60} height={60} viewBox="-30 -30 60 60" style={{position: 'absolute', left: GATE_A.cx - 30, top: 318, overflow: 'visible', opacity: clamp01((N - T_XMARK) / 6)}}>
            <path d="M -13,-13 L 13,13 M 13,-13 L -13,13" stroke={CORAL} strokeWidth={7} strokeLinecap="round" style={{filter: 'drop-shadow(0 0 8px rgba(236,8,31,.6))'}} />
          </svg>
        ) : null}
        {/* 红光闪（拦下瞬间） */}
        {redFlash > 0 ? (
          <div style={{...abs(GATE_A.cx - 120, 300, 240, 190), borderRadius: 16, boxShadow: `0 0 ${Math.round(30 + 40 * redFlash)}px ${Math.round(10 + 26 * redFlash)}px rgba(236,8,31,${(0.4 * redFlash).toFixed(2)})`, border: `2px solid rgba(236,8,31,${(0.5 * redFlash).toFixed(2)})`}} />
        ) : null}
        {/* 红字小 Pill */}
        <SoftIn N={N} f0={T_PILL1}>
          <Pill x={GATE_A.cx - 165} y={520} w={330} h={40} fill="#170507" stroke={CORAL} sw={2} text="a crime in many places" fontSize={24} weight={700} color={CORAL} textDy={0} />
        </SoftIn>
        <SoftIn N={N} f0={T_PILL2}>
          <Pill x={GATE_A.cx - 95} y={566} w={190} h={38} fill="#170507" stroke={CORAL} sw={2} text="career risk" fontSize={24} weight={700} color={CORAL} textDy={0} />
        </SoftIn>
      </div>
      {/* ===== 右半：授权 ===== */}
      <div style={{position: 'absolute', inset: 0, opacity: firstOp(N - T_GATE, 8)}}>
        <GateTurnstile cx={GATE_B.cx} y={GATE_B.y} w={GATE_B.w} h={GATE_B.h} drawP={clamp01((N - T_GATE) / 16)} open={armOpen} lampColor={lampB.color} lampGlow={lampB.glow} />
        {/* 许可状（scaleIn + 章印 1.3→1.0 + 白闪） */}
        {N >= T_DOC ? (
          <div style={{position: 'absolute', inset: 0, transform: `scale(${(0.7 + 0.3 * scaleIn(N - T_DOC, 21)).toFixed(3)})`, transformOrigin: `${DOC.cx}px ${DOC.cy}px`, filter: stampFlash > 0 ? `brightness(${(1 + 0.6 * stampFlash).toFixed(2)})` : undefined}}>
            <PermitCard cx={DOC.cx} cy={DOC.cy} w={DOC.w} h={DOC.h} p={clamp01((N - T_DOC) / 14)} stampK={clamp01((N - T_STAMP) / 8)} stampS={stampS} stampLit glow />
            <SoftIn N={N} f0={T_DOC + 4}>
              <Pill x={DOC.cx - 86} y={DOC.cy - DOC.h / 2 - 20} w={172} h={40} fill={PURPLE} sw={2} text="authorized" fontSize={24} weight={700} textDy={0} glow="0 0 20px 5px rgba(102,45,248,.45)" />
            </SoftIn>
          </div>
        ) : null}
        {/* 信封通过闸机（紫） */}
        {envBN >= 0 && envBN <= 44 ? (
          <div style={{position: 'absolute', inset: 0}}>
            <PacketIcon cx={envBX} cy={375} w={62} h={44} accent glow />
          </div>
        ) : null}
        {/* 绿 Check（draw-on 12 帧） */}
        <Check cx={GATE_B.cx} cy={545} size={46} p={clamp01((N - T_CHECK) / 12)} />
      </div>
    </div>
  );
};
