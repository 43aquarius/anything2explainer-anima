import React from 'react';
import {useCurrentFrame} from 'remotion';
import {GlitchIn, clamp01, kf, emphasisPulse} from '../../common';
import {EXAMPLE, GREY, WHITE, ORANGE, exitOp} from '../../ui';

const F0 = 1737, T = 1863; // SC10: 1737–1863（S14：1.9T · 高光时刻·大数字型）

export const SC10: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const exitK = N > T - 8 ? exitOp(N, T) : 1;
  const tN = N - 1737;
  const tCount = tN > 0 ? kf(N, [[1737, 0], [1757, 1.9]]) : 0;
  const pulse = tN > 32 && tN < 62 ? emphasisPulse(tN - 32, {peak: 1.11, up: 13, hold: 4, down: 13}) : 1;
  const breathe = tN > 20 ? 1 + 0.02 * Math.sin((tN - 20) / 34 * Math.PI * 2) : 1;
  // 拨盘（1785 = S14.c2 起）
  const dialRot = N >= 1785 ? (N - 1785) * 6 : 0;
  return (
    <div style={{position: 'absolute', inset: 0, opacity: exitK}}>
      {tN > 0 && (
        <div style={{position: 'absolute', left: 0, right: 0, top: 560, textAlign: 'center', transform: `scale(${pulse * breathe})`}}>
          <GlitchIn N={N} f0={1737}>
            <span style={{fontFamily: "'Orbitron', sans-serif", fontSize: 170, fontWeight: 700, color: ORANGE, textShadow: `0 0 ${56 + 18 * Math.sin((tN - 20) / 30 * Math.PI * 2)}px rgba(240,95,65,.85), 7px 7px 0 rgba(240,95,65,.3)`}}>{tCount.toFixed(1)} T</span>
          </GlitchIn>
          <div style={{fontFamily: "'Noto Sans SC', sans-serif", fontSize: 34, color: GREY, marginTop: 10}}>lookups <b style={{color: WHITE}}>per day</b></div>
          <div style={{fontFamily: "'Noto Sans SC', sans-serif", fontSize: 24, color: GREY, marginTop: 12}}>one resolver alone — {EXAMPLE.resolver}</div>
        </div>
      )}
      {/* 拨盘 */}
      {N >= 1785 && (
        <div style={{position: 'absolute', left: 360, top: 900, transform: 'translate(-50%, -50%)', textAlign: 'center'}}>
          <svg width="110" height="110" style={{transform: `rotate(${dialRot}deg)`}}>
            <circle cx="55" cy="55" r="48" fill="none" stroke={WHITE} strokeWidth="3" />
            {[0, 1, 2, 3, 4, 5, 6, 7].map(i => {
              const a = (i / 8) * Math.PI * 2;
              return <line key={i} x1={55 + Math.cos(a) * 37} y1={55 + Math.sin(a) * 37} x2={55 + Math.cos(a) * 48} y2={55 + Math.sin(a) * 48} stroke={GREY} strokeWidth="2.5" />;
            })}
            <line x1="55" y1="55" x2="55" y2="12" stroke={ORANGE} strokeWidth="4" />
          </svg>
          <div style={{fontFamily: "'Orbitron', sans-serif", fontSize: 22, color: WHITE, marginTop: 10}}>{EXAMPLE.volSec}</div>
        </div>
      )}
    </div>
  );
};
export const SC10_RANGE = {from: F0, to: T};
