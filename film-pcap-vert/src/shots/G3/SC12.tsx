import React from 'react';
import {useCurrentFrame} from 'remotion';
import {clamp01, easeOutCubic, FONT_MONO, FONT_ORB} from '../../common';
import {abs, Box, CText, GREY, GREY_LINE, GREY_LIGHT, LogCard, ORANGE, Pill, PURPLE, PURPLE_LIGHT, WHITE, exitOp, firstOp, scaleIn, SoftIn} from '../../ui';
import {HaloRing} from '../../fx';
import {tri} from './g3ui';

/**
 * SC12 相信 vs 发生 · N 1853–1988（S13 1861–1919 日志=相信 / S14 1930–1986 抓包=发生）
 * 版式：竖排两卡（各 500×240）：上 = 日志卡 0.5× 缩微 + 灰标签 believed + 思考气泡（? + EXAMPLE.logLine
 *   打字机循环）；下 = pcap 文件图标（折角 + 文本线条，首行紫）+ 紫标签 happened + HaloRing 小型
 *   draw-on 20 帧 + mini 时间轴条逐格点亮；中间 `≠` 白 56px + 两卡 1.05 微脉冲对撞（12 帧错峰）。
 * 节拍：1861 上卡 slideUp + believed；1873 气泡浮现 + 打字机（持续）；1930 下卡 slideIn + happened +
 *   图标缩放入位；1938 时间轴条逐格点亮（持续）；1946 HaloRing draw-on + ≠ 缩放入；1950/1962 对撞脉冲。
 * 停留：段内不判（片末镜承接）。末 8 帧归零。零 glitch（白名单 SC12 无）。
 * 主角：下卡 pcap 图标（+ HaloRing）；两卡各 240px 高。
 */
const F0 = 1853, TO = 1988;
const T_TOP = 1861, T_BUB = 1873, T_BOT = 1930, T_STRIP = 1938, T_HALO = 1946, T_BUMP = 1950;
const CARD_W = 500, CARD_H = 240;
const LP = {x: 110, y: 330}; // 上卡
const RP = {x: 110, y: 640}; // 下卡
const BUB = {x: 170, y: 258, w: 400, h: 64};
const LOG1 = 'POST /checkout 200 \u00b7 ';
const LOG2 = '60 ms';
const DOC = {x: 215, y: 688, w: 120, h: 140};
const HALO = {cx: 275, cy: 826, rxo: 120, ryo: 22, rxi: 82, ryi: 12};
const STRIP = {x: 365, y: 742, w: 230, h: 24, cells: 10};

/** 气泡内日志行打字机：type 52 帧 → hold 30 → 空 8 → 重打（周期 90） */
const typed = (N: number) => {
  const c = Math.max(0, N - T_BUB) % 90;
  return c < 52 ? Math.floor(c / 2) : c < 82 ? LOG1.length + LOG2.length : 0;
};

export const SC12: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const op = exitOp(N, TO, 8);
  // 上/下卡入场（slideUp Δ80 / 18 帧）
  const pl = clamp01((N - T_TOP) / 18);
  const pr = clamp01((N - T_BOT) / 18);
  // 下卡内容缩放入位 + 虚线→实线（此处直接实线）
  const rcN = N - T_BOT;
  const rcS = rcN < 0 ? 0 : 0.4 + 0.6 * scaleIn(rcN);
  // ≠ 与光环
  const neqN = N - T_HALO;
  const haloP = easeOutCubic(clamp01((N - T_HALO) / 20));
  const haloFill = clamp01((N - (T_HALO + 8)) / 12) * Math.max(0, 1 - (N - (TO - 13)) / 6);
  const phase = Math.floor(Math.max(0, N - T_HALO) / 2) * 5;
  // 微脉冲对撞（上先下后，12 帧错峰）
  const bumpT = tri(N - T_BUMP, 12);
  const bumpB = tri(N - T_BUMP - 12, 12);
  // 时间轴逐格点亮 + 白游标循环
  const stripN = N - T_STRIP;
  const hi = stripN > 0 ? Math.floor(stripN / 5) % STRIP.cells : -1;
  const shown = typed(N);
  return (
    <div style={{position: 'absolute', inset: 0, opacity: op}}>
      {/* ===== 上卡（believed）===== */}
      <div style={{position: 'absolute', inset: 0, opacity: firstOp(N - T_TOP, 8), transform: `translateY(${((80 * Math.pow(1 - pl, 2.2)) + 8 * bumpT).toFixed(2)}px) scale(${(1 + 0.05 * bumpT).toFixed(4)})`, transformOrigin: '360px 450px'}}>
        <Box x={LP.x} y={LP.y} w={CARD_W} h={CARD_H} r={14} sw={2.5} />
        {/* 日志卡 0.5× 缩微（可读的日志行在气泡里） */}
        {N >= T_TOP + 8 ? (
          <div style={{position: 'absolute', inset: 0, opacity: clamp01((N - (T_TOP + 8)) / 10)}}>
            <div style={{position: 'absolute', left: LP.x + 35, top: LP.y + 68, width: 300, height: 160, transform: 'scale(0.5)', transformOrigin: '0 0', opacity: 0.95}}>
              <LogCard x={0} y={0} w={600} h={320} rows={4} highlight={3} dim />
            </div>
          </div>
        ) : null}
        {/* believed 灰标签 */}
        <SoftIn N={N} f0={T_TOP + 2}>
          <Pill x={LP.x + 20} y={LP.y + 14} w={160} h={40} sw={2} stroke={GREY} fill="#000" text="believed" fontSize={26} weight={700} color={GREY} textDy={0} />
        </SoftIn>
      </div>
      {/* 思考气泡（在上卡之上、believed 之右；打字机持续） */}
      {N >= T_BUB ? (
        <div style={{position: 'absolute', inset: 0, opacity: clamp01((N - T_BUB) / 10), transform: `scale(${(0.7 + 0.3 * (1 - Math.pow(1 - clamp01((N - T_BUB) / 14), 3))).toFixed(4)})`, transformOrigin: '360px 330px'}}>
          <div style={{...abs(BUB.x, BUB.y, BUB.w, BUB.h), background: '#000', border: `2.5px solid ${GREY}`, borderRadius: 32}} />
          <CText cx={BUB.x + 26} cy={BUB.y + BUB.h / 2} size={32} weight={700} family={FONT_ORB} color={GREY} dy={0}>?</CText>
          <div style={{position: 'absolute', left: BUB.x + 52, top: BUB.y + 20, fontFamily: FONT_MONO, fontSize: 22, lineHeight: 1.3, whiteSpace: 'nowrap', display: 'flex'}}>
            <span style={{color: GREY_LIGHT}}>{LOG1.slice(0, shown)}</span>
            {shown > LOG1.length ? <span style={{color: ORANGE}}>{LOG2.slice(0, shown - LOG1.length)}</span> : null}
          </div>
          {/* 气泡 trail 小圆（连向上卡日志） */}
          <div style={{...abs(292, BUB.y + BUB.h + 8, 15, 15), borderRadius: 8, background: '#000', border: `2px solid ${GREY}`}} />
          <div style={{...abs(320, BUB.y + BUB.h + 30, 10, 10), borderRadius: 6, background: '#000', border: `2px solid ${GREY}`}} />
        </div>
      ) : null}
      {/* ===== ≠（两卡之间）===== */}
      {neqN >= 0 ? (
        <div style={{position: 'absolute', inset: 0, transform: `scale(${(0.4 + 0.6 * scaleIn(neqN)).toFixed(4)})`, transformOrigin: '360px 605px'}}>
          <CText cx={360} cy={605} size={56} weight={900} color={WHITE} shadow="0 0 18px rgba(255,255,255,.35)">&ne;</CText>
        </div>
      ) : null}
      {/* ===== 下卡（happened）===== */}
      <div style={{position: 'absolute', inset: 0, opacity: firstOp(N - T_BOT, 8), transform: `translateY(${((80 * Math.pow(1 - pr, 2.2)) - 8 * bumpB).toFixed(2)}px) scale(${(1 + 0.05 * bumpB).toFixed(4)})`, transformOrigin: '360px 760px'}}>
        <Box x={RP.x} y={RP.y} w={CARD_W} h={CARD_H} r={14} sw={2.5} />
        {rcN >= 0 ? (
          <div style={{position: 'absolute', inset: 0, opacity: clamp01(rcN / 8)}}>
            {/* 光环后半（图标之后） */}
            <HaloRing cx={HALO.cx} cy={HALO.cy} rxo={HALO.rxo} ryo={HALO.ryo} rxi={HALO.rxi} ryi={HALO.ryi} p={haloP} fillOp={haloFill * 0.9} phase={phase} half="back" />
            {/* pcap 文件图标（DocIcon 风：折角 + 文本线条，首行紫） */}
            <div style={{position: 'absolute', inset: 0, transform: `scale(${rcS.toFixed(4)})`, transformOrigin: '275px 758px'}}>
              <div style={{...abs(DOC.x, DOC.y, DOC.w, DOC.h)}}>
                <svg width={DOC.w} height={DOC.h} viewBox={`0 0 ${DOC.w} ${DOC.h}`} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible', filter: 'drop-shadow(0 0 2px rgba(255,255,255,.35))'}}>
                  <path d={`M1.5,1.5 H${DOC.w - 30 - 1.5} L${DOC.w - 1.5},${30 + 1.5} V${DOC.h - 1.5} H1.5 Z`} fill="#000" stroke={WHITE} strokeWidth={2.5} strokeLinejoin="round" />
                  <path d={`M${DOC.w - 30 - 1.5},1.5 V${30 + 1.5} H${DOC.w - 1.5}`} fill="none" stroke={WHITE} strokeWidth={2.5} strokeLinejoin="round" />
                  {[0, 1, 2, 3].map((i) => {
                    const ly = 46 + i * 22;
                    const lw = (i === 3 ? 0.5 : 0.78 - i * 0.06) * (DOC.w - 30);
                    return <rect key={i} x={14} y={ly} width={lw} height={4} fill={i === 0 ? PURPLE_LIGHT : GREY_LIGHT} opacity={i === 0 ? 1 : 0.85} />;
                  })}
                </svg>
              </div>
              {/* mini 时间轴条（逐格点亮 + 白游标循环） */}
              <div style={{...abs(STRIP.x, STRIP.y, STRIP.w, STRIP.h), background: '#000', border: `1.5px solid ${GREY_LINE}`, borderRadius: 10}} />
              {Array.from({length: STRIP.cells}, (_, i) => {
                const cw = 17, gap = (STRIP.w - 14 - STRIP.cells * cw) / (STRIP.cells - 1);
                const lit = stripN >= i * 5;
                const hot = i === hi;
                return <div key={i} style={{position: 'absolute', left: STRIP.x + 7 + i * (cw + gap), top: STRIP.y + 4, width: cw, height: STRIP.h - 8, borderRadius: 4, background: hot ? WHITE : lit ? PURPLE : '#15161c', border: `1.5px solid ${hot ? WHITE : lit ? PURPLE : GREY_LINE}`, boxShadow: hot ? '0 0 10px 2px rgba(255,255,255,.5)' : undefined, opacity: lit || hot ? 1 : 0.8}} />;
              })}
            </div>
            {/* 光环前半（图标之前） */}
            <HaloRing cx={HALO.cx} cy={HALO.cy} rxo={HALO.rxo} ryo={HALO.ryo} rxi={HALO.rxi} ryi={HALO.ryi} p={haloP} fillOp={haloFill * 0.9} phase={phase} half="front" />
            {/* pcap 标识 */}
            <CText cx={275} cy={862} size={24} weight={700} family={FONT_MONO} color={WHITE} letterSpacing={1} dy={0}>pcap</CText>
          </div>
        ) : null}
        {/* happened 紫标签 */}
        <SoftIn N={N} f0={T_BOT + 2}>
          <Pill x={RP.x + 20} y={RP.y + 14} w={160} h={40} fill={PURPLE} sw={2.5} text="happened" fontSize={26} weight={700} textDy={0} glow="0 0 14px 3px rgba(102,45,248,.4)" />
        </SoftIn>
      </div>
    </div>
  );
};
