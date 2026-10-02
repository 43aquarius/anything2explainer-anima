import React from 'react';
import {useCurrentFrame} from 'remotion';
import {clamp01, stepKf, emphasisPulse, FONT_ORB, FONT_MONO, rnd} from '../../common';
import {CText, Pill, Box, WHITE, PURPLE, GREY, GREY_MID, fadeIn, slideUp, exitOp} from '../../ui';
import {CameraRig} from '../../fx';

/**
 * SC11 1988 tcpdump · N 2022–2190（S13 2030–2188：2030「几十年」/ 2095「1988 伯克利」）
 * 版式：左 终端卡 560×400（x 60–620，y 180–580，黑底白边）：顶部 Pill `tcpdump`（等宽）+
 *   命令 `$ tcpdump -i eth0`（打字机）+ 输出行（`tcpdump: listening on eth0...` / `14:02:11.204 IP 203.0.113.10.443 > ...`）+ 灰色文本线 + 闪烁光标；
 *   右 大年份 `1988`（Orbitron 96px，(830,330)）+ 下灰小字 `Lawrence Berkeley Lab`（22px）。
 * 年份 YearRoll：2092 起 14 帧从 1983 滚到 1988，滚动期用「重影堆栈（±13px 横向抖动）+ 白 text-shadow 拖影」做 ≥9px 的等效模糊
 *   （CSS filter blur σ≥1 是性能红线，禁用；重影保证中间值不可读），落定帧清零 + 紫硬投影 + emphasisPulse 1.08。
 * 运镜：2116–2152 拉远 1.16→1.0（Ch1 收束：先聚焦终端打字，拉远露出年份全貌；结束帧 ≤ 离场起点−30）。
 * 停留：段内不判。末 8 帧归零。
 */
const F0 = 2022, TO = 2190;
const T_CARD = 2030, T_CMD = 2036, T_ROWS = 2072, T_YEAR = 2092, T_LAB = 2096;
const ROLL = 14;
const T_PULL = 2116, PULL_END = 2152;
const CARD = {x: 60, y: 180, w: 560, h: 400}; // 中心 (340,380)
const CMD = '$ tcpdump -i eth0';
const OUT1 = 'tcpdump: listening on eth0...';
const OUT2 = '14:02:11.204 IP 203.0.113.10.443 > ...';
const YEAR = {cx: 820, cy: 330, size: 96};
const YEAR_KF: Array<[number, number]> = [
  [T_YEAR, 1983],
  [T_YEAR + 3, 1984],
  [T_YEAR + 6, 1985],
  [T_YEAR + 8, 1986],
  [T_YEAR + 11, 1987],
  [T_YEAR + ROLL, 1988],
];
/** 滚动期重影偏移（横向 ±13px，加 rnd 竖向抖动 → 等效模糊 ≥9px） */
const GHOSTS: Array<[number, number]> = [
  [-13, 0.13],
  [-7, 0.25],
  [0, 1],
  [7, 0.25],
  [13, 0.13],
];
/** 卡内灰色文本线（占位输出行）：[top, w 比例] */
const BARS: Array<[number, number]> = [
  [208, 0.94],
  [250, 0.86],
  [292, 0.66],
];

export const SC11: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const exOp = exitOp(N, TO, 8);
  // 终端卡 slideUp 入场（Δ90 / 22 帧）
  const cn = N - T_CARD;
  const cardY = CARD.y + slideUp(cn, 90, 22);
  const cardOp = cn < 0 ? 0 : fadeIn(cn, 10);
  // 打字机（每 2 帧 1 字）
  const cmd = CMD.slice(0, Math.max(0, Math.floor((N - T_CMD) / 2)));
  // 年份 YearRoll
  const yn = N - T_YEAR;
  const year = stepKf(N, YEAR_KF);
  const rolling = yn >= 0 && yn < ROLL;
  const landed = yn >= ROLL;
  const pulse = emphasisPulse(N - (T_YEAR + ROLL), {peak: 1.08});
  // 输出行逐行 wipe（clip 宽度 6 帧）
  const rowP = (f0: number) => clamp01((N - f0) / 6);
  // 光标闪烁（8 帧一闪，全镜）
  const cursorOn = cn >= 0 && Math.floor(N / 8) % 2 === 0;

  return (
    <CameraRig
      N={N}
      keys={[
        {f: F0, x: 450, y: 385, s: 1.14},
        {f: T_PULL, x: 450, y: 385, s: 1.14},
        {f: PULL_END, x: 640, y: 368, s: 1.0},
      ]}
    >
      <div style={{position: 'absolute', inset: 0, opacity: exOp}}>
        {/* 终端卡（双主角之一，400px 高，BLOOM） */}
        {cardOp > 0 ? (
          <div style={{position: 'absolute', left: CARD.x, top: cardY, width: CARD.w, height: CARD.h, opacity: cardOp}}>
            <Box x={0} y={0} w={CARD.w} h={CARD.h} r={10} sw={3} />
            {/* 顶部 Pill tcpdump（骑在卡上边） */}
            <Pill x={CARD.w / 2 - 86} y={-22} w={172} h={44} fill={PURPLE} sw={2} text="tcpdump" fontSize={24} weight={700} family={FONT_MONO} letterSpacing={1} textDy={0} />
            {/* 命令行（打字机） */}
            <div style={{position: 'absolute', left: 30, top: 54, fontFamily: FONT_MONO, fontSize: 24, color: WHITE, lineHeight: 1.4, whiteSpace: 'pre'}}>
              {cmd}
            </div>
            {/* 输出行 1：listening（灰） */}
            {N >= T_ROWS ? (
              <div style={{position: 'absolute', left: 30, top: 108, width: 500 * rowP(T_ROWS), overflow: 'hidden', fontFamily: FONT_MONO, fontSize: 22, color: GREY, lineHeight: 1.4, whiteSpace: 'pre'}}>
                {OUT1}
              </div>
            ) : null}
            {/* 输出行 2：抓到的包（白） */}
            {N >= T_ROWS + 6 ? (
              <div style={{position: 'absolute', left: 30, top: 156, width: 500 * rowP(T_ROWS + 6), overflow: 'hidden', fontFamily: FONT_MONO, fontSize: 22, color: WHITE, lineHeight: 1.4, whiteSpace: 'pre'}}>
                {OUT2}
              </div>
            ) : null}
            {/* 后续输出：灰色文本线（占位，逐行 wipe） */}
            {BARS.map(([top, f], i) => {
              const rn = N - (T_ROWS + 14 + i * 4);
              if (rn < 0) return null;
              return <div key={i} style={{position: 'absolute', left: 30, top, width: (CARD.w - 60) * f * clamp01(rn / 6), height: 4, background: GREY_MID, opacity: 0.85}} />;
            })}
            {/* 左下角闪烁光标（持续动作，全镜） */}
            {cn >= 0 ? (
              <div style={{position: 'absolute', left: 30, top: 348, width: 13, height: 26, background: WHITE, opacity: cursorOn ? 0.9 : 0.12}} />
            ) : null}
          </div>
        ) : null}
        {/* 年份 1988（YearRoll：滚动期重影模糊，落定清零 + 紫硬投影） */}
        {yn >= 0 ? (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              transformOrigin: `${YEAR.cx}px ${YEAR.cy}px`,
              transform: pulse === 1 ? undefined : `scale(${pulse.toFixed(4)})`,
            }}
          >
            {rolling
              ? GHOSTS.map(([dx, a], i) => (
                  <CText
                    key={i}
                    cx={YEAR.cx + dx}
                    cy={YEAR.cy + (rnd(N, i) * 6 - 3)}
                    size={YEAR.size}
                    weight={700}
                    family={FONT_ORB}
                    letterSpacing={6}
                    color={WHITE}
                    opacity={a}
                    style={{fontVariantNumeric: 'tabular-nums', textShadow: '0 0 9px rgba(255,255,255,.9), 0 0 9px rgba(255,255,255,.85), 0 0 9px rgba(255,255,255,.8), 0 0 9px rgba(255,255,255,.75)'}}
                  >
                    {year}
                  </CText>
                ))
              : null}
            {landed ? (
              <CText cx={YEAR.cx} cy={YEAR.cy} size={YEAR.size} weight={700} family={FONT_ORB} letterSpacing={6} color={WHITE} shadow={`6px 6px 0 ${PURPLE}, 0 0 28px rgba(102,45,248,.45)`} style={{fontVariantNumeric: 'tabular-nums'}}>
                {year}
              </CText>
            ) : null}
          </div>
        ) : null}
        {/* 年份下灰小字：Lawrence Berkeley Lab */}
        {N >= T_LAB ? (
          <CText cx={YEAR.cx} cy={YEAR.cy + 72} size={22} weight={600} color={GREY} opacity={fadeIn(N - T_LAB, 8)}>
            Lawrence Berkeley Lab
          </CText>
        ) : null}
      </div>
    </CameraRig>
  );
};
