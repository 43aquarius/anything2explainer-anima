import React from 'react';
import {clamp01, FONT_MONO} from '../../common';
import {Box, Pill, RackIcon, EXAMPLE, GREEN, GREY_LIGHT, ORANGE, PURPLE_LIGHT, WHITE, abs} from '../../ui';

/**
 * G1 组内共用件（竖版）：
 *  · ServerLogCard — SC02 的服务器日志卡（4 行逐行 wipe + 第 4 行 `60 ms` 样式注入 + rack 指示灯循环闪）。
 *  · DissectEnvelope — SC03 的解剖信封（header/payload 虚线分隔带 + 紫光）。
 * `60 ms` 的样式由调用方注入（ms60Style）：SC02 传 glitch 12 帧模板 + 橙光（glitchOpacity 调用留在 SC02.tsx，selfcheck 白名单对账用）。
 */

/** SC02 日志卡几何（竖版：x110 y680 w500 h240；SC02 内 slideUp Δ60 入场，卡底峰值 ≤980 不穿字幕带） */
export const LOG = {x: 110, y: 680, w: 500, h: 240};
/** 行首 y（卡内局部坐标，4 行） */
const ROW_Y = [62, 102, 142, 182];
/** 'POST /checkout 200 · '（EXAMPLE.logLine 去掉尾部 60 ms） */
export const LOG_PREFIX = EXAMPLE.logLine.slice(0, EXAMPLE.logLine.indexOf(EXAMPLE.requestMs));
/** 行 wipe 起始帧（154 卡入场后 3 帧一行） */
const T_ROW = 156;
/** rack：卡右上角半压边（局部坐标） */
const RACK = {cx: 448, cy: 26, w: 74, h: 118};

export const ServerLogCard: React.FC<{N: number; ms60Style?: React.CSSProperties; opacity?: number}> = ({N, ms60Style, opacity = 1}) => {
  // rack 指示灯：3→4→5 循环（每 9 帧一步，持续动作）
  const lit = 3 + (Math.floor(Math.max(0, N - 160) / 9) % 3);
  return (
    <div style={{...abs(0, 0, LOG.w, LOG.h), opacity}}>
      <Box x={0} y={0} w={LOG.w} h={LOG.h} r={12} sw={3} />
      {/* 标题 Pill（压顶边，与横版同款） */}
      <Pill x={24} y={-17} w={176} h={34} fill={PURPLE_LIGHT} sw={2} text="server log" fontSize={21} family={FONT_MONO} weight={700} letterSpacing={0} />
      <div style={{...abs(24, 38, LOG.w - 48, 2), background: '#4A4A4A'}} />
      {ROW_Y.map((y, i) => {
        // 前三行：逐行 wipe（156+3i 起 10 帧 clip 自左向右）；第 4 行同 wipe，其 `60 ms` 由 ms60Style 注入（SC02 在 180 glitch 入）
        const p = clamp01((N - (T_ROW + 3 * i)) / 10);
        if (p <= 0) return null;
        return (
          <div key={i} style={{...abs(24, y), display: 'flex', alignItems: 'center', gap: 12, clipPath: `inset(0 ${(1 - p) * 100}% 0 0)`}}>
            <div style={{width: 10, height: 10, borderRadius: 5, background: GREEN, opacity: 0.85}} />
            <span style={{fontFamily: FONT_MONO, fontSize: 23, color: WHITE, lineHeight: 1, whiteSpace: 'nowrap'}}>
              {LOG_PREFIX}
              {ms60Style && i === 3 ? (
                <span style={{display: 'inline-block', ...ms60Style}}>{EXAMPLE.requestMs}</span>
              ) : (
                <span style={{color: ORANGE}}>{EXAMPLE.requestMs}</span>
              )}
            </span>
          </div>
        );
      })}
      <RackIcon cx={RACK.cx} cy={RACK.cy} w={RACK.w} h={RACK.h} units={5} lit={lit} />
    </div>
  );
};

/**
 * SC03 解剖信封（主角）：白描边黑底 + 底部折角 V（半透明）+ 顶部 header 带（地址短线）+ 虚线分隔（sepP draw-on）
 * + payload 带（信纸三线）。紫光由调用方以 filter 包裹（glowK）。
 */
export const DissectEnvelope: React.FC<{cx: number; cy: number; w: number; h: number; sepP?: number; opacity?: number}> = ({cx, cy, w, h, sepP = 0, opacity = 1}) => {
  const sepY = Math.round(h * 0.37); // header 带高度
  return (
    <div style={{...abs(cx - w / 2, cy - h / 2, w, h), opacity}}>
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
        <rect x={1.5} y={1.5} width={w - 3} height={h - 3} rx={8} fill="#000" stroke={WHITE} strokeWidth={3} />
        {/* 底部折角 V（信封母题，半透明让位解剖内容） */}
        <path d={`M5,${h - 5} L${w / 2},${Math.round(h * 0.44)} L${w - 5},${h - 5}`} fill="none" stroke={WHITE} strokeWidth={2.5} strokeLinejoin="round" opacity={0.5} />
        {/* header 带：两根地址短线 */}
        <rect x={22} y={Math.round(sepY * 0.38)} width={Math.round(w * 0.55)} height={5} fill={GREY_LIGHT} opacity={0.8} />
        <rect x={22} y={Math.round(sepY * 0.72)} width={Math.round(w * 0.36)} height={5} fill={GREY_LIGHT} opacity={0.8} />
        {/* 信纸三线（payload） */}
        <rect x={Math.round(w * 0.32)} y={Math.round(sepY + h * 0.14)} width={Math.round(w * 0.56)} height={5} fill={GREY_LIGHT} opacity={0.55} />
        <rect x={Math.round(w * 0.32)} y={Math.round(sepY + h * 0.32)} width={Math.round(w * 0.44)} height={5} fill={GREY_LIGHT} opacity={0.55} />
        <rect x={Math.round(w * 0.32)} y={Math.round(sepY + h * 0.5)} width={Math.round(w * 0.32)} height={5} fill={GREY_LIGHT} opacity={0.55} />
      </svg>
      {/* 虚线分隔（header | payload）：宽度 draw-on */}
      {sepP > 0 ? (
        <div style={{position: 'absolute', left: 6, top: sepY, width: (w - 12) * clamp01(sepP), height: 0, borderTop: `2.5px dashed ${PURPLE_LIGHT}`}} />
      ) : null}
    </div>
  );
};
