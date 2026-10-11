import React from 'react';
import {useCurrentFrame} from 'remotion';
import {clamp01, powOutRemain, FONT_MONO} from '../../common';
import {CameraRig} from '../../fx';
import {BrowserWin, PersonIcon, Pill, Box, MonoText, CText, SoftIn, GREY, GREY_MID, GREY_LINE, WHITE, EXAMPLE, abs, fadeIn, exitOp, glowOffK} from '../../ui';
import {WifiArc} from './g1ui';

/**
 * SC01 咖啡馆与邻桌（78–291）。S01+S02。
 * 节拍：86 Wi-Fi 弧线 draw-on + `free Wi-Fi` SoftIn｜124 浏览器 slideUp Δ110 + 地址栏打字机（2f/字）
 *       → 密码框圆点逐个填入（4f/点）｜201 邻桌组自右 slideIn（Δ280 侧向 + 前 6 帧渐入，18 帧）
 *       ｜243 笔电屏幕 capture 行逐行亮起（3f/行）+ 行持续滚动（每 30 帧一行循环）。
 * 运镜：1.0→1.05 慢推贯穿。主角：BrowserWin 370px（白描边 BLOOM + 白柔光）；邻桌无光。零 glitch。
 */
const F0 = 78;
const TO = 291;

// 版式（内容主区 y110–620）
const BR = {x: 90, y: 150, w: 410, h: 370}; // 浏览器（主角）
const WIFI = {cx: 1105, cy: 150}; // 右上角 Wi-Fi 图标（慢推 1.05 后顶部仍 ≥110）

export const SC01: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const exit = exitOp(N, TO, 8); // 末 8 帧归零

  // ---- Wi-Fi（86 起 draw-on 16 帧）----
  const wifiP = clamp01((N - 86) / 16);

  // ---- 浏览器（124 slideUp Δ110 / 22 帧，前 6 帧渐入）----
  const bn = N - 124;
  const brDy = 110 * powOutRemain(bn, 22, 2.5);
  const brOp = fadeIn(bn, 6);
  // 地址栏打字机：126 起 2 帧 1 字
  const typed = Math.max(0, Math.min(EXAMPLE.url.length, Math.floor((N - 126) / 2)));
  // 页面骨架逐条点亮（148 起，每 7 帧 1 条）
  const skelLit = Math.min(3, Math.max(0, Math.floor((N - 148) / 7)));
  // 密码圆点：186 起 4 帧 1 点，共 6 点（持续到 ~201）
  const dots = Math.max(0, Math.min(6, Math.floor((N - 186) / 4)));

  // ---- 邻桌组（201 自右 slideIn Δ280 / 18 帧 + 6 帧渐入）----
  const nn = N - 201;
  const nbX = 280 * powOutRemain(nn, 18, 2.5);
  const nbOp = fadeIn(nn, 6);
  // 笔电 capture 行：243 起逐行亮起（3f/行）+ 此后持续滚动（每 30 帧一行，周期 5）
  const rowOn = (i: number) => clamp01((N - (243 + i * 3)) / 4);
  const scroll = N > 255 ? 24 * (((N - 243) / 30) % 5) : 0;

  // 主角白柔光（离场前先灭光）
  const heroK = glowOffK(N, TO);

  return (
    <CameraRig N={N} keys={[{f: F0, x: 640, y: 360, s: 1}, {f: TO, x: 640, y: 360, s: 1.05}]}>
      <div style={abs(0, 0, 1280, 720)}>
        <div style={{...abs(0, 0, 1280, 720), opacity: exit}}>
          {/* ---- 浏览器（主角，白描边 BLOOM + 白柔光）---- */}
          <div style={{...abs(0, 0, 1280, 720), opacity: brOp, transform: `translateY(${brDy.toFixed(1)}px)`}}>
            <div style={{...abs(BR.x - 10, BR.y - 6, BR.w + 20, BR.h + 30), borderRadius: 18, boxShadow: `0 0 14px 4px rgba(255,255,255,${(0.16 * heroK).toFixed(3)}), 0 0 46px 16px rgba(255,255,255,${(0.12 * heroK).toFixed(3)})`, filter: 'drop-shadow(0 0 3px rgba(255,255,255,.5))'}} />
            <BrowserWin x={BR.x} y={BR.y} w={BR.w} h={BR.h} url={EXAMPLE.url} typed={typed} skeleton={3} skelLit={skelLit} />
            {/* 密码输入框（页面内容） */}
            <MonoText x={BR.x + 36} y={BR.y + 206} size={22} color={GREY} style={{lineHeight: 1}}>password</MonoText>
            <Box x={BR.x + 36} y={BR.y + 238} w={320} h={54} r={8} fill="#0d0d10" stroke={GREY_LINE} sw={1.5} />
            {dots > 0 ? (
              <CText cx={BR.x + 196} cy={BR.y + 265} size={26} family={FONT_MONO} color={WHITE} letterSpacing={7}>{'•'.repeat(dots)}</CText>
            ) : null}
            {/* 表单下方的页面骨架余行 */}
            {[0, 1].map((i) => (
              <div key={i} style={{...abs(BR.x + 36, BR.y + 312 + i * 42, 320 - i * 90, 20), background: '#18181c', border: '1px solid #2a2a2e', borderRadius: 3, opacity: skelLit > 1 + i ? 0.9 : 0.45}} />
            ))}
          </div>

          {/* ---- 右上角 Wi-Fi ---- */}
          <WifiArc cx={WIFI.cx} cy={WIFI.cy} p={wifiP} />
          <SoftIn N={N} f0={87}>
            <CText cx={WIFI.cx} cy={WIFI.cy + 52} size={22} weight={600} color={GREY}>free Wi-Fi</CText>
          </SoftIn>

          {/* ---- 邻桌组（黑暗中的旁观者，无光）---- */}
          <div style={{...abs(0, 0, 1280, 720), opacity: nbOp, transform: `translateX(${nbX.toFixed(1)}px)`}}>
            <PersonIcon cx={880} cy={265} size={150} sw={2.5} />
            {/* 笔电：屏 + 底座 */}
            <Box x={955} y={250} w={225} h={135} r={6} fill="#000" stroke={WHITE} sw={2.5} />
            <div style={{...abs(945, 385, 245, 12), background: '#000', border: '2px solid #FFF', borderBottom: 'none', borderRadius: '6px 6px 0 0'}} />
            {/* 屏内 capture 行（逐行亮起 + 持续滚动，5 行周期 ×8 行无缝） */}
            <div style={{...abs(967, 260, 200, 115), overflow: 'hidden'}}>
              <div style={{transform: `translateY(${(-scroll).toFixed(1)}px)`}}>
                {Array.from({length: 8}, (_, i) => {
                  const k = i % 5;
                  const on = i < 5 ? rowOn(i) : rowOn(k);
                  return (
                    <div key={i} style={{...abs(0, i * 24, 200, 22), opacity: 0.14 + 0.86 * on}}>
                      <div style={{...abs(2, 8, 5, 5), borderRadius: '50%', background: ['#8FF740', '#F05F41', '#A0A0A1', '#8FF740', '#F05F41'][k], opacity: 0.9}} />
                      <div style={{...abs(14, 6, 120 + ((k * 53) % 60), 9), background: '#3a3a40', borderRadius: 2}} />
                    </div>
                  );
                })}
              </div>
            </div>
            {/* 底部 Pill：packet capture（灰） */}
            <div style={{...abs(0, 0, 1280, 720), opacity: clamp01((N - 243) / 8)}}>
              <Pill x={872} y={445} w={240} h={44} fill="#151517" stroke={GREY_MID} sw={1.5} text="packet capture" fontSize={22} weight={600} color={GREY} />
            </div>
          </div>
        </div>
      </div>
    </CameraRig>
  );
};
