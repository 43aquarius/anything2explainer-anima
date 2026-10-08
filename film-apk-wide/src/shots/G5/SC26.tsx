import React from 'react';
import {useCurrentFrame} from 'remotion';
import {clamp01, easeInOutPow} from '../../common';
import {PhoneMock, GREEN, exitOp, softOp, firstOp} from '../../ui';
import {ParcelGlow, InstallBig, FingerPress, INSTALL26} from './g5ui';

/**
 * SC26 点下安装 · N 3734–3774（S26 3742–3772：3742「So you tap Install.」）
 * **章界承接**（分镜表全局约束 7）：SC25 的包裹（cx 640, cy 340, w 280 h 200, openP 0.25, sealP 1, label 'ZIP'
 * ——SC25 分镜表终态参数）kf 24 帧飞入手机屏（缩至 0.2×，光随缩小收敛）。
 * 3742 按下：手指降 10px + 按钮 1.06→0.97 squash + 两圈绿波纹 draw-on 各 12 帧 + 按钮变灰（已按下）；
 * 3756 手机屏顶部下载完成绿点角标。末 8 帧归零。
 * 主角：手机+按钮组（手机 470px 高）；光：按钮绿波纹 / 包裹紫晕（飞行中收敛）。
 */
export const F0 = 3734;
const TO = 3774;
const PRESS = 3742;
const FLY_END = 3758;
const BADGE = 3756;
// SC25 终态 → 手机屏内落点
const P0 = {cx: 640, cy: 340, w: 280, h: 200, openP: 0.25, sealP: 1};
const P1 = {cx: 272, cy: 210, s: 0.2};

export const SC26: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const op = exitOp(N, TO, 8);
  if (op <= 0) return null;

  // 包裹飞入（24 帧 easeInOutPow 2.5；SC25 章节卡已退场，首帧即从其终态起跳）
  const t = easeInOutPow(2.5)(clamp01((N - F0) / 24));
  const pcx = P0.cx + (P1.cx - P0.cx) * t;
  const pcy = P0.cy + (P1.cy - P0.cy) * t;
  const ps = 1 + (P1.s - 1) * t;
  // 主角光：随飞行收敛（0.85 → 0.12），落位后只余微光；离场先灭
  const glowK = (0.85 - 0.73 * t) * (1 - clamp01((N - FLY_END) / 10) * 0.5);

  // 绿点角标（下载完成）：3756 起 + 一次扩散脉冲
  const badgeN = N - BADGE;
  const bOp = softOp(badgeN, 6);
  const bPulse = badgeN > 2 ? clamp01((badgeN - 2) / 12) : 0;

  const phOp = firstOp(N - F0, 6);

  return (
    <div style={{position: 'absolute', inset: 0, opacity: op}}>
      {/* 手机（亮屏，1 格紫点 = 刚到的 ChatApp；SC01 同款机位） */}
      {phOp > 0 ? <PhoneMock x={140} y={140} w={260} h={470} litN={1} iconN={12} opacity={phOp} /> : null}

      {/* 承接包裹：飞入手机屏（缩至 0.2×） */}
      <ParcelGlow cx={pcx} cy={pcy} w={P0.w} h={P0.h} s={ps} N={N} openP={P0.openP} sealP={P0.sealP} label="ZIP" glowK={glowK} />

      {/* 下载完成绿点角标（手机屏顶部） */}
      {bOp > 0 ? (
        <svg width={80} height={80} viewBox="0 0 80 80" style={{position: 'absolute', left: 272 - 40, top: 168 - 40, overflow: 'visible', opacity: bOp}}>
          {bPulse > 0 && bPulse < 1 ? <circle cx={40} cy={40} r={7 + 16 * bPulse} fill="none" stroke={GREEN} strokeWidth={2} opacity={(1 - bPulse) * 0.7} /> : null}
          <circle cx={40} cy={40} r={6} fill={GREEN} style={{filter: 'drop-shadow(0 0 6px rgba(143,247,64,.9))'}} />
        </svg>
      ) : null}

      {/* Install 大按钮 + 按下的手指 */}
      <InstallBig N={N} f0={F0} pressAt={PRESS} />
      <FingerPress cx={INSTALL26.cx} tipY={INSTALL26.cy - INSTALL26.r - 8} N={N} f0={F0} pressAt={PRESS} />
    </div>
  );
};

export default SC26;
