import React from 'react';
import {useCurrentFrame} from 'remotion';
import {clamp01, kf, FONT_ORB} from '../../common';
import {BrowserMock, CText, EXAMPLE, GREY, PURPLE, WHITE, abs, fadeIn, slideUp, exitOp, SoftIn} from '../../ui';

/**
 * SC01 九秒症状 · N 78–209（S01 86–207：86「checkout 页九秒」/ 171「Customers give up」）
 * 版式：左 BrowserMock (90,180,470,380) url=shop.example/checkout + 顶部载入条；右 (890,330) Orbitron 110 计时
 *       「0.0 s → 9.0 s」（= EXAMPLE.pageLoad 终值），下方灰字 page load。
 * 节拍：86 浏览器 slideUp Δ120/22 + 8 帧淡入（前 4 帧越过 y637 时 opacity ≤.5，样片认可模式）；
 *       计时 86→171 kf 线性 0.0→9.0；载入条与计时同步爬满（171 到头；比「1.5px/帧」更贴 9 s 语义，见 BUILD_NOTES）；
 *       171 计时落定 → 白闪 7 帧 + 浏览器第 5/6 根骨架线变灰（放弃感，几何按 BrowserMock 公式复刻）；
 *       201–209 整组归零淡出（exitOp）。
 * 持续：计时数字（→171）+ 载入条爬行（全镜）。停留：段内不判（S01 非 ¶）。
 * 主角：计时数字 110px（≥96），光 = 紫硬投影 + 白 TEXT_GLOW。本镜零 glitch（白名单）。
 */
const F0 = 78;
const T_IN = 86;
const T_GIVEUP = 171;
const BR = {x: 90, y: 180, w: 470, h: 380};
const TIMER = {cx: 890, cy: 330};
/** BrowserMock(skeleton=6) 第 5/6 根骨架线的几何（局部坐标，公式与图元一致：top = 80 + i*54，w = 系数*(w-60)） */
const DIM_LINES = [
  {y: 296, w: 0.73 * (BR.w - 60)},
  {y: 350, w: 0.55 * (BR.w - 60)},
];
const tri = (n: number, len = 8) => (n <= 0 || n >= len ? 0 : n < len / 2 ? n / (len / 2) : 1 - (n - len / 2) / (len / 2));

export const SC01: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const op = exitOp(N, 209, 8);
  const bn = N - T_IN;
  const by = BR.y + slideUp(bn, 120, 22);
  const bOp = bn < 0 ? 0 : fadeIn(bn, 8);
  // 载入条与计时同步：0→1 于 86–171（页面 9 秒加载完成）
  const prog = clamp01((N - T_IN) / (T_GIVEUP - T_IN));
  const v = kf(N, [[T_IN, 0], [T_IN + 76, 9]]); // v2: 计数 86→162 落定，留足段末 hold（原到 171 只剩 24f）
  const flash = tri(N - T_GIVEUP, 7);
  const greyK = clamp01((N - (T_GIVEUP + 3)) / 10);
  return (
    <div style={{position: 'absolute', inset: 0, opacity: op}}>
      {/* 浏览器（SC03 将以同参数承接，settled 态 = 载入条满 + 两根灰线） */}
      <div style={{...abs(BR.x, by, BR.w, BR.h), opacity: bOp}}>
        <BrowserMock x={0} y={0} w={BR.w} h={BR.h} skeleton={6} progress={prog} />
        {greyK > 0
          ? DIM_LINES.map((l, i) => <div key={i} style={{...abs(30, l.y, l.w, 6), background: '#3c3c3e', opacity: greyK * 0.95}} />)
          : null}
      </div>
      {/* 计时器（主角） */}
      <SoftIn N={N} f0={T_IN}>
        <div style={{position: 'absolute', inset: 0, filter: flash > 0 ? `brightness(${(1 + 0.6 * flash).toFixed(2)})` : undefined}}>
          <CText
            cx={TIMER.cx}
            cy={TIMER.cy}
            size={110}
            weight={700}
            family={FONT_ORB}
            color={WHITE}
            letterSpacing={2}
            dy={-2}
            shadow={`6px 6px 0 ${PURPLE}, 0 0 28px rgba(102,45,248,.45), 0 0 12px rgba(255,255,255,.5)`}
            style={{fontVariantNumeric: 'tabular-nums'}}
          >
            {v.toFixed(1)} s
          </CText>
          <CText cx={TIMER.cx} cy={TIMER.cy + 88} size={26} weight={600} color={GREY}>
            page load
          </CText>
        </div>
      </SoftIn>
    </div>
  );
};
