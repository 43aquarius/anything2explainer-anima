import React from 'react';
import {useCurrentFrame} from 'remotion';
import {GlitchIn, clamp01, emphasisPulse, FONT_WIDE, FONT_TECH} from '../../common';
import {Box, CText, PacketIcon, PURPLE, PURPLE_TECH, WHITE, abs, fadeIn, exitOp, glowOffK, SoftIn} from '../../ui';
import {LightSweep, StageLine, GhostText, ghostOpacity} from '../../fx';

/**
 * SC04 抓包=复印 · N 480–657（S05 488–635 ¶ 段末）
 * **高光时刻·登场型（扫光白名单①，紧凑版 ~55 帧；编排 = composition-and-light.md §3 / fx SET_PIECE）**
 * 版式（清场）：`PACKET` / `CAPTURE` 两行 Audiowide 76px（(360,478)/(360,566)）+ 紫硬投影 + GlitchIn（rgbSplit 6，本组②）；
 *   下方 (360,735) 迷你复印站：横向短线 + 中央白菱形「点」，信封每 30 帧经过一点 → 白闪 → 半透明紫副本落到下方托盘（持续循环）；
 *   (360,668) 小 Pill `copy · at a point`（584）。
 * 节拍：484/500/516 三轮紫光横扫（每轮 3 条、2 帧错峰、16 帧；竖版横扫 y≈500 大字区）；
 *   490 StageLine 横线展宽呼吸（cy 636）；506 GhostText 两行轮廓隐现；
 *   522 舞台线白闪 3 帧消失 + 大字 GlitchIn（rgbSplit 6 / slices 16）→ 534 emphasisPulse 1.11；
 *   540 复印站线 draw-on（12 帧）+ 546 白菱形点 + 548 托盘；
 *   552/582/612/642 信封经过点（10px/帧横穿）→ 点白闪 3 帧 → 副本 12 帧落到托盘槽（3 槽轮换、旧副本淡出，持续动作）；
 *   584 点紫光点亮 + Pill SoftIn；649–657 归零。
 * 停留：¶ 段末，末 Pill 落位 592 → 离场 649，57 帧 ✓（闪/落为已开动的循环动作，不算新增元素）。
 * 主角：`PACKET CAPTURE` 两行大字块（76px×2 行），光 = 扫光 + 紫硬投影。本镜零运镜。
 */
const F0 = 480, TO = 657;
const T_SWEEPS = [484, 500, 516];
const T_LINE = 490, T_GHOST = 506, T_BIG = 522, T_PULSE = 534;
const T_WIRE = 540, T_POINT = 546, T_TRAY = 548;
const T_LOOP = 552, LOOP = 30;
const T_PILL = 584;
const LINES: Array<{cy: number; text: string}> = [
  {cy: 478, text: 'PACKET'},
  {cy: 566, text: 'CAPTURE'},
];
/** 扫光条 [y, h, w, 帧偏移]：覆盖两行大字块（y 440–604），竖版横扫 */
const SWEEP_BARS_V: Array<[number, number, number, number]> = [
  [452, 6, 300, 0],
  [494, 10, 430, 2],
  [536, 6, 300, 4],
];
/** 迷你复印站：横向线 y735（x170–550）+ 中央白菱形点 + 托盘 y830（3 槽） */
const ST = {wireY: 735, x0: 170, x1: 550, trayY: 830, slots: [306, 360, 414]};
const ENV_SPEED = 10;
const FLASH_SEQ = [0.95, 0.6, 0.25];

export const SC04: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const exOp = exitOp(N, TO, 8);
  const pulse = emphasisPulse(N - T_PULSE, {peak: 1.11});
  const ghostOp = ghostOpacity(N, T_GHOST, T_BIG);
  const bigOn = N >= T_BIG;
  // 复印站
  const wireOp = fadeIn(N - T_WIRE, 12);
  const trayOp = fadeIn(N - T_TRAY, 8);
  // 点：白菱形，552/582/612/642 信封经过时白闪 3 帧；584 起紫光点亮（当前重点）
  const pointOp = fadeIn(N - T_POINT, 8);
  const dFlash = (() => {
    const d = (N - T_LOOP) % LOOP;
    return N >= T_LOOP && d <= 2 ? FLASH_SEQ[d] : 0;
  })();
  const pointPulse = emphasisPulse(N - T_PILL, {peak: 1.25, up: 10, hold: 3, down: 12});
  const pointGlow = glowOffK(N, TO, 6, 8);
  // 信封流（k 经过点的时刻 t_k = 552+30k，横穿 10px/帧，±220px 可见窗）
  const events = [0, 1, 2, 3].map((k) => T_LOOP + LOOP * k);
  const envs = events
    .map((t, k) => {
      const cx = 360 + ENV_SPEED * (N - t);
      const op = fadeIn(N - (t - 22), 6) * (1 - clamp01((cx - 510) / 40));
      return {k, cx, op};
    })
    .filter((e) => e.op > 0);
  // 副本（t_k+3 起 12 帧落到槽位；最新落定 0.75，其余 0.45；被新副本换槽的旧副本 8 帧淡出）
  const copies = events
    .map((t, k) => {
      const n = N - (t + 3);
      if (n < 0) return null;
      const fall = clamp01(n / 12);
      const cy = 743 + 68 * Math.pow(fall, 1.7);
      let op = fadeIn(n, 4);
      const isLatest = k === Math.min(3, Math.floor((N - T_LOOP - 15) / LOOP));
      op *= isLatest ? 0.75 : 0.45;
      if (k + 3 <= 3) {
        const nOut = N - (events[k + 3] + 3);
        if (nOut > 0) op *= 1 - clamp01(nOut / 8);
      }
      return {k, cx: ST.slots[k % 3], cy, op};
    })
    .filter((c): c is {k: number; cx: number; cy: number; op: number} => c !== null && c.op > 0);
  return (
    <div style={{position: 'absolute', inset: 0, opacity: exOp}}>
      {/* 三轮紫光横扫（登场型专用，全片白名单①；紧凑 16 帧轮距） */}
      <LightSweep N={N} rounds={T_SWEEPS} bars={SWEEP_BARS_V} />
      {/* 中央舞台横线：展宽 → 呼吸 → 522 白闪 3 帧消失 */}
      <StageLine N={N} f0={T_LINE} flashAt={T_BIG} cx={360} cy={636} w={520} />
      {/* 主角大字轮廓预示（白描边 10%） */}
      {LINES.map((l, i) => (
        <GhostText key={i} cx={360} cy={l.cy} size={76} family={FONT_WIDE} letterSpacing={5} dy={0} opacity={ghostOp}>
          {l.text}
        </GhostText>
      ))}
      {/* 两行大字：GlitchIn（rgbSplit 6 / slices 16）+ emphasisPulse */}
      {bigOn ? (
        <div style={{position: 'absolute', inset: 0, transformOrigin: '360px 522px', transform: pulse === 1 ? undefined : `scale(${pulse.toFixed(4)})`}}>
          <GlitchIn N={N} f0={T_BIG} rgbSplit={6} slices={16} sliceBands={4} seed={4}>
            {LINES.map((l, i) => (
              <CText key={i} cx={360} cy={l.cy} size={76} weight={400} family={FONT_WIDE} letterSpacing={5} color={WHITE} shadow={`5px 5px 0 ${PURPLE}, 0 0 28px rgba(102,45,248,.45)`}>
                {l.text}
              </CText>
            ))}
          </GlitchIn>
        </div>
      ) : null}
      {/* 迷你复印站：横向线 */}
      {wireOp > 0 ? (
        <div
          style={{
            position: 'absolute',
            left: (ST.x0 + ST.x1) / 2 - ((ST.x1 - ST.x0) / 2) * wireOp,
            top: ST.wireY - 1.25,
            width: (ST.x1 - ST.x0) * wireOp,
            height: 2.5,
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,.55) 12%, rgba(255,255,255,.55) 88%, transparent)',
          }}
        />
      ) : null}
      {/* 捕抓「点」：白菱形 + 白闪 + 紫光（584 起当前重点） */}
      {pointOp > 0 ? (
        <div
          style={{
            ...abs(360 - 7, ST.wireY - 7, 14, 14),
            opacity: pointOp,
            background: WHITE,
            transform: `rotate(45deg) scale(${(pointPulse * (1 + 0.35 * dFlash)).toFixed(3)})`,
            boxShadow: `0 0 ${Math.round((6 + 22 * clamp01((N - T_PILL) / 8)) * pointGlow)}px rgba(102,45,248,${(0.8 * pointGlow).toFixed(2)}), 0 0 ${dFlash > 0 ? 18 : 6}px ${dFlash > 0 ? Math.round(8 + 10 * dFlash) : 4}px rgba(255,255,255,${(0.5 + 0.5 * dFlash).toFixed(2)})`,
          }}
        />
      ) : null}
      {/* 托盘 + 支脚 */}
      {trayOp > 0 ? (
        <div style={{position: 'absolute', inset: 0, opacity: trayOp}}>
          <Box x={250} y={ST.trayY} w={220} h={14} r={6} sw={2} />
          <div style={{...abs(272, ST.trayY + 14, 8, 14), background: '#000', border: `2px solid ${WHITE}`, borderTop: 'none'}} />
          <div style={{...abs(440, ST.trayY + 14, 8, 14), background: '#000', border: `2px solid ${WHITE}`, borderTop: 'none'}} />
        </div>
      ) : null}
      {/* 经过点的信封（白，横穿 10px/帧） */}
      {envs.map((e) => (
        <PacketIcon key={`e${e.k}`} cx={e.cx} cy={ST.wireY} w={64} h={44} opacity={e.op} />
      ))}
      {/* 半透明紫副本（accent 描边 + 紫光，落到托盘槽） */}
      {copies.map((c) => (
        <PacketIcon key={`c${c.k}`} cx={c.cx} cy={c.cy} w={56} h={38} accent opacity={c.op} glow />
      ))}
      {/* copy · at a point */}
      <SoftIn N={N} f0={T_PILL}>
        <Box x={230} y={648} w={260} h={40} r={20} sw={2}>
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: FONT_TECH,
              fontStyle: 'italic',
              fontSize: 24,
              letterSpacing: 1,
              lineHeight: 1,
              whiteSpace: 'nowrap',
              transform: 'translateY(-1px)',
              textShadow: '0 0 6px rgba(80,30,200,.7)',
            }}
          >
            <span style={{color: WHITE, fontWeight: 900, fontSize: 28}}>{'c'}</span>
            <span style={{color: PURPLE_TECH, fontWeight: 600}}>{'opy · at a point'}</span>
          </div>
        </Box>
      </SoftIn>
    </div>
  );
};

