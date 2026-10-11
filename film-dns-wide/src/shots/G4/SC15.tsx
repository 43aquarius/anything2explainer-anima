import React from 'react';
import {useCurrentFrame} from 'remotion';
import {clamp01, kf} from '../../common';
import {BrowserWin, EXAMPLE, GREY, WHITE, PURPLE, PURPLE_LIGHT, exitOp, GLOW_PURPLE_S} from '../../ui';
import {HeroGlow} from '../../fx';

const F0 = 3557, T = 3683; // SC15: 3557–3683（S25：信封得到地址）

export const SC15: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const exitK = N > T - 8 ? exitOp(N, T) : 1;
  // 信封承接入场（3557 slideUp Δ90）
  const envY = kf(N, [[3557, 90], [3579, 0]], (u) => Math.pow(1 - u, 2.5));
  // IP 数字飞入地址框（3565，kf 20 帧）
  const fly = N >= 3565 ? clamp01((N - 3565) / 20) : 0;
  const stampK = clamp01((N - 3585) / 14);
  const sealK = clamp01((N - 3600) / 12);
  // 邮戳盖下（3585+）
  const stampScale = 1 + (1 - stampK) * 0.4;
  // 浏览器骨架开始亮（3632）
  const lit = N >= 3632;
  // 上浮循环（出发感，3632 起）—— 3652 冻结
  const hover = N >= 3632 && N < 3652 ? -4 * clamp01((N - 3632) / 20) : (N >= 3652 ? -4 : 0);
  return (
    <div style={{position: 'absolute', inset: 0, opacity: exitK}}>
      {/* 主角：巨信封（写好地址） */}
      <div style={{position: 'absolute', left: 640, top: 340 + envY + hover, transform: 'translateX(-50%)'}}>
        <HeroGlow x={-210} y={-150} w={420} h={310} N={N} k={N > 3600 ? 1.3 : 1} />
        <svg width="420" height="300">
          <rect x="2" y="2" width="416" height="296" rx="10" fill="#000" stroke={WHITE} strokeWidth={3} />
          <line x1="10" y1="82" x2="210" y2="140" stroke={GREY} strokeWidth={2} />
          <line x1="410" y1="82" x2="210" y2="140" stroke={GREY} strokeWidth={2} />
          {/* 地址框（实线，IP 落位后） */}
          <rect x="76" y="160" width="268" height="60" fill="none" stroke={fly >= 1 ? PURPLE_LIGHT : GREY} strokeWidth={fly >= 1 ? 3 : 2.5} strokeDasharray={fly >= 1 ? undefined : '10 7'} />
          {/* 封口折线闭合 draw-on */}
          <line x1="196" y1="140" x2="224" y2="140" stroke={WHITE} strokeWidth={3} strokeDasharray={24} strokeDashoffset={24 - 24 * sealK} opacity={sealK > 0 ? 1 : 0} />
        </svg>
        {/* IP 数字飞入 */}
        {fly > 0 && (
          <div style={{position: 'absolute', left: 90 + (1 - fly) * 400, top: 172 - (1 - fly) * 80, opacity: 0.4 + fly * 0.6, fontFamily: "'Sarasa Mono SC', monospace", fontSize: fly >= 1 ? 30 : 40, color: WHITE, filter: fly >= 1 ? 'brightness(1.6)' : undefined}}>
            {EXAMPLE.ip}
          </div>
        )}
        {/* 绿色小邮戳 */}
        {sealK > 0 && (
          <div style={{position: 'absolute', left: 336, top: 92, transform: `scale(${stampScale}) rotate(-12deg)`, opacity: sealK}}>
            <svg width="56" height="56"><circle cx="28" cy="28" r="24" fill="none" stroke="#8FF740" strokeWidth="3"/><path d="M16 28 l8 8 l16 -18" fill="none" stroke="#8FF740" strokeWidth="4" strokeLinecap="round"/></svg>
          </div>
        )}
      </div>
      {/* 左下浏览器（骨架亮起） */}
      <div style={{position: 'absolute', left: 90, top: 500, opacity: 0.95}}>
        <BrowserWin x={0} y={0} w={210} h={160} skeleton={2} skelLit={lit ? 2 : 0} barP={lit ? 1 : 0.2} skelOpacity={N < 3660 ? 0.6 + 0.15 * Math.sin(N / 20 * Math.PI) : 0.62} />
      </div>
    </div>
  );
};
export const SC15_RANGE = {from: F0, to: T};
