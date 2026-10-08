import React from 'react';
import {useCurrentFrame} from 'remotion';
import {GlitchIn, clamp01, emphasisPulse, FONT_HEAVY, FONT_WIDE, powOutRemain} from '../../common';
import {CText, PhotoCard, PURPLE, WHITE, exitOp, firstOp, glowOffK} from '../../ui';
import {CameraRig, Vignette} from '../../fx';
import type {CamKey} from '../../fx';
import {SplitRow} from './g3ui';

/**
 * SC13 ★2021 还是 zip · N 1877–1997（S13 1885–1995：1885「Google's app bundles from 2021?」/ 1957「Still zips underneath.」）——
 * **真实素材 + 论点镜（高光时刻 · 论点型）**。上段：PhotoCard（android_statues.jpg，白框暗调 grade）1885 自左滑入（Δ120，18 帧）
 *   + 内部紫扫描线每 40 帧扫过（持续动作）+ 下缘出处小字（24px 灰，随卡常驻 105 帧 ≥75、α 0.85 ≥50%）；
 * 下段：三枚 SplitChip（base.apk 紫亮 + HeroGlow 呼吸 / config.arm64_v8a.apk、config.en.apk 灰暗，1920/1926 灰删除线划过）
 *   + `still zips`（Audiowide 84px 白+紫描边）1957 GlitchIn（rgbSplit 6，本镜唯一 glitch）+ emphasisPulse + 紫光晕呼吸（持续）。
 * 运镜：33 帧 1→1.1（1913–1946，先入场停 14 帧；结束后距离场 44 帧、距 glitch 11 帧，不进末拍）。
 * 离场：末 8 帧归零（照片+大字，紫晕先灭 6 帧）；**SplitChip 行不归零**——SC14 开场以 scale(1.1) 同参数承接后淡出。
 * 停留：大字入场 1957 → 离场 1990（末 8 帧），33 帧 ✓（分镜表口径；满态 1978 后呼吸保持）。
 * 主角：`still zips` 84px（照片卡 244px 为载体主角）；光：base 紫光 + 大字紫晕。
 */
const F0 = 1877;
const TO = 1997;
const T_PHOTO = 1885; // PhotoCard 自左滑入（S13 首块 = 节拍）
const T_CHIPS = [1887, 1889, 1891]; // SplitChip 2 帧错峰 SoftIn（+2..+6，参照 SC04 VertHex +8 的非节拍元素口径）
const T_SCAN = 1905; // 落位后内部扫描线启动（周期 40 帧）
const SCAN_P = 40;
const T_CAM = 1913; // 运镜 33 帧 1→1.1
const T_STRIKE = [1920, 1926]; // 两枚灰暗 chip 的删除线（10 帧 wipe，运镜中对已落位元素的强调）
const T_TEXT = 1953; // `still zips` GlitchIn（S13 第二块 1957 的 −4 前挂：满态 1965，为段末稳定期留窗口）
const T_PULSE = T_TEXT + 12; // emphasisPulse
const CARD = {x: 128, y: 300, w: 464, h: 244}; // 1.1 推近后：右缘 615.2 / 顶 257 ≥ 240 ✓
const TEXT_C = {cx: 360, cy: 856};
const CAM: CamKey[] = [
  {f: F0, x: 360, y: 648, s: 1},
  {f: T_CAM, x: 360, y: 648, s: 1},
  {f: T_CAM + 33, x: 360, y: 648, s: 1.1},
];

export const SC13: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const exOp = exitOp(N, TO, 4); // 末 4 帧归零（镜头 1997 收口紧：S13 语速到 1995， EXIT 4 保稳定期）
  const gk = glowOffK(N, TO, 6, 8); // 大字紫晕先灭

  // —— 照片卡：自左滑入 Δ120（18 帧 powOutRemain）+ 首帧渐显 ——
  const pn = N - T_PHOTO;
  const photoOp = firstOp(pn, 6) * exOp;
  const photoDx = -120 * powOutRemain(pn, 18, 2.5);
  // 内部紫扫描线：落位后每 40 帧自顶扫到底（p→1 时跳回，PhotoCard 内部 p∈(0,1) 才渲染）
  const scanP = N >= T_SCAN ? ((N - T_SCAN) % SCAN_P) / SCAN_P : undefined;

  // —— 大字：glitch + 脉冲 + 紫晕呼吸 ——
  const pulse = emphasisPulse(N - T_PULSE, {peak: 1.11, up: 6, hold: 2, down: 7});
  const bconv = 1 - clamp01((N - 1981) / 6); // 1981 后呼吸幅度归零（稳定期；镜头收口紧，见 BUILD_NOTES）
  const breathe = 0.7 + 0.3 * bconv * Math.sin((2 * Math.PI * N) / 30);

  return (
    <div style={{position: 'absolute', inset: 0, fontFamily: FONT_HEAVY}}>
      <CameraRig N={N} keys={CAM}>
        {/* ——— 上段：真实照片卡（白框暗调）+ 出处小字 ——— */}
        <div style={{position: 'absolute', inset: 0, opacity: photoOp, transform: photoDx === 0 ? undefined : `translateX(${photoDx.toFixed(1)}px)`}}>
          <PhotoCard
            x={CARD.x}
            y={CARD.y}
            w={CARD.w}
            h={CARD.h}
            src="android_statues.jpg"
            source="photo: Atomic Taco · CC BY-SA 2.0 · Wikimedia Commons"
            scanP={scanP}
          />
        </div>

        {/* ——— 下段：三枚 SplitChip（不归零 → SC14 承接） ——— */}
        <SplitRow N={N} strike2={clamp01((N - T_STRIKE[0]) / 10)} strike3={clamp01((N - T_STRIKE[1]) / 10)} />

        {/* ——— 大字 still zips（本镜唯一 glitch） ——— */}
        {N >= T_TEXT ? (
          <div style={{position: 'absolute', inset: 0, transformOrigin: `${TEXT_C.cx}px ${TEXT_C.cy}px`, transform: pulse === 1 ? undefined : `scale(${pulse.toFixed(4)})`}}>
            <GlitchIn N={N} f0={T_TEXT} rgbSplit={6} seed={13} style={{opacity: exOp}}>
              <CText
                cx={TEXT_C.cx}
                cy={TEXT_C.cy}
                size={84}
                weight={400}
                family={FONT_WIDE}
                color={WHITE}
                letterSpacing={2}
                shadow={`0 0 ${Math.round(14 + 12 * breathe)}px rgba(161,117,241,${(0.55 * breathe * gk).toFixed(3)}), 0 0 6px rgba(255,255,255,.3)`}
                style={{WebkitTextStroke: `3px ${PURPLE}`, paintOrder: 'stroke fill'}}
              >
                still zips
              </CText>
            </GlitchIn>
          </div>
        ) : null}
      </CameraRig>

      {/* 屏幕空间暗角（推近同步淡入 18 帧） */}
      <Vignette k={0.2 * clamp01((N - T_CAM) / 18)} alpha={0.28} />
    </div>
  );
};
