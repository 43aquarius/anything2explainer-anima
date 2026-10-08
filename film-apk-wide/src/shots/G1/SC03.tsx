import React from 'react';
import {useCurrentFrame} from 'remotion';
import {emphasisPulse, clamp01, FONT_WIDE} from '../../common';
import {GlitchIn} from '../../common';
import {CText, PURPLE, WHITE, exitOp, glowOffK} from '../../ui';
import {CameraRig} from '../../fx';
import type {CamKey} from '../../fx';
import {FilenameCard, X_ZIP} from './layout';

/**
 * SC03 ★改后缀魔术 · N 332–445（S03 340–408 ¶+gap15：340 改名 / 373 APK → ZIP）
 * 章 1 高光·揭示型。承接文件名卡：340 后缀 `.apk` 白底反色选中（8 帧 wipe + 6 帧微呼吸）→
 * 373 字符交换（.apk 4 字符 powIn 上抛淡出 10 帧、.zip 4 字符 easeOut 自下落入 12 帧）→
 * 391 卡边框白闪 3 帧 → 394 `ZIP` 大字 GlitchIn（rgbSplit 6，本镜唯一 glitch）+ emphasisPulse + 紫描边光晕 30 帧呼吸。
 * 运镜：340–373 推 1→1.15 对准交换瞬间（锚点 (640,400)，`ZIP` 底缘映射 621 < 637 不进字幕带）。
 * 停留：大字落位 406 → 离场 437，31 帧 ✓；末 8 帧归零。
 */
const F0 = 332;
const TO = 445;
const CAM: CamKey[] = [
  {f: 332, x: 640, y: 360, s: 1},
  {f: 340, x: 640, y: 360, s: 1},
  {f: 373, x: 640, y: 400, s: 1.15},
];

export const SC03: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const zn = N - (X_ZIP - 2); // glitch 前挂 2 帧：满态 404，为段末 ≥30f 稳定期留窗口（391–394 卡白闪期间大字开始闪入，视觉可容）
  const pulse = emphasisPulse(zn, {peak: 1.08, up: 6, hold: 1, down: 6}); // 脉冲在 glitch 乱序期内完成（392–405），不侵占稳定期
  const zOp = exitOp(N, TO, 4);
  const zGlow = glowOffK(N, TO, 5, 4);
  const bconv = 1 - clamp01((N - 404) / 5); // 404 后 5 帧呼吸幅度归零（稳定期从 glitch 满态即开始；BUILD_RULES §4）
  const breathe = 0.7 + 0.3 * bconv * Math.sin((2 * Math.PI * (N - X_ZIP)) / 30);
  return (
    <CameraRig N={N} keys={CAM}>
      {/* 文件名卡（承接 SC02 完成态；末 8 帧随全组归零） */}
      <FilenameCard N={N} exitAt={TO} />
      {/* `ZIP` 大字（揭示） */}
      {zn >= 0 ? (
        <GlitchIn N={N} f0={X_ZIP - 2} rgbSplit={6} seed={3}>
          <CText
            cx={640}
            cy={572}
            size={110}
            weight={400}
            family={FONT_WIDE}
            color={WHITE}
            letterSpacing={6}
            opacity={zOp}
            style={{
              transform: `translate(-50%,-50%) scale(${pulse.toFixed(4)})`,
              WebkitTextStroke: `3.5px ${PURPLE}`,
              paintOrder: 'stroke fill',
              textShadow: `0 0 ${Math.round(16 + 12 * breathe)}px rgba(161,117,241,${(0.55 + 0.35 * breathe) * zGlow}), 0 0 4px rgba(161,117,241,${0.5 * zGlow})`,
            }}
          >
            ZIP
          </CText>
        </GlitchIn>
      ) : null}
    </CameraRig>
  );
};
