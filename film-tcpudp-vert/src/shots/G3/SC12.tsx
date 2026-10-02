import React from 'react';
import {useCurrentFrame} from 'remotion';
import {GlitchIn, clamp01, emphasisPulse, FONT_MONO, fitSize} from '../../common';
import {CText, PacketIcon, PostcardIcon, SeqStamp, EXAMPLE, abs, softOp, scaleIn, WHITE, GREY, PURPLE, ORANGE} from '../../ui';
import {LightSweep} from '../../fx';

/**
 * SC12 两种承诺（收尾）· N 1677–1822（S14 1685–1730 + S15 1741–1782 ¶ 片末 = {S14.from−8}–{TOTAL}，不归零——压黑层接管）
 * —— **全片结尾 · 象征物 + 回扣 · 高光时刻（扫光白名单唯一镜头，紧凑版）**
 * 版式（竖版安全区 y240–990 / x40–620，中轴 360）：
 *   清场 → 上下两行大字居中：`TCP never loses.`（Noto 900 白+紫描边，cy 520）、`UDP never waits.`（同款白+橙描边，cy 640）；
 *   两行之间一条发光竖线（x360，y420–740，白 3px 左右柔光）自中心 draw-on（12 帧）——即 SC01 的「同一条线」竖置回扣，
 *   画在大字之下（从字后穿过）；线上端一枚小信封（+#1 章）缓行向上、下端一枚小明信片缓行向下（各 1.5px/帧，相背而行，直到压黑）；
 *   最下方小灰字 `TCP / UDP · two ways to travel`（mono 24px，y940，片名回扣）。
 * 时序：1677+4=1681/1691/1701 三轮紫光横扫（LightSweep，bars 定制竖版 y430–590，α .6/.55/.55）；
 *   1687 竖线自中心 draw-on 12 帧；1685 第一行大字 GlitchIn（rgbSplit 8 / slices 16，全片最后一次 glitch）
 *   + 1685–1687 白闪 3 帧（中央辉光 + 线增亮）+ 1697 emphasisPulse 1.11；
 *   1733 第二行大字缩放入场（**S15.c1(1741)−8 前挂：分镜表原 1737（−4），可读性预算算得 1737+16=1753 →
 *   压黑起 1776（=S15.to−6，endingFade=6 覆盖层自该帧起 fadeIn）仅 23 帧 <30，按派单授权再提前 4 帧 → 1733，
 *   且入场 16→12 帧 → 满态 1745，压黑起 1776−1745 = **31 帧 ≥30 ✓**（见 BUILD_NOTES）**，白+橙描边微光、不用 glitch；
 *   1741 小灰字 SoftIn（=S15.c1）；1701 起信封上行 / 明信片下行 1.5px/帧缓行到压黑（持续动作）。
 * endingFade=6 压黑从 1776 起（覆盖层），本镜头**不归零离场**；大字按 fitSize 收到 ~59px（分镜表 68px：竖版
 *   中轴安全宽 ≈500，68px 满尺寸 574px 出 x620 安全区，同 G1 SC01 `TWO RULES` 110→76 的处理）。
 * 运镜：无（分镜表「竖线 draw-on 后静止」）。主角：双行大字 + 发光线组（y420–740 = 340px）；光 = 白闪 + 紫描边光 / 橙微光。
 */
const F0 = 1677;
const TO = 1822;
const SWEEPS = [1681, 1691, 1701];
const T_TXT1 = 1685, T_LINE = 1687, T_PULSE = 1697, T_RIDE = 1701;
const T_TXT2 = 1733, TXT2_LEN = 12, T_KICK = 1741;
const FADE_AT = 1776; // = S15.to − endingFade(6)：压黑层起始帧（覆盖层渲染，本镜头不画）

const LINE = {x: 360, cy: 580, half: 160, w: 3};
const TXT1 = {cy: 520}, TXT2 = {cy: 640};
const KICK = {cy: 940};
const RIDER_V = 1.5;
const BARS: Array<[number, number, number, number]> = [[430, 6, 360, 0], [510, 10, 480, 2], [590, 6, 330, 4]];

const tri = (n: number, len = 3) => (n <= 0 || n >= len ? 0 : 1 - n / len);

// 竖版中轴安全宽 ≈500（x40–620 减 glitch 错位余量）：68px 满宽 574px 放不下 → fitSize（同 G1 SC01 的 TWO RULES 处理）
const bigSize = fitSize('TCP never loses.', 508, 68, 56, 1, 0.5);

export const SC12: React.FC = () => {
  const N = useCurrentFrame() + F0;

  // —— 竖线自中心 draw-on（12 帧，幂 2.5 缓出）——
  const lineK = 1 - Math.pow(1 - clamp01((N - T_LINE) / 12), 2.5);
  // —— 白闪 3 帧（第一行 glitch 瞬间）——
  const flash = N >= T_TXT1 ? N - T_TXT1 : -1;
  const flashK = tri(flash, 3);
  // —— 第一行脉冲 + 柔光呼吸 ——
  const pulse1 = emphasisPulse(N - T_PULSE, {peak: 1.11});
  const g1 = 0.5 + 0.12 * Math.sin((2 * Math.PI * N) / 30);
  // —— 第二行：12 帧缩放入场（1733，满态 1745 → 压黑起 1776 = 31 帧 ≥30 ✓）——
  const t2n = N - T_TXT2;
  const s2 = 0.62 + 0.38 * scaleIn(t2n, TXT2_LEN);
  const o2 = softOp(t2n, 10);
  // —— 线上缓行物（相背而行，到压黑）——
  const rideN = N - T_RIDE;
  const envY = 414 - RIDER_V * Math.max(0, rideN);
  const posY = 746 + RIDER_V * Math.max(0, rideN);

  return (
    <div style={{position: 'absolute', inset: 0}}>
      {/* ——— 三轮紫光横扫（扫光白名单唯一镜头，紧凑登场；bars 定制竖版 y430–590）——— */}
      <LightSweep N={N} rounds={SWEEPS} alphas={[0.6, 0.55, 0.55]} bars={BARS} />

      {/* ——— 发光竖线（x360 y420–740，自中心 draw-on；白闪时增亮；画在大字之下）——— */}
      {lineK > 0 ? (
        <div
          style={{
            ...abs(LINE.x - LINE.w / 2, LINE.cy - LINE.half * lineK, LINE.w, LINE.half * 2 * lineK),
            background: flash >= 0 && flash < 3 ? WHITE : 'linear-gradient(180deg, rgba(255,255,255,.55), #FFFFFF 12%, #FFFFFF 88%, rgba(255,255,255,.55))',
            borderRadius: 2,
            boxShadow:
              flash >= 0 && flash < 3
                ? `0 0 ${Math.round(20 + 24 * flashK)}px ${Math.round(6 + 6 * flashK)}px rgba(255,255,255,.75), 0 0 64px 22px rgba(161,117,241,.5)`
                : '0 0 16px 5px rgba(255,255,255,.36), 0 0 60px 20px rgba(161,117,241,.32)',
          }}
        />
      ) : null}

      {/* ——— 线端缓行物：信封上行（TCP）+ 明信片下行（UDP），1.5px/帧直到压黑 ——— */}
      {rideN >= 0 ? (
        <div style={{position: 'absolute', inset: 0, opacity: softOp(rideN, 8)}}>
          <PacketIcon cx={360} cy={envY} w={44} h={30} />
          <SeqStamp cx={382} cy={envY - 15} label={EXAMPLE.seqs[0]} size={22} scale={1} />
          <PostcardIcon cx={360} cy={posY} w={78} h={50} />
        </div>
      ) : null}

      {/* ——— 白闪（3 帧：中央辉光，在第一行大字之下）——— */}
      {flash >= 0 && flash < 3 ? (
        <div
          style={{
            ...abs(360 - 300, 580 - 210, 600, 420),
            borderRadius: '50%',
            background: 'radial-gradient(ellipse, rgba(255,255,255,.5) 0%, rgba(255,255,255,.22) 40%, rgba(255,255,255,0) 72%)',
            opacity: [0.9, 0.55, 0.22][flash],
          }}
        />
      ) : null}

      {/* ——— 第一行大字：TCP never loses.（本镜唯一 glitch：rgbSplit 8 / slices 16，全片最后一次）——— */}
      <div style={{position: 'absolute', inset: 0, transformOrigin: '360px 520px', transform: pulse1 === 1 ? undefined : `scale(${pulse1.toFixed(4)})`}}>
        <GlitchIn N={N} f0={T_TXT1} rgbSplit={8} slices={16} seed={11}>
          <CText
            cx={360}
            cy={TXT1.cy}
            size={bigSize}
            weight={900}
            color={WHITE}
            letterSpacing={0.5}
            shadow={`0 0 24px rgba(102,45,248,${(0.6 * g1).toFixed(3)}), 0 0 8px rgba(255,255,255,.35)`}
            style={{WebkitTextStroke: `2.5px ${PURPLE}`, paintOrder: 'stroke fill'}}
          >
            TCP never loses.
          </CText>
        </GlitchIn>
      </div>

      {/* ——— 第二行大字：UDP never waits.（白+橙描边微光，缩放入场，不用 glitch）——— */}
      {t2n >= 0 ? (
        <div style={{position: 'absolute', inset: 0, opacity: o2, transform: `scale(${s2.toFixed(4)})`, transformOrigin: '360px 640px'}}>
          <CText
            cx={360}
            cy={TXT2.cy}
            size={bigSize}
            weight={900}
            color={WHITE}
            letterSpacing={0.5}
            shadow={`0 0 22px rgba(240,95,65,.55), 0 0 8px rgba(255,255,255,.3)`}
            style={{WebkitTextStroke: `2.5px ${ORANGE}`, paintOrder: 'stroke fill'}}
          >
            UDP never waits.
          </CText>
        </div>
      ) : null}

      {/* ——— 小灰字（片名回扣，=S15.c1）——— */}
      {N >= T_KICK ? (
        <div style={{position: 'absolute', inset: 0, opacity: softOp(N - T_KICK, 8)}}>
          <CText cx={360} cy={KICK.cy} size={24} weight={500} family={FONT_MONO} color={GREY} letterSpacing={3}>TCP / UDP · two ways to travel</CText>
        </div>
      ) : null}
    </div>
  );
};
