import React from 'react';
import {useCurrentFrame} from 'remotion';
import {clamp01, powOutRemain, GlitchIn, emphasisPulse, kf, easeInOutPow} from '../../common';
import {CameraRig} from '../../fx';
import {CText, SoftIn, Svg, DocIcon, DBIcon, GREY, GREY_MID, GREY_LIGHT, WHITE, CORAL, PURPLE_LIGHT, abs, fadeIn, exitOp, glowOffK, mixHex} from '../../ui';

/**
 * SC04 矛盾（790–925，¶ 章末，停 925 = C2−54；章节卡 926–970 由 G0 接管）。S08：错的时间不是小麻烦，是矛盾。
 * ⚠ 尾部时序（S08 末块仅 32f ⚠，timeline.md 补法=前挂）：`contradiction` 前挂到上一块（826 块）内 862 入场，
 *    GlitchIn 12f + emphasisPulse 14f + 橙光晕一拍，全部在 876 收束 → 安静窗 876→917=41f（≥30 ✓）。
 * 节拍：798（=S08 c1）SC03 双联图缩微居左（fade 8f + 1.26→1.0 收缩 + 左移 70px，16f）+ `nuisance` SoftIn
 *       ｜826 划除线 draw-on（12f）+ `nuisance` 降饱和
 *       ｜862（前挂）`contradiction` GlitchIn（rgbSplit 6，白名单）+ emphasisPulse（5+3+6=14f）+ 橙光晕一拍（876 收）
 * 运镜：33f 1→1.08 推向大字区（816–849，末 key ≤ TO−50 ✓；让开 862 的 GlitchIn，不进末拍）。
 * 主角：对比大字组（nuisance 56px 灰 / contradiction 64px 白+紫描边+橙光晕）。零扫光。
 */
const F0 = 790;
const TO = 925;

const MINI = {ox: 372, oy: 302}; // 缩微双联图 transformOrigin
const NUIS = {cx: 880, cy: 252, size: 56};
const CONTRA = {cx: 880, cy: 402, size: 64};

export const SC04: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const exit = exitOp(N, TO, 5);
  const gOff = glowOffK(N, TO, 3, 5);

  // ---- 缩微双联图（798 承接 SC03：收缩 + 左移落位）----
  const miniOp = fadeIn(N - 798, 8);
  const miniS = kf(N, [[798, 1.26], [814, 1]], easeInOutPow(2.5));
  const miniDx = 70 * powOutRemain(N - 798, 16, 2.5);

  // ---- nuisance（798 SoftIn；826 划除 + 降饱和）----
  const strikeP = clamp01((N - 826) / 12);
  const desat = kf(N, [[826, 0], [834, 1]]);

  // ---- contradiction（862 前挂：GlitchIn + pulse ≤14f + 橙光晕一拍 → 876 收束）----
  const pulse = emphasisPulse(N - 862, {peak: 1.07, up: 5, hold: 3, down: 6});
  const glowK = kf(N, [[862, 0], [868, 1], [876, 0.35]]) * gOff;

  return (
    <CameraRig N={N} keys={[{f: F0, x: 640, y: 360, s: 1}, {f: 816, x: 640, y: 360, s: 1}, {f: 849, x: 700, y: 335, s: 1.08}]}>
      <div style={abs(0, 0, 1280, 720)}>
        <div style={{...abs(0, 0, 1280, 720), opacity: exit}}>
          {/* ---- SC03 双联图缩微（左：证书+时间轴 / 右：DB+记录条）---- */}
          <div style={{...abs(0, 0, 1280, 720), opacity: miniOp, transform: `translateX(${miniDx.toFixed(1)}px) scale(${miniS.toFixed(4)})`, transformOrigin: `${MINI.ox}px ${MINI.oy}px`}}>
            <DocIcon x={192} y={195} w={92} h={115} lines={4} />
            <Svg bloom={false}>
              <g stroke={GREY_MID} fill="none">
                <circle cx={255} cy={288} r={13} strokeWidth={2} />
                <circle cx={255} cy={288} r={8} strokeWidth={1.2} />
              </g>
            </Svg>
            {/* 迷你时间轴（含有效窗） */}
            <Svg bloom={false}>
              <line x1={180} y1={348} x2={385} y2={348} stroke={GREY_MID} strokeWidth={2} />
              <line x1={230} y1={344} x2={230} y2={352} stroke={WHITE} strokeWidth={2.4} />
              <line x1={345} y1={344} x2={345} y2={352} stroke={WHITE} strokeWidth={2.4} />
            </Svg>
            <div style={{...abs(232, 345, 111, 6), borderRadius: 3, background: 'rgba(102,48,248,.5)'}} />
            <DBIcon cx={487} cy={240} w={72} h={78} />
            {[340, 366, 392].map((y, i) => (
              <div key={i} style={{...abs(415, y, 145, 18), boxSizing: 'border-box', background: '#000', border: `1.6px solid ${i === 1 ? GREY_LIGHT : GREY_MID}`, borderRadius: 4}} />
            ))}
          </div>

          {/* ---- 右：对比大字 ---- */}
          <SoftIn N={N} f0={798}>
            <CText cx={NUIS.cx} cy={NUIS.cy} size={NUIS.size} weight={900} color={mixHex(GREY, GREY_MID, desat)} opacity={1 - 0.25 * desat}>nuisance</CText>
          </SoftIn>
          {strikeP > 0 ? (
            <div style={{...abs(0, 0, 1280, 720), clipPath: `inset(0 ${(100 - 100 * strikeP).toFixed(1)}% 0 0)`}}>
              <Svg bloom={false}>
                <line x1={740} y1={NUIS.cy} x2={1020} y2={NUIS.cy} stroke={CORAL} strokeWidth={5} strokeLinecap="round" />
              </Svg>
            </div>
          ) : null}

          <div style={{...abs(0, 0, 1280, 720), transform: `scale(${pulse.toFixed(4)})`, transformOrigin: `${CONTRA.cx}px ${CONTRA.cy}px`}}>
            <GlitchIn N={N} f0={862} rgbSplit={6} seed={44}>
              <CText
                cx={CONTRA.cx}
                cy={CONTRA.cy}
                size={CONTRA.size}
                weight={900}
                color={WHITE}
                style={{WebkitTextStroke: `2px ${PURPLE_LIGHT}`, textShadow: `0 0 ${(10 + 30 * glowK).toFixed(0)}px rgba(240,95,65,${(0.25 + 0.45 * glowK).toFixed(2)})`}}
              >
                contradiction
              </CText>
            </GlitchIn>
          </div>
        </div>
      </div>
    </CameraRig>
  );
};
