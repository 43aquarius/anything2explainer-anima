import React from 'react';
import {useCurrentFrame} from 'remotion';
import {GlitchIn, clamp01, easeInOutCubic, emphasisPulse, FONT_WIDE} from '../../common';
import {CText, ParcelIcon, PURPLE, WHITE, abs, exitOp, firstOp, glowOffK, scaleIn} from '../../ui';
import {CameraRig} from '../../fx';
import type {CamKey} from '../../fx';
import {FilenameCard} from './g1ui';

/**
 * SC01 ★改后缀钩子 · N 78–184（S01 86–182：86 改名 APK→ZIP / 154 就开了）—— 开场即钩子（前 3 秒）。
 * 竖构图（安全区 x40–620 / y240–990，中轴 360，世界坐标）：
 *   顶部小包裹 ParcelIcon (360,296) w130 拉链与字符交换同步开齿（94–112 → 0.4；154 "it just opens" 再开到 0.68）；
 *   上 1/3 文件名卡（135,360 450×160，等宽 30px `chatapp-release.apk`，g1ui.FilenameCard）；
 *   卡下大字 `ZIP`（Audiowide 130px 白+3.5px 紫描边，cy 640）。
 * 时序：78 卡+包裹首帧即入场（钩子快开）→ 86 后缀白底选中（8 帧）→ 94 字符交换 powOut 18 帧
 *   （.apk 4 字符上抛淡出 / .zip 4 字符落入，包裹 openP 同步 0→0.4）→ 115 卡边框白闪 3 帧 →
 *   130 `ZIP` GlitchIn（rgbSplit 6，本镜唯一 glitch）+ 142 emphasisPulse 1.11 + 紫晕 30 帧呼吸（持续）。
 * 运镜：96–129 推 1→1.15 锚点 (360,440) 卡中心（入场 12 帧已停 ≥6 帧；交换在推近中进行，GlitchIn 130 在运镜结束后）。
 * 离场：ZIP 大字 + 包裹 176–184 归零（紫晕先灭 6 帧）；卡不退场 → SC02 承接（相机末态由 SC02 容器变换复现）。
 * 停留：段内不判。主角 `ZIP` 130px，光 = 大字紫晕。
 */
const F0 = 78;
const TO = 184;
const T_XCH = 94;
const T_ZIP = 130;
const T_PULSE = 142;
const T_OPEN2 = 154; // S01.c2 "it just opens."：拉链再开一档
const CAM: CamKey[] = [
  {f: 78, x: 360, y: 640, s: 1},
  {f: 96, x: 360, y: 640, s: 1},
  {f: 129, x: 360, y: 440, s: 1.15},
];
const PARCEL = {cx: 360, cy: 296, w: 130, h: 96};

export const SC01: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const exOp = exitOp(N, TO, 8);
  const gk = glowOffK(N, TO, 6, 8); // 带光元素先灭光
  const pulse = emphasisPulse(N - T_PULSE, {peak: 1.11});
  const breathe = 0.7 + 0.3 * Math.sin((2 * Math.PI * (N - T_ZIP)) / 30);

  // 包裹拉链开齿：与字符交换同步 0→0.4（94–112），154 起再开到 0.68（"it just opens"）
  const openP =
    N < T_XCH ? 0
    : N < T_XCH + 18 ? 0.4 * easeInOutCubic(clamp01((N - T_XCH) / 18))
    : N < T_OPEN2 ? 0.4
    : N < T_OPEN2 + 12 ? 0.4 + 0.28 * easeInOutCubic(clamp01((N - T_OPEN2) / 12))
    : 0.68;
  const parcelOp = firstOp(N - 78, 6) * exOp;
  const parcelS = 0.6 + 0.4 * scaleIn(N - 78, 12);
  // 缝隙紫光（拉链开口内透光，30 帧呼吸，持续动作）
  const gapW = 10 + 44 * openP;
  const gapH = 18 + 74 * openP;
  const gBreathe = 0.72 + 0.28 * Math.sin((2 * Math.PI * N) / 30);

  return (
    <CameraRig N={N} keys={CAM}>
      {/* 小包裹（拉链同步开齿）+ 缝隙紫光 */}
      <div style={{position: 'absolute', inset: 0, opacity: parcelOp}}>
        <div
          style={{
            ...abs(PARCEL.cx - gapW / 2, PARCEL.cy - gapH / 2, gapW, gapH),
            borderRadius: 6,
            background: `rgba(161,117,241,${(0.2 * gBreathe).toFixed(3)})`,
            boxShadow: `0 0 ${Math.round(16 + 10 * gBreathe)}px ${Math.round(5 + 4 * gBreathe)}px rgba(102,48,248,${(0.42 * gBreathe * gk).toFixed(3)})`,
          }}
        />
        <div style={{position: 'absolute', inset: 0, transformOrigin: `${PARCEL.cx}px ${PARCEL.cy}px`, transform: `scale(${parcelS.toFixed(4)})`}}>
          <ParcelIcon cx={PARCEL.cx} cy={PARCEL.cy} w={PARCEL.w} h={PARCEL.h} openP={openP} label={''} />
        </div>
      </div>

      {/* 文件名卡（不随本镜归零，承接进 SC02） */}
      <FilenameCard N={N} />

      {/* `ZIP` 大字（本镜唯一 glitch：rgbSplit 6）+ 紫晕 30 帧呼吸 */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          opacity: exOp,
          transformOrigin: '360px 640px',
          transform: pulse === 1 ? undefined : `scale(${pulse.toFixed(4)})`,
        }}
      >
        <GlitchIn N={N} f0={T_ZIP} rgbSplit={6} seed={3}>
          <CText
            cx={360}
            cy={640}
            size={130}
            weight={400}
            family={FONT_WIDE}
            color={WHITE}
            letterSpacing={6}
            shadow={`0 0 ${Math.round(16 + 12 * breathe)}px rgba(161,117,241,${((0.55 + 0.35 * breathe) * gk).toFixed(3)}), 0 0 4px rgba(161,117,241,${(0.5 * gk).toFixed(3)})`}
            style={{WebkitTextStroke: `3.5px ${PURPLE}`, paintOrder: 'stroke fill'}}
          >
            ZIP
          </CText>
        </GlitchIn>
      </div>
    </CameraRig>
  );
};
