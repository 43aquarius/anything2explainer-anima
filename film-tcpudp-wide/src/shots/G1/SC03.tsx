import React from 'react';
import {useCurrentFrame} from 'remotion';
import {clamp01, powOutRemain} from '../../common';
import {PhotoCard, PacketIcon, EXAMPLE, BLOOM, GREY, WHITE, abs, softOp, exitOp} from '../../ui';

/**
 * SC03 真实的线 · N 422–623（S04 430–621 ¶）——真实素材镜头①
 * 版式：左侧真实海底光缆照片 PhotoCard（fiber_strip.jpg，x100–620 y180–540，白框 4px 圆角，
 *       出处行 photo: Wikimedia Commons · CC BY-SA 4.0 ≥75 帧 ≥50% α 常驻）；
 *       照片右缘引一条白线 (620–1160, y360) 过渡到代码世界；线上 64×44 白描边信封一枚枚出现，
 *       3px/帧持续右行、右端交付淡出/左端补位（6 枚循环）；右端点 `your friend · 203.0.113.10` 等宽 22px；
 *       照片内部紫色扫描线每 40 帧扫过一次（25% α，"线上有光在跑"）。
 * 节拍：426 照片卡自左滑入（Δ160、22 帧、前 6 帧渐入；430「Underneath every app」−4）；
 *       474 白线 draw-on 16 帧（「one delivery service」）；492 端点标签 SoftIn；
 *       547 起信封逐枚 SoftIn（2 帧错峰）后列队右行（「packets — small envelopes」）。
 * 运镜：无（分镜表 Ch1 清单 SC03 无运镜；持续动作 = 信封流 + 扫描线）。
 * 离场：¶ 段末，末 8 帧归零（616–623）。
 *
 * —— 成片 v1 修复（tcpudp-wide-fix-A）：末拍稳定期 hold=0f（成片复测 fin_frames 实测：信封流 6 枚 64×44 @3px/帧
 *    尾段 diff 恒 ≈1.9–2.0 ≥HOLD_THR=1.5，把稳定期压穿）。修法：末拍（流动信封）尾段退层——565–575 十帧内
 *    信封队列降调至 ×0.5（速度 3px/帧不变，持续动作保留；「小信封」句 547–621 中后段流量退层，
 *    白线+端点+照片仍满亮），收敛后尾段 diff ≈1.1 < 1.5，575–615 稳定期实测 ≥30f（见 BUILD_NOTES）。
 *    （主会话备选「整组 exit 后移」不可行：to=623 已是镜头末帧，改出口曲线只会吞掉稳定期，故取退层法。）
 */
const F0 = 422;
const TO = 623;

const T_CARD = 426, T_LINE = 474, T_LABEL = 492, T_ENV = 547;
const T_CALM = 565, CALM_LEN = 10, CALM_OP = 0.5; // 成片 v1：尾段信封流退层
const LINE_Y = 360;
const ENV_N = 6, ENV_SP = 90, ENV_X0 = 620, ENV_X1 = 1160, ENV_SPEED = 3;

export const SC03: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const cn = N - T_CARD;
  const exOp = exitOp(N, TO, 8);
  // 照片卡滑入
  const cardX = 100 - 160 * powOutRemain(cn, 22, 2.5);
  const cardOp = softOp(cn, 6);
  // 白线 draw-on
  const lineP = clamp01((N - T_LINE) / 16);
  // 扫描线（40 帧周期，卡落位后开始）
  const scanK = N < 450 ? 0 : ((N - 450) % 40) / 40;
  // 成片 v1：尾段信封流退层（×0.5，速度不变）
  const dimEnv = 1 - clamp01((N - T_CALM) / CALM_LEN) * (1 - CALM_OP);

  return (
    <div style={{position: 'absolute', inset: 0, opacity: exOp}}>
      {/* 真实照片卡（白框 + 暗调 + 出处行 + 紫扫描线） */}
      <div style={{...abs(cardX, 180, 520, 360), opacity: cardOp, filter: BLOOM}}>
        <PhotoCard x={0} y={0} w={520} h={360} src="fiber_strip.jpg" note="CC BY-SA 4.0" scanP={scanK} />
      </div>

      {/* 照片右缘 → 代码世界的白线 */}
      {lineP > 0 ? <div style={{...abs(620, LINE_Y - 1.5, 540 * lineP, 3), background: WHITE, filter: BLOOM}} /> : null}

      {/* 右端点：your friend */}
      {N >= T_LABEL ? (
        <div style={{position: 'absolute', inset: 0, opacity: softOp(N - T_LABEL, 8)}}>
          <div style={{position: 'absolute', left: 1154, top: LINE_Y - 6, width: 12, height: 12, borderRadius: 6, background: WHITE, filter: BLOOM}} />
          <div style={{position: 'absolute', left: 700, top: 386, width: 460, textAlign: 'right', fontFamily: 'SF Mono, Menlo, Consolas, monospace', fontSize: 22, color: GREY, lineHeight: 1.2, whiteSpace: 'pre'}}>
            {`your friend · ${EXAMPLE.serverIp}`}
          </div>
        </div>
      ) : null}

      {/* 线上信封队列（2 帧错峰 SoftIn → 3px/帧右行；尾段降调退层，持续动作保留） */}
      {Array.from({length: ENV_N}, (_, i) => {
        const t0 = T_ENV + i * 2;
        const u = ENV_X0 + i * ENV_SP + ENV_SPEED * Math.max(0, N - t0);
        const uu = ENV_X0 + ((u - ENV_X0) % (ENV_X1 - ENV_X0));
        const eop = softOp(N - t0, 6) * clamp01((uu - ENV_X0) / 15) * clamp01((ENV_X1 - uu) / 15) * dimEnv;
        if (eop <= 0.01) return null;
        return <PacketIcon key={`env${i}`} cx={uu} cy={LINE_Y} opacity={eop} />;
      })}
    </div>
  );
};
