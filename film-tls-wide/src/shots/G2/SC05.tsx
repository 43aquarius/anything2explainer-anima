import React from 'react';
import {useCurrentFrame} from 'remotion';
import {clamp01, easeInOutPow, kf, powOutRemain} from '../../common';
import {CText, LineArrow, Svg, BrowserWin, EyeGlyph, GREY, GREY_MID, WHITE, SoftIn, softOp, firstOp, exitOp, glowOffK, slideUp} from '../../ui';
import {CameraRig} from '../../fx';
import {YearRoll, MiniSidebar, CreditCard} from './parts';

/**
 * SC05 问题很老 · N 913–1122（S06–S07：921「这问题很老」/ 962「In 1994, Netscape…」/ 1036「…credit-card number」/ 1083「…open network」）
 * 版式：左半 = 过去（`1994` Orbitron 96 灰 + `Netscape` 灰 26 + 旧浏览器卡缩微 0.48×，地址栏 `https` 雏形打字）；
 *       右半 = 险境（信用卡 200×130 白描边 + HeroGlow，悬在"开放网络"同心弧线上方，弧线间 2 只眼睛）。
 * 承接 SC04：913 侧栏缩微回声入场（SC04 已在 862 归零、段间空档 50 帧，此处按分镜表补一枚缩小侧栏做视觉回环），
 *       921 侧栏 16 帧缩移右上角压暗；`the problem was old` 灰字 SoftIn + 向左长箭头 draw-on（指向过去）。
 * 零 glitch（YearRoll 即焦点）。运镜：1.0→1.05 慢推贯穿（内容留 x 89–1191 / y 122–607 已核）。
 * 停留：段内不判（S06/S07 非段末；末拍 1083 节拍 + 固定末 8 帧清场给 SC06 扫光 → 结构上限）。
 */
const F0 = 913;
const TO = 1122;
const B1 = 921, B2 = 962, B3 = 1036, B4 = 1083; // 字幕块起始（节拍）

const CAM_KEYS = [
  {f: F0, x: 640, y: 360, s: 1.0},
  {f: TO, x: 640, y: 360, s: 1.05},
];

// 侧栏回声：913 入场（0.62×，右中）→ 921 起 16 帧缩移右上角（0.26×）压暗
const SB_FROM = {cx: 940, cy: 350, s: 0.62};
const SB_TO = {cx: 1085, cy: 190, s: 0.26};

// 开放网络弧线：圆心 (950,335)，下半圆；波动 26 帧周期错相
const ARC_C = {x: 950, y: 335};
const ARC_R = [120, 150, 180, 210];

export const SC05: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const exOp = exitOp(N, TO, 8);

  // ---- 侧栏承接 ----
  const tMove = easeInOutPow(2.5)(clamp01((N - B1) / 16));
  const sbCx = SB_FROM.cx + (SB_TO.cx - SB_FROM.cx) * tMove;
  const sbCy = SB_FROM.cy + (SB_TO.cy - SB_FROM.cy) * tMove;
  const sbS = SB_FROM.s + (SB_TO.s - SB_FROM.s) * tMove;
  const sbOp = firstOp(N - F0, 6) * (1 - 0.2 * tMove) * exOp;

  // ---- 信用卡 ----
  const dropN = N - B3;
  const landed = dropN >= 18;
  const bob = landed ? 4 * Math.sin((2 * Math.PI * (N - B3 - 18)) / 52) : 0; // 悬停轻浮动（"悬在上方"）
  const cardCy = 300 - 90 * powOutRemain(dropN, 18, 2.5) + bob;
  const cardGlow = kf(N, [[1046, 0], [1058, 0.55]]) * glowOffK(N, TO, 6, 8);

  // ---- 弧线（draw-on 后从 1083 起波动） ----
  const arcPulse = kf(N, [[B4, 0], [B4 + 8, 6]]);
  const arcDraw = (i: number) => clamp01((N - (1056 + 3 * i)) / 12);
  const arcR = (i: number) => ARC_R[i] + arcPulse * Math.sin((2 * Math.PI * N) / 26 + i * 1.1);

  return (
    <CameraRig N={N} keys={CAM_KEYS}>
      {/* 侧栏缩微回声（右上角压暗常驻） */}
      <MiniSidebar cx={sbCx} cy={sbCy} s={sbS} opacity={sbOp} dim={tMove} />

      {/* 灰字 + 向左长箭头（指向过去） */}
      <SoftIn N={N} f0={B1} len={8} dy={10}>
        <CText cx={620} cy={195} size={30} weight={700} color={GREY} letterSpacing={1}>the problem was old</CText>
      </SoftIn>
      <Svg opacity={exOp}>
        <LineArrow x0={890} y0={240} x1={420} y1={240} p={clamp01((N - 924) / 18)} rodW={3} headW={20} headL={18}
          opacity={clamp01((N - 924) / 6) * (1 - clamp01((N - 1004) / 12))} />
      </Svg>

      {/* 左半：过去 */}
      <div style={{position: 'absolute', inset: 0, opacity: exOp}}>
        <YearRoll N={N} f0={B2} cx={360} cy={295} value="1994" size={96} />
        <SoftIn N={N} f0={964} len={8}>
          <CText cx={360} cy={360} size={26} weight={600} color={GREY} letterSpacing={2}>Netscape</CText>
        </SoftIn>
      </div>
      {/* 旧浏览器卡（0.48×；地址栏 https 雏形打字 970–1015） */}
      <div style={{position: 'absolute', inset: 0, opacity: exOp}}>
        <div style={{position: 'absolute', left: 0, top: 0, opacity: softOp(N - B2, 10)}}>
          <BrowserWin x={248} y={385 + slideUp(N - B2, 100, 22)} w={225} h={182} url="https"
            typed={kf(N, [[970, 0], [1015, 5]])} skeleton={3} skelLit={0} barColor={GREY_MID} />
        </div>
      </div>

      {/* 右半：信用卡 + 开放网络弧线 + 眼睛 */}
      <CreditCard cx={935} cy={cardCy} N={N} f0num={1056} glowK={cardGlow} opacity={exOp} />
      <Svg opacity={exOp}>
        {ARC_R.map((_, i) => {
          const p = arcDraw(i);
          if (p <= 0) return null;
          const r = arcR(i);
          const half = Math.PI * r;
          return <path key={i} d={`M ${ARC_C.x - r} ${ARC_C.y} A ${r} ${r} 0 0 0 ${ARC_C.x + r} ${ARC_C.y}`} fill="none" stroke={WHITE} strokeWidth={2.5}
            strokeDasharray={half} strokeDashoffset={half * (1 - p)} opacity={0.85} />;
        })}
      </Svg>
      {/* 弧线间的 2 只眼睛（1083 睁开："空气里都是耳朵"） */}
      <div style={{position: 'absolute', inset: 0, opacity: exOp}}>
        <EyeGlyph cx={868} cy={472} w={44} open={clamp01((N - B4) / 6)} />
        <EyeGlyph cx={1032} cy={500} w={44} open={clamp01((N - B4 - 3) / 6)} />
      </div>
    </CameraRig>
  );
};
