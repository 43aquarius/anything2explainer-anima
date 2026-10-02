import React from 'react';
import {useCurrentFrame} from 'remotion';
import {clamp01, kf, easeInOutPow, emphasisPulse, FONT_MONO} from '../../common';
import {CText, Box, NodeDot, PersonIcon, Svg, abs, fadeIn, exitOp, WHITE, GREY, GREY_MID, GREY_LIGHT, ORANGE, PURPLE_LIGHT, BLOOM_SOFT} from '../../ui';
import {CameraRig} from '../../fx';

/**
 * SC13 起点对齐（2847–2972，S23 ¶+gap，末块 44⚠）
 * 节拍：2855 三条消息 / 2927 序号起点一致。
 * 承接：SC12 两端点（SC12 末帧几何 (280/1000,360) r90，呼吸光同相位同公式 → 交界帧无缝）
 *       kf 16 帧缩移到 (240/1040,360) 0.7×（r63）。
 * 版式：中央游标尺（x 430–850 刻度带，11 大刻度、中心刻度高亮）+ 左橙游标 `seq = 0`（上）、右紫游标 `ack = 1`（下）
 *       → 双游标 2921（节拍 2927 −6 容差内）起两侧滑入 12 帧同时到达中心刻度（0 与 1 相邻，卡上带 0/1 小标）
 *       → 白色对齐虚线 draw-on 8 帧 + `aligned` 灰 26px + 双游标 pulse。
 * 持续：刻度带每 24 帧一格微亮扫过；节点呼吸。运镜：1.0→1.05 慢推贯穿（2855–2960，慢推例外可进末拍）。
 * 零 glitch。末 6 帧归零（2966–2972）——离场收窄到 6 帧为挤停留：S23 末块仅 44 帧（timeline 标 ⚠），
 * 分镜表「≥30」在其自身节拍下不可达，已前挂游标到 −6 并记录（见 BUILD_NOTES 待主会话裁定）。
 */
const F0 = 2847;
const T_RULER = 2855, T_CUR = 2921, T_EXIT = 3004;
const NL0 = {cx: 280, r: 90}, NL1 = {cx: 240, r: 63}; // 左节点：SC12 末 → 本镜
const NR0 = {cx: 1000, r: 90}, NR1 = {cx: 1040, r: 63};
const STRIP = {x: 430, y: 322, w: 420, h: 68};
const CUR_Y_TOP = 296, CUR_Y_BOT = 416;

export const SC13: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const ex = exitOp(N, T_EXIT, 6); // 末 6 帧归零（挤停留，见文件头注释）
  const mk = kf(N, [[F0, 0], [F0 + 16, 1]], easeInOutPow(2.5)); // 节点承接位移
  const ln = {cx: NL0.cx + (NL1.cx - NL0.cx) * mk, r: NL0.r + (NL1.r - NL0.r) * mk};
  const rn = {cx: NR0.cx + (NR1.cx - NR0.cx) * mk, r: NR0.r + (NR1.r - NR0.r) * mk};
  const nodeGlow = 0.75 + 0.25 * Math.sin((2 * Math.PI * (N - 12)) / 30); // 与 SC12 同公式同相位（交界帧无缝）

  const rulerP = clamp01((N - T_RULER) / 20); // 刻度带 draw-on
  const curN = N - T_CUR;
  const curT = easeInOutPow(2.2)(clamp01(curN / 12)); // 游标滑入（2921–2933，同步到达）
  const orangeX = 320 + (640 - 320) * curT;
  const purpleX = 960 + (640 - 960) * curT;
  const alignedN = N - (T_CUR + 12); // 对齐虚线：游标到位（2933）即起
  const lineP = clamp01((alignedN - 1) / 6);
  const pulse = emphasisPulse(alignedN, {peak: 1.09, up: 8, hold: 4, down: 8});
  // 刻度微亮扫过（24 帧一格）
  const sweepIdx = N >= 2875 ? Math.floor((N - 2875) / 24) % 11 : -1;
  const sweepK = N >= 2875 ? 1 - ((N - 2875) % 24) / 24 : 0;

  const Cursor: React.FC<{x: number; y: number; label: string; color: string; s: number}> = ({x, y, label, color, s}) => (
    <div style={{...abs(x - 82, y - 24, 164, 48), transform: `scale(${s.toFixed(4)})`, transformOrigin: '50% 50%', opacity: ex * clamp01((curN + 4) / 8)}}>
      <Box x={0} y={0} w={164} h={48} r={10} stroke={color} sw={2.5} fill="#000" style={{boxShadow: `0 0 12px ${color}44`}} />
      <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FONT_MONO, fontSize: 23, fontWeight: 700, color: WHITE, letterSpacing: 1}}>{label}</div>
    </div>
  );

  return (
    <CameraRig N={N} keys={[{f: F0, x: 640, y: 360, s: 1}, {f: T_RULER + 105, x: 640, y: 360, s: 1.05}]}>
      {/* 两端点（SC12 同几何承接 → kf 16 帧缩移 0.7×） */}
      {[{n: ln, label: 'you'}, {n: rn, label: 'friend'}].map((o, i) => (
        <div key={i} style={{...abs(o.n.cx - o.n.r, 360 - o.n.r, o.n.r * 2, o.n.r * 2 + 42), opacity: ex}}>
          <NodeDot cx={o.n.r} cy={o.n.r} r={o.n.r - 2} label={o.label} glowP={nodeGlow} labelSize={24} />
          <div style={{position: 'absolute', left: o.n.r, top: o.n.r, transform: 'translate(-50%,-50%)'}}>
            <PersonIcon cx={0} cy={0} size={o.n.r * 1.28} opacity={0.9} />
          </div>
        </div>
      ))}

      {/* 刻度带（draw-on 20 帧） */}
      {rulerP > 0 ? (
        <div style={{...abs(STRIP.x, STRIP.y, STRIP.w * rulerP, STRIP.h), overflow: 'hidden', opacity: ex}}>
          <div style={{...abs(0, 0, STRIP.w, STRIP.h), filter: BLOOM_SOFT}}>
            <Box x={0} y={0} w={STRIP.w} h={STRIP.h} r={8} sw={2.5} fill="rgba(0,0,0,0.85)" />
            {Array.from({length: 11}, (_, i) => {
              const tx = 20 + i * 38; // 局部：刻度 20..400（世界 450..830，中心 i=5 → x 640）
              const isC = i === 5;
              const hot = i === sweepIdx ? sweepK : 0;
              return <div key={i} style={{position: 'absolute', left: tx, top: isC ? 12 : 20, width: isC ? 3.5 : 2.5, height: isC ? 44 : 28, background: hot > 0 ? GREY_LIGHT : isC ? WHITE : GREY_MID, boxShadow: hot > 0 ? `0 0 10px ${PURPLE_LIGHT}` : isC ? '0 0 8px rgba(255,255,255,.7)' : undefined, opacity: 0.55 + 0.45 * (isC ? 1 : 0.7 + 0.3 * hot)}} />;
            })}
          </div>
        </div>
      ) : null}

      {/* 中心刻度两侧 0 / 1 小标（游标到达前闪现） */}
      {curN >= 10 ? (
        <div style={{opacity: ex * fadeIn(curN - 10, 6)}}>
          <CText cx={640 - 34} cy={356} size={22} weight={700} family={FONT_MONO} color={ORANGE}>0</CText>
          <CText cx={640 + 34} cy={356} size={22} weight={700} family={FONT_MONO} color={PURPLE_LIGHT}>1</CText>
        </div>
      ) : null}

      {/* 对齐虚线（贯穿两游标）+ aligned */}
      {lineP > 0 ? (
        <Svg>
          <line x1={640} y1={258} x2={640} y2={258 + 194 * lineP} stroke={WHITE} strokeWidth={2.5} strokeDasharray="10 8" opacity={0.9 * ex} style={{filter: 'drop-shadow(0 0 5px rgba(255,255,255,.7))'}} />
        </Svg>
      ) : null}
      {alignedN >= 2 ? (
        <CText cx={640} cy={236} size={26} weight={600} color={GREY} letterSpacing={3} opacity={ex * fadeIn(alignedN - 2, 6)}>aligned</CText>
      ) : null}
      {/* 双游标（两侧滑入，同时到达中心刻度；到位后 pulse） */}
      {curN >= 0 ? (
        <>
          <Cursor x={orangeX} y={CUR_Y_TOP} label="seq = 0" color={ORANGE} s={pulse} />
          <Cursor x={purpleX} y={CUR_Y_BOT} label="ack = 1" color={PURPLE_LIGHT} s={pulse} />
        </>
      ) : null}
    </CameraRig>
  );
};
