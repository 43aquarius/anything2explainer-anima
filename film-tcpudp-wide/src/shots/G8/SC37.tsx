import React from 'react';
import {useCurrentFrame} from 'remotion';
import {GlitchIn, clamp01, emphasisPulse, FONT_MONO} from '../../common';
import {CText, PacketIcon, PostcardIcon, SeqStamp, EXAMPLE, abs, softOp, scaleIn, WHITE, GREY, PURPLE, ORANGE} from '../../ui';
import {LightSweep} from '../../fx';

/**
 * SC37 两种承诺（收尾）· N 10195–10340（S71 10203–10249 + S72 10260–10300 ¶ 片末 = {S71.from−8}–{TOTAL}）
 * —— **全片结尾 · 象征物 + 回扣 · 高光时刻（扫光白名单②，紧凑版）**
 * 版式：中央上下两行大字 `TCP never loses.`（Noto 900 72px 白+紫描边，cy 300，本镜唯一 glitch = 此行）
 *       / `UDP never waits.`（同款 72px 白+橙描边，cy 432，缩放入场不用 glitch，错开视觉重音）；
 *       两行之间一条发光白线（x 160–1120，y 366，白 3px 上下柔光，自中心向两端 12 帧 draw-on）；
 *       线上左侧一枚编号信封、右侧一枚明信片 1.5px/帧相向缓行（持续到压黑）；
 *       上方小灰字 `TCP / UDP · two ways to travel`（22px，片名回扣）。
 * 时序：10199/10209/10219 三轮紫光横扫（LightSweep，紧凑版；首轮 +4 与清场后首拍衔接）；
 *       10207 线自中心 draw-on 12 帧；10203 白闪 3 帧 + 第一行大字 GlitchIn（rgbSplit 8 / slices 16，
 *       全片最后一次 glitch）+ 10215 emphasisPulse 1.11；
 *       **10252 第二行缩放入场（S72.c1=10260 的 −8 前挂：分镜表原写 10256（−4），可读性预算算得满态 10272 →
 *       压黑起 10294 仅 22 帧 / 全黑 10300 仅 28 帧 <30，按派单授权再提前 4 帧 → 满态 10268，
 *       压黑起 26 帧、全黑 32 帧 ✓，见 BUILD_NOTES）**；10262 小灰字 SoftIn；
 *       10219 信封/明信片起在线上缓行直到压黑。
 * endingFade=6 压黑从 10300−6=10294 起（覆盖层），本镜头**不归零离场**（压黑层接管）。
 * 主角：双行大字组（72px×2）；光 = 白闪 + 紫描边光（行 1）/ 橙描边微光（行 2）。
 */
const F0 = 10195;
const TO = 10340;
const SWEEPS = [10199, 10209, 10219];
const T_TXT1 = 10203, T_LINE = 10207, T_PULSE = 10215, T_RIDE = 10219, T_TXT2 = 10252, T_KICK = 10262;

const LINE = {x0: 160, w: 960, y: 366, h: 3};
const RIDER_V = 1.5;
const tri = (n: number, len = 3) => (n <= 0 || n >= len ? 0 : 1 - n / len);

export const SC37: React.FC = () => {
  const N = useCurrentFrame() + F0;

  // 线 draw-on（自中心向两端，12 帧，幂缓出）
  const lineK = 1 - Math.pow(1 - clamp01((N - T_LINE) / 12), 2.5);
  // 白闪 3 帧（第一行 glitch 瞬间）
  const flash = N >= T_TXT1 ? N - T_TXT1 : -1;
  const flashK = tri(flash, 3);
  // 第一行：GlitchIn → 10215 起脉冲
  const pulse1 = emphasisPulse(N - T_PULSE, {peak: 1.11});
  // 第二行：16 帧缩放入场（10252；满态 10268 → 压黑起 10294=26 帧 / 全黑 10300=32 帧 ✓）
  const t2n = N - T_TXT2;
  const s2 = 0.62 + 0.38 * scaleIn(t2n, 16);
  const o2 = softOp(t2n, 10);
  // 行 1 柔光呼吸（常驻）
  const g1 = 0.5 + 0.12 * Math.sin((2 * Math.PI * N) / 30);

  // 线上缓行物：信封（左→右）+ 明信片（右→左），1.5px/帧
  const rideN = N - T_RIDE;
  const envX = 320 + RIDER_V * Math.max(0, rideN);
  const posX = 960 - RIDER_V * Math.max(0, rideN);

  return (
    <div style={{position: 'absolute', inset: 0}}>
      {/* ——— 三轮紫光横扫（扫光白名单②，紧凑登场） ——— */}
      <LightSweep N={N} rounds={SWEEPS} alphas={[0.6, 0.55, 0.55]} dy={4} />

      {/* ——— 发光白线（自中心向两端 draw-on；白闪时增亮） ——— */}
      {lineK > 0 ? (
        <div
          style={{
            ...abs(640 - (LINE.w / 2) * lineK, LINE.y - LINE.h / 2, LINE.w * lineK, LINE.h),
            background: flash >= 0 && flash < 3 ? WHITE : 'linear-gradient(90deg, rgba(255,255,255,.55), #FFFFFF 12%, #FFFFFF 88%, rgba(255,255,255,.55))',
            borderRadius: 2,
            boxShadow:
              flash >= 0 && flash < 3
                ? `0 0 ${Math.round(20 + 24 * flashK)}px ${Math.round(6 + 6 * flashK)}px rgba(255,255,255,.75), 0 0 64px 22px rgba(161,117,241,.5)`
                : '0 0 16px 5px rgba(255,255,255,.36), 0 0 60px 20px rgba(161,117,241,.32)',
          }}
        />
      ) : null}

      {/* ——— 线上缓行物（信封 ←左 / 明信片 右→，相向而行，画在大字之下 → 从字后穿过） ——— */}
      {rideN >= 0 ? (
        <div style={{position: 'absolute', inset: 0, opacity: softOp(rideN, 8)}}>
          <PacketIcon cx={envX} cy={LINE.y} w={44} h={30} />
          <SeqStamp cx={envX + 19} cy={LINE.y - 15} label={EXAMPLE.seqs[2]} size={21} scale={1} />
          <PostcardIcon cx={posX} cy={LINE.y} w={78} h={50} />
        </div>
      ) : null}

      {/* ——— 白闪（3 帧：中央辉光，在第一行大字之下） ——— */}
      {flash >= 0 && flash < 3 ? (
        <div
          style={{
            ...abs(640 - 330, 300 - 185, 660, 370),
            borderRadius: '50%',
            background: 'radial-gradient(ellipse, rgba(255,255,255,.5) 0%, rgba(255,255,255,.22) 40%, rgba(255,255,255,0) 72%)',
            opacity: [0.9, 0.55, 0.22][flash],
          }}
        />
      ) : null}

      {/* ——— 第一行大字：TCP never loses.（本镜唯一 glitch：rgbSplit 8 / slices 16，全片最后一次） ——— */}
      <div style={{position: 'absolute', inset: 0, transformOrigin: '640px 300px', transform: pulse1 === 1 ? undefined : `scale(${pulse1.toFixed(4)})`}}>
        <GlitchIn N={N} f0={T_TXT1} rgbSplit={8} slices={16} seed={11}>
          <CText
            cx={640}
            cy={300}
            size={72}
            weight={900}
            color={WHITE}
            letterSpacing={1}
            shadow={`0 0 24px rgba(102,45,248,${(0.6 * g1).toFixed(3)}), 0 0 8px rgba(255,255,255,.35)`}
            style={{WebkitTextStroke: `2.5px ${PURPLE}`, paintOrder: 'stroke fill'}}
          >
            TCP never loses.
          </CText>
        </GlitchIn>
      </div>

      {/* ——— 第二行大字：UDP never waits.（白+橙描边，缩放入场，不用 glitch） ——— */}
      {t2n >= 0 ? (
        <div style={{position: 'absolute', inset: 0, opacity: o2, transform: `scale(${s2.toFixed(4)})`, transformOrigin: '640px 432px'}}>
          <CText
            cx={640}
            cy={432}
            size={72}
            weight={900}
            color={WHITE}
            letterSpacing={1}
            shadow={`0 0 22px rgba(240,95,65,.55), 0 0 8px rgba(255,255,255,.3)`}
            style={{WebkitTextStroke: `2.5px ${ORANGE}`, paintOrder: 'stroke fill'}}
          >
            UDP never waits.
          </CText>
        </div>
      ) : null}

      {/* ——— 小灰字（片名回扣，第一行上方） ——— */}
      {N >= T_KICK ? (
        <div style={{position: 'absolute', inset: 0, opacity: softOp(N - T_KICK, 8)}}>
          <CText cx={640} cy={228} size={22} weight={500} family={FONT_MONO} color={GREY} letterSpacing={3}>TCP / UDP · two ways to travel</CText>
        </div>
      ) : null}
    </div>
  );
};
