import React from 'react';
import {clamp01, kf, easeInOutPow} from '../../common';
import {Check, EXAMPLE, GREEN, MonoText, PURPLE_LIGHT, WHITE, abs} from '../../ui';
import {HeroGlow} from '../../fx';

/**
 * G4 共用：写好地址的信封（SC15 主角 ↔ SC16 承接到 stub 节点，共用同一组件同一 N 驱动状态 → 交界帧像素一致）。
 * 全部状态由绝对帧号 N 驱动；SC15/SC16 都直接 <AddressedEnvelope N={N}/>。
 * 基准几何沿用 SC04 巨信封 ×0.9：390×290，地址虚线框 / 封口折线 / 绿邮戳同风格。
 */

// ---- 基准几何（SC15 满态）----
export const ENV = {w: 390, h: 290, cx: 640, cy: 385};
/** SC16 承接目标：stub 浏览器节点 */
export const STUB = {cx: 160, cy: 374, scale: 0.16};

/** 准备出发的轻轻上浮（SC15 3648 起，幅 4px、周期 96f；SC16 停落后冻结） */
export const envFloatY = (N: number): number => {
  if (N < 3648) return 0;
  const ramp = clamp01((N - 3648) / 12);
  return -4 * 0.5 * (1 - Math.cos((2 * Math.PI * (N - 3648)) / 96)) * ramp;
};

/** 信封位姿：SC15 入场（3565 slideUp Δ110/22f）→ 停留 → SC16 承接（3692–3708, 16f 缩移到 stub） */
export const envState = (N: number) => {
  if (N < 3692) {
    const t = clamp01((N - 3565) / 22);
    const entry = N >= 3565 ? 110 * Math.pow(1 - t, 2.5) : 999;
    const op = N >= 3565 ? kf(N, [[3565, 0.25], [3571, 1]]) : 0;
    return {cx: ENV.cx, cy: ENV.cy + (entry > 900 ? 0 : entry) + envFloatY(N), scale: 1, opacity: op};
  }
  const t = easeInOutPow(2.5)(clamp01((N - 3692) / 16));
  const y0 = ENV.cy + envFloatY(3692);
  return {cx: ENV.cx + (STUB.cx - ENV.cx) * t, cy: y0 + (STUB.cy - y0) * t, scale: 1 + (STUB.scale - 1) * t, opacity: 1};
};

/** 信封内容状态：IP 落位（3587）/ 邮戳+封口（3632）/ HeroGlow 增强 1.3×（SC16 承接时收回 0.35） */
export const envContent = (N: number) => {
  const g = 1 + 0.3 * clamp01((N - 3632) / 8);
  const park = N >= 3692 ? 1 - 0.73 * clamp01((N - 3692) / 16) : 1;
  return {
    addrK: N >= 3587 ? clamp01((N - 3586) / 3) : 0,
    stampK: clamp01((N - 3632) / 8),
    checkP: clamp01((N - 3636) / 12),
    flapK: clamp01((N - 3632) / 12),
    glowK: g * park,
  };
};

/** 写好地址的信封（纯 N 驱动；两个镜头共用，交界帧连续） */
export const AddressedEnvelope: React.FC<{N: number}> = ({N}) => {
  const s = envState(N);
  const c = envContent(N);
  if (s.opacity <= 0) return null;
  const FLAP_LEN = 196;
  return (
    <div style={{position: 'absolute', left: s.cx, top: s.cy, width: ENV.w, height: ENV.h, transform: `translate(-50%,-50%) scale(${s.scale.toFixed(4)})`, opacity: s.opacity}}>
      {/* 主角光：HeroGlow 双层紫柔光 + 30f 呼吸 */}
      <HeroGlow x={-10} y={-10} w={ENV.w + 20} h={ENV.h + 20} r={14} N={N} k={c.glowK} />
      <svg width={ENV.w} height={ENV.h} viewBox={`0 0 ${ENV.w} ${ENV.h}`} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible', filter: 'drop-shadow(0 0 2px rgba(255,255,255,.35))'}}>
        <rect x={3} y={3} width={ENV.w - 6} height={ENV.h - 6} rx={10} fill="#000" stroke={WHITE} strokeWidth={3} />
        {/* 封口折线（3632 起 draw-on 闭合，白） */}
        {c.flapK > 0 && (
          <path d={`M9,80 L195,136 M381,80 L195,136`} fill="none" stroke={WHITE} strokeWidth={2.5} strokeLinecap="round"
            strokeDasharray={FLAP_LEN} strokeDashoffset={FLAP_LEN * (1 - c.flapK)} />
        )}
        {/* 地址虚线框（SC04 同款，紫虚线） */}
        <rect x={73} y={152} width={244} height={58} fill="none" stroke={PURPLE_LIGHT} strokeWidth={2.5} strokeDasharray="10 7" />
      </svg>
      {/* 地址：IP 数字（3587 落位后常驻） */}
      <div style={{...abs(73, 152, 244, 58), display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: c.addrK}}>
        <MonoText x={0} y={0} size={30} color={WHITE} style={{position: 'static', textShadow: '0 0 10px rgba(255,255,255,.45)'}}>{EXAMPLE.ip}</MonoText>
      </div>
      {/* 绿邮戳（3632 盖下：scale 1.4→1 + 轻微旋转） */}
      {c.stampK > 0 && (
        <div style={{position: 'absolute', left: 318, top: 58, width: 54, height: 54, transform: `rotate(${(-12 + 12 * c.stampK).toFixed(1)}deg) scale(${(1.4 - 0.4 * c.stampK).toFixed(3)})`, opacity: c.stampK}}>
          <svg width={54} height={54} viewBox="0 0 54 54" style={{filter: 'drop-shadow(0 0 8px rgba(143,247,64,.45))'}}>
            <circle cx={27} cy={27} r={24} fill="#000" stroke={GREEN} strokeWidth={2.5} />
            <circle cx={27} cy={27} r={19} fill="none" stroke={GREEN} strokeWidth={1} opacity={0.5} />
          </svg>
          <Check cx={27} cy={27} size={26} p={c.checkP} sw={5} color={GREEN} />
        </div>
      )}
    </div>
  );
};
