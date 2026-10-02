import React from 'react';
import {useCurrentFrame} from 'remotion';
import {GlitchIn, clamp01, emphasisPulse, powOutRemain, FONT_MONO, FONT_ORB, FONT_WIDE, fitSize, EM_WIDE} from '../../common';
import {Box, Pill, CText, PersonIcon, PacketIcon, EXAMPLE, BLOOM, BLOOM_SOFT, GREY, GREY_LINE, GREY_LIGHT, GREY_MID, ORANGE, PURPLE, PURPLE_DEEP, PURPLE_LIGHT, WHITE, abs, softOp, firstOp, scaleIn, exitOp, glowOffK} from '../../ui';

/**
 * SC01 钩子：两种规则 · N 33–189（S01 41–187 ¶；块 41/82/127）
 * 版式（竖版安全区 y240–990 / x40–620，中轴 360）：
 *   竖屏手机 mock x150–570 y240–760（白边 3px r40，主角 520px 高，BLOOM）：
 *   屏内 = 顶部 call.example 标签 + Orbitron 计时 04:12 + 居中大圆头像（紫光环 30 帧呼吸）+
 *   右下照片缩略卡 120×90（环形进度 20 帧转满）；
 *   手机下"同一条线"：y840 粗线 4px draw-on（x100–620，分镜表原 x60–660 超右侧安全界，居中收窄到 520 宽）；
 *   线上叠两行标签：voice（橙 Pill，上）与 photo（白 Pill，下），橙点（左→右）与白信封（右→左）沿线反向滑动（持续动作）；
 *   底部大字 TWO RULES（Audiowide，紫描边 + 紫柔光 + 硬投影）。
 * 节拍：41 手机 21 帧缩放入（前挂到 35 = −6）；82 线 draw-on 16 帧 + 两 Pill 2 帧错峰 SoftIn；
 *   127 TWO RULES GlitchIn（本镜唯一 glitch，rgbSplit 8）+ emphasisPulse（129 起，短 15 帧）+ 白闪 3 帧（141–143）；
 *   大字入位后头像光环减半（重点转移）。
 * 离场：末 8 帧归零（182–189，¶）；大字紫光先灭（glowOffK）。
 * 停留：白闪/脉冲收尾 ≈144 → 离场 182，≥30 帧 ✓（分镜表按 127+22=149 计 32 帧）。
 * 注：TWO RULES 按安全宽 505 fitSize（Audiowide 110px 满尺寸约 760px 宽，竖版安全区单行放不下；
 *   墨迹中心 y958，底部 ≈988，避开字幕带 y1002+，分镜表原 y940–1010 上移 18px，见 BUILD_NOTES）。
 */
const F0 = 33;
const TO = 189;

const T_PHONE = 33, T_RING = 46, RING_LEN = 20;
const T_LINE = 82, LINE_LEN = 16, T_PILL2 = 84;
const T_MOVE = 96;
const T_TXT = 127, T_PULSE = 129, T_FLASH = 141;

const PH = {x: 150, y: 240, w: 420, h: 520}; // 手机 mock（分镜表原值）
const LINE = {y: 840, x0: 100, x1: 620}; // 同一条线（安全区内居中 520 宽）

/** 头像光环呼吸（30 帧周期）；127 大字入位后重点转移 → 光环强度减半 */
const haloAt = (N: number) => (0.5 + 0.5 * Math.sin((2 * Math.PI * N) / 30)) * (1 - 0.55 * clamp01((N - T_TXT) / 10));

export const SC01: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const n = N - F0;
  const exOp = exitOp(N, TO, 8);
  if (exOp <= 0) return null;

  // 手机 21 帧缩放入（0.2→1）
  const pn = N - T_PHONE;
  const phS = 0.2 + 0.8 * scaleIn(pn, 21);
  const phOp = firstOp(pn, 6);

  // 照片环形进度（20 帧转满）
  const ringP = clamp01((N - T_RING) / RING_LEN);
  // 线 draw-on（16 帧 L→R）
  const lineP = clamp01((N - T_LINE) / LINE_LEN);
  // 线上反向滑动的橙点 / 白信封（循环补位）
  const dotX = LINE.x0 + (((N - T_MOVE) * 3.4) % (LINE.x1 - LINE.x0));
  const dotOp = softOp(N - T_MOVE, 6) * clamp01((dotX - LINE.x0) / 26) * clamp01((LINE.x1 - dotX) / 26);
  const envX = LINE.x1 - (((N - T_MOVE - 4) * 2.6) % (LINE.x1 - LINE.x0));
  const envOp = softOp(N - T_MOVE - 4, 6) * clamp01((LINE.x1 - envX) / 26) * clamp01((envX - LINE.x0) / 26);

  // 大字：脉冲（短 15 帧，收尾不挤末拍稳定期）+ 白闪 3 帧 + 紫光（离场前先灭）
  const txtS = emphasisPulse(N - T_PULSE, {peak: 1.05, up: 8, hold: 2, down: 5});
  const flash = N >= T_FLASH && N < T_FLASH + 3 ? [1.55, 1.3, 1.12][N - T_FLASH] : 1;
  const gK = glowOffK(N, TO, 6, 8);
  // 竖版安全宽：中轴 360 下单行可用宽 ≈500（x40–620 减 glitch 错位 8px + 柔光余量），
  // fitSize 高估值（EM_WIDE 1.18）→ 实际墨迹 ≈485px，x[118,602]；分镜表 110px 在竖版安全区单行放不下（见 BUILD_NOTES）
  const bigSize = fitSize('TWO RULES', 500, 110, 72, EM_WIDE, 2);

  return (
    <div style={{position: 'absolute', inset: 0, opacity: exOp}}>
      {/* ---- 手机 mock（主角 520px，BLOOM）---- */}
      <div style={{position: 'absolute', inset: 0, opacity: phOp, transform: `scale(${phS.toFixed(4)})`, transformOrigin: '360px 500px'}}>
        <Box x={PH.x} y={PH.y} w={PH.w} h={PH.h} r={40} sw={3} stroke={WHITE} style={{filter: BLOOM}} />
        {/* 听筒 */}
        <div style={{...abs(330, 254, 60, 7), borderRadius: 3.5, background: GREY_MID, opacity: 0.8}} />
        {/* 顶部：call 标签 + 计时 */}
        <CText cx={360} cy={290} size={24} weight={500} family={FONT_MONO} color={GREY}>{EXAMPLE.call}</CText>
        <CText cx={360} cy={328} size={32} weight={700} family={FONT_ORB} color={WHITE} letterSpacing={2} style={{fontVariantNumeric: 'tabular-nums'}}>{EXAMPLE.timer}</CText>
        <div style={{...abs(200, 352, 320, 2), background: GREY_LINE, opacity: 0.8}} />
        {/* 居中大圆头像（紫光环呼吸 = 持续动作） */}
        <div style={{...abs(360 - 105, 505 - 105, 210, 210), borderRadius: '50%', border: `3px solid ${WHITE}`, background: '#000', boxShadow: `0 0 ${10 + 16 * haloAt(N)}px ${3 + 5 * haloAt(N)}px rgba(102,48,248,${(0.25 + 0.3 * haloAt(N)).toFixed(3)})`}}>
          <PersonIcon cx={105} cy={116} size={150} opacity={0.92} />
        </div>
        {/* 右下照片缩略卡（120×90 + 环形进度） */}
        <div style={{...abs(414, 620, 120, 90)}}>
          <div style={{position: 'absolute', inset: 0, border: `2.5px solid ${WHITE}`, background: '#000'}} />
          <svg width={120} height={90} viewBox="0 0 120 90" style={{position: 'absolute', inset: 0}}>
            <path d="M 14 70 L 42 42 L 64 60 L 84 44 L 106 66" fill="none" stroke={GREY_LIGHT} strokeWidth={2.5} />
            <circle cx={92} cy={24} r={8} fill="none" stroke={GREY_LIGHT} strokeWidth={2.5} />
          </svg>
          {ringP < 1 ? (
            <svg width={120} height={90} viewBox="0 0 120 90" style={{position: 'absolute', inset: 0}}>
              <rect x={2} y={2} width={116} height={86} rx={5} fill="none" stroke={PURPLE_LIGHT} strokeWidth={4}
                strokeDasharray={`${(116 + 86) * 2 - 8} ${(116 + 86) * 2}`}
                strokeDashoffset={(116 + 86) * 2 * (1 - ringP)} />
            </svg>
          ) : null}
        </div>
      </div>

      {/* ---- 同一条线（draw-on L→R）---- */}
      {lineP > 0 ? <div style={{...abs(LINE.x0, LINE.y - 2, (LINE.x1 - LINE.x0) * lineP, 4), background: WHITE, filter: BLOOM}} /> : null}

      {/* 线上反向滑动的两枚小图标（持续动作，画在 Pill 之下 → 从 Pill 背后穿过） */}
      {dotOp > 0.01 ? <div style={{...abs(dotX - 8, LINE.y - 8, 16, 16), borderRadius: 8, background: ORANGE, opacity: dotOp}} /> : null}
      {envOp > 0.01 ? <PacketIcon cx={envX} cy={LINE.y} w={46} h={32} opacity={envOp} /> : null}

      {/* 两行标签（voice 橙上 / photo 白下，叠在线上） */}
      <div style={{position: 'absolute', inset: 0, opacity: softOp(N - T_LINE, 8)}}>
        <Pill x={167} y={805} w={136} h={50} fill={ORANGE} stroke={WHITE} sw={2} text="voice" fontSize={27} weight={700} color={WHITE} letterSpacing={1} />
      </div>
      <div style={{position: 'absolute', inset: 0, opacity: softOp(N - T_PILL2, 8)}}>
        <Pill x={419} y={827} w={132} h={50} fill="#000" stroke={WHITE} sw={2.5} text="photo" fontSize={27} weight={700} color={WHITE} letterSpacing={1} />
      </div>

      {/* ---- 底部大字 TWO RULES（GlitchIn + 脉冲 + 白闪）---- */}
      <GlitchIn N={N} f0={T_TXT} rgbSplit={8} seed={5}>
        <div style={{position: 'absolute', inset: 0, transform: `scale(${txtS.toFixed(4)})`, transformOrigin: '360px 958px', filter: flash > 1 ? `brightness(${flash})` : undefined}}>
          <CText cx={360} cy={958} size={bigSize} weight={400} family={FONT_WIDE} color={WHITE} letterSpacing={2}
            style={{WebkitTextStroke: `2.5px ${PURPLE}`, paintOrder: 'stroke fill', textShadow: `4px 4px 0 ${PURPLE_DEEP}, 0 0 16px rgba(102,45,248,${(0.55 * gK).toFixed(3)})`}}>
            TWO RULES
          </CText>
        </div>
      </GlitchIn>
    </div>
  );
};
