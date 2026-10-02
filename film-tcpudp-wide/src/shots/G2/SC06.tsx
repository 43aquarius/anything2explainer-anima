import React from 'react';
import {useCurrentFrame} from 'remotion';
import {GlitchIn, emphasisPulse, clamp01, FONT_MONO, FONT_WIDE} from '../../common';
import {
  CText, TechText, Pill, SoftIn, abs, exitOp, glowOffK, exitAccel, WHITE, GREY, PURPLE, RED_DEEP,
} from '../../ui';

/**
 * SC06 一无所有 · N 1183–1342（S09 1191–1340：1191「No acknowledgments. No retransmissions.」/ 1280「No ordering. No flow control.」）
 * 章 1 高光时刻·论点型（本镜唯一 glitch = `NOTHING.`，白名单 rgbSplit 6）。
 * 版式：中央 `NOTHING.` Audiowide 120px 白+紫描边 (640,320)；`almost` Exo2 灰斜体 44px 悬在 NOTH 前下方 (205,394)
 *       组成 "almost NOTHING."；大字下一排四枚条款 Pill（等宽 24px，y 520），逐枚被红色删除线划掉后变暗 45%。
 * 节拍：1185/1224 pill1/2 SoftIn + 各 8 帧后红删除线 wipe（12 帧）；
 *       1216 `NOTHING.` GlitchIn（分镜表原 1280+10，前挂 74 帧：分镜表原节奏 1185–1290 主区最大物体 46px 持续 105 帧
 *       = 空场高级缺陷，且高光时刻 ≥60 帧编排不达；见 BUILD_NOTES）+ 1228 emphasisPulse 1.11 + 紫描边发光 30 帧呼吸（持续）；
 *       1279/1282 pill3/4（对齐节拍 1280 −1/+2）+ 删除线 1284/1286（12 帧）；
 *       1333–1342 末 10 帧整组归零（带光元素 1327 起先灭光）。
 * 停留：末拍删除线划完 1298 → 离场 1333，≥30 ✓（S09 末块 61）。
 * 主角：`NOTHING.` 大字 120px（≥96 ✓）；光 = 紫描边 + 紫柔光（本镜唯一大面积光）。
 */
const F0 = 1183;
const TO = 1362;
const T_BIG = 1216, T_ALMOST = 1220, T_PULSE = 1228;

const PILLS: Array<{t: string; x: number; w: number; f0: number; s0: number}> = [
  {t: 'no acks', x: 218, w: 138, f0: 1185, s0: 1195},
  {t: 'no retransmit', x: 380, w: 224, f0: 1224, s0: 1234},
  {t: 'no order', x: 628, w: 152, f0: 1279, s0: 1284},
  {t: 'no flow control', x: 804, w: 258, f0: 1282, s0: 1286},
];

export const SC06: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const exN = N - (TO - 10);
  const exOp = exitOp(N, TO, 10);
  const exDy = exitAccel(exN, 0.06);

  // 主角大字：glow 呼吸 ±15%（30 帧周期），离场前 6 帧先灭光
  const gk = glowOffK(N, TO, 6, 10);
  const brA = 0.5 * (1 + 0.15 * Math.sin((2 * Math.PI * N) / 30)) * gk;
  const pulse = emphasisPulse(N - T_PULSE, {peak: 1.11});

  return (
    <div style={{position: 'absolute', inset: 0, opacity: exOp, transform: exDy ? `translateY(${exDy.toFixed(1)}px)` : undefined}}>
      {/* 四枚条款 Pill：SoftIn 入场 → 红删除线 wipe（12 帧）→ 变暗 45% */}
      {PILLS.map((p) => {
        const pn = N - p.f0;
        if (pn < 0) return null;
        const sp = clamp01((N - p.s0) / 12); // 删除线进度
        const dk = clamp01((N - p.s0 - 12) / 6); // 划完变暗
        return (
          <SoftIn key={p.t} N={N} f0={p.f0}>
            <div style={{...abs(p.x, 520, p.w, 46), opacity: 1 - 0.45 * dk}}>
              <Pill x={0} y={0} w={p.w} h={46} fill="#000" stroke={WHITE} sw={2} text={p.t} fontSize={24} weight={600} family={FONT_MONO} color={WHITE} letterSpacing={0.5} textDy={0} />
              {sp > 0 ? (
                <div style={{position: 'absolute', left: 2, top: 21, width: (p.w - 4) * sp, height: 4, borderRadius: 2, background: RED_DEEP, boxShadow: '0 0 10px 2px rgba(236,8,31,.5)'}} />
              ) : null}
            </div>
          </SoftIn>
        );
      })}
      {/* `almost`：灰斜体小字，悬在 NOTH 前下方（"almost NOTHING."） */}
      <SoftIn N={N} f0={T_ALMOST}>
        <TechText cx={205} cy={394} text="almost" fontSize={44} color={GREY} weight={600} letterSpacing={2} glow={false} />
      </SoftIn>
      {/* 主角大字：GlitchIn（本镜唯一 glitch）+ 脉冲 + 紫描边/紫柔光呼吸 */}
      <div style={{position: 'absolute', inset: 0, transformOrigin: '640px 320px', transform: pulse === 1 ? undefined : `scale(${pulse.toFixed(4)})`}}>
        <GlitchIn N={N} f0={T_BIG} rgbSplit={6} seed={6}>
          <CText cx={640} cy={320} size={120} weight={400} family={FONT_WIDE} letterSpacing={6} color={WHITE} dy={-4}
            shadow={`0 0 ${(22 + 10 * brA).toFixed(1)}px rgba(102,48,248,${Math.max(0, brA).toFixed(3)})`}
            style={{WebkitTextStroke: `3px ${PURPLE}`, paintOrder: 'stroke fill'}}>
            NOTHING.
          </CText>
        </GlitchIn>
      </div>
    </div>
  );
};
