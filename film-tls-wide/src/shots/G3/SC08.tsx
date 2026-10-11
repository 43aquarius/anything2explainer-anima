import React from 'react';
import {useCurrentFrame} from 'remotion';
import {GlitchIn, emphasisPulse, clamp01, FONT_ORB, FONT_MONO} from '../../common';
import {CText, MonoText, Svg, LockSeal, PacketIcon, ORANGE, GREY, WHITE, softOp, fadeIn, slideUp, scaleIn, exitOp, glowOffK} from '../../ui';
import {CameraRig} from '../../fx';
import {BrowserEnd, RackEnd, ArcPath, Envelope, qBez, tripPhase, type Pt} from './parts';

/**
 * SC08 一次往返 · N 1538–1668（S11 1546–1666：1546「锁之下 第一步」/ 1594「一次往返的握手」）
 * 画面：章首承接（左下角锁+信封缩微 0.4×）+ 水平双端（浏览器 0.45× / RackIcon 170px）+ 上下两条弧线箭头
 *       （去 ClientHello / 回 ServerHello）+ 两弧之间 RTT 括号线（`1-RTT` Orbitron 56 橙 + `one round trip` 灰）。
 * 节拍：1538 锁缩微承接淡入（首帧不空场）；1546/1548 双端 2 帧错峰（浏览器 slideUp Δ100 + 机架 21 帧缩放入）；
 *       1556/1560 弧线 draw-on（各 14 帧）；1576/1580 弧线标签 SoftIn；
 *       1594 括号 draw-on（16 帧）+ `1-RTT` GlitchIn（rgbSplit 4，本镜唯一 glitch）+ 橙光晕 + 1608 emphasisPulse；
 *       1596 起小信封沿上弧去（30 帧）/下弧回（24 帧）循环往返，每趟落位机架灯闪 2 下（持续动作）。
 * 运镜：1.0→1.05 慢推贯穿（1546–1662）。停留：段内不判（S11 非 ¶）。双端不随末 8 帧离场（SC09 同参数承接）。
 */
const F0 = 1538;
const TO = 1668;
// 弧线几何（上：浏览器→机架；下：机架→浏览器）
const UP: [Pt, Pt, Pt] = [[351, 372], [643, 258], [935, 372]];
const DN: [Pt, Pt, Pt] = [[935, 468], [643, 582], [351, 468]];

export const SC08: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const exOp = exitOp(N, TO, 8); // 末 8 帧归零（双端除外）
  // 双端入场（1546/1548 错峰）
  const bN = N - 1546;
  const rN = N - 1548;
  const browOp = softOp(bN, 8);
  const browDy = slideUp(bN, 100, 22);
  const rackS = scaleIn(rN, 21);
  // 弧线 + 括号
  const upP = clamp01((N - 1556) / 14);
  const dnP = clamp01((N - 1560) / 14);
  const pA = clamp01((N - 1594) / 8);
  const pB = clamp01((N - 1602) / 8);
  // 信封循环（54 帧一趟）+ 机架灯
  const trips = N - 1596;
  const ph = tripPhase(trips);
  const envPos = ph ? (ph[1] === 0 ? qBez(ph[0], UP[0], UP[1], UP[2]) : qBez(ph[0], DN[0], DN[1], DN[2])) : null;
  let lit = 0;
  if (trips >= 30) {
    lit = 1;
    const m = trips % 54;
    if (m >= 30 && m < 38) lit = (m - 30) % 4 < 2 ? 3 : 1;
  }
  const pulse = emphasisPulse(N - 1608, {peak: 1.11});
  const gk = glowOffK(N, TO, 6, 8);

  return (
    <CameraRig N={N} keys={[{f: 1546, x: 640, y: 360, s: 1}, {f: 1662, x: 640, y: 360, s: 1.05}]}>
      {/* 章首承接：左下角锁 + 信封缩微（0.4×） */}
      <div style={{position: 'absolute', inset: 0, opacity: softOp(N - F0, 6) * 0.82 * exOp}}>
        <LockSeal cx={120} cy={548} w={48} h={60} />
        <PacketIcon cx={172} cy={550} w={40} h={27} />
      </div>

      {/* 双端（不随末 8 帧离场——SC09 首帧同参数承接） */}
      <div style={{position: 'absolute', inset: 0, opacity: browOp, transform: browDy ? `translateY(${browDy.toFixed(1)}px)` : undefined}}>
        <BrowserEnd x={140} y={328} s={0.45} />
      </div>
      {rN >= 0 ? (
        <div style={{position: 'absolute', inset: 0, transform: `scale(${rackS.toFixed(4)})`, transformOrigin: '985px 408px'}}>
          <RackEnd cx={985} cy={408} w={100} h={170} units={5} lit={lit} labelOp={softOp(rN, 10)} />
        </div>
      ) : null}

      {/* 弧线 + 弧线标签 */}
      <Svg opacity={exOp}>
        <ArcPath p0={UP[0]} c={UP[1]} p1={UP[2]} p={upP} />
        <ArcPath p0={DN[0]} c={DN[1]} p1={DN[2]} p={dnP} />
      </Svg>
      <div style={{position: 'absolute', inset: 0, opacity: exOp}}>
        <MonoText x={588} y={281} size={22} color={GREY} opacity={softOp(N - 1576, 8)}>ClientHello</MonoText>
        <MonoText x={587} y={545} size={22} color={GREY} opacity={softOp(N - 1580, 8)}>ServerHello</MonoText>
      </div>

      {/* RTT 括号（两段线 + 端刻度） */}
      <Svg opacity={exOp}>
        <line x1={640} y1={318} x2={640} y2={318 + 40 * pA} stroke={WHITE} strokeWidth={2.5} strokeLinecap="round" />
        <line x1={640} y1={528} x2={640} y2={528 - 72 * pB} stroke={WHITE} strokeWidth={2.5} strokeLinecap="round" />
        <line x1={626} y1={318} x2={654} y2={318} stroke={WHITE} strokeWidth={2.5} strokeLinecap="round" opacity={pA > 0.3 ? 1 : 0} />
        <line x1={626} y1={528} x2={654} y2={528} stroke={WHITE} strokeWidth={2.5} strokeLinecap="round" opacity={pB > 0.6 ? 1 : 0} />
      </Svg>

      {/* `1-RTT`（glitch 重点词，本镜唯一）+ one round trip */}
      <GlitchIn N={N} f0={1594} rgbSplit={4} seed={11} style={{opacity: exOp}}>
        <div style={{position: 'absolute', inset: 0, transformOrigin: '640px 396px', transform: pulse === 1 ? undefined : `scale(${pulse.toFixed(4)})`}}>
          <CText cx={640} cy={396} size={56} weight={700} family={FONT_ORB} color={ORANGE} letterSpacing={2}
            shadow={`0 0 ${(28 * gk).toFixed(0)}px rgba(240,95,65,${(0.75 * gk).toFixed(3)}), 0 0 ${(64 * gk).toFixed(0)}px rgba(240,95,65,${(0.3 * gk).toFixed(3)})`}
            style={{fontVariantNumeric: 'tabular-nums'}}>1-RTT</CText>
        </div>
      </GlitchIn>
      <CText cx={640} cy={442} size={22} weight={600} color={GREY} opacity={softOp(N - 1602, 8) * exOp}>one round trip</CText>

      {/* 往返的小信封（去程上弧 / 回程下弧） */}
      {envPos && exOp > 0.02 ? (
        <Envelope cx={envPos[0]} cy={envPos[1]} tilt={ph![1] === 0 ? 6 : -6} opacity={fadeIn(trips, 6) * exOp} />
      ) : null}
    </CameraRig>
  );
};
