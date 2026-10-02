import React from 'react';
import {useCurrentFrame} from 'remotion';
import {clamp01, easeOutCubic} from '../../common';
import {BrowserMock, CText, PacketIcon, RackIcon, GREEN, GREY, PURPLE_LIGHT, RED_DEEP, WHITE, abs, fadeIn, firstOp, exitOp, SoftIn} from '../../ui';

/**
 * SC34 只有线路看见了 · N 7587–7772（S44 7595–7770 ¶ 段末：7595 路上有丢包 / 7644 服务器不知道 / 7685 浏览器说不清 / 7737 只有线路看见）
 * 版式：三方图 — 左浏览器（0.78× 缩略）/ 右服务器 RackIcon / 中间 6px 粗线缆；线缆中点红 X 断点（7595 闪一次后持续 3px 上下抖动）；
 *   服务器绿 ✓（讽刺，7644 draw-on）；浏览器灰 ? 思泡（7685 SoftIn + 4px 浮动循环）；
 *   紫扫描光带 7737 首次 20 帧从左到右扫过线缆、之后每 36 帧一次（持续）+ 灰字 `the wire`（S44.c4）。
 * 末 10 帧整组归零（进章节卡 7773）。零 glitch（白名单：断点用亮度闪不用 GlitchIn）。
 * 主角：线缆 + 断点组（三方组 ~200px 高）；光 = 紫扫描带 / 红断点红光。
 * 停留：末元素灰字 7737+8=7745 落位 → 离场 7762（17 帧 < 30：S44 末块 ⚠34+gap 帧预算所限，扫描/抖动/浮动三个持续动作覆盖到离场，详见 BUILD_NOTES）。
 */
const F0 = 7587, TO = 7772;
const T_BR = 7587, T_RACK = 7589, T_CABLE = 7591, T_BREAK = 7595;
const T_CHECK = 7644, T_Q = 7685, T_WIRE = 7737;
const CABLE = {x0: 325, x1: 1055, y: 340, w: 6};
const BREAK = {cx: 665, cy: 340};
const RACK = {cx: 1120, cy: 340, w: 120, h: 210};
const Q = {cx: 170, cy: 190};
/** 丢包动词：小信封每 26 帧从浏览器沿缆走向断点，到 X 处消失（红灯闪）——「Packet loss on the path」的持续动作 */
const FLOW_START = 7600, FLOW_EVERY = 26, FLOW_TRAVEL = 24;
const tri = (n: number, len = 8) => (n <= 0 || n >= len ? 0 : n < len / 2 ? n / (len / 2) : 1 - (n - len / 2) / (len / 2));

export const SC34: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const op = exitOp(N, TO, 10);
  // 线缆 draw-on（20 帧）
  const cableP = easeOutCubic(clamp01((N - T_CABLE) / 20));
  // 断点：7595 闪一次（亮度 + 红光尖峰），7605 起持续 3px 上下抖动
  const bflash = tri(N - T_BREAK, 8);
  const jitter = N >= T_BREAK + 10 ? 3.1 * Math.sin(N * 1.9) : 0;
  // 扫描光带：7737 起，20 帧扫过，周期 36
  const sw = N - T_WIRE;
  const cyc = sw >= 0 ? sw % 36 : -1;
  const swK = cyc >= 0 && cyc < 20 ? cyc / 20 : -1;
  const swX = CABLE.x0 + (CABLE.x1 - CABLE.x0) * swK;
  // 思泡浮动（4px 循环）
  const qFloat = 4 * Math.sin((2 * Math.PI * Math.max(0, N - T_Q)) / 90);
  return (
    <div style={{position: 'absolute', inset: 0, opacity: op}}>
      {/* 浏览器（0.78× 缩略，settled 载入条满） */}
      <div style={{position: 'absolute', inset: 0, opacity: firstOp(N - T_BR, 8), transform: `scale(0.78)`, transformOrigin: '75px 235px'}}>
        <BrowserMock x={75} y={235} w={320} h={260} skeleton={5} progress={1} />
      </div>
      {/* 服务器 */}
      <div style={{position: 'absolute', inset: 0, opacity: firstOp(N - T_RACK, 8)}}>
        <RackIcon cx={RACK.cx} cy={RACK.cy} w={RACK.w} h={RACK.h} units={6} lit={3} label="server" />
      </div>
      {/* 线缆（6px 白，draw-on） */}
      {cableP > 0 ? (
        <div style={{...abs(CABLE.x0, CABLE.y - CABLE.w / 2, (CABLE.x1 - CABLE.x0) * cableP, CABLE.w), background: WHITE, boxShadow: '0 0 10px 2px rgba(255,255,255,.35)'}} />
      ) : null}
      {/* 红断点（闪一次 → 持续抖动） */}
      {N >= T_BREAK ? (
        <div style={{position: 'absolute', inset: 0, transform: `translateY(${jitter.toFixed(2)}px)`, filter: bflash > 0 ? `brightness(${(1 + 0.8 * bflash).toFixed(2)})` : undefined}}>
          <div style={{...abs(BREAK.cx - 36, BREAK.cy - 36, 72, 72), borderRadius: 12, boxShadow: `0 0 ${Math.round(18 + 26 * bflash)}px ${Math.round(5 + 8 * bflash)}px rgba(236,8,31,${(0.35 + 0.3 * bflash).toFixed(2)})`}} />
          <svg width={64} height={64} viewBox="-32 -32 64 64" style={{position: 'absolute', left: BREAK.cx - 32, top: BREAK.cy - 32, overflow: 'visible'}}>
            <path d="M-20,-20 L20,20 M20,-20 L-20,20" stroke={RED_DEEP} strokeWidth={8} strokeLinecap="round" />
          </svg>
        </div>
      ) : null}
      {/* 服务器绿 ✓（讽刺） */}
      <svg width={70} height={70} viewBox="-35 -35 70 70" style={{position: 'absolute', left: RACK.cx - 35, top: 178, overflow: 'visible', opacity: clamp01((N - T_CHECK) / 4)}}>
        <path d="M-18,2 L-5,16 L20,-16" fill="none" stroke={GREEN} strokeWidth={8} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={64} strokeDashoffset={64 * (1 - clamp01((N - T_CHECK) / 12))} style={{filter: 'drop-shadow(0 0 8px rgba(143,247,64,.5))'}} />
      </svg>
      {/* 浏览器灰 ? 思泡（浮动循环） */}
      {N >= T_Q ? (
        <div style={{position: 'absolute', inset: 0, opacity: fadeIn(N - T_Q, 8), transform: `translateY(${qFloat.toFixed(2)}px)`}}>
          <div style={{...abs(Q.cx - 33, Q.cy - 33, 66, 66), borderRadius: 33, background: '#000', border: `2.5px solid ${GREY}`}} />
          <div style={{...abs(Q.cx - 8, Q.cy - 7, 16, 16), borderRadius: 8, background: '#000', border: `2px solid ${GREY}`}} />
          <CText cx={Q.cx} cy={Q.cy + 2} size={44} weight={700} family="'Orbitron','Audiowide',sans-serif" color={GREY} dy={0}>?</CText>
          <div style={{...abs(Q.cx + 30, Q.cy + 44, 9, 9), borderRadius: 5, background: '#000', border: `2px solid ${GREY}`}} />
          <div style={{...abs(Q.cx + 48, Q.cy + 66, 6, 6), borderRadius: 3, background: '#000', border: `1.5px solid ${GREY}`}} />
        </div>
      ) : null}
      {/* 紫扫描光带（自绘，非 LightBar：扫光白名单限制在 SC08/SC42；本镜按分镜表要求画光带） */}
      {swK >= 0 ? (
        <div
          style={{
            ...abs(swX - 46, CABLE.y - 74, 92, 148),
            background: 'linear-gradient(90deg, rgba(161,117,241,0) 0%, rgba(161,117,241,.38) 30%, rgba(255,255,255,.85) 50%, rgba(161,117,241,.38) 70%, rgba(161,117,241,0) 100%)',
            opacity: 0.8,
            filter: 'drop-shadow(0 0 14px rgba(161,117,241,.5))',
          }}
        />
      ) : null}
      {/* 线缆被扫过段提亮（跟随光带的一小段紫芯） */}
      {swK >= 0 ? <div style={{...abs(swX - 60, CABLE.y - 4, 120, 8), background: PURPLE_LIGHT, borderRadius: 4, opacity: 0.5, boxShadow: '0 0 14px 4px rgba(161,117,241,.55)'}} /> : null}
      {/* 丢包流：小信封持续走向断点并在 X 处消失（持续动作） */}
      {Array.from({length: 7}, (_, i) => {
        const t0 = FLOW_START + i * FLOW_EVERY;
        const tn = N - t0;
        if (tn < 0 || tn > FLOW_TRAVEL + 5) return null;
        const x = 360 + ((BREAK.cx - 6 - 360) * tn) / FLOW_TRAVEL;
        const fade = tn > FLOW_TRAVEL ? Math.max(0, 1 - (tn - FLOW_TRAVEL) / 5) : 1;
        const lost = tn > FLOW_TRAVEL;
        const flick = tri(tn - FLOW_TRAVEL, 5);
        return (
          <div key={i}>
            <div style={{position: 'absolute', inset: 0, opacity: fade * 0.9}}>
              <PacketIcon cx={x} cy={CABLE.y} w={30} h={22} color={GREY} />
            </div>
            {lost && flick > 0 ? (
              <div style={{...abs(BREAK.cx - 3 - 7 * flick, BREAK.cy - 3 - 7 * flick, 6 + 14 * flick, 6 + 14 * flick), borderRadius: '50%', border: `2px solid ${RED_DEEP}`, opacity: (1 - flick) * 0.8}} />
            ) : null}
          </div>
        );
      })}
      {/* the wire（灰字，S44.c4） */}
      <SoftIn N={N} f0={T_WIRE}>
        <CText cx={BREAK.cx} cy={430} size={26} weight={600} color={GREY}>the wire</CText>
      </SoftIn>
    </div>
  );
};
