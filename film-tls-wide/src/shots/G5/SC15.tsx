import React from 'react';
import {useCurrentFrame} from 'remotion';
import {clamp01, slideIn, powOutRemain, emphasisPulse, GlitchIn, FONT_ORB} from '../../common';
import {CameraRig} from '../../fx';
import {PaintPot, EyeGlyph, CText, Svg, SoftIn, Cross, GREY, GREY_MID, WHITE, PURPLE_LIGHT, abs, fadeIn, exitOp, glowOffK} from '../../ui';

/**
 * SC15 颜料混合（3036–3250）。S21–S22。★高光时刻·论点型（≥90 帧编排，GlitchIn 变体，无扫光）。
 * 节拍：3044 三桶 2 帧错峰缩放入场（公共黄 + 私有红/青）
 *       ｜3106 倒色：红倒入公共 → 左混合桶（橙）；青倒入公共 → 右混合桶（绿）
 *       ｜3149 两混合桶沿弧线互赠（draw-on 18 帧）+ 双眼睁大 + `Diffie-Hellman` 顶部 GlitchIn(rgbSplit 6)
 *       ｜3210 终局：两终桶同步变深褐 + `=` 弹出 + 白闪 + 反向箭头被红 Cross 盖住 + `cannot un-mix`。
 * 持续：液面微波动；混合色流沿线流动。
 * 运镜：33 帧 1→1.18 推向双终桶（3180–3212，运镜不进末拍）。主角：颜料台 380px（终桶组 + `=` 紫光）。
 */
const F0 = 3036;
const TO = 3250;

const Y_PUB = '#F2C94C', RED = '#E0455A', CYAN = '#37B0C4', ORANGE = '#E8823C', GREEN = '#6FB54A', BROWN = '#8A6B3D';
const PUB = {cx: 640, cy: 470};
const SA = {cx: 300, cy: 400};   // 私有红
const SB = {cx: 980, cy: 400};   // 私有青
const MA = {cx: 300, cy: 560};   // 左混合桶（橙）
const MB = {cx: 980, cy: 560};   // 右混合桶（绿）

export const SC15: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const exit = exitOp(N, TO, 8);
  const glowK = glowOffK(N, TO);

  // 三桶入场（3044 起 2 帧错峰，21 帧缩放）
  const potIn = (i: number) => slideIn(N - (3044 + i * 2), 21);

  // 倒色阶段（3106 起）：红/青先后倾倒（倾斜 14°）+ 色流线
  const pourA = clamp01((N - 3106) / 20); // 红 → 公共（3106–3126）
  const pourB = clamp01((N - 3120) / 20); // 青 → 公共（3120–3140）
  const tilt = (p: number) => 14 * p;

  // 混合桶出现（倾倒完成后从公共桶分流到两侧）
  const mixA = slideIn(N - 3130, 18); // 左橙桶
  const mixB = slideIn(N - 3144, 18); // 右绿桶

  // 互赠弧线（3149 起 18 帧，2 帧错峰）+ 色流
  const arcA = clamp01((N - 3149) / 18);
  const arcB = clamp01((N - 3151) / 18);
  // 色流沿线流动（持续）
  const flowPh = ((N - 3167) % 30) / 30;

  // 终局（3210 起）：两桶同步变深褐（12 帧）+ = 弹出 + 白闪 + 反向箭头被 Cross
  const fin = clamp01((N - 3210) / 12);
  const eqN = N - 3216;
  const eqS = 0.6 + 0.4 * slideIn(eqN, 14);
  const flash = N >= 3224 && N < 3227 ? 1 : 0;
  const revArrow = clamp01((N - 3230) / 12); // 反向箭头试探
  const crossP = clamp01((N - 3236) / 10);

  // 液面波动（持续，内联到 fillK）
  const wob = 3 * Math.sin((N / 26) * Math.PI * 2); // eslint-disable-line @typescript-eslint/no-unused-vars

  // 颜色插值 hex
  const mixHex = (a: string, b: string, k: number) => {
    const pa = [parseInt(a.slice(1, 3), 16), parseInt(a.slice(3, 5), 16), parseInt(a.slice(5, 7), 16)];
    const pb = [parseInt(b.slice(1, 3), 16), parseInt(b.slice(3, 5), 16), parseInt(b.slice(5, 7), 16)];
    return '#' + pa.map((v, i) => Math.round(v + (pb[i] - v) * k).toString(16).padStart(2, '0')).join('');
  };
  const finA = mixHex(ORANGE, BROWN, fin);
  const finB = mixHex(GREEN, BROWN, fin);

  return (
    <CameraRig N={N} keys={[{f: F0, x: 640, y: 360, s: 1}, {f: 3180, x: 640, y: 430, s: 1}, {f: 3212, x: 640, y: 440, s: 1.18}]}>
      <div style={{...abs(0, 0, 1280, 720), opacity: exit}}>
        {/* 公共桶（中央，主角组） */}
        <div style={{...abs(0, 0, 1280, 720), opacity: potIn(0)}}>
          <PaintPot cx={PUB.cx} cy={PUB.cy} w={180} h={150} fill={Y_PUB} fillK={0.85} label="public" />
        </div>
        {/* 私有桶（带倾倒倾斜） */}
        <div style={{...abs(0, 0, 1280, 720), opacity: potIn(1), transform: `rotate(${tilt(pourA).toFixed(1)}deg)`, transformOrigin: `${SA.cx + 40}px ${SA.cy + 60}px`}}>
          <PaintPot cx={SA.cx} cy={SA.cy} w={140} h={116} fill={RED} fillK={0.7} label="secret A" />
        </div>
        <div style={{...abs(0, 0, 1280, 720), opacity: potIn(2), transform: `rotate(${-tilt(pourB).toFixed(1)}deg)`, transformOrigin: `${SB.cx - 40}px ${SB.cy + 60}px`}}>
          <PaintPot cx={SB.cx} cy={SB.cy} w={140} h={116} fill={CYAN} fillK={0.7} label="secret B" />
        </div>

        {/* 色流线（倾倒时） */}
        <Svg bloom={false}>
          {pourA > 0 && pourA < 1 ? <line x1={SA.cx + 60} y1={SA.cy + 40} x2={PUB.cx - 30} y2={PUB.cy - 70} stroke={RED} strokeWidth={4} strokeLinecap="round" opacity={0.85} /> : null}
          {pourB > 0 && pourB < 1 ? <line x1={SB.cx - 60} y1={SB.cy + 40} x2={PUB.cx + 30} y2={PUB.cy - 70} stroke={CYAN} strokeWidth={4} strokeLinecap="round" opacity={0.85} /> : null}
        </Svg>

        {/* 混合桶（左右，橙/绿 → 终局同步变深褐；液面微波动 ±0.03） */}
        <div style={{...abs(0, 0, 1280, 720), opacity: mixA}}>
          <PaintPot cx={MA.cx} cy={MA.cy} w={160} h={132} fill={finA} fillK={0.8 + 0.03 * Math.sin((N / 26) * Math.PI * 2)} />
        </div>
        <div style={{...abs(0, 0, 1280, 720), opacity: mixB}}>
          <PaintPot cx={MB.cx} cy={MB.cy} w={160} h={132} fill={finB} fillK={0.8 + 0.03 * Math.cos((N / 26) * Math.PI * 2)} />
        </div>

        {/* 互赠弧线 + 流动色点（持续动作） */}
        <Svg bloom={false}>
          {arcA > 0 ? <path d={`M${MA.cx + 80} ${MA.cy - 40} Q${640} ${MA.cy - 160} ${MB.cx - 80} ${MB.cy - 40}`} fill="none" stroke={WHITE} strokeWidth={2.5} strokeLinecap="round" opacity={0.75} strokeDasharray={`${arcA * 560} 560`} /> : null}
          {arcB > 0 ? <path d={`M${MB.cx - 80} ${MB.cy - 40} Q${640} ${MB.cy - 160} ${MA.cx + 80} ${MA.cy - 40}`} fill="none" stroke={WHITE} strokeWidth={2.5} strokeLinecap="round" opacity={0.75} strokeDasharray={`${arcB * 560} 560`} /> : null}
        </Svg>
        {arcA >= 1 && arcB >= 1 && fin < 1 ? (
          <Svg bloom>
            <circle cx={640 + 260 * (flowPh - 0.5)} cy={MB.cy - 100 - 60 * (1 - Math.abs(flowPh - 0.5) * 2)} r={5} fill={ORANGE} stroke="#fff" strokeWidth={1} />
            <circle cx={640 - 260 * (flowPh - 0.5)} cy={MA.cy - 100 - 60 * (1 - Math.abs(flowPh - 0.5) * 2)} r={5} fill={GREEN} stroke="#fff" strokeWidth={1} />
          </Svg>
        ) : null}

        {/* 双眼（旁观者全程可见） */}
        <div style={{...abs(0, 0, 1280, 720), opacity: clamp01((N - 3149) / 6)}}>
          <EyeGlyph cx={540} cy={200} w={56} open={Math.min(1, 0.06 + clamp01((N - 3149) / 8))} />
          <EyeGlyph cx={740} cy={200} w={56} open={Math.min(1, 0.06 + clamp01((N - 3153) / 8))} />
        </div>

        {/* 顶部大字 Diffie-Hellman（GlitchIn，本镜唯一 glitch） */}
        <GlitchIn N={N} f0={3149} rgbSplit={6}>
          <div style={{...abs(0, 0, 1280, 720)}}>
            <CText cx={640} cy={128} size={52} weight={900} color={WHITE} letterSpacing={1}
              style={{WebkitTextStroke: '2px rgba(161,117,241,0.9)', paintOrder: 'stroke fill', transform: `scale(${emphasisPulse(N - 3149, {peak: 1.11})})`}}>Diffie-Hellman</CText>
          </div>
        </GlitchIn>

        {/* 终局：= + 白闪 + 反向箭头被 Cross */}
        {fin >= 1 ? (
          <div style={{...abs(0, 0, 1280, 720), opacity: fadeIn(eqN, 4)}}>
            <CText cx={640} cy={560} size={72} weight={700} family={FONT_ORB} color={flash ? '#fff' : PURPLE_LIGHT} letterSpacing={4}
              style={{textShadow: '0 0 22px rgba(161,117,241,.6)', transform: `scale(${eqS.toFixed(3)})`}}>=</CText>
            {revArrow > 0 ? (
              <Svg bloom={false}>
                <line x1={MB.cx - 60} y1={MB.cy + 66} x2={MB.cx - 60 - 120 * revArrow} y2={MB.cy + 66} stroke={GREY} strokeWidth={3} strokeDasharray="10 8" strokeLinecap="round" />
              </Svg>
            ) : null}
            {crossP > 0 ? (
              <div style={{...abs(0, 0, 1280, 720), opacity: crossP, transform: `rotate(${(1 - crossP) * 20}deg) scale(${1.3 - 0.3 * crossP})`}}>
                <Cross cx={MB.cx - 128} cy={MB.cy + 66} size={72} sw={5} />
              </div>
            ) : null}
            <SoftIn N={N} f0={3236}>
              <CText cx={MB.cx - 128} cy={MB.cy + 130} size={22} weight={500} color={GREY}>cannot un-mix</CText>
            </SoftIn>
          </div>
        ) : null}

        {/* 液面波动由混合桶 fillK 微动（±0.03）体现，已内联在上方桶体 */}
      </div>
    </CameraRig>
  );
};
