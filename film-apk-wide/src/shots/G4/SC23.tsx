import React from 'react';
import {useCurrentFrame} from 'remotion';
import {easeOutCubic, clamp01} from '../../common';
import {CText, Svg, WHITE, GREY, exitOp, glowOffK, softOp} from '../../ui';
import {EntryFile} from './g4ui';

/**
 * SC23 不是全部压缩（3280–3365，S23：3288 并非全部压缩）
 * 左右对照：左半 DEFLATED 块（褶皱收窄：w 320→272、pleat 0→1，12f；橙边橙光脉冲一次 + 两侧内压箭头）
 * / 右半 STORED 块（平直展开：w 272→320，12f；白边白光）；中间 `vs` 灰 32px；右上 `per entry` 灰 22px。
 * 标签 `DEFLATED`（橙 mono 26）/`STORED`（白 mono 26）各在块下方；两块每 30 帧交替微亮（对比呼吸，持续动作）。
 * 末 8 帧归零（3357–3365）。停留：段内不判。主角：双文件块 200px；光：左橙右白（橙=对照警示侧，白=平直结构）。
 */
export const F0 = 3280;
const B_DEF = 3288, B_ST = 3290, B_VS = 3294, B_LBL = 3294, B_PER = 3296, TO = 3365, EXIT_LEN = 8;
const MONO = "'SF Mono', Menlo, Consolas, monospace";
const ORANGE = '#F05F41';

const Y = 240, H = 200, CX_L = 330, CX_R = 950, W_FULL = 320, W_NARROW = 272;

export const SC23: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const op = exitOp(N, TO, EXIT_LEN);
  if (op <= 0) return null;
  const gk = glowOffK(N, TO, 6, EXIT_LEN);

  // 左块：褶皱收窄（w 320→272 + pleat 0→1，12f）
  const defP = easeOutCubic(clamp01((N - B_DEF) / 12));
  const wL = W_FULL - (W_FULL - W_NARROW) * defP;
  // 右块：平直展开（w 272→320，12f）
  const stP = easeOutCubic(clamp01((N - B_ST) / 12));
  const wR = W_NARROW + (W_FULL - W_NARROW) * stP;
  // 橙光脉冲一次（入场时 8f）
  const defFlash = Math.sin(Math.PI * clamp01((N - (B_DEF + 2)) / 8));
  // 对比呼吸（每 30 帧交替，持续动作）
  const altL = 0.5 + 0.5 * Math.sin(((N - B_DEF) / 30) * Math.PI * 2);
  const altR = 1 - altL;

  // 两侧内压箭头（随收窄推进，橙）
  const arrowIn = 10 * defP;

  return (
    <div style={{position: 'absolute', inset: 0, opacity: op}}>
      {/* 左：DEFLATED */}
      {N >= B_DEF ? (
        <div style={{position: 'absolute', inset: 0, opacity: softOp(N - B_DEF, 6)}}>
          <div style={{position: 'absolute', left: CX_L - wL / 2, top: Y, width: wL, height: H, borderRadius: 8, boxShadow: `0 0 ${26 * gk}px ${9 * gk}px rgba(240,95,65,${(0.28 + 0.22 * defFlash + 0.1 * altL).toFixed(3)})`}} />
          <EntryFile x={CX_L - wL / 2} y={Y} w={wL} h={H} pleat={defP} color={ORANGE} />
        </div>
      ) : null}
      {/* 内压箭头 ×2（左块两侧，橙） */}
      <Svg bloom={false}>
        {N >= B_DEF + 2 ? (
          <g stroke={ORANGE} strokeWidth={3} strokeLinecap="round" opacity={0.9}>
            <line x1={CX_L - wL / 2 - 34 - arrowIn} y1={Y + H / 2 - 12} x2={CX_L - wL / 2 - 10 - arrowIn} y2={Y + H / 2 - 12} />
            <polyline points={`${CX_L - wL / 2 - 22 - arrowIn},${Y + H / 2 - 20} ${CX_L - wL / 2 - 10 - arrowIn},${Y + H / 2 - 12} ${CX_L - wL / 2 - 22 - arrowIn},${Y + H / 2 - 4}`} fill="none" />
            <line x1={CX_L + wL / 2 + 34 + arrowIn} y1={Y + H / 2 + 12} x2={CX_L + wL / 2 + 10 + arrowIn} y2={Y + H / 2 + 12} />
            <polyline points={`${CX_L + wL / 2 + 22 + arrowIn},${Y + H / 2 + 4} ${CX_L + wL / 2 + 10 + arrowIn},${Y + H / 2 + 12} ${CX_L + wL / 2 + 22 + arrowIn},${Y + H / 2 + 20}`} fill="none" />
          </g>
        ) : null}
      </Svg>

      {/* 右：STORED */}
      {N >= B_ST ? (
        <div style={{position: 'absolute', inset: 0, opacity: softOp(N - B_ST, 6)}}>
          <div style={{position: 'absolute', left: CX_R - wR / 2, top: Y, width: wR, height: H, borderRadius: 8, boxShadow: `0 0 ${22 * gk}px ${7 * gk}px rgba(255,255,255,${(0.14 + 0.1 * altR).toFixed(3)})`}} />
          <EntryFile x={CX_R - wR / 2} y={Y} w={wR} h={H} pleat={0} color={WHITE} />
        </div>
      ) : null}

      {/* vs + 标签 + per entry */}
      <CText cx={640} cy={Y + H / 2} size={32} weight={700} color={GREY} opacity={softOp(N - B_VS, 8)}>vs</CText>
      <CText cx={CX_L} cy={Y + H + 36} size={26} weight={700} family={MONO} color={ORANGE} letterSpacing={2} opacity={softOp(N - B_LBL, 8)}>DEFLATED</CText>
      <CText cx={CX_R} cy={Y + H + 36} size={26} weight={700} family={MONO} color={WHITE} letterSpacing={2} opacity={softOp(N - (B_LBL + 2), 8)}>STORED</CText>
      <CText cx={1120} cy={205} size={22} weight={600} family={MONO} color={GREY} opacity={softOp(N - B_PER, 8)}>per entry</CText>
    </div>
  );
};

export default SC23;
