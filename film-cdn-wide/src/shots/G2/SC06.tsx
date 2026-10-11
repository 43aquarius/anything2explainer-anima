import React from 'react';
import {useCurrentFrame} from 'remotion';
import {clamp01, easeOutCubic, FONT_MONO, powOutRemain} from '../../common';
import {CameraRig, HeroGlow} from '../../fx';
import {
  CText, Pill, PersonIcon, RackIcon, TechText, GREY, GREY_LIGHT, WHITE, abs, Svg,
  SoftIn, firstOp, softOp, exitOp, glowOffK,
} from '../../ui';
import {ShelfBig} from './g2ui';

/**
 * SC06 最近的货架 · N 1277–1418（S10：1285「你按下播放」/ 1319「不是在跟源站说话」/ 1371「是跟最近的货架」）
 * 版式：左 PersonIcon `you` + 播放键 ▶（1285 按下 + 波纹）；右 CacheShelf 货架（3 层 × 3 内容块，中层中块紫高亮 =
 *   `2 GB movie` 副本）+ 顶标签 `nearest edge` + HeroGlow（主角 340px）；远处 origin RackIcon（1319 降饱和缩小虚位）；
 *   用户 → 货架短线 draw-on + 光点跑（持续）。
 * 动效：1277 三件套 firstOp 入场｜1285 按键 4 帧按下 + 三圈波纹｜1319 origin 虚化（12 帧）；
 *   1371 货架 slideUp Δ120/18f + HeroGlow 点亮 + 中层块紫光 + `2 GB movie` 标签 + 短线 draw-on + 光点跑（持续）。
 * 运镜：33 帧 1→1.12 推向货架（1371–1404，随货架登场）。停留：段内不判。零 glitch。
 */
const F0 = 1277;
const TO = 1418;
const T_IN = 1277, T_PRESS = 1285, T_DIM = 1319, T_SHELF = 1371;

const USER = {cx: 240, cy: 425, size: 130};
const BTN = {cx: 405, cy: 425, r: 46};
const ORIGIN = {cx: 1112, cy: 200, w: 100, h: 165};
const SHELF = {cx: 855, cy: 405, w: 380, h: 340};
const LINK = {x0: 460, x1: 660, y: 470}; // 用户 → 货架短线
const TAG = {x: 490, y: 387, w: 156, h: 42};

export const SC06: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const exit = exitOp(N, TO, 8);
  const gk = glowOffK(N, TO);
  const inOp = firstOp(N - T_IN, 6);

  // 播放键按下（4 帧）+ 按下后常亮 BLOOM
  const pressN = N - T_PRESS;
  const dip = pressN >= 0 && pressN < 4 ? 1 - 0.1 * Math.sin((Math.PI * pressN) / 4) : 1;
  const btnGlow = pressN >= 0 ? `drop-shadow(0 0 6px rgba(255,255,255,${(0.55 * gk).toFixed(2)})` + ')' : undefined;

  // 按下波纹（三圈，12 帧错峰）
  const ripples = [0, 1, 2].map((i) => {
    const t = clamp01((N - (T_PRESS + i * 12)) / 24);
    return t > 0 && t < 1 ? {r: BTN.r + 10 + 78 * easeOutCubic(t), op: (1 - t) * 0.45} : null;
  });

  // 远处 origin：1319 降饱和 + 缩小 + 虚位
  const dimK = clamp01((N - T_DIM) / 12);
  const orgS = 1 - 0.35 * dimK;
  const orgOp = 1 - 0.62 * dimK;

  // 货架 slideUp Δ120 / 18 帧 + 高亮层
  const shelfY = SHELF.cy + 120 * powOutRemain(N - T_SHELF, 18, 2.5);
  const shelfOp = softOp(N - T_SHELF, 8);
  const litK = clamp01((N - (T_SHELF + 6)) / 10) * gk;

  // 用户 → 货架短线 draw-on（12 帧）+ 光点跑（持续）
  const linkP = easeOutCubic(clamp01((N - (T_SHELF + 6)) / 12));
  const dots = [0, 1].map((k) => {
    const x = LINK.x0 + (((N - (T_SHELF + 16)) * 5 + k * 100) % (LINK.x1 - LINK.x0));
    return {x, op: Math.min(1, (x - LINK.x0) / 30, (LINK.x1 - x) / 30) * (N >= T_SHELF + 16 ? 1 : 0)};
  });

  return (
    <CameraRig N={N} keys={[{f: F0, x: 640, y: 360, s: 1}, {f: T_SHELF, x: 640, y: 360, s: 1}, {f: 1404, x: 640, y: 360, s: 1.12}]}>
      <div style={{...abs(0, 0, 1280, 720), opacity: exit}}>
        {/* 左：用户 + 播放键 */}
        <div style={{...abs(0, 0, 1280, 720), opacity: inOp}}>
          <PersonIcon cx={USER.cx} cy={USER.cy} size={USER.size} label="you" labelSize={24} />
          <div style={{position: 'absolute', left: BTN.cx - BTN.r, top: BTN.cy - BTN.r, width: 2 * BTN.r, height: 2 * BTN.r, transform: `scale(${dip.toFixed(3)})`}}>
            <svg width={2 * BTN.r} height={2 * BTN.r} viewBox="0 0 100 100" style={{position: 'absolute', inset: 0, filter: btnGlow}}>
              <circle cx={50} cy={50} r={46} fill="#000" stroke={WHITE} strokeWidth={3.5} />
              <polygon points="38,30 74,50 38,70" fill={WHITE} strokeLinejoin="round" />
            </svg>
          </div>
        </div>
        {ripples.some((r) => r) ? (
          <Svg bloom={false}>
            {ripples.map((r, i) => r ? <circle key={i} cx={BTN.cx} cy={BTN.cy} r={r.r.toFixed(1)} fill="none" stroke={WHITE} strokeWidth={2.5} opacity={r.op} /> : null)}
          </Svg>
        ) : null}

        {/* 远处 origin（1319 虚位："不是它"） */}
        <div style={{position: 'absolute', inset: 0, opacity: orgOp * inOp, transform: `translate(${ORIGIN.cx}px,${ORIGIN.cy}px) scale(${orgS.toFixed(3)}) translate(${-ORIGIN.cx}px,${-ORIGIN.cy}px)`, filter: `saturate(${(1 - 0.8 * dimK).toFixed(2)})`}}>
          <RackIcon cx={ORIGIN.cx} cy={ORIGIN.cy} w={ORIGIN.w} h={ORIGIN.h} units={5} lit={3} label="origin" labelSize={22} color={GREY_LIGHT} />
        </div>

        {/* 右：最近货架（主角） */}
        {shelfOp > 0 ? (
          <div style={{...abs(0, 0, 1280, 720), opacity: shelfOp, transform: `translateY(${(shelfY - SHELF.cy).toFixed(1)}px)`}}>
            <HeroGlow x={SHELF.cx - SHELF.w / 2} y={SHELF.cy - SHELF.h / 2} w={SHELF.w} h={SHELF.h} N={N} k={clamp01((N - (T_SHELF + 2)) / 12) * gk} />
            <ShelfBig cx={SHELF.cx} cy={SHELF.cy} w={SHELF.w} h={SHELF.h} litK={litK} tagOp={clamp01((N - (T_SHELF + 8)) / 8)} />
            <SoftIn N={N} f0={T_SHELF + 6}>
              <TechText cx={SHELF.cx} cy={SHELF.cy - SHELF.h / 2 - 26} text="nearest edge" fontSize={30} />
            </SoftIn>
            {/* `2 GB movie` 副本标签 + 指向中层高亮块 */}
            <SoftIn N={N} f0={T_SHELF + 8}>
              <Pill x={TAG.x} y={TAG.y} w={TAG.w} h={TAG.h} r={8} fontSize={22} weight={600} family={FONT_MONO}
                text="2 GB movie" color={WHITE} stroke={GREY} sw={1.5} />
            </SoftIn>
          </div>
        ) : null}
        {litK > 0 ? (
          <div style={{...abs(0, 0, 1280, 720), opacity: clamp01((N - (T_SHELF + 8)) / 8)}}>
            <div style={{...abs(650, 406, 150 * easeOutCubic(clamp01((N - (T_SHELF + 8)) / 10)), 2.5), background: WHITE, opacity: 0.75}} />
          </div>
        ) : null}

        {/* 用户 → 货架短线 draw-on + 光点跑（持续） */}
        {linkP > 0 ? (
          <div style={{...abs(LINK.x0, LINK.y - 1.5, (LINK.x1 - LINK.x0) * linkP, 3), background: WHITE, opacity: 0.9}} />
        ) : null}
        {dots.some((d) => d.op > 0.02) ? (
          <Svg>
            {dots.map((d, i) => d.op > 0.02 ? (
              <g key={i} opacity={d.op.toFixed(2)}>
                <circle cx={d.x} cy={LINK.y} r={8.5} fill="rgba(102,48,248,0.32)" />
                <circle cx={d.x} cy={LINK.y} r={4} fill={WHITE} />
              </g>
            ) : null)}
          </Svg>
        ) : null}
      </div>
    </CameraRig>
  );
};
