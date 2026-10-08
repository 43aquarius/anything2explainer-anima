import React from 'react';
import {clamp01, FONT_MONO} from '../../common';
import {Box, BLOOM_SOFT, EXAMPLE, GREY, GREY_LINE, PURPLE_LIGHT, SplitChip, TEXT_GLOW, WHITE, abs} from '../../ui';
import {HeroGlow} from '../../fx';

/**
 * G3 组内图元（竖版 720×1280，安全区 x40–620 / y240–990，中轴 x=360；N 为绝对帧号）。
 *   SplitRow      三枚 SplitChip 横排（base 紫亮 + HeroGlow 呼吸；两枚灰暗挂删除线）。
 *                SC13 与 SC14 开场共用同一组件同参数（SC14 外层再包 scale(1.1) 复现 SC13 末帧相机），
 *                交界帧像素一致 —— 「SplitChip 淡出」的承接靠它实现。
 *   VertHexMini   G1/SC04 主角字节窗（g1ui VertHex）的等参数移植：SC14 的 0.45× 缩微回扣与 SC04 视觉同源。
 *   MiniHex       VertHexMini 的定位/缩放包装（默认 cx 360 cy 472 scale 0.45，首两格 50 4B 紫亮）。
 *   EnvelopeGlyph 小信封（白描边 + 紫封盖折线；SC15 片尾 3 枚纵向下行）——移植自横版 G8b/g8bui 同视觉语言。
 */

// ---- 三枚 SplitChip 横排（SC13 主角群 / SC14 开场承接） ----
export const SPLIT = {cy: 700, cxs: [135, 315, 495]}; // 1.1 推近后：标签/删除线墨迹右缘 ≤ 599 < 620 ✓（arm64 长标签在中列 cx315）
const STRIKE = {halfW: 82, dy: -10}; // 删除线穿过图标中线（SplitChip 盒内 icon cy = cy−10）

/**
 * strike2 / strike3：两枚灰暗 chip 的删除线 wipe 进度 0→1（SC13 中段划过；SC14 承接时传 1）。
 * opacity / glowK：整体透明度与 base 紫光强度（SC14 淡出时先灭光再淡出）。N 传入时 HeroGlow 30 帧呼吸。
 */
export const SplitRow: React.FC<{N: number; strike2?: number; strike3?: number; opacity?: number; glowK?: number}> = ({N, strike2 = 0, strike3 = 0, opacity = 1, glowK = 1}) => {
  if (opacity <= 0) return null;
  const labels = [EXAMPLE.splitBase, EXAMPLE.splitAbi, EXAMPLE.splitLang];
  return (
    <div style={{position: 'absolute', inset: 0, opacity}}>
      {/* base.apk 紫光（当前重点，唯一带光的 chip） */}
      <HeroGlow x={SPLIT.cxs[0] - 105} y={SPLIT.cy - 58} w={210} h={116} r={14} N={N} k={glowK} />
      {SPLIT.cxs.map((cx, i) => (
        <SplitChip key={i} cx={cx} cy={SPLIT.cy} label={labels[i]} dim={i > 0} active={i === 0} />
      ))}
      {[strike2, strike3].map((p, i) =>
        p <= 0 ? null : (
          <div
            key={i}
            style={{
              ...abs(SPLIT.cxs[i + 1] - STRIKE.halfW, SPLIT.cy + STRIKE.dy - 1.75, STRIKE.halfW * 2, 3.5),
              background: GREY,
              transformOrigin: 'left center',
              transform: `scaleX(${clamp01(p).toFixed(4)})`,
              opacity: 0.92,
            }}
          />
        ),
      )}
    </div>
  );
};

// ---- SC04 VertHex 的等参数移植（SC14 缩微回扣与 G1 主角同源；坐标/递推与 g1ui.VertHex 逐位一致） ----
const HEXN = {x: 145, y: 640, w: 430, h: 320}; // 自然坐标；MiniHex 负责定位缩放
const HCELL = {w: 42, h: 40, gap: 9, left: 16, top: 58};
const hexBytes = (): string[][] => {
  const rows: string[][] = [];
  let b = 0;
  for (let r = 0; r < 5; r++) {
    const row: string[] = [];
    for (let c = 0; c < 8; c++) {
      if (r === 0 && c < 4) row.push(EXAMPLE.hexFirst.split(' ')[c]);
      else {
        b = (b * 31 + 17) % 256;
        row.push(b.toString(16).padStart(2, '0').toUpperCase());
      }
    }
    rows.push(row);
  }
  return rows;
};
const HEX_ROWS = hexBytes();

/** hlP：首两格高亮（回扣时恒 1）；dimK：其余字节变暗 0–0.35（SC14「其余区域变暗 30%」）。 */
const VertHexMini: React.FC<{hlP?: number; dimK?: number; opacity?: number}> = ({hlP = 1, dimK = 0, opacity = 1}) => (
  <div style={{...abs(HEXN.x, HEXN.y, HEXN.w, HEXN.h), opacity}}>
    <Box x={0} y={0} w={HEXN.w} h={HEXN.h} r={10} sw={2} stroke={WHITE} fill="rgba(0,0,0,0.92)" />
    <div style={{position: 'absolute', left: HCELL.left + 2, top: 14, fontFamily: FONT_MONO, fontSize: 24, color: GREY}}>first bytes</div>
    {HEX_ROWS.map((row, r) =>
      row.map((byte, c) => {
        const hero = r === 0 && c < 2;
        const lit = hero && (c + 1) / 2 <= hlP + 0.001;
        return (
          <div
            key={`${r}-${c}`}
            style={{
              position: 'absolute',
              left: HCELL.left + c * (HCELL.w + HCELL.gap),
              top: HCELL.top + r * 50,
              width: HCELL.w,
              height: HCELL.h,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: FONT_MONO,
              fontSize: 24,
              lineHeight: 1,
              color: WHITE,
              opacity: hero ? 1 : 1 - dimK,
              borderRadius: 4,
              border: `${lit ? 2 : 1.5}px solid ${lit ? PURPLE_LIGHT : GREY_LINE}`,
              background: lit ? 'rgba(102,48,248,0.92)' : 'transparent',
              textShadow: lit ? TEXT_GLOW : 'none',
              fontWeight: lit ? 700 : 400,
            }}
          >
            {byte}
          </div>
        );
      }),
    )}
  </div>
);

/** 0.45× 缩微字节窗（分镜表 SC14：HexDump 缩微 0.45×，首两格保持紫亮）。缩放原点 = 自然盒中心 (360,800)。 */
export const MiniHex: React.FC<{cx?: number; cy?: number; scale?: number; dimK?: number; opacity?: number}> = ({cx = 360, cy = 472, scale = 0.45, dimK = 0.3, opacity = 1}) => (
  <div
    style={{
      position: 'absolute',
      inset: 0,
      opacity,
      transform: `translate(${(cx - 360).toFixed(1)}px, ${(cy - 800).toFixed(1)}px) scale(${scale})`,
      transformOrigin: '360px 800px',
    }}
  >
    <VertHexMini hlP={1} dimK={dimK} />
  </div>
);

// ---- 小信封（移植自横版 G8b/g8bui EnvelopeGlyph，同视觉语言：白描边 + 紫封盖折线） ----
export const EnvelopeGlyph: React.FC<{cx: number; cy: number; w?: number; h?: number; opacity?: number; accent?: boolean}> = ({cx, cy, w = 46, h = 32, opacity = 1, accent = false}) => (
  <div style={{...abs(cx - w / 2, cy - h / 2, w, h), opacity}}>
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible', filter: accent ? 'drop-shadow(0 0 6px rgba(102,48,248,.55))' : BLOOM_SOFT}}>
      <rect x={2} y={2} width={w - 4} height={h - 4} rx={3} fill="#000" stroke={WHITE} strokeWidth={2.5} strokeLinejoin="round" />
      <path d={`M3.5,4.5 L${w / 2},${h * 0.62} L${w - 3.5},4.5`} fill="none" stroke={accent ? PURPLE_LIGHT : WHITE} strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  </div>
);
