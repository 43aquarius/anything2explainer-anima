import React from 'react';
import {clamp01, FONT_MONO} from '../../common';
import {Box, Pill, RackIcon, EXAMPLE, GREEN, GREY, GREY_LINE, ORANGE, PURPLE, PURPLE_LIGHT, WHITE, abs} from '../../ui';
import {HeroGlow} from '../../fx';

/**
 * G1 组内共用件：SC02 的服务器日志卡（ServerLogCard）。
 * SC03 承接缩移时以**同组件同参数**复用（N 用绝对帧号驱动内部状态，交界帧像素一致）：
 * 行 wipe / 第 4 行打字机 / rack 指示灯闪烁都是 N 的纯函数，在 SC03（N≥353）里全部处于"已落定"态并继续闪。
 * `60 ms` 的样式由调用方注入（ms60Style）：SC02 传 glitch 12 帧模板 + 橙光（glitchOpacity 调用留在 SC02.tsx，selfcheck 白名单对账用）；
 * SC03 传静态橙色。前三行的 `60 ms` 恒为橙色静态（分镜表：60 ms 用 ORANGE，指标色）。
 */

/** 卡的基准几何（SC02 全尺寸位置；SC03 包一层 translate+scale 缩移） */
export const LOG = {x: 340, y: 200, w: 600, h: 320};
/** 行首 y（卡内局部坐标） */
const ROW_Y = [50, 112, 174, 236];
/** 'POST /checkout 200 · '（EXAMPLE.logLine 去掉尾部 60 ms） */
export const LOG_PREFIX = EXAMPLE.logLine.slice(0, EXAMPLE.logLine.indexOf(EXAMPLE.requestMs));
/** rack：卡右上角半压边（局部坐标；全局 = (880, 230)） */
const RACK = {cx: 540, cy: 30, w: 90, h: 145};

export const ServerLogCard: React.FC<{N: number; ms60Style?: React.CSSProperties; opacity?: number; glowK?: number}> = ({N, ms60Style, opacity = 1, glowK = 0}) => {
  // rack 指示灯：3→4→5 循环（每 9 帧一步，持续动作）
  const lit = 3 + (Math.floor(Math.max(0, N - 218) / 9) % 3);
  // 第 4 行打字机（每 2 帧 1 字，253 起 295 满；N≥353 时恒满）
  const typed = LOG_PREFIX.slice(0, Math.max(0, Math.min(LOG_PREFIX.length, Math.floor((N - 253) / 2))));
  return (
    <div style={{...abs(0, 0, LOG.w, LOG.h), opacity}}>
      {glowK > 0.01 ? <HeroGlow x={0} y={0} w={LOG.w} h={LOG.h} r={12} N={N} k={glowK} color={PURPLE_LIGHT} /> : null}
      <Box x={0} y={0} w={LOG.w} h={LOG.h} r={12} sw={3} />
      {/* 标题 Pill（CodeCard 风，压顶边） */}
      <Pill x={24} y={-17} w={176} h={34} fill={PURPLE} sw={2} text="server log" fontSize={22} family={FONT_MONO} weight={700} letterSpacing={0} />
      <div style={{...abs(24, 40, LOG.w - 48, 2), background: GREY_LINE}} />
      {ROW_Y.map((y, i) => {
        if (i < 3) {
          // 前三行：逐行 wipe（219/221/223 起 10 帧 clip 自左向右）
          const p = clamp01((N - (219 + 2 * i)) / 10);
          if (p <= 0) return null;
          return (
            <div key={i} style={{...abs(24, y), display: 'flex', alignItems: 'center', gap: 14, clipPath: `inset(0 ${(1 - p) * 100}% 0 0)`}}>
              <div style={{width: 10, height: 10, borderRadius: 5, background: GREEN, opacity: 0.85}} />
              <span style={{fontFamily: FONT_MONO, fontSize: 24, color: WHITE, lineHeight: 1, whiteSpace: 'nowrap'}}>
                {LOG_PREFIX}
                <span style={{color: ORANGE}}>{EXAMPLE.requestMs}</span>
              </span>
            </div>
          );
        }
        // 第 4 行：253 打字机；296 起 60 ms（样式注入）
        return (
          <div key={i} style={{...abs(24, y), display: 'flex', alignItems: 'center', gap: 14, opacity: N >= 253 ? 1 : 0}}>
            <div style={{width: 10, height: 10, borderRadius: 5, background: GREEN, opacity: 0.85}} />
            <span style={{fontFamily: FONT_MONO, fontSize: 24, color: WHITE, lineHeight: 1, whiteSpace: 'nowrap'}}>
              {typed}
              {N >= 296 ? (
                <span style={{display: 'inline-block', ...ms60Style}}>{EXAMPLE.requestMs}</span>
              ) : null}
            </span>
          </div>
        );
      })}
      <RackIcon cx={RACK.cx} cy={RACK.cy} w={RACK.w} h={RACK.h} units={5} lit={lit} />
    </div>
  );
};
