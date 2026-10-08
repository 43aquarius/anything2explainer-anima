import React from 'react';
import {useCurrentFrame} from 'remotion';
import {clamp01, GlitchIn, emphasisPulse, FONT_WIDE} from '../../common';
import {CText, WaxSeal, GREY, ORANGE, WHITE, exitOp, glowOffK, softOp} from '../../ui';
import {GlowBlob} from '../../fx';

/**
 * SC28 第一个问题 · N 3922–4031（S28 3930–3994 ¶+gap15：3930「First question:」/ 3958「has anyone tampered with it?」）
 * 清场。中央两行：`question one:`（灰 36px）/ `tampered?`（Audiowide 100px 白+橙描边——警示问句）；
 * 大字下「完好 vs 碎裂」对照：左 WaxSeal r 60 紫（光晕呼吸）· 右 WaxSeal r 60 裂纹 8 帧 draw-on 后变灰暗（持续微呼吸），中间 `or` 灰小字。
 * 3958 `tampered?` GlitchIn（rgbSplit 6，本镜唯一 glitch）+ 橙描边光晕呼吸 + emphasisPulse。
 * 停留：碎裂封印灰暗完成 3992 → 离场 4024（末 8 帧归零），稳定 32 帧 ✓（分镜表「3996−8」为 S28.to+2 旧口径，
 * 按 G3/G1 先例以镜头末 8 帧执行，避免 3997–4031 空场 34 帧）。
 * 主角：`tampered?` 100px；光：大字橙描边光晕（本镜唯一大面积光）。
 */
export const F0 = 3922;
const TO = 4031;
const B_Q1 = 3930, B_TAMP = 3958, B_SEALS = 3966, B_CRACK = 3976, B_PULSE = 3970;

export const SC28: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const op = exitOp(N, TO, 6);
  if (op <= 0) return null;

  const gk = glowOffK(N, TO, 6, 6); // 橙晕先灭（exit len 6）
  const bconv = 1 - 0.72 * clamp01((N - 3978) / 7); // 3978 后 7 帧呼吸幅度收敛到 28%（停留稳定期）
  const glow = 16 + (2.2 + 5.8 * bconv) * Math.sin((2 * Math.PI * N) / 30);
  const pulse = emphasisPulse(N - B_PULSE, {peak: 1.08, up: 6, hold: 2, down: 7});

  // 裂纹 draw-on（8 帧）→ 碎裂封印变灰暗（8 帧）+ 持续微呼吸
  const crackP = clamp01((N - B_CRACK) / 8);
  const dimK = clamp01((N - (B_CRACK + 8)) / 8);
  const crackOp = softOp(N - (B_SEALS + 2), 8) * (0.5 - 0.08 * dimK + (0.014 + 0.026 * bconv) * Math.sin((2 * Math.PI * N) / 30));
  const intactOp = softOp(N - B_SEALS, 8);

  return (
    <div style={{position: 'absolute', inset: 0, opacity: op}}>
      {/* 第一行 */}
      <CText cx={640} cy={232} size={36} weight={600} color={GREY} letterSpacing={2} opacity={softOp(N - B_Q1, 8)}>
        question one:
      </CText>

      {/* 大字 tampered?（GlitchIn rgbSplit 6 = 本镜唯一 glitch；橙描边 + 光晕呼吸 + 脉冲） */}
      <div style={{position: 'absolute', inset: 0, transformOrigin: '640px 322px', transform: `scale(${pulse.toFixed(4)})`}}>
        <GlitchIn N={N} f0={B_TAMP} rgbSplit={6} seed={28}>
          <CText
            cx={640}
            cy={322}
            size={100}
            weight={400}
            family={FONT_WIDE}
            letterSpacing={3}
            color={WHITE}
            shadow={`0 0 ${glow.toFixed(1)}px rgba(240,95,65,${(0.5 * gk).toFixed(2)})`}
            style={{WebkitTextStroke: `2.5px ${ORANGE}`, paintOrder: 'stroke fill'}}
          >
            tampered?
          </CText>
        </GlitchIn>
      </div>

      {/* 完好封印（紫光晕呼吸） */}
      {intactOp > 0 ? (
        <div style={{position: 'absolute', inset: 0, opacity: intactOp}}>
          <GlowBlob cx={430} cy={470} r={100} N={N} k={gk} alpha={0.3} />
          <WaxSeal cx={430} cy={470} r={60} />
        </div>
      ) : null}

      {/* or */}
      <CText cx={640} cy={470} size={26} weight={600} color={GREY} opacity={softOp(N - (B_SEALS + 4), 8)}>
        or
      </CText>

      {/* 碎裂封印（裂纹 draw-on → 灰暗，持续微呼吸） */}
      {crackOp > 0 ? (
        <div style={{position: 'absolute', inset: 0, opacity: crackOp}}>
          <WaxSeal cx={850} cy={470} r={60} crackP={crackP} glow={false} />
        </div>
      ) : null}
    </div>
  );
};

export default SC28;
