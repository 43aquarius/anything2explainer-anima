import React from 'react';
import {useCurrentFrame} from 'remotion';
import {clamp01, powOutRemain, GlitchIn, BEZ_SCALE_IN, FONT_ORB} from '../../common';
import {CameraRig} from '../../fx';
import {BrowserWin, CText, SoftIn, Svg, GREY_LINE, WHITE, ORANGE, abs, fadeIn, exitOp, glowOffK, BLOOM, EXAMPLE} from '../../ui';
import {WorldMapCore, WORLD} from './g1ui';

/**
 * SC01 周五夜（78–356）。S01 + S02。
 * 节拍：86 播放器 slideUp Δ110/22f + 播放键缩放入场（88 起 21f）+ 地址栏打字（2f/字）
 *       ｜143 播放键按下（4 帧 dip + 白色波纹）→ 进度条开始走（持续动作）+ `2 GB` SoftIn
 *       ｜219 世界图 draw-on（大陆线 24f）+ `you` 节点 SoftIn + `origin` 机架缩入（21f）+ 指示灯闪（持续动作）
 *       ｜301 虚线远弧 draw-on（22f）+ `8,000 km` GlitchIn（rgbSplit 4，白名单）+ 橙光晕
 * 运镜：1.0→1.05 慢推贯穿（内容留 x 89–1191 / y 122–607）。主角：播放器+世界图组 320px（播放键白 BLOOM、`8,000 km` 橙光晕）。
 */
const F0 = 78;
const TO = 356;

const PL = {x: 115, y: 170, w: 250, h: 235}; // 播放器（BrowserWin 播放器版）
const PLAY = {cx: 240, cy: 300, r: 46}; // 播放键
const BAR = {x: 138, y: 378, w: 210, h: 9}; // 播放进度条

export const SC01: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const exit = exitOp(N, TO, 8); // 末 8 帧归零
  const heroK = glowOffK(N, TO); // 主角白柔光先灭再淡出

  // ---- 播放器（86 slideUp Δ110 / 22 帧）----
  const pn = N - 86;
  const plDy = 110 * powOutRemain(pn, 22, 2.5);
  const plOp = fadeIn(pn, 6);
  const typed = Math.max(0, Math.min(EXAMPLE.content.length, Math.floor((N - 88) / 2)));
  // 播放键缩放入场（88 起 21 帧）+ 143 按下（4 帧 dip）+ 波纹
  const btnS = 0.4 + 0.6 * BEZ_SCALE_IN(clamp01((N - 88) / 21));
  const dip = 1 - 0.14 * Math.sin(Math.PI * clamp01((N - 143) / 4));
  const rip = clamp01((N - 143) / 16);
  // 进度条走（148 起，持续动作：至镜头尾走到 ~62%）
  const barPct = clamp01((N - 148) / 200) * 0.62;

  // ---- 世界图（219 draw-on）----
  const contP = clamp01((N - 219) / 24);
  const youOp = clamp01((N - 221) / 8);
  const rackS = BEZ_SCALE_IN(clamp01((N - 221) / 21));
  const rackOp = fadeIn(N - 221, 6);
  const ledPh = (N - 221) % 30;
  const ledOn = ledPh < 10 || (ledPh >= 14 && ledPh < 17); // 指示灯持续闪
  const arcP = clamp01((N - 301) / 22);
  // `8,000 km` 橙光晕（离场前先灭光）
  const kmK = glowOffK(N, TO, 6, 8);

  return (
    <CameraRig N={N} keys={[{f: F0, x: 640, y: 360, s: 1}, {f: TO, x: 640, y: 360, s: 1.05}]}>
      <div style={abs(0, 0, 1280, 720)}>
        <div style={{...abs(0, 0, 1280, 720), opacity: exit}}>
          {/* ---- 播放器（主角左半，白柔光 + 播放键 BLOOM）---- */}
          <div style={{...abs(0, 0, 1280, 720), opacity: plOp, transform: `translateY(${plDy.toFixed(1)}px)`}}>
            <div
              style={{
                ...abs(PL.x - 10, PL.y - 6, PL.w + 20, PL.h + 30),
                borderRadius: 18,
                boxShadow: `0 0 14px 4px rgba(255,255,255,${(0.16 * heroK).toFixed(3)}), 0 0 46px 16px rgba(255,255,255,${(0.12 * heroK).toFixed(3)})`,
              }}
            />
            <BrowserWin x={PL.x} y={PL.y} w={PL.w} h={PL.h} url={EXAMPLE.content} typed={typed} skeleton={0} />
            {/* 播放键（白描边圆 + 三角，BLOOM）+ 按下波纹 */}
            <div style={{...abs(0, 0, 1280, 720), transform: `scale(${(btnS * dip).toFixed(3)})`, transformOrigin: `${PLAY.cx}px ${PLAY.cy}px`}}>
              <div
                style={{
                  position: 'absolute',
                  left: PLAY.cx - PLAY.r - 8,
                  top: PLAY.cy - PLAY.r - 8,
                  width: (PLAY.r + 8) * 2,
                  height: (PLAY.r + 8) * 2,
                  borderRadius: '50%',
                  boxShadow: `0 0 ${(10 + 26 * heroK).toFixed(0)}px rgba(255,255,255,${(0.18 + 0.5 * heroK).toFixed(2)})`,
                  filter: BLOOM,
                }}
              />
              <Svg>
                <circle cx={PLAY.cx} cy={PLAY.cy} r={PLAY.r} fill="rgba(0,0,0,.55)" stroke={WHITE} strokeWidth={3.5} />
                <polygon points={`${PLAY.cx - 12},${PLAY.cy - 25} ${PLAY.cx - 12},${PLAY.cy + 25} ${PLAY.cx + 38},${PLAY.cy}`} fill={WHITE} />
                {rip > 0 && rip < 1 ? (
                  <circle cx={PLAY.cx} cy={PLAY.cy} r={PLAY.r + 34 * rip} fill="none" stroke={WHITE} strokeWidth={3} opacity={(0.75 * (1 - rip)).toFixed(2)} />
                ) : null}
              </Svg>
            </div>
            {/* 进度条（143 按下后开始走，持续动作） */}
            <div style={{...abs(BAR.x, BAR.y, BAR.w, BAR.h), borderRadius: 5, border: `1.5px solid ${GREY_LINE}`, background: '#0d0d10'}} />
            {barPct > 0 ? (
              <div style={{...abs(BAR.x, BAR.y, BAR.w * barPct, BAR.h), borderRadius: 5, background: WHITE, boxShadow: `0 0 8px rgba(255,255,255,${(0.7 * heroK).toFixed(2)})`}} />
            ) : null}
            {/* `2 GB` 计数（SoftIn，进度条右上） */}
            <SoftIn N={N} f0={143}>
              <CText cx={316} cy={360} size={26} weight={700} family={FONT_ORB} color={WHITE} letterSpacing={1}>{EXAMPLE.movieGb}</CText>
            </SoftIn>
          </div>

          {/* ---- 世界简图（主角右半，8,000 km 橙光晕）---- */}
          <WorldMapCore
            contP={contP}
            arcP={arcP}
            rackS={rackS}
            rackOp={rackOp}
            youOp={youOp}
            ledOn={ledOn}
            labelNode={
              <GlitchIn N={N} f0={301} rgbSplit={4} seed={5}>
                <CText
                  cx={WORLD.km.x}
                  cy={WORLD.km.y}
                  size={44}
                  weight={700}
                  family={FONT_ORB}
                  color={ORANGE}
                  letterSpacing={1}
                  shadow={`0 0 ${(16 + 26 * kmK).toFixed(0)}px rgba(240,95,65,${(0.5 + 0.3 * kmK).toFixed(2)}), 0 0 60px rgba(240,95,65,${(0.3 * kmK).toFixed(2)})`}
                >
                  {EXAMPLE.distanceKm}
                </CText>
              </GlitchIn>
            }
          />
        </div>
      </div>
    </CameraRig>
  );
};
