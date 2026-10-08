import React from 'react';
import {useCurrentFrame} from 'remotion';
import {clamp01, easeInOutPow, emphasisPulse, kf, easeOutCubic, FONT_ORB} from '../../common';
import {CText, PhotoCard, ZipperLine, GREY, PURPLE_LIGHT, WHITE, abs, exitOp, glowOffK, firstOp} from '../../ui';

/**
 * SC56 1989 之底 · N 8410–8576（S56 8418–8539 ¶+gap15：8418「Under every app they represent:」/ 8483「a format from 1989.」）
 * 承接 SC55 照片（交界帧像素一致：同位置同尺寸同扫描相位）：8418 照片 kf 缩退到左侧 0.4×（16 帧，中心 (550,355)→(270,330)，
 * 宽高比 1.805 不变 → img 裁切稳定）；出处行随缩退淡出（12 帧；段内常驻已 ≥75 帧达标）。
 * 右侧大字 `1989`（Orbitron 130px 白+紫描边）**画在照片之下**——照片右缘 920→418 左移过程中逐步亮出（「底下都是 1989」），
 * 16 帧计数 1900→1989 落位 + 紫投影脉冲后呼吸（持续）；8483 拉链 ZipperLine（cx 900, y 400, w 360）openP 0→0.35（14 帧）
 * → 半开呼吸 ±0.03（60 帧周期，持续动作）。
 * 末 8 帧归零（8568–8576，紫晕先灭 6 帧）。停留：大字+拉链落位 8483+21=8504 → 离场 8568，hold 64f ✓（分镜表「8541−8」
 * 为末句 to+2 旧口径；本片镜头区间到 8576，按镜头末 8 帧执行避免 8542–8576 空场 35 帧——同 G3/SC15 裁定）。
 */
const F0 = 8410;
const TO = 8576, EXIT_LEN = 8;
const T_SHRINK = 8418; // S56.c1：照片缩退 + 1989 计数
const T_ZIP = 8483; // S56.c2：拉链开齿
const T_LAND = T_SHRINK + 16; // 8434：缩退 + 计数落位
const SCAN_T0 = 8280; // 与 SC55 同一扫描相位（交界连续）

const PHOTO = {x: 180, y: 150, w: 740, h: 410};
const P2 = {x: 122, y: 248, w: 296, h: 164}; // 0.4× 缩退位（中心 (270,330)）
const SRC_LINE = 'photo: Atomic Taco · CC BY-SA 2.0 · Wikimedia Commons';
const YEAR = {cx: 830, cy: 250};
const ZIP = {cx: 900, y: 400, w: 360};

export const SC56: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const exOp = exitOp(N, TO, EXIT_LEN);
  if (exOp <= 0) return null;
  const gk = glowOffK(N, TO, 6, EXIT_LEN); // 大字紫晕先灭
  // 照片缩退（16 帧 easeInOut）
  const k = easeInOutPow(2.5)(clamp01((N - T_SHRINK) / 16));
  const px = PHOTO.x + (P2.x - PHOTO.x) * k;
  const py = PHOTO.y + (P2.y - PHOTO.y) * k;
  const pw = PHOTO.w + (P2.w - PHOTO.w) * k;
  const ph = PHOTO.h + (P2.h - PHOTO.h) * k;
  const scanP = ((((N - SCAN_T0) % 40) + 40) % 40) / 40;
  const srcOp = 0.85 * (1 - clamp01((N - T_SHRINK) / 12)); // 出处行随缩退淡出
  // 1989 计数落位（16 帧滚动）+ 脉冲 + 紫投影呼吸
  const yn = N - T_SHRINK;
  const yearOp = yn < 0 ? 0 : firstOp(yn, 6);
  const year = Math.round(1900 + 89 * (1 - Math.pow(1 - clamp01(yn / 16), 2)));
  const pulse = emphasisPulse(N - (T_LAND + 2), {peak: 1.09, up: 11, hold: 4, down: 13});
  const shA = Math.max(0, kf(N, [[T_LAND, 0.95], [T_LAND + 30, 0.5]], easeOutCubic) + 0.08 * Math.sin((2 * Math.PI * N) / 30));
  const glow = 14 + 8 * Math.sin((2 * Math.PI * N) / 30);
  // 拉链：openP 0→0.35（14 帧）→ 半开呼吸 ±0.03（持续动作）
  const zn = N - T_ZIP;
  const openBase = 0.35 * clamp01(zn / 14);
  const breathe = zn > 14 ? 0.03 * Math.sin((2 * Math.PI * (zn - 14)) / 60) : 0;
  const openP = Math.max(0, openBase + breathe);
  const zipOp = zn < 0 ? 0 : firstOp(zn, 6);
  return (
    <div style={{position: 'absolute', inset: 0, opacity: exOp}}>
      {/* 大字 1989（画在照片之下：缩退过程中自照片后亮出） */}
      {yearOp > 0 ? (
        <div style={{position: 'absolute', inset: 0, transformOrigin: `${YEAR.cx}px ${YEAR.cy}px`, transform: `scale(${pulse.toFixed(4)})`, opacity: yearOp}}>
          <CText
            cx={YEAR.cx}
            cy={YEAR.cy}
            size={130}
            weight={700}
            family={FONT_ORB}
            letterSpacing={4}
            color={WHITE}
            style={{WebkitTextStroke: `2.5px ${PURPLE_LIGHT}`, paintOrder: 'stroke fill', fontVariantNumeric: 'tabular-nums'}}
            shadow={`6px 6px 0 rgba(102,48,248,${shA.toFixed(2)}), 0 0 ${glow.toFixed(1)}px rgba(102,48,248,${(0.4 * gk).toFixed(2)})`}
          >
            {year}
          </CText>
        </div>
      ) : null}
      {/* 照片（SC55 承接 → 0.4× 缩退；出处行随缩退淡出） */}
      <div style={{...abs(px, py, pw, ph)}}>
        <PhotoCard x={0} y={0} w={pw} h={ph} src="android_statues.jpg" source="" scanP={scanP} />
        {srcOp > 0.01 ? (
          <div style={{...abs(0, ph + 10, pw), textAlign: 'center', fontSize: 22, color: GREY, opacity: srcOp, whiteSpace: 'nowrap'}}>{SRC_LINE}</div>
        ) : null}
      </div>
      {/* 拉链（半开呼吸） */}
      {zipOp > 0 ? <ZipperLine cx={ZIP.cx} y={ZIP.y} w={ZIP.w} openP={openP} opacity={zipOp} /> : null}
    </div>
  );
};

export default SC56;
