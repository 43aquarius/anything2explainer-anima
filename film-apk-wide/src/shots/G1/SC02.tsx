import React from 'react';
import {useCurrentFrame} from 'remotion';
import {clamp01, easeInOutPow, kf, FONT_MONO, FONT_ORB} from '../../common';
import {CText, PhoneMock, EXAMPLE, WHITE, exitOp, glowOffK, firstOp, abs} from '../../ui';
import {CameraRig} from '../../fx';
import type {CamKey} from '../../fx';
import {PARCEL1, PHONE, FilenameCard, InstallBtn, ThumbGlyph, PencilGlyph, ParcelBlock} from './layout';

/**
 * SC02 试试这个 · N 252–331（S02 260–329：260 按下之前 / 305 试试这个）
 * 承接（不清场）：包裹 16 帧缩移到中上 (640,240) 0.62×；相机随承接从 SC01 末的 1.05 回到 1.0（252–268）。
 * 260 文件名卡 slideUp Δ100 + 光标闪烁（30 帧周期，持续）；Install 按钮「先别按」exitFade 12 帧移出；手机/SC01 文字同步淡出；
 * 305 铅笔 SoftIn + 落到文件名行尾（kf 12 帧）+ 光标加速闪烁（改名蓄势）。末 8 帧归零（包裹/铅笔/手机；文件名卡承接进 SC03 不清场）。
 */
const F0 = 252;
const TO = 331;
const CAM: CamKey[] = [
  {f: 252, x: 660, y: 360, s: 1.05},
  {f: 268, x: 640, y: 360, s: 1},
];

export const SC02: React.FC = () => {
  const N = useCurrentFrame() + F0;
  // 承接：相机回落 + 包裹缩移（16 帧）
  const tt = easeInOutPow(2.5)(clamp01((N - 252) / 16));
  const pcx = PARCEL1.cx + (640 - PARCEL1.cx) * tt;
  const pcy = PARCEL1.cy + (240 - PARCEL1.cy) * tt;
  const psc = 1 + (0.62 - 1) * tt;
  const glowK = kf(N, [[252, 1], [268, 0.85]]) * glowOffK(N, TO, 6, 8);
  const pOp = exitOp(N, TO, 8);
  // 手机 / SC01 文字淡出
  const phOp = 1 - Math.pow(clamp01((N - 252) / 14), 1.5);
  const txOp = 1 - Math.pow(clamp01((N - 252) / 12), 1.5);
  // Install 按钮 + 拇指：260 起移出（先别按）
  const bn = clamp01((N - 260) / 12);
  const bOp = 1 - Math.pow(bn, 1.5);
  const bDrift = 10 * bn * bn;
  // 铅笔：305 SoftIn + 落到行尾（kf 12 帧）
  const pn = N - 305;
  const pencilOp = firstOp(pn, 8) * exitOp(N, TO, 8);
  const pt = easeInOutPow(2.5)(clamp01(pn / 12));
  const penX = 925 + (838 - 925) * pt;
  const penY = 350 + (410 - 350) * pt;
  const penR = -20 + (-38 + 20) * pt;
  return (
    <CameraRig N={N} keys={CAM}>
      {/* 手机（承接 SC01，淡出） */}
      {phOp > 0 ? <PhoneMock x={PHONE.x} y={PHONE.y} w={PHONE.w} h={PHONE.h} litN={1} iconN={12} opacity={phOp} /> : null}
      {/* SC01 的文件名 + 120 MB（淡出，由卡内版本接管） */}
      {txOp > 0 ? (
        <div style={{...abs(0, 0, 1280, 720), opacity: txOp}}>
          <CText cx={775} cy={435} size={24} weight={500} family={FONT_MONO} color={WHITE} letterSpacing={-0.4}>
            {EXAMPLE.fileName}
          </CText>
          <CText cx={775} cy={492} size={40} weight={700} family={FONT_ORB} color={WHITE} letterSpacing={1} shadow="0 0 10px rgba(255,255,255,.35)" style={{fontVariantNumeric: 'tabular-nums'}}>
            {EXAMPLE.appSize}
          </CText>
        </div>
      ) : null}
      {/* Install 按钮 + 拇指（「先别按」） */}
      <InstallBtn N={N} f0={193} opacity={bOp} drift={bDrift} />
      <ThumbGlyph N={N} f0={195} opacity={bOp} />
      {/* 包裹（承接缩移到中上；末 8 帧归零） */}
      <ParcelBlock cx={pcx} cy={pcy} w={PARCEL1.w} h={PARCEL1.h} s={psc} N={N} glowK={glowK} opacity={pOp} />
      {/* 文件名卡（承接进 SC03，不清场） */}
      <FilenameCard N={N} />
      {/* 铅笔（落到文件名行尾，蓄势） */}
      <PencilGlyph x={penX} y={penY} rot={penR} opacity={pencilOp} />
    </CameraRig>
  );
};
