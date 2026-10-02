import React from 'react';
import {useCurrentFrame} from 'remotion';
import {clamp01, easeOutCubic, emphasisPulse, GlitchIn, FONT_ORB, FONT_HEAVY} from '../../common';
import {CText, PacketIcon, Svg, abs, scaleIn, fadeIn, exitOp, glowOffK, WHITE, GREY, GREY_MID, GREY_LIGHT, ORANGE, PURPLE, PURPLE_LIGHT, RED_DEEP} from '../../ui';
import {CameraRig, BigNumber} from '../../fx';

/**
 * SC15 一秒，两秒，四秒（3166–3404，S26 ¶）—— 章二高光时刻·大数字型（全片最高潮）
 * 节拍：3174 回执没回来 / 3249 重发 / 3294 等待翻倍 / 3334 1 s 2 s 4 s。
 * 上半：精简时间轴（axis y 265, x 200–1080）+ 发送紫点 (300,265) + 信封 2.6px/帧右行；
 *       3174 红 `×`（本镜唯一 glitch）落在回执轨道 (700,310) → 轨道断线（±26px 缺口）+ `lost` 小灰标；
 *       3249 重发信封 scaleIn 弹出再出发；等待条三段（45/90/180px = 1:2:4）随三个数字落位 draw-on。
 * 下半：`1 s`(470,425) `2 s`(670,425) `4 s`(870,425) Orbitron 76px 橙依次 12 帧计数落位（3294/3305/3316 起，
 *       间隔 11 帧——分镜表「间隔 20 帧」会挤掉 7 s 落位后的 ≥45 帧停留，已压缩并记录）
 *       + 段间重发信封小图标弹出；等式区 `1+2+4`（54px）+ `7 s` BigNumber 130px 橙 20 帧计数 0→7（3330–3350）
 *       + emphasisPulse 1.11 + 橙光晕爆发（扩散环 16 帧 + 径向光呼吸：前 24 帧满幅 ±14%，
 *       3374–3384 收敛到 ±5% 防盖过停留读数，同竖版片 SC09 先例）；运镜 3327–3360 推近 1→1.22
 *       （收在 7 s 落位后 10 帧，推完至离场 36 帧纯静态；轴让位 3330–3342，轴进 HUD 带前完成）；
 * 停留：7s 落位 3350 → 离场 3396 = 46 帧 ✓（≥45）；末 8 帧归零（光先灭 3390）。零扫光。
 */
const F0 = 3166;
const T_SEND = 3174, T_RESEND = 3249, T_W1 = 3294, T_W2 = 3305, T_W3 = 3316, T_7 = 3330, T_7END = 3350;
const T_PUSH = 3327, T_FADE_TOP = 3330, T_EXIT = 3424;
const AXIS_Y = 265, ORIGIN = 300, TRACK_Y = 310, XAT = 700;

/** 上半时间轴组（axis + 等待条 + 轨道 + × + 信封），3330 起让位淡出（轴在进 HUD 带前消失） */
const TopHalf: React.FC<{N: number; ex: number; topOp: number}> = ({N, ex, topOp}) => {
  const axisP = clamp01((N - F0) / 12);
  const lostOp = clamp01((N - T_SEND) / 10);
  const xGlitch = N - T_SEND;
  // 等待条三段（1:2:4 → 45/90/180px），随数字落位 draw-on（12 帧）
  const bars = [
    {x0: ORIGIN, w: 45, t: T_W1 + 12},
    {x0: ORIGIN + 45, w: 90, t: T_W2 + 12},
    {x0: ORIGIN + 135, w: 180, t: T_W3 + 12},
  ];
  const envX = (t0: number) => ORIGIN + 2.6 * Math.max(0, N - t0);
  const xGlow = 0.55 + 0.35 * Math.sin((2 * Math.PI * (N - 4)) / 30);
  return (
    <div style={{...abs(0, 0, 1280, 720), opacity: ex * topOp}}>
      <Svg>
        <line x1={200} y1={AXIS_Y} x2={200 + 880 * axisP} y2={AXIS_Y} stroke={WHITE} strokeWidth={2.5} opacity={0.9} />
        {/* 回执轨道（× 落下后断线） */}
        <line x1={340} y1={TRACK_Y} x2={lostOp > 0 ? XAT - 26 : 1040} y2={TRACK_Y} stroke={GREY_MID} strokeWidth={2} strokeDasharray="9 9" opacity={0.7} />
        {lostOp > 0 ? <line x1={XAT + 26} y1={TRACK_Y} x2={1040} y2={TRACK_Y} stroke={GREY_MID} strokeWidth={2} strokeDasharray="9 9" opacity={0.7} /> : null}
        {/* 等待条 */}
        {bars.map((b, i) => {
          const k = clamp01((N - b.t) / 12);
          if (k <= 0) return null;
          return <rect key={i} x={b.x0} y={AXIS_Y - 6} width={b.w * k} height={12} fill={ORANGE} opacity={0.9} style={{filter: 'drop-shadow(0 0 5px rgba(240,95,65,.6))'}} />;
        })}
      </Svg>
      {/* 发送原点 */}
      <div style={{...abs(ORIGIN - 7, AXIS_Y - 7, 14, 14), borderRadius: 7, background: PURPLE, boxShadow: '0 0 10px rgba(102,45,248,.8)', opacity: clamp01((N - T_SEND + 4) / 6)}} />
      {/* 信封（发出 + 3249 重发） */}
      {[T_SEND, T_RESEND].map((t0, i) => {
        const n = N - t0;
        if (n < 0) return null;
        const s = i === 0 ? 1 : 0.4 + 0.6 * scaleIn(n - 4, 10);
        return <PacketIcon key={i} cx={envX(t0)} cy={AXIS_Y - 27} w={56} h={40} accent scale={s} opacity={i === 0 ? 1 : clamp01(n / 6)} />;
      })}
      {/* 红 ×（本镜唯一 glitch）+ lost 小标 */}
      <GlitchIn N={N} f0={T_SEND} seed={15}>
        <CText cx={XAT} cy={TRACK_Y} size={84} weight={900} family={FONT_HEAVY} color={RED_DEEP} shadow={`0 0 ${Math.round(14 + 10 * xGlow)}px rgba(236,8,31,${(0.35 + 0.3 * xGlow).toFixed(2)})`}>×</CText>
      </GlitchIn>
      {xGlitch > 12 ? <CText cx={XAT} cy={TRACK_Y + 44} size={22} weight={600} color={GREY} letterSpacing={2} opacity={fadeIn(xGlitch - 12, 8)}>lost</CText> : null}
    </div>
  );
};

export const SC15: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const ex = exitOp(N, T_EXIT, 8);
  const glowOff = glowOffK(N, T_EXIT, 6, 8);
  const topOp = 1 - clamp01((N - T_FADE_TOP) / 12); // 上半让位

  // 三段等待大字：12 帧计数落位
  const NUMS = [
    {x: 470, t0: T_W1, v: 1},
    {x: 670, t0: T_W2, v: 2},
    {x: 870, t0: T_W3, v: 4},
  ];
  const numState = NUMS.map((m) => {
    const n = N - m.t0;
    const k = clamp01(n / 12);
    const val = Math.round(m.v * (1 - Math.pow(1 - k, 2)));
    return {...m, n, val, done: k >= 1, pulse: emphasisPulse(n - 12, {peak: 1.09, up: 9, hold: 3, down: 9})};
  });
  // 段间重发信封小图标（前一段落位后弹出）
  const resends = [{x: 570, t: T_W1 + 14}, {x: 770, t: T_W2 + 14}].filter((r) => N >= r.t);

  // 7 s 大数字（20 帧计数 0→7）
  const n7 = N - T_7;
  const v7 = n7 < 0 ? -1 : Math.round(7 * easeOutCubic(clamp01(n7 / 20)));
  const pulse7 = emphasisPulse(N - T_7END, {peak: 1.11, up: 12, hold: 5, down: 13});
  const glowK = glowOff * clamp01((N - T_7END + 4) / 8);
  // 呼吸幅度：落位后前 24 帧满幅 ±14%（爆发能量），3374–3384 收敛到 ±5%（停留读数不被大面积光呼吸盖过，竖版 SC09 同款处理）
  const breatheAmp = 0.14 - 0.09 * clamp01((N - (T_7END + 24)) / 10);
  const breathe = 1 + breatheAmp * Math.sin((2 * Math.PI * (N - 6)) / 30);
  const burstN = N - T_7END;

  return (
    <CameraRig N={N} keys={[{f: F0, x: 640, y: 360, s: 1}, {f: T_PUSH, x: 640, y: 360, s: 1}, {f: T_PUSH + 33, x: 770, y: 550, s: 1.22}]}>
      <TopHalf N={N} ex={ex} topOp={topOp} />

      {/* 左侧说明（wait → resend），推近前淡出（cx 310：与 `1 s` 大字保持 ≥20px 间隙） */}
      <CText cx={310} cy={425} size={22} weight={600} color={GREY} letterSpacing={1} opacity={ex * (1 - clamp01((N - (T_FADE_TOP - 10)) / 10))}>wait → resend</CText>

      {/* 三段等待大字（Orbitron 76px 橙） */}
      {numState.map((m, i) => (
        <div key={i} style={{...abs(0, 0, 1280, 720), opacity: ex * (m.n < 0 ? 0 : 1)}}>
          {m.n >= 0 ? (
            <div style={{...abs(m.x - 120, 425 - 60, 240, 120), transform: `scale(${m.pulse.toFixed(4)})`, transformOrigin: '50% 50%'}}>
              <CText cx={120} cy={60} size={76} weight={700} family={FONT_ORB} color={ORANGE} letterSpacing={2} shadow="0 0 16px rgba(240,95,65,.5)" style={{fontVariantNumeric: 'tabular-nums'}}>{m.val} s</CText>
            </div>
          ) : null}
        </div>
      ))}

      {/* 段间重发信封小图标 */}
      {resends.map((r, i) => (
        <div key={i} style={{...abs(0, 0, 1280, 720), opacity: ex}}>
          <div style={{...abs(r.x - 26, 425 - 19, 52, 38), transform: `scale(${(0.4 + 0.6 * scaleIn(N - r.t, 10)).toFixed(4)})`, transformOrigin: '50% 50%'}}>
            <PacketIcon cx={26} cy={19} w={52} h={38} accent opacity={0.95} />
          </div>
        </div>
      ))}

      {/* 等式区：1+2+4（项随数字落位）+ = */}
      <div style={{...abs(0, 0, 1280, 720), opacity: ex}}>
        {[
          {t: T_W1 + 12, s: '1'},
          {t: T_W1 + 17, s: '+'},
          {t: T_W2 + 12, s: '2'},
          {t: T_W2 + 17, s: '+'},
          {t: T_W3 + 12, s: '4'},
        ].map((tok, i) => (
          <CText key={i} cx={404 + i * 40} cy={545} size={54} weight={700} family={FONT_ORB} color={WHITE} opacity={clamp01((N - tok.t + 3) / 8)}>{tok.s}</CText>
        ))}
        <CText cx={619} cy={545} size={54} weight={700} family={FONT_ORB} color={GREY_LIGHT} opacity={clamp01((N - T_7 + 3) / 8)}>=</CText>
      </div>

      {/* 7 s 主角：BigNumber 130px 橙 + 橙光晕（爆发 + 30 帧呼吸） */}
      {n7 >= 0 ? (
        <>
          {/* 径向橙光（呼吸） */}
          <div style={{...abs(790 - 215 * breathe, 545 - 215 * breathe, 430 * breathe, 430 * breathe), borderRadius: '50%', background: `radial-gradient(circle, rgba(240,95,65,${(0.34 * glowK).toFixed(3)}) 0%, rgba(240,95,65,${(0.16 * glowK).toFixed(3)}) 40%, rgba(240,95,65,0) 70%)`, opacity: ex}} />
          {/* 光晕爆发扩散环（16 帧） */}
          {burstN >= 0 && burstN <= 16 ? (
            <Svg>
              <circle cx={790} cy={545} r={120 + burstN * 13} fill="none" stroke={ORANGE} strokeWidth={Math.max(1, 4 - burstN * 0.22)} opacity={0.8 * (1 - burstN / 16)} />
              <circle cx={790} cy={545} r={90 + burstN * 8} fill="none" stroke={PURPLE_LIGHT} strokeWidth={2} opacity={0.4 * (1 - burstN / 16)} />
            </Svg>
          ) : null}
          <div style={{...abs(790 - 220, 545 - 110, 440, 220), transform: `scale(${pulse7.toFixed(4)})`, transformOrigin: '50% 50%', opacity: ex}}>
            <BigNumber cx={220} cy={110} value={`${v7} s`} size={130} color={ORANGE} letterSpacing={2} dy={0}
              shadow="6px 6px 0 rgba(240,95,65,.4), 0 0 34px rgba(240,95,65,.6)" />
          </div>
        </>
      ) : null}
    </CameraRig>
  );
};
