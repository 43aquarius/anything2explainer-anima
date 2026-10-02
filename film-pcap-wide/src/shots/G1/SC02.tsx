import React from 'react';
import {useCurrentFrame} from 'remotion';
import {clamp01, emphasisPulse, glitchOpacity} from '../../common';
import {ORANGE, abs, fadeIn, slideUp, exitOp, glowOffK} from '../../ui';
import {ServerLogCard, LOG} from './g1ui';

/**
 * SC02 六十毫秒日志 · N 210–352（S02 218–350：218「server logs say」/ 253「every request」/ 296「sixty milliseconds」）
 * 节拍：218 日志卡 slideUp Δ110/22 + 8 帧淡入（卡底峰值 y630，不穿字幕带）；
 *       行 219/221/223 逐行 wipe（10 帧 clip，见 g1ui.ServerLogCard）；253 第 4 行打字机（2 帧/字，295 满）；
 *       296 「60 ms」12 帧透明度 glitch 模板（本镜唯一 glitch，白名单 SC02 `60 ms`；行内 span 用 glitchOpacity，
 *       与 GlitchIn 同序列——GlitchIn 是全画幅容器没法包行内片段）+ 橙柔光 8 帧亮起 + 1.15 落定脉冲；
 *       rack 指示灯 lit 3→4→5 每 9 帧循环（持续动作）；338 起灭光、344–352 归零淡出。
 * 主角：日志卡 320px 高，HeroGlow 淡紫（PURPLE_LIGHT）。SC03 以同组件同参数承接。
 */
const F0 = 210;
const T_IN = 218;
const T_GLITCH = 296;
const TO = 352;

export const SC02: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const op = exitOp(N, TO, 8);
  const cn = N - T_IN;
  const glowK = glowOffK(N, TO, 6, 8);
  // 「60 ms」样式：glitch 12 帧模板（白名单）+ 橙光 8 帧亮起 + 落定脉冲（310 起）
  const gn = N - T_GLITCH;
  const gOp = glitchOpacity(gn);
  const gk = clamp01((gn - 12) / 8);
  const pulse = emphasisPulse(gn - 14, {peak: 1.15, up: 8, hold: 3, down: 9});
  const ms60Style: React.CSSProperties = {
    color: ORANGE,
    opacity: gOp,
    transform: pulse === 1 ? undefined : `scale(${pulse.toFixed(3)})`,
    textShadow: `0 0 ${Math.round(10 + 18 * gk)}px rgba(243,95,69,${(0.35 + 0.4 * gk).toFixed(2)}), 0 0 40px rgba(243,95,69,${(0.2 * gk).toFixed(2)})`,
  };
  return (
    <div style={{position: 'absolute', inset: 0, opacity: op}}>
      <div style={{...abs(LOG.x, LOG.y + slideUp(cn, 110, 22)), opacity: fadeIn(cn, 8)}}>
        <ServerLogCard N={N} ms60Style={ms60Style} glowK={glowK} />
      </div>
    </div>
  );
};
