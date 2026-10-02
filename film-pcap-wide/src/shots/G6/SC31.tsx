import React from 'react';
import {useCurrentFrame} from 'remotion';
import {clamp01, easeOutCubic, kf, FONT_MONO, FONT_ORB, powOutRemain} from '../../common';
import {ClockIcon, CText, PacketIcon, GREY, GREY_LINE, ORANGE, WHITE, abs, fadeIn, firstOp, exitOp, SoftIn} from '../../ui';
import {CameraRig, countTo} from '../../fx';
import {DoubleArrow} from './g6ui';

/**
 * SC31 一秒，两秒，四秒 · N 6890–7096（S40 6898–7094：6898 一遍又一遍重发 / 6982 间隔翻倍 / 7024 1 秒 2 秒 4 秒）
 * 版式：时间轴放大主视觉（x 160–1120，y 380）：紫请求信封 @x300 → 三枚橙描边重发信封依次滑入落位
 *   x 560/760/1060（间隔 20 帧节奏，各 18 帧），各带 Retrans 小黑旗；两两之间双向箭头标注线（draw-on 12 帧）
 *   + 间隔大字 `1 s` `2 s` `4 s`（Orbitron 64 橙，数字 14 帧计数 0→1/0→2/0→4）；轴刻度持续点亮 + watch 时钟秒针快转（持续）。
 * 运镜：7024–7057 33 帧 1→1.22 推向右侧（间隔变大方向）。零 glitch（本镜 glitch 留给 SC33）。
 * 停留：段内不判（S40 非 ¶）。末 8 帧归零。主角：间隔大字 + 重发信封组；光 = 大字橙光。
 */
const F0 = 6890, TO = 7096;
const T_REQ = 6892;
const T_ENV = [6898, 6982, 7002]; // 三枚重发滑入（各 18 帧 → 落位 6916/7000/7020）
const ENVX = [560, 760, 1060];
const REQX = 300;
const GAPS = [
  {x0: 330, x1: 530, v: 1, tArrow: 6918, tCount: 6932},
  {x0: 590, x1: 730, v: 2, tArrow: 7002, tCount: 7016},
  {x0: 790, x1: 1030, v: 4, tArrow: 7022, tCount: 7036},
];
const T_CLOCK = 7020;
// 运镜 7021–7053（32 帧 1→1.22，节拍 −3 容差内提前起）；离场 exitOp len 6（7090 起）：稳定期 7054–7089 = 36 帧 − 灭光 6 = 30 ≥30（motion_check v3）
const CAM_KEYS = [
  {f: 7021, x: 640, y: 360, s: 1},
  {f: 7053, x: 900, y: 440, s: 1.22},
];
const AXIS = {x0: 160, x1: 1120, y: 380};
const N_TICKS = 20;

export const SC31: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const op = exitOp(N, TO, 6);
  return (
    <div style={{position: 'absolute', inset: 0, opacity: op}}>
      <CameraRig N={N} keys={CAM_KEYS}>
        {/* 时间轴（主视觉）+ 刻度持续点亮 */}
        <div style={{...abs(AXIS.x0, AXIS.y - 1.5, AXIS.x1 - AXIS.x0, 3), background: WHITE, opacity: 0.9, boxShadow: '0 0 8px rgba(255,255,255,.45)'}} />
        {Array.from({length: N_TICKS}, (_, i) => {
          const lit = N >= T_ENV[0] + i * 5;
          return <div key={i} style={{...abs(180 + i * 48 - 2, AXIS.y - 6, 4, 12), background: lit ? WHITE : GREY_LINE, boxShadow: lit ? '0 0 6px rgba(255,255,255,.5)' : undefined}} />;
        })}
        <SoftIn N={N} f0={T_REQ}>
          <CText cx={AXIS.x0 + 22} cy={AXIS.y + 28} size={22} weight={600} family={FONT_MONO} color={GREY}>t=0</CText>
        </SoftIn>
        {/* 请求信封（紫） */}
        <div style={{position: 'absolute', inset: 0, opacity: firstOp(N - T_REQ, 6)}}>
          <PacketIcon cx={REQX} cy={AXIS.y} w={96} h={66} accent glow />
        </div>
        {/* 三枚重发信封（橙描边 + Retrans 黑旗） */}
        {ENVX.map((exf, i) => {
          const tn = N - T_ENV[i];
          if (tn < 0) return null;
          const slide = powOutRemain(tn, 18, 2.5); // 1 → 0
          const x = exf - 150 * slide;
          const s = 0.86 + 0.14 * clamp01(tn / 18);
          const fn = N - (T_ENV[i] + 18); // 旗弹出
          const fs = fn < 0 ? 0 : 0.5 + 0.5 * easeOutCubic(clamp01(fn / 6));
          return (
            <div key={i}>
              <div style={{position: 'absolute', inset: 0, opacity: fadeIn(tn, 6)}}>
                <PacketIcon cx={x} cy={AXIS.y} w={96} h={66} color={ORANGE} scale={s} />
              </div>
              {/* 黑旗：杆 + Retrans 标签 */}
              {fs > 0 ? (
                <div style={{position: 'absolute', inset: 0, opacity: fadeIn(fn, 4)}}>
                  <div style={{...abs(exf - 1, 288, 2.5, 60), background: WHITE, opacity: 0.85}} />
                  <div style={{...abs(exf + 1, 282, 98 * fs, 32 * fs), background: '#000', border: `2px solid ${WHITE}`, borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', transformOrigin: 'left center', boxShadow: '0 0 10px rgba(0,0,0,.6)'}}>
                    <span style={{fontFamily: FONT_MONO, fontSize: 22, color: WHITE, lineHeight: 1, whiteSpace: 'nowrap'}}>Retrans</span>
                  </div>
                </div>
              ) : null}
            </div>
          );
        })}
        {/* 间隔标注：双向箭头（draw-on 12 帧）+ 大字计数（14 帧） */}
        {GAPS.map((g, i) => {
          const ap = clamp01((N - g.tArrow) / 12);
          const cn = N - g.tCount;
          return (
            <div key={i}>
              {ap > 0 ? <DoubleArrow x0={g.x0} x1={g.x1} y={462} p={ap} color={WHITE} opacity={0.9} /> : null}
              {cn >= 0 ? (
                <div style={{position: 'absolute', inset: 0, opacity: fadeIn(cn, 6)}}>
                  <CText
                    cx={(g.x0 + g.x1) / 2}
                    cy={540}
                    size={64}
                    weight={800}
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
        {/* watch 时钟（秒针 3 倍速快转 = 持续动作） */}
        <SoftIn N={N} f0={T_CLOCK}>
          <ClockIcon cx={1150} cy={195} r={54} N={N * 3} accent={ORANGE} />
        </SoftIn>
      </CameraRig>
    </div>
  );
};
