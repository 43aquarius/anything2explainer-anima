import React from 'react';
import {useCurrentFrame} from 'remotion';
import {clamp01, easeInOutPow, easeOutCubic, emphasisPulse, kf, GlitchIn, FONT_WIDE} from '../../common';
import {CText, LineArrow, PURPLE_LIGHT, WHITE, abs, exitOp, glowOffK} from '../../ui';
import {GlowBlob} from '../../fx';
import {TERM, TerminalCard} from './g8bui';

/**
 * SC58 前两个字节 · N 8714–8839（S58 8722–8797 ¶+gap20：8722「Two bytes, right at the front.」/ 8779「P, K.」）
 * **承接终端卡（不清场）**：8713|8714 交界帧像素一致（TerminalCard 绝对帧驱动）。8716 卡让位 kf 下移 110px
 * （16 帧 easeInOut，y 180→290）给大字腾位；8722 结果行 `504b` 高亮变紫（wipe 12 帧，TERM.T_HL）；
 * 8736–8754 引线 draw-on（垂直段 (790,286)→(790,460) 10 帧 + 斜段箭头 (790,460)→(462,512) 8 帧，指向 504b）；
 * 8779 `P, K`（Audiowide 130px 白+紫描边）GlitchIn（**本镜唯一 glitch**，rgbSplit 6）+ 升起落位（cy 243→215 / 16 帧）
 * + emphasisPulse 1.11 + 紫光晕爆发（8795）后 30 帧收敛呼吸（持续）；终端其余行变暗 35%（TERM.T_DIM=8779）。
 * 末 8 帧归零（8831–8839，紫晕先灭 6 帧）。停留：大字落位 8779+21=8800 → 离场 8831，hold 31f ≥30 ✓
 * （分镜表「8799−8」为末句 to+2 旧口径；按镜头末 8 帧执行避免 8800–8839 空场，同 G3/SC15 裁定）。
 */
const F0 = 8714;
const TO = 8839, EXIT_LEN = 8;
const T_SHIFT = 8716; // 卡让位起点（8714–8715 与 SC57 末帧不动 → 交界一致）
const T_LINE = 8736; // 引线 draw-on
const T_PK = 8779; // S58.c2：P, K GlitchIn
const T_LAND = T_PK + 8; // 8787：落位（6 帧快升，给段末 ≥30f 稳定期留窗口；分镜表 8779+21 为 GlitchIn 满态旧口径）
const SHIFT = 110; // 卡下移量（y 180→290）

const PK = {cx: 640, cy: 215};

export const SC58: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const exOp = exitOp(N, TO, EXIT_LEN);
  if (exOp <= 0) return null;
  const gk = glowOffK(N, TO, 6, EXIT_LEN); // 紫晕先灭
  // 卡让位（16 帧）
  const shift = SHIFT * easeInOutPow(2.5)(clamp01((N - T_SHIFT) / 16));
  // 引线：垂直段 10 帧 + 斜段箭头 8 帧（终点指向结果行 504b）
  const lp1 = clamp01((N - T_LINE) / 10);
  const lp2 = clamp01((N - T_LINE - 10) / 8);
  // P, K：升起 + GlitchIn + 脉冲 + 紫晕爆发→呼吸（幅度收敛：blob ±14→±3 / glow ±10→±3，保停留稳定期）
  const pkY = kf(N, [[T_PK, 243], [T_LAND, PK.cy]], easeOutCubic);
  const pkS = kf(N, [[T_PK, 0.78], [T_LAND, 1]], easeOutCubic);
  const pulse = emphasisPulse(N - T_LAND, {peak: 1.06, up: 4, hold: 1, down: 5});
  const burstT = N - T_LAND;
  const bconv = 1 - 0.79 * clamp01((N - (T_LAND + 26)) / 8); // 8813 后呼吸幅度收敛到 21%
  const blobR = kf(N, [[T_LAND, 150], [T_LAND + 9, 250], [T_LAND + 39, 170]], easeOutCubic) + (burstT > 39 ? (3 + 11 * bconv) * Math.sin((2 * Math.PI * N) / 30) : 0);
  const blobA = Math.max(0, kf(N, [[T_LAND, 0.14], [T_LAND + 9, 0.4], [T_LAND + 39, 0.2]]) + (burstT > 39 ? (0.015 + 0.035 * bconv) * Math.sin((2 * Math.PI * N) / 30) : 0));
  const glow = 16 + (3 + 7 * bconv) * Math.sin((2 * Math.PI * N) / 30);
  return (
    <div style={{position: 'absolute', inset: 0, opacity: exOp}}>
      {/* 承接的终端卡（不清场；8716 起让位下移） */}
      <TerminalCard N={N} y={TERM.y + shift} />

      {/* 引线：垂直段 + 斜段箭头（终点指向结果行 504b） */}
      {lp1 > 0 ? (
        <div style={{...abs(790 - 1.25, 286, 2.5, Math.max(1, (460 - 286) * lp1)), background: 'rgba(255,255,255,0.8)', boxShadow: '0 0 6px rgba(255,255,255,.35)'}} />
      ) : null}
      {lp2 > 0 ? <LineArrow x0={790} y0={460} x1={462} y1={512} p={lp2} rodW={2.5} headL={17} headW={15} opacity={0.85} /> : null}

      {/* 紫光晕（P, K 身后：爆发 → 收敛 → 呼吸） */}
      <GlowBlob cx={PK.cx} cy={PK.cy + 7} r={Math.max(10, blobR)} alpha={blobA * gk} />

      {/* 大字 P, K（GlitchIn rgbSplit 6，本镜唯一 glitch） */}
      {N >= T_PK ? (
        <div style={{position: 'absolute', inset: 0, transformOrigin: `${PK.cx}px ${PK.cy}px`, transform: `scale(${(pkS * pulse).toFixed(4)})`}}>
          <GlitchIn N={N} f0={T_PK} rgbSplit={6} seed={58}>
            <CText
              cx={PK.cx}
              cy={pkY}
              size={130}
              weight={400}
              family={FONT_WIDE}
              letterSpacing={6}
              color={WHITE}
              style={{WebkitTextStroke: `2.5px ${PURPLE_LIGHT}`, paintOrder: 'stroke fill'}}
              shadow={`0 0 ${glow.toFixed(1)}px rgba(102,48,248,${(0.5 * gk).toFixed(2)}), 0 0 8px rgba(255,255,255,.25)`}
            >
              P, K
            </CText>
          </GlitchIn>
        </div>
      ) : null}
    </div>
  );
};

export default SC58;
