import React from 'react';
import {useCurrentFrame} from 'remotion';
import {clamp01, easeOutCubic, kf, powOutRemain, FONT_MONO, FONT_ORB} from '../../common';
import {CText, PacketIcon, GREY, GREY_LINE, ORANGE, WHITE, abs, exitOp, fadeIn, firstOp, glowOffK, scaleIn, SoftIn} from '../../ui';
import {DoubleArrow} from './g2ui';
import {countTo} from '../../fx';

/**
 * SC08 一秒两秒四秒 · N 1216–1396（S09 1224–1394：1224 重传 / 1281 间隔翻倍 / 1324 1秒2秒4秒）
 * 版式：时间轴放大主视觉（x40–620，y700，画布满宽）——
 *   请求信封（紫，x80）+ 3 枚重发信封（橙描边）依次滑入落位 x 210/370/560（对齐三节拍）；
 *   间隔大字 `1 s` `2 s` `4 s`（Orbitron 60px 橙 + 橙光，竖排阶梯 y643/543/443，越等越久字越高）+
 *   各带虚线垂线连到轴下的双向箭头标注线（draw-on 12 帧）+ 'Retrans' 灰字标注；
 *   上方时钟表盘（(520,340) r64，draw-on）：指针三段跳变 +30°/+60°/+120°（1+2+4 = 210° = 7 s），
 *   每次跳变白闪 + 落定后小幅抖动（紧张感）；轴刻度持续点亮。
 * 节拍：1218 轴 + 表盘 draw-on、1220 请求信封缩放入、1232 `t=0`；信封 1224/1281/1324 滑入 18 帧
 *   → 落位 1242/1299/1342：箭头 +2、大字计数 +8（14 帧）、垂线 +20；末 8 帧归零。
 * 停留：段内不判（片内最后一镜，G3 SC09 承接）。零 glitch（SC09 的 7 s 才是高光）。
 * 主角：间隔大字 + 信封组（阶梯大字橙光 = 当前重点）。
 */
const F0 = 1216;
const TO = 1396;
const T_AXIS = 1218, T_REQ = 1220, T_T0 = 1232;
const T_ENV = [1224, 1281, 1324];
const ENVX = [210, 370, 560];
const REQX = 80;
const AXIS = {x0: 40, x1: 620, y: 700};
const N_TICKS = 14;
const GAPS = [
  {x0: 118, x1: 172, v: 1, tArrow: 1244, tCount: 1250, tConn: 1262, cx: 135, cy: 643},
  {x0: 248, x1: 332, v: 2, tArrow: 1301, tCount: 1307, tConn: 1319, cx: 290, cy: 543},
  {x0: 408, x1: 522, v: 4, tArrow: 1344, tCount: 1350, tConn: 1362, cx: 465, cy: 443},
];
const CLOCK = {cx: 520, cy: 340, r: 64};
const LAND = [1242, 1299, 1342]; // = T_ENV[i]+18

const tri = (n: number, len = 6) => (n <= 0 || n >= len ? 0 : n < len / 2 ? n / (len / 2) : 1 - (n - len / 2) / (len / 2));

export const SC08: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const op = exitOp(N, TO, 8);
  const gk = glowOffK(N, TO, 6, 8);

  const axisP = clamp01((N - T_AXIS) / 16);
  const reqS = scaleIn(N - T_REQ, 12);

  // 指针：三段跳变（1s→+30°、2s→+60°、4s→+120°；累计 210° = 7 s）+ 小幅抖动
  const angDeg = kf(N, [[LAND[0], 0], [LAND[0] + 7, 30], [LAND[1], 30], [LAND[1] + 7, 90], [LAND[2], 90], [LAND[2] + 7, 210]], easeOutCubic) + 1.1 * Math.sin(N * 0.45);
  const ang = ((angDeg - 90) * Math.PI) / 180;
  const clockFlash = Math.max(tri(N - LAND[0], 6), tri(N - LAND[1], 6), tri(N - LAND[2], 6));
  const dialP = clamp01((N - T_AXIS) / 14);
  const clockOp = firstOp(N - T_AXIS, 8);

          {/* v2: 落点涟漪（每枚落位后 24 帧橙环扩散 — 可感知落位） */}
        {LAND.map((L, i) => {
          const rn = N - (L + 16);
          if (rn < 0 || rn >= 26) return null;
          const k = rn / 26;
          return (
            <svg key={`rip${i}`} width={220} height={160} viewBox="-110 -80 220 160" style={{position: 'absolute', left: ENVX[i] - 110, top: 700 - 80, overflow: 'visible', pointerEvents: 'none'}}>
              <ellipse cx={0} cy={0} rx={30 + 64 * k} ry={10 + 22 * k} fill="none" stroke={ORANGE} strokeWidth={3 * (1 - k)} opacity={(1 - k) * 0.9} />
            </svg>
          );
        })}
return (
    <div style={{position: 'absolute', inset: 0, opacity: op}}>
      {/* 时间轴 + 刻度持续点亮 */}
      <div style={{...abs(AXIS.x0, AXIS.y - 1.25, (AXIS.x1 - AXIS.x0) * axisP, 2.5), background: WHITE, opacity: 0.9, boxShadow: '0 0 8px rgba(255,255,255,.45)'}} />
      {Array.from({length: N_TICKS}, (_, i) => {
        const lit = N >= T_AXIS + i * 9;
        return <div key={i} style={{...abs(80 + i * 40 - 2, AXIS.y - 5, 4, 10), background: lit ? WHITE : GREY_LINE, boxShadow: lit ? '0 0 6px rgba(255,255,255,.5)' : undefined}} />;
      })}

      {/* 请求信封（紫）+ t=0 */}
      {N >= T_REQ ? (
        <div style={{position: 'absolute', inset: 0, opacity: firstOp(N - T_REQ, 6), transform: `translate(${REQX}px,${AXIS.y}px) scale(${reqS.toFixed(4)}) translate(${-REQX}px,${-AXIS.y}px)`}}>
          <PacketIcon cx={REQX} cy={AXIS.y} w={64} h={44} accent glow />
        </div>
      ) : null}
      <SoftIn N={N} f0={T_T0}>
        <CText cx={REQX} cy={AXIS.y + 62} size={22} weight={600} color={GREY}>t=0</CText>
      </SoftIn>

      {/* 3 枚重发信封（橙描边）+ Retrans 标注 */}
      {T_ENV.map((t, i) => {
        const tn = N - t;
        if (tn < 0) return null;
        const slide = powOutRemain(tn, 18, 2.5);
        const x = ENVX[i] - 130 * slide;
        const s = 0.86 + 0.14 * clamp01(tn / 18);
        const lFlash = tri(N - (t + 18), 5);
        return (
          <div key={i}>
            <div style={{position: 'absolute', inset: 0, opacity: fadeIn(tn, 6), filter: lFlash > 0 ? `brightness(${(1 + 0.65 * lFlash).toFixed(2)})` : undefined}}>
              <PacketIcon cx={x} cy={AXIS.y} w={64} h={44} color={ORANGE} scale={s} />
            </div>
            <SoftIn N={N} f0={t + 22}>
              <CText cx={ENVX[i]} cy={AXIS.y + 62} size={22} weight={600} color={GREY}>Retrans</CText>
            </SoftIn>
          </div>
        );
      })}

      {/* 间隔标注：双向箭头 + 大字计数 + 虚线垂线 */}
      {GAPS.map((g, i) => {
        const ap = clamp01((N - g.tArrow) / 12);
        const cn = N - g.tCount;
        const connP = clamp01((N - g.tConn) / 8);
        return (
          <div key={i}>
            {ap > 0 ? <DoubleArrow x0={g.x0} x1={g.x1} y={742} p={ap} color={WHITE} opacity={0.9} /> : null}
            {connP > 0 ? (
              <svg width={720} height={1280} viewBox="0 0 720 1280" style={{position: 'absolute', inset: 0, overflow: 'visible', pointerEvents: 'none'}}>
                <line x1={g.cx} y1={g.cy + 34} x2={g.cx} y2={g.cy + 34 + (728 - (g.cy + 34)) * connP} stroke={WHITE} strokeWidth={2} strokeDasharray="5 6" opacity={0.45} />
              </svg>
            ) : null}
            {cn >= 0 ? (
              <div style={{position: 'absolute', inset: 0, opacity: fadeIn(cn, 6) * gk}}>
                <CText
                  cx={g.cx}
                  cy={g.cy}
                  size={60}
                  weight={700}
                  family={FONT_ORB}
                  color={ORANGE}
                  letterSpacing={2}
                  shadow="0 0 26px rgba(240,95,65,.55), 0 0 8px rgba(240,95,65,.45)"
                  style={{fontVariantNumeric: 'tabular-nums'}}
                >
                  {`${countTo(cn, 0, g.v, 14)} s`}
                </CText>
              </div>
            ) : null}
          </div>
        );
      })}

      {/* 时钟表盘：draw-on + 指针三段跳变白闪 */}
      {clockOp > 0.01 ? (
        <div style={{position: 'absolute', inset: 0, opacity: clockOp, filter: clockFlash > 0 ? `brightness(${(1 + 0.7 * clockFlash).toFixed(2)})` : undefined}}>
          <svg width={CLOCK.r * 2} height={CLOCK.r * 2} viewBox={`0 0 ${CLOCK.r * 2} ${CLOCK.r * 2}`} style={{position: 'absolute', left: CLOCK.cx - CLOCK.r, top: CLOCK.cy - CLOCK.r, overflow: 'visible', filter: `drop-shadow(0 0 12px rgba(240,95,65,${(0.4 * gk).toFixed(2)}))`}}>
            <circle cx={CLOCK.r} cy={CLOCK.r} r={CLOCK.r - 3} fill="#000" stroke={WHITE} strokeWidth={3} strokeDasharray={2 * Math.PI * (CLOCK.r - 3)} strokeDashoffset={2 * Math.PI * (CLOCK.r - 3) * (1 - dialP)} transform={`rotate(-90 ${CLOCK.r} ${CLOCK.r})`} />
            {Array.from({length: 12}, (_, i) => {
              const a = (i / 12) * Math.PI * 2;
              return <circle key={i} cx={CLOCK.r + Math.cos(a) * (CLOCK.r - 12)} cy={CLOCK.r + Math.sin(a) * (CLOCK.r - 12)} r={i % 3 === 0 ? 3.4 : 2} fill={GREY} />;
            })}
            <line x1={CLOCK.r} y1={CLOCK.r} x2={CLOCK.r + Math.cos(ang) * (CLOCK.r - 16)} y2={CLOCK.r + Math.sin(ang) * (CLOCK.r - 16)} stroke={ORANGE} strokeWidth={5} strokeLinecap="round" style={clockFlash > 0 ? {filter: 'drop-shadow(0 0 8px rgba(240,95,65,.9))'} : undefined} />
            <circle cx={CLOCK.r} cy={CLOCK.r} r={4.5} fill={ORANGE} />
          </svg>
        </div>
      ) : null}
    </div>
  );
};
