import React from 'react';
import {useCurrentFrame} from 'remotion';
import {clamp01, easeInOutCubic, powOutRemain} from '../../common';
import {CText, Pill, Svg, GREY, GREY_MID, WHITE, exitOp, softOp, firstOp} from '../../ui';
import {PointHand, hexTok} from './g7ui';

/**
 * SC41 Dalvik 时代 · N 5902–6049（S41 5910–6047 段内：5910「Older Android ran apps through an interpreter,」/ 5988「Dalvik, a few lines at a time.」）
 * 左侧 `THEN` 灰 Pill + 时间轴小段（2008 → 2013，灰）；中央代码卡（x 400–880，y 220–500）只有顶部 3 行被照亮，
 * 解释器手指每 14 帧下移一行窗（每次 3 行，旧窗渐暗，到底后回卷 = 解释器循环）；
 * 5988 `Dalvik` 灰标签 + 卡下小字 `interpreter · a few lines at a time`（灰 20px）；被照亮行持续轻微闪（解释执行感）。
 * 末 8 帧归零（手指步进持续到离场）。停留：段内不判。
 */
const F0 = 5902;
const TO = 6049;
const B_CARD = 5910, B_STEP0 = 5916, B_DALVIK = 5988, B_CAP = 5988;
const STEP = 14;

const CARD = {x: 400, y: 220, w: 480, h: 280};
const LINES = 12, WIN = 3, PERIOD = LINES / WIN; // 4 个窗口，步进循环
const ROW_H = 22, ROW_Y0 = 232; // 行 i 墨迹 top = ROW_Y0 + i*ROW_H（12 行落在卡内 y 232–496）
const rowCy = (i: number) => ROW_Y0 + i * ROW_H + 11;
const rowText = (i: number) => Array.from({length: 13}, (_, k) => hexTok(4100 + i, k)).join('');

export const SC41: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const op = exitOp(N, TO, 8);
  if (op <= 0) return null;

  const cardDy = 90 * powOutRemain(N - B_CARD, 18, 2.5);
  const cardOp = softOp(N - B_CARD, 8);
  // 手指步进：每 14 帧下移一个 3 行窗（取模回卷）；步进边界后 5 帧手指平滑滑到位
  const stepRaw = Math.floor((N - B_STEP0) / STEP);
  const step = stepRaw < 0 ? 0 : stepRaw % PERIOD;
  const winTop = step * WIN;
  const prevTop = ((step + PERIOD - 1) % PERIOD) * WIN;
  const inStep = stepRaw < 0 ? 0 : N - B_STEP0 - stepRaw * STEP;
  const glide = easeInOutCubic(clamp01(inStep / 5));
  const prevTopG = stepRaw < 1 ? winTop : prevTop;
  const fingerTop = prevTopG + (winTop - prevTopG) * glide;
  const fingerCy = rowCy(fingerTop + 1);

  return (
    <div style={{position: 'absolute', inset: 0, opacity: op}}>
      {/* 左侧：THEN 灰 Pill + 时间轴小段（2008 → 2013） */}
      <div style={{position: 'absolute', inset: 0, opacity: softOp(N - B_CARD, 8)}}>
        <Pill x={120} y={200} w={112} h={44} r={22} stroke={GREY} sw={2} fill="#000" text="THEN" fontSize={24} weight={700} color={GREY} />
      </div>
      <div style={{position: 'absolute', inset: 0, opacity: softOp(N - (B_CARD + 2), 8)}}>
        <Svg bloom={false}>
          <line x1={118} y1={318} x2={306} y2={318} stroke={GREY_MID} strokeWidth={2} />
          <polygon points="318,318 304,312 304,324" fill={GREY_MID} />
          {[0.25, 0.5, 0.75].map((t, i) => (
            <line key={i} x1={118 + 188 * t} y1={312} x2={118 + 188 * t} y2={324} stroke={GREY_MID} strokeWidth={1.5} />
          ))}
        </Svg>
        <CText cx={140} cy={290} size={22} weight={600} color={GREY}>2008</CText>
        <CText cx={296} cy={290} size={22} weight={600} color={GREY}>2013</CText>
      </div>

      {/* 中央：代码卡（主角组 280px；顶部 3 行照亮，其余暗）+ 解释器手指（随卡入场） */}
      <div style={{position: 'absolute', inset: 0, opacity: cardOp, transform: `translateY(${cardDy.toFixed(1)}px)`}}>
        <div
          style={{
            position: 'absolute',
            left: CARD.x, top: CARD.y, width: CARD.w, height: CARD.h,
            boxSizing: 'border-box', background: 'rgba(0,0,0,0.9)',
            border: `2.5px solid ${WHITE}`, borderRadius: 12,
          }}
        />
        {Array.from({length: LINES}, (_, i) => {
          const inWin = i >= winTop && i < winTop + WIN;
          const inPrev = stepRaw >= 1 && i >= prevTop && i < prevTop + WIN;
          const flick = 0.06 * Math.sin(2 * Math.PI * (N * 0.22 + i * 1.7));
          let b = 0.3;
          if (inWin) b = 0.94 + flick; // 被照亮行：白 + 轻微闪（解释执行感）
          else if (inPrev) b = 0.9 - 0.5 * clamp01(inStep / 10); // 旧窗口 10f 内渐暗
          return (
            <div
              key={i}
              style={{
                position: 'absolute', left: CARD.x + 24, top: ROW_Y0 + i * ROW_H,
                fontFamily: "'SF Mono', Menlo, Consolas, monospace", fontSize: 18, lineHeight: 1.2,
                color: WHITE, opacity: Number(b.toFixed(3)),
                textShadow: inWin ? '0 0 8px rgba(255,255,255,0.35)' : 'none',
                whiteSpace: 'pre',
              }}
            >
              {rowText(i)}
            </div>
          );
        })}
        <PointHand x={366} y={fingerCy - 17} opacity={firstOp(N - B_CARD, 6)} />
      </div>

      {/* 5988：Dalvik 灰标签 + 卡下小字 */}
      <div style={{position: 'absolute', inset: 0, opacity: softOp(N - B_DALVIK, 8)}}>
        <Pill x={415} y={172} w={132} h={40} r={20} stroke={GREY} sw={2} fill="#000" text="Dalvik" fontSize={24} weight={700} color={GREY} />
      </div>
      <div style={{position: 'absolute', inset: 0, opacity: softOp(N - B_CAP, 8)}}>
        <CText cx={640} cy={538} size={20} weight={500} color={GREY} family="'SF Mono', Menlo, Consolas, monospace">interpreter · a few lines at a time</CText>
      </div>
    </div>
  );
};

export default SC41;
