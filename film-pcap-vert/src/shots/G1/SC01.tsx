import React from 'react';
import {useCurrentFrame} from 'remotion';
import {clamp01, keyframes, FONT_ORB} from '../../common';
import {BrowserMock, CText, GREY, PURPLE, WHITE, abs, fadeIn, slideUp, exitOp, SoftIn} from '../../ui';

/**
 * SC01 九秒症状 · N 33–145（S01 41–143：41「nine seconds」/ 112「Customers are leaving」）
 * 竖版上下结构：上半 BrowserMock (100,260,520,380) url=shop.example/checkout + 顶部载入条；
 *   下半 (360,800) Orbitron 120px 计时「0.0 s → 9.0 s」（= EXAMPLE.pageLoad 终值），下方灰字 page load。
 * 节拍：41 浏览器 slideUp Δ100/22 + 8 帧淡入；计时 41→111 kf 线性 0.0→9.0（~70 帧落定，对齐 S01 第一块 41–111）；
 *   载入条与计时同步爬满（111 到头；比「1.2px/帧」更贴 9 s 语义，同横版 SC01 的裁定，见 BUILD_NOTES）；
 *   112 到位白闪 7 帧 + 浏览器第 5/6 根骨架线变灰（放弃感）；137–145 计时组归零淡出。
 *   浏览器**不随组淡出**——SC02 以同参数承接（settled 态 = 载入条满 + 两根灰线），交界帧无缝。
 * 持续：计时数字（→111）+ 载入条爬行（→111）。停留：段内不判（S01 非 ¶）。末拍后静止 ~12 帧 <3 s。
 * 主角：计时数字 120px（≥96），光 = 紫硬投影 + 白 TEXT_GLOW。本镜零 glitch（白名单）。
 */
const F0 = 33;
const T_IN = 41;
const T_GIVEUP = 112;
const T_LAND = 111; // 计时/载入条落定帧（= S01 第一块末）
const TO = 145;
const BR = {x: 100, y: 260, w: 520, h: 380};
const TIMER = {cx: 360, cy: 800};
/** BrowserMock(skeleton=6) 第 5/6 根骨架线的几何（局部坐标，公式与图元一致：top = 80 + i*54） */
const DIM_LINES = [
  {y: 296, w: 0.73 * (BR.w - 60)},
  {y: 350, w: 0.55 * (BR.w - 60)},
];
const tri = (n: number, len = 8) => (n <= 0 || n >= len ? 0 : n < len / 2 ? n / (len / 2) : 1 - (n - len / 2) / (len / 2));

export const SC01: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const op = exitOp(N, TO, 8); // 只作用于计时组；浏览器由 SC02 承接不淡出
  const bn = N - T_IN;
  const by = BR.y + slideUp(bn, 100, 22);
  const bOp = bn < 0 ? 0 : fadeIn(bn, 8);
  const prog = clamp01((N - T_IN) / (T_LAND - T_IN));
  const v = keyframes(N, [[T_IN, 0], [T_LAND, 9]]);
  const flash = tri(N - T_GIVEUP, 7);
  const greyK = clamp01((N - (T_GIVEUP + 3)) / 10);
  return (
    <div style={{position: 'absolute', inset: 0}}>
      {/* 浏览器（SC02 以同参数承接，settled 态 = 载入条满 + 两根灰线） */}
      <div style={{...abs(BR.x, by, BR.w, BR.h), opacity: bOp}}>
        <BrowserMock x={0} y={0} w={BR.w} h={BR.h} skeleton={6} progress={prog} />
        {greyK > 0
          ? DIM_LINES.map((l, i) => <div key={i} style={{...abs(30, l.y, l.w, 6), background: '#3c3c3e', opacity: greyK * 0.95}} />)
          : null}
      </div>
      {/* 计时器（主角） */}
      <SoftIn N={N} f0={T_IN}>
        <div style={{position: 'absolute', inset: 0, opacity: op, filter: flash > 0 ? `brightness(${(1 + 0.6 * flash).toFixed(2)})` : undefined}}>
          <CText
            cx={TIMER.cx}
            cy={TIMER.cy}
            size={120}
            weight={700}
            family={FONT_ORB}
            color={WHITE}
            letterSpacing={2}
            shadow={`6px 6px 0 ${PURPLE}, 0 0 28px rgba(102,45,248,.45), 0 0 12px rgba(255,255,255,.5)`}
            style={{fontVariantNumeric: 'tabular-nums'}}
          >
            {v.toFixed(1)} s
          </CText>
          <CText cx={TIMER.cx} cy={TIMER.cy + 92} size={26} weight={600} color={GREY}>
            page load
          </CText>
        </div>
      </SoftIn>
    </div>
  );
};
