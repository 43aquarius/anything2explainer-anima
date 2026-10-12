import React from 'react';
import {useCurrentFrame} from 'remotion';
import {clamp01, easeOutCubic, GlitchIn, emphasisPulse} from '../../common';
import {CameraRig} from '../../fx';
import {AirPulse, DeviceGlyph, RouterGlyph, CText, EXAMPLE, GREY, GREY_MID, PURPLE_LIGHT, WHITE, abs, softOp, exitOp, glowOffK, scaleIn, stagger} from '../../ui';

/**
 * SC03 一次一人（333–557）。S04–S05（¶章末镜头，停 557=C2-54）。
 * 节拍：341 你的设备们 / 423 在同一片空气里轮流 / 482 一次只有一人说话 / 524 这就是全部规则。
 * 中央路由器 + 环绕三台设备（笔记本/手机/电视），聚光灯轮换一圈（发言者紫弧，其余灰静默）。
 * 尾部硬规则：末拍（大字脉冲）≤ 512；exitOp(N, TO, 5) + glowOffK(N, TO, 3, 5)。
 */
const F0 = 333;
const TO = 557;

const HUB = {cx: 640, cy: 340};
const DEVS = [
  {cx: 380, cy: 210, kind: 'laptop' as const, label: 'your laptop'},
  {cx: 900, cy: 210, kind: 'phone' as const, label: 'your phone'},
  {cx: 640, cy: 550, kind: 'tv' as const, label: 'your TV'},
];

export const SC03: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const exit = exitOp(N, TO, 5);
  const gk = glowOffK(N, TO, 3, 5);

  // 三台设备错峰缩入（341+2f 错峰）
  const devIn = (i: number) => scaleIn(N - (341 + stagger(i, 3)), 14);
  // 连线 draw-on（423 起）
  const lineP = clamp01((N - 423) / 18);
  // 聚光灯轮换：482 起，每台亮 20f（A→B→C），524 后大字 + 三台微光呼吸
  const turn = N >= 482 ? Math.floor((N - 482) / 20) : -1;
  const active = Math.min(2, turn);
  const turnK = N >= 482 ? clamp01(((N - 482) % 20) / 6) : 0;
  // 末段呼吸（低幅）
  const breathe = N >= 524 ? 0.75 + 0.25 * Math.sin((N - 524) / 26) : 1;

  return (
    <CameraRig N={N} keys={[{f: F0, x: 640, y: 360, s: 1}, {f: 400, x: 640, y: 360, s: 1}, {f: 482, x: 640, y: 340, s: 1.06}]}>
      <div style={{...abs(0, 0, 1280, 720), opacity: exit}}>
        {/* 路由器 */}
        <div style={{...abs(0, 0, 1280, 720), opacity: softOp(N - 341, 10)}}>
          <RouterGlyph cx={HUB.cx} cy={HUB.cy} s={1.15} lit={gk > 0.2} glow label={EXAMPLE.router} />
        </div>
        {/* 连线（灰虚线 draw-on） */}
        <svg width={1280} height={720} viewBox="0 0 1280 720" style={{...abs(0, 0), overflow: 'visible'}}>
          {DEVS.map((d, i) => {
            const p = clamp01((lineP * 1.4) - i * 0.12);
            return <line key={i} x1={HUB.cx} y1={HUB.cy} x2={HUB.cx + (d.cx - HUB.cx) * p} y2={HUB.cy + (d.cy - HUB.cy) * p}
              stroke={GREY_MID} strokeWidth={2} strokeDasharray="8 8" opacity={0.65} />;
          })}
        </svg>
        {/* 三台设备（发言者亮紫弧，其余灰静默 + 耳图标闪） */}
        {DEVS.map((d, i) => {
          const talking = N >= 482 && i === active && N < 524;
          const dimK = N >= 482 && !talking ? 1 : 0;
          return (
            <div key={i} style={{...abs(0, 0, 1280, 720)}}>
              <div style={{...abs(0, 0, 1280, 720), transform: `scale(${devIn(i).toFixed(4)})`, transformOrigin: `${d.cx}px ${d.cy}px`}}>
                <DeviceGlyph cx={d.cx} cy={d.cy} kind={d.kind} w={i === 0 ? 150 : 130} h={i === 2 ? 110 : 110} dim={dimK > 0} label={d.label} labelSize={20} />
              </div>
              {talking ? (
                <div style={{...abs(0, 0, 1280, 720), opacity: turnK * gk}}>
                  <AirPulse cx={d.cx} cy={d.cy - 74} N={N} r={22} speed={14} arcs={3} maxR={130} color={PURPLE_LIGHT} glow />
                </div>
              ) : null}
              {N >= 482 && !talking && (N - 482) % 40 < 10 ? (
                <CText cx={d.cx} cy={d.cy - 84} size={20} weight={500} color={GREY_MID}>· ·</CText>
              ) : null}
            </div>
          );
        })}
        {/* 大字（524） */}
        {N >= 524 ? (
          <GlitchIn N={N} f0={524} rgbSplit={6} seed={11}>
            <div style={{...abs(0, 0, 1280, 720), opacity: gk * breathe}}>
              <CText cx={640} cy={120} size={46} weight={900} color={WHITE} letterSpacing={1}
                style={{WebkitTextStroke: '2.5px rgba(161,117,241,0.95)', paintOrder: 'stroke fill', textShadow: '0 0 18px rgba(102,48,248,.5)', transform: `scale(${emphasisPulse(N - 524, {peak: 1.08, up: 6, hold: 2, down: 6})})`}}>
                one talker at a time</CText>
            </div>
          </GlitchIn>
        ) : null}
      </div>
    </CameraRig>
  );
};
