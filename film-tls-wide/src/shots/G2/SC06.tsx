import React from 'react';
import {useCurrentFrame} from 'remotion';
import {clamp01, kf, powOutRemain, emphasisPulse, GlitchIn, FONT_WIDE} from '../../common';
import {CText, Pill, LineArrow, Svg, Cross, GREY, GREY_LIGHT, WHITE, PURPLE, PURPLE_LIGHT, CORAL, SoftIn, exitOp, glowOffK, scaleIn, softOp, glowPurpleS} from '../../ui';
import {CameraRig, LightSweep, StageLine, GhostText, ghostOpacity} from '../../fx';
import {LockEnvelope} from './parts';

/**
 * SC06 SSL 锁 · N 1123–1340（S08–S09：1131「Their answer was SSL」/ 1181「a lock on the envelope」/ 1228「grew up…mistakes」/ 1297「became TLS」）
 * ★ 高光时刻·登场型（全片首扫光，扫光白名单①）：T0=1123 清场 → SET_PIECE 标准编排
 *   T0+4/+22/+40 三轮 LightSweep（1127/1145/1163，扫过锁/信封带）；T0+18 StageLine 展宽呼吸（y 172，SSL 字位）；
 *   T0+37 GhostText「SSL」白描边轮廓 10% 隐现；T1=1181 节拍帧白闪 3 帧 + `SSL` GlitchIn（rgbSplit 8 / slices 20）+ LockSeal 自上落下
 *   扣到信封封口（Δ90 / 14 帧，1195 落位时锁梁 4 帧"咔哒"扣合）+ 信封 HeroGlow 1.3×（8 帧）+ T1+12 emphasisPulse 1.11。
 * 1228 三枚版本 Pill 2 帧错峰 SoftIn + `SSL 2.0` 行尾小红 Cross draw-on（犯过错）+ Pill 呼吸；1297 `TLS` Pill 紫光点亮 + SSL3.0→TLS 小箭头。
 * 持续：锁体紫光呼吸 30 帧周期 ±15%。运镜：33 帧 1→1.15 推向锁（1194–1227，1228 前结束；推近期间无入场）。
 * 主角：LockSeal+巨信封 ~320px。离场：仅文字/Pill 末 10 帧归零；锁+信封不清场（SC07 承接共用 LockEnvelope）。
 */
const F0 = 1123;
const TO = 1340;
const T0 = 1123; // 清场帧
const T1 = 1181; // 节拍帧：白闪 + SSL GlitchIn + 锁落下

// SET_PIECE 相对帧（fx.tsx）：sweeps +4/+22/+40 → 1127/1145/1163；line +18 → 1141；ghost +37 → 1160；pulse T1+12 → 1193
const SWEEPS = [T0 + 4, T0 + 22, T0 + 40];
const T_LINE = T0 + 18, T_GHOST = T0 + 37, T_PULSE = T1 + 12;
const T_ENV = 1144; // 信封缩放入场（幽灵轮廓前、第三轮扫光扫过其上）
const T_LOCK_CLICK = 1195; // 锁落位（1181+14）；咔哒扣合 4 帧
const T_TLS = 1297, T_EXIT_TEXT = TO - 10;

const CAM_KEYS = [
  {f: F0, x: 640, y: 360, s: 1.0},
  {f: 1194, x: 640, y: 360, s: 1.0},
  {f: 1227, x: 640, y: 354, s: 1.15}, // 推向锁（1228 前结束；此后保持到 1340 → SC07 同参数交接
];

// 版本 Pill（y 535–583）：SSL 2.0（红叉标）/ SSL 3.0 / TLS（1297 才亮紫）
const PILLS: Array<{text: string; x: number; w: number; f0: number}> = [
  {text: 'SSL 2.0', x: 366, w: 148, f0: 1228},
  {text: 'SSL 3.0', x: 554, w: 148, f0: 1230},
];

export const SC06: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const exText = exitOp(N, TO, 10); // 文字/Pill 末 10 帧归零（锁+信封不清场）

  // ---- 信封 + 锁 ----
  const envScale = 0.85 + 0.15 * scaleIn(N - T_ENV); // 21 帧缩放入场
  const envGlow = kf(N, [[T_ENV, 0], [1158, 0.55], [T_LOCK_CLICK, 0.55], [1203, 0.715]]); // 落锁增强 1.3×（8 帧）
  const lockCy = 362 - 90 * powOutRemain(N - T1, 14, 2.5); // Δ90 / 14 帧自上落下
  const openK = N < T_LOCK_CLICK ? 1 : 1 - clamp01((N - T_LOCK_CLICK) / 4); // 落位时锁梁咔哒扣合（4 帧）
  const lockGlow = kf(N, [[T_LOCK_CLICK, 0], [T_LOCK_CLICK + 4, 0.55]]); // 此后 30 帧周期 ±15% 呼吸（GlowBlob 内建）
  const squash = N >= T_LOCK_CLICK && N <= 1203 ? Math.sin(Math.PI * clamp01((N - T_LOCK_CLICK) / 8)) : 0; // 落锁冲击轻压回弹

  // ---- SSL 大字 ----
  const pulse = emphasisPulse(N - T_PULSE, {peak: 1.11});
  const ghostOp = ghostOpacity(N, T_GHOST, T_PULSE);

  // ---- TLS Pill 点亮 ----
  const tlsK = kf(N, [[T_TLS, 0], [T_TLS + 8, 1]]);

  return (
    <CameraRig N={N} keys={CAM_KEYS}>
      {/* 三轮紫光横扫（登场型标准编排；光条带 292–378 扫过锁/信封） */}
      <LightSweep N={N} rounds={SWEEPS} alphas={[0.6, 0.55, 0.55]} />

      {/* 中央舞台光线（SSL 字位 y 172；1181 白闪 3 帧后消失） */}
      <StageLine N={N} f0={T_LINE} flashAt={T1} cx={640} cy={172} w={720} />

      {/* 「SSL」白描边轮廓隐现（glitch 期保留作底，pulse 起撤掉） */}
      <GhostText cx={640} cy={172} size={120} family={FONT_WIDE} weight={400} letterSpacing={8} opacity={ghostOp} dy={0}>SSL</GhostText>

      {/* 巨信封 + 挂锁（主角；信封 1144 缩放入场，锁 1181 落下 1195 咔哒扣合） */}
      <div style={{position: 'absolute', inset: 0, transform: `scale(${envScale.toFixed(4)})`, transformOrigin: '640px 385px', opacity: softOp(N - T_ENV, 10)}}>
        <LockEnvelope N={N} glowK={envGlow} lockGlowK={lockGlow} lockCy={lockCy} openK={openK} squash={squash} />
      </div>

      {/* `SSL` 大字：T1 白闪 + GlitchIn（本镜唯一 glitch）+ emphasisPulse */}
      <div style={{position: 'absolute', inset: 0, opacity: exText}}>
        <div style={{position: 'absolute', inset: 0, transformOrigin: '640px 172px', transform: pulse === 1 ? undefined : `scale(${pulse.toFixed(4)})`}}>
          <GlitchIn N={N} f0={T1} rgbSplit={8} slices={20} sliceBands={4} seed={7}>
            <CText cx={640} cy={172} size={120} weight={400} family={FONT_WIDE} letterSpacing={8} color={WHITE}
              shadow={`6px 6px 0 ${PURPLE}, 0 0 28px rgba(102,45,248,.45)`}>SSL</CText>
          </GlitchIn>
        </div>
      </div>

      {/* 三枚版本 Pill（2 帧错峰 SoftIn；呼吸） */}
      <div style={{position: 'absolute', inset: 0, opacity: exText}}>
        {PILLS.map((p, i) => (
          <SoftIn key={p.text} N={N} f0={p.f0} len={8}>
            <div style={{position: 'absolute', inset: 0, opacity: 0.93 + 0.07 * Math.sin((2 * Math.PI * N) / 40 + i * 2.1)}}>
              <Pill x={p.x} y={535} w={p.w} h={48} r={24} sw={2} stroke={GREY} fontSize={24} weight={700} color={GREY_LIGHT} letterSpacing={1} text={p.text} />
            </div>
          </SoftIn>
        ))}
        {/* TLS Pill（第 3 枚：1297 才亮紫 + 小脉冲） */}
        <SoftIn N={N} f0={1232} len={8}>
          <div style={{position: 'absolute', inset: 0, transformOrigin: '810px 559px', transform: `scale(${emphasisPulse(N - T_TLS, {peak: 1.08}).toFixed(4)})`}}>
            <Pill x={762} y={535} w={96} h={48} r={24} sw={tlsK > 0 ? 2.5 : 2} stroke={tlsK > 0 ? PURPLE_LIGHT : GREY} fontSize={24} weight={700}
              color={tlsK > 0 ? WHITE : GREY_LIGHT} letterSpacing={2} text="TLS" glow={tlsK > 0 ? glowPurpleS(tlsK * glowOffK(N, TO, 6, 10)) : undefined} />
          </div>
        </SoftIn>
      </div>

      {/* SSL 2.0 行尾小红 Cross（犯过错） + SSL3.0→TLS 小箭头 */}
      <Svg opacity={exText}>
        <Cross cx={541} cy={559} size={22} color={CORAL} sw={5} p={clamp01((N - 1240) / 12)} />
        <LineArrow x0={708} y0={559} x1={754} y1={559} p={clamp01((N - T_TLS) / 12)} rodW={2.5} headW={16} headL={14} color={PURPLE_LIGHT} />
      </Svg>
    </CameraRig>
  );
};
