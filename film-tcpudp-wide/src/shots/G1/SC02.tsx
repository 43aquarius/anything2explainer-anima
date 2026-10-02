import React from 'react';
import {useCurrentFrame} from 'remotion';
import {clamp01, easeInOutPow, emphasisPulse, powOutRemain} from '../../common';
import {CameraRig} from '../../fx';
import {CText, PacketIcon, BLOOM, GREY_MID, ORANGE, PURPLE, WHITE, abs, softOp, scaleIn, exitOp, glowOffK} from '../../ui';
import {CallWin} from './parts';

/**
 * SC02 不会以同样的方式旅行 · N 207–421（S02 215–341 + S03 352–399 ¶）
 * 版式：SC01 通话窗口承接缩到上方 (640,220, 0.5×)（16 帧位移不清场，HeroGlow 同步熄灭）；
 *       窗口下沿引出竖短接 + 水平主线（y430，x120–1160，白 3px）；线上双股流量并行：
 *       上股 12 枚橙色圆点（语音，每 6 帧一枚落到线上 = 20 ms 节拍暗示，之后 72 帧周期跑灯）；
 *       下股 7 枚白色信封（照片，2 帧错峰 SoftIn 后 2.5px/帧持续右行，右端交付淡出/左端补位）；
 *       350 起线中点上方大字 not the same way（Noto 900 64px 白+紫描边+紫柔光）。
 * 节拍（字幕块，timeline.md）：215「Your voice and your photo」窗口缩微承接；262「leave the same machine」
 *       竖接 246 起、主线 256 起 draw-on 20 帧（−6 容差内）；282 起橙点逐枚落下、284 起信封队列；
 *       352「They will not travel the same way.」大字 350 缩放入场 21 帧（−2）。
 * 运镜：首 16 帧相机 1.05→1.0 回落（与承接位移合并，SC01 慢推末态无缝衔接；此后无运镜）。
 * 区间：S03 虽标 ¶ 但为章内段末（非章末/片末），不用「末句 to+2」，延至 SC03.from−1=421（resume 修复：
 *       原 401–421 为 20 帧无镜头空场）。
 * 离场：末 8 帧归零（414–421；大字紫柔光 407–413 先灭光）。
 *
 * —— 成片 v1 修复（tcpudp-wide-fix-A）：末拍稳定期 hold=0f（成片复测 fin_frames 实测：大字落位 371 后
 *    尾段 diff 恒 ≈2.1 ≥HOLD_THR=1.5，双股流量（7 枚信封 2.5px/帧 + 橙点 72 帧跑灯波）把稳定期压穿，
 *    大字落位 371 → 离场 414 实测 0f）。修法（主会话授权）：
 *    ① 大字前挂 15 帧：T_TXT 350 → 335（S03 节拍 352 −17，超出「不早于 −6」容差，已记录偏离）；
 *    ② 入场削减 21 → 15 帧（scaleIn），落位 350；
 *    ③ emphasisPulse：落位后起（354，比模板的第 8 帧提前 4 帧启动）、12 帧完成（up6/hold2/down4），
 *       完成点 366 → 离场 414 = 48 帧 ≥30 ✓（提前 4 帧启动是为了让脉冲尾部留出完整采样步：
 *       366 后尾段只剩流量微动作，实测 diff ≈1.05）；
 *    ④ 尾段流量收敛（350–360 十帧，随大字落位开始、脉冲掩护下完成）：信封队列 ×0.45、橙点基底 ×0.6 +
 *       跑灯波幅 ×0.3，流量持续但退层（大字成为唯一主角），收敛后尾段 diff ≈1.05 < 1.5，
 *       369–414 稳定期实测 42f（--shots index 口径）≥30 ✓（见 BUILD_NOTES）。
 *       速度不变（2.5px/帧持续右行，持续动作保留）。
 */
const F0 = 207;
const TO = 421;

const T_STUB = 246, T_LINE = 256, T_DOTS = 282, T_ENV = 284, T_TXT = 335;
const TXT_IN = 15;                                   // 成片 v1：21 → 15（削帧）
const T_PULSE = T_TXT + TXT_IN + 4;                  // 354：落位后第 4 帧起 12 帧脉冲（完成点 366 → 离场 414 = 48 帧 ≥30）
const T_CALM = 350, CALM_LEN = 10;                   // 流量收敛（大字落位同时开始，脉冲掩护下完成）
const CALM_ENV = 0.45, CALM_DOT = 0.6, CALM_HOT = 0.3;
const LINE_Y = 430;
const DOT_N = 12, DOT_X0 = 170, DOT_SP = 85.1, DOT_CY = 414;
const WAVE_T = 354, WAVE_LEN = 72;
const ENV_N = 7, ENV_SP = 1030 / 7, ENV_X0 = 130, ENV_X1 = 1160, ENV_CY = 460;

export const SC02: React.FC = () => {
  const N = useCurrentFrame() + F0;
  // 窗口承接：1 → 0.5×，中心 (640,360) → (640,220)
  const e16 = easeInOutPow(2.5)(clamp01((N - F0) / 16));
  const glowK = 1 - clamp01((N - F0) / 16);
  const exOp = exitOp(N, TO, 8);

  const stubP = clamp01((N - T_STUB) / 14);
  const lineP = clamp01((N - T_LINE) / 20);

  // 大字（紫柔光离场前 6 帧先灭：glowOffK）；成片 v1：15 帧缩放入场 + 落位后第 8 帧 12 帧脉冲
  const tn = N - T_TXT;
  const txtS = (0.5 + 0.5 * scaleIn(tn, TXT_IN)) * emphasisPulse(N - T_PULSE, {peak: 1.08, up: 6, hold: 2, down: 4});
  const txtOp = softOp(tn, 8);
  const txtGlow = `0 0 18px rgba(102,45,248,${(0.55 * glowOffK(N, TO, 6, 8)).toFixed(3)})`;

  // 成片 v1：尾段流量收敛（信封/橙点退层，大字成为唯一主角；速度不变，动作保留）
  const calm = clamp01((N - T_CALM) / CALM_LEN);
  const dimEnv = 1 - calm * (1 - CALM_ENV);
  const dimDot = 1 - calm * (1 - CALM_DOT);
  const dimHot = 1 - calm * (1 - CALM_HOT);

  return (
    <CameraRig N={N} keys={[{f: F0, x: 640, y: 360, s: 1.05}, {f: F0 + 16, x: 640, y: 360, s: 1}]}>
      <div style={{position: 'absolute', inset: 0, opacity: exOp}}>
        {/* 通话窗口（承接缩微，同组件同参数） */}
        <div style={{position: 'absolute', inset: 0, transform: `translate(0px, ${(-140 * e16).toFixed(2)}px) scale(${(1 - 0.5 * e16).toFixed(4)})`, transformOrigin: '640px 360px'}}>
          <CallWin N={N} glowK={glowK} />
        </div>

        {/* 窗口下沿 → 主线的竖接（"同一台机器"的连线感） */}
        {stubP > 0 ? <div style={{...abs(638.5, 325, 3, 105 * stubP), background: WHITE, filter: BLOOM}} /> : null}
        {/* 水平主线 draw-on */}
        {lineP > 0 ? <div style={{...abs(120, LINE_Y - 1.5, 1040 * lineP, 3), background: WHITE, filter: BLOOM}} /> : null}

        {/* 上股：语音橙点（每 6 帧一枚落下 → 72 帧周期跑灯；尾段跑灯波幅收敛） */}
        {Array.from({length: DOT_N}, (_, i) => {
          const dn = N - (T_DOTS + i * 6);
          if (dn < 0) return null;
          const drop = 12 * powOutRemain(dn, 5, 2.5);
          const op = softOp(dn, 6) * dimDot;
          let hot = 0;
          if (N >= WAVE_T) {
            const ph = (N - WAVE_T) % WAVE_LEN;
            hot = Math.max(0, 1 - Math.abs(ph - i * 6) / 4) * dimHot;
          }
          const rr = 6.5 + 2 * hot;
          return (
            <div key={`dot${i}`} style={{position: 'absolute', left: DOT_X0 + i * DOT_SP - rr, top: DOT_CY - rr - drop, width: 2 * rr, height: 2 * rr, borderRadius: rr, background: ORANGE, opacity: op * (0.72 + 0.28 * hot), boxShadow: hot > 0.3 ? `0 0 ${Math.round(10 * hot)}px ${Math.round(3 * hot)}px rgba(240,95,65,.75)` : undefined}} />
          );
        })}

        {/* 下股：照片信封队列（2 帧错峰 SoftIn → 2.5px/帧右行；尾段降调退层，持续动作保留） */}
        {Array.from({length: ENV_N}, (_, i) => {
          const t0 = T_ENV + i * 2;
          const u = ENV_X0 + i * ENV_SP + 2.5 * Math.max(0, N - t0);
          const uu = ENV_X0 + ((u - ENV_X0) % (ENV_X1 - ENV_X0));
          const eop = softOp(N - t0, 8) * clamp01((uu - ENV_X0) / 18) * clamp01((ENV_X1 - uu) / 18) * dimEnv;
          if (eop <= 0.01) return null;
          return <PacketIcon key={`env${i}`} cx={uu} cy={ENV_CY} opacity={eop} />;
        })}

        {/* 大字：not the same way（白 900 + 紫描边 + 紫柔光；缩放入场） */}
        {tn >= 0 ? (
          <div style={{position: 'absolute', inset: 0, opacity: txtOp, transform: `scale(${txtS.toFixed(4)})`, transformOrigin: '640px 366px'}}>
            <CText cx={640} cy={366} size={64} weight={900} color={WHITE} letterSpacing={1} style={{WebkitTextStroke: `2.5px ${PURPLE}`, paintOrder: 'stroke fill', textShadow: txtGlow}}>
              not the same way
            </CText>
          </div>
        ) : null}
      </div>
    </CameraRig>
  );
};
