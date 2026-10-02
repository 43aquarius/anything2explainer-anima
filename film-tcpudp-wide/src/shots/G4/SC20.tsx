import React from 'react';
import {useCurrentFrame} from 'remotion';
import {BEZ_SCALE_IN, clamp01, emphasisPulse, FONT_MONO, FONT_ORB, powOutRemain} from '../../common';
import {
  Box, CText, exitAccel, exitOp, glowOffK, GREY, HeaderBar, PacketIcon, PURPLE, softOp, WHITE,
} from '../../ui';
import {HeroGlow, BigNumber, countTo} from '../../fx';
import {LedgerGlyph, PhoneGlyph} from './g4ui';

/**
 * SC20 代价 · N 4408–4648（S32 4416–4626，¶ 段内段末：按组约定延到 SC21.from−1，不用 to+2 截短）
 * 三枚代价币横排：① 电话 + `dial first`；② 账本 + `keep state`（记录线逐条点亮，持续动作）；
 * ③ 主角卡（放大）：TCP 头部条（HeaderBar，ports2/seq/ack/flags/window，dim 灰格）骑在一枚大信封上 +
 * `≥ 20 bytes/letter`（`20` 14 帧计数 + 紫光点亮 + emphasisPulse）。三卡 1.03 微脉冲错峰一轮（对齐节拍 4）。
 * 零 glitch、零扫光。持续：账本记录线（4505–4617）/ HeroGlow 呼吸 / `20` 紫光呼吸。
 * 停留：卡③头部条 + 计数落位 4552 → 离场 4640（末 8 帧归零），≈88 帧 ✓（S32 末块 59）。
 * 偏离记录：分镜表「卡③ 1.15×（276 宽）」放不下五格 22px 标签的 HeaderBar → 卡③加宽为 560×284（Bar 520 宽）。
 */
const F0 = 4408, TO = 4648;
const B_C1 = 4410;     // 卡① slideIn（节拍 4416，−6 容差内提前入场）
const B_C2 = 4485;     // 卡② slideIn（节拍 2：remember everything）+ 账本记录线
const B_LEDGER = 4505; // 记录线逐条点亮（每条 14 帧 ×8）
const B_C3 = 4524;     // 卡③ 缩放入场（节拍 3：pay at least twenty bytes）
const B_WIPE = 4532;   // 头部条分格逐格 wipe（每格 4 帧 ×5 = 20）
const B_CNT = 4538;    // `20` 14 帧计数 → 4552 落位 + 紫光点亮
const B_ENV = 4548;    // 大信封 SoftIn（头部条骑在信封上 = every letter）
const B_PULSE = 4568;  // 三卡 1.03 微脉冲错峰（节拍 4：on every envelope）
const EXIT = TO - 8;   // 4640

const C1 = {x: 100, y: 255, w: 240, h: 200};
const C2 = {x: 370, y: 255, w: 240, h: 200};
const C3 = {x: 640, y: 228, w: 560, h: 284};
const BAR = {x: 660, y: 252, w: 520, h: 58};
const FIELDS: Array<{label: string; weight: number}> = [
  {label: 'ports', weight: 2}, {label: 'seq', weight: 1}, {label: 'ack', weight: 1},
  {label: 'flags', weight: 1}, {label: 'window', weight: 1},
];

export const SC20: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const op = exitOp(N, TO, 8);
  const dy = exitAccel(Math.max(0, N - EXIT), 0.45);
  const gk = glowOffK(N, TO);

  const c1n = N - B_C1, c2n = N - B_C2, c3n = N - B_C3;
  const c1Y = 70 * powOutRemain(c1n, 22, 2.5);
  const c2Y = 70 * powOutRemain(c2n, 22, 2.5);
  const c3S = c3n < 0 ? 0 : 0.75 + 0.25 * BEZ_SCALE_IN(clamp01(c3n / 21));

  const barP = clamp01((N - B_WIPE) / 20);
  const litK = softOp(N - (B_CNT + 14), 8); // 4552 起紫光点亮
  const ledLit = Math.max(0, (N - B_LEDGER) / 14); // 8 条记录线，最后一条 4617 点亮
  const cnt = countTo(N - B_CNT, 0, 20, 14);
  const pl = (i: number) => emphasisPulse(N - (B_PULSE + i * 6), {peak: 1.03, up: 8, hold: 2, down: 8});

  return (
    <div style={{position: 'absolute', inset: 0, opacity: op, transform: `translateY(${dy.toFixed(2)}px)`}}>
      {/* 卡③主角柔光 */}
      <HeroGlow x={C3.x - 14} y={C3.y - 14} w={C3.w + 28} h={C3.h + 28} r={18} N={N}
        k={(0.3 * softOp(c3n, 10) + 0.6 * litK) * gk} />

      {/* 卡③（主角）：TCP 头部条 + 大信封 + ≥ 20 bytes/letter */}
      {c3n >= 0 ? (
        <div style={{position: 'absolute', inset: 0, transform: `scale(${(c3S * pl(2)).toFixed(4)})`, transformOrigin: `${C3.x + C3.w / 2}px ${C3.y + C3.h / 2}px`}}>
          <Box x={C3.x} y={C3.y} w={C3.w} h={C3.h} r={10} sw={2.5} />
          <HeaderBar x={BAR.x} y={BAR.y} w={BAR.w} h={BAR.h} fields={FIELDS} labelSize={22} dim progress={barP} />
          {/* 信封（头部条正下方、同宽：每个信封都驮着这条头部） */}
          <div style={{position: 'absolute', inset: 0, opacity: softOp(N - B_ENV, 10)}}>
            <PacketIcon cx={920} cy={370} w={520} h={120} />
          </div>
          {/* ≥ 20 bytes/letter */}
          <CText cx={750} cy={474} size={44} weight={700} family={FONT_ORB} color={GREY} opacity={softOp(N - (B_CNT - 4), 8)} dy={0}>≥</CText>
          <div style={{position: 'absolute', inset: 0, transform: `scale(${emphasisPulse(N - (B_CNT + 14), {peak: 1.11, up: 12, hold: 4, down: 13}).toFixed(4)})`, transformOrigin: '845px 472px'}}>
            <BigNumber cx={845} cy={472} size={76} value={cnt} opacity={softOp(N - B_CNT, 6)} dy={0}
              shadow={`6px 6px 0 ${PURPLE}, 0 0 ${(10 + 26 * litK).toFixed(0)}px rgba(102,45,248,${(0.25 + 0.45 * litK).toFixed(2)})`} />
          </div>
          <CText cx={1025} cy={474} size={26} weight={600} family={FONT_MONO} color={GREY} opacity={softOp(N - (B_CNT + 6), 8)} dy={0}>bytes/letter</CText>
        </div>
      ) : null}

      {/* 卡①：电话 + dial first */}
      {c1n >= 0 ? (
        <div style={{position: 'absolute', inset: 0, opacity: softOp(c1n, 8), transform: `translateY(${c1Y.toFixed(2)}px) scale(${pl(0).toFixed(4)})`, transformOrigin: '220px 355px'}}>
          <Box x={C1.x} y={C1.y} w={C1.w} h={C1.h} r={10} sw={2.5} />
          <PhoneGlyph cx={220} cy={330} w={132} />
          <CText cx={220} cy={424} size={26} weight={600} family={FONT_MONO} color={WHITE} opacity={softOp(c1n - 22, 8)} dy={0}>dial first</CText>
        </div>
      ) : null}

      {/* 卡②：账本 + keep state（记录线逐条点亮，持续动作） */}
      {c2n >= 0 ? (
        <div style={{position: 'absolute', inset: 0, opacity: softOp(c2n, 8), transform: `translateY(${c2Y.toFixed(2)}px) scale(${pl(1).toFixed(4)})`, transformOrigin: '490px 355px'}}>
          <Box x={C2.x} y={C2.y} w={C2.w} h={C2.h} r={10} sw={2.5} />
          <LedgerGlyph cx={490} cy={328} w={110} lit={ledLit} opacity={softOp(c2n - 2, 8)} />
          <CText cx={490} cy={424} size={26} weight={600} family={FONT_MONO} color={WHITE} opacity={softOp(c2n - 22, 8)} dy={0}>keep state</CText>
        </div>
      ) : null}

      {/* 落位白环（紫光点亮瞬间，一圈淡出的强调环） */}
      {litK > 0 && litK < 1 ? (
        <svg width={1280} height={720} viewBox="0 0 1280 720" style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
          <circle cx={845} cy={472} r={40 + 60 * litK} fill="none" stroke={PURPLE} strokeWidth={3} opacity={(1 - litK) * 0.7 * gk} />
        </svg>
      ) : null}
    </div>
  );
};
