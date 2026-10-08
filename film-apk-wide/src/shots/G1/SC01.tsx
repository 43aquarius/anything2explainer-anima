import React from 'react';
import {useCurrentFrame} from 'remotion';
import {clamp01, FONT_MONO, FONT_ORB} from '../../common';
import {CText, PhoneMock, EXAMPLE, WHITE, firstOp, scaleIn, abs} from '../../ui';
import {CameraRig, countTo} from '../../fx';
import type {CamKey} from '../../fx';
import {PARCEL1, PHONE, INSTALL, ParcelBlock, InstallBtn, ThumbGlyph} from './layout';

/**
 * SC01 下载完成 · N 78–251（S01 86–249：86 刚下载 / 138 120 兆 / 193 拇指悬停 Install）
 * 左 PhoneMock（亮屏 3×4 网格 1 格紫点）+ 右大 ParcelIcon + 文件名/120 MB + 右下 Install 绿边圆按钮 + 拇指悬停。
 * 86 包裹 scaleIn 21 帧 + HeroGlow 点亮；138 `120 MB` 14 帧计数 + 文件名打字机（持续）；193 按钮缩放入场 + 待命呼吸光环（30 帧周期）+
 * 拇指 16 帧周期小犹豫下探（不按下）。运镜：整镜慢推 1→1.05 向包裹（慢推贯穿例外）。
 * 段内镜头：包裹承接进 SC02，本镜不设离场（手机/按钮/文字在 SC02 起淡出）。
 */
const F0 = 78;
const TO = 251;
const CAM: CamKey[] = [
  {f: 78, x: 640, y: 360, s: 1},
  {f: 251, x: 660, y: 360, s: 1.05},
];

export const SC01: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const phoneOp = firstOp(N - 78, 6);
  // 包裹：86 起 21 帧缩放入场 + 柔光点亮
  const prn = N - 86;
  const ps = prn < 0 ? 0 : scaleIn(prn, 21);
  const glowK = clamp01((prn - 6) / 12);
  // 138：120 MB 14 帧计数 + 文件名打字机（每 2 帧 1 字）
  const mn = N - 138;
  const mbVal = countTo(mn, 0, 120, 14);
  const mbOp = mn >= 0 ? 1 : 0;
  const chars = Math.max(0, Math.min(EXAMPLE.fileName.length, Math.floor(mn / 2)));
  const fnText = EXAMPLE.fileName.slice(0, chars);
  return (
    <CameraRig N={N} keys={CAM}>
      {/* 手机（亮屏，1 格紫点 = 刚到的 ChatApp） */}
      {phoneOp > 0 ? <PhoneMock x={PHONE.x} y={PHONE.y} w={PHONE.w} h={PHONE.h} litN={1} iconN={12} opacity={phoneOp} /> : null}
      {/* 包裹（主角） */}
      {ps > 0 ? (
        <ParcelBlock cx={PARCEL1.cx} cy={PARCEL1.cy} w={PARCEL1.w} h={PARCEL1.h} s={ps} N={N} glowK={glowK} opacity={clamp01(0.25 + 0.75 * ps)} />
      ) : null}
      {/* 文件名（打字机） + 120 MB（计数） */}
      {mbOp > 0 ? (
        <div style={{...abs(0, 0, 1280, 720), opacity: mbOp}}>
          <CText cx={775} cy={435} size={24} weight={500} family={FONT_MONO} color={WHITE} letterSpacing={-0.4}>
            {fnText}
          </CText>
          <CText cx={775} cy={492} size={40} weight={700} family={FONT_ORB} color={WHITE} letterSpacing={1} shadow="0 0 10px rgba(255,255,255,.35)" style={{fontVariantNumeric: 'tabular-nums'}}>
            {mbVal} MB
          </CText>
        </div>
      ) : null}
      {/* Install 按钮（193 缩放入场 + 待命呼吸光环） + 悬停拇指 */}
      <InstallBtn N={N} f0={193} />
      <ThumbGlyph N={N} f0={195} />
    </CameraRig>
  );
};
