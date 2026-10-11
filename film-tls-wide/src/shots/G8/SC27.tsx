import React from 'react';
import {useCurrentFrame} from 'remotion';
import {clamp01, slideIn, GlitchIn, emphasisPulse, FONT_WIDE, FONT_MONO} from '../../common';
import {CameraRig, LightSweep} from '../../fx';
import {PacketIcon, EyeGlyph, NoiseField, CText, Svg, SoftIn, GREY, GREY_MID, WHITE, PURPLE_LIGHT, abs, fadeIn} from '../../ui';

/**
 * SC27 噪声与金句（5667–5928）。S37–S39（¶段末/片末）。★高光时刻·象征物+回扣（扫光②）。
 * 节拍：5675 三枚代表性信封的 `to:` 标签 bracket 圈出（"跟谁说话"）
 *       ｜5722 时间戳/大小标签圈出（`0.041 s` `150 B`，"何时/多少"）
 *       ｜5773（S38.c1）一枚信封从堆中飞出放大到中央（kf 20 帧）→ 封口掀开（8 帧）+ NoiseField 展开（20 帧）
 *       ｜5803（S38.c2）NoiseField 热态（紫描边+每 3 帧重排）+ EyeGlyph 睁大后眯眼（open 1→0.15）
 *       ｜5838（S39.c1）清场过渡 → 三轮紫光横扫（5834/5844/5854）+ 第一行大字 GlitchIn(rgbSplit 8) + emphasisPulse
 *       ｜5885（S39.c2−6 容差）第二行 GlitchIn(rgbSplit 6) + 紫硬投影脉冲 + 小信封飞越（20px/帧右行）｜+10 小灰字。
 * 持续：NoiseField 重排到压黑；小信封右行直到压黑；endingFade=6 速压。
 * 停留：末行落位 5913 → 压黑 5922，≥30 ✓。主角：两行大字 240px 行宽（白闪+紫描边/紫硬投影）。
 */
const F0 = 5667;
const TO = 5928;

// 三枚代表性信封（S37 who/when/how much）
const PROBE = [
  {x: 300, y: 300, label: 'to: shop.example', tag: 'who'},
  {x: 620, y: 360, label: '0.041 s', tag: 'when'},
  {x: 940, y: 300, label: '150 B', tag: 'how much'},
];

export const SC27: React.FC = () => {
  const N = useCurrentFrame() + F0;
  // 终镜不用 exitOp：endingFade 覆盖层负责压黑（DNS SC33 同款约定，文字保持到压黑）

  // S37 标签（5675/5722 bracket 圈出）
  const brk = (i: number) => clamp01((N - (5675 + i * 0)) / 10); // 三枚在 5675 起同帧圈出 who
  const brk2 = clamp01((N - 5722) / 10); // when/how much

  // 大信封（5773 起 20 帧飞出放大）→ 封口掀开（5793–5801）→ NoiseField 展开（5801–5821）
  const flyT = clamp01((N - 5773) / 20);
  const flap = clamp01((N - 5793) / 8);
  const noiseP = clamp01((N - 5801) / 20);
  const hot = N >= 5803;

  // EyeGlyph（5805 睁大 → 5813 眯眼）
  const eyeO = N < 5805 ? 0.06 : N < 5813 ? 0.06 + 0.94 * clamp01((N - 5805) / 8) : Math.max(0.15, 1 - 0.85 * clamp01((N - 5813) / 10));

  // 金句：清场过渡（5826–5838 收缩）→ 扫光（5834/5844/5854）→ 行 1（5838）→ 行 2（5891）→ 小灰字（5901）
  const collapse = clamp01((N - 5826) / 12);
  const L1 = N - 5838;
  const L2 = N - 5885; // 提前 6 帧（节拍容差内），给末拍稳定期留预算
  const sub = N - 5893;
  // 小信封飞越（5891 起 32px/帧）
  const fly2 = Math.max(0, N - 5891);

  return (
    <CameraRig N={N} keys={[{f: F0, x: 640, y: 360, s: 1}]}>
      <div style={abs(0, 0, 1280, 720)}>
        {/* S37：三枚代表性信封 + 标签 */}
        {PROBE.map((p, i) => {
          const on = i === 0 ? brk(i) : brk2;
          if (on <= 0.02) return null;
          const shrink = 1 - 0.55 * collapse; // 清场时收缩
          return (
            <div key={p.tag} style={{...abs(0, 0, 1280, 720), opacity: on * (1 - collapse * 0.9), transform: `scale(${shrink.toFixed(2)})`}}>
              <PacketIcon cx={p.x} cy={p.y} w={110} h={74} accent glow />
              <Svg bloom={false}>
                <rect x={p.x - 68} y={p.y - 52} width={136} height={104} fill="none" stroke={PURPLE_LIGHT} strokeWidth={2} strokeDasharray="6 5" rx={8} opacity={0.85} />
              </Svg>
              <div style={{position: 'absolute', left: p.x - 90, top: p.y + 58, width: 180, textAlign: 'center', fontFamily: FONT_MONO, fontSize: 21, color: WHITE}}>{p.label}</div>
              <div style={{position: 'absolute', left: p.x - 60, top: p.y - 96, width: 120, textAlign: 'center', fontFamily: 'inherit', fontSize: 20, color: GREY}}>{p.tag}</div>
            </div>
          );
        })}

        {/* S38：大信封（飞出放大 → 开封 → 噪声） */}
        {flyT > 0 ? (
          <div style={{...abs(0, 0, 1280, 720), opacity: Math.max(0, 1 - collapse)}}>
            <div style={{...abs(0, 0, 1280, 720), transform: `translate(${(640 - 620) * (1 - flyT)}px, ${(360 - 360) * (1 - flyT)}px) scale(${(0.6 + 0.4 * flyT).toFixed(3)})`}}>
              <PacketIcon cx={640} cy={340} w={360} h={240} glow accent={hot} />
              {/* 封口掀开 */}
              {flap > 0 ? (
                <div style={{position: 'absolute', left: 460, top: 236, width: 360, height: 60, borderBottom: `2.5px solid ${WHITE}`, borderLeft: `2.5px solid ${WHITE}`, transformOrigin: 'left top', transform: `rotate(${-55 * flap}deg)`, opacity: 0.9}} />
              ) : null}
              {/* 噪声场（展开 → 热态） */}
              {noiseP > 0 ? (
                <div style={{...abs(0, 0, 1280, 720), transform: `scale(${(0.3 + 0.95 * noiseP).toFixed(3)})`}}>
                  <NoiseField x={460} y={300} w={360} h={150} N={N} cols={22} rows={8} seed={hot ? 3 : 7} hot={hot} opacity={0.95} />
                </div>
              ) : null}
              {/* 眯眼（看不懂） */}
              {N >= 5805 ? <EyeGlyph cx={940} cy={300} w={64} open={eyeO} /> : null}
            </div>
          </div>
        ) : null}

        {/* 金句（扫光②：三轮紫光横扫） */}
        <LightSweep N={N} rounds={[5834, 5844, 5854]} alphas={[0.5, 0.45, 0.45]} dy={-40} />

        {/* 行 1：Everyone can see the envelope.（GlitchIn rgbSplit 8） */}
        {L1 >= 0 ? (
          <GlitchIn N={N} f0={5838} rgbSplit={8} slices={16}>
            <div style={{...abs(0, 0, 1280, 720)}}>
              <CText cx={640} cy={300} size={62} weight={900} color={WHITE} letterSpacing={0.5}
                style={{WebkitTextStroke: '2.5px rgba(161,117,241,0.95)', paintOrder: 'stroke fill', transform: `scale(${emphasisPulse(L1, {peak: 1.11})})`}}>
                Everyone can see the envelope.</CText>
            </div>
          </GlitchIn>
        ) : null}

        {/* 行 2：No one can read the letter.（SoftIn + 紫硬投影——DNS SC33 同款"双 glitch 减一"） */}
        {L2 >= 0 ? (
          <SoftIn N={N} f0={5885}>
            <div style={{...abs(0, 0, 1280, 720)}}>
              <CText cx={640} cy={420} size={78} weight={400} family={FONT_WIDE} color={WHITE} letterSpacing={1}
                style={{WebkitTextStroke: `4px ${PURPLE_LIGHT}`, paintOrder: 'stroke fill', textShadow: '0 0 22px rgba(161,117,241,.55), 0 0 5px rgba(161,117,241,.5)', transform: `scale(${emphasisPulse(L2, {peak: 1.08})})`}}>
                No one can read the letter.</CText>
            </div>
          </SoftIn>
        ) : null}

        {/* 小信封飞越（两行之间，20px/帧右行出画；持续动作直到压黑） */}
        {N >= 5885 ? (
          <div style={{...abs(0, 0, 1280, 720)}}>
            <PacketIcon cx={200 + 20 * fly2} cy={360} w={54} h={38} opacity={0.85} />
          </div>
        ) : null}

        {/* 小灰字 */}
        {sub >= 0 ? (
          <SoftIn N={N} f0={5901}>
            <CText cx={640} cy={540} size={24} weight={400} color={GREY}>TLS · the little lock</CText>
          </SoftIn>
        ) : null}
      </div>
    </CameraRig>
  );
};
