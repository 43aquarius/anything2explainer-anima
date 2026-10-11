import React from 'react';
import {useCurrentFrame} from 'remotion';
import {clamp01, slideIn, emphasisPulse, GlitchIn, FONT_ORB} from '../../common';
import {CameraRig, HeroGlow} from '../../fx';
import {CertCard, StampSeal, BrowserWin, CText, Svg, SoftIn, Pill, GREY, GREY_MID, WHITE, PURPLE_LIGHT, ORANGE, abs, fadeIn, exitOp, glowOffK} from '../../ui';

/**
 * SC21 证书与邮戳墙（4293–4562）。S29–S30。★高光时刻·大数字型。
 * 节拍：4301 CertCard slideUp + 域名 SoftIn ｜4331 CA 邮戳盖下（scale 1.4→1 + 旋转落定 12 帧）+ 白闪 4 帧 + `certificate` 灰字
 *       ｜4397 右半浏览器轮廓 draw-on（20 帧）+ 拉远运镜 33 帧 1→1.18
 *       ｜4430 邮票墙 42 枚分 6 波点亮（每波 7 枚 × 2 帧错峰）+ `≈120` GlitchIn(rgbSplit 6) + 20 帧计数 0→120 + 橙光晕
 *       ｜4465 `authorities, pre-installed` SoftIn ｜4519 `Trust, pre-installed` Pill 紫光（前挂 c3 末）。
 * 持续：墙微呼吸（错峰 40 帧周期）。运镜：拉远 1→1.18（4397–4430）已计。
 * 主角：邮票墙+`≈120` 420px（橙光晕 + 墙紫光斑）。
 */
const F0 = 4293;
const TO = 4562;

const CC = {x: 130, y: 210, w: 440, h: 300};
const WALL = {x: 730, y: 200, w: 460, h: 330};
const COLS = 7, ROWS = 6;

export const SC21: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const exit = exitOp(N, TO, 8);
  const glowK = glowOffK(N, TO);

  // CertCard slideUp（4301 起 18 帧）
  const cn = N - 4301;
  const cardDy = 100 * Math.pow(1 - clamp01(cn / 18), 2.5);

  // CA 邮戳盖下（4331 起 12 帧）
  const stn = N - 4331;
  const stS = 1.4 - 0.4 * clamp01(stn / 12);
  const stFlash = N >= 4341 && N < 4345 ? 1 : 0;

  // 右半浏览器轮廓（4397 draw-on 20 帧）
  const bwP = clamp01((N - 4397) / 20);

  // 邮票墙（4430 起 6 波，每波 7 枚，每枚 2 帧错峰 8 帧亮入）
  const stampOn = (i: number) => clamp01((N - (4430 + Math.floor(i / 7) * 8)) / 8);

  // ≈120 计数（4434 起 20 帧）
  const roll = clamp01((N - 4434) / 20);
  const val = Math.round(120 * (1 - Math.pow(1 - roll, 2)));
  const landed = roll >= 1;

  // 墙呼吸（持续）
  const breathe = (i: number) => 0.85 + 0.15 * Math.sin(((N + i * 6) / 40) * Math.PI * 2);

  return (
    <CameraRig N={N} keys={[{f: F0, x: 640, y: 360, s: 1}, {f: 4397, x: 640, y: 360, s: 1}, {f: 4430, x: 640, y: 390, s: 1.18}]}>
      <div style={{...abs(0, 0, 1280, 720), opacity: exit}}>
        {/* 左：CertCard（主角之一） */}
        <div style={{...abs(0, 0, 1280, 720), opacity: fadeIn(cn, 6), transform: `translateY(${cardDy.toFixed(1)}px)`}}>
          <CertCard x={CC.x} y={CC.y} w={CC.w} h={CC.h} domain="shop.example" ca="CA" stamped={clamp01(stn / 12)} accent />
          <SoftIn N={N} f0={4331}>
            <CText cx={CC.x + CC.w / 2} cy={CC.y + CC.h + 44} size={26} weight={500} color={GREY}>certificate</CText>
          </SoftIn>
          {stFlash ? <div style={{...abs(CC.x + CC.w - 100, CC.y + CC.h - 100, 90, 90), background: 'rgba(255,255,255,.5)', borderRadius: '50%'}} /> : null}
        </div>

        {/* 右：浏览器轮廓 + 邮票墙（主角） */}
        <div style={{...abs(0, 0, 1280, 720), opacity: bwP > 0 ? 1 : 0}}>
          <BrowserWin x={WALL.x - 30} y={WALL.y - 24} w={WALL.w + 60} h={WALL.h + 90} url="about: roots" barP={bwP} opacity={bwP} />
          {Array.from({length: COLS * ROWS}).map((_, i) => {
            const col = i % COLS, row = Math.floor(i / COLS);
            const sx = WALL.x + 28 + col * 62, sy = WALL.y + 64 + row * 46;
            const on = stampOn(i);
            return on <= 0.02 ? null : (
              <div key={i} style={{...abs(0, 0, 1280, 720), opacity: on * breathe(i)}}>
                <StampSeal cx={sx} cy={sy} r={24} text="" p={on} />
              </div>
            );
          })}
          {/* ≈120 大数字（GlitchIn + 计数 + 橙光晕） */}
          {roll > 0 ? (
            <GlitchIn N={N} f0={4434} rgbSplit={6}>
              <div style={{...abs(0, 0, 1280, 720)}}>
                <CText cx={WALL.x + WALL.w / 2} cy={WALL.y - 46} size={86} weight={700} family={FONT_ORB} color={landed ? ORANGE : GREY} letterSpacing={3}
                  style={landed ? {textShadow: '0 0 42px rgba(243,95,69,.65), 0 0 12px rgba(243,95,69,.5)', transform: `scale(${emphasisPulse(N - 4454, {peak: 1.11})})`} : undefined}>
                  {landed ? '≈120' : val}
                </CText>
              </div>
            </GlitchIn>
          ) : null}
          <SoftIn N={N} f0={4465}>
            <CText cx={WALL.x + WALL.w / 2} cy={WALL.y + WALL.h + 76} size={24} weight={500} color={GREY}>authorities, pre-installed</CText>
          </SoftIn>
          <SoftIn N={N} f0={4512}>
            <Pill x={WALL.x + WALL.w / 2 - 120} y={WALL.y + WALL.h + 100} w={240} h={46} fontSize={24} text="Trust, pre-installed" color={PURPLE_LIGHT} stroke={PURPLE_LIGHT} />
          </SoftIn>
        </div>

        {/* 连接箭头（证书 → 墙） */}
        <Svg bloom={false}>
          {bwP >= 1 ? <line x1={CC.x + CC.w + 14} y1={CC.y + 150} x2={CC.x + CC.w + 14 + 120 * clamp01((N - 4428) / 14)} y2={CC.y + 150} stroke={GREY_MID} strokeWidth={2} strokeDasharray="8 7" /> : null}
        </Svg>
      </div>
    </CameraRig>
  );
};
