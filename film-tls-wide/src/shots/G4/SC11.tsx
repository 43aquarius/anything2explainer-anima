import React from 'react';
import {useCurrentFrame} from 'remotion';
import {FONT_ORB, FONT_TECH, clamp01, easeInOutPow, easeOutCubic, emphasisPulse} from '../../common';
import {
  CText,
  KeyIcon,
  MonoText,
  Pill,
  PURPLE,
  PURPLE_LIGHT,
  RED_DEEP,
  GREY,
  WHITE,
  abs,
  exitOp,
  firstOp,
  glowPurpleS,
  glowOffK,
} from '../../ui';
import {GlitchIn} from '../../common';
import {CameraRig} from '../../fx';
import {SealBand} from './parts';

/**
 * SC11 AES-GCM 封流（2146–2444，S15–S16）
 * 节拍：2148 双钥匙承接入场（SC10 末态重入，段间 45 帧空镜后 soft 出现）→ 2154 缩到左上角(16f 承接)
 *  + 封流带 draw-on(24f，车道线 + 信封随扫过现身) → 2204 `AES-GCM` Pill GlitchIn（本镜唯一 glitch,
 *  rgbSplit 4）+ 紫光晕 → 2287 信封流提速 4→7px/f(18f) + 尾迹光 + 出口星闪 → 2352 邻桌笔电 slideIn
 *  (Δ200 侧向 16f) + 噪声 capture 行逐行亮起 / 30 帧一行持续滚动 + 红点 20 帧循环闪 → 2388 `still visible`
 *  灰字 SoftIn + 笔电组 1.03 脉冲 → 2437 起非封流带元素 8 帧归零（封流带不清场，SC12 2445 同参数承接）。
 * 运镜：1.0→1.05 慢推贯穿（SC12 首帧同机位 1.05，边界连续）。停留：段内不判（S16 非段末）。
 */
export const F0 = 2146;
const B_KEYS = 2148;
const B_MOVE = 2154;
const B_PILL = 2204;
const B_LAPTOP = 2352;
const B_STILL = 2388;
const TO = 2444;

// ---- 邻桌笔电（右半 x 780–1220）----
const LAP = {x: 830, y: 300, w: 340, h: 214};
const ROW_H = 30;
const TK = ['8f3a', '9c2e', '41db', '07e5'];
const TIMES = (() => {
  const t = [0];
  const d = [41, 62, 52];
  for (let i = 1; i < 14; i++) t.push(t[i - 1] + d[(i - 1) % 3]);
  return t;
})();
const rowTime = (a: number) => (TIMES[a] / 1000).toFixed(3);
const rowHex = (a: number) => `${TK[a % 4]} ${TK[(a * 3 + 1) % 4]} \u2026`;

export const SC11: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const fade = exitOp(N, TO, 8); // 非封流带元素末 8 帧归零
  const pillGlow = glowOffK(N, TO, 6, 8); // Pill 先灭光再淡出

  // ---- 双钥匙：SC10 承接 → 16 帧缩到左上角常驻 ----
  const mk = easeInOutPow(2.5)(clamp01((N - B_MOVE) / 16));
  const kOp = firstOp(N - B_KEYS, 6) * fade;
  const keyA = {cx: 487 + (163 - 487) * mk, cy: 330 + (210 - 330) * mk, s: 126 + (54 - 126) * mk};
  const keyB = {cx: 793 + (239 - 793) * mk, cy: 330 + (210 - 330) * mk, s: 126 + (54 - 126) * mk};
  const eq = {cx: 640 + (201 - 640) * mk, cy: 322 + (210 - 322) * mk, s: 60 + (26 - 60) * mk};

  // ---- 笔电滑入（Δ200 侧向 16 帧 + 前 6 帧渐入）----
  const lapN = N - B_LAPTOP;
  const lapOp = lapN < 0 ? 0 : firstOp(lapN, 6);
  const lapDx = 200 * Math.pow(1 - clamp01(lapN / 16), 2.5);
  const lapPing = emphasisPulse(N - B_STILL, {peak: 1.03, up: 6, hold: 2, down: 10});

  // ---- capture 行滚动（30 帧一轮：容器上移一行 + 内容进位，顶行走、底行新入）----
  const sc = Math.max(0, N - 2370);
  const k = Math.min(8, Math.floor(sc / 30));
  const tf = sc - k * 30;
  const slide = easeOutCubic(clamp01(tf / 8));
  const rows = [];
  for (let s = 0; s < 5; s++) {
    const a = k + s;
    const rowOp = (a < 5 ? firstOp(N - (2354 + 2 * a), 6) : firstOp(N - (2370 + 30 * (a - 4)), 6)) * lapOp;
    if (rowOp <= 0.01) continue;
    const y = s * ROW_H + 1 - ROW_H * slide;
    const dotB = (N + s * 5) % 20; // 行首小红点 20 帧循环闪
    const dotOp = dotB < 12 ? 1 : Math.max(0.15, 1 - (dotB - 12) / 4);
    rows.push(
      <div key={a} style={{position: 'absolute', left: 0, top: y, opacity: rowOp}}>
        <div style={{position: 'absolute', left: 10, top: 9, width: 5, height: 5, borderRadius: '50%', background: RED_DEEP, boxShadow: '0 0 6px rgba(236,8,31,.8)', opacity: dotOp}} />
        <MonoText x={22} y={0} size={22} color={WHITE}>
          {rowTime(a)}
        </MonoText>
        <MonoText x={98} y={0} size={22} color={GREY}>
          {rowHex(a)}
        </MonoText>
      </div>,
    );
  }

  return (
    <CameraRig N={N} keys={[{f: F0, x: 640, y: 360, s: 1}, {f: TO, x: 640, y: 360, s: 1.05}]}>
      {/* 封流带（不清场，直接带进 SC12） */}
      <SealBand N={N} />

      {/* 双钥匙（SC10 承接 → 左上角缩微常驻） */}
      <div style={{position: 'absolute', left: 0, top: 0, opacity: kOp}}>
        <KeyIcon cx={keyA.cx} cy={keyA.cy} size={keyA.s} glow />
        <KeyIcon cx={keyB.cx} cy={keyB.cy} size={keyB.s} glow />
        <CText cx={eq.cx} cy={eq.cy} size={eq.s} weight={700} family={FONT_ORB} color={PURPLE_LIGHT} shadow="0 0 14px rgba(102,45,248,.5)">
          =
        </CText>
      </div>

      {/* AES-GCM 主 Pill（本镜唯一 glitch, rgbSplit 4）+ symmetric 副字 */}
      <div style={{position: 'absolute', left: 0, top: 0, opacity: fade}}>
        <GlitchIn N={N} f0={B_PILL} rgbSplit={4} seed={11}>
          <Pill x={322} y={209} w={176} h={46} fill={PURPLE} stroke={PURPLE_LIGHT} sw={2} glow={glowPurpleS(pillGlow)} text="AES-GCM" fontSize={30} weight={700} />
        </GlitchIn>
        <CText cx={410} cy={280} size={22} weight={600} family={FONT_TECH} italic color={GREY} opacity={clamp01((N - B_PILL - 3) / 8)}>
          symmetric
        </CText>
      </div>

      {/* 邻桌笔电：屏幕（噪声 capture 行持续滚动）+ 键盘底 + still visible */}
      {lapOp > 0.01 ? (
        <div style={{position: 'absolute', left: 0, top: 0, transform: `translateX(${lapDx.toFixed(1)}px)`}}>
          <div style={{position: 'absolute', left: 0, top: 0, transformOrigin: '1000px 407px', transform: `scale(${lapPing.toFixed(4)})`, opacity: lapOp}}>
            <div style={{...abs(LAP.x, LAP.y, LAP.w, LAP.h), background: '#000', border: `2.5px solid ${WHITE}`, borderRadius: 8}} />
            <div style={{...abs(LAP.x + 12, LAP.y + 10, LAP.w - 24, 194), overflow: 'hidden'}}>{rows}</div>
            <svg width={400} height={46} viewBox="0 0 400 46" style={{position: 'absolute', left: 802, top: 514}}>
              <path d="M28,2 L372,2 L396,44 L4,44 Z" fill="#000" stroke={WHITE} strokeWidth={2.5} strokeLinejoin="round" />
              <line x1={30} y1={12} x2={370} y2={12} stroke="rgba(74,74,74,.8)" strokeWidth={1.5} />
            </svg>
            <CText cx={1000} cy={268} size={24} weight={600} color={GREY} opacity={clamp01((N - B_STILL) / 8)}>
              still visible
            </CText>
          </div>
        </div>
      ) : null}
    </CameraRig>
  );
};
