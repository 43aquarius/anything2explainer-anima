import React from 'react';
import {useCurrentFrame} from 'remotion';
import {clamp01, FONT_ORB} from '../../common';
import {CText, WHITE, GREY, ORANGE, GREEN, firstOp, exitOp, glowOffK, SoftIn, scaleIn, abs} from '../../ui';
import {countTo, CameraRig} from '../../fx';
import type {CamKey} from '../../fx';
import {WhyCards, TenClock, CLOCK} from './layout';

/**
 * SC10 十秒之谜 · N 1426–1584（S10 1434–1529 ¶+gap20：1434 And what actually happens /
 * 1466 in the ten seconds after you tap Install?）
 * 承接：SC09 对照双卡（同组件同参数）1427–1441 淡出；中央大时钟（TenClock，cx 640 cy 330 r 150）：
 * 1428 圆盘 draw-on 18 帧 + 12 刻度 2 帧错峰 → 1434 双针亮相 + 快弧 −60°→+60°（30 帧划过一弧，持续动作）
 * + 表内 `10 s`（Orbitron 64px 橙）14 帧计数落位 + 表盘橙光呼吸（30 帧周期，主角之光）；
 * 1466 时钟下方 `after you tap Install`（灰 26px）+ 右下角 Install 小按钮（呼应 SC01 绿边小圆 r48）缩放入场
 * + 每 20 帧 blink 两次（持续动作）。
 * 运镜：1452–1485 定点推近 1→1.1（锚 (640,360) 固定、只改 s，词汇表标准型；时钟各部 1452 前落位、文案/按钮为单件 SoftIn/scaleIn，
 *   先例 SC15；结束 1485 ≤ 离场 1522−30 ✓）。停留：落位 1485 → 离场 1522，hold 37 帧 ✓。
 * 末 10 帧整组归零（1522–1531，橙光/绿环先灭 6 帧）：分镜表「离场 1531−10」；1532–1584 零输出（章节卡 1532–1596 接管）。
 */
const F0 = 1426;
const TO = 1584; // ShotDef 区间到 1584（任务指示）；内容 1531 前全部归零
const T_ZERO = 1531; // 整组归零帧（章节卡 1532 起）
const T_10S = 1434; // 双针 + `10 s` 14 帧计数（S10.c1）
const T_CAP = 1466; // after you tap Install（S10.c2）
const T_BTN = 1466; // Install 小按钮缩放入场
const CAM: CamKey[] = [
  {f: 1426, x: 640, y: 360, s: 1}, // s=1 锚画布中心 = 恒等变换 → 与 SC09 无相机渲染交界帧像素一致
  {f: 1452, x: 640, y: 360, s: 1},
  {f: 1485, x: 640, y: 360, s: 1.1}, // 33 帧定点推近（锚固定，只改 s）
];
const BTN = {cx: 1072, cy: 512, r: 48}; // 右下角（世界坐标；1.1× 后屏幕 ~(1115,540)，安全区内）

export const SC10: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const exOp = exitOp(N, T_ZERO, 10); // 末 10 帧整组归零（分镜表 SC10）
  const glowK = glowOffK(N, T_ZERO, 6, 10); // 橙光/文字光先灭
  if (exOp <= 0) return null; // 1532–1584：章节卡区间，本镜零输出

  // 表盘橙光呼吸（30 帧周期）+ 入场渐亮
  const br = 0.5 + 0.5 * Math.sin((2 * Math.PI * N) / 30);
  const glowIn = clamp01((N - T_10S) / 12);

  // Install 小按钮：14 帧缩放入场 + 每 20 帧 blink 两次（ring 两次起伏）
  const bn = N - T_BTN;
  const bS = bn < 0 ? 0 : 0.65 + 0.35 * scaleIn(bn, 14);
  const bOp = bn < 0 ? 0 : firstOp(bn, 6);
  const ph = N % 20;
  const bump = (x: number) => (x >= 0 && x <= 6 ? Math.sin((Math.PI * x) / 6) : 0);
  const blinkK = bump(ph - 2) + bump(ph - 12);

  return (
    <div style={{position: 'absolute', inset: 0, opacity: exOp}}>
      <CameraRig N={N} keys={CAM}>
        {/* 承接：SC09 对照双卡淡出（1427–1441；交界帧 1425|1426 像素一致） */}
        <WhyCards N={N} exitAt={1441} />

        {/* 表盘橙光（呼吸，主角之光） */}
        <div
          style={{
            ...abs(CLOCK.cx - 190, CLOCK.cy - 190, 380, 380),
            borderRadius: '50%',
            background: `radial-gradient(circle, rgba(240,95,65,${(0.2 * br * glowIn * glowK).toFixed(3)}) 0%, rgba(240,95,65,${(0.09 * br * glowIn * glowK).toFixed(3)}) 42%, rgba(240,95,65,0) 70%)`,
            opacity: glowIn,
          }}
        />

        {/* 时钟（圆盘 draw-on + 刻度错峰 + 双针扫弧） */}
        <TenClock N={N} glowK={glowK} />

        {/* 表盘内 `10 s`（橙，计数落位；指针漂移路径已验证不穿文本） */}
        {N >= T_10S ? (
          <CText
            cx={640} cy={425} size={64} weight={700} family={FONT_ORB} letterSpacing={2} color={ORANGE}
            opacity={firstOp(N - T_10S, 6)}
            shadow={`0 0 26px rgba(240,95,65,${(0.55 * glowK).toFixed(2)}), 0 0 60px rgba(240,95,65,${(0.22 * glowK).toFixed(2)})`}
            style={{fontVariantNumeric: 'tabular-nums'}}
          >
            {countTo(N - T_10S, 0, 10, 14)} s
          </CText>
        ) : null}

        {/* 时钟下方说明（S10.c2） */}
        <SoftIn N={N} f0={T_CAP}>
          <CText cx={640} cy={522} size={26} weight={500} color={GREY}>
            after you tap Install
          </CText>
        </SoftIn>

        {/* 右下角 Install 小按钮（呼应 SC01：绿边小圆 + 待命环，每 20 帧 blink 两次） */}
        {bOp > 0 ? (
          <div style={{position: 'absolute', left: BTN.cx, top: BTN.cy, transform: `translate(-50%,-50%) scale(${bS.toFixed(4)})`, opacity: bOp}}>
            <svg width={140} height={140} viewBox="0 0 140 140" style={{position: 'absolute', left: -70, top: -70, overflow: 'visible'}}>
              <circle cx={70} cy={70} r={BTN.r + 9 + 3 * blinkK} fill="none" stroke={GREEN} strokeWidth={2} opacity={0.22 + 0.5 * blinkK} />
              <circle cx={70} cy={70} r={BTN.r} fill="#000" stroke={GREEN} strokeWidth={3} />
            </svg>
            <CText cx={0} cy={0} size={22} weight={700} color={WHITE}>
              Install
            </CText>
          </div>
        ) : null}
      </CameraRig>
    </div>
  );
};
