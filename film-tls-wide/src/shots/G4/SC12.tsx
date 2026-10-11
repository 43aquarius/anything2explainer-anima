import React from 'react';
import {useCurrentFrame} from 'remotion';
import {BEZ_SCALE_IN, clamp01, easeOutCubic, GlitchIn} from '../../common';
import {CORAL, Cross, CText, EyeGlyph, GREY, GREY_LIGHT, MonoText, PURPLE_LIGHT, WHITE, exitOp, firstOp, mixHex, softOp} from '../../ui';
import {CameraRig, HeroGlow} from '../../fx';
import {SectionNoise, SealBand} from './parts';

/**
 * SC12 字已噪声（2445–2673，S17–S18，章末段末镜头）
 * 承接：封流带 16 帧缩到中带（y≈382 走廊，"信封照样飞"），不清场。
 * 上半：握手记录行 3 行（等宽 24px 灰白，公开可读）逐行 wipe（每行 12 帧）+ 行尾 EyeGlyph 睁眼。
 * 下半：放大信封剖面（380×170）+ 封内 NoiseField（2609 逐格点亮 20f 密度渐增 → 2638 热态爆发
 *  每 3 帧重排 + 紫描边 + 热光）+ 外缘标签 to: shop.example / 150 B / 0.041 s。
 * 运镜：2574–2607 推近 1.05→1.2 推向 NoiseField（2609 前结束；首帧 1.05 与 SC11 末帧同机位）。
 * 停留：热态落位 2609+20=2629 → 灭光 2660（31 帧 ✓，末块 34⚠ 前挂：噪声爆发自 S18.c1 启动）；
 * 2664 起末 10 帧归零（2673 = 0），章节卡 2674 由覆盖层接管。
 */
export const F0 = 2445;
const B_ROWS = 2453;
const B_ENV = 2513;
const B_TO = 2525;
const B_LBL = 2563;
const B_PUSH0 = 2574;
const B_PUSH1 = 2607;
const B_NOISE = 2609;
const B_HOT = 2638;
const TO = 2673;

// ---- 布局（世界坐标，Ch2 内容主区 y 175–620）----
const ROW_X = 200;
const ROW_Y = [240, 288, 336];
const ROWS = ['> ClientHello \u2026 key_share', '< ServerHello \u2026 certificate', '< Finished'];
const monoW = (s: string, size: number) =>
  [...s].reduce((w, ch) => w + (ch === ' ' ? 0.32 : (ch.codePointAt(0) ?? 32) >= 0x2000 ? 1 : 0.62), 0) * size;
const ENV = {cx: 640, cy: 490, w: 380, h: 170};
const NOISE = {x: 466, y: 420, w: 348, h: 140};

export const SC12: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const fade = exitOp(N, TO, 10); // 末 10 帧归零（章末）
  const glowK = 1 - clamp01((N - 2660) / 6); // 带光元素先灭光

  // ---- 信封剖面：入场（21 帧）+ 呼吸（±2%，30 帧周期）+ 热态描边 ----
  const hotK = clamp01((N - B_HOT) / 8);
  const envS = 0.55 + 0.45 * BEZ_SCALE_IN(clamp01((N - B_ENV) / 21));
  const breath = N >= B_LBL ? 1 + 0.02 * Math.max(0, 1 - clamp01((N - 2596) / 20)) * Math.sin((2 * Math.PI * (N - B_LBL)) / 30) : 1; // 2596 起 20 帧内衰减到静止
  const envOp = firstOp(N - B_ENV + 1, 6);
  const strokeC = mixHex(WHITE, PURPLE_LIGHT, hotK);

  return (
    <CameraRig N={N} keys={[{f: F0, x: 640, y: 360, s: 1.05}, {f: B_PUSH0, x: 640, y: 360, s: 1.05}, {f: B_PUSH1, x: 640, y: 488, s: 1.2}]}>
      <div style={{position: 'absolute', left: 0, top: 0, opacity: fade}}>
        {/* 承接：封流带缩到中带（16 帧），此后是上下半区之间的"信封照样飞"走廊 */}
        <SealBand N={N} />

        {/* 上半：握手记录（公开可读）+ 行尾窥视之眼 */}
        {ROWS.map((row, i) => {
          const f0 = B_ROWS + i * 10;
          const e = easeOutCubic(clamp01((N - f0) / 12));
          if (e <= 0) return null;
          const openK = softOp(N - (f0 + 9), 6);
          const b = (N + i * 23) % 72; // 眼睛缓慢眨动（错峰）
          const blink = b < 3 ? 1 - b / 3 : b < 6 ? (b - 3) / 3 : 1;
          const eyeX = ROW_X + monoW(row, 24) + 34;
          return (
            <div key={i}>
              <div style={{position: 'absolute', left: ROW_X, top: ROW_Y[i] - 16, clipPath: `inset(0 ${((1 - e) * 100).toFixed(2)}% 0 0)`}}>
                <MonoText x={0} y={0} size={24} color={GREY_LIGHT} style={{textShadow: '0 0 5px rgba(255,255,255,.22)'}}>
                  {row}
                </MonoText>
              </div>
              <EyeGlyph cx={eyeX} cy={ROW_Y[i]} w={34} open={Math.max(0.06, openK * blink)} opacity={openK} />
            </div>
          );
        })}

        {/* 下半：信封剖面（主角：封内噪声场） */}
        <div style={{position: 'absolute', left: 0, top: 0, opacity: envOp, transformOrigin: `${ENV.cx}px ${ENV.cy}px`, transform: `scale(${(envS * breath).toFixed(4)})`}}>
          <HeroGlow x={ENV.cx - ENV.w / 2} y={ENV.cy - ENV.h / 2} w={ENV.w} h={ENV.h} r={14} N={Math.min(N, 2636)} k={(0.32 + 0.45 * hotK) * glowK * envOp} />
          <svg width={ENV.w} height={ENV.h} viewBox={`0 0 ${ENV.w} ${ENV.h}`} style={{position: 'absolute', left: ENV.cx - ENV.w / 2, top: ENV.cy - ENV.h / 2, overflow: 'visible'}}>
            <rect x={2} y={2} width={ENV.w - 4} height={ENV.h - 4} rx={7} fill="#000" stroke={strokeC} strokeWidth={3} />
            <path d={`M6,${ENV.h - 6} L${ENV.w / 2},${ENV.h * 0.34} L${ENV.w - 6},${ENV.h - 6}`} fill="none" stroke={strokeC} strokeWidth={2.4} opacity={0.9} />
          </svg>
          <SectionNoise x={NOISE.x} y={NOISE.y} w={NOISE.w} h={NOISE.h} N={N} seed={7} revF0={B_NOISE} hotF0={B_HOT} glowK={glowK} />
        </div>

        {/* 外缘标签 ×3（等宽 22px 灰 + 短引线） */}
        <MonoText x={925} y={424} size={22} color={GREY} opacity={softOp(N - B_TO, 8)}>
          to: shop.example
        </MonoText>
        <div style={{position: 'absolute', left: 838, top: 441, width: 84 * easeOutCubic(clamp01((N - B_TO - 2) / 10)), height: 0, borderTop: `1.5px solid rgba(74,74,74,.9)`}} />
        <MonoText x={252} y={560} size={22} color={GREY} opacity={softOp(N - B_LBL, 8)}>
          150 B
        </MonoText>
        <div style={{position: 'absolute', left: 324, top: 571, width: 118 * easeOutCubic(clamp01((N - B_LBL - 2) / 10)), height: 0, borderTop: `1.5px solid rgba(74,74,74,.9)`}} />
        <MonoText x={925} y={560} size={22} color={GREY} opacity={softOp(N - (B_LBL + 2), 8)}>
          0.041 s
        </MonoText>
        <div style={{position: 'absolute', left: 838, top: 571, width: 84 * easeOutCubic(clamp01((N - B_LBL - 4) / 10)), height: 0, borderTop: `1.5px solid rgba(74,74,74,.9)`}} />

        {/* 白名单 glitch：noise（热态场顶标签，挂 S18.c2） */}
        <GlitchIn N={N} f0={B_HOT + 3} rgbSplit={6}>
          <div style={{position: 'absolute', left: 0, top: 0}}>
            <CText cx={878} cy={408} size={28} weight={900} color={PURPLE_LIGHT} letterSpacing={1}>noise</CText>
          </div>
        </GlitchIn>

        {/* letters ✗ readable（信封下方小灰字，挂 S18.c2） */}
        <div style={{position: 'absolute', left: 0, top: 0, opacity: softOp(N - B_HOT, 6)}}>
          <CText cx={556} cy={598} size={24} weight={600} color={GREY}>
            letters
          </CText>
          <Cross cx={640} cy={596} size={20} color={CORAL} sw={5} p={clamp01((N - B_HOT - 2) / 8)} />
          <CText cx={718} cy={598} size={24} weight={600} color={GREY}>
            readable
          </CText>
        </div>
      </div>
    </CameraRig>
  );
};
