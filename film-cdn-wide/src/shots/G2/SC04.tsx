import React from 'react';
import {useCurrentFrame} from 'remotion';
import {clamp01, easeInOutPow, easeOutCubic, GlitchIn, FONT_ORB, powOutRemain} from '../../common';
import {CameraRig} from '../../fx';
import {
  CText, Pill, Check, GREY, WHITE, PURPLE_LIGHT, ORANGE, abs, Svg,
  SoftIn, firstOp, softOp, exitOp, glowOffK, scaleIn,
} from '../../ui';
import {CityMini, PriceTag, SpeedSign} from './g2ui';

/**
 * SC04 光速买不到 · N 886–1095（S07+S08：914「带宽可以买」/ 956「光速买不到」/ 1004「不是更快的网」/ 1066「是更短的网」）
 * 版式：左 价签卡（bandwidth Pill + $ 数字滚动 + 绿对勾，"可购买"）；右 三条光速线 + 端头 `c` 限速牌（撞牌回弹，持续）；
 *   中央大对照 `faster ≠ shorter`（两行大字 56px 白+紫描边 / `≠` 橙 64px，主角）。SC03 城市圈缩微右上角承接在场（不清场，直通 SC05）。
 * 动效：910 价签卡 slideIn Δ110/18f + $ 滚动落定 + Check draw-on｜956 光速线 draw-on 20f + `c` 牌缩入 + 光点流（持续）；
 *   1004 `faster` SoftIn｜1066 `≠` GlitchIn（rgbSplit 4，本镜唯一 glitch）+ `shorter` SoftIn + 两行各白闪 1 次 + 光点流提速撞牌回弹（循环）。
 * 运镜：1.0→1.05 慢推（886–1056，不进末拍）。停留：段内不判。末 8 帧归零（城市圈除外）。
 */
const F0 = 886;
const TO = 1095;
const T_MINI = 886, T_CARD = 910, T_PILL = 916, T_ROLL = 920, T_CHK = 938;
const T_LINES = 956, T_SIGN = 958, T_DOTS = 966, T_FAST = 1004, T_NE = 1066;

const CARD = {cx: 330, cy: 305, w: 350, h: 260};
const LINEY = [250, 295, 340];
const LX0 = 770, LX1 = 1122;
const SIGN = {cx: 1170, cy: 295, r: 44};
const ROW = {faster: 430, ne: 502, shorter: 574};
const FLASH_F = 1071, FLASH_S = 1075;

/** 4–5 帧白闪包络（三角） */
const flashK = (t: number) => (t <= 0 || t >= 5 ? 0 : t < 2.5 ? t / 2.5 : 1 - (t - 2.5) / 2.5);

export const SC04: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const exit = exitOp(N, TO, 8);
  const gk = glowOffK(N, TO); // 带光元素先灭光

  // 章首承接：SC03 城市圈缩微右上角（16 帧落位；不清场直通 SC05）
  const kSet = easeInOutPow(2.5)(clamp01((N - T_MINI) / 16));
  const miniCx = 895 + (1080 - 895) * kSet;
  const miniCy = 330 + (185 - 330) * kSet;
  const miniS = 1.9 - 0.9 * kSet;
  const miniOp = firstOp(N - T_MINI, 6);

  // 价签卡：slideIn（Δ110 / 18 帧）+ $ 滚动 + 对勾
  const cardY = CARD.cy + 110 * powOutRemain(N - T_CARD, 18, 2.5);
  const cardOp = softOp(N - T_CARD, 8);
  const roll = Math.round(100 * easeOutCubic(clamp01((N - T_ROLL) / 16)));
  const chkP = easeOutCubic(clamp01((N - T_CHK) / 12));

  // 光速线 draw-on（20 帧）+ `c` 牌缩入（21 帧）
  const lineP = easeOutCubic(clamp01((N - T_LINES) / 20));
  const lineOp = softOp(N - T_LINES, 6);
  const signS = scaleIn(N - T_SIGN, 21);
  const signOp = softOp(N - T_SIGN, 6);

  // 光点流：沿三条线撞限速牌回弹（重复循环，持续动作）；1066 提速一档
  const v = N >= T_NE ? 6.4 : 3.2;
  const L = LX1 - LX0, P = 2 * L;
  const dots: Array<{x: number; y: number; op: number}> = [];
  let impact = 0;
  for (let j = 0; j < 3; j++) {
    for (let k = 0; k < 3; k++) {
      const s = ((((N - T_DOTS) * v + k * (P / 3) + j * 41) % P) + P) % P;
      const x = LX0 + (s < L ? s : P - s);
      dots.push({x, y: LINEY[j], op: Math.min(1, (x - LX0) / 44)});
      impact = Math.max(impact, clamp01(1 - Math.abs(s - L) / 16));
    }
  }
  const impactK = impact * (N >= T_NE ? 1 : 0.35) * gk; // 1066 起撞击更亮

  // 两行白闪（各 1 次）
  const fF = flashK(N - FLASH_F);
  const fS = flashK(N - FLASH_S);

  const rowStyle = (flash: number): React.CSSProperties => ({
    WebkitTextStroke: '2.5px rgba(161,117,241,0.95)',
    paintOrder: 'stroke fill',
    textShadow: `0 0 ${(20 * flash).toFixed(0)}px rgba(255,255,255,${(0.85 * flash * gk).toFixed(2)}), 0 0 16px rgba(102,45,248,${(0.4 * gk).toFixed(2)})`,
    transform: `scale(${(1 + 0.06 * flash).toFixed(3)})`,
  });

  return (
    <>
      <CameraRig N={N} keys={[{f: F0, x: 640, y: 360, s: 1}, {f: 1056, x: 640, y: 372, s: 1.05}]}>
        <div style={{...abs(0, 0, 1280, 720), opacity: exit}}>
          {/* 左：价签卡（"可购买"） */}
          {cardOp > 0 ? (
            <div style={{...abs(0, 0, 1280, 720), opacity: cardOp, transform: `translateY(${(cardY - CARD.cy).toFixed(1)}px)`}}>
              <PriceTag cx={CARD.cx} cy={CARD.cy} w={CARD.w} h={CARD.h} />
              <SoftIn N={N} f0={T_PILL}>
                <Pill x={CARD.cx - 92} y={CARD.cy - 108} w={184} h={42} r={21} fontSize={26} weight={700}
                  text="bandwidth" color={PURPLE_LIGHT} stroke={PURPLE_LIGHT} sw={2} />
              </SoftIn>
              <CText cx={258} cy={316} size={40} weight={700} family={FONT_ORB} color={ORANGE} shadow={`0 0 14px rgba(240,95,65,${(0.4 * gk).toFixed(2)})`}>$</CText>
              <CText cx={348} cy={314} size={52} weight={700} family={FONT_ORB} color={WHITE} letterSpacing={1}
                style={{fontVariantNumeric: 'tabular-nums'}}>{N < T_ROLL ? 0 : roll}</CText>
              {N >= T_ROLL + 16 ? (
                <SoftIn N={N} f0={T_ROLL + 16} dy={6}>
                  <CText cx={426} cy={326} size={24} weight={600} color={GREY}>Mb/s</CText>
                </SoftIn>
              ) : null}
              {chkP > 0 ? <Check cx={425} cy={396} size={54} sw={7} p={chkP} opacity={0.6 + 0.4 * gk} /> : null}
            </div>
          ) : null}

          {/* 右：三条光速线（draw-on）+ 光点（撞限速牌回弹，持续）+ 撞击闪 */}
          {lineOp > 0 ? (
            <div style={{...abs(0, 0, 1280, 720), opacity: lineOp}}>
              {LINEY.map((y) => (
                <div key={y} style={{...abs(LX0, y - 1.25, (LX1 - LX0) * lineP, 2.5), background: WHITE, opacity: 0.85}} />
              ))}
            </div>
          ) : null}
          <SpeedSign cx={SIGN.cx} cy={SIGN.cy} r={SIGN.r} scale={signS} opacity={signOp} glow={impactK} />
          {N >= T_DOTS ? (
            <Svg>
              {dots.map((d, i) => d.op > 0.03 ? (
                <g key={i} opacity={d.op}>
                  <circle cx={d.x} cy={d.y} r={9} fill="rgba(102,48,248,0.32)" />
                  <circle cx={d.x} cy={d.y} r={4.5} fill={WHITE} />
                </g>
              ) : null)}
              {impactK > 0.03 ? LINEY.map((y) => (
                <circle key={y} cx={LX1 + 3} cy={y} r={7 + 5 * impactK} fill={WHITE} opacity={0.8 * impactK} />
              )) : null}
            </Svg>
          ) : null}

          {/* 中央大对照（主角）：faster ≠ shorter */}
          <SoftIn N={N} f0={T_FAST}>
            <CText cx={640} cy={ROW.faster} size={56} weight={900} color={WHITE} letterSpacing={3} style={rowStyle(fF)}>faster</CText>
          </SoftIn>
          <GlitchIn N={N} f0={T_NE} rgbSplit={4} seed={7}>
            <CText cx={640} cy={ROW.ne} size={64} weight={900} color={ORANGE}
              shadow={`0 0 26px rgba(240,95,65,${(0.55 * gk).toFixed(2)})`}>≠</CText>
          </GlitchIn>
          <SoftIn N={N} f0={T_NE + 2}>
            <CText cx={640} cy={ROW.shorter} size={56} weight={900} color={WHITE} letterSpacing={3} style={rowStyle(fS)}>shorter</CText>
          </SoftIn>
        </div>
      </CameraRig>

      {/* SC03 城市圈缩微（章界承接，屏幕空间，不清场 → SC05 世界图从这里放大） */}
      <CityMini cx={miniCx} cy={miniCy} r={52} opacity={miniOp} scale={miniS} />
    </>
  );
};
