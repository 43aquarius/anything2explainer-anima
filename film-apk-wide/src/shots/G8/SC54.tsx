import React from 'react';
import {useCurrentFrame} from 'remotion';
import {GlitchIn, clamp01, emphasisPulse, FONT_MONO, FONT_WIDE} from '../../common';
import {CText, LineArrow, ParcelIcon, WaxSeal, PURPLE, WHITE, exitOp, firstOp, glowOffK, softOp} from '../../ui';

/**
 * SC54 还是 zip · N 8056–8265（S54 8064–8243：8064「base.apk plus config APKs.」/ 8161「Still APKs. Still signed zips.」¶）
 * 中央公式（等宽 30px 白）：`base.apk + config.apk` 8064 起打字机（2f/字）→ 8161 大箭头 draw-on 12f（640,272→640,344）→
 *   8175 `still zips`（Audiowide 96px 白 + 紫描边 + 紫硬投影）**GlitchIn rgbSplit 6（本镜唯一 glitch）** + 8187 emphasisPulse +
 *   紫描边光晕 30f 呼吸（持续）→ 8193/8195 小包裹（紫边 + 封条）与小 WaxSeal 2 帧错峰 SoftIn（右下侧，呼应第 3 章）。
 * 停留：大字 + 脉冲 + 象征物落位 ~8217 → 离场 8257（TO−8），40f ≥30 ✓（¶）。末 8 帧归零（大字光晕先灭；SC55 自 8266 起新照片场景）。
 * 零其它 glitch。光：大字紫描边光晕（唯一大面积）+ 封印小紫光。
 */
const F0 = 8056, TO = 8265;
const B1 = 8064, B2 = 8161;

const FORMULA = 'base.apk + config.apk';
const TYPE_SPEED = 2; // 帧/字
const BIG_T = B2 + 14; // 8175：still zips GlitchIn
const PULSE_T = BIG_T + 12; // 8187：emphasisPulse
const SIDE_T = [BIG_T + 18, BIG_T + 20]; // 8193/8195：小包裹 / 小封印

const BIG = {cx: 640, cy: 428, size: 96};
const ARROW = {x: 640, y0: 272, y1: 344};
const SIDE = {parcel: {cx: 1025, cy: 445, w: 112, h: 80}, seal: {cx: 1025, cy: 468, r: 36}};

export const SC54: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const exOp = exitOp(N, TO, 8);
  if (exOp <= 0) return null;
  const glowK = glowOffK(N, TO, 6, 8);

  // 公式打字机
  const fn = N - B1;
  const chars = Math.max(0, Math.floor(fn / TYPE_SPEED));
  const formula = FORMULA.slice(0, Math.min(FORMULA.length, chars));

  // 大箭头 draw-on 12f
  const arrowP = clamp01((N - B2) / 12);

  // 大字：紫描边光晕 30f 呼吸 + emphasisPulse
  const breathe = Math.sin((2 * Math.PI * N) / 30);
  const bigShadow = `6px 6px 0 ${PURPLE}, 0 0 ${(15 + 9 * breathe).toFixed(1)}px rgba(102,45,248,${(0.48 * glowK).toFixed(2)})`;
  const pulse = emphasisPulse(N - PULSE_T, {peak: 1.11});

  return (
    <div style={{position: 'absolute', inset: 0, opacity: exOp}}>
      {/* 公式：base.apk + config.apk（打字机） */}
      <CText cx={640} cy={232} size={30} weight={600} family={FONT_MONO} color={WHITE} letterSpacing={1} opacity={fn < 0 ? 0 : firstOp(fn, 6)}>
        {formula}
        {fn >= 0 && chars < FORMULA.length && Math.floor(N / 2) % 2 === 0 ? '_' : ''}
      </CText>

      {/* 大箭头（自根部长出，指向大字） */}
      {arrowP > 0 ? <LineArrow x0={ARROW.x} y0={ARROW.y0} x1={ARROW.x} y1={ARROW.y1} p={arrowP} rodW={5} headL={26} headW={32} opacity={exOp} /> : null}

      {/* 大字 still zips：GlitchIn（本镜唯一 glitch）+ emphasisPulse + 光晕呼吸 */}
      <div style={{position: 'absolute', inset: 0, transform: `scale(${pulse.toFixed(4)})`, transformOrigin: `${BIG.cx}px ${BIG.cy}px`}}>
        <GlitchIn N={N} f0={BIG_T} rgbSplit={6} seed={54}>
          <CText
            cx={BIG.cx}
            cy={BIG.cy}
            size={BIG.size}
            weight={400}
            family={FONT_WIDE}
            color={WHITE}
            letterSpacing={2}
            shadow={bigShadow}
            style={{WebkitTextStroke: `2.5px ${PURPLE}`, paintOrder: 'stroke fill'}}
          >
            {'still zips'}
          </CText>
        </GlitchIn>
      </div>

      {/* 小包裹 + 小火漆（呼应第 3 章；2 帧错峰 SoftIn） */}
      <div style={{position: 'absolute', inset: 0, opacity: N < SIDE_T[0] ? 0 : softOp(N - SIDE_T[0], 8)}}>
        <ParcelIcon cx={SIDE.parcel.cx} cy={SIDE.parcel.cy} w={SIDE.parcel.w} h={SIDE.parcel.h} accent sealP={1} label={'APK'} />
      </div>
      <div style={{position: 'absolute', inset: 0, opacity: N < SIDE_T[1] ? 0 : softOp(N - SIDE_T[1], 8)}}>
        <WaxSeal cx={SIDE.seal.cx} cy={SIDE.seal.cy} r={SIDE.seal.r} stampP={1} glow={glowK > 0.02} />
      </div>
    </div>
  );
};

export default SC54;
