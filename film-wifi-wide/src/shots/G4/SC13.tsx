import React from 'react';
import {useCurrentFrame} from 'remotion';
import {clamp01, easeInOutPow, easeOutCubic, emphasisPulse, GlitchIn, kf, EM_HEAVY, FONT_HEAVY, textW} from '../../common';
import {CameraRig} from '../../fx';
import {
  AirPulse, Check, Cross, CText, GREY, PURPLE_LIGHT, WHITE, abs, SoftIn, fadeIn, firstOp, exitOp, glowOffK, Svg,
} from '../../ui';
import {EX, GhostLaptop, PlayerWin} from './shared';

/**
 * SC13 空气在轮流 · N 2710–2826（S25；TO = 2826，SC14 金句 from 2827）——**高光时刻·论点型**（分镜表清单）
 * 节拍：2718「that's not the network failing」播放器承接（14f 放大居中 975,515,400×190 → 640,320,640×300，
 *          进度条同步回卷 100%→48%——"倒带回卡住的那一刻"）+ `not failing` 灰字 SoftIn + Cross 轻盖一闪即收（2722–2732）
 *        ｜2766「That's the air, taking turns.」左侧隐形设备弧亮（2760 前挂 −6，ui.AirPulse 紫弧朝播放器）
 *          + 与缓冲圈同节拍呼吸 3 波（7f/波：2766/2773/2780，弧 glow 与圈 scale ±6% 同相位）
 *          + 因果虚线 draw-on（2766–2776）+ 大字 `the air, taking turns` GlitchIn（rgbSplit 6，白名单）
 *          + emphasisPulse 14f + 收束三连（"轮流"具象化，全部小面积动作链）：
 *            弧收 2780–2788（"它说完了"）→ 圈停 2785–2791 → 条续走 2791–2801 + Check 小闪 2797 + 进度头亮一拍
 * 尾部：末大动作 = 大字 glitch 2766–2778 / pulse −2780；其后收束三连均为小面积（<1.5 diff），
 *        hold ≈ 2818(灭光)−2780 = 38f − 6 = 32f ✓；离场 exitOp(N,2826,5) 全组收掉（SC14 开新场）。
 * 运镜：2710–2726 相机 1.06→1.0 平滑归位（SC12 慢推末态承接）→ 2743–2776 推近 1→1.15 向播放器（末 key 2776 = TO−50 ✓）。
 * 主角：播放器+弧 340px（呼吸同拍白光；大字 48px 白+紫描边紫晕）。
 */
const F0 = 2710;
const TO = 2826;

const T_ZOOM = 2718; // 播放器承接放大（14f，含条回卷）
const T_NF = 2718; // `not failing` 灰字
const T_CROSS = 2722; // Cross 轻盖一闪即收（10f）
const T_SIDE = 2726; // 两侧隐形设备轮廓缩入（2f 错峰）
const T_ARC = 2760; // 左设备弧亮（2766 拍 −6 前挂）
const T_BIG = 2766; // 大字 GlitchIn + emphasisPulse + 因果虚线 + 呼吸波 1
const T_ARCX = 2780; // 弧收（8f）——"它说完了"
const T_CIR = 2785; // 圈停（6f）
const T_BAR2 = 2791; // 条续走（10f）
const T_CHK = 2797; // Check 小闪 + 头亮一拍

// ---- 几何 ----
const PL0 = {cx: 975, cy: 515, w: 400, h: 190}; // SC12 末（承接起点）
const PL1 = {cx: 640, cy: 320, w: 640, h: 300}; // SC13 特写 0.8×
const SIDE_L = {cx: 180, cy: 430, w: 200}; // 左：这台轮到它说
const SIDE_R = {cx: 1100, cy: 430, w: 200}; // 右：灰静默（在听）
const BIG = {cx: 640, cy: 545, size: 48};
const BIG_W = textW(EX.airTurns, BIG.size, EM_HEAVY, 0);

/** 同拍呼吸（弧↔圈）：7f 周期正弦，2766 起三波（−1..1） */
const breath = (N: number) => (N < 2766 ? 0 : Math.sin((2 * Math.PI * (N - 2766)) / 7));

export const SC13: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const exit = exitOp(N, TO, 5);
  const gk = glowOffK(N, TO, 3, 5);

  // ---- 播放器承接：位置/尺寸 14f 过渡 + 进度条 100%→48% 回卷（"倒回那一刻"） ----
  const zk = easeInOutPow(2.5)(clamp01((N - T_ZOOM) / 14));
  const pl = {
    cx: PL0.cx + (PL1.cx - PL0.cx) * zk,
    cy: PL0.cy + (PL1.cy - PL0.cy) * zk,
    w: PL0.w + (PL1.w - PL0.w) * zk,
    h: PL0.h + (PL1.h - PL0.h) * zk,
  };
  const barK = N < T_BAR2 ? 1 - 0.52 * zk : 0.48 + 0.52 * easeInOutPow(1.9)(clamp01((N - T_BAR2) / 10));
  // 缓冲圈：stall 期缓转（6°/f）→ 呼吸期与弧同拍（转速/缩放随波）→ 2785 停转淡出
  const spinBase = (N - F0) * 6;
  const spinDeg = N < T_CIR ? spinBase + 14 * breath(N) : spinBase;
  const bufOp = N < T_CIR ? 1 : 1 - clamp01((N - T_CIR) / 6);
  const cirScale = 1 + 0.06 * Math.max(0, breath(N)); // 圈与弧同拍呼吸（低幅，波峰放大）
  const headFlash = clamp01((N - T_CHK) / 3) * (1 - clamp01((N - (T_CHK + 8)) / 5));

  // ---- 左设备弧（2760 亮 → 2780 收）：紫弧朝上（指向播放器），glow 随呼吸波（"同节拍"） ----
  const arcOp = kf(N, [[T_ARC, 0], [T_ARC + 6, 1], [T_ARCX, 1], [T_ARCX + 8, 0]]) * exit;
  const arcBreathe = 0.82 + 0.18 * Math.max(0, breath(N)); // 波峰时弧整体提亮（低幅）

  // ---- 两侧隐形设备（GhostLaptop 虚线轮廓，2f 错峰缩入） ----
  const sideS = (i: number) => 0.5 + 0.5 * easeOutCubic(clamp01((N - (T_SIDE + 2 * i)) / 12));
  const sideOp = (i: number) => firstOp(N - (T_SIDE + 2 * i)) * exit;

  // ---- `not failing` + Cross 一闪即收 ----
  const crossOp = kf(N, [[T_CROSS, 0], [T_CROSS + 3, 0.9], [T_CROSS + 7, 0.9], [T_CROSS + 10, 0]]) * exit;

  // ---- 大字（GlitchIn rgbSplit 6 白名单 + emphasisPulse；紫描边 + 紫晕低幅呼吸） ----
  const bigPulse = emphasisPulse(N - T_BIG, {peak: 1.08, up: 8, hold: 3, down: 10});
  const bigGlow = (0.5 + 0.1 * Math.sin((N - T_BIG) * 0.045)) * gk;

  // ---- 因果虚线：左设备 → 播放器缓冲圈（draw-on 10f） ----
  const dashP = clamp01((N - T_BIG) / 10);
  const ln = {x0: SIDE_L.cx + 66, y0: SIDE_L.cy - 30, x1: pl.cx - pl.w * 0.42, y1: pl.cy - pl.h * 0.16};

  // ---- Check 小闪（条续走后的"恢复"） ----
  const chkP = clamp01((N - T_CHK) / 10);

  return (
    <CameraRig
      N={N}
      keys={[
        {f: F0, x: 640, y: 360, s: 1.06}, // SC12 慢推末态承接
        {f: 2726, x: 640, y: 360, s: 1.0},
        {f: 2743, x: 640, y: 360, s: 1.0},
        {f: 2776, x: 640, y: 335, s: 1.15},
      ]}
    >
      <div style={{...abs(0, 0, 1280, 720), opacity: exit}}>
        {/* ================ 中央播放器（承接放大 → 48% 定格呼吸 → 收束后续走） ================ */}
        <div style={{...abs(0, 0, 1280, 720), opacity: firstOp(N - F0)}}>
          <PlayerWin cx={pl.cx} cy={pl.cy} w={pl.w} h={pl.h} barK={barK} bufOp={bufOp} spinDeg={spinDeg} cirScale={cirScale} glowK={0.55 * gk} headFlash={headFlash} />
        </div>

        {/* ================ 两侧隐形设备（虚线轮廓；左=此刻轮到它说，右=灰静默在听） ================ */}
        <div style={{...abs(0, 0, 1280, 720), opacity: sideOp(0), transform: `scale(${sideS(0).toFixed(4)})`, transformOrigin: `${SIDE_L.cx}px ${SIDE_L.cy}px`}}>
          <GhostLaptop cx={SIDE_L.cx} cy={SIDE_L.cy} w={SIDE_L.w} />
        </div>
        <div style={{...abs(0, 0, 1280, 720), opacity: sideOp(1) * 0.55, transform: `scale(${sideS(1).toFixed(4)})`, transformOrigin: `${SIDE_R.cx}px ${SIDE_R.cy}px`}}>
          <GhostLaptop cx={SIDE_R.cx} cy={SIDE_R.cy} w={SIDE_R.w} />
        </div>

        {/* 左设备发言弧（ui.AirPulse 紫弧朝上指向播放器；透明度随呼吸波；2780 收——"它说完了"） */}
        <div style={{...abs(0, 0, 1280, 720), opacity: arcOp * arcBreathe, filter: `drop-shadow(0 0 ${(4 + 6 * Math.max(0, breath(N))).toFixed(1)}px rgba(161,117,241,.85))`}}>
          <AirPulse cx={SIDE_L.cx + 30} cy={SIDE_L.cy - 48} N={N - T_ARC} r={28} maxR={128} speed={13} arcs={2} color={PURPLE_LIGHT} />
        </div>

        {/* 因果虚线（弧 ↔ 圈，"此刻轮到它说"的因果连接） */}
        {dashP > 0 ? (
          <Svg bloom={false}>
            <line x1={ln.x0} y1={ln.y0} x2={ln.x1} y2={ln.y1} stroke={WHITE} strokeWidth={2} strokeDasharray="7 7" opacity={0.6 * arcOp} pathLength={1} strokeDashoffset={(1 - dashP).toFixed(3)} />
          </Svg>
        ) : null}

        {/* ================ `not failing` + Cross 一闪即收 ================ */}
        <SoftIn N={N} f0={T_NF}>
          <CText cx={640} cy={142} size={26} weight={600} color={GREY}>{EX.notFailing}</CText>
        </SoftIn>
        {crossOp > 0.02 ? (
          <div style={{...abs(0, 0, 1280, 720), opacity: crossOp}}>
            <Cross cx={640} cy={142} size={36} sw={6} color="#F16043" p={0.6} />
          </div>
        ) : null}

        {/* ================ 大字 `the air, taking turns`（GlitchIn rgbSplit 6 · 白名单 · 紫描边紫晕） ================ */}
        <GlitchIn N={N} f0={T_BIG} rgbSplit={6} seed={13}>
          <div style={{...abs(BIG.cx - BIG_W / 2 - 80, 0, BIG_W + 160, 720), transform: `scale(${bigPulse.toFixed(4)})`, transformOrigin: `${BIG.cx}px ${BIG.cy}px`}}>
            <div style={{...abs(BIG.cx - BIG_W / 2 - 60, BIG.cy - 60, BIG_W + 120, 120), background: `radial-gradient(ellipse at 50% 50%, rgba(102,48,248,${(0.16 * bigGlow).toFixed(3)}) 0%, rgba(102,48,248,0) 70%)`}} />
            <CText
              cx={BIG.cx}
              cy={BIG.cy}
              size={BIG.size}
              weight={900}
              family={FONT_HEAVY}
              color={WHITE}
              letterSpacing={0.5}
              style={{WebkitTextStroke: '2.5px #A175F1', paintOrder: 'stroke fill', textShadow: `0 0 18px rgba(161,117,241,${(0.55 * bigGlow).toFixed(2)}), 0 0 46px rgba(102,48,248,${(0.3 * bigGlow).toFixed(2)})`}}
            >
              {EX.airTurns}
            </CText>
          </div>
        </GlitchIn>

        {/* ================ Check 小闪（条续走后的"恢复"） ================ */}
        {chkP > 0 ? <Check cx={BIG.cx + BIG_W / 2 + 56} cy={BIG.cy} size={34} sw={6} p={chkP} opacity={0.95 * gk} /> : null}
      </div>
    </CameraRig>
  );
};
