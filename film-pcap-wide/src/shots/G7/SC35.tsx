import React from 'react';
import {useCurrentFrame} from 'remotion';
import {clamp01, emphasisPulse, powOutRemain} from '../../common';
import {Box, CText, GREY_LIGHT, PURPLE_LIGHT, RED_DEEP, WHITE, fadeIn, exitOp, SoftIn} from '../../ui';
import {LockGlyph, PermitCard} from './g7ui';

/** ①② 站位圈（Orbitron 数字 + 紫圈，避免 Orbitron 缺圆圈数字字形） */
const NumBadge: React.FC<{cx: number; cy: number; num: string; opacity?: number}> = ({cx, cy, num, opacity = 1}) => (
  <svg width={64} height={64} viewBox="-32 -32 64 64" style={{position: 'absolute', left: cx - 32, top: cy - 32, overflow: 'visible', opacity}}>
    <circle cx={0} cy={0} r={28} fill="#000" stroke={PURPLE_LIGHT} strokeWidth={3} />
    <text x={0} y={11} textAnchor="middle" fontFamily="'Orbitron','Audiowide',sans-serif" fontSize={32} fontWeight={700} fill={PURPLE_LIGHT}>{num}</text>
  </svg>
);

/**
 * SC35 两个诚实的限制 · N 7833–7939（S45 7841–7937：7841 抓包之前 / 7901 两个限制）
 * 版式：中央左右两张大卡（各 420×300，y 240）：左 `①` + 挂锁（draw-on 20 帧，锁芯微转持续）
 *   + 标题 `encryption`；右 `②` + 盖章许可状（章印呼吸持续）+ 标题 `permission`。
 *   左卡内一条小线缆（SC34 线缆元素缩小入卡，章界承接）从卡缘连到锁下。
 * 7841 两卡自两侧滑入（Δ260，18 帧，前 6 帧渐入）；7901 两卡 emphasisPulse 1.05 微推；
 * 末 8 帧归零。零 glitch（白名单：SC35 无）。主角：两卡（锁卡为主，300px 高）；光：卡边白 BLOOM。
 */
const F0 = 7833, TO = 7939;
const T_IN = 7841, T_DRAW = 7843, T_PUSH = 7901;
const CARD = {y: 240, w: 420, h: 300};
const LX = 160, RX = 700; // 左右卡左缘
const SLIDE = 260, SLIDE_N = 18;

export const SC35: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const op = exitOp(N, TO, 8);
  const nIn = N - T_IN;
  const rem = powOutRemain(nIn, SLIDE_N, 2.5); // 1 → 0
  const inOp = nIn < 0 ? 0 : fadeIn(nIn, 6);
  const pulse = emphasisPulse(N - T_PUSH, {peak: 1.05, up: 10, hold: 4, down: 14});
  const drawP = clamp01((N - T_DRAW) / 20);
  const wireP = clamp01((N - T_DRAW) / 18);
  // 持续动作：锁芯微转（96 帧周期 ±13°）、章印呼吸（30 帧周期 ±5%）
  const keyRot = 13 * Math.sin((2 * Math.PI * N) / 96);
  const stampS = 1 + 0.05 * Math.sin((2 * Math.PI * N) / 30);
  const stampK = clamp01((N - (T_DRAW + 8)) / 12);
  const docP = clamp01((N - (T_DRAW + 4)) / 20);
  const cardScale = pulse;
  return (
    <div style={{position: 'absolute', inset: 0, opacity: op}}>
      {/* 左卡 ① encryption + 锁 */}
      <div style={{position: 'absolute', inset: 0, opacity: inOp, transform: `translateX(${(-SLIDE * rem).toFixed(1)}px)`}}>
        <div style={{position: 'absolute', inset: 0, transform: `scale(${cardScale.toFixed(4)})`, transformOrigin: `${LX + CARD.w / 2}px ${CARD.y + CARD.h / 2}px`}}>
          <Box x={LX} y={CARD.y} w={CARD.w} h={CARD.h} r={16} sw={3} />
          <SoftIn N={N} f0={T_DRAW + 2}>
            <NumBadge cx={LX + 58} cy={CARD.y + 50} num="1" />
          </SoftIn>
          {/* 锁（draw-on + 锁芯微转） */}
          <LockGlyph cx={LX + 210} cy={CARD.y + 148} s={1.02} p={drawP} rot={keyRot} />
          {/* 线缆母题承接（SC34 → 卡内小线缆，断点红 X 呼应） */}
          {wireP > 0 ? (
            <svg width={CARD.w} height={60} viewBox={`0 0 ${CARD.w} 60`} style={{position: 'absolute', left: LX, top: CARD.y + 222, overflow: 'visible'}}>
              <line x1={16} y1={30} x2={16 + (CARD.w - 150) * wireP} y2={30} stroke={WHITE} strokeWidth={3} opacity={0.85} />
              {wireP > 0.6 ? <path d="M 150,22 L 166,38 M 166,22 L 150,38" stroke={RED_DEEP} strokeWidth={4} strokeLinecap="round" opacity={clamp01((wireP - 0.6) / 0.25)} /> : null}
            </svg>
          ) : null}
          <SoftIn N={N} f0={T_DRAW + 8}>
            <CText cx={LX + CARD.w / 2} cy={CARD.y + 268} size={36} weight={700} color={GREY_LIGHT}>encryption</CText>
          </SoftIn>
        </div>
      </div>
      {/* 右卡 ② permission + 许可状 */}
      <div style={{position: 'absolute', inset: 0, opacity: inOp, transform: `translateX(${(SLIDE * rem).toFixed(1)}px)`}}>
        <div style={{position: 'absolute', inset: 0, transform: `scale(${cardScale.toFixed(4)})`, transformOrigin: `${RX + CARD.w / 2}px ${CARD.y + CARD.h / 2}px`}}>
          <Box x={RX} y={CARD.y} w={CARD.w} h={CARD.h} r={16} sw={3} />
          <SoftIn N={N} f0={T_DRAW + 2}>
            <NumBadge cx={RX + 58} cy={CARD.y + 50} num="2" />
          </SoftIn>
          <PermitCard cx={RX + CARD.w / 2} cy={CARD.y + 150} w={168} h={132} p={docP} stampK={stampK} stampS={stampS} />
          <SoftIn N={N} f0={T_DRAW + 8}>
            <CText cx={RX + CARD.w / 2} cy={CARD.y + 268} size={36} weight={700} color={GREY_LIGHT}>permission</CText>
          </SoftIn>
        </div>
      </div>
    </div>
  );
};
