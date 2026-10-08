import React from 'react';
import {useCurrentFrame} from 'remotion';
import {clamp01, kf, powOutRemain, FONT_MONO, FONT_ORB} from '../../common';
import {CText, PhoneMock, PURPLE_LIGHT, GREY_MID, WHITE, exitOp, glowOffK, softOp, scaleIn} from '../../ui';
import {HeroGlow} from '../../fx';
import {AppDotV} from './g2bui';

/**
 * SC09 优化条 · N 1365–1505（S09 1373–1483：1373「That is the "optimizing apps" bar」/ 1432「you see after a big update」¶）
 * 居中 PhoneMock 缩窄（x 180–540，y 380–980）屏上 `Optimizing app` / `1 of N`（等宽 24px 两行）
 * + 屏内更新进度条 + 百分比推进（1377→1470 到 100%，与图标点亮同步收束 = 持续动作）；
 * 1432 4 枚环绕 app 图标每 10 帧点亮一枚（白闪 2 帧 + 紫光保持，顺时针：左上→左下→右下→右上；
 * 分镜表「每 16 帧」装不下停留预算 → 同横版 SC43 偏离 A3 改 10 帧，见 BUILD_NOTES）。
 * 停留：末枚点亮 1432+30=1462 落定 → 末 8 帧归零（1497–1505），hold ≈31 ✓（S09 末块 52）。
 * 主角：手机 600px；光：主角 HeroGlow 微呼吸 + 点亮图标紫光（分镜表光列「点亮图标紫」）。
 * 零 glitch；无扫光；无运镜（本镜不在运镜清单）。
 * 事实：Optimizing app 1 of N（research §5「大版本升级后开机 Optimizing app 1 of N = 全机 dex2oat 重跑」，示意）。
 */
export const F0 = 1365;
const TO = 1505;
const B_PHONE = 1365, B_BAR = 1371, B_PCT = 1377, B_ICON0 = 1432, ICON_STEP = 10;

const PHONE = {x: 180, y: 380, w: 360, h: 600};
const BAR = {x: 216, y: 716, w: 288, h: 12};
// 环绕图标（顺时针序）：左右两列各两枚，避开手机正上/正下
const ICONS: Array<[number, number]> = [
  [128, 520], // 左上
  [128, 820], // 左下
  [592, 820], // 右下
  [592, 520], // 右上
];

export const SC09: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const op = exitOp(N, TO, 8);
  if (op <= 0) return null;
  const gk = glowOffK(N, TO, 6, 8); // 图标紫光/进度条光先灭

  // 手机自下滑入 Δ70（≤100；S09 字幕 1373 才出现，入场段不穿字幕带）
  const phoneDy = 70 * powOutRemain(N - B_PHONE, 18, 2.5);
  // 进度/百分比：1377 起推进，随图标逐枚点亮加速，末枚落定（1462）后 1470 收束到 100%
  const pct = kf(N, [[B_PCT, 0], [1404, 0.05], [1432, 0.16], [1442, 0.38], [1452, 0.6], [1462, 0.84], [1470, 1]]);
  const pctInt = Math.round(clamp01(pct) * 100);
  const barGlow = 0.4 + 0.25 * Math.sin((2 * Math.PI * N) / 30);
  // 主角光：入场微光 → 图标点亮后随「整机重编完成」增强并呼吸（HeroGlow 自带 30 帧呼吸）
  const heroK = kf(N, [[1369, 0], [1385, 0.18], [1432, 0.2], [1466, 0.4], [1478, 0.34]]) * gk;

  return (
    <div style={{position: 'absolute', inset: 0, opacity: op}}>
      {/* 主角光池（手机背后） */}
      <HeroGlow x={PHONE.x} y={PHONE.y} w={PHONE.w} h={PHONE.h} r={44} N={N} k={heroK} />

      {/* 手机 + 屏内更新 UI（一起 slideUp） */}
      <div style={{position: 'absolute', inset: 0, opacity: softOp(N - B_PHONE, 8), transform: `translateY(${phoneDy.toFixed(1)}px)`}}>
        <PhoneMock x={PHONE.x} y={PHONE.y} w={PHONE.w} h={PHONE.h} iconN={0} />

        {/* 屏内：Optimizing app / 1 of N（两行等宽） */}
        <div style={{position: 'absolute', inset: 0, opacity: softOp(N - B_BAR, 8)}}>
          <CText cx={360} cy={614} size={24} weight={600} family={FONT_MONO} color={WHITE} letterSpacing={0.5} dy={0}>Optimizing app</CText>
          <CText cx={360} cy={656} size={24} weight={600} family={FONT_MONO} color={WHITE} letterSpacing={0.5} dy={0}>1 of N</CText>
        </div>

        {/* 屏内进度条 + 百分比计数（持续动作） */}
        <div style={{position: 'absolute', inset: 0, opacity: softOp(N - B_BAR, 8)}}>
          <div style={{position: 'absolute', left: BAR.x, top: BAR.y, width: BAR.w, height: BAR.h, boxSizing: 'border-box', border: `2px solid ${GREY_MID}`, borderRadius: 6, background: 'rgba(0,0,0,0.85)', overflow: 'hidden'}}>
            <div style={{position: 'absolute', left: 0, top: 0, bottom: 0, width: `${(clamp01(pct) * 100).toFixed(1)}%`, background: PURPLE_LIGHT, boxShadow: `0 0 ${(10 * barGlow).toFixed(1)}px rgba(161,117,241,${(0.8 * gk).toFixed(2)})`}} />
          </div>
          <CText cx={360} cy={782} size={26} weight={700} family={FONT_ORB} color={PURPLE_LIGHT} style={{fontVariantNumeric: 'tabular-nums'}} shadow={`0 0 12px rgba(161,117,241,${(0.55 * gk).toFixed(2)})`} dy={0}>{pctInt}%</CText>
        </div>
      </div>

      {/* 环绕 app 图标（1432 起逐一 pop + 白闪 2 帧 + 紫光保持，顺时针） */}
      {ICONS.map(([ix, iy], i) => {
        const t0 = B_ICON0 + i * ICON_STEP;
        if (N < t0) return null;
        const s = scaleIn(N - t0, 5);
        const flash = Math.sin(Math.PI * clamp01((N - t0) / 3));
        const k = clamp01((N - (t0 + 2)) / 4);
        return <AppDotV key={i} cx={ix} cy={iy} r={26} k={k} flash={flash} scale={s} />;
      })}
    </div>
  );
};

export default SC09;
