import React from 'react';
import {useCurrentFrame} from 'remotion';
import {clamp01, easeInOutPow, emphasisPulse, rnd, EM_ORB, FONT_ORB, FONT_TECH, textW} from '../../common';
import {CameraRig} from '../../fx';
import {
  AirPulse, CText, DeviceGlyph, GREY, GREY_MID, ORANGE, PURPLE_LIGHT, WHITE, abs, SoftIn, fadeIn, firstOp, exitOp, glowOffK,
} from '../../ui';
import {EX, FilmCell, OldLaptop} from './shared';

/**
 * SC11 1997 · N 2242–2485（S21–S22；TO = 2485，SC12 from 2486）
 * 章首承接：章节卡 The Promise（2197–2241）后直入——`1997` YearRoll 滚落本身就是承接。
 * 节拍：2265「This all began in 1997」YearRoll 四位数字先后落定（2247/2253/2259/2264）+ 老式厚笔记本 draw-on（14f）
 *        ｜2338「two megabits, if the air was kind」`2 Mbit/s` Orbitron 40px 橙落定（SoftIn 2332 起 + 拍同帧 pulse）
 *          + 老短弧慢发（ui.AirPulse speed 42 帧/波——"慢"是戏）
 *        ｜2418「Today, the same air carries movies」右侧现代轻薄设备（ui.DeviceGlyph）缩入（21f）
 *          + 宽弧亮起（speed 9 帧/波 + maxR 175——带宽对比）+ 胶片格 ×3 沿弧 r130 轨道连续缓流（90f/格）
 *          + `a movie` 灰标（2420）+ 左右带宽对比条（2424 起右条伸展 12f，窄橙 vs 宽紫）
 * 尾部：末动效 2418 前挂起、落位 ~2439 ≤ TO−45=2440 ✓；hold = 2480(exit)−2439 ≈ 35f（胶片缓流/弧循环为低幅）。
 * 运镜：2402–2435 推近 1→1.12 向右侧（2418 拍前挂 16f，相机末 key 2435 = TO−50 ✓）。
 * 主角：新旧对比组 330px（`1997` 96px Orbitron + 老厚笔记本 260px + 现代设备 300px）；零 glitch（白名单）。
 */
const F0 = 2242;
const TO = 2485;

const T_ROLL = 2242; // YearRoll 起
const DIG_END = [2247, 2253, 2259, 2264]; // 千/百/十/个位落定帧（个位 2264 = 拍 2265−1）
const T_LAP = 2265; // 老笔记本 draw-on（14f）
const T_RATE = 2332; // 2 Mbit/s SoftIn（−6 前挂，2338 落定）
const T_ARC = 2338; // 老短弧起（speed 42 帧/波）
const T_RIGHT = 2418; // 右侧现代设备 + 宽弧 + 胶片流
const T_MOVIE = 2420; // `a movie` 灰标
const T_CMP = 2424; // 带宽对比条

// ---- 几何 ----
const L = {cx: 350, lapY: 455, lapW: 260, yearY: 198, rateY: 594, barY: 570, arcY: 362}; // 1997 世界（左）
const R = {cx: 930, devY: 455, devW: 300, srcY: 358, barY: 570}; // today 世界（右）
const YEAR_W = textW(EX.year, 96, EM_ORB, 6);

export const SC11: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const exit = exitOp(N, TO, 5);
  const gk = glowOffK(N, TO, 3, 5);

  // ---- YearRoll：四位数字 2.5 帧一翻滚到落定（rnd 播种，Orbitron tabular） ----
  const rollPulse = emphasisPulse(N - 2265, {peak: 1.06, up: 8, hold: 3, down: 9});
  const yearDone = DIG_END[3] <= N;
  const yearOp = (yearDone ? 1 : 0.82) * fadeIn(N - T_ROLL, 4) * exit;
  const yearGlowK = (0.5 + 0.5 * (0.5 + 0.5 * Math.sin((N - 2264) * 0.05))) * gk * (yearDone ? 1 : 0.25); // 落定后低幅呼吸光

  // ---- 老笔记本（draw-on 14f + 屏内慢波形）----
  const lapDraw = clamp01((N - T_LAP) / 14);
  const lapOp = firstOp(N - T_LAP) * exit;
  const arcOp = fadeIn(N - T_ARC, 6) * exit;
  const ratePulse = emphasisPulse(N - 2338, {peak: 1.08, up: 8, hold: 3, down: 9});

  // ---- 右侧现代组（2418 起 21f 缩入；末动效落位 ~2439） ----
  const devS = 0.55 + 0.45 * clamp01((N - T_RIGHT) / 21);
  const devOp = fadeIn(N - T_RIGHT, 5) * exit;
  const arcROp = fadeIn(N - T_RIGHT, 6) * exit;
  const cmpOp = fadeIn(N - T_CMP, 6) * exit;
  const cmpGrow = easeInOutPow(2.2)(clamp01((N - T_CMP) / 12)); // 右带宽条伸展
  // 胶片格沿弧 r130 轨道自右上向左上缓流（90f/格，3 格相位差 1/3）
  const filmPos = (i: number): [number, number] => {
    const t = ((((N - T_RIGHT) / 90 + i / 3) % 1) + 1) % 1;
    const a = (-52 - 76 * t) * (Math.PI / 180);
    return [R.cx + Math.cos(a) * 130, R.srcY + Math.sin(a) * 130];
  };
  const filmK = (i: number) => Math.sin(Math.PI * ((((N - T_RIGHT) / 90 + i / 3) % 1) + 1) % 1);

  return (
    <CameraRig
      N={N}
      keys={[
        {f: F0, x: 640, y: 360, s: 1},
        {f: 2402, x: 640, y: 360, s: 1},
        {f: 2435, x: 800, y: 400, s: 1.12},
      ]}
    >
      <div style={{...abs(0, 0, 1280, 720), opacity: exit}}>
        {/* ================ 左：1997 世界 ================ */}
        {/* YearRoll（四位数字；滚动中 2.5 帧一翻，落定定格 + pulse） */}
        <div style={{...abs(L.cx - YEAR_W / 2 - 60, 0, YEAR_W + 120, 720), opacity: yearOp, transform: `scale(${rollPulse.toFixed(4)})`, transformOrigin: `${L.cx}px ${L.yearY}px`}}>
          <div style={{...abs(0, L.yearY - 62, YEAR_W + 120, 124), background: `radial-gradient(ellipse at 50% 50%, rgba(255,255,255,${(0.05 * yearGlowK).toFixed(3)}) 0%, rgba(255,255,255,0) 70%)`}} />
          {EX.year.split('').map((d, i) => {
            const settled = N >= DIG_END[i];
            const shown = settled ? d : String(Math.floor(rnd(Math.floor((N - T_ROLL) / 2.5), i, 7) * 10));
            return (
              <CText key={i} cx={L.cx - 95 + i * 63.5} cy={L.yearY} size={96} weight={700} family={FONT_ORB} color={settled ? WHITE : GREY_MID} letterSpacing={6} style={{fontVariantNumeric: 'tabular-nums'}}>
                {shown}
              </CText>
            );
          })}
        </div>

        {/* 老式厚笔记本（draw-on 14f，屏内慢波形随 N 微移） */}
        <div style={{...abs(0, 0, 1280, 720), opacity: lapOp}}>
          <OldLaptop cx={L.cx} cy={L.lapY} w={L.lapW} drawK={lapDraw} waveN={N} waveOp={clamp01((lapDraw - 0.4) * 2)} />
        </div>

        {/* 老短弧（ui.AirPulse：speed 42 帧/波——1997 的慢） */}
        <AirPulse cx={L.cx} cy={L.arcY} N={N - T_ARC} r={20} maxR={84} speed={42} arcs={2} color={WHITE} opacity={arcOp * 0.85} />

        {/* `2 Mbit/s` 橙（SoftIn 2332，2338 落定 + 拍同帧 pulse） */}
        <div style={{...abs(0, 0, 1280, 720), opacity: fadeIn(N - T_RATE, 6) * exit, transform: `scale(${ratePulse.toFixed(4)})`, transformOrigin: `${L.cx}px ${L.rateY}px`}}>
          <CText cx={L.cx} cy={L.rateY} size={40} weight={700} family={FONT_ORB} color={ORANGE} letterSpacing={1} shadow={`0 0 16px rgba(240,95,69,${(0.4 * gk).toFixed(2)})`}>
            {EX.rate}
          </CText>
        </div>

        {/* 左带宽条（窄，橙） */}
        <div style={{...abs(L.cx - 25, L.barY, 50, 9), borderRadius: 4, background: 'rgba(240,95,69,.28)', border: `1.5px solid ${ORANGE}`, opacity: cmpOp}} />

        {/* ================ 右：today 世界 ================ */}
        {/* 现代轻薄设备（ui.DeviceGlyph，21f 缩入） */}
        <div style={{...abs(0, 0, 1280, 720), opacity: devOp, transform: `scale(${devS.toFixed(4)})`, transformOrigin: `${R.cx}px ${R.devY}px`}}>
          <DeviceGlyph cx={R.cx} cy={R.devY} kind="laptop" w={R.devW} />
        </div>

        {/* 宽弧（ui.AirPulse：speed 9 帧/波 + maxR 175——与左侧慢窄弧的对比即"带宽对比"） */}
        <div style={{...abs(0, 0, 1280, 720), opacity: arcROp, filter: `drop-shadow(0 0 ${(5 * gk).toFixed(1)}px rgba(161,117,241,.9))`}}>
          <AirPulse cx={R.cx} cy={R.srcY} N={N - T_RIGHT} r={26} maxR={175} speed={9} arcs={3} color={WHITE} />
        </div>

        {/* 胶片格 ×3 沿弧缓流（"载着电影"） */}
        {[0, 1, 2].map((i) => {
          const [fx, fy] = filmPos(i);
          return <FilmCell key={i} cx={fx} cy={fy} w={36} h={28} opacity={(0.35 + 0.65 * filmK(i)) * devOp * gk} />;
        })}

        {/* `a movie` 灰标 */}
        <SoftIn N={N} f0={T_MOVIE}>
          <CText cx={1050} cy={268} size={24} weight={600} family={FONT_TECH} color={GREY}>{EX.aMovie}</CText>
        </SoftIn>

        {/* 右带宽条（宽，紫；2424 起伸展 12f——窄 vs 宽定格对比） */}
        <div style={{...abs(R.cx - 155, R.barY, 310 * cmpGrow, 9), borderRadius: 4, background: 'rgba(161,117,241,.3)', border: `1.5px solid ${PURPLE_LIGHT}`, opacity: cmpOp, boxShadow: `0 0 12px rgba(102,45,248,${(0.4 * gk * cmpGrow).toFixed(2)})`}} />

        {/* 左右带宽基准线（对比参照） */}
        <div style={{...abs(R.cx - 160, R.barY + 14, 320, 1.5), background: 'rgba(164,164,165,.35)', opacity: cmpOp * 0.7}} />
      </div>
    </CameraRig>
  );
};
