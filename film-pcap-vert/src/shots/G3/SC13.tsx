import React from 'react';
import {useCurrentFrame} from 'remotion';
import {GlitchIn, clamp01, emphasisPulse} from '../../common';
import {abs, CText, GREY, PacketIcon, PURPLE, WHITE, fadeIn} from '../../ui';
import {LightSweep} from '../../fx';

/**
 * SC13 线路不说谎 · N 1989–2132（S15 1997–2032 ¶）—— **全片结尾 · 象征物 + 回扣 · 高光时刻（扫光白名单②，紧凑版）**
 * 清场 → 三轮紫光横扫（1989/1999/2009，扫过 y470–554 区域，首轮与镜头首帧同拍）→ 发光竖线 = the wire
 *   自中心 draw-on（12 帧，x360，y 300–900，上下柔光）→ 白闪 3 帧 + `The wire doesn't lie.` Noto 900 72px
 *   白 + 紫描边 GlitchIn（rgbSplit 8，本镜唯一 glitch；1993 起 = S15 块 1997 的 −4 前挂，满态 2005）+
 *   emphasisPulse（2005 起）→ 小灰字 `PCAP · packet capture` SoftIn（2007）→ 线上 3 枚紫信封纵向持续下行
 *   （3px/帧，自 1995 起持续到压黑）。
 * endingFade 压黑由覆盖层接管（分镜表：endingFade=6 从 S15.to−6=2026 起压黑）→ 大字满态 2005 → 压黑 2026，
 *   满态可读 21 帧 ≥20 ✓。片末镜头**不归零离场**。运镜：线条 draw-on 后静止（运镜清单）。
 * 主角：大字两行 72px；光：白闪 + 紫描边 + 线体柔光；信封紫。
 */
const F0 = 1989;
const T_LINE = 1989, T_TEXT = 1993, T_SUB = 2007, T_ENV = 1995;
const SWEEPS = [1989, 1999, 2009];
const SWEEP_BARS: Array<[number, number, number, number]> = [[470, 6, 380, 0], [512, 10, 520, 2], [554, 6, 340, 4]];
const LINE = {cx: 360, y0: 300, y1: 900, w: 3.5};
const TEXT1 = {cx: 360, cy: 555}, TEXT2 = {cx: 360, cy: 648};
const ENV_CYCLE = 717, ENV_SPACING = 239;

export const SC13: React.FC = () => {
  const N = useCurrentFrame() + F0;
  // 线 draw-on（自中心向两端，12 帧）
  const lineK = 1 - Math.pow(1 - clamp01((N - T_LINE) / 12), 2.5);
  // 白闪 3 帧（大字入场瞬间：中央白色辉光 + 线体增亮）
  const flash = N >= T_TEXT ? N - T_TEXT : -1;
  const flashK = flash >= 0 && flash < 3 ? 1 - flash / 3 : 0;
  // 大字：GlitchIn 12 帧模板（满态 T_TEXT+12）→ emphasisPulse
  const pulse = emphasisPulse(N - (T_TEXT + 12), {peak: 1.11});
  // 信封：3 枚，3px/帧持续下行（模 ENV_CYCLE 循环，压黑前始终可见）
  const envT = N - T_ENV;
  return (
    <div style={{position: 'absolute', inset: 0}}>
      {/* 三轮紫光横扫（扫光白名单②；首轮与镜头首帧同拍起扫） */}
      <LightSweep N={N} rounds={SWEEPS} alphas={[0.6, 0.55, 0.55]} bars={SWEEP_BARS} dy={0} />
      {/* 发光竖线 = the wire（自中心 draw-on；白闪时增亮） */}
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
      {/* 线上信封（packet 母题：纵向持续下行，画在大字之前 → 从字后穿过） */}
      {Array.from({length: 3}, (_, i) => {
        if (envT < 0) return null;
        const y = 258 + ((3 * envT + 72 + ENV_SPACING * i) % ENV_CYCLE);
        return (
          <div key={i} style={{position: 'absolute', inset: 0, opacity: fadeIn(envT, 8)}}>
            <PacketIcon cx={LINE.cx} cy={y} w={46} h={32} accent />
          </div>
        );
      })}
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
      {/* 大字（落在线正中，线从字后穿过；片尾唯一重口味 glitch） */}
      {N >= T_TEXT ? (
        <div style={{position: 'absolute', inset: 0, transformOrigin: '360px 600px', transform: pulse === 1 ? undefined : `scale(${pulse.toFixed(4)})`}}>
          <GlitchIn N={N} f0={T_TEXT} rgbSplit={8} seed={7}>
            <CText
              cx={TEXT1.cx}
              cy={TEXT1.cy}
              size={72}
              weight={900}
              color={WHITE}
              letterSpacing={1}
              shadow="0 0 24px rgba(102,45,248,.6), 0 0 8px rgba(255,255,255,.35)"
              style={{WebkitTextStroke: `2.5px ${PURPLE}`, paintOrder: 'stroke fill'}}
            >
              The wire
            </CText>
            <CText
              cx={TEXT2.cx}
              cy={TEXT2.cy}
              size={72}
              weight={900}
              color={WHITE}
              letterSpacing={1}
              shadow="0 0 24px rgba(102,45,248,.6), 0 0 8px rgba(255,255,255,.35)"
              style={{WebkitTextStroke: `2.5px ${PURPLE}`, paintOrder: 'stroke fill'}}
            >
              doesn&apos;t lie.
            </CText>
          </GlitchIn>
        </div>
      ) : null}
      {/* 小灰字（片名副标回扣） */}
      {N >= T_SUB ? (
        <CText cx={360} cy={745} size={24} weight={500} color={GREY} letterSpacing={3} opacity={fadeIn(N - T_SUB, 8)}>
          PCAP &middot; packet capture
        </CText>
      ) : null}
    </div>
  );
};
