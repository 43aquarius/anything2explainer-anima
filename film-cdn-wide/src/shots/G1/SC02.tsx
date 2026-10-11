import React from 'react';
import {useCurrentFrame} from 'remotion';
import {clamp01, powOutRemain, GlitchIn, kf, emphasisPulse, FONT_ORB, EM_ORB} from '../../common';
import {textW} from '../../common';
import {CameraRig, GradBall} from '../../fx';
import {CText, SoftIn, Svg, Box, LineArrow, GREY, GREY_MID, WHITE, ORANGE, GREEN, abs, fadeIn, exitOp, glowOffK, EXAMPLE} from '../../ui';

/**
 * SC02 光速数学（357–668）。S03 + S04。高光时刻（论点型：3 min vs 1 s 对照）。
 * 节拍：365 光纤管 draw-on（20f）+ 内部光点流跑动（6px/帧，持续动作）
 *       ｜445 `2/3 c` SoftIn + 光点流提速（6→10px/帧）
 *       ｜518 算式卡 slideUp（Δ100，18 帧）+ `100 Mb/s` SoftIn
 *       ｜594 `2 GB ≈` SoftIn + `3 min` GlitchIn（rgbSplit 4，白名单）+ 橙光晕
 *            + `your movie: 1 s` 自下弹入（Δ80，14 帧）+ `1 s` 绿光晕爆发 + 两侧各一次 emphasisPulse
 * 运镜：33 帧 1→1.15 推向算式卡（560–593，594 前结束；不进末拍）。主角：算式卡+对照行 300px（`3 min` 橙光晕、`1 s` 绿光晕）。
 */
const F0 = 357;
const TO = 668;

// 光纤管（左半）
const TUBE = {x0: 100, x1: 545, yT: 306, yB: 354, cy: 330, len: 445};
// 算式卡（右半，主角）
const CARD = {x: 630, y: 150, w: 560, h: 300};

// 第二行两段大字的绝对定位（Orbitron 68px，按 textW 量宽）
const L2 = (() => {
  const size = 68;
  const gap = 24;
  const w1 = textW(`${EXAMPLE.movieGb} ≈`, size, EM_ORB);
  const w2 = textW('3 min', size, EM_ORB);
  return {size, gap, w1, w2, left: 910 - (w1 + gap + w2) / 2};
})();

/** 光点流位移（start 起以 6px/帧，449 起 8 帧内提速到 10px/帧） */
const travel = (N: number, start: number) => {
  const base = 6 * Math.max(0, N - start);
  const T = N - 449;
  const extra = T <= 0 ? 0 : T <= 8 ? (T * T) / 4 : 16 + 4 * (T - 8);
  return base + extra;
};
const edgeFade = (x: number) => clamp01((x - 104) / 26) * clamp01((541 - x) / 26);

const orangeGlow = (k: number) => `0 0 ${(14 + 26 * k).toFixed(0)}px rgba(240,95,65,${(0.5 + 0.3 * k).toFixed(2)}), 0 0 58px rgba(240,95,65,${(0.32 * k).toFixed(2)})`;
const greenGlow = (k: number) => `0 0 ${(16 + 34 * k).toFixed(0)}px rgba(143,247,64,${(0.5 + 0.25 * k).toFixed(2)}), 0 0 64px rgba(143,247,64,${(0.38 * k).toFixed(2)})`;

export const SC02: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const exit = exitOp(N, TO, 8);
  const okK = glowOffK(N, TO); // 两个大数字的光先灭再淡出

  // ---- 光纤（365 draw-on；光点流持续）----
  const tubeP = clamp01((N - 365) / 20);
  const capOp = fadeIn(N - 383, 6);
  const tubeOn = clamp01((N - 365) / 4);
  const ballX = 104 + (travel(N, 390) % TUBE.len);
  const dotX = (i: number) => 104 + ((travel(N, 385) + i * 87) % TUBE.len);

  // ---- 算式卡（518 slideUp）----
  const cn = N - 368; // v2：c1 期即入（填开场空场）
  const cardDy = 100 * powOutRemain(cn, 18, 2.5);
  const cardOp = fadeIn(cn, 6);

  // `1 s` 绿光晕爆发：入场 4 帧冲到 1，20 帧回落到常亮 0.45
  const burst = kf(N, [[594, 0], [598, 1], [614, 0.45]]);

  // 对照行弹入（594 自下 Δ80 / 14 帧）
  const rn = N - 594;
  const rowDy = 80 * powOutRemain(rn, 14, 2.5);
  const rowOp = fadeIn(rn, 6);

  return (
    <CameraRig N={N} keys={[{f: F0, x: 640, y: 360, s: 1}, {f: 560, x: 640, y: 360, s: 1}, {f: 593, x: 860, y: 345, s: 1.15}]}>
      <div style={abs(0, 0, 1280, 720)}>
        <div style={{...abs(0, 0, 1280, 720), opacity: exit}}>
          {/* ---- 左半：光纤 + 光点流（持续动作）---- */}
          <Svg bloom={false}>
            {tubeOn > 0 ? (
              <>
                <line x1={TUBE.x0} y1={TUBE.yT} x2={TUBE.x0 + TUBE.len * tubeP} y2={TUBE.yT} stroke={GREY_MID} strokeWidth={2.5} />
                <line x1={TUBE.x0} y1={TUBE.yB} x2={TUBE.x0 + TUBE.len * tubeP} y2={TUBE.yB} stroke={GREY_MID} strokeWidth={2.5} />
              </>
            ) : null}
          </Svg>
          {capOp > 0 ? (
            <div style={{...abs(0, 0, 1280, 720), opacity: capOp}}>
              <div style={{...abs(95, 300, 9, 60), borderRadius: 4, background: WHITE}} />
              <div style={{...abs(541, 300, 9, 60), borderRadius: 4, background: WHITE}} />
            </div>
          ) : null}
          {/* 光点流（385 起，6→10px/帧，管内循环） */}
          {tubeP >= 1
            ? [0, 1, 2, 3, 4].map((i) => {
                const x = dotX(i);
                const f = edgeFade(x);
                return f <= 0.02 ? null : (
                  <div key={i} style={{...abs(x - 4.5, TUBE.cy - 4.5, 9, 9), borderRadius: '50%', background: WHITE, boxShadow: '0 0 7px rgba(255,255,255,.85)', opacity: f}} />
                );
              })
            : null}
          {/* 光子小球（390 起，沿管滚动，持续） */}
          {tubeP >= 1 ? (
            <div style={{...abs(0, 0, 1280, 720), opacity: edgeFade(ballX)}}>
              <div style={{...abs(ballX - 21, TUBE.cy - 21, 42, 42), borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,.9) 0%, rgba(255,255,255,.32) 46%, rgba(255,255,255,0) 72%)'}} />
              <GradBall cx={ballX} cy={TUBE.cy} r={11} />
            </div>
          ) : null}
          {/* `8,000 km` 呼应小标（S03a "cross that" 指的就是它） */}
          <SoftIn N={N} f0={373}>
            <CText cx={322} cy={392} size={24} weight={600} family={FONT_ORB} color={GREY} letterSpacing={1}>{EXAMPLE.distanceKm}</CText>
          </SoftIn>
          {/* `2/3 c`（445 SoftIn） */}
          <SoftIn N={N} f0={445}>
            <CText cx={322} cy={258} size={40} weight={700} family={FONT_ORB} color={GREY} letterSpacing={2}>{EXAMPLE.fiberC}</CText>
          </SoftIn>

          {/* ---- 右半：算式卡（主角，518 slideUp Δ100 / 18 帧）---- */}
          <div style={{...abs(0, 0, 1280, 720), opacity: cardOp, transform: `translateY(${cardDy.toFixed(1)}px)`}}>
            <Box x={CARD.x} y={CARD.y} w={CARD.w} h={CARD.h} r={14} fill="#000" stroke={WHITE} sw={2.5} />
            <SoftIn N={N} f0={522}>
              <CText cx={910} cy={230} size={64} weight={700} family={FONT_ORB} color={WHITE} letterSpacing={1}>{EXAMPLE.speed}</CText>
            </SoftIn>
            <Svg bloom={false}>
              <LineArrow x0={910} y0={258} x1={910} y1={292} p={clamp01((N - 594) / 10)} rodW={3} headL={16} headW={20} color={GREY} />
            </Svg>
            {/* 第二行：`2 GB ≈`（SoftIn）+ `3 min`（GlitchIn rgbSplit 4 + 橙光晕 + 606 脉冲） */}
            <SoftIn N={N} f0={594}>
              <CText cx={L2.left + L2.w1 / 2} cy={332} size={L2.size} weight={700} family={FONT_ORB} color={WHITE} letterSpacing={1}>{`${EXAMPLE.movieGb} ≈`}</CText>
            </SoftIn>
            <GlitchIn N={N} f0={594} rgbSplit={4} seed={7}>
              <CText
                cx={L2.left + L2.w1 + L2.gap + L2.w2 / 2}
                cy={332}
                size={L2.size}
                weight={700}
                family={FONT_ORB}
                color={ORANGE}
                letterSpacing={1}
                shadow={orangeGlow(okK)}
                style={{transform: `translate(-50%,-50%) scale(${emphasisPulse(N - 606, {peak: 1.11})})`}}
              >
                3 min
              </CText>
            </GlitchIn>
          </div>

          {/* ---- 对照行（594 自下弹入 Δ80 / 14 帧；`1 s` 绿光晕爆发 + 610 脉冲）---- */}
          <div style={{...abs(0, 0, 1280, 720), opacity: rowOp, transform: `translateY(${rowDy.toFixed(1)}px)`}}>
            <div style={{...abs(760, 480, 300, 112), display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 18}}>
              <CText cx={0} cy={0} size={26} weight={600} color={GREY} style={{position: 'static', transform: 'none'}}>your movie:</CText>
              <CText
                cx={0}
                cy={0}
                size={84}
                weight={700}
                family={FONT_ORB}
                color={GREEN}
                letterSpacing={1}
                shadow={greenGlow(okK * (0.45 + 0.55 * burst))}
                style={{position: 'static', transform: `scale(${emphasisPulse(N - 610, {peak: 1.11})})`}}
              >
                {EXAMPLE.playTime}
              </CText>
            </div>
          </div>
        </div>
      </div>
    </CameraRig>
  );
};
