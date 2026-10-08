import React from 'react';
import {useCurrentFrame} from 'remotion';
import {GlitchIn, clamp01, kf, powIn, powOutRemain, FONT_MONO, FONT_WIDE} from '../../common';
import {CText, Pill, Svg, LineArrow, GPUChip, PURPLE, WHITE, GREY, exitOp, glowOffK, softOp, glowPurpleS, scaleIn} from '../../ui';
import {HeroGlow} from '../../fx';
import {DexFileCard} from './g7ui';

/**
 * SC42 ART 到来 · N 6050–6307（S42 6058–6305 ¶：6058「Since Android 5.0, the runtime is ART,」/ 6165「and at install it compiles classes.dex」/ 6237「into machine code for your exact CPU.」）
 * 6058 左上 `Android 5.0` 白 Pill + `NOW` 紫 Pill stampIn（2f 错峰）+ 芯片上方 `ART` 大字（Audiowide 84px 白+紫描边）
 * GlitchIn（rgbSplit 6，**本镜唯一 glitch**）；6064 GPUChip（cx 900，cy 330，size 260，grid 6×6=36 格）scaleIn；
 * 6165 classes.dex 卡（左，白边 + dex 图标 + 源码滚动）slideIn + 粗箭头（标 `install time` 等宽 20px）draw-on +
 * 芯片核心格阵自左上角逐格点亮（2f/格级联，72f 完成于 6237）；6237 点亮完成 → 芯片紫光爆发（HeroGlow 爆发 + 呼吸）+
 * `machine code`（等宽 22px 白，芯片下）打字机 + `your exact CPU`（灰 20px，芯片右上角）SoftIn。
 * 停留：段末（¶），机器码打字完成 6262 → 离场 6300（TO−8），hold ~38f ≥30 ✓。末 8 帧归零。
 */
const F0 = 6050;
const TO = 6307;
const B_PILL = 6058, B_ART = 6058, B_CHIP = 6064, B_CARD = 6165, B_ARROW = 6168, B_LBL = 6180, B_DONE = 6237, B_CPU = 6240;

const CHIP = {cx: 900, cy: 330, size: 260};
const CARD = {x: 250, y: 265, w: 250, h: 160};
const MC_TEXT = 'machine code';

export const SC42: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const op = exitOp(N, TO, 8);
  if (op <= 0) return null;
  const gk = glowOffK(N, TO, 6, 8);

  // 两 Pill stampIn（1.35→1 + 白闪 2f，2f 错峰）
  const pillS = (i: number) => 1.35 - 0.35 * powIn(2.2)(clamp01((N - (B_PILL + i * 2)) / 10));
  const pillFlash = (i: number) => Math.sin(Math.PI * clamp01((N - (B_PILL + i * 2 + 1)) / 4));
  // ART 大字：紫描边 + 呼吸光晕（离场先灭光）
  const artBreathe = 0.7 + 0.3 * Math.sin((2 * Math.PI * (N - B_ART)) / 30);
  // 芯片：scaleIn 21f + 格阵 2f/格（6165 起 72f 完成 6237）
  const chipS = scaleIn(N - B_CHIP, 21);
  const litFrac = clamp01((N - B_CARD) / 72);
  const chipGlow = kf(N, [[6085, 0], [6093, 0.5], [6237, 0.5], [6243, 1], [6268, 0.72]]) * gk;
  const burstK = kf(N, [[6237, 0], [6244, 0.95], [6270, 0.35]]) * gk;
  // dex 卡 slideUp + 箭头 draw-on
  const cardDy = 90 * powOutRemain(N - B_CARD, 16, 2.5);
  const cardOp = softOp(N - B_CARD, 8);
  const arrowP = clamp01((N - B_ARROW) / 20);
  // machine code 打字机（2f/字）
  const mcShown = Math.max(0, Math.floor((N - B_DONE) / 2));
  const mcText = MC_TEXT.slice(0, Math.min(MC_TEXT.length, mcShown));

  return (
    <div style={{position: 'absolute', inset: 0, opacity: op}}>
      {/* 左上：Android 5.0 白 Pill + NOW 紫 Pill */}
      <div style={{position: 'absolute', inset: 0, transform: `scale(${pillS(0).toFixed(3)})`, transformOrigin: '218px 151px', filter: `brightness(${(1 + 0.45 * pillFlash(0)).toFixed(3)})`}}>
        <Pill x={120} y={128} w={196} h={46} r={23} stroke={WHITE} sw={2.5} fill="#000" text="Android 5.0" fontSize={24} weight={700} color={WHITE} />
      </div>
      <div style={{position: 'absolute', inset: 0, transform: `scale(${pillS(1).toFixed(3)})`, transformOrigin: '392px 151px', filter: `brightness(${(1 + 0.45 * pillFlash(1)).toFixed(3)})`}}>
        <Pill x={336} y={128} w={112} h={46} r={23} stroke={WHITE} sw={2.5} fill={PURPLE} text="NOW" fontSize={24} weight={700} color={WHITE} glow={glowPurpleS(0.8)} />
      </div>

      {/* ART 大字（本镜唯一 glitch，芯片上方） */}
      <GlitchIn N={N} f0={B_ART} rgbSplit={6} seed={42}>
        <CText
          cx={900}
          cy={152}
          size={84}
          weight={400}
          family={FONT_WIDE}
          color={WHITE}
          letterSpacing={6}
          style={{
            WebkitTextStroke: `3px ${PURPLE}`,
            paintOrder: 'stroke fill',
            textShadow: `0 0 ${Math.round(14 + 10 * artBreathe)}px rgba(161,117,241,${(0.5 * gk).toFixed(3)}), 0 0 4px rgba(161,117,241,${(0.45 * gk).toFixed(3)})`,
          }}
        >
          ART
        </CText>
      </GlitchIn>

      {/* 芯片（主角 260px：核心格阵级联点亮 + 完成时紫光爆发） */}
      {chipS > 0 ? (
        <div style={{position: 'absolute', inset: 0, transform: `scale(${chipS.toFixed(4)})`, transformOrigin: `${CHIP.cx}px ${CHIP.cy}px`}}>
          <HeroGlow x={CHIP.cx - 122} y={CHIP.cy - 122} w={244} h={244} r={36} N={N} k={burstK} />
          <GPUChip cx={CHIP.cx} cy={CHIP.cy} size={CHIP.size} grid={6} lit={litFrac} glowK={chipGlow} sw={3} />
        </div>
      ) : null}

      {/* 6237：machine code（打字机 + 等宽光标） + your exact CPU（芯片右上角） */}
      <div style={{position: 'absolute', inset: 0, opacity: softOp(N - B_DONE, 6)}}>
        <CText cx={900} cy={497} size={22} weight={600} family={FONT_MONO} color={WHITE} letterSpacing={1} shadow={'0 0 10px rgba(255,255,255,.3)'}>{mcText}</CText>
        {mcShown < MC_TEXT.length ? (
          <div style={{position: 'absolute', left: 900 + (mcText.length - MC_TEXT.length / 2) * 13.2 + 4, top: 485, width: 11, height: 24, background: WHITE, opacity: Math.floor(N / 2) % 2 === 0 ? 0.9 : 0.2}} />
        ) : null}
      </div>
      <div style={{position: 'absolute', inset: 0, opacity: softOp(N - B_CPU, 8)}}>
        <Svg bloom={false}>
          <line x1={1034} y1={191} x2={1016} y2={203} stroke={GREY} strokeWidth={1.5} opacity={0.7} />
        </Svg>
        <CText cx={1100} cy={182} size={20} weight={500} family={FONT_MONO} color={GREY}>your exact CPU</CText>
      </div>

      {/* 6165：classes.dex 卡（左） + 粗箭头（中标 install time） */}
      {cardOp > 0 ? (
        <div style={{position: 'absolute', inset: 0, opacity: cardOp, transform: `translateY(${cardDy.toFixed(1)}px)`}}>
          <DexFileCard x={CARD.x} y={CARD.y} w={CARD.w} h={CARD.h} N={N} seed={77} title="classes.dex" />
        </div>
      ) : null}
      <Svg bloom={false}>
        <LineArrow x0={506} y0={330} x1={748} y1={330} p={arrowP} rodW={5} headL={26} headW={30} color={WHITE} />
      </Svg>
      <div style={{position: 'absolute', inset: 0, opacity: softOp(N - B_LBL, 8)}}>
        <CText cx={627} cy={298} size={20} weight={500} family={FONT_MONO} color={WHITE}>install time</CText>
      </div>
    </div>
  );
};

export default SC42;
