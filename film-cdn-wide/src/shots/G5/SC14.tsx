import React from 'react';
import {useCurrentFrame} from 'remotion';
import {clamp01, emphasisPulse} from '../../common';
import {CameraRig} from '../../fx';
import {
  CText, Box, SoftIn, RackIcon, EdgeNode, abs, exitOp, glowOffK, slideUp, softOp, scaleIn,
  GREY, GREY_MID, GREY_LINE, PURPLE_LIGHT, ORANGE, WHITE,
} from '../../ui';
import {ApplianceIcon} from './g5ui';

/**
 * SC14 跟随者（3293–3511）。S19：其他人跟上 → ISP 里的开放设备 → 三百多座城的边缘。段末 ¶（跨 gap 到 S20 前）。
 * 节拍：3295 三卡 2 帧错峰 slideUp（各 16 帧，Δ60）+ 3298 `others followed` SoftIn
 *       ｜3336 第一卡 ISP 小盒缩入（21 帧）+ 第二卡 EdgeNode 三枚 2 帧错峰亮
 *       ｜3416 第三卡 `300+` 计数落定（20 帧）+ 橙光晕 + 三卡各一次 emphasisPulse（3438/3440/3442）
 *       ｜3446 三卡轻微浮动（±3px 错峰周期，持续动作）→ TO−40 前衰减冻结（3468 归 0）。
 * 运镜：1.0→1.05 慢推贯穿（3293–3475，不进离场）。停留：段末，`300+` 落位 3436 → 离场 3503，hold ≥30 ✓。
 * 主角：三卡组 300px（`300+` 橙光晕）。零 glitch（计数即焦点）。
 */
const F0 = 3293;
const TO = 3511;

const CARD_W = 300, CARD_H = 180, CARD_Y = 258;
const CARD_X = [150, 490, 830]; // 三卡左上角（屏幕坐标）
const CARD_CX = CARD_W / 2;    // 卡内局部中心 x

// 第三卡城市点阵（7×4，卡内局部坐标）
const GRID_COLS = 7, GRID_ROWS = 4, DOT = 9, GAPX = 26, GAPY = 22;
const GRID_N = GRID_COLS * GRID_ROWS;

export const SC14: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const exit = exitOp(N, TO, 8);
  const glowK = glowOffK(N, TO);

  // 三卡 slideUp（2 帧错峰，各 16 帧）+ 浮动（±3px 错峰，3468 前冻结）+ 落定后各一次 emphasisPulse
  const cardDy = (i: number) => slideUp(N - (3295 + i * 2), 60, 16);
  const floatK = 1 - clamp01((N - 3456) / 12);
  const floatDy = (i: number) => 3 * Math.sin(((N - 3446) / [64, 76, 88][i]) * Math.PI * 2 + i * 2.1) * floatK;
  const pulse = (i: number) => emphasisPulse(N - (3438 + i * 2), {peak: 1.1, up: 10, hold: 3, down: 10});

  // `300+` 计数（3416 起 20 帧落定）
  const cntT = clamp01((N - 3416) / 20);
  const val = Math.round(300 * (1 - Math.pow(1 - cntT, 2)));
  const landed = cntT >= 1;
  const numText = landed ? '300+' : `${val}+`;
  const numGlow = (0.5 + 0.14 * Math.sin((N / 30) * Math.PI * 2)) * clamp01((N - 3416) / 6) * (landed ? 1 : 0.55) * glowK;

  // 第二卡 EdgeNode 三枚（3336 起 2 帧错峰亮）
  const edgeOn = (i: number) => clamp01((N - (3336 + i * 2)) / 10);

  const cardStyle = (i: number): React.CSSProperties => ({
    ...abs(CARD_X[i], CARD_Y, CARD_W, CARD_H), opacity: softOp(N - (3295 + i * 2), 6),
    transform: `translateY(${(cardDy(i) + floatDy(i)).toFixed(2)}px) scale(${pulse(i).toFixed(4)})`, transformOrigin: '50% 55%',
  });

  return (
    <CameraRig N={N} keys={[{f: F0, x: 640, y: 360, s: 1}, {f: 3475, x: 640, y: 360, s: 1.05}]}>
      <div style={{...abs(0, 0, 1280, 720), opacity: exit}}>
        {/* 上方灰字 */}
        <SoftIn N={N} f0={3298}>
          <CText cx={640} cy={210} size={30} weight={600} letterSpacing={2} color={GREY}>others followed</CText>
        </SoftIn>

        {/* 卡 1：open appliances（ISP 内小盒子） */}
        <div style={cardStyle(0)}>
          <Box x={0} y={0} w={CARD_W} h={CARD_H} r={14} fill="#000" stroke={WHITE} sw={2.5} />
          <RackIcon cx={CARD_CX} cy={60} w={66} h={104} units={4} lit={0} color={GREY_MID} sw={2.2} opacity={0.9} />
          <div style={{...abs(0, 0, CARD_W, CARD_H), transform: `scale(${(0.35 + 0.65 * scaleIn(N - 3336, 21)).toFixed(4)})`, transformOrigin: '50% 33%', opacity: clamp01((N - 3336) / 4)}}>
            <ApplianceIcon cx={CARD_CX} cy={60} N={N} f0={3336} />
          </div>
          <CText cx={CARD_CX} cy={126} size={22} weight={600} letterSpacing={2} color={GREY_MID}>ISP</CText>
          <CText cx={CARD_CX} cy={154} size={30} weight={700} letterSpacing={1} color={WHITE}>open appliances</CText>
        </div>

        {/* 卡 2：edges（EdgeNode ×3 排） */}
        <div style={cardStyle(1)}>
          <Box x={0} y={0} w={CARD_W} h={CARD_H} r={14} fill="#000" stroke={WHITE} sw={2.5} />
          {[[-55, 62], [0, 52], [55, 62]].map(([dx, cy], i) => {
            const on = edgeOn(i);
            if (on <= 0.01) return null;
            return <EdgeNode key={i} cx={CARD_CX + dx} cy={cy} w={52} h={61} lit={on > 0.4} opacity={on} glow={on > 0.9} />;
          })}
          <CText cx={CARD_CX} cy={154} size={30} weight={700} letterSpacing={1} color={WHITE}>edges</CText>
        </div>

        {/* 卡 3：300+ cities（计数 + 城市点阵） */}
        <div style={cardStyle(2)}>
          <Box x={0} y={0} w={CARD_W} h={CARD_H} r={14} fill="#000" stroke={WHITE} sw={2.5} />
          {Array.from({length: GRID_N}, (_, j) => {
            const lit = val >= ((j + 1) * 300) / GRID_N;
            const col = j % GRID_COLS, row = Math.floor(j / GRID_COLS);
            const gx = CARD_CX - ((GRID_COLS - 1) * GAPX) / 2 + col * GAPX;
            const gy = 24 + row * GAPY;
            return <div key={j} style={{position: 'absolute', left: gx - DOT / 2, top: gy - DOT / 2,
              width: DOT, height: DOT, borderRadius: 2, boxSizing: 'border-box',
              background: lit ? PURPLE_LIGHT : '#0a0a0a', border: `1.5px solid ${lit ? PURPLE_LIGHT : GREY_LINE}`}} />;
          })}
          <CText cx={CARD_CX} cy={134} size={56} weight={700} letterSpacing={2} color={ORANGE}
            shadow={`0 0 40px rgba(243,95,69,${(numGlow * 0.75).toFixed(2)}), 0 0 12px rgba(243,95,69,${(numGlow * 0.6).toFixed(2)})`}
            style={{fontVariantNumeric: 'tabular-nums'}}>
            {numText}
          </CText>
          <CText cx={CARD_CX} cy={164} size={24} weight={500} letterSpacing={2} color={GREY}>cities</CText>
        </div>
      </div>
    </CameraRig>
  );
};

export const SC14_RANGE = {from: F0, to: TO};
