import React from 'react';
import {useCurrentFrame} from 'remotion';
import {clamp01, easeOutCubic, FONT_HEAVY, FONT_MONO, rnd} from '../../common';
import {Box, ParcelIcon, GREY, abs, exitOp, firstOp, scaleIn, softOp} from '../../ui';

/**
 * SC51 不再一包走天下 · N 7617–7813（S51 7625–7811：7625「You no longer download one universal package」/
 *   7700「with every language」/ 7739「and every CPU architecture inside.」段内镜头）
 * 左半「万能包」：大包裹（240×170，label APK）scaleIn 21f；7700–7736 十二枚小标签（en/de/ja/fr/es/zh/arm64/x86/hdpi/mdpi/xxhdpi/ldpi，
 *   等宽 16px 灰）2 帧错峰自包裹中心辐射到密集圆环（每枚 14f easeOutCubic）；环绕层缓慢旋转 0.3°/f（持续动作）；
 *   包裹被标签重量压得下沉 4px（附着比例×4）。右半虚线空区 `your device`（灰 28px）+ 虚线呼吸（持续动作）。
 * 停留：段内不判。末 8 帧归零。零 glitch。光：标签灰（本镜无紫——「万能包」是反面重物，灰处理是有意的）。
 */
const F0 = 7617, TO = 7813;
const B1 = 7625, B2 = 7700;

const PARCEL = {cx: 400, cy: 330, w: 240, h: 170};

// 12 枚标签（前 6 语言、后 6 架构/密度——分镜表 `en de ja arm64 x86 hdpi…` 的同类补全）
const LABELS = ['en', 'de', 'ja', 'fr', 'es', 'zh', 'arm64', 'x86', 'hdpi', 'mdpi', 'xxhdpi', 'ldpi'];
const FLY_T0 = B2; // 7700 起逐一飞出（2 帧错峰，每枚 14f → 末枚落位 ~7736，正对 7739 节拍）
const FLY_LEN = 14;
const ROT_V = 0.3; // 环绕层旋转 °/f（持续）

const ZONE = {x: 830, y: 250, w: 330, h: 220};

// 环上槽位（确定性：半径 148–190、基角 30° 均分 ±7° 抖动）
const RING = LABELS.map((_t, i) => ({
  r: 148 + 42 * rnd(i + 1, 71),
  a0: i * 30 + (rnd(i + 1, 73) - 0.5) * 14,
}));

const ringPos = (i: number, N: number) => {
  const th = ((RING[i].a0 + ROT_V * (N - FLY_T0)) * Math.PI) / 180;
  return {x: PARCEL.cx + RING[i].r * Math.cos(th), y: PARCEL.cy + RING[i].r * Math.sin(th)};
};

export const SC51: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const exOp = exitOp(N, TO, 8);
  if (exOp <= 0) return null;

  // ---- 大包裹：scaleIn 21f + 标签重量下沉 4px ----
  const pn = N - B1;
  const pScale = pn < 0 ? 0 : 0.55 + 0.45 * scaleIn(pn, 21);
  const attachFrac = LABELS.reduce((s, _t, i) => s + clamp01((N - (FLY_T0 + i * 2)) / FLY_LEN), 0) / LABELS.length;
  const sink = 4 * attachFrac;
  const parcelOp = (pn < 0 ? 0 : firstOp(pn, 6)) * exOp;

  // ---- 右半虚线空区：SoftIn + 虚线呼吸（持续） ----
  const zn = N - (B1 + 25); // ~7650
  const zoneOp = zn < 0 ? 0 : softOp(zn, 8) * exOp;
  const dashBreath = 0.6 + 0.25 * Math.sin((2 * Math.PI * N) / 45);

  return (
    <div style={{position: 'absolute', inset: 0, opacity: exOp}}>
      {/* 大包裹（万能包，主角组） */}
      <ParcelIcon
        cx={PARCEL.cx}
        cy={PARCEL.cy + sink}
        w={PARCEL.w}
        h={PARCEL.h}
        scale={pScale}
        opacity={parcelOp}
        label={'APK'}
      />

      {/* 12 枚小标签：自包裹中心辐射到圆环 + 环绕旋转（持续） */}
      {LABELS.map((t, i) => {
        const fn = N - (FLY_T0 + i * 2);
        if (fn < 0) return null;
        const t01 = easeOutCubic(clamp01(fn / FLY_LEN));
        const rp = ringPos(i, N);
        const x = PARCEL.cx + (rp.x - PARCEL.cx) * t01;
        const y = PARCEL.cy + (rp.y - PARCEL.cy) * t01;
        return (
          <div
            key={t}
            style={{
              ...abs(x - 34, y - 11, 68, 22),
              opacity: firstOp(fn, 5) * exOp,
              fontFamily: FONT_MONO,
              fontSize: 16,
              color: GREY,
              textAlign: 'center',
              lineHeight: '22px',
              whiteSpace: 'nowrap',
              letterSpacing: 0.5,
            }}
          >
            {t}
          </div>
        );
      })}

      {/* 右半虚线空区 your device */}
      {zn >= 0 ? (
        <div style={{position: 'absolute', inset: 0, opacity: zoneOp}}>
          <div style={{position: 'absolute', inset: 0, opacity: Number(dashBreath.toFixed(3))}}>
            <Box x={ZONE.x} y={ZONE.y} w={ZONE.w} h={ZONE.h} r={14} dashed sw={2} stroke={GREY} fill="rgba(0,0,0,0.55)" />
          </div>
          <div style={{...abs(ZONE.x, ZONE.y + ZONE.h / 2 - 20, ZONE.w, 40), display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FONT_HEAVY, fontSize: 28, fontWeight: 600, color: GREY}}>
            your device
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default SC51;
