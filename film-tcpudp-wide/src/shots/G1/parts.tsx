import React from 'react';
import {clamp01, easeInOutPow, powOutRemain} from '../../common';
import {CallWindow, PacketIcon, EXAMPLE, ORANGE, GREY_MID, WHITE, abs, softOp, firstOp} from '../../ui';
import {HeroGlow} from '../../fx';

/**
 * G1 共用件（SC01–SC05）：
 *  - CallWin：通话窗口 + 发照片动效（SC01 主角 / SC02 承接缩微共用，镜头边界零跳变）
 *  - MiniWire：缩微流量线（SC05 底部，SC02 双股流量的 0.45× 缩微承接）
 * 时序常量全部为绝对帧号 N 的纯函数。
 */

/** SC01 通话窗口基准位（分镜表：x 300–980, y 150–570） */
export const CALL_WIN = {x: 300, y: 150, w: 680, h: 420};
/** 照片环形进度起始（S01 第二块 145「and mid-sentence, you send a photo.」） */
export const T_RING = 145;
export const RING_LEN = 24;
/** 进度转满 → 照片卡起飞（发送感），原地留虚线空槽 */
export const T_SEND = 170;

/** 头像光环呼吸（30 帧周期；SC01/SC02 用同一函数保证边界连续） */
export const haloAt = (N: number) => 0.5 + 0.5 * Math.sin((2 * Math.PI * N) / 30);

/**
 * 通话窗口（含发照片动效）。SC01 全尺寸主角（HeroGlow），SC02 承接时通过外层 transform 缩微、
 * glowK 渐灭（配角不发光）。SC36（G7）复用同一 CallWindow 图元保证一致。
 */
export const CallWin: React.FC<{N: number; x?: number; y?: number; w?: number; h?: number; glowK?: number; opacity?: number}> = ({N, x = CALL_WIN.x, y = CALL_WIN.y, w = CALL_WIN.w, h = CALL_WIN.h, glowK = 1, opacity = 1}) => {
  const ring = clamp01((N - T_RING) / RING_LEN); // <1 显示环形进度，=1 隐藏
  // 发送：照片卡自缩略位飞向窗口右缘并缩小淡出（22 帧）
  const fn = N - T_SEND;
  const fe = easeInOutPow(2.5)(clamp01(fn / 18));
  const flyOp = fn < 0 || fn > 22 ? 0 : fn > 14 ? 1 - (fn - 14) / 8 : softOp(fn, 5);
  const patchOp = softOp(fn, 6);
  const thumbX = x + w - 152, thumbY = y + h - 132;
  return (
    <>
      {glowK > 0.01 ? <HeroGlow x={x} y={y} w={w} h={h} r={14} N={N} k={glowK} /> : null}
      <CallWindow x={x} y={y} w={w} h={h} timer={EXAMPLE.timer} progress={ring} haloP={haloAt(N)} opacity={opacity} />
      {/* 照片飞走后的虚线空槽（灰，配角） */}
      {patchOp > 0 ? <div style={{...abs(thumbX, thumbY, 108, 84), boxSizing: 'border-box', background: '#000', border: `2px dashed ${GREY_MID}`, borderRadius: 6, opacity: patchOp * opacity}} /> : null}
      {/* 飞行中的照片卡 */}
      {flyOp > 0 ? (
        <div style={{...abs(thumbX + 70 * fe, thumbY - 46 * fe, 108, 84), opacity: flyOp * opacity, transform: `scale(${(1 - 0.45 * fe).toFixed(3)})`, transformOrigin: '50% 50%'}}>
          <div style={{position: 'absolute', inset: 0, border: `2.5px solid ${WHITE}`, background: '#000'}} />
          <svg width="108" height="84" viewBox="0 0 108 84" style={{position: 'absolute', inset: 0}}>
            <path d="M 12 66 L 40 38 L 60 56 L 78 40 L 98 62" fill="none" stroke={GREY_MID} strokeWidth="2.5" />
            <circle cx="84" cy="22" r="7" fill="none" stroke={GREY_MID} strokeWidth="2.5" />
          </svg>
        </div>
      ) : null}
    </>
  );
};

/**
 * 缩微流量线（SC05 底部 y500–560 承接）：白细线 + 上排语音橙点 + 下排照片信封，1.3px/帧持续右行。
 * 组透明度 0.8（配角，不发光）。
 */
export const MiniWire: React.FC<{N: number; y?: number; t0?: number; opacity?: number}> = ({N, y = 530, t0 = 952, opacity = 0.8}) => {
  const X0 = 380, X1 = 900, SPAN = X1 - X0;
  const dots = [];
  for (let i = 0; i < 7; i++) {
    const u = X0 + ((i * (SPAN / 7) + 1.3 * Math.max(0, N - t0)) % SPAN);
    const op = clamp01((u - X0) / 34) * clamp01((X1 - u) / 34);
    if (op <= 0.01) continue;
    dots.push(<div key={`d${i}`} style={{position: 'absolute', left: u - 4, top: y - 14, width: 8, height: 8, borderRadius: 4, background: ORANGE, opacity: 0.75 * op}} />);
  }
  const envs = [];
  for (let i = 0; i < 5; i++) {
    const u = X0 + ((i * (SPAN / 5) + 1.3 * Math.max(0, N - t0)) % SPAN);
    const op = clamp01((u - X0) / 34) * clamp01((X1 - u) / 34);
    if (op <= 0.01) continue;
    envs.push(<PacketIcon key={`e${i}`} cx={u} cy={y + 16} w={32} h={22} opacity={op} />);
  }
  return (
    <div style={{position: 'absolute', inset: 0, opacity}}>
      <div style={{position: 'absolute', left: X0, top: y - 1, width: SPAN, height: 2, background: WHITE, opacity: 0.5}} />
      {dots}
      {envs}
    </div>
  );
};

/** 首帧即有亮度的淡入 + 上滑（SC05 缩微线入场用） */
export const riseIn = (n: number, dy = 24, len = 16) => ({dy: dy * powOutRemain(n, len, 2.5), op: firstOp(n, 6)});
