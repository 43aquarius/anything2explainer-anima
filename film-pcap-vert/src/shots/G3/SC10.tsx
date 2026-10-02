import React from 'react';
import {useCurrentFrame} from 'remotion';
import {clamp01, easeOutCubic, FONT_MONO, rnd} from '../../common';
import {abs, ClockIcon, CText, EXAMPLE, GREY, GREY_LINE, MonoText, ORANGE, PURPLE_LIGHT, scaleIn, SoftIn, WHITE, exitOp, firstOp} from '../../ui';
import {HeroGlow} from '../../fx';
import {LockGlyph, tri} from './g3ui';

/**
 * SC10 TLS 不藏信封 · N 1589–1771（S11 1597–1769：1597 TLS 藏信 / 1648 不藏信封 / 1687 谁何时多少）
 * 版式：中央锁信封（280 宽，封口小锁 draw-on）+ 三条引线标注 who（→地址）/ when（→角上小钟，秒针持续转）/
 *   how much（→右侧厚度标尺），依次 draw-on 12 帧 + 标签 SoftIn + 部位白闪；下方 mini 时间轴（SC08 缩微，
 *   请求点紫 + 三个重发点橙，缓慢呼吸）。
 * 1648「not the envelopes」：信封边框白闪 + payload 点阵开始每 30 帧乱序重排（letters 被藏、envelope 还在）。
 * 零 glitch（白名单 SC10 无）。停留：段内不判（下镜承接）。末 8 帧归零。
 * 主角：锁信封 230px（HeroGlow 常亮）；光：引线端点白亮 / 橙点橙。
 */
const F0 = 1589, TO = 1771;
const T_ENV = 1597, T_FLAP = 1601, T_LOCK = 1607, T_NOT = 1648, T_TL = 1705, T_DOTS = 1712;
const ENV = {x: 220, y: 460, w: 280, h: 230};
const FLAP_TIP = {x: 360, y: 580};
const LOCK = {cx: 360, cy: 612};
const CLOCK = {cx: 462, cy: 490, r: 22};
const RULER = {x: 512, y0: 555, y1: 685};
const TL = {x0: 150, x1: 570, y: 830};
const REQ_X = 180;
const RET_X = [225, 315, 495]; // 间隔 1s/2s/4s（SC08 缩微）
const CALLOUTS = [
  {label: 'who', lx: 118, ly: 510, x0: 152, y0: 510, x1: 240, y1: 510, t: 1687},
  {label: 'when', lx: 575, ly: 458, x0: 548, y0: 462, x1: 486, y1: 480, t: 1699},
  {label: 'how much', lx: 560, ly: 726, x0: 542, y0: 712, x1: 516, y1: 688, t: 1711},
];

/** payload 点阵：1648 起每 30 帧乱序重排（加密内容读不到，但一直在） */
const dotLit = (N: number, i: number) => {
  if (N < T_NOT) return i % 5 === 0;
  const cyc = Math.floor((N - T_NOT) / 30);
  return rnd(cyc, i, 7) < 0.34;
};

export const SC10: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const op = exitOp(N, TO, 8);
  const envN = N - T_ENV;
  const envS = envN < 0 ? 0 : 0.55 + 0.45 * scaleIn(envN);
  const flapP = clamp01((N - T_FLAP) / 16);
  const tlP = easeOutCubic(clamp01((N - T_TL) / 20));
  const notFlash = tri(N - T_NOT, 8);
  return (
    <div style={{position: 'absolute', inset: 0, opacity: op}}>
      {/* ===== 锁信封（缩放入场；1648 白闪） ===== */}
      <div style={{position: 'absolute', inset: 0, opacity: firstOp(envN, 8), transform: envS >= 1 ? undefined : `scale(${envS.toFixed(4)})`, transformOrigin: '360px 575px'}}>
        <HeroGlow x={ENV.x} y={ENV.y} w={ENV.w} h={ENV.h} r={10} N={N} k={0.9} />
        <div style={{position: 'absolute', inset: 0, filter: notFlash > 0 ? `brightness(${(1 + 0.55 * notFlash).toFixed(2)})` : undefined}}>
          {/* 信封体 */}
          <div style={{...abs(ENV.x, ENV.y, ENV.w, ENV.h), background: '#000', border: `3px solid ${WHITE}`, borderRadius: 6, filter: 'drop-shadow(0 0 2px rgba(255,255,255,.35))'}} />
          {/* 封口折线（draw-on） */}
          {flapP > 0 ? (
            <svg width={ENV.w} height={ENV.h} viewBox={`0 0 ${ENV.w} ${ENV.h}`} style={{position: 'absolute', left: ENV.x, top: ENV.y, overflow: 'visible'}}>
              <path d={`M 3,3 L ${FLAP_TIP.x - ENV.x},${FLAP_TIP.y - ENV.y} L ${ENV.w - 3},3`} fill="none" stroke={WHITE} strokeWidth={2.5} pathLength={100} strokeDasharray={100} strokeDashoffset={100 * (1 - flapP)} strokeLinejoin="round" />
            </svg>
          ) : null}
          {/* 地址（who 的目标部位；1648+14 白闪） */}
          <div style={{position: 'absolute', inset: 0, filter: N >= T_NOT + 14 ? `brightness(${(1 + 0.6 * tri(N - T_NOT - 14, 9)).toFixed(2)})` : undefined}}>
            <SoftIn N={N} f0={T_ENV + 6}>
              <MonoText x={ENV.x + 26} y={ENV.y + 26} size={22} color={GREY}>{`from ${EXAMPLE.clientIp}`}</MonoText>
              <MonoText x={ENV.x + 26} y={ENV.y + 56} size={22} color={GREY}>{`to   ${EXAMPLE.serverIp}`}</MonoText>
            </SoftIn>
          </div>
          {/* header / payload 分隔虚线 */}
          <div style={{...abs(ENV.x + 20, ENV.y + 140, ENV.w - 40, 0), borderTop: `2.5px dashed ${GREY_LINE}`}} />
          {/* payload（读不到的内容示意：灰线条 + 点阵） */}
          <SoftIn N={N} f0={T_ENV + 8}>
            {[0, 1, 2].map((i) => (
              <div key={i} style={{...abs(ENV.x + 26, ENV.y + 158 + i * 20, i === 1 ? 88 : 120, 7), background: GREY_LINE, opacity: 0.85}} />
            ))}
            {Array.from({length: 12}, (_, i) => (
              <div key={`d${i}`} style={{...abs(ENV.x + 160 + (i % 4) * 30, ENV.y + 158 + Math.floor(i / 4) * 24, 9, 9), borderRadius: 2, background: dotLit(N, i) ? PURPLE_LIGHT : GREY_LINE, opacity: 0.9}} />
            ))}
          </SoftIn>
          {/* 封口小锁（draw-on） */}
          <LockGlyph cx={LOCK.cx} cy={LOCK.cy} s={0.45} p={clamp01((N - T_LOCK) / 12)} />
          {/* 角上的小钟（when 的目标部位，秒针持续转） */}
          <div style={{position: 'absolute', inset: 0, filter: N >= CALLOUTS[1].t + 14 ? `brightness(${(1 + 0.6 * tri(N - CALLOUTS[1].t - 14, 9)).toFixed(2)})` : undefined}}>
            <SoftIn N={N} f0={T_ENV + 4}>
              <ClockIcon cx={CLOCK.cx} cy={CLOCK.cy} r={CLOCK.r} N={N} accent={PURPLE_LIGHT} />
            </SoftIn>
          </div>
        </div>
      </div>
      {/* ===== 厚度标尺（how much 的目标部位，draw-on + 白闪） ===== */}
      <div style={{position: 'absolute', inset: 0, filter: N >= CALLOUTS[2].t + 14 ? `brightness(${(1 + 0.6 * tri(N - CALLOUTS[2].t - 14, 9)).toFixed(2)})` : undefined}}>
        {N >= CALLOUTS[2].t - 4 ? (
          <svg width={40} height={RULER.y1 - RULER.y0 + 10} viewBox={`0 0 40 ${RULER.y1 - RULER.y0 + 10}`} style={{position: 'absolute', left: RULER.x - 20, top: RULER.y0 - 5, overflow: 'visible', opacity: clamp01((N - (CALLOUTS[2].t - 4)) / 6)}}>
            <line x1={20} y1={5} x2={20} y2={RULER.y1 - RULER.y0 + 5} stroke={WHITE} strokeWidth={2.5} pathLength={100} strokeDasharray={100} strokeDashoffset={100 * (1 - clamp01((N - CALLOUTS[2].t) / 12))} />
            <line x1={6} y1={5} x2={34} y2={5} stroke={WHITE} strokeWidth={2.5} />
            <line x1={6} y1={RULER.y1 - RULER.y0 + 5} x2={34} y2={RULER.y1 - RULER.y0 + 5} stroke={WHITE} strokeWidth={2.5} />
            {[38, 75, 112].map((y) => (
              <line key={y} x1={12} y1={y} x2={28} y2={y} stroke={GREY} strokeWidth={2} />
            ))}
          </svg>
        ) : null}
      </div>
      {/* ===== 三条引线标注（依次 draw-on 12 帧 + 标签 SoftIn + 端点白亮） ===== */}
      {CALLOUTS.map((c) => {
        const ln = N - c.t;
        if (ln < 0) return null;
        const p = clamp01(ln / 12);
        return (
          <div key={c.label}>
            <svg width={720} height={1280} viewBox="0 0 720 1280" style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
              <line x1={c.x0} y1={c.y0} x2={c.x1} y2={c.y1} stroke={WHITE} strokeWidth={2.5} pathLength={100} strokeDasharray={100} strokeDashoffset={100 * (1 - p)} />
              {p > 0.9 ? <circle cx={c.x1} cy={c.y1} r={5} fill={WHITE} style={{filter: 'drop-shadow(0 0 8px rgba(255,255,255,.9))'}} /> : null}
            </svg>
            <SoftIn N={N} f0={c.t}>
              <CText cx={c.lx} cy={c.ly} size={26} weight={700}>{c.label}</CText>
            </SoftIn>
          </div>
        );
      })}
      {/* ===== mini 时间轴（SC08 缩微；橙点呼吸） ===== */}
      <div style={{position: 'absolute', inset: 0, opacity: clamp01((N - T_TL) / 6)}}>
        {tlP > 0 ? <div style={{...abs(TL.x0, TL.y - 1.5, (TL.x1 - TL.x0) * tlP, 3), background: WHITE, opacity: 0.9, boxShadow: '0 0 8px rgba(255,255,255,.4)'}} /> : null}
        <SoftIn N={N} f0={T_TL + 10}>
          <CText cx={TL.x0 + 14} cy={TL.y + 26} size={22} weight={600} color={GREY} style={{fontFamily: FONT_MONO}}>t=0</CText>
        </SoftIn>
        {/* 请求点（紫） */}
        <SoftIn N={N} f0={T_TL + 12}>
          <div style={{...abs(REQ_X - 7, TL.y - 7, 14, 14), borderRadius: '50%', background: PURPLE_LIGHT, boxShadow: '0 0 10px 2px rgba(161,117,241,.55)'}} />
        </SoftIn>
        {/* 重发点（橙，依次点亮 + 缓慢呼吸） */}
        {RET_X.map((rx, i) => {
          const s = scaleIn(N - (T_DOTS + i * 10), 10);
          if (s <= 0) return null;
          const breathe = 0.62 + 0.38 * Math.sin((2 * Math.PI * (N + i * 8)) / 30);
          return <div key={i} style={{...abs(rx - 6 * s, TL.y - 6 * s, 12 * s, 12 * s), borderRadius: '50%', background: ORANGE, boxShadow: `0 0 ${Math.round(10 * breathe)}px ${Math.round(2.5 * breathe)}px rgba(240,95,65,.6)`, opacity: 0.75 + 0.25 * breathe}} />;
        })}
      </div>
    </div>
  );
};
