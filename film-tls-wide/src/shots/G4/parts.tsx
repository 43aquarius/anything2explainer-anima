import React from 'react';
import {clamp01, easeInOutPow, easeOutCubic, rnd} from '../../common';
import {PacketIcon, PURPLE_LIGHT, abs} from '../../ui';
import {Sparkle} from '../../fx';

/**
 * G4 共用件（SC11 ↔ SC12）：
 *  - SealBand    封流带（SC11 主角；2445–2461 缩到中带承接进 SC12 当上下半区之间的"信封照样飞"走廊）。
 *                两镜头共用同一组件同一参数 → 2444|2445 边界帧帧连续（协议 §4 承接规则）。
 *  - MiniNoise   信封内嵌噪声纹（NoiseField 微缩：seeded 小方块按 4 帧重排）。
 *  - SectionNoise SC12 剖面主角噪声场：2609 起逐格点亮（20 帧、密度渐增），2638 起热态
 *                （每 3 帧重排 + 紫描边 + 热光；cell 公式与 ui.NoiseField 一致，热态即其 hot 视觉）。
 */

// ---- 封流带速度史（px/帧，锚点 2154 = S15.c1；SC11/SC12 共用保证位移帧帧连续）----
// 2154–2287 恒 4 → 2287–2305 提速 4→7（18f，"快 流式 密封"）→ 2305–2444 恒 7
// → 2445–2461 随缩带 7→2.6（16f）→ 2461 起恒 2.6（中带走廊）
const D1 = 4 * (2287 - 2154); // 532
const D2 = D1 + 4 * 18 + (3 * 18 * 18) / 36; // +99 = 631
const D3 = D2 + 7 * (2445 - 2305); // +980 = 1611
const D4 = D3 + 7 * 16 - 0.1375 * 16 * 16; // +76.8 = 1687.8
export const bandDisp = (N: number): number => {
  if (N <= 2154) return 0;
  if (N <= 2287) return 4 * (N - 2154);
  if (N <= 2305) {
    const t = N - 2287;
    return D1 + 4 * t + (3 * t * t) / 36;
  }
  if (N <= 2445) return D2 + 7 * (N - 2305);
  if (N <= 2461) {
    const t = N - 2445;
    return D3 + 7 * t - 0.1375 * t * t;
  }
  if (N <= 2600) return D4 + 2.6 * (N - 2461);
  // v2：2612 起封流减速归零（"字已噪声"——内容变噪声后流动冻结，给末拍稳定期让路）
  if (N <= 2612) {
    const t = N - 2600;
    return D5 + 2.6 * t - (2.6 / 24) * t * t * (t / 12);
  }
  return D6;
};

// 封流带几何：全带（SC11）→ 中带（SC12）
const D5 = D4 + 2.6 * (2600 - 2461);
const D6 = D5 + 2.6 * 12 * (1 - (12 / 24) * (12 / 12)); // 2612 位移封顶（减速曲线终值）
const SP = 106; // 信封间距（恒定，避免缩带时磁带重排）
const TAPE = 1080; // 磁带周期（包住最宽窗口，包卷点在两种形态的软罩外）
const NENV = 10;

export const SealBand: React.FC<{N: number}> = ({N}) => {
  if (N < 2154) return null;
  const disp = bandDisp(N);
  const tr = easeInOutPow(2.5)(clamp01((N - 2445) / 16)); // 0=全带 1=中带
  const mx = (a: number, b: number) => a + (b - a) * tr;
  const clipL = mx(100, 140);
  const clipR = mx(720, 1140);
  const ew = mx(76, 34);
  const eh = mx(52, 24);
  const cy = mx(390, 382);
  const nBand = N - 2154;
  const revealX = 100 + 620 * easeOutCubic(clamp01(nBand / 24)); // 24 帧左→右 draw-on
  const trailK = clamp01((N - 2287) / 8) * (1 - tr); // 尾迹光：2287 提速时点亮，缩带时收
  const out: React.ReactNode[] = [];
  let spark = 0;
  for (let i = 0; i < NENV; i++) {
    const x = 120 + ((i * SP + disp) % TAPE);
    const fin = clamp01((x - clipL) / 60); // 软边罩：左入渐显（包卷不可见）
    const fout = 1 - clamp01((x - (clipR - 60)) / 60); // 右出渐隐
    const rev = clamp01((revealX - (x - 40)) / 64); // draw-on 扫过才现身
    const op = Math.min(fin, fout, rev);
    if (op <= 0.02) continue;
    const d = clipR - x; // 离场微光：接近右罩边的信封触发出口星闪
    if (trailK > 0.05 && d < 46 && d > -18) spark = Math.max(spark, (1 - Math.max(0, d) / 46) * op);
    out.push(
      <div key={i} style={{position: 'absolute', left: 0, top: 0, opacity: op}}>
        {trailK > 0.02 ? (
          <div
            style={{
              position: 'absolute',
              left: x - ew / 2 - 36,
              top: cy - 9,
              width: 30,
              height: 18,
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,.30))',
              opacity: trailK,
            }}
          />
        ) : null}
        <PacketIcon cx={x} cy={cy} w={ew} h={eh} accent />
        <MiniNoise x={x - ew * 0.36} y={cy - eh * 0.17} w={ew * 0.72} h={eh * 0.32} N={Math.min(N, 2618)} seed={40 + i} big={ew > 50} />
      </div>,
    );
  }
  const laneW = 620 * easeOutCubic(clamp01(nBand / 24));
  return (
    <div style={{position: 'absolute', left: 0, top: 0}}>
      {/* 车道线（全带专属；缩带时随 tr 淡出） */}
      {tr < 1
        ? [340, 440].map((y) => (
            <div
              key={y}
              style={{position: 'absolute', left: 100, top: y, width: laneW, height: 0, borderTop: `1.5px dashed rgba(74,74,74,${(1 - tr).toFixed(3)})`}}
            />
          ))
        : null}
      {out}
      {spark > 0.04 ? <Sparkle cx={clipR - 4} cy={cy} r={15 + 5 * Math.sin(N * 0.9)} opacity={Math.min(1, spark)} /> : null}
    </div>
  );
};

/** 信封内嵌噪声纹（微缩版：seeded 小方块，每 4 帧重排；不引入大 NoiseField 的 DOM 量） */
export const MiniNoise: React.FC<{x: number; y: number; w: number; h: number; N: number; seed: number; big?: boolean}> = ({x, y, w, h, N, seed, big}) => {
  const cols = big ? 5 : 3;
  const rows = big ? 2 : 1;
  const s = big ? 4 : 2.5;
  const cells: React.ReactNode[] = [];
  const ph = Math.floor(N / 4);
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const on = rnd(seed, r, c, ph) > 0.45;
      cells.push(
        <div
          key={`${r}-${c}`}
          style={{
            position: 'absolute',
            left: ((c + 0.5) * w) / cols - s / 2,
            top: ((r + 0.5) * h) / rows - s / 2,
            width: s,
            height: s,
            background: '#fff',
            opacity: on ? 0.5 + 0.4 * rnd(seed, r, c, ph, 2) : 0.07,
          }}
        />,
      );
    }
  }
  return <div style={{...abs(x, y, w, h)}}>{cells}</div>;
};

/**
 * 剖面噪声场（SC12 主角）：revF0 起逐格点亮（阈值乱序、密度随 reveal 渐增，20 帧）；
 * hotF0 起热态（每 3 帧重排 + 亮度上限提到 ui.NoiseField hot 档 + 紫描边 + 热光）。
 * cell 位置/尺寸/闪烁公式照抄 ui.NoiseField（seed/cols/rows 一致时热态与其逐格相同）。
 */
export const SectionNoise: React.FC<{
  x: number;
  y: number;
  w: number;
  h: number;
  N: number;
  seed?: number;
  revF0: number;
  hotF0: number;
  glowK?: number;
}> = ({x, y, w, h, N, seed = 7, revF0, hotF0, glowK = 1}) => {
  const cols = 22;
  const rows = 7;
  const rev = clamp01((N - revF0) / 20);
  const hot = N >= hotF0;
  const hotK = clamp01((N - hotF0) / 8) * glowK;
  const cad = Math.floor(N / (hot ? 3 : 6));
  const cells: React.ReactNode[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const thr = rnd(seed, r, c, 5);
      if (rev <= thr) continue; // 逐格点亮
      // v2：热态改为"少数格微闪"（每步仅 rnd<0.24 的格子翻一次亮度档），把尾段变化压进动词动作带（0.4–1.2），
      // 否则整场重排逐帧大面积变化会把末拍稳定期清零（motion_check HOLD_THR=1.5）。
      const flip = rnd(seed, r, c, cad, 71) < 0.13;
      const ph = ((seed * 131 + r * 37 + c * 17 + (flip ? cad : 0) * 29) % 97) / 97;
      const on = ph > (hot ? 0.42 : 0.55);
      const s = 4 + ((seed * 13 + r * 7 + c * 3) % 5);
      const b = (ph * 7) % 1;
      const op = on ? (hot ? 0.5 + 0.09 * b : 0.1 + 0.38 * b) + hotK * (0.04 + 0.05 * b) : 0.04 + 0.02 * hotK;
      cells.push(
        <div
          key={`${r}-${c}`}
          style={{position: 'absolute', left: (c + 0.5) * (w / cols) - s / 2, top: (r + 0.5) * (h / rows) - s / 2, width: s, height: s, background: '#fff', opacity: op.toFixed(3)}}
        />,
      );
    }
  }
  return (
    <div
      style={{
        ...abs(x, y, w, h),
        borderRadius: 4,
        overflow: 'hidden',
        outline: hotK > 0.01 ? `${(1.5 * hotK).toFixed(2)}px solid rgba(161,117,241,${hotK.toFixed(3)})` : 'none',
        boxShadow: hotK > 0.01 ? `0 0 24px 8px rgba(102,45,248,${(0.45 * hotK).toFixed(3)})` : 'none',
      }}
    >
      {cells}
    </div>
  );
};
