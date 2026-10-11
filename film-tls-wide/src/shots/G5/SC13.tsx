import React from 'react';
import {useCurrentFrame} from 'remotion';
import {clamp01, slideIn, FONT_ORB} from '../../common';
import {CameraRig} from '../../fx';
import {PersonIcon, EyeGlyph, PacketIcon, CText, Svg, SoftIn, GREY, GREY_MID, WHITE, PURPLE_LIGHT, abs, fadeIn, exitOp} from '../../ui';

/**
 * SC13 陌生人之谜（2739–2868）。S19。
 * 节拍：2747 两个 PersonIcon 2 帧错峰缩放入场 + 信道线 draw-on（16 帧）
 *       ｜2811 3 只 EyeGlyph 依次睁大（每只 8 帧）+ 大 `?` 缩放入场（21 帧）+ 落位白闪 + 描边呼吸。
 * 持续：眼睛眨动循环（错峰 30 帧周期）+ 信道线上数据脉冲点往返（每 40 帧一趟）。
 * 运镜：1.0→1.05 慢推（2739–2825，运镜不进末拍）。主角：`?` 150px 紫描边+柔光。
 */
const F0 = 2719; // 章首：Ch3 卡 2674–2718 之后一帧起（分镜表 v2）
const TO = 2868;

const CH = {y: 400, x0: 310, x1: 970};
const EYES = [{x: 480}, {x: 640}, {x: 800}];

export const SC13: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const exit = exitOp(N, TO, 8);

  // 章界承接：SC12 的信封缩微在中央上方淡出（2739–2751）
  const handOp = N < 2739 ? 0 : Math.max(0, 1 - clamp01((N - 2739) / 12));

  // 双端 PersonIcon（2747 起，2 帧错峰，21 帧缩放入）
  const pIn = (i: number) => 0.45 + 0.55 * slideIn(N - (2747 + i * 2), 21);

  // 信道线 draw-on（2747 起 16 帧）
  const lineP = clamp01((N - 2747) / 16);

  // 眼睛（2811 起依次睁大 8 帧；之后错峰眨眼循环）
  const eyeOpen = (i: number) => {
    const t0 = 2811 + i * 4;
    if (N < t0) return 0.06;
    if (N < t0 + 8) return 0.06 + 0.94 * clamp01((N - t0) / 8);
    const ph = (N + i * 9) % 30;
    return ph < 4 ? Math.max(0.15, 1 - Math.sin((Math.PI * ph) / 4) * 0.85) : 1;
  };

  // 大 ? 缩放入场（2813 起 21 帧）+ 落位白闪（2830–2833）+ 描边呼吸
  const qn = N - 2813;
  const qS = 0.5 + 0.5 * slideIn(qn, 21);
  const flash = N >= 2830 && N < 2833 ? 1 : 0;
  const breathe = 1 + 0.08 * Math.sin((N / 30) * Math.PI * 2);

  // 数据脉冲点：沿信道线往返（每 40 帧一趟）
  const pulse = ((N - 2751) % 40) / 40;
  const px = pulse < 0.5 ? CH.x0 + (CH.x1 - CH.x0) * (pulse * 2) : CH.x1 - (CH.x1 - CH.x0) * ((pulse - 0.5) * 2);

  return (
    <CameraRig N={N} keys={[{f: F0, x: 640, y: 360, s: 1}, {f: 2825, x: 640, y: 360, s: 1.05}]}>
      <div style={{...abs(0, 0, 1280, 720), opacity: exit}}>
        {/* 章界承接：信封缩微淡出 */}
        <div style={{...abs(0, 0, 1280, 720), opacity: handOp}}>
          <PacketIcon cx={640} cy={180} w={96} h={66} opacity={handOp} />
        </div>

        {/* 信道线 + 脉冲点 */}
        <Svg bloom={false}>
          {lineP > 0 ? <line x1={CH.x0} y1={CH.y} x2={CH.x0 + (CH.x1 - CH.x0) * lineP} y2={CH.y} stroke={WHITE} strokeWidth={2.5} strokeLinecap="round" /> : null}
          {N > 2751 && lineP >= 1 ? <circle cx={px} cy={CH.y} r={4.5} fill={PURPLE_LIGHT} stroke="#fff" strokeWidth={1} /> : null}
        </Svg>

        {/* 双端陌生人 */}
        <div style={{...abs(0, 0, 1280, 720), opacity: pIn(0)}}><PersonIcon cx={240} cy={CH.y - 40} size={150} label="stranger A" /></div>
        <div style={{...abs(0, 0, 1280, 720), opacity: pIn(1)}}><PersonIcon cx={1040} cy={CH.y - 40} size={150} label="stranger B" /></div>

        {/* 3 只眼睛（人人都读得到） */}
        {EYES.map((e, i) => (
          <div key={e.x} style={{...abs(0, 0, 1280, 720), opacity: clamp01((N - 2809) / 4)}}>
            <EyeGlyph cx={e.x} cy={CH.y - 52} w={56} open={eyeOpen(i)} />
          </div>
        ))}
        <SoftIn N={N} f0={2811}>
          <CText cx={640} cy={CH.y + 58} size={24} weight={500} color={GREY}>a channel everyone can read</CText>
        </SoftIn>

        {/* 大 ?（主角：紫描边 + 柔光 + 呼吸） */}
        <div style={{...abs(0, 0, 1280, 720), opacity: qn >= 0 ? 1 : 0, transform: `scale(${(qS * breathe).toFixed(3)})`}}>
          <CText
            cx={640}
            cy={285}
            size={150}
            weight={700}
            family={FONT_ORB}
            color={flash ? '#fff' : WHITE}
            letterSpacing={6}
            style={{WebkitTextStroke: `3px ${PURPLE_LIGHT}`, paintOrder: 'stroke fill', textShadow: '0 0 26px rgba(161,117,241,.55), 0 0 60px rgba(102,45,248,.35)'}}
          >?</CText>
        </div>
      </div>
    </CameraRig>
  );
};
