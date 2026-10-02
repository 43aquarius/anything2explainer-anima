import React from 'react';
import {useCurrentFrame} from 'remotion';
import {clamp01, BEZ_SCALE_IN, emphasisPulse, FONT_MONO} from '../../common';
import {
  Box, Pill, CText, Check, Svg, SoftIn, abs, softOp, firstOp, exitOp, glowOffK, exitAccel,
  WHITE, GREY_MID, ORANGE, PURPLE, GREEN, BLOOM, BLOOM_SOFT,
} from '../../ui';
import {HeroGlow} from '../../fx';

/**
 * SC25 诚实的规范 · N 5731–6027（S40 5739–5830 / S41 5841–5917 ¶ / S42 5963–6025 ¶+gap15，章内段末非章末）
 * 居中 RFC 引文卡（分镜表 x300–980 微调为 x285–995：两行等宽 28px 引文 + 省略号缺口实测需要，见 BUILD_NOTES）
 * + 顶部 Pill `RFC 768`（紫填充白边，骑卡顶边）+ 两行打字机引文：`delivery ⌇ not guaranteed.` /
 * `duplicate protection ⌇ not guaranteed.`（省略号处光标 4 帧跳过缺口 = 原文截取；`not guaranteed` 橙色，
 * 短语落下各一次橙光脉冲 + 常驻低强度橙光）+ 卡下大字 `and still, the internet runs on it`
 * （Noto 900 44px 白+紫描边，缩放入场 21 帧 + emphasisPulse + 紫描边发光 30 帧呼吸）
 * + 卡右上角诚实徽章（白圈 draw-on 12 帧 + 绿 Check draw-on 8 帧）+ 打字光标 8 帧周期持续闪烁（持续动作）。
 * 节拍：5739 卡 slideUp（5732 前挂，容器先于关键词，SC23 先例）/ 5775 行1 / 5841 行2 / 5959 大字（5963 −4 前挂）。
 * 零 glitch、零扫光（本组白名单只有 SC22 `POSTCARD` / SC24 `8 bytes`）；无运镜（Ch3 运镜清单：SC22/23/24/27）。
 * 停留：大字落位 5959+21=5980 → 离场 6019（末 8 帧归零），39 帧 ✓（S42 末块 63+gap15）。
 * 其后 6028–6047 为 C3 段末呼吸空白，归幕底/覆盖层管；G6 自 SC26=6048 起。
 */
const F0 = 5731;
const TO = 6047; // 成片 v4：对齐注册区间末端（原 6027；区间已扩到 6047）
const T_CARD = 5732;  // 引文卡 slideUp Δ90 / 21 帧 → 落位 5753
const T_PILL = 5742;  // `RFC 768` Pill SoftIn
const T_Q1 = 5775;    // S40 块2：第一行打字机
const T_P1 = 5827;    // 第一处 `not guaranteed` 落下 → 橙光脉冲 1
const T_Q2 = 5841;    // S41：第二行打字机
const T_P2 = 5917;    // 第二处橙光脉冲 2
const T_BADGE = 5932; // 诚实徽章：圈 draw-on 12 帧，Check 5940–5948
const T_BIG = 5957;   // S42（5963 −6 前挂，节拍容差内）：大字缩放入场 16 帧 → 落位 5973
const EXIT = TO - 8;  // 6039（离场 8 帧）

const CARD = {x: 285, y: 210, w: 710, h: 300}; // 引文卡（cx 640）
const CH = 16.86;   // 28px 等宽步进（DejaVu Sans Mono 0.6023em，SC22 地址行实测）
const SKIP_W = 34;  // 省略号缺口宽（≈2ch）
const SKIP_D = 4;  // 光标跳过缺口的帧数
const BADGE = {cx: 945, cy: 258, r: 26}; // 卡右上角诚实徽章
const BIG = {cx: 640, cy: 560};         // 卡下大字

const LINES = [
  {pre: 'delivery ', phr: 'not guaranteed.', cy: 345, t0: T_Q1, tp: T_P1},
  {pre: 'duplicate protection ', phr: 'not guaranteed.', cy: 407, t0: T_Q2, tp: T_P2},
];
/** 整行（前缀 + 缺口 + 短语）在卡内居中的起点 x */
const startX = (L: {pre: string; phr: string}) => 640 - ((L.pre.length + L.phr.length) * CH + SKIP_W) / 2;

/** 打字机状态：前缀每字 2 帧 → 缺口 4 帧（光标滑过）→ 短语每字 2 帧 */
const typeAt = (N: number, t0: number, preLen: number, phrLen: number) => {
  const t = N - t0;
  if (t < 0) return {pre: 0, skip: 0, phr: 0};
  const a = preLen * 2;
  if (t < a) return {pre: Math.floor(t / 2), skip: 0, phr: 0};
  if (t < a + SKIP_D) return {pre: preLen, skip: (t - a) / SKIP_D, phr: 0};
  const u = t - a - SKIP_D;
  return {pre: preLen, skip: 1, phr: Math.min(phrLen, Math.floor(u / 2))};
};

export const SC25: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const exOp = exitOp(N, TO, 4); // 成片 v2：4 帧离场
  const exDy = exitAccel(Math.max(0, N - EXIT), 0.28);
  const gk = glowOffK(N, TO, 2, 4);

  // —— 引文卡入场（slideUp Δ90 / 21 帧，首帧可见）——
  const cn = N - T_CARD;
  const cardOp = firstOp(cn, 8);
  const cardY = 90 * Math.pow(1 - clamp01(cn / 21), 2.5);

  // —— 大字（缩放入场 + emphasisPulse + 紫描边发光 30 帧呼吸）——
  const bn = N - T_BIG;
  const bigS = bn < 0 ? 0 : 0.72 + 0.28 * BEZ_SCALE_IN(clamp01(bn / 16));   // 成片 v2：16 帧入场
  const bigOp = firstOp(bn, 8);
  const bigPulse = emphasisPulse(bn - 16, {peak: 1.09, up: 9, hold: 2, down: 8});  // v2：18 帧脉冲
  const bigBreathe = 0.8 + 0.2 * Math.sin((2 * Math.PI * Math.max(0, bn)) / 30);

  // —— 打字光标（当前活动行；8 帧周期闪烁；跳缺口时滑动）——
  const curLine = N < T_Q2 ? LINES[0] : LINES[1];
  const cst = typeAt(N, curLine.t0, curLine.pre.length, curLine.phr.length);
  const cursorOn = N >= T_Q1 - 2 && Math.floor(N / 8) % 2 === 0;
  const csx = startX(curLine);
  const curX = cst.skip <= 0 ? csx + cst.pre * CH
    : cst.skip < 1 ? csx + curLine.pre.length * CH + cst.skip * SKIP_W
    : cst.phr < curLine.phr.length ? csx + curLine.pre.length * CH + SKIP_W + cst.phr * CH
    : csx + (curLine.pre.length + curLine.phr.length) * CH + SKIP_W;

  // —— 诚实徽章（圈 draw-on + Check draw-on）——
  const bgn = N - T_BADGE;
  const badgeP = clamp01(bgn / 12);
  const checkP = clamp01((bgn - 8) / 8);

  return (
    <div style={{position: 'absolute', inset: 0, opacity: exOp, transform: exDy ? `translateY(${exDy.toFixed(1)}px)` : undefined}}>
      {/* 卡组（卡 + Pill + 引文 + 光标 + 徽章）：slideUp 入场，落位后静止 */}
      <div style={{position: 'absolute', inset: 0, opacity: cardOp, transform: cardY > 0.1 ? `translateY(${cardY.toFixed(1)}px)` : undefined}}>
        {/* 主角柔光（紫，30 帧呼吸；离场前先灭） */}
        <HeroGlow x={CARD.x} y={CARD.y} w={CARD.w} h={CARD.h} r={14} N={N} k={softOp(cn - 6, 10) * gk} />

        {/* 引文卡本体（白边 3px + BLOOM） */}
        <div style={{...abs(CARD.x, CARD.y, CARD.w, CARD.h), filter: BLOOM}}>
          <Box x={0} y={0} w={CARD.w} h={CARD.h} r={14} sw={3} fill="#000" />
        </div>

        {/* 顶部 Pill `RFC 768`（骑卡顶边） */}
        <SoftIn N={N} f0={T_PILL}>
          <Pill x={556} y={189} w={168} h={42} r={21} fill={PURPLE} stroke={WHITE} sw={2}
            text="RFC 768" fontSize={24} weight={700} family={FONT_MONO} color={WHITE} textDy={0} letterSpacing={1} />
        </SoftIn>

        {/* 两行引文（打字机 + 省略号缺口 + 橙色短语） */}
        {LINES.map((L, i) => {
          if (N < L.t0) return null;
          const st = typeAt(N, L.t0, L.pre.length, L.phr.length);
          const sx = startX(L);
          const phrX = sx + L.pre.length * CH + SKIP_W;
          const spike = N < L.tp ? 0 : Math.max(0, 1 - (N - L.tp) / 16); // 落下橙光脉冲（16 帧回落）
          const pulse = emphasisPulse(N - L.tp, {peak: 1.05, up: 8, hold: 2, down: 8});
          return (
            <React.Fragment key={i}>
              {/* 前缀（白，逐字） */}
              <div style={{...abs(sx, L.cy - 14), fontFamily: FONT_MONO, fontSize: 28, lineHeight: '28px', color: WHITE, whiteSpace: 'pre', opacity: 0.92}}>
                {L.pre.slice(0, st.pre)}
              </div>
              {/* 省略号缺口（4 灰点，光标跳过时显现 = 原文截取） */}
              {st.skip > 0 ? [0, 1, 2, 3].map((k) => (
                <div key={k} style={{...abs(sx + L.pre.length * CH + 5 + k * 8.5 - 2.2, L.cy + 2), width: 4.4, height: 4.4, borderRadius: '50%', background: GREY_MID, opacity: st.skip * 0.85}} />
              )) : null}
              {/* 短语（橙，逐字 + 落下时橙光脉冲 → 常驻低强度橙光） */}
              <div style={{position: 'absolute', inset: 0, transform: pulse !== 1 ? `scale(${pulse.toFixed(4)})` : undefined, transformOrigin: `${phrX + (L.phr.length * CH) / 2}px ${L.cy}px`}}>
                <div style={{...abs(phrX, L.cy - 14), fontFamily: FONT_MONO, fontSize: 28, lineHeight: '28px', color: ORANGE, whiteSpace: 'pre',
                  textShadow: `0 0 ${(5 + 13 * spike).toFixed(0)}px rgba(240,95,65,${((0.32 + 0.5 * spike) * gk).toFixed(2)})`}}>
                  {L.phr.slice(0, st.phr)}
                </div>
              </div>
            </React.Fragment>
          );
        })}

        {/* 打字光标（持续闪烁，持续动作） */}
        {cursorOn ? <div style={{...abs(curX, curLine.cy - 17, 15, 32), background: WHITE, opacity: 0.9}} /> : null}

        {/* 诚实徽章（白圈 draw-on 12 帧 + 绿 Check draw-on 8 帧） */}
        {bgn >= 0 ? (
          <Svg bloom={false} style={{filter: BLOOM_SOFT}}>
            <circle cx={BADGE.cx} cy={BADGE.cy} r={BADGE.r} fill="none" stroke={WHITE} strokeWidth={2.5}
              pathLength={100} strokeDasharray="100" strokeDashoffset={100 * (1 - badgeP)} />
            <Check cx={BADGE.cx} cy={BADGE.cy} size={34} color={GREEN} sw={6} p={checkP} />
          </Svg>
        ) : null}
      </div>

      {/* 卡下大字（S42：缩放入场 + emphasisPulse + 紫描边发光） */}
      {bn >= 0 ? (
        <div style={{position: 'absolute', inset: 0, opacity: bigOp, transform: `scale(${(bigS * bigPulse).toFixed(4)})`, transformOrigin: `${BIG.cx}px ${BIG.cy}px`}}>
          <CText cx={BIG.cx} cy={BIG.cy} size={44} weight={900} color={WHITE} letterSpacing={0.5} dy={0}
            style={{WebkitTextStroke: `2.5px ${PURPLE}`, paintOrder: 'stroke fill',
              textShadow: `0 0 ${(14 + 12 * bigBreathe).toFixed(0)}px rgba(102,45,248,${(0.55 * bigBreathe * gk).toFixed(2)})`}}>
            and still, the internet runs on it
          </CText>
        </div>
      ) : null}
    </div>
  );
};
