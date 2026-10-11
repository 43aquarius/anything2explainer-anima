import React from 'react';
import {useCurrentFrame} from 'remotion';
import {clamp01, slideIn, GlitchIn, emphasisPulse, FONT_ORB} from '../../common';
import {CameraRig} from '../../fx';
import {LockSeal, BrowserWin, CText, Svg, SoftIn, GREY, GREY_MID, WHITE, PURPLE_LIGHT, ORANGE, abs, fadeIn, exitOp, glowOffK} from '../../ui';

/**
 * SC24 五分之四（5013–5206）。S33。
 * 节拍：5021 5 张刻度卡 2 帧错峰 slideUp（各 14 帧）
 *       ｜5076 前 4 张依次紫光点亮（每张 6 帧）+ `4 in 5` GlitchIn(rgbSplit 4) + 20 帧计数 + 橙光晕
 *       ｜5152 浏览器缩微 SoftIn + 小锁咔哒扣合 + `just... normal` 灰字 + 刻度卡呼吸轮亮。
 * 持续：刻度卡呼吸轮亮（40 帧周期）。运镜：33 帧 1→1.15 推向 `4 in 5`（5076–5109，运镜不进末拍）。
 * 主角：`4 in 5`+刻度排 300px（橙光晕 / 刻度紫）。
 */
const F0 = 5013;
const TO = 5206;

const TICKS = [0, 1, 2, 3, 4].map((i) => ({x: 350 + i * 150, lit: i < 4}));

export const SC24: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const exit = exitOp(N, TO, 8);
  const glowK = glowOffK(N, TO);

  // 刻度卡（5021 起 2 帧错峰 slideUp 14 帧）
  const tickIn = (i: number) => clamp01((N - (5021 + i * 2)) / 14);
  // 前 4 张紫光点亮（5076 + i*6，各 6 帧）
  const tickLit = (i: number) => clamp01((N - (5076 + i * 6)) / 6);
  // 4 in 5 计数（5082 起 20 帧）
  const roll = clamp01((N - 5082) / 20);
  const val = Math.round(5 * (1 - Math.pow(1 - roll, 2)));
  const landed = roll >= 1;
  // 浏览器缩微 + 小锁（5152 起）+ 咔哒（5166–5172）
  const miniIn = clamp01((N - 5152) / 8);
  const click = clamp01((N - 5166) / 6);
  // 呼吸轮亮（持续，5110 起）
  const breathe = (i: number) => 0.9 + 0.1 * Math.sin(((N + i * 8) / 40) * Math.PI * 2);

  return (
    <CameraRig N={N} keys={[{f: F0, x: 640, y: 360, s: 1}, {f: 5076, x: 640, y: 360, s: 1}, {f: 5109, x: 640, y: 330, s: 1.15}]}>
      <div style={{...abs(0, 0, 1280, 720), opacity: exit}}>
        {/* `4 in 5` 大字（主角） */}
        {roll > 0 ? (
          <GlitchIn N={N} f0={5076} rgbSplit={4}>
            <div style={{...abs(0, 0, 1280, 720)}}>
              <CText cx={640} cy={250} size={110} weight={700} family={FONT_ORB} color={landed ? ORANGE : GREY} letterSpacing={3}
                style={landed ? {textShadow: '0 0 42px rgba(243,95,69,.6), 0 0 12px rgba(243,95,69,.45)', transform: `scale(${emphasisPulse(N - 5102, {peak: 1.11})})`} : undefined}>
                {landed ? '4 in 5' : `? in ${val}`}
              </CText>
            </div>
          </GlitchIn>
        ) : null}
        <SoftIn N={N} f0={5090}>
          <CText cx={640} cy={322} size={24} weight={500} color={GREY}>page loads travel over TLS</CText>
        </SoftIn>

        {/* 刻度排（5 张页面加载卡） */}
        {TICKS.map((t, i) => {
          const on = tickIn(i);
          if (on <= 0.02) return null;
          const lit = t.lit ? tickLit(i) : 0;
          return (
            <div key={i} style={{...abs(0, 0, 1280, 720), opacity: on, transform: `translateY(${(26 * (1 - on)).toFixed(1)}px)`}}>
              <div style={{position: 'absolute', left: t.x - 45, top: 388, width: 90, height: 130, borderRadius: 10, background: '#000',
                border: `2px solid ${lit > 0.5 ? PURPLE_LIGHT : GREY_MID}`, opacity: t.lit ? breathe(i) : 0.6,
                boxShadow: lit > 0.5 ? `0 0 ${(12 * lit * breathe(i)).toFixed(0)}px rgba(102,45,248,.4)` : 'none',
                display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                {t.lit ? <div style={{transform: 'scale(0.8)'}}><LockSeal cx={0} cy={0} w={44} h={56} /></div> : <CText cx={0} cy={0} size={30} weight={500} color={GREY_MID}>1</CText>}
              </div>
            </div>
          );
        })}

        {/* 浏览器缩微（小到没人注意） */}
        <div style={{...abs(0, 0, 1280, 720), opacity: miniIn}}>
          <BrowserWin x={880} y={430} w={290} h={190} url="https://" barP={1} opacity={0.85} />
          <div style={{...abs(0, 0, 1280, 720), opacity: click}}>
            <LockSeal cx={918} cy={476} w={38} h={48} glow />
          </div>
        </div>
        <SoftIn N={N} f0={5152}>
          <CText cx={640} cy={596} size={24} weight={400} color={GREY} italic>the little lock is just... normal</CText>
        </SoftIn>
      </div>
    </CameraRig>
  );
};
