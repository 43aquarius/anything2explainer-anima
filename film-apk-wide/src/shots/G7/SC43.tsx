import React from 'react';
import {useCurrentFrame} from 'remotion';
import {clamp01, powIn, powOutRemain, FONT_MONO, FONT_ORB} from '../../common';
import {CText, PhoneMock, PURPLE_LIGHT, GREY_MID, WHITE, exitOp, glowOffK, softOp, scaleIn} from '../../ui';
import {UpdateHat, AppDot} from './g7ui';

/**
 * SC43 优化条 · N 6308–6502（S43 6316–6500 段内：6316「That is the optimizing bar you see」/ 6371「when your phone updates itself:」/ 6433「every app on the device, recompiled.」）
 * 居中 PhoneMock（0.9×：216×432 @ x 532–748，y 154–586，主角 432px）：屏内 `Optimizing app 1 of N`（等宽 20px 两行）+
 * 系统更新进度条 + 百分比计数推进（持续动作，6320→6490 到 100%）；6371 手机顶部「更新帽」stampIn（1.35→1 + 白闪）；
 * 6433 六枚环绕 app 图标（白边圆）逐一 pop + 白闪 2f + 紫光保持（顺时针：左上→左→左下→右下→右→右上），
 * 间隔 10f（分镜表 16f 装不下本镜区间，见 BUILD_NOTES 偏离 A3），全部点亮 ≈6489（进度条同步到 100%）。
 * 停留：段内不判。末 8 帧归零。
 */
const F0 = 6308;
const TO = 6502;
const B_PHONE = 6309, B_BAR = 6316, B_PCT = 6320, B_HAT = 6371, B_ICON0 = 6433, ICON_STEP = 10;

const PHONE = {x: 532, y: 154, w: 216, h: 432};
const BAR = {x: 562, y: 396, w: 156, h: 12};
// 环绕图标（顺时针序）：椭圆环避开手机正上/正下（顶部要放更新帽，底部留白）
const ICONS: Array<[number, number]> = [
  [454, 274], // 左上
  [435, 375], // 左
  [454, 476], // 左下
  [826, 476], // 右下
  [845, 375], // 右
  [826, 274], // 右上
];

export const SC43: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const op = exitOp(N, TO, 8);
  if (op <= 0) return null;
  const gk = glowOffK(N, TO, 6, 8);

  const phoneDy = 100 * powOutRemain(N - B_PHONE, 18, 2.5);
  // 进度/百分比：6320 → 6490 推进到 100%（与图标点亮同步收束）
  const pct = clamp01((N - B_PCT) / 170);
  const pctInt = Math.round(pct * 100);
  // 更新帽 stampIn（1.35→1 + 白闪 2f）
  const hatS = 1.35 - 0.35 * powIn(2.2)(clamp01((N - B_HAT) / 10));
  const hatFlash = Math.sin(Math.PI * clamp01((N - (B_HAT + 1)) / 4));
  const barGlow = 0.4 + 0.25 * Math.sin((2 * Math.PI * N) / 30);

  return (
    <div style={{position: 'absolute', inset: 0, opacity: op}}>
      {/* 手机（0.9×）+ 屏内更新 UI（一起 slideUp） */}
      <div style={{position: 'absolute', inset: 0, opacity: softOp(N - B_PHONE, 8), transform: `translateY(${phoneDy.toFixed(1)}px)`}}>
        <PhoneMock x={PHONE.x} y={PHONE.y} w={PHONE.w} h={PHONE.h} iconN={0} />

        {/* 屏内：Optimizing app 1 of N（两行，等宽 20px） */}
        <div style={{position: 'absolute', inset: 0, opacity: softOp(N - B_BAR, 8)}}>
          <CText cx={640} cy={322} size={20} weight={600} family={FONT_MONO} color={WHITE} letterSpacing={0.5}>Optimizing app</CText>
          <CText cx={640} cy={352} size={20} weight={600} family={FONT_MONO} color={WHITE} letterSpacing={0.5}>1 of N</CText>
        </div>

        {/* 屏内进度条 + 百分比计数（持续动作） */}
        <div style={{position: 'absolute', inset: 0, opacity: softOp(N - B_BAR, 8)}}>
          <div style={{position: 'absolute', left: BAR.x, top: BAR.y, width: BAR.w, height: BAR.h, boxSizing: 'border-box', border: `1.5px solid ${GREY_MID}`, borderRadius: 6, background: 'rgba(0,0,0,0.85)', overflow: 'hidden'}}>
            <div style={{position: 'absolute', left: 0, top: 0, bottom: 0, width: `${(pct * 100).toFixed(1)}%`, background: PURPLE_LIGHT, boxShadow: `0 0 ${(10 * barGlow).toFixed(1)}px rgba(161,117,241,${(0.8 * gk).toFixed(2)})`}} />
          </div>
          <CText cx={640} cy={444} size={26} weight={700} family={FONT_ORB} color={PURPLE_LIGHT} style={{fontVariantNumeric: 'tabular-nums'}} shadow={`0 0 12px rgba(161,117,241,${(0.55 * gk).toFixed(2)})`}>{pctInt}%</CText>
        </div>

        {/* 更新帽（手机顶部，6371 stampIn + 白闪） */}
        {N >= B_HAT ? (
          <div style={{position: 'absolute', inset: 0, transform: `scale(${hatS.toFixed(3)})`, transformOrigin: '640px 154px', filter: `brightness(${(1 + 0.5 * hatFlash).toFixed(3)})`}}>
            <UpdateHat cx={640} y={124} w={64} />
          </div>
        ) : null}
      </div>

      {/* 环绕 app 图标（6433 起逐一 pop + 白闪 + 紫光保持，顺时针） */}
      {ICONS.map(([ix, iy], i) => {
        const t0 = B_ICON0 + i * ICON_STEP;
        if (N < t0) return null;
        const s = scaleIn(N - t0, 5);
        const flash = Math.sin(Math.PI * clamp01((N - t0) / 3));
        const k = clamp01((N - (t0 + 2)) / 4);
        return <AppDot key={i} cx={ix} cy={iy} r={22} k={k} flash={flash} scale={s} />;
      })}
    </div>
  );
};

export default SC43;
