import React from 'react';
import {useCurrentFrame} from 'remotion';
import {clamp01, powOutRemain} from '../../common';
import {CText, PhotoCard, GREY, abs, exitOp, firstOp, softOp} from '../../ui';
import {CameraRig} from '../../fx';
import type {CamKey} from '../../fx';
import {MagnifierGlyph} from './g8bui';

/**
 * SC55 草坪机器人 · N 8266–8409（S55 8274–8407：8274「Outside Google's headquarters,」/ 8327「the lawn is full of giant green robots.」）
 * **真实素材镜头**。全幅 PhotoCard（x 180–920, y 150–560：android_statues.jpg，白框 4px + 暗调 grade）+
 * 下缘灰 22px 出处行 `photo: Atomic Taco · CC BY-SA 2.0 · Wikimedia Commons`（自绘，与 PhotoCard 内置样式一致——
 * 因 SC56 承接缩退时出处行要单独淡出，不吃组件内的 source）；右侧 (1005, 330) 简笔放大镜（白）+
 * `they guard a 1989 secret`（灰 24px 两行，双关钩子）。
 * 8274 PhotoCard 自左滑入（Δ140/18 帧，前 6 帧渐入）+ 内部紫色扫描线每 40 帧扫过一次（持续动作，SC56 同相位承接）；
 * 8327 放大镜自右 slideIn（Δ80）后在照片边缘椭圆巡查（±16/±24px，持续动作）；出处行常驻（8274–8409 段内全程 0.85α）。
 * 运镜：8274–8307 推 1→1.06 对准照片（相机 (600,362)：推完后放大镜文字右缘 ≈1153、出处行底 ≈601，均在安全区内）。
 * 段内不判停留；末 8 帧仅放大镜组归零——**照片 + 出处行不归零**（SC56 承接缩退，交界帧像素一致）。
 */
export const F0 = 8266;
const TO = 8409, EXIT_LEN = 8;
const T_CARD = 8274; // S55.c1：PhotoCard 滑入
const T_MAG = 8327; // S55.c2：放大镜 slideIn + 巡边
const T_TEXT = 8329; // 双关钩子小字 SoftIn
const SCAN_T0 = 8280; // 扫描线 40 帧循环起点（SC56 沿用同一相位）

const PHOTO = {x: 180, y: 150, w: 740, h: 410};
const SRC_LINE = 'photo: Atomic Taco · CC BY-SA 2.0 · Wikimedia Commons';
const MAG = {cx: 1005, cy: 330};
const CAM: CamKey[] = [
  {f: F0, x: 640, y: 360, s: 1},
  {f: T_CARD, x: 640, y: 360, s: 1},
  {f: T_CARD + 33, x: 600, y: 362, s: 1.06},
];

export const SC55: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const magOp = exitOp(N, TO, EXIT_LEN); // 仅放大镜组归零
  // PhotoCard 自左滑入（Δ140 + 前 6 帧渐入）
  const cn = N - T_CARD;
  const dx = 140 * powOutRemain(cn, 18, 2.5);
  const cardOp = cn < 0 ? 0 : firstOp(cn, 6);
  // 扫描线 40 帧循环（持续动作）
  const scanP = ((((N - SCAN_T0) % 40) + 40) % 40) / 40;
  // 放大镜：自右滑入（Δ80）→ 照片边缘椭圆巡查（持续动作）
  const mn = N - T_MAG;
  const magIn = 80 * powOutRemain(mn, 18, 2.5);
  const patrolK = clamp01((N - (T_MAG + 20)) / 24);
  const mcx = MAG.cx + magIn + 16 * patrolK * Math.sin((2 * Math.PI * (N - T_MAG)) / 130);
  const mcy = MAG.cy + 24 * patrolK * Math.cos((2 * Math.PI * (N - T_MAG)) / 130);
  return (
    <CameraRig N={N} keys={CAM}>
      {/* 真实照片卡（白框 4px 暗调 grade + 紫扫描线）——承接进 SC56，不归零 */}
      {cardOp > 0 ? (
        <div style={{...abs(PHOTO.x - dx, PHOTO.y, PHOTO.w, PHOTO.h), opacity: cardOp}}>
          <PhotoCard x={0} y={0} w={PHOTO.w} h={PHOTO.h} src="android_statues.jpg" source="" scanP={scanP} />
          {/* 出处行（自绘同款样式：≥75 帧 ≥50% α；SC56 缩退时单独淡出） */}
          <div style={{...abs(0, PHOTO.h + 10, PHOTO.w), textAlign: 'center', fontSize: 22, color: GREY, opacity: 0.85, whiteSpace: 'nowrap'}}>{SRC_LINE}</div>
        </div>
      ) : null}
      {/* 放大镜 + 双关钩子（段内归零） */}
      <div style={{position: 'absolute', inset: 0, opacity: magOp}}>
        {mn >= 0 ? <MagnifierGlyph cx={mcx} cy={mcy} r={30} opacity={firstOp(mn, 6)} /> : null}
        <CText cx={MAG.cx} cy={400} size={24} weight={600} color={GREY} opacity={softOp(N - T_TEXT, 8)}>they guard a</CText>
        <CText cx={MAG.cx} cy={432} size={24} weight={600} color={GREY} opacity={softOp(N - T_TEXT, 8)}>1989 secret</CText>
      </div>
    </CameraRig>
  );
};

export default SC55;
