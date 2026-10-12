import React from 'react';
import {useCurrentFrame} from 'remotion';
import {clamp01, powOutRemain, GlitchIn, BEZ_SCALE_IN, kf, FONT_MONO} from '../../common';
import {CameraRig, GlowBlob} from '../../fx';
import {CText, SoftIn, Svg, ClockFace, QuartzCrystal, DriftLine, GREY, GREY_MID, GREY_LIGHT, WHITE, ORANGE, PURPLE_LIGHT, abs, fadeIn, exitOp, glowOffK, EXAMPLE} from '../../ui';

/**
 * SC01 错的（78–351）。S01–S03：你的钟现在就是错的 → 石英数秒 → 漂移。
 * 节拍：86 大钟 slideUp Δ100/18f + 秒针起走（6°/帧，持续）
 *       ｜123 读数弹入（10f，随秒针每 60f 进 1 秒）+ 红色警示三角 `!` GlitchIn（rgbSplit 4，白名单）
 *       ｜151 石英晶体缩入（21f）+ 高频微颤（±1.5px，持续）
 *       ｜205 晶体→钟虚线 draw-on（16f）+ 底部漂移双线 wipe 入场（k=0 直行）
 *       ｜276 白线 20f 内弯离至 0.8，此后极缓爬到 1.0（至 340）
 *       ｜299 线距标注 SoftIn（6f）+ 灰线亮一下（4f）
 * 运镜：1.0→1.05 慢推（78–298，末 key ≤ TO−50 ✓，不进末拍）。停留：段内不判（末拍簇 299–305，安静窗 305→343=38f）。
 * 主角：钟+晶体组 320px（钟面 GlowBlob 紫晕；警示三角橙光；白线漂移微光）。零扫光、无字幕。
 */
const F0 = 78;
const TO = 351;

const CLOCK = {cx: 400, cy: 300, r: 120}; // 中央大钟（全片视觉母题）
const XTL = {cx: 880, cy: 300, w: 210, h: 120}; // 右侧石英晶振
const WARN = {cx: 592, cy: 172, s: 64}; // 警示三角（钟右上）
const DRIFT = {x: 170, y: 548, w: 940, gapPx: 44}; // 底部漂移双线（灰直=真时间 / 白弯=你的钟）

export const SC01: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const exit = exitOp(N, TO, 5);
  const gOff = glowOffK(N, TO, 3, 5); // 带光元素先灭光再淡出

  // ---- 大钟（86 slideUp Δ100/18f；秒针 N 驱动 6°/帧）----
  const clockDy = 100 * powOutRemain(N - 86, 18, 2.5);
  const clockOp = fadeIn(N - 86, 6);
  const clockGlow = kf(N, [[100, 0], [114, 0.9]]) * gOff; // 入场落位后紫晕点亮

  // ---- 读数（123 弹入；每 60f 进 1 秒，与秒针一圈同步）----
  const secBase = 58 + Math.floor((N - 86) / 60);
  const readout = secBase < 60 ? `11:59:${secBase}` : `12:00:${String(secBase - 60).padStart(2, '0')}`;
  const rdS = 0.6 + 0.4 * BEZ_SCALE_IN(clamp01((N - 123) / 10));
  const rdOp = fadeIn(N - 123, 6);

  // ---- 晶体（151 缩入 21f；持续 ±1.5px 微颤）----
  const xtlS = 0.55 + 0.45 * BEZ_SCALE_IN(clamp01((N - 151) / 21));
  const xtlOp = fadeIn(N - 151, 6);

  // ---- 晶体→钟虚线（205 draw-on 16f，自晶体端向钟生长）----
  const wireP = clamp01((N - 205) / 16);
  const wireOp = fadeIn(N - 205, 6);
  const wireL = 782 - 254 * wireP; // 可见区左界（右侧晶体端先出）

  // ---- 漂移双线（205 wipe 16f 入场；276 起白线弯离）----
  const dlP = clamp01((N - 205) / 16);
  const dlOp = fadeIn(N - 205, 6);
  const bendK = kf(N, [[276, 0], [296, 0.8], [340, 1]]); // 20f 渐弯，此后极缓爬

  // ---- 灰线亮一下（299，4f）----
  const flashOp = kf(N, [[299, 0], [301, 0.85], [304, 0]]);
  const warnGlow = gOff; // 三角橙光随离场先灭

  return (
    <CameraRig N={N} keys={[{f: F0, x: 640, y: 360, s: 1}, {f: 298, x: 640, y: 360, s: 1.05}]}>
      <div style={abs(0, 0, 1280, 720)}>
        <div style={{...abs(0, 0, 1280, 720), opacity: exit}}>
          {/* ---- 晶体→钟虚线（draw-on）---- */}
          <div style={{...abs(0, 0, 1280, 720), opacity: wireOp, clipPath: `inset(0 0 0 ${wireL.toFixed(1)}px)`}}>
            <Svg bloom={false}>
              <line x1={782} y1={300} x2={528} y2={300} stroke={GREY_MID} strokeWidth={2.5} strokeDasharray="7 7" />
            </Svg>
          </div>

          {/* ---- 大钟（主角：紫晕 + 白柔光）---- */}
          <GlowBlob cx={CLOCK.cx} cy={CLOCK.cy} r={195} N={N} k={clockGlow * 0.9} />
          <div style={{...abs(0, 0, 1280, 720), opacity: clockOp, transform: `translateY(${clockDy.toFixed(1)}px)`}}>
            <ClockFace cx={CLOCK.cx} cy={CLOCK.cy} r={CLOCK.r} N={N} glow />
          </div>

          {/* ---- 读数（mono 白，随秒针走字）---- */}
          <div style={{...abs(0, 0, 1280, 720), opacity: rdOp, transform: `scale(${rdS.toFixed(3)})`, transformOrigin: '400px 448px'}}>
            <CText cx={400} cy={448} size={30} weight={600} family={FONT_MONO} letterSpacing={1} shadow="0 0 10px rgba(255,255,255,.35)">{readout}</CText>
          </div>

          {/* ---- 石英晶体（持续微颤 = 组件内 N 驱动）---- */}
          <div style={{...abs(0, 0, 1280, 720), opacity: xtlOp, transform: `scale(${xtlS.toFixed(3)})`, transformOrigin: `${XTL.cx}px ${XTL.cy}px`}}>
            <QuartzCrystal cx={XTL.cx} cy={XTL.cy} w={XTL.w} h={XTL.h} N={N} amp={1.5} glow />
          </div>

          {/* ---- 红色警示三角（123 GlitchIn，白名单唯一 glitch）---- */}
          <GlitchIn N={N} f0={123} rgbSplit={4} seed={11}>
            <div style={{...abs(WARN.cx - WARN.s / 2, WARN.cy - WARN.s / 2, WARN.s, WARN.s), filter: `drop-shadow(0 0 ${(8 + 12 * warnGlow).toFixed(0)}px rgba(240,95,65,${(0.35 + 0.35 * warnGlow).toFixed(2)}))`}}>
              <svg width={WARN.s} height={WARN.s} viewBox="0 0 64 64" style={{position: 'absolute', inset: 0}}>
                <polygon points="32,4 60,54 4,54" fill="rgba(240,95,65,.16)" stroke={ORANGE} strokeWidth={4} strokeLinejoin="round" />
                <text x={32} y={48} textAnchor="middle" fontFamily="'Orbitron',sans-serif" fontWeight={700} fontSize={26} fill={ORANGE}>!</text>
              </svg>
            </div>
          </GlitchIn>

          {/* ---- 漂移双线（wipe 入场 → 白线弯离）---- */}
          <div style={{...abs(0, 0, 1280, 720), opacity: dlOp, clipPath: `inset(0 ${(100 - 100 * dlP).toFixed(1)}% 0 0)`}}>
            <DriftLine x={DRIFT.x} y={DRIFT.y} w={DRIFT.w} k={bendK} gapPx={DRIFT.gapPx} />
          </div>
          {/* 灰线亮一下（299，"差多少"） */}
          {flashOp > 0.01 ? (
            <Svg bloom={false}>
              <line x1={DRIFT.x} y1={DRIFT.y} x2={DRIFT.x + DRIFT.w} y2={DRIFT.y} stroke={GREY_LIGHT} strokeWidth={2.5} strokeDasharray="2 6" opacity={flashOp.toFixed(3)} />
            </Svg>
          ) : null}
          {/* 线距标注 */}
          <SoftIn N={N} f0={299} len={6}>
            <CText cx={700} cy={604} size={22} weight={600} color={GREY}>{EXAMPLE.driftDay}</CText>
          </SoftIn>
        </div>
      </div>
    </CameraRig>
  );
};
