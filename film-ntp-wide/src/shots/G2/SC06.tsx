import React from 'react';
import {useCurrentFrame} from 'remotion';
import {clamp01, easeOutCubic} from '../../common';
import {CameraRig, GlowBlob} from '../../fx';
import {
  SatGlyph, ClockIcon, CText, GREY, GREY_LIGHT, PURPLE_LIGHT, WHITE,
  abs, SoftIn, softOp, exitOp, glowOffK, scaleIn, Svg,
} from '../../ui';
import {LaptopGlyph, quadPt} from './g2ui';

/**
 * SC06 GPS 耳语 · N 1173–1320
 *   S11：1181「GPS satellites each carry one,」/ 1263「and whisper the time down to earth.」
 * 版式：上半三颗 SatGlyph 错峰（340,235 / 640,205 / 940,235，s0.95），本体屏内各嵌一枚小钟（N 驱动、三针同步——
 *   「各带一座钟」）；`each one carries a clock` 灰字在星下；下半地面弧 + `your laptop` 简笔（屏内石英钟）；
 *   卫星→地面三条信号弧错峰 draw-on + 信号点循环沿线跑（持续）+ `whisper the time` 灰字。
 * 动效：1181 三星 2f 错峰缩入（各 14f）+ 到位小钟白闪一拍；1186 灰字 SoftIn；
 *   1263 地面弧 draw-on（14f）+ 笔记本 SoftIn（屏内钟随信号点亮灰→紫）+ 三弧错峰 draw-on（1263/67/71，16f）；
 *   1280 起信号点循环（持续动作）；1268 `whisper the time` SoftIn。
 * 运镜：1237–1270 相机下沉 + 推近（640,375,s1.12，末 key = TO−50 ✓；星群顶 127 仍在 HUD 下沿之下）。
 * 停留：段内不判（S11 末块 56）。末 5 帧归零、光先灭。glitch：零。
 */
const F0 = 1173;
const TO = 1320;
const T_SATS = 1181, T_TEXT = 1186, T_GROUND = 1263, T_LAPTOP = 1263, T_ARCS = 1263, T_WHISPER = 1268, T_DOTS = 1280, T_SCREEN = 1288;

const SATS = [
  {cx: 340, cy: 235},
  {cx: 640, cy: 205},
  {cx: 940, cy: 235},
]; // s = 0.95（本体 140×80 视口 → 133×76）
// 地面弧（M 210 575 Q 640 520 1070 575）
const GROUND_LEN = 880;
// 三条信号弧（卫星底部 → 笔记本屏区）
const ARCS: Array<{p0: [number, number]; c: [number, number]; p1: [number, number]}> = [
  {p0: [340, 275], c: [450, 385], p1: [612, 486]},
  {p0: [640, 243], c: [640, 360], p1: [640, 473]},
  {p0: [940, 275], c: [830, 385], p1: [668, 486]},
];
const LAPTOP = {cx: 640, cy: 495, w: 96};

export const SC06: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const exit = exitOp(N, TO, 5);
  const gk = glowOffK(N, TO, 3, 5);

  // 地面弧 draw-on
  const groundP = easeOutCubic(clamp01((N - T_GROUND) / 14));
  // 屏内钟点亮（灰→紫，随信号点到达）
  const screenK = clamp01((N - T_SCREEN) / 8);

  return (
    <CameraRig N={N} keys={[
      {f: F0, x: 640, y: 360, s: 1},
      {f: 1237, x: 640, y: 360, s: 1},
      {f: 1270, x: 640, y: 375, s: 1.12},
    ]}>
      <div style={{...abs(0, 0, 1280, 720), opacity: exit}}>
        {/* 三颗卫星（2f 错峰缩入 + 屏内小钟白闪一拍） */}
        {SATS.map((st, i) => {
          const stF = T_SATS + i * 2;
          const op = N < stF ? 0 : softOp(N - stF, 6);
          if (op <= 0.02) return null;
          const s = 0.55 + 0.45 * scaleIn(N - stF, 14);
          const flashN = N - (stF + 10);
          const flash = flashN >= 0 && flashN < 8 ? Math.sin((Math.PI * flashN) / 8) : 0;
          return (
            <div key={i} style={{...abs(0, 0, 1280, 720), opacity: op, transform: `scale(${s.toFixed(4)})`, transformOrigin: `${st.cx}px ${st.cy}px`}}>
              <SatGlyph cx={st.cx} cy={st.cy} s={0.95} N={N} glow={N < TO - 8} />
              {/* 各带一座钟：本体屏内小钟（三针同步——它们都拿着准时间；本体中心在视口 y36 → cy−4） */}
              <ClockIcon cx={st.cx} cy={st.cy - 4} r={15} N={N} accent={PURPLE_LIGHT} />
              {/* 到位白闪（星上小钟面一闪） */}
              {flash > 0.03 ? (
                <div style={{...abs(st.cx - 18, st.cy - 18, 36, 36), borderRadius: '50%', border: `2.5px solid ${WHITE}`,
                  opacity: (0.85 * flash * gk).toFixed(2), boxShadow: `0 0 14px rgba(255,255,255,${(0.7 * flash * gk).toFixed(2)})`}} />
              ) : null}
            </div>
          );
        })}

        {/* each one carries a clock */}
        <SoftIn N={N} f0={T_TEXT} style={{opacity: exit}}>
          <CText cx={640} cy={302} size={26} weight={600} color={GREY}>each one carries a clock</CText>
        </SoftIn>

        {/* 地面弧（draw-on） */}
        {groundP > 0.01 ? (
          <Svg bloom={false} style={{opacity: exit}}>
            <path d="M210 575 Q640 520 1070 575" fill="none" stroke="#747474" strokeWidth={3}
              strokeDasharray={GROUND_LEN} strokeDashoffset={GROUND_LEN * (1 - groundP)} />
          </Svg>
        ) : null}

        {/* 三条信号弧（错峰 draw-on，自上而下揭示） */}
        {ARCS.map((A, i) => {
          const p = easeOutCubic(clamp01((N - (T_ARCS + i * 4)) / 16));
          if (p <= 0.01) return null;
          return (
            <div key={i} style={{...abs(0, 0, 1280, 720), clipPath: `inset(${(100 - 100 * p).toFixed(2)}% 0 0 0)`, opacity: softOp(N - (T_ARCS + i * 4), 4) * exit}}>
              <Svg bloom={false}>
                <path d={`M${A.p0[0]} ${A.p0[1]} Q${A.c[0]} ${A.c[1]} ${A.p1[0]} ${A.p1[1]}`}
                  fill="none" stroke={PURPLE_LIGHT} strokeWidth={2.5} strokeDasharray="10 8" opacity={0.75} />
              </Svg>
            </div>
          );
        })}

        {/* 信号点（1280 起沿线循环跑，持续动作） */}
        {N >= T_DOTS ? (
          <Svg style={{opacity: exit}}>
            {ARCS.map((A, i) => {
              const t = (((N - T_DOTS) / 46 + i * 0.37) % 1 + 1) % 1;
              const [px, py] = quadPt(t, A.p0, A.c, A.p1);
              const op = 0.85 * clamp01(Math.min(t * 6, (1 - t) * 6)) * gk;
              if (op <= 0.03) return null;
              return (
                <g key={i} opacity={op.toFixed(2)}>
                  <circle cx={px.toFixed(1)} cy={py.toFixed(1)} r={6.5} fill="rgba(102,48,248,0.32)" />
                  <circle cx={px.toFixed(1)} cy={py.toFixed(1)} r={3} fill={WHITE} />
                </g>
              );
            })}
            {/* 中弧第二枚（错相位） */}
            {(() => {
              const A = ARCS[1];
              const t = (((N - T_DOTS) / 46 + 0.68) % 1 + 1) % 1;
              const [px, py] = quadPt(t, A.p0, A.c, A.p1);
              const op = 0.6 * clamp01(Math.min(t * 6, (1 - t) * 6)) * gk;
              if (op <= 0.03) return null;
              return (
                <g opacity={op.toFixed(2)}>
                  <circle cx={px.toFixed(1)} cy={py.toFixed(1)} r={5.5} fill="rgba(102,48,248,0.3)" />
                  <circle cx={px.toFixed(1)} cy={py.toFixed(1)} r={2.6} fill={WHITE} />
                </g>
              );
            })()}
          </Svg>
        ) : null}

        {/* 地面：笔记本 + 落点光斑 */}
        <GlowBlob cx={LAPTOP.cx} cy={LAPTOP.cy} r={140} N={N} k={softOp(N - T_LAPTOP, 10) * gk} />
        <SoftIn N={N} f0={T_LAPTOP} dy={14} style={{opacity: exit}}>
          <LaptopGlyph cx={LAPTOP.cx} cy={LAPTOP.cy} w={LAPTOP.w} N={N}
            screenClock={N >= T_SCREEN ? 'purple' : 'grey'} clockK={screenK} glow />
        </SoftIn>
        <SoftIn N={N} f0={T_LAPTOP + 2} style={{opacity: exit}}>
          <CText cx={640} cy={556} size={22} weight={600} color={GREY_LIGHT}>your laptop</CText>
        </SoftIn>

        {/* whisper the time */}
        <SoftIn N={N} f0={T_WHISPER} style={{opacity: exit}}>
          <CText cx={640} cy={598} size={26} weight={600} color={GREY}>whisper the time</CText>
        </SoftIn>
      </div>
    </CameraRig>
  );
};
