import React from 'react';
import {useCurrentFrame} from 'remotion';
import {clamp01, easeInOutPow} from '../../common';
import {exitOp, glowOffK, firstOp} from '../../ui';
import {CameraRig} from '../../fx';
import type {CamKey} from '../../fx';
import {PARCEL2, ParcelBlock, GapGlow, EntryList} from './layout';

/**
 * SC04 拉链打开 · N 446–651（S04 454–649：454 打开了 / 483 文件都在 / 533 面单·代码·资源·签名）
 * 包裹解剖主角镜头。大 ParcelIcon（(545,360) 320×220，见 BUILD_NOTES 偏离 4）openP 0→0.65
 * 拉链自中间向两侧开齿（24 帧 easeInOut）+ 缝隙紫光同步点亮（30 帧呼吸，持续）+ 箱体 1.02 弹性 + ±1.5px 轻呼吸（持续）；
 * 483(=485 起，避让运镜) 五条目 2 帧错峰自缝隙滑出成右侧列表；533 起每条目右侧类别小图标逐个 draw-on（8 帧一个）。
 * 运镜：454–484 拉远 1.15→1.0（从 SC03 的推近回到全景）。段内镜头：条目列表承接进 SC05 不清场；
 * 包裹（含缝隙光）末 8 帧归零退场（SC05 画面无包裹，分镜表）。
 */
const F0 = 446;
const TO = 651;
const CAM: CamKey[] = [
  {f: 446, x: 640, y: 400, s: 1.15},
  {f: 454, x: 640, y: 400, s: 1.15},
  {f: 484, x: 640, y: 360, s: 1},
];

export const SC04: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const pop = firstOp(N - 446, 8);
  // 拉链开齿（24 帧）+ 箱体弹性 + 轻呼吸
  const openP = 0.65 * easeInOutPow(2)(clamp01((N - 454) / 24));
  const bump = 1 + 0.02 * Math.sin(Math.PI * clamp01((N - 454) / 18));
  const cy = PARCEL2.cy + 1.5 * Math.sin((2 * Math.PI * N) / 54);
  const glowK = pop * glowOffK(N, TO, 6, 8);
  const pOp = pop * exitOp(N, TO, 8);
  return (
    <CameraRig N={N} keys={CAM}>
      {/* 打开的包裹（主角）+ 缝隙紫光 */}
      <ParcelBlock cx={PARCEL2.cx} cy={cy} w={PARCEL2.w} h={PARCEL2.h} s={1} N={N} glowK={glowK} openP={openP} bump={bump} opacity={pOp} />
      <GapGlow N={N} openP={openP} opacity={pOp} />
      {/* 五个文件条目（自缝隙滑出 → 右侧列表；承接进 SC05） */}
      <EntryList N={N} />
    </CameraRig>
  );
};
