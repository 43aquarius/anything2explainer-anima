import React from 'react';
import {useCurrentFrame} from 'remotion';
import {GlitchIn, clamp01, emphasisPulse} from '../../common';
import {CText, GREY, PacketIcon, PURPLE, WHITE, abs, fadeIn} from '../../ui';
import {LightSweep} from '../../fx';

/**
 * SC42 线路不会说谎 · N 9432–9575（S56 9440–9475）—— **全片结尾 · 象征物 + 回扣 · 高光时刻（扫光白名单②）**
 * 清场 → 中央一条发光白线（x 120–1160, y 360, 自中心向两端 12 帧draw-on，上下柔光）= the wire；
 * 大字 `The wire doesn't lie.` Noto 900 84px 白 + 紫描边 GlitchIn（rgbSplit 8 / slices 16，全片最后一次 glitch）
 *   落在线正中（线从字后穿过）；+12 小灰字 `PCAP · packet capture, explained` SoftIn；线上 4 枚紫信封持续右行 3px/帧。
 * 时序（endingFade=30 自 9445 起压黑，覆盖层处理）：整体前挂——扫光 9432/9442/9452 三轮（首轮与切镜同帧，无空场），
 *   线 draw-on 9432–9444，白闪 3 帧 + 大字 GlitchIn 9436（S56.c1=9440 的 −4，容差 −6 内；glitch 满态 9448，压黑尚浅）
 *   + emphasisPulse 1.11（9448 起）；小灰字 9448。信封 9438 起持续右行直到压黑。
 * 片尾镜头**不归零离场**（压黑层接管）；大字满态 9448 → 压黑渐深（9445–9475 线性），强紫描边 + 柔光保证渐暗中可读。
 * 运镜：线条 draw-on 后静止（运镜清单）。停留：片尾镜头，落位后无离场，稳定期至压黑 ✓。
 */
const F0 = 9432;
const T_SWEEP = 9432, T_LINE = 9432, T_TEXT = 9436, T_SUB = 9448, T_ENV = 9438;
const SWEEPS = [9432, 9442, 9452];
const LINE = {x: 120, w: 1040, y: 360, h: 3};
const ENV_SPACING = 350;
const tri = (n: number, len = 3) => (n <= 0 || n >= len ? 0 : 1 - n / len);

export const SC42: React.FC = () => {
  const N = useCurrentFrame() + F0;
  // 线 draw-on（自中心向两端，12 帧）+ 上下柔光
  const lineK = 1 - Math.pow(1 - clamp01((N - T_LINE) / 12), 2.5);
  // 白闪 3 帧（大字入场瞬间：中央白色辉光 + 线体增亮）
  const flash = N >= T_TEXT ? N - T_TEXT : -1;
  const flashK = tri(flash, 3); // 1, 0.66, 0.33
  // 大字：GlitchIn 12 帧模板 → emphasisPulse
  const pulse = emphasisPulse(N - (T_TEXT + 12), {peak: 1.11});
  // 信封：4 枚，3px/帧持续右行（模 1440 循环，压黑前始终可见）
  const envT = N - T_ENV;
  return (
    <div style={{position: 'absolute', inset: 0}}>
      {/* 三轮紫光横扫（扫光白名单②；首轮与镜头首帧同帧起扫） */}
      <LightSweep N={N} rounds={SWEEPS} alphas={[0.6, 0.55, 0.55]} dy={-4} />
      {/* 发光白线 = the wire（自中心向两端 draw-on；白闪时增亮） */}
      {lineK > 0 ? (
        <div
          style={{
            ...abs(640 - (LINE.w / 2) * lineK, LINE.y - LINE.h / 2, LINE.w * lineK, LINE.h),
            background: flash >= 0 && flash < 3 ? WHITE : 'linear-gradient(90deg, rgba(255,255,255,.55), #FFFFFF 12%, #FFFFFF 88%, rgba(255,255,255,.55))',
            borderRadius: 2,
            boxShadow:
              flash >= 0 && flash < 3
                ? `0 0 ${Math.round(22 + 26 * flashK)}px ${Math.round(6 + 6 * flashK)}px rgba(255,255,255,.75), 0 0 70px 24px rgba(161,117,241,.5)`
                : '0 0 18px 6px rgba(255,255,255,.38), 0 0 64px 22px rgba(161,117,241,.34)',
          }}
        />
      ) : null}
      {/* 线上信封（packet 母题：持续右行，画在大字之前 → 从字后穿过） */}
      {Array.from({length: 4}, (_, i) => {
        if (envT < 0) return null;
        const x = -80 + ((3 * envT + 170 + ENV_SPACING * i) % 1440);
        return (
          <div key={i} style={{position: 'absolute', inset: 0, opacity: fadeIn(envT, 8)}}>
            <PacketIcon cx={x} cy={LINE.y} w={46} h={32} accent />
          </div>
        );
      })}
      {/* 白闪（3 帧：中央辉光，在大字之下） */}
      {flash >= 0 && flash < 3 ? (
        <div
          style={{
            ...abs(640 - 320, 360 - 190, 640, 380),
            borderRadius: '50%',
            background: 'radial-gradient(ellipse, rgba(255,255,255,.5) 0%, rgba(255,255,255,.22) 40%, rgba(255,255,255,0) 72%)',
            opacity: [0.9, 0.55, 0.22][flash],
          }}
        />
      ) : null}
      {/* 大字（落在线正中，线从字后穿过；片尾唯一重口味 glitch） */}
      {N >= T_TEXT ? (
        <div style={{position: 'absolute', inset: 0, transformOrigin: '640px 360px', transform: pulse === 1 ? undefined : `scale(${pulse.toFixed(4)})`}}>
          <GlitchIn N={N} f0={T_TEXT} rgbSplit={8} slices={16} seed={7}>
            <CText
              cx={640}
              cy={360}
              size={84}
              weight={900}
              color={WHITE}
              letterSpacing={1}
              shadow="0 0 24px rgba(102,45,248,.6), 0 0 8px rgba(255,255,255,.35)"
              style={{WebkitTextStroke: `2.5px ${PURPLE}`, paintOrder: 'stroke fill'}}
            >
              The wire doesn't lie.
            </CText>
          </GlitchIn>
        </div>
      ) : null}
      {/* 小灰字（片名副标回扣） */}
      {N >= T_SUB ? (
        <CText cx={640} cy={428} size={24} weight={500} color={GREY} letterSpacing={3} opacity={fadeIn(N - T_SUB, 8)}>
          PCAP &middot; packet capture, explained
        </CText>
      ) : null}
    </div>
  );
};
