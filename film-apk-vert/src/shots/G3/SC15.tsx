import React from 'react';
import {useCurrentFrame} from 'remotion';
import {GlitchIn, clamp01, emphasisPulse, FONT_HEAVY} from '../../common';
import {CText, PURPLE, WHITE, abs, fadeIn} from '../../ui';
import {GlowBlob, LightSweep} from '../../fx';
import {EnvelopeGlyph} from './g3ui';

/**
 * SC15 ★收束 · N 2090–2249（S15 2098–2148 ¶：2098「Every app is a zip you can read.」）——
 * **片尾收束 · 扫光白名单②（全片两处之二）+ 全片最后一次 glitch**。末拍不运镜、不归零（endingFade=6 压黑层自 2142 起接管）。
 * 2090 清场 → 2091 发光竖线自中心 draw-on（12 帧，x360 y300–900 上下柔光）→ 三轮紫光横扫 2094/2112/2130（f0+4/+22/+40，
 *   各 16 帧；bars 镜像本片 SC04 的竖版几何：384/572/736 三条覆盖主角区上下）→ 2094 白闪 3 帧 +
 *   大字 `Every app is a zip` / `you can read.`（Noto 900 56px 两行白+紫描边）GlitchIn rgbSplit 8
 *   （**前挂 −4 帧对齐节拍 2098**，落定 2098+17=2115）+ emphasisPulse @2106 →
 *   3 枚小信封 2112 起 3px/帧纵向下行至压黑（画在大字之前 → 从字后穿过；全程不进字幕带）。
 * 紫晕呼吸（片尾唯一大面积光，持续到压黑）。满态可读窗口：落定 2115 → 压黑 2142 起 = 27 帧满态 + 光晕延续（双倍预算口径
 *   (S15.to−6)−2098 = 44 ≥ 30 ✓，glitch 12 帧半程暗帧已计入）。大字两行 56px（宽 436/344 ≤ 560）。
 * 主角：大字两行；光：扫光 + 白闪 + 紫晕（片尾唯一大面积光）。
 */
const F0 = 2090;
const SWEEPS = [2094, 2112, 2130]; // f0+4 / +22 / +40（各 16 帧）
const T_LINE = 2091; // 发光竖线 draw-on 12 帧
const T_TEXT = 2094; // 大字 GlitchIn（节拍 2098 −4 前挂；满态 2106，落定 2115）
const T_PULSE = 2106; // emphasisPulse
const T_ENV = 2112; // 3 枚小信封纵向下行

/** 扫光条 [y, h, w, 帧偏移]：镜像 G1/SC04 竖版几何（主角 cy600：上 384 / 中 572 / 下 736，中条最宽穿字区） */
const SWEEP_BARS: Array<[number, number, number, number]> = [
  [384, 6, 430, 0],
  [572, 10, 540, 2],
  [736, 6, 380, 4],
];
const LINE = {cx: 360, y0: 300, y1: 900, w: 3.5}; // 发光竖线（the zip stream）
const L1 = 'Every app is a zip';
const L2 = 'you can read.';
const L1Y = 558, L2Y = 642;
const ENVS = [
  {x: 250, y0: 470, w: 46, h: 32},
  {x: 478, y0: 545, w: 40, h: 28},
  {x: 360, y0: 310, w: 46, h: 32},
];

export const SC15: React.FC = () => {
  const N = useCurrentFrame() + F0;
  // 竖线自中心向两端 draw-on（12 帧，幂 2.5 缓出）
  const lineK = 1 - Math.pow(1 - clamp01((N - T_LINE) / 12), 2.5);
  // 白闪 3 帧（大字入场瞬间：线体增亮 + 中央辉光）
  const flash = N >= T_TEXT ? N - T_TEXT : -1;
  const flashK = flash >= 0 && flash < 3 ? 1 - flash * 0.33 : 0;
  // 大字脉冲（两行整体）+ 紫晕呼吸（持续到压黑）
  const pulse = emphasisPulse(N - T_PULSE, {peak: 1.09});
  const glow = 18 + 8 * Math.sin((2 * Math.PI * N) / 30);
  const blobA = 0.16 + 0.05 * Math.sin((2 * Math.PI * N) / 30);
  // 信封纵向下行 3px/帧（持续至压黑；不归零）
  const envT = N - T_ENV;

  return (
    <div style={{position: 'absolute', inset: 0}}>
      {/* 三轮紫光横扫（扫光白名单②；屏幕空间，不随内容） */}
      <LightSweep N={N} rounds={SWEEPS} alphas={[0.6, 0.55, 0.55]} bars={SWEEP_BARS} />

      {/* 紫晕（片尾唯一大面积光：呼吸，持续到压黑） */}
      {N >= T_PULSE ? <GlowBlob cx={360} cy={600} r={240} N={N} alpha={blobA * clamp01((N - T_PULSE) / 10)} /> : null}

      {/* 发光竖线（自中心 draw-on；白闪时增亮） */}
      {lineK > 0 ? (
        <div
          style={{
            ...abs(LINE.cx - LINE.w / 2, 600 - ((LINE.y1 - LINE.y0) / 2) * lineK, LINE.w, (LINE.y1 - LINE.y0) * lineK),
            background: flash >= 0 && flash < 3 ? WHITE : 'linear-gradient(180deg, rgba(255,255,255,.55), #FFFFFF 12%, #FFFFFF 88%, rgba(255,255,255,.55))',
            borderRadius: 2,
            boxShadow:
              flash >= 0 && flash < 3
                ? `0 0 ${Math.round(22 + 26 * flashK)}px ${Math.round(6 + 6 * flashK)}px rgba(255,255,255,.75), 0 0 70px 24px rgba(161,117,241,.5)`
                : '0 0 18px 6px rgba(255,255,255,.38), 0 0 64px 22px rgba(161,117,241,.34)',
          }}
        />
      ) : null}

      {/* 白闪（3 帧：中央辉光，在大字之下） */}
      {flash >= 0 && flash < 3 ? (
        <div
          style={{
            ...abs(360 - 280, 600 - 240, 560, 480),
            borderRadius: '50%',
            background: 'radial-gradient(ellipse, rgba(255,255,255,.5) 0%, rgba(255,255,255,.22) 40%, rgba(255,255,255,0) 72%)',
            opacity: [0.9, 0.55, 0.22][flash],
          }}
        />
      ) : null}

      {/* 信封（3 枚纵向下行，画在大字之前 → 从字后穿过；持续至压黑不归零） */}
      {ENVS.map((e, i) =>
        envT < 0 ? null : (
          <div key={i} style={{position: 'absolute', inset: 0, opacity: fadeIn(envT, 8)}}>
            <EnvelopeGlyph cx={e.x} cy={e.y0 + 3 * envT} w={e.w} h={e.h} accent />
          </div>
        ),
      )}

      {/* 大字两行（GlitchIn rgbSplit 8，全片最后一次 glitch；前挂 −4 帧对齐节拍 2098） */}
      {N >= T_TEXT ? (
        <div style={{position: 'absolute', inset: 0, transformOrigin: '360px 600px', transform: pulse === 1 ? undefined : `scale(${pulse.toFixed(4)})`}}>
          <GlitchIn N={N} f0={T_TEXT} rgbSplit={8} seed={15}>
            <CText
              cx={360}
              cy={L1Y}
              size={56}
              weight={900}
              family={FONT_HEAVY}
              color={WHITE}
              letterSpacing={1}
              shadow={`0 0 ${glow.toFixed(1)}px rgba(102,48,248,.55), 0 0 8px rgba(255,255,255,.3)`}
              style={{WebkitTextStroke: `2.5px ${PURPLE}`, paintOrder: 'stroke fill'}}
            >
              {L1}
            </CText>
            <CText
              cx={360}
              cy={L2Y}
              size={56}
              weight={900}
              family={FONT_HEAVY}
              color={WHITE}
              letterSpacing={1}
              shadow={`0 0 ${glow.toFixed(1)}px rgba(102,48,248,.55), 0 0 8px rgba(255,255,255,.3)`}
              style={{WebkitTextStroke: `2.5px ${PURPLE}`, paintOrder: 'stroke fill'}}
            >
              {L2}
            </CText>
          </GlitchIn>
        </div>
      ) : null}
    </div>
  );
};
