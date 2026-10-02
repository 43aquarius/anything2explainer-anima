import React from 'react';
import {useCurrentFrame} from 'remotion';
import {clamp01, easeInOutPow, easeOutCubic, emphasisPulse, FONT_ORB, glitchOpacity} from '../../common';
import {BrowserMock, CORAL, CText, GREY, ORANGE, PURPLE, WHITE, abs, fadeIn, slideUp, exitOp, glowOffK, SoftIn, Svg, scaleIn} from '../../ui';
import {TechText} from '../../ui';
import {ServerLogCard, LOG} from './g1ui';

/**
 * SC02 都是真的 · N 146–326（S02 154–212 + S03 223–304 ¶ 段末）
 * 竖向三段：浏览器缩 0.45× 上移至 (360,330)；中间断口粗线 (y470) + 大问号 (360,470) + `the wire` 灰字；
 *   下方 ServerLogCard (110,680,500,240)。
 * 节拍：146 承接 SC01 浏览器（16 帧 easeInOutPow 2.5 缩移，同参数同 settled 态，交界帧无缝）；
 *   154 日志卡 slideUp Δ60/22 + 8 帧淡入（Δ 从分镜 100 收窄：卡底峰值 980，不穿字幕带 y1002）；
 *   行 wipe 156+3i；180 `60 ms` glitch 12 帧模板（本镜唯一 glitch，白名单 SC02 `60 ms`；行内 span 用 glitchOpacity）
 *   + 橙光 8 帧亮起 + 1.15 落定脉冲；rack 指示灯 3→4→5 每 9 帧循环（持续动作）；
 *   223 Both are true → 浏览器+日志卡同步白闪 6 帧（事件闪，非呼吸）；同时起全镜 1.0→1.04 慢推（223–270，运镜在末拍落位前结束）；
 *   253 断线自两端 draw-on 向断口（20 帧）+ 261 断口红闪电闪一次（10 帧）+ 大问号 96px 紫描边缩放入（253+21=274 落位）+ 落定脉冲；
 *   282 `the wire` 灰字 SoftIn；312 起灭光、318–326 归零淡出。
 * 停留：¶ 段末，问号落位 274 → 离场 318，44 帧 ✓（标签 282+8=290 落位，小标签小面积变化不计入 hold 中断）。
 * 主角：问号 96px + 断线组；光 = 问号紫描边+紫柔光、`60 ms` 橙。
 */
const F0 = 146;
const T_CARRY = 146;
const T_LOG = 154;
const T_MS60 = 180;
const T_BOTH = 223;
const T_WIRE = 253;
const T_BOLT = 261;
const T_Q = 253;
const T_LABEL = 282;
const T_PUSH = [223, 270];
const TO = 326;
const BR = {x: 100, y: 260, w: 520, h: 380}; // 与 SC01 相同
const BR_END = {cx: 360, cy: 330, s: 0.45};
/** 连线两段（自两端向中间 draw-on；断口 325–395 中央是问号） */
const WIRE = {y: 470, l0: 200, l1: 325, r0: 520, r1: 395};
const GAPC = 360;
const tri = (n: number, len = 8) => (n <= 0 || n >= len ? 0 : n < len / 2 ? n / (len / 2) : 1 - (n - len / 2) / (len / 2));
/** BrowserMock settled 灰线（局部坐标，与 SC01 末态一致） */
const DIM_LINES = [
  {y: 296, w: 0.73 * (BR.w - 60)},
  {y: 350, w: 0.55 * (BR.w - 60)},
];

export const SC02: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const op = exitOp(N, TO, 8);
  const bothFlash = tri(N - T_BOTH, 6);
  // 承接位移：16 帧 easeInOutPow(2.5)（浏览器中心 (360,450) → (360,330) s1→0.45）
  const tt = easeInOutPow(2.5)(clamp01((N - T_CARRY) / 16));
  const bcx0 = BR.x + BR.w / 2, bcy0 = BR.y + BR.h / 2;
  const bs = 1 + (BR_END.s - 1) * tt;
  const btx = bcx0 + (BR_END.cx - bcx0) * tt - bs * bcx0;
  const bty = bcy0 + (BR_END.cy - bcy0) * tt - bs * bcy0;
  // 日志卡 slideUp Δ60（卡底峰值 980 不穿字幕带）
  const cn = N - T_LOG;
  // `60 ms` 样式：glitch 12 帧模板（白名单）+ 橙光 8 帧亮起 + 落定脉冲（194 起）
  const gn = N - T_MS60;
  const gOp = glitchOpacity(gn);
  const gk = clamp01((gn - 12) / 8);
  const glowOff = glowOffK(N, TO, 6, 8);
  const gpulse = emphasisPulse(gn - 14, {peak: 1.15, up: 8, hold: 3, down: 9});
  const ms60Style: React.CSSProperties = {
    color: ORANGE,
    opacity: gOp,
    transform: gpulse === 1 ? undefined : `scale(${gpulse.toFixed(3)})`,
    textShadow: `0 0 ${Math.round((10 + 18 * gk) * glowOff)}px rgba(243,95,69,${((0.35 + 0.4 * gk) * glowOff).toFixed(2)}), 0 0 40px rgba(243,95,69,${(0.2 * gk * glowOff).toFixed(2)})`,
  };
  // 断线自两端向中间（20 帧）
  const wp = easeOutCubic(clamp01((N - T_WIRE) / 20));
  const leftW = (WIRE.l1 - WIRE.l0) * wp;
  const rightW = (WIRE.r0 - WIRE.r1) * wp;
  const bolt = tri(N - T_BOLT, 10);
  // 问号：缩放入场 + 落位脉冲；光随离场先灭
  const qn = N - T_Q;
  const qs = scaleIn(qn, 21) * emphasisPulse(qn - 24, {peak: 1.11});
  const qGlow = glowOff;
  // 慢推（本镜唯一运镜；223–270，末拍问号 274 落位前结束）
  const camS = 1 + 0.04 * easeInOutPow(2.5)(clamp01((N - T_PUSH[0]) / (T_PUSH[1] - T_PUSH[0])));
  return (
    <div style={{position: 'absolute', inset: 0, opacity: op}}>
      <div style={{position: 'absolute', inset: 0, transform: `translate(360px,640px) scale(${camS.toFixed(4)}) translate(-360px,-640px)`}}>
        {/* 浏览器（承接 SC01，settled 态：载入条满 + 两根灰线） */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            opacity: 1,
            filter: bothFlash > 0 ? `brightness(${(1 + 0.35 * bothFlash).toFixed(2)})` : undefined,
            transform: `translate(${btx.toFixed(2)}px,${bty.toFixed(2)}px) scale(${bs.toFixed(4)})`,
            transformOrigin: '0 0',
          }}
        >
          <BrowserMock x={BR.x} y={BR.y} w={BR.w} h={BR.h} skeleton={6} progress={1} />
          <div style={{...abs(BR.x + 30, BR.y + 296, DIM_LINES[0].w, 6), background: '#3c3c3e', opacity: 0.95}} />
          <div style={{...abs(BR.x + 30, BR.y + 350, DIM_LINES[1].w, 6), background: '#3c3c3e', opacity: 0.95}} />
        </div>
        {/* 日志卡（g1ui.ServerLogCard：行 wipe + 60ms 注入 + rack 闪） */}
        <div
          style={{
            ...abs(LOG.x, LOG.y + slideUp(cn, 60, 22)),
            opacity: cn < 0 ? 0 : fadeIn(cn, 8),
            filter: bothFlash > 0 ? `brightness(${(1 + 0.35 * bothFlash).toFixed(2)})` : undefined,
          }}
        >
          <ServerLogCard N={N} ms60Style={ms60Style} />
        </div>
        {/* 断线 + 断口闪电 */}
        {wp > 0 ? (
          <Svg bloom={false}>
            <rect x={WIRE.l0} y={WIRE.y - 1.5} width={leftW} height={3} fill={WHITE} style={{filter: 'drop-shadow(0 0 4px rgba(255,255,255,.6))'}} />
            <rect x={WIRE.r0 - rightW} y={WIRE.y - 1.5} width={rightW} height={3} fill={WHITE} style={{filter: 'drop-shadow(0 0 4px rgba(255,255,255,.6))'}} />
            {bolt > 0 ? (
              <g opacity={bolt} stroke={CORAL} strokeWidth={2.5} fill="none" strokeLinecap="round" style={{filter: 'drop-shadow(0 0 8px rgba(241,96,67,.8))'}}>
                <path d="M318,456 L325,468 L319,470 L326,484" />
                <path d="M402,456 L395,468 L401,470 L394,484" />
              </g>
            ) : null}
          </Svg>
        ) : null}
        {/* 问号（主角） */}
        {qn >= 0 ? (
          <CText
            cx={GAPC}
            cy={470}
            size={96}
            weight={700}
            family={FONT_ORB}
            color={WHITE}
            letterSpacing={2}
            style={{
              transform: `translate(-50%,-50%) scale(${qs.toFixed(4)})`,
              WebkitTextStroke: `3px ${PURPLE}`,
              paintOrder: 'stroke fill',
              textShadow: `0 0 ${Math.round(24 * qGlow)}px rgba(161,117,241,${(0.85 * qGlow).toFixed(2)}), 0 0 ${Math.round(8 * qGlow)}px rgba(161,117,241,${(0.6 * qGlow).toFixed(2)})`,
            }}
          >
            ?
          </CText>
        ) : null}
        {/* the wire */}
        <SoftIn N={N} f0={T_LABEL}>
          <TechText cx={GAPC} cy={545} text="the wire" fontSize={26} color={GREY} glow={false} letterSpacing={1.5} />
        </SoftIn>
      </div>
    </div>
  );
};
