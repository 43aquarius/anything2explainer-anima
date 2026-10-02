import React from 'react';
import {useCurrentFrame} from 'remotion';
import {clamp01, stepKf, FONT_MONO} from '../../common';
import {
  CText, Pill, SoftIn, PuzzlePhoto, WaveformStrip, abs, exitOp, glowOffK, exitAccel, firstOp, GREY, RED_DEEP,
} from '../../ui';

/**
 * SC09 致命与无所谓 · N 1738–1869（S13 1746–1801「photo → fatal」+ S14 1812–1867「voice → fine」，¶ 段末）
 * 版式：左右对照。左半 (340,380) 拼图照片卡 300×220（6 块山形照片，第 5 块位置黑缺口 + 红 missing 角标），
 *       下方灰字 `fatal`；右半 (940,380) 语音波形 x 780–1100（白色竖线序列，中段 3 根缺失成豁口），
 *       豁口下灰 `skip` 小标，下方灰字 `fine, actually`。
 * 节拍：1740 拼图块 2 帧错峰归位（5 块就位，stepKf filled 1→6）→ 1752 缺口红角标 pulse 一次 + 卡边框红光点亮 + `missing` 标；
 *       1754 `fatal` SoftIn；1812 波形自左 wipe（16 帧到豁口）→ 豁口处停 8 帧 → 右侧继续展开（16 帧，"跳过去继续"）；
 *       1838 豁口 `skip` 标 SoftIn；1844 `fine, actually` SoftIn；波形全程 ±15% 律动（持续动作，breatheP 40 帧周期）。
 * 离场：末 8 帧（1862–1869）归零（红光先灭）。停留：波形律动持续到离场 ✓。
 * 主角：拼图卡 220px + 波形组（左右对照双主角并列，各 220/120px+豁口组）；光 = 拼图缺口红光（左）+ 波形白微光（BLOOM）。
 */
const F0 = 1738;
const TO = 1889;
const T_PUZ = 1740, T_TAG = 1750, T_FATAL = 1754;
const T_WAVE = 1812, T_SKIP = 1838, T_FINE = 1844;

/** 波形 revealP：0 → 11/26（16 帧）→ 停 8 帧 → 1（16 帧） */
const waveP = (N: number) => {
  const t = N - T_WAVE;
  if (t < 0) return 0;
  if (t < 16) return (11 / 26) * (t / 16);
  if (t < 24) return 11 / 26;
  if (t < 40) return 11 / 26 + (15 / 26) * ((t - 24) / 16);
  return 1;
};

export const SC09: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const exN = N - (TO - 8);
  const exOp = exitOp(N, TO, 8);
  const exDy = exitAccel(exN, 0.05);
  const gk = glowOffK(N, TO, 6, 8);

  // 拼图：5 块 2 帧错峰归位（filled 1→4→6，缺第 5 块 idx4）
  const filled = stepKf(N, [[T_PUZ, 1], [T_PUZ + 2, 2], [T_PUZ + 4, 3], [T_PUZ + 6, 4], [T_PUZ + 8, 6]]);
  // 缺口 pulse 一次（16 帧）
  const tagT = N - T_TAG;
  const missPulse = tagT < 0 ? 0 : Math.sin(Math.PI * clamp01(tagT / 16));
  // 卡边框红光：T_TAG 点亮（8 帧），离场前先灭
  const redK = clamp01((N - T_TAG) / 8) * gk;
  // 波形律动：40 帧周期 ±15%
  const breathe = 0.5 - 0.5 * Math.cos((2 * Math.PI * N) / 40);

  return (
    <div style={{position: 'absolute', inset: 0, opacity: exOp, transform: exDy ? `translateY(${exDy.toFixed(1)}px)` : undefined}}>
      {/* 左半：拼图照片卡（缺第 5 块 = 致命） */}
      <div style={{position: 'absolute', inset: 0, opacity: firstOp(N - T_PUZ)}}>
        {/* 边框红光（缺口警示） */}
        <div style={{...abs(184, 264, 312, 232), borderRadius: 10, boxShadow: `0 0 26px 8px rgba(236,8,31,${(0.3 * redK).toFixed(3)})`}} />
        <PuzzlePhoto x={190} y={270} w={300} h={220} cols={3} rows={2} filled={filled} missingIdx={4} missPulse={missPulse} />
        {/* 红 missing 角标（pulse 一次后常驻） */}
        <SoftIn N={N} f0={T_TAG}>
          <div style={{...abs(300, 368, 104, 32), transform: `rotate(-6deg) scale(${(1 + 0.15 * missPulse).toFixed(3)})`, transformOrigin: '50% 50%'}}>
            <Pill x={0} y={0} w={104} h={32} fill="#000" stroke={RED_DEEP} sw={2} text="missing" fontSize={22} weight={700} family={FONT_MONO} color={RED_DEEP} textDy={0} />
          </div>
        </SoftIn>
      </div>
      <SoftIn N={N} f0={T_FATAL}>
        <CText cx={340} cy={530} size={26} weight={600} family={FONT_MONO} color={GREY}>fatal</CText>
      </SoftIn>

      {/* 右半：语音波形（中段豁口，跳过去继续 = 无所谓） */}
      <WaveformStrip x={780} y={320} w={320} h={120} bars={26} gapFrom={11} gapTo={13} revealP={waveP(N)} breatheP={breathe} color="#FFFFFF" />
      <SoftIn N={N} f0={T_SKIP}>
        <CText cx={934} cy={458} size={22} weight={600} family={FONT_MONO} color={GREY}>skip</CText>
      </SoftIn>
      <SoftIn N={N} f0={T_FINE}>
        <CText cx={940} cy={530} size={26} weight={600} family={FONT_MONO} color={GREY}>fine, actually</CText>
      </SoftIn>
    </div>
  );
};
