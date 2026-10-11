import React from 'react';
import {useCurrentFrame} from 'remotion';
import {clamp01, slideIn, GlitchIn} from '../../common';
import {CameraRig} from '../../fx';
import {KeyIcon, CText, Svg, SoftIn, GREY, WHITE, PURPLE_LIGHT, abs, exitOp} from '../../ui';

/**
 * SC17 前向保密（3460–3594）。S24。
 * 节拍：3468 聚光梯形自上展开（14 帧）+ 两侧小 KeyIcon 缩入 + `a property of TLS` SoftIn
 *       ｜3516 `worth saying out loud` 灰字 SoftIn ｜3562 `forward` GlitchIn(rgbSplit 6) + `secrecy` SoftIn(+8) + emphasisPulse。
 * 持续：聚光轻微呼吸（±8%，30 帧周期）。运镜：1.0→1.05 慢推（3460–3556，运镜不进末拍）。
 * 主角：两行大字 240px 行宽（Noto 900 96px 白+紫描边）+ 聚光白。
 */
const F0 = 3460;
const TO = 3594;

export const SC17: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const exit = exitOp(N, TO, 8);

  // 聚光梯形（3468 展开 14 帧；之后 ±8% 呼吸）
  const spotP = clamp01((N - 3464) / 10);
  const breathe = 1 + 0.08 * Math.sin((N / 30) * Math.PI * 2);
  const spotW = 520 * spotP * breathe;
  const spotH = 620 * spotP;

  // 两侧小钥匙（3474 起 21 帧缩入）
  const keyIn = slideIn(N - 3474, 21);

  // 大字：forward（c2+4=3520 GlitchIn，"worth saying out loud" 时预告主角）+ secrecy（c3=3562 SoftIn）
  const fN = N - 3520;
  const sN = N - 3562;

  return (
    <CameraRig N={N} keys={[{f: F0, x: 640, y: 360, s: 1}, {f: 3556, x: 640, y: 360, s: 1.05}]}>
      <div style={{...abs(0, 0, 1280, 720), opacity: exit}}>
        {/* 聚光梯形（CSS clip-path 自上而下） */}
        {spotP > 0 ? (
          <div style={{...abs(640 - spotW / 2, 40, spotW, spotH), background: 'linear-gradient(to bottom, rgba(255,255,255,0.09), rgba(255,255,255,0.015))',
            clipPath: 'polygon(26% 0, 74% 0, 100% 100%, 0 100%)'}} />
        ) : null}

        {/* 两侧小钥匙 */}
        <div style={{...abs(0, 0, 1280, 720), opacity: keyIn}}>
          <KeyIcon cx={195} cy={395} size={320} opacity={0.95} glow />
          <KeyIcon cx={1085} cy={395} size={320} opacity={0.95} glow />
        </div>

        {/* 顶部小字 */}
        <SoftIn N={N} f0={3468}>
          <CText cx={640} cy={170} size={26} weight={500} color={GREY}>a property of TLS</CText>
        </SoftIn>
        <SoftIn N={N} f0={3516}>
          <CText cx={640} cy={214} size={24} weight={400} color={GREY} italic>worth saying out loud</CText>
        </SoftIn>

        {/* 两行大字（主角） */}
        {fN >= 0 ? (
          <GlitchIn N={N} f0={3520} rgbSplit={6}>
            <div style={{...abs(0, 0, 1280, 720)}}>
              <CText cx={640} cy={322} size={120} weight={900} color={WHITE} letterSpacing={2}
                style={{WebkitTextStroke: '2.5px rgba(161,117,241,0.95)', paintOrder: 'stroke fill'}}>forward</CText>
            </div>
          </GlitchIn>
        ) : null}
        {sN >= 0 ? (
          <SoftIn N={N} f0={3570}>
            <div style={{...abs(0, 0, 1280, 720)}}>
              <CText cx={640} cy={452} size={120} weight={900} color={WHITE} letterSpacing={2}
                style={{WebkitTextStroke: '2.5px rgba(161,117,241,0.95)', paintOrder: 'stroke fill', textShadow: '0 0 24px rgba(161,117,241,.4)'}}>secrecy</CText>
            </div>
          </SoftIn>
        ) : null}
        <Svg bloom={false}>
          {sN >= 8 ? <line x1={440} y1={390} x2={440 + 400 * clamp01((sN - 8) / 12)} y2={390} stroke={PURPLE_LIGHT} strokeWidth={2.5} strokeLinecap="round" /> : null}
        </Svg>
      </div>
    </CameraRig>
  );
};
