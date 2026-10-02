import React from 'react';
import {useCurrentFrame} from 'remotion';
import {clamp01, easeInOutPow, easeOutCubic, FONT_MONO, powOutRemain} from '../../common';
import {PacketIcon, BrowserMock, RackIcon, GREY, GREY_MID, WHITE, abs, firstOp, softOp, exitOp} from '../../ui';
import {HeroGlow} from '../../fx';
import {EXAMPLE} from '../../ui';

/**
 * SC04 线路上是信封流 · N 483–715（S04 491–583 + S05 594–713：491「you have to see」/ 532「network actually carried」/ 594「travels as packets」/ 669「small envelopes」）
 * 承接：SC03 的连线（首帧 483 firstOp 淡入，仍是带缺口的 380–610/670–825）484–506 展开为全幅线路（外端到 x60/x1220，缺口 494 前闭合）；
 * 节拍：496–528 一颗白光点带紫辉沿线路自左扫到右（起点在线路左端上，不悬空）；
 *       532 通道 wipe 展开 20 帧（y300–420 带 + 上下 2px 界线自中心向两外，界线随展开骑带边）；
 *       536/549 左右端点小字 SoftIn（左 shop.example，右 203.0.113.10，等宽 22 灰）；
 *       594 首批信封 2 帧错峰自左滑入（90px 偏移 16 帧），整列 3.5px/帧持续右移（tape 环带模型：出右端淡出、绕回左端淡入，画面上始终 7–8 枚）；
 *       669 第 k=2 枚信封 16 帧放大到中央 (640,360) 110×76 + GLOW 紫点亮（讲解主角），其余继续流动；
 *       707–715 通道/界线/端点字/流动信封归零淡出——**放大信封不离场**，SC05 以同尺寸同位置承接。
 * 持续：信封流全镜右移。停留：段内不判（S05 非 ¶）。主角：放大信封 110px（带 HeroGlow）+ 通道带。零 glitch。
 */
const F0 = 483;
const T_WIRE = 484;
const T_SWEEP = 496;
const T_CHANNEL = 532;
const T_ENV = 594;
const T_HERO = 669;
const TO = 715;
const SPEED = 3.5;
const SPACING = 150;
const LOOP = SPACING * 9; // 环带周期（9 枚间隔，保证初始排布 100–1300 不折回）
/** 与 SC03 落位一致的线段起点（含缺口） */
const WIRE0 = {l0: 380, l1: 610, r0: 825, r1: 670};
/** 放大信封的终点尺寸（SC05 首帧同参承接） */
export const HERO_END = {cx: 640, cy: 360, w: 240, h: 165}; // v2: 110→240（主角 ≥170px，QC v1 高空场修复）

export const SC04: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const op = exitOp(N, TO, 8);
  // 线路展开：22 帧 easeOutCubic，缺口前半段闭合
  const ep = easeOutCubic(clamp01((N - T_WIRE) / 22));
  const L = WIRE0.l0 + (60 - WIRE0.l0) * ep;
  const R = WIRE0.r0 + (1220 - WIRE0.r0) * ep;
  const closeK = clamp01(ep / 0.55);
  const gapL = WIRE0.l1 + (640 - WIRE0.l1) * closeK;
  const gapR = WIRE0.r1 + (640 - WIRE0.r1) * closeK;
  const merged = gapL >= gapR - 1;
  // 通道展开：20 帧（带自 y360 上下张开，界线骑带边）
  const cp = easeOutCubic(clamp01((N - T_CHANNEL) / 20));
  const bandY = 360 - 60 * cp, bandH = 120 * cp;
  const lineW = 1160 * cp, lineL = 640 - lineW / 2;
  // 信封 tape：k=2 在 669 脱离成为放大主角
  const heroE = easeInOutPow(2.5)(clamp01((N - T_HERO) / 16));
  const heroX0 = 100 + SPACING * 2 + SPEED * (T_HERO - T_ENV); // 662.5：脱离瞬间的位置
  const hx = heroX0 + (HERO_END.cx - heroX0) * heroE;
  const hw = 84 + (HERO_END.w - 84) * heroE;
  const hh = 58 + (HERO_END.h - 58) * heroE;
  const heroK = clamp01((N - (T_HERO + 8)) / 8);
  // 信封 tape（首尾相接的环带，LOOP = 9×SPACING 保证初始排布不折回；出右端淡出、绕回左端淡入）
  const envs: React.ReactNode[] = [];
  for (let k = 0; k <= 8; k++) {
    if (k === 2 && N >= T_HERO) continue; // 由主角信封接管
    const pRaw = 40 + SPACING * k + SPEED * (N - T_ENV);
    const p = ((pRaw % LOOP) + LOOP) % LOOP + 60; // 60–1410 环带，可视段 60–1220
    let eop: number, slide = 0;
    // 首批：2 帧错峰滑入 + 8 帧淡入（16 帧后 slide 归零，不影响后续绕环）
    eop = softOp(N - (T_ENV + 2 * k), 8);
    slide = 90 * powOutRemain(N - (T_ENV + 2 * k), 16, 2.5);
    eop *= clamp01((p - 60) / 40) * clamp01((1220 - p) / 50); // 两端渐隐
    if (eop <= 0.01) continue;
    envs.push(<PacketIcon key={k} cx={p - slide} cy={360} w={84} h={58} opacity={eop} />);
  }
  return (
    <div style={{position: 'absolute', inset: 0}}>
      {/* 放大信封（主角，不离场——SC05 承接） */}
      {N >= T_HERO ? (
        <>
          <HeroGlow x={hx - hw / 2} y={360 - hh / 2} w={hw} h={hh} r={8} N={N} k={heroK} />
          <PacketIcon cx={hx} cy={360} w={hw} h={hh} />
        </>
      ) : null}
      {/* 其余元素（离场组） */}
      <div style={{position: 'absolute', inset: 0, opacity: op}}>
        {/* 线路（承接 SC03，含缺口 → 闭合 → 全幅） */}
        {N >= F0 ? (
          <div style={{position: 'absolute', inset: 0, opacity: firstOp(N - F0, 5)}}>
            <div style={{...abs(L, 358.5, (merged ? R : gapL) - L, 3), background: WHITE, boxShadow: '0 0 6px rgba(255,255,255,.5)'}} />
            {!merged ? <div style={{...abs(gapR, 358.5, R - gapR, 3), background: WHITE, boxShadow: '0 0 6px rgba(255,255,255,.5)'}} /> : null}
          </div>
        ) : null}
        {/* 扫视光点（"you have to see"） */}
        {N >= T_SWEEP && N <= T_SWEEP + 32 ? (
          <div style={{...abs(0, 0), position: 'absolute'}}>
            <div
              style={{
                position: 'absolute',
                left: 140 + 1080 * clamp01((N - T_SWEEP) / 32) - 60,
                top: 352,
                width: 60,
                height: 16,
                borderRadius: 8,
                background: 'linear-gradient(90deg, rgba(161,117,241,0), rgba(255,255,255,.75))',
                filter: 'blur(0px)',
              }}
            />
            <div style={{position: 'absolute', left: 140 + 1080 * clamp01((N - T_SWEEP) / 32) - 8, top: 352, width: 16, height: 16, borderRadius: 9, background: WHITE, boxShadow: '0 0 14px 4px rgba(161,117,241,.9), 0 0 22px 6px rgba(255,255,255,.55)'}} />
          </div>
        ) : null}
        {/* 通道带 */}
        {cp > 0 ? (
          <>
            <div style={{...abs(60, bandY, 1160, bandH), background: 'rgba(0,0,0,0.42)', opacity: clamp01((N - T_CHANNEL) / 10)}} />
            <div style={{...abs(lineL, 300 - 1, lineW, 2), background: WHITE, opacity: 0.95}} />
            <div style={{...abs(lineL, 420 - 1, lineW, 2), background: WHITE, opacity: 0.95}} />
          </>
        ) : null}
        {/* 端点节点（v2 QC 修复：文字端点升级为图形节点 ≥130px，497 起缩放入，消除 483–669 主体 <110px 空场） */}
        {(() => {
          const nn = N - 497;
          if (nn < 0) return null;
          const sc = 0.55 + 0.45 * (1 - Math.pow(1 - clamp01(nn / 21), 3));
          return (
            <div style={{position: 'absolute', inset: 0, opacity: softOp(nn, 8)}}>
              <div style={{position: 'absolute', left: 70, top: 250, transform: `scale(${sc.toFixed(4)})`, transformOrigin: '120px 80px'}}>
                <BrowserMock x={0} y={0} w={240} h={180} url={EXAMPLE.url.split('/')[0]} skeleton={2} progress={1} />
              </div>
              <div style={{position: 'absolute', left: 1000, top: 236, transform: `scale(${sc.toFixed(4)})`, transformOrigin: '110px 95px'}}>
                <RackIcon cx={110} cy={95} w={150} h={190} lit={2} label={EXAMPLE.serverIp} labelSize={22} />
              </div>
            </div>
          );
        })()}
        {/* 流动信封（在主角之下） */}
        {envs}
      </div>
    </div>
  );
};
