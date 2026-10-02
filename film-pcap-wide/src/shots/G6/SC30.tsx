import React from 'react';
import {useCurrentFrame} from 'remotion';
import {clamp01, easeOutCubic, kf, powIn} from '../../common';
import {CText, PacketIcon, GREY, GREY_LINE, ORANGE, PURPLE, PURPLE_LIGHT, WHITE, abs, fadeIn, firstOp, exitOp, SoftIn} from '../../ui';

/**
 * SC30 请求飞出，响应没来 · N 6772–6889（S39 6780–6887：6780 请求立刻出去 / 6845 响应没到）
 * 版式：水平时间轴（y 380，x 200–1080，左端 t=0）；紫色请求信封 kf 12 帧（powIn 加速度感）飞到 x 640 落点（轴上紫点脉冲）；
 *   右侧响应等待区（虚线框 240×140 @ (860,380)）保持空 + 橙色等待光标左右往返扫描（全镜持续）+ 框上 `...` 三点逐个淡入；
 *   轴上刻度从左到右每 6 帧亮一格（持续）。
 * 零 glitch（白名单）。停留：段内不判（S39 非 ¶）。末 8 帧归零（未解的张力）。
 * 主角：请求信封（150×100 紫accent+glow）+ 等待区组；光 = 信封紫光 / 等待光标橙光。
 */
const F0 = 6772, TO = 6889;
const T_AXIS = 6774, T_FLY = 6780, T_LAND = 6792, T_WAIT = 6845;
const AXIS = {x0: 200, x1: 1080, y: 380};
const ENV = {w: 150, h: 100, cy: 330, x0: 230, x1: 640};
const ZONE = {x: 740, y: 310, w: 240, h: 140};
const N_TICKS = 15;
const triWave = (t: number) => {
  const u = ((t % 2) + 2) % 2;
  return u < 1 ? u : 2 - u;
};

export const SC30: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const op = exitOp(N, TO, 8);
  // 轴 wipe（14 帧）+ 刻度逐格点亮
  const axisP = easeOutCubic(clamp01((N - T_AXIS) / 14));
  // 信封飞行：powIn 2.2 → 加速度感
  const ex = kf(N, [[T_FLY, ENV.x0], [T_LAND, ENV.x1]], powIn(2.2));
  const landed = N >= T_LAND;
  // 落点紫点脉冲（一次）+ 常驻小点
  const pk = clamp01((N - T_LAND) / 12);
  // 等待区 draw-on（18 帧 clip 自左）
  const zp = easeOutCubic(clamp01((N - T_WAIT) / 18));
  // 橙色等待光标：框内左右往返（56 帧一个来回，全镜持续）
  const cn = N - (T_WAIT + 4);
  const curX = 778 + 172 * triWave(cn / 56);
  return (
    <div style={{position: 'absolute', inset: 0, opacity: op}}>
      {/* 时间轴 */}
      {axisP > 0 ? <div style={{...abs(AXIS.x0, AXIS.y - 1.5, (AXIS.x1 - AXIS.x0) * axisP, 3), background: WHITE, opacity: 0.85, boxShadow: '0 0 6px rgba(255,255,255,.4)'}} /> : null}
      {Array.from({length: N_TICKS}, (_, i) => {
        const lit = N >= T_FLY + i * 6;
        const tx = 240 + i * 60;
        return <div key={i} style={{...abs(tx - 2, AXIS.y - 7, 4, 14), background: lit ? WHITE : GREY_LINE, boxShadow: lit ? '0 0 6px rgba(255,255,255,.5)' : undefined}} />;
      })}
      <SoftIn N={N} f0={T_AXIS}>
        <CText cx={AXIS.x0 + 26} cy={AXIS.y + 30} size={22} weight={600} family="'SF Mono', Menlo, Consolas, monospace" color={GREY}>t=0</CText>
      </SoftIn>
      {/* 请求信封（紫，飞到轴中段） */}
      <div style={{position: 'absolute', inset: 0, opacity: firstOp(N - T_FLY, 6)}}>
        <PacketIcon cx={ex} cy={ENV.cy} w={ENV.w} h={ENV.h} accent glow />
        <CText cx={ENV.x1} cy={ENV.cy - 78} size={22} weight={600} color={GREY} opacity={fadeIn(N - T_FLY, 8)}>request</CText>
      </div>
      {/* 落点紫点 + 脉冲环 */}
      {landed ? (
        <>
          <div style={{...abs(ENV.x1 - 5, AXIS.y - 5, 10, 10), borderRadius: 5, background: PURPLE_LIGHT, boxShadow: '0 0 12px 3px rgba(161,117,241,.7)'}} />
          {pk < 1 ? (
            <div style={{...abs(ENV.x1 - 4 - 16 * pk, AXIS.y - 4 - 16 * pk, 8 + 32 * pk, 8 + 32 * pk), borderRadius: '50%', border: `2.5px solid ${PURPLE_LIGHT}`, opacity: (1 - pk) * 0.9}} />
          ) : null}
        </>
      ) : null}
      {/* 响应等待区（虚线框，draw-on） */}
      {zp > 0 ? (
        <div style={{...abs(ZONE.x, ZONE.y, ZONE.w, ZONE.h), opacity: 0.95, clipPath: `inset(0 ${((1 - zp) * 100).toFixed(2)}% 0 0)`}}>
          <div style={{position: 'absolute', inset: 0, border: `3px dashed ${WHITE}`, borderRadius: 8, opacity: 0.75}} />
        </div>
      ) : null}
      {/* 等待光标（橙，左右往返扫描 = 持续动作） */}
      {cn >= 0 ? (
        <div style={{...abs(curX - 6, ZONE.y + 16, 12, ZONE.h - 32), borderRadius: 6, background: ORANGE, boxShadow: '0 0 26px 6px rgba(240,95,65,.65), 0 0 8px rgba(240,95,65,.8)'}}>
          <div style={{position: 'absolute', left: 4.5, top: 8, width: 3, height: ZONE.h - 48, background: WHITE, borderRadius: 2, opacity: 0.9}} />
        </div>
      ) : null}
      {/* `...` 三点（逐个淡入） */}
      {[0, 1, 2].map((i) => {
        const dn = N - (T_WAIT + 8 + i * 8);
        if (dn < 0) return null;
        return <div key={i} style={{...abs(ZONE.x + 76 + i * 44, 282, 12, 12), borderRadius: 6, background: WHITE, opacity: fadeIn(dn, 8) * 0.85, boxShadow: '0 0 8px rgba(255,255,255,.4)'}} />;
      })}
    </div>
  );
};
