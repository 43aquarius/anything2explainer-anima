import React from 'react';
import {useCurrentFrame} from 'remotion';
import {clamp01, easeOutCubic, GlitchIn, emphasisPulse, powOutRemain} from '../../common';
import {CameraRig, HeroGlow} from '../../fx';
import {
  AsChip, CText, TechText, EXAMPLE, GREY, PURPLE_LIGHT, abs, SoftIn, softOp, exitOp, glowOffK, scaleIn, Svg,
} from '../../ui';
import {TypeCard, TerritoryQuad, HouseIcon} from './g2ui';

/**
 * SC05 AS=外交官 · N 875–1198（S07：883「ISPs, clouds, universities —」/ 976「each one an autonomous system, an AS.」
 *   S08：1073「Each has a number, and speaks」/ 1121「for its own corner of the map — a diplomat.」）
 * 版式：左一枚特大 AsChip `AS64512`（180×180，白描边 + 底部 7 枚 LED 灯带）+ 四周三张类型卡（ISP / cloud / university）；
 *   芯片下 `an autonomous system — AS`（Exo 2 紫斜体）；右一块领地象限（虚线框 + 小房子），芯片→领地虚线连接；
 *   领地上方大字 `a diplomat`（Noto 900 56px 白+紫描边，1121 高光词）。
 * 动效：883 三卡 2 帧错峰 slideUp + 各自词拍紫光；976 芯片缩入 18f + 灯带自左向右点亮（1004 起流动脉冲，持续）
 *   + 紫斜体 SoftIn；1073 象限 clip-wipe 16f + 房子缩入 + 虚线连接 draw-on 18f + 芯片脉冲（「有编号」）；
 *   1121 `a diplomat` GlitchIn（rgbSplit 6，本镜唯一 glitch）+ emphasisPulse + 象限紫光晕；连接线上光点流动（持续）。
 * 运镜：1.0→1.05 慢推（875–1115，1121 glitch 前结束）。停留：段内不判（S08 末块 76）。末 8 帧归零。
 */
const F0 = 875;
const TO = 1198;
const T_CARDS = 883, T_CHIP = 976, T_AS = 982, T_QUAD = 1073, T_HOUSE = 1080, T_LINK = 1084, T_DIP = 1115; // 前挂拍−6
const CARD_FLASH = {isp: 891, cloud: 906, uni: 928}; // 词拍紫光（ISPs / clouds / universities）
const T_MARQ = 1004;

const CHIP = {cx: 330, cy: 352, s: 180};
const QUAD = {cx: 960, cy: 405, w: 340, h: 250};
// 芯片 → 领地：虚线二次贝塞尔（ dipping 在 cloud 卡下方过）
const LINK_P0: [number, number] = [415, 395], LINK_C: [number, number] = [610, 470], LINK_P1: [number, number] = [788, 418];
const CARDS = [
  {kind: 'isp' as const, text: 'ISP', cx: 330, cy: 192, w: 150},
  {kind: 'cloud' as const, text: 'cloud', cx: 545, cy: 308, w: 160},
  {kind: 'uni' as const, text: 'university', cx: 330, cy: 528, w: 200},
];
const LEDY = 412, LEDX0 = 275, LEDDX = 15;

export const SC05: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const exit = exitOp(N, TO, 8);
  const gk = glowOffK(N, TO);

  // 卡片：2 帧错峰 slideUp（Δ80）+ 词拍紫光包络（14f）
  const cardFlash = (t: number) => Math.sin(Math.PI * clamp01((N - t) / 14)) * gk;

  // 特大芯片：18f 缩入；1075「有编号」脉冲
  const chipIn = scaleIn(N - T_CHIP, 18);
  const chipOp = softOp(N - T_CHIP, 6);
  const chipPulse = emphasisPulse(N - 1075, {peak: 1.08, up: 10, hold: 3, down: 12});

  // LED 灯带：980 起自左向右逐个点亮；1004 起流动脉冲（36 帧循环扫过 7 枚）
  const ledBase = (i: number) => 0.8 * softOp(N - (T_CHIP + 4 + i * 3), 4);
  const marq = N >= T_MARQ ? Math.floor((((N - T_MARQ) % 36) / 36) * 7) : -1;

  // 领地象限 + 房子 + 连接（1073 拍）
  const quadWipe = easeOutCubic(clamp01((N - T_QUAD) / 16));
  const houseIn = scaleIn(N - T_HOUSE, 12);
  const linkP = easeOutCubic(clamp01((N - T_LINK) / 18));

  // 连接线上的光点（1090 起 2 枚循环流动，持续动作）
  const bez = (t: number): [number, number] => {
    const u = 1 - t;
    return [u * u * LINK_P0[0] + 2 * u * t * LINK_C[0] + t * t * LINK_P1[0], u * u * LINK_P0[1] + 2 * u * t * LINK_C[1] + t * t * LINK_P1[1]];
  };

  // `a diplomat` 高光词
  const dipPulse = emphasisPulse(N - (T_DIP - 4), {peak: 1.09, up: 6, hold: 2, down: 7}); // 前挂压短

  return (
    <CameraRig N={N} keys={[{f: F0, x: 640, y: 360, s: 1}, {f: 1115, x: 640, y: 360, s: 1.05}]}>
      <div style={{...abs(0, 0, 1280, 720), opacity: exit}}>
        {/* 三张类型卡（ISP / cloud / university） */}
        {CARDS.map((card, i) => {
          const st = T_CARDS + i * 2;
          const op = softOp(N - st, 8);
          if (op <= 0.02) return null;
          return (
            <div key={card.kind} style={{...abs(0, 0, 1280, 720), opacity: op, transform: `translateY(${(80 * powOutRemain(N - st, 18, 2.5)).toFixed(1)}px)`}}>
              <TypeCard cx={card.cx} cy={card.cy} w={card.w} kind={card.kind} text={card.text} glowK={cardFlash(CARD_FLASH[card.kind])} />
            </div>
          );
        })}

        {/* 特大 AsChip（主角 + 底部 LED 灯带） */}
        {chipOp > 0.02 ? (
          <div style={{...abs(0, 0, 1280, 720), transform: `scale(${(chipIn * chipPulse).toFixed(4)})`, transformOrigin: `${CHIP.cx}px ${CHIP.cy}px`, opacity: chipOp}}>
            <HeroGlow x={CHIP.cx - CHIP.s / 2 - 10} y={CHIP.cy - CHIP.s / 2 - 10} w={CHIP.s + 20} h={CHIP.s + 20} N={N} k={softOp(N - T_CHIP, 10) * gk} />
            <AsChip cx={CHIP.cx} cy={CHIP.cy} w={CHIP.s} h={CHIP.s} asn={EXAMPLE.asnYou} led="on" glow />
            {Array.from({length: 7}, (_, i) => {
              const b = ledBase(i);
              if (b <= 0.02) return null;
              const on = i === marq;
              const r = on ? 6 : 4.5;
              return (
                <div key={i} style={{position: 'absolute', left: LEDX0 + i * LEDDX - r, top: LEDY - r, width: 2 * r, height: 2 * r, borderRadius: '50%', background: PURPLE_LIGHT, opacity: b,
                  boxShadow: on ? `0 0 12px rgba(161,117,241,${(0.9 * gk).toFixed(2)})` : `0 0 5px rgba(161,117,241,${(0.35 * gk).toFixed(2)})`}} />
              );
            })}
          </div>
        ) : null}

        {/* an autonomous system — AS */}
        <SoftIn N={N} f0={T_AS}>
          <TechText cx={CHIP.cx} cy={474} text="an autonomous system \u2014 AS" fontSize={32} />
        </SoftIn>

        {/* 领地象限（clip-wipe draw-on）+ 小房子 */}
        <div style={{...abs(0, 0, 1280, 720), clipPath: `inset(0 ${(100 - 100 * quadWipe).toFixed(2)}% 0 0)`, opacity: softOp(N - T_QUAD, 5)}}>
          <TerritoryQuad cx={QUAD.cx} cy={QUAD.cy} w={QUAD.w} h={QUAD.h} glowK={softOp(N - (T_DIP + 2), 8) * gk} />
        </div>
        <div style={{...abs(0, 0, 1280, 720), transform: `scale(${houseIn.toFixed(4)})`, transformOrigin: '960px 420px', opacity: softOp(N - T_HOUSE, 6)}}>
          <HouseIcon cx={960} cy={420} w={112} />
        </div>

        {/* 芯片 → 领地 虚线（dipping 曲线，draw-on）+ 流动光点 */}
        <div style={{...abs(0, 0, 1280, 720), clipPath: `inset(0 ${(100 - 100 * linkP).toFixed(2)}% 0 0)`, opacity: softOp(N - T_LINK, 5)}}>
          <Svg bloom={false}>
            <path d={`M${LINK_P0[0]} ${LINK_P0[1]} Q${LINK_C[0]} ${LINK_C[1]} ${LINK_P1[0]} ${LINK_P1[1]}`} fill="none" stroke={GREY} strokeWidth={2.5} strokeDasharray="9 8" />
          </Svg>
        </div>
        {N >= T_LINK + 6 ? (
          <Svg>
            {[0, 1].map((k) => {
              const t = (((N - (T_LINK + 6)) / 46 + k * 0.5) % 1 + 1) % 1;
              const [px, py] = bez(t);
              const op = 0.7 * clamp01(Math.min(t * 6, (1 - t) * 6)) * gk;
              if (op <= 0.03) return null;
              return (
                <g key={k} opacity={op.toFixed(2)}>
                  <circle cx={px.toFixed(1)} cy={py.toFixed(1)} r={7} fill="rgba(102,48,248,0.32)" />
                  <circle cx={px.toFixed(1)} cy={py.toFixed(1)} r={3.5} fill="#FFF" />
                </g>
              );
            })}
          </Svg>
        ) : null}

        {/* a diplomat（1121 高光词，本镜唯一 glitch：rgbSplit 6） */}
        <GlitchIn N={N} f0={T_DIP} rgbSplit={6} seed={11}>
          <div style={{...abs(0, 0, 1280, 720), transform: `scale(${dipPulse.toFixed(4)})`, transformOrigin: '960px 212px'}}>
            <CText cx={960} cy={212} size={56} weight={900} color="#FFF" letterSpacing={2}
              shadow={`0 0 18px rgba(102,48,248,${(0.4 * gk).toFixed(2)})`}
              style={{WebkitTextStroke: '2.5px rgba(161,117,241,0.95)', paintOrder: 'stroke fill'}}>a diplomat</CText>
          </div>
        </GlitchIn>
      </div>
    </CameraRig>
  );
};
