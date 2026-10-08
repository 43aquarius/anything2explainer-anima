import React from 'react';
import {useCurrentFrame} from 'remotion';
import {clamp01, easeInOutPow, easeOutCubic, kf, FONT_MONO, FONT_ORB} from '../../common';
import {CText, Box, WHITE, PURPLE, GREY, GREY_MID, BLOOM_SOFT, abs, exitOp, firstOp, slideUp, glowOffK} from '../../ui';

/**
 * SC11 1989 密尔沃基 · N 1597–1713（S11 1605–1711：1605「1989.」/ 1645「Phil Katz, PKWARE, Milwaukee.」）
 * 章节卡承接（时间倒转感）：章节卡「The Box」1585–1596 加速上出后，`1989`（Orbitron 96px 白 + 紫硬投影）
 *   首帧即出现在章节卡标题槽位 (640,372)（不清场），节拍 1605 起 kf 16 帧移到左上 (245,190)（带两条时间倒转拖影）；
 *   右侧人物语境卡（560,180,580×280 白边）：Phil Katz（Noto 900 52px）/ PKWARE, Inc.（等宽 28px）/ Milwaukee（灰 26px）
 *   逐行打字机（2 帧/字）；右上角小软盘章 stampIn（1.4→1.0 + 白闪 2 帧）；卡边框白光呼吸（30 帧周期，持续动作）。
 * 停留：段内不判（S11 非 ¶）。末 8 帧归零（卡白光先灭 6 帧）。零 glitch（本组 glitch 只给 SC12/SC15）。
 * 注：分镜表「承接章节卡 1989」——实际章节卡大字是「The Box」（tech 行含 1989 · PK · …），故承接落点取
 *   「1989 出现在刚出画的章节卡标题槽位 + 拖影 = 时间倒转感」，几何上与卡片出画轨迹相接（同 cy 372）。
 */
const F0 = 1597, TO = 1713;
const T_MOVE = 1605; // S11.c1「1989.」→ kf 16 帧移到左上
const MOVE_LEN = 16;
const T_CARD = 1645; // S11.c2 → 人物卡 slideUp Δ100/22 帧
const T_TYPE = [1658, 1670, 1682]; // 三行打字机（2 帧/字）
const T_STAMP = 1668; // 软盘章 stampIn（1.4→1.0 / 10 帧，+8 帧处白闪 2 帧）

const CARD = {x: 560, y: 180, w: 580, h: 280};
const YEAR_FROM = {x: 640, y: 372}; // 章节卡标题槽位
const YEAR_TO = {x: 245, y: 190};

const LINES = [
  {text: 'Phil Katz', y: 224, size: 52, weight: 900, color: WHITE, mono: false},
  {text: 'PKWARE, Inc.', y: 318, size: 28, weight: 700, color: WHITE, mono: true},
  {text: 'Milwaukee', y: 388, size: 26, weight: 600, color: GREY, mono: false},
];

/** 小软盘章（本组自绘 glyph，54px 白线条；不进 ui.tsx） */
const Floppy: React.FC<{cx: number; cy: number; s: number; flash: number; op: number}> = ({cx, cy, s, flash, op}) => (
  <div style={{...abs(cx - 27, cy - 27, 54, 54), opacity: op, transform: `rotate(-8deg) scale(${s.toFixed(3)})`}}>
    <svg width={54} height={54} viewBox="0 0 54 54" style={{position: 'absolute', left: 0, top: 0, overflow: 'visible', filter: `${BLOOM_SOFT}${flash > 0 ? ` brightness(${(1 + 0.9 * flash).toFixed(2)})` : ''}`}}>
      <rect x={2} y={2} width={50} height={50} rx={5} fill="#000" stroke={WHITE} strokeWidth={2.5} />
      <rect x={14} y={4.5} width={26} height={15} fill="#000" stroke={WHITE} strokeWidth={2} />
      <rect x={27} y={7.5} width={8} height={9} fill={WHITE} opacity={0.85} />
      <rect x={12} y={26} width={30} height={22} fill="#000" stroke={WHITE} strokeWidth={2} />
      {[31, 36.5, 42].map((ly) => <rect key={ly} x={16} y={ly} width={22} height={2.2} fill={GREY_MID} />)}
    </svg>
  </div>
);

export const SC11: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const exOp = exitOp(N, TO, 8);
  const glowK = glowOffK(N, TO, 6); // 卡白光先灭

  // ---- 1989：首帧在场（章节卡槽位），1605 起 16 帧移到左上 ----
  const yn = N - F0;
  const p = kf(N, [[F0, 0], [T_MOVE, 0], [T_MOVE + MOVE_LEN, 1]], easeInOutPow(2.5));
  const settle = 1 + 0.05 * Math.pow(1 - clamp01(yn / 10), 2); // 落定微缩
  const yx = YEAR_FROM.x + (YEAR_TO.x - YEAR_FROM.x) * p;
  const yy = YEAR_FROM.y + (YEAR_TO.y - YEAR_FROM.y) * p;
  const yearOp = firstOp(yn, 6) * exOp;
  const yearShadow = `5px 5px 0 ${PURPLE}, 0 0 ${(16 + 6 * Math.sin((2 * Math.PI * N) / 30)).toFixed(1)}px rgba(102,45,248,${(0.3 * glowK).toFixed(2)})`;
  const yearAt = (q: number) => ({x: YEAR_FROM.x + (YEAR_TO.x - YEAR_FROM.x) * q, y: YEAR_FROM.y + (YEAR_TO.y - YEAR_FROM.y) * q});

  // ---- 人物卡（主角 280px）：slideUp Δ100/22 + 三行打字机 ----
  const cn = N - T_CARD;
  const yOff = cn < 0 ? 100 : slideUp(cn, 100, 22);
  const cardOp = (cn < 0 ? 0 : firstOp(cn, 6)) * exOp;
  const tw = (i: number) => (N < T_TYPE[i] ? '' : LINES[i].text.slice(0, Math.floor((N - T_TYPE[i]) / 2)));
  // 卡边框白光呼吸（30 帧周期，卡落位后 8 帧亮起）
  const glowA = (0.15 + 0.09 * Math.sin((2 * Math.PI * N) / 30)) * clamp01((cn - 20) / 8) * glowK;

  // ---- 软盘章 ----
  const sn = N - T_STAMP;
  const stampS = sn < 0 ? 0 : kf(N, [[T_STAMP, 1.4], [T_STAMP + 10, 1]], easeOutCubic);
  const stampFlash = N >= T_STAMP + 8 && N < T_STAMP + 10 ? 1 - (N - (T_STAMP + 8)) * 0.5 : 0;

  return (
    <div style={{position: 'absolute', inset: 0, opacity: exOp}}>
      {/* 1989 的时间倒转拖影（位移期间两个落后相位，仅移动中可见） */}
      {p > 0.03 && p < 0.97
        ? [0.18, 0.36].map((lag, i) => {
            const q = clamp01(p - lag);
            const g = yearAt(q);
            return <CText key={i} cx={g.x} cy={g.y} size={96} weight={700} family={FONT_ORB} letterSpacing={4} color={WHITE} opacity={(0.16 - i * 0.08) * (1 - p)}>{'1989'}</CText>;
          })
        : null}
      {/* 1989 主字（承接章节卡槽位 → 左上） */}
      <div style={{position: 'absolute', inset: 0, transform: `scale(${(settle).toFixed(4)})`, transformOrigin: '640px 372px'}}>
        <CText cx={yx} cy={yy} size={96} weight={700} family={FONT_ORB} letterSpacing={4} color={WHITE} opacity={yearOp} shadow={yearShadow}>{'1989'}</CText>
      </div>

      {/* 人物语境卡（主角） */}
      {cn >= 0 ? (
        <div style={{position: 'absolute', inset: 0, opacity: cardOp}}>
          <Box x={CARD.x} y={CARD.y + yOff} w={CARD.w} h={CARD.h} r={12} sw={2.5} glow={glowA > 0.01 ? `0 0 16px 5px rgba(255,255,255,${glowA.toFixed(3)})` : undefined} />
          {LINES.map((l, i) => (
            <div
              key={l.text}
              style={{
                ...abs(CARD.x + 46, l.y + yOff, CARD.w - 92, l.size + 8),
                fontFamily: l.mono ? FONT_MONO : undefined,
                fontWeight: l.weight,
                fontSize: l.size,
                color: l.color,
                lineHeight: 1.05,
                whiteSpace: 'nowrap',
              }}
            >
              {tw(i)}
            </div>
          ))}
          <Floppy cx={CARD.x + CARD.w - 52} cy={CARD.y + 54 + yOff} s={stampS} flash={stampFlash} op={sn < 0 ? 0 : firstOp(sn, 4)} />
        </div>
      ) : null}
    </div>
  );
};
