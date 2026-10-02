import React from 'react';
import {useCurrentFrame} from 'remotion';
import {clamp01, easeInOutPow, easeOutCubic, emphasisPulse, FONT_ORB} from '../../common';
import {BrowserMock, CText, CORAL, GREY, PURPLE, WHITE, firstOp, scaleIn, exitOp, SoftIn, abs} from '../../ui';
import {TechText} from '../../ui';
import {Svg} from '../../ui';
import {ServerLogCard, LOG} from './g1ui';

/**
 * SC03 缺口在线路上 · N 353–482（S03 361–460 ¶ 段末：361「Both readings are true」/ 404「The missing time」）
 * 承接（不清场）：SC01 的浏览器（同参数 BrowserMock，settled 态 = 载入条满 + 两根灰线）与 SC02 的日志卡（ServerLogCard 同参数，
 *   60 ms 静态橙、rack 继续闪）从原位 16 帧 easeInOutPow(2.5) 缩移到两侧（浏览器中心 (325,370)→(240,360) s1→.53；卡 (640,360)→(1000,360) s1→.53）。
 * 节拍：361 连线自两端 draw-on 向中间（20 帧停在缺口 610/670）；404 问号 scaleIn 21 帧 + emphasisPulse 1.11 + 断口红色小闪电闪一次（408 起 10 帧）；
 *       428 「the wire」灰字 SoftIn；432–482 整组 1→1.05 慢推（运镜，慢推贯穿例外；缩移后内容留 x89–1191 / y122–607）。
 * 停留：问号落位 425 → 离场 474，49 帧 ✓（段末 ¶）。末 8 帧归零。
 * 主角：问号 96px（Orbitron 白字紫描边+紫柔光）+ 断线组；零 glitch（白名单）。
 */
const F0 = 353;
const T_GROUPS = 353;
const T_WIRE = 361;
const T_Q = 404;
const T_BOLT = 408;
const T_LABEL = 428;
const T_PUSH = 432;
const TO = 482;
const BR = {x: 90, y: 180, w: 470, h: 380}; // 与 SC01 相同
const BR_END = {cx: 240, cy: 360, s: 0.53};
const LOG_END = {cx: 1000, cy: 360, s: 0.53};
/** 连线两段（自两端向中间 draw-on 后的落位）；缺口 610–670 中央是问号 */
const WIRE = {y: 360, l0: 380, l1: 610, r0: 825, r1: 670};
const GAPC = 640;
const tri = (n: number, len = 8) => (n <= 0 || n >= len ? 0 : n < len / 2 ? n / (len / 2) : 1 - (n - len / 2) / (len / 2));
/** BrowserMock settled 灰线（局部坐标，与 SC01 末态一致） */
const DIM_LINES = [
  {y: 296, w: 0.73 * (BR.w - 60)},
  {y: 350, w: 0.55 * (BR.w - 60)},
];

export const SC03: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const op = exitOp(N, TO, 8);
  // 承接位移：16 帧 easeInOutPow(2.5)
  const tt = easeInOutPow(2.5)(clamp01((N - T_GROUPS) / 16));
  const bcx0 = BR.x + BR.w / 2, bcy0 = BR.y + BR.h / 2;
  const bs = 1 + (BR_END.s - 1) * tt;
  const btx = bcx0 + (BR_END.cx - bcx0) * tt - bs * bcx0;
  const bty = bcy0 + (BR_END.cy - bcy0) * tt - bs * bcy0;
  const lc0x = LOG.x + LOG.w / 2, lc0y = LOG.y + LOG.h / 2;
  const ls = 1 + (LOG_END.s - 1) * tt;
  const ltx = lc0x + (LOG_END.cx - lc0x) * tt - ls * lc0x;
  const lty = lc0y + (LOG_END.cy - lc0y) * tt - ls * lc0y;
  // 连线自两端向中间
  const wp = easeOutCubic(clamp01((N - T_WIRE) / 20));
  const leftW = (WIRE.l1 - WIRE.l0) * wp;
  const rightW = (WIRE.r0 - WIRE.r1) * wp;
  // 问号：缩放入场 + 脉冲
  const qn = N - T_Q;
  const qs = scaleIn(qn, 21) * emphasisPulse(qn + 14, {peak: 1.11});
  // 慢推（运镜；1→1.05 贯穿例外）
  const camS = 1; // v2: 去掉慢推（3 帧采样下变化 >hold 阈值；本镜已有 draw-on/脉冲/闪电，动态足够）
  const bolt = tri(N - T_BOLT, 10);
  return (
    <div style={{position: 'absolute', inset: 0, opacity: op}}>
      <div style={{position: 'absolute', inset: 0, transform: `translate(640px,360px) scale(${camS.toFixed(4)}) translate(-640px,-360px)`}}>
        {/* 浏览器（承接 SC01，settled 态） */}
        <div style={{position: 'absolute', inset: 0, opacity: firstOp(N - T_GROUPS, 6), transform: `translate(${btx.toFixed(2)}px,${bty.toFixed(2)}px) scale(${bs.toFixed(4)})`, transformOrigin: '0 0'}}>
          <BrowserMock x={BR.x} y={BR.y} w={BR.w} h={BR.h} skeleton={6} progress={1} />
          <div style={{...abs(BR.x + 30, BR.y + 296, DIM_LINES[0].w, 6), background: '#3c3c3e', opacity: 0.95}} />
          <div style={{...abs(BR.x + 30, BR.y + 350, DIM_LINES[1].w, 6), background: '#3c3c3e', opacity: 0.95}} />
        </div>
        {/* 日志卡（承接 SC02，settled 态：60 ms 静态橙，rack 继续闪） */}
        <div style={{position: 'absolute', inset: 0, opacity: firstOp(N - (T_GROUPS + 2), 7), transform: `translate(${ltx.toFixed(2)}px,${lty.toFixed(2)}px) scale(${ls.toFixed(4)})`, transformOrigin: '0 0'}}>
          <div style={{...abs(LOG.x, LOG.y)}}>
            <ServerLogCard N={N} ms60Style={{color: CORAL}} />
          </div>
        </div>
        {/* 连线 + 断口闪电 */}
        {wp > 0 ? (
          <Svg bloom={false}>
            <rect x={WIRE.l0} y={WIRE.y - 1.5} width={leftW} height={3} fill={WHITE} style={{filter: 'drop-shadow(0 0 4px rgba(255,255,255,.6))'}} />
            <rect x={WIRE.r0 - rightW} y={WIRE.y - 1.5} width={rightW} height={3} fill={WHITE} style={{filter: 'drop-shadow(0 0 4px rgba(255,255,255,.6))'}} />
            {bolt > 0 ? (
              <g opacity={bolt} stroke={CORAL} strokeWidth={2.5} fill="none" strokeLinecap="round" style={{filter: 'drop-shadow(0 0 8px rgba(241,96,67,.8))'}}>
                <path d="M604,346 L610,358 L605,360 L611,374" />
                <path d="M676,346 L670,358 L675,360 L669,374" />
              </g>
            ) : null}
          </Svg>
        ) : null}
        {/* 问号（主角） */}
        {qn >= 0 ? (
          <CText
            cx={GAPC}
            cy={356}
            size={96}
            weight={700}
            family={FONT_ORB}
            color={WHITE}
            letterSpacing={2}
            style={{
              transform: `translate(-50%,-50%) scale(${qs.toFixed(4)})`,
              WebkitTextStroke: `3px ${PURPLE}`,
              paintOrder: 'stroke fill',
              textShadow: '0 0 24px rgba(161,117,241,.85), 0 0 8px rgba(161,117,241,.6)',
            }}
          >
            ?
          </CText>
        ) : null}
        {/* the wire */}
        <SoftIn N={N} f0={T_LABEL}>
          <TechText cx={GAPC} cy={437} text="the wire" fontSize={26} color={GREY} glow={false} letterSpacing={1.5} />
        </SoftIn>
      </div>
    </div>
  );
};
