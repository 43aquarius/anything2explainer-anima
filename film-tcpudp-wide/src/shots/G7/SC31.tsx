import React from 'react';
import {useCurrentFrame} from 'remotion';
import {clamp01, rnd, FONT_MONO} from '../../common';
import {
  CText, Pill, abs, softOp, exitOp, glowOffK, exitAccel,
  WHITE, GREY, GREY_MID, GREY_LIGHT, PURPLE_LIGHT, ORANGE,
} from '../../ui';
import {FlagMark, PortRailX} from './g7ui';
import {countTo} from '../../fx';

/**
 * SC31 端口 · N 7840–8370（S57 7848 + S58 8092 + S59 8205–8348 ¶，扩展到 SC32.from−1=8370）
 * 节拍：7848 两轨 wipe 展开（上下 2 帧错峰）｜7940 `16-bit` 灰章 SoftIn
 *       ｜7984 左端 `0` SoftIn + 右端 `65,535` 16 帧计数落位（对齐「zero to sixty-five…」）
 *       ｜8092 上轨紫光扫一遍（12 帧）｜8139 下轨橙光扫一遍 + 隔离虚线 draw-on + `separate spaces`
 *       ｜8205 紫旗 `443` stampIn（旗杆白闪）｜8287 橙旗 `53` stampIn + 紫边旗 `443 · QUIC` SoftIn。
 * 版式：两条平行端口数轴（PortRail，x180–1100）：上轨 `TCP ports`（y302，紫）、下轨 `UDP ports`（y446，橙）；
 *       端点数字 0 / 65,535（自绘以控入场：左端 SoftIn、右端计数）；轨间隔离虚线（y374）+ `separate spaces` 灰章；
 *       443 旗（TCP 轨上方）+ 53 旗（UDP 轨上方左）+ `443 · QUIC` 紫边旗（UDP 轨上方右端）。
 * 持续（成片 v1 修复 tcpudp-wide-fix-C）：①tick 轮亮改为同时亮相邻 2 格且更亮（PortRailX：亮格 28px ≈1.4× / 宽 3.5px / 2px 同色光晕）
 *       ②端口光点 14→22 枚、亮灭周期缩短一半（22–46 帧）且沿轨缓移（rnd 固定种子定速 0.7–1.3px/帧，端口活跃感）
 *       ③443 / 53 旗面 30 帧摆动（skewX ±3°，绕旗盒底边，旗杆不动）。
 * 停留：末旗（53/QUIC）落位 8303 → 离场 8362（末 8 帧归零），≥30 ✓（S59 末块 62）。
 * 零 glitch；零扫光；无运镜（分镜表运镜清单：SC31 无，双轨稳定）。
 * 主角：双轨端口图 y200–498（298px）；光 = 旗光 TCP 紫 / UDP 橙 + 轨色扫光。
 */
const F0 = 7840;
const TO = 8370;
const T_RAIL = 7848;    // 两轨 wipe（18 帧，UDP +2 帧）
const T_16BIT = 7940;   // S57 块2：sixteen-bit numbers
const T_ZERO = 7984;    // S57 块3：zero to sixty-five…
const T_SWEEP_T = 8092; // S58 块1：TCP 空间
const T_SWEEP_U = 8139; // S58 块2：UDP 空间 + 隔离虚线
const T_443 = 8205;     // S59 块1：443 speaks TCP
const T_53 = 8287;      // S59 块2：53 speaks UDP + 443 · QUIC
const EXIT = TO - 8;    // 8362

const RAIL = {x: 180, w: 920, tcpY: 302, udpY: 446};
const LINE_Y = 374; // 隔离虚线

/** 端口光点（rnd 固定种子，成片 v1 修复）：22 枚，亮灭周期缩短一半（22–46 帧），另沿轨缓移（v 0.7–1.3px/帧，局部坐标） */
const DOTS = Array.from({length: 22}, (_, i) => ({
  x0: 20 + rnd(31, i) * 860,
  phase: rnd(32, i) * 977,
  period: 22 + Math.floor(rnd(33, i) * 25),
  v: 0.7 + rnd(37, i) * 0.6,
}));

const dotOp = (i: number, N: number) => {
  const d = DOTS[i];
  const local = (((N + d.phase) % d.period) + d.period) % d.period;
  if (local < 12) {
    return local < 3 ? local / 3 : local > 9 ? (12 - local) / 3 : 1;
  }
  return 0.14;
};
/** 光点沿轨位置（自 T_RAIL 起以 v 缓移，在 [20,880] 内回绕） */
const dotX = (i: number, n: number) => {
  const d = DOTS[i];
  return 20 + ((((d.x0 - 20 + d.v * Math.max(0, n)) % 860) + 860) % 860);
};
/** 两端 26px 淡入淡出（回绕不突兀） */
const dotFade = (x: number) => clamp01((x - 20) / 26) * clamp01((880 - x) / 26);

export const SC31: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const exOp = exitOp(N, TO, 8);
  const exDy = exitAccel(Math.max(0, N - EXIT), 0.2);
  const gk = glowOffK(N, TO);

  // —— 轨 wipe 展开（clipPath 自右向左收 → 内容自左 reveal）——
  const wipe = (t: number) => 1 - clamp01((N - t) / 18);

  // —— 端点数字 ——
  const zeroOp = softOp(N - T_ZERO, 8);
  const nn = N - T_ZERO;
  const endR = nn < 0 ? '' : nn < 16 ? countTo(nn, 0, 65535, 16) : '65,535';

  // —— 扫光（轨色 12 帧自左扫满后保持为「空间」色底）——
  const sweepT = clamp01((N - T_SWEEP_T) / 12);
  const sweepU = clamp01((N - T_SWEEP_U) / 12);

  // —— 隔离虚线 draw-on（16 帧）——
  const sepP = clamp01((N - (T_SWEEP_U + 2)) / 16);

  // —— 旗 stampIn（1.4→1，10 帧）+ 旗杆白闪（落位后 2 帧）——
  const flagS = (t: number) => (N < t ? 0 : 1.4 - 0.4 * clamp01((N - t) / 10));
  const poleFlash = (t: number) => N >= t + 10 && N < t + 12;

  // —— 旗面摆动（30 帧周期 ±3°，443/53 两旗；旗杆不动）——
  const flagSway = 3 * Math.sin((2 * Math.PI * N) / 30);

  // 光点入场（轨展开后）
  const dotsOn = N > T_RAIL + 18;

  return (
    <div style={{position: 'absolute', inset: 0, opacity: exOp, transform: exDy ? `translateY(${exDy.toFixed(1)}px)` : undefined}}>
      {/* ===== 上轨 TCP ports（紫）===== */}
      <div style={{...abs(RAIL.x, RAIL.tcpY - 46, RAIL.w, 92), clipPath: `inset(0 ${(wipe(T_RAIL) * 100).toFixed(2)}% 0 0)`}}>
        <PortRailX x={0} y={46} w={RAIL.w} label="TCP ports" color={PURPLE_LIGHT} sweepP={sweepT} endL="" endR="" tickN={Math.max(0, N - T_RAIL)} />
        {dotsOn && DOTS.map((_, i) => {
          const x = dotX(i, N - T_RAIL);
          return <div key={i} style={{position: 'absolute', left: x, top: 47.5, width: 7, height: 7, borderRadius: 4,
            background: PURPLE_LIGHT, boxShadow: `0 0 5px 1px ${PURPLE_LIGHT}`, opacity: dotOp(i, N) * dotFade(x) * (0.55 + 0.45 * gk)}} />;
        })}
        {/* 成片 v2：上轨周期性亮扫游标（首扫后每 88 帧一趟，30 帧横越——端口空间活跃感，破 8010–8151 真静窗） */}
        {(() => {
          const first = 7990; // 成片 v3：首扫提前（8010–8114 真静窗内即开始）
          if (N < first) return null;
          const cyc = (N - first) % 72;
          if (cyc >= 26) return null;
          const x = (cyc / 30) * (RAIL.w - 90);
          return <div style={{position: 'absolute', left: x, top: 40, width: 90, height: 20, background: `linear-gradient(90deg, rgba(161,117,241,0) 0%, rgba(161,117,241,.5) 70%, rgba(226,220,255,.95) 100%)`, borderRadius: 4, opacity: 0.85 * gk}} />;
        })()}
      </div>
      {/* 左端 0 / 右端 65,535（上轨） */}
      {zeroOp > 0 ? <CText cx={RAIL.x + 14} cy={RAIL.tcpY + 35} size={34} weight={700} family="'Orbitron','Audiowide',sans-serif" color={GREY_LIGHT} opacity={zeroOp}>0</CText> : null}
      {endR ? <CText cx={RAIL.x + RAIL.w - 84} cy={RAIL.tcpY + 35} size={34} weight={700} family="'Orbitron','Audiowide',sans-serif" color={GREY_LIGHT}>{endR}</CText> : null}

      {/* ===== 下轨 UDP ports（橙）===== */}
      <div style={{...abs(RAIL.x, RAIL.udpY - 46, RAIL.w, 92), clipPath: `inset(0 ${(wipe(T_RAIL + 2) * 100).toFixed(2)}% 0 0)`}}>
        <PortRailX x={0} y={46} w={RAIL.w} label="UDP ports" color={ORANGE} sweepP={sweepU} endL="" endR="" tickN={Math.max(0, N - T_RAIL - 2)} />
        {dotsOn && DOTS.map((_, i) => {
          const x = dotX(i, N - T_RAIL - 2);
          return <div key={i} style={{position: 'absolute', left: x, top: 47.5, width: 7, height: 7, borderRadius: 4,
            background: ORANGE, boxShadow: `0 0 5px 1px ${ORANGE}`, opacity: dotOp(i, N + 37) * dotFade(x) * (0.55 + 0.45 * gk)}} />;
        })}
        {/* 成片 v2：下轨周期性亮扫游标（与上轨错相 44 帧） */}
        {(() => {
          const first = 7990 + 36; // 成片 v3：与上轨错相 36 帧
          if (N < first) return null;
          const cyc = (N - first) % 72;
          if (cyc >= 26) return null;
          const x = (1 - cyc / 30) * (RAIL.w - 90);
          return <div style={{position: 'absolute', left: x, top: 40, width: 90, height: 20, background: `linear-gradient(270deg, rgba(240,95,65,0) 0%, rgba(240,95,65,.5) 70%, rgba(255,214,201,.95) 100%)`, borderRadius: 4, opacity: 0.85 * gk}} />;
        })()}
      </div>
      {/* 左端 0 / 右端 65,535（下轨） */}
      {zeroOp > 0 ? <CText cx={RAIL.x + 14} cy={RAIL.udpY + 35} size={34} weight={700} family="'Orbitron','Audiowide',sans-serif" color={GREY_LIGHT} opacity={zeroOp}>0</CText> : null}
      {endR ? <CText cx={RAIL.x + RAIL.w - 84} cy={RAIL.udpY + 35} size={34} weight={700} family="'Orbitron','Audiowide',sans-serif" color={GREY_LIGHT}>{endR}</CText> : null}

      {/* ===== `16-bit` 灰章（7940）===== */}
      <div style={{position: 'absolute', inset: 0, opacity: softOp(N - T_16BIT, 8)}}>
        <Pill x={640 - 58} y={214} w={116} h={34} r={17} stroke={GREY_MID} sw={2} fill="#000"
          text="16-bit" fontSize={22} weight={600} family={FONT_MONO} color={GREY} letterSpacing={0} />
      </div>

      {/* ===== 隔离虚线 + `separate spaces`（8139）===== */}
      {sepP > 0 ? (
        <svg width={1280} height={720} viewBox="0 0 1280 720" style={{position: 'absolute', inset: 0}}>
          <line x1={RAIL.x} y1={LINE_Y} x2={RAIL.x + RAIL.w} y2={LINE_Y} stroke={GREY_MID} strokeWidth={2} strokeDasharray="8 8"
            pathLength={100} strokeDashoffset={100 * (1 - sepP)} opacity={0.85} />
        </svg>
      ) : null}
      <div style={{position: 'absolute', inset: 0, opacity: softOp(N - (T_SWEEP_U + 6), 8)}}>
        <div style={{...abs(640 - 112, LINE_Y - 17, 224, 34), background: '#050507'}} />
        <CText cx={640} cy={LINE_Y} size={22} weight={500} family={FONT_MONO} color={GREY}>separate spaces</CText>
      </div>

      {/* ===== 端口旗 ===== */}
      {/* 443（TCP 轨上方，紫；旗面 30 帧摆动 ±3°） */}
      {flagS(T_443) > 0 ? (
        <FlagMark cx={307} railY={RAIL.tcpY} dir="up" label="443" sub="HTTPS" color={PURPLE_LIGHT}
          scale={flagS(T_443)} opacity={softOp(N - T_443, 6)} poleFlash={poleFlash(T_443)} sway={flagSway}
          glow={`0 0 24px 8px rgba(102,48,248,${(0.55 * gk).toFixed(2)})`} />
      ) : null}
      {/* 53（UDP 轨上方左，橙；旗面同款摆动） */}
      {flagS(T_53) > 0 ? (
        <FlagMark cx={307} railY={RAIL.udpY} dir="up" label="53" sub="DNS" color={ORANGE}
          scale={flagS(T_53)} opacity={softOp(N - T_53, 6)} poleFlash={poleFlash(T_53)} sway={flagSway}
          glow={`0 0 24px 8px rgba(240,95,65,${(0.5 * gk).toFixed(2)})`} />
      ) : null}
      {/* 443 · QUIC（UDP 轨上方右端，紫边） */}
      <div style={{position: 'absolute', inset: 0, opacity: softOp(N - (T_53 + 4), 8)}}>
        <FlagMark cx={1004} railY={RAIL.udpY} dir="up" label="443 · QUIC" w={184} h={54} color={PURPLE_LIGHT} labelColor={WHITE}
          glow={`0 0 20px 6px rgba(102,48,248,${(0.45 * gk).toFixed(2)})`} />
      </div>
    </div>
  );
};
