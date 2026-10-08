import React from 'react';
import {useCurrentFrame} from 'remotion';
import {GlitchIn, clamp01, easeOutCubic, emphasisPulse, FONT_MONO, FONT_ORB, FONT_WIDE, kf, powOutRemain} from '../../common';
import {CText, PURPLE, PURPLE_LIGHT, WHITE, abs, exitOp, firstOp, glowOffK, scaleIn, softOp} from '../../ui';
import {CameraRig, GlowBlob, LightSweep, Vignette} from '../../fx';
import type {CamKey} from '../../fx';
import {LightningGlyph, VertHex} from './g1ui';

/**
 * SC04 ★1989·PK · N 425–787（S04 433–750，¶+gap15，长镜 363 帧）—— FILM HIGHLIGHT #1（扫光白名单①）。
 * 上段：`1989`（Orbitron 100px 白 + 紫硬投影，cy 380）433 计数落位（20 帧）+ 紫投影脉冲呼吸；
 *   一行 `Phil Katz · sued → ZIP`（等宽 24px，cy 490）502 打字机（2 帧/字）+ 红色起诉小闪电 3px draw-on 12 帧划过；
 *   567 小 `ZIP`（Audiowide 48px，cy 570）scaleIn + 589 白闪一次（"sued → 回答是 ZIP"）。
 * 下段：VertHex（145,640 430×320，5 行 × 8 字节）441 滑入 → 608 首两格 `50 4B` 高亮 wipe（12 帧）
 *   → 三轮紫光横扫 612/630/648（f0+4/+22/+40，各 16 帧；bars 定制竖版 y614/802/966）
 *   → 巨型 `PK`（Orbitron 200px 紫+4px 白描边，cy 830）620 GlitchIn（rgbSplit 8，本镜唯一 glitch）升起落位 632
 *   → 紫光晕大爆发（GlowBlob 160→300→185）后 30 帧收敛呼吸（持续）+ 634 emphasisPulse 1.13；
 *   其余字节 623 起变暗 35%；上段历史区 648–662 加速上出（把舞台让给 PK，也避免 1.18 推近时出顶安全区）。
 * c5（683 "are still the first two bytes"）：首两格 30 帧脉冲 + 运镜 683–716 推 1→1.18 锚点 PK (360,830)。
 * 停留：段末（¶+gap15）——PK 满态 608+24=632 → 离场 779（末 8 帧归零，紫晕先灭 6 帧），hold 147 帧
 *   （紫晕呼吸 + 字节脉冲贯穿段末停顿，高光满态收尾）。SC05（788 起新场景，本镜末帧全零）。
 */
const F0 = 425;
const TO = 787;
const T_YEAR = 433; // 1989 计数 20 帧
const T_HEX = 441; // VertHex 滑入
const T_LINE = 502; // 打字机 + 闪电 draw-on 12 帧
const T_ZIPS = 567; // 小 ZIP scaleIn（+21 落位 588，589 白闪 3 帧）
const T_HL = 608; // 50 4B 高亮 wipe 12 帧
const SWEEPS = [612, 630, 648]; // f0+4 / +22 / +40
const T_PK = 620; // PK GlitchIn；落位（满态）632 = 608+24
const T_LAND = 632; // 紫光晕爆发 + 白闪 3 帧
const T_PULSE = 634; // emphasisPulse 1.13
const T_UP_EXIT = 648; // 上段加速上出 14 帧
const T_CAM = 683; // 运镜 33 帧 1→1.18 推向 PK（= c5 起始）
const CAM: CamKey[] = [
  {f: 425, x: 360, y: 640, s: 1},
  {f: T_CAM, x: 360, y: 830, s: 1},
  {f: T_CAM + 33, x: 360, y: 830, s: 1.18},
];
/** 扫光条 [y, h, w, 帧偏移]：上条 614（字节窗上方）/ 中条 802（PK 区，穿窗后缘）/ 下条 966（窗下方） */
const SWEEP_BARS: Array<[number, number, number, number]> = [
  [614, 6, 430, 0],
  [802, 10, 540, 2],
  [966, 6, 380, 4],
];
const PK_C = {x: 360, y: 830};
const YEAR_LINE = 'Phil Katz · sued → ZIP';

export const SC04: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const exOp = exitOp(N, TO, 8);
  const gk = glowOffK(N, TO, 6, 8);

  // —— 上段：1989 计数 + 投影脉冲 ——
  const yrN = N - T_YEAR;
  const year = Math.round(1989 * (1 - Math.pow(1 - clamp01(yrN / 20), 2)));
  const yearPulse = emphasisPulse(N - (T_YEAR + 20), {peak: 1.06});
  const yBreathe = 0.75 + 0.25 * Math.sin((2 * Math.PI * (N - T_YEAR - 20)) / 30);

  // —— 打字机一行 + 闪电 ——
  const typed = N < T_LINE ? '' : YEAR_LINE.slice(0, Math.floor((N - T_LINE) / 2));
  const boltP = clamp01((N - T_LINE) / 12);

  // —— 小 ZIP（567 scaleIn，589 白闪一次）——
  const zsN = N - T_ZIPS;
  const zsS = 0.5 + 0.5 * scaleIn(zsN, 21);
  const zsFlash = N >= T_ZIPS + 22 && N < T_ZIPS + 25 ? 1 - (N - T_ZIPS - 22) * 0.33 : 0;
  const zsBreathe = 0.7 + 0.3 * Math.sin((2 * Math.PI * N) / 30);

  // —— 上段加速上出（648–662，让位 PK）——
  const upT = N - T_UP_EXIT;
  const upOp = upT < 0 ? 1 : Math.max(0, 1 - Math.pow(clamp01(upT / 14), 1.6));
  const upDy = upT < 0 ? 0 : -Math.pow(clamp01(upT / 14), 2) * 36;

  // —— 字节窗：滑入 + 高亮 wipe + 变暗 + 首两格脉冲（c5）——
  const hexOp = firstOp(N - T_HEX, 6) * exOp;
  const hexDy = 60 * powOutRemain(N - T_HEX, 18, 2.5);
  const hlP = clamp01((N - T_HL) / 12);
  const dimK = clamp01((N - (T_PK + 3)) / 18) * 0.35;
  const heroPulse = emphasisPulse(N - T_CAM, {peak: 1.08});

  // —— PK：升起 + 落位 + 白闪 + 脉冲 + 紫晕爆发→收敛呼吸 ——
  const pkY = kf(N, [[T_PK, 890], [T_LAND, PK_C.y]], easeOutCubic);
  const pkS = kf(N, [[T_PK, 0.72], [T_LAND, 1]], easeOutCubic);
  const pkPulse = emphasisPulse(N - T_PULSE, {peak: 1.13});
  const pkFlash = N >= T_LAND && N < T_LAND + 3 ? 1 - (N - T_LAND) * 0.33 : 0;
  const burstT = N - T_LAND;
  const blobR = kf(N, [[T_LAND, 160], [T_LAND + 9, 300], [T_LAND + 39, 185]]) + (burstT > 39 ? 12 * Math.sin((2 * Math.PI * N) / 30) : 0);
  const blobA = kf(N, [[T_LAND, 0.16], [T_LAND + 9, 0.5], [T_LAND + 39, 0.3]]) + (burstT > 39 ? 0.05 * Math.sin((2 * Math.PI * N) / 30) : 0);
  const pkBlur = 30 + 46 * powOutRemain(Math.max(0, burstT), 39, 1.6) + 5 * Math.sin((2 * Math.PI * N) / 30) * (burstT > 39 ? 1 : 0.3);

  return (
    <div style={{position: 'absolute', inset: 0, opacity: exOp}}>
      {/* 三轮紫光横扫（扫光白名单①；屏幕空间，不随运镜） */}
      <LightSweep N={N} rounds={SWEEPS} alphas={[0.6, 0.55, 0.55]} bars={SWEEP_BARS} />

      <CameraRig N={N} keys={CAM}>
        {/* ——— 上段：1989 + 一行字 + 闪电 + 小 ZIP（648 起加速上出让位） ——— */}
        <div style={{position: 'absolute', inset: 0, opacity: upOp, transform: upDy === 0 ? undefined : `translateY(${upDy.toFixed(1)}px)`}}>
          <div
            style={{
              position: 'absolute',
              inset: 0,
              transformOrigin: '360px 380px',
              transform: yearPulse === 1 ? undefined : `scale(${yearPulse.toFixed(4)})`,
            }}
          >
            <CText
              cx={360}
              cy={380}
              size={100}
              weight={700}
              family={FONT_ORB}
              color={WHITE}
              letterSpacing={2}
              shadow={`6px 6px 0 ${PURPLE}, 0 0 ${Math.round(20 + 10 * yBreathe)}px rgba(102,45,248,${((0.38 + 0.16 * yBreathe) * gk).toFixed(3)})`}
              style={{fontVariantNumeric: 'tabular-nums'}}
            >
              {N < T_YEAR ? '' : year}
            </CText>
          </div>
          {typed ? <CText cx={360} cy={490} size={24} weight={600} family={FONT_MONO} color={WHITE} letterSpacing={1}>{typed}</CText> : null}
          <LightningGlyph x={210} y={494} w={300} p={boltP} />
          {zsN >= 0 ? (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                transformOrigin: '360px 570px',
                transform: `scale(${zsS.toFixed(4)})`,
                opacity: softOp(zsN, 8),
                filter: zsFlash > 0 ? `brightness(${(1 + 0.6 * zsFlash).toFixed(2)})` : undefined,
              }}
            >
              <CText
                cx={360}
                cy={570}
                size={48}
                weight={400}
                family={FONT_WIDE}
                color={WHITE}
                letterSpacing={3}
                shadow={`0 0 ${Math.round(10 + 8 * zsBreathe)}px rgba(161,117,241,${(0.5 * zsBreathe * gk).toFixed(3)})`}
                style={{WebkitTextStroke: `2px ${PURPLE}`, paintOrder: 'stroke fill'}}
              >
                ZIP
              </CText>
            </div>
          ) : null}
        </div>

        {/* ——— 下段：字节窗（主角载体） ——— */}
        <div style={{position: 'absolute', inset: 0, opacity: hexOp, transform: hexDy === 0 ? undefined : `translateY(${hexDy.toFixed(1)}px)`}}>
          <VertHex hlP={hlP} dimK={dimK} heroPulse={heroPulse} />
        </div>

        {/* 紫光晕（PK 身后：爆发 → 30 帧收敛 → 呼吸） */}
        <GlowBlob cx={PK_C.x} cy={PK_C.y} r={Math.max(10, blobR)} N={N} k={gk} alpha={Math.max(0, blobA)} />

        {/* 巨型 PK（本镜唯一 glitch：rgbSplit 8；升起压在字节上；白闪落定 + 脉冲） */}
        {N >= T_PK ? (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              transformOrigin: `${PK_C.x}px ${PK_C.y}px`,
              transform: `scale(${(pkS * pkPulse).toFixed(4)})`,
            }}
          >
            <GlitchIn N={N} f0={T_PK} rgbSplit={8} seed={15}>
              <CText
                cx={PK_C.x}
                cy={pkY}
                size={200}
                weight={700}
                family={FONT_ORB}
                color={PURPLE_LIGHT}
                letterSpacing={8}
                shadow={`0 0 ${pkBlur.toFixed(1)}px 10px rgba(102,45,248,${(0.45 * gk).toFixed(3)})`}
                style={{WebkitTextStroke: `4px ${WHITE}`, paintOrder: 'stroke fill', fontVariantNumeric: 'tabular-nums', filter: pkFlash > 0 ? `brightness(${(1 + 0.6 * pkFlash).toFixed(2)})` : undefined}}
              >
                PK
              </CText>
            </GlitchIn>
          </div>
        ) : null}
      </CameraRig>

      {/* 屏幕空间暗角（推近同步淡入 18 帧） */}
      <Vignette k={0.26 * clamp01((N - T_CAM) / 18)} alpha={0.28} />
    </div>
  );
};
