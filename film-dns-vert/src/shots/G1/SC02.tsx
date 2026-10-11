import React from 'react';
import {useCurrentFrame} from 'remotion';
import {clamp01, kf} from '../../common';
import {EXAMPLE, GREY, WHITE, PURPLE_LIGHT, exitOp, BLOOM_SOFT} from '../../ui';

const F0 = 176, T = 359; // SC02: 176–359（S02：没有机器叫这个名字）

export const SC02: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const exitK = N > T - 8 ? exitOp(N, T) : 1;
  const word = {op: kf(N, [[184, 0.25], [192, 1]]), dy: kf(N, [[184, 12], [192, 0]])};
  const qN = N - 225;
  const q = qN >= 0 ? Math.min(1, qN / 21) : 0;
  const sway = qN > 20 && qN < 41 ? Math.sin((qN - 20) / 20 * Math.PI) * 2 : 0;
  const breathe = qN > 21 ? 1 + 0.05 * Math.sin((qN - 21) / 28 * Math.PI * 2) : 1;
  const sub = 'no machine on the internet is named that';
  const typed = N >= 281 ? Math.floor(clamp01((N - 281) / (sub.length * 1.4)) * sub.length) : -1;
  return (
    <div style={{position: 'absolute', inset: 0, opacity: exitK}}>
      {/* 域名大字（上） */}
      <div style={{position: 'absolute', left: 0, right: 0, top: 430, textAlign: 'center', fontFamily: "'Noto Sans SC', sans-serif", fontWeight: 900, fontSize: 74, color: WHITE, opacity: word.op, transform: `translateY(${word.dy}px)`}}>{EXAMPLE.domain}</div>
      {/* ? 印章（主角） */}
      {q > 0 && (
        <div style={{position: 'absolute', left: 420, top: 330, transform: `scale(${q * breathe}) rotate(${sway}deg)`, transformOrigin: 'center'}}>
          <div style={{fontFamily: "'Orbitron', sans-serif", fontSize: 160, fontWeight: 700, color: '#000', WebkitTextStroke: '5px #A175F1', paintOrder: 'stroke fill', filter: `drop-shadow(0 0 20px rgba(161,117,241,.75)) ${BLOOM_SOFT}`, lineHeight: 1}}>&nbsp;?</div>
        </div>
      )}
      {/* 灰字打字机（下） */}
      {typed >= 0 && (
        <div style={{position: 'absolute', left: 40, right: 40, top: 760, textAlign: 'center', fontFamily: "'Noto Sans SC', sans-serif", fontSize: 26, color: GREY}}>
          {sub.slice(0, typed + 1)}<span style={{opacity: (N % 16) < 8 ? 1 : 0.2, color: WHITE}}>|</span>
        </div>
      )}
    </div>
  );
};
export const SC02_RANGE = {from: F0, to: T};
