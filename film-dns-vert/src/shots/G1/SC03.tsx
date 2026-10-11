import React from 'react';
import {useCurrentFrame} from 'remotion';
import {clamp01, kf} from '../../common';
import {GREY, GREY_LINE, WHITE, PURPLE_LIGHT, exitOp, BLOOM_SOFT} from '../../ui';

const F0 = 360, T = 448; // SC03: 360–448（S03：每次都要翻译）

export const SC03: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const exitK = N > T - 8 ? exitOp(N, T) : 1;
  // 三张小卡横排（竖版窄）+ 循环箭头
  const cards = [0, 1, 2].map(i => ({x: 90 + i * 190, at: 368 + i * 6}));
  const arrowK = N >= 417 ? clamp01((N - 417) / 14) : 0;
  const arrowRot = N > 431 ? (N - 431) * 0.02 : 0;
  return (
    <div style={{position: 'absolute', inset: 0, opacity: exitK}}>
      {cards.map((c, i) => {
        const k = kf(N, [[c.at, 0], [c.at + 18, 1]], (u) => Math.pow(1 - u, 0.4));
        if (k <= 0) return null;
        const ph = (N + i * 12) % 44;
        const press = ph < 8 ? Math.sin((ph / 8) * Math.PI) * 9 : 0;
        return (
          <div key={i} style={{position: 'absolute', left: c.x, top: 380 + (1 - k) * 90, width: 160, height: 300, opacity: k}}>
            <div style={{width: 160, height: 190, border: `2px solid ${GREY}`, borderRadius: 8, background: '#000'}} />
            <div style={{position: 'absolute', left: 12, top: 10, width: 136, height: 20, border: `1.5px solid ${GREY}`, borderRadius: 10, opacity: 0.7}} />
            <div style={{position: 'absolute', left: 14, top: 44, width: 90, height: 12, background: '#18181c', border: `1px solid ${GREY}`}} />
            <div style={{position: 'absolute', left: 46, top: 200, transform: `translateY(${press}px)`}}>
              <div style={{width: 66, height: 44, border: `2.5px solid ${WHITE}`, borderRadius: 6, background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, color: WHITE, filter: press > 4 ? 'brightness(1.5)' : undefined}}>&#8629;</div>
            </div>
            <div style={{position: 'absolute', left: 108, top: 196, transform: `scale(${1 + 0.06 * Math.sin((N + i * 10) / 30 * Math.PI * 2)})`, fontFamily: "'Orbitron', sans-serif", fontSize: 46, color: GREY, opacity: 0.9}}>?</div>
          </div>
        );
      })}
      {arrowK > 0 && (
        <div style={{position: 'absolute', left: 360, top: 800, transform: `translate(-50%, -50%) rotate(${arrowRot}deg) scale(${arrowK})`, filter: BLOOM_SOFT}}>
          <svg width="110" height="110">
            <path d="M 55 12 A 43 43 0 1 1 12 55" fill="none" stroke={WHITE} strokeWidth="5" strokeLinecap="round" strokeDasharray={240} strokeDashoffset={(1 - arrowK) * 240} />
            <polygon points="10,38 10,72 38,55" fill="#000" stroke={WHITE} strokeWidth="3" strokeLinejoin="round" />
          </svg>
        </div>
      )}
      <div style={{position: 'absolute', left: 0, right: 0, top: 880, textAlign: 'center', fontFamily: "'Noto Sans SC', sans-serif", fontSize: 25, color: GREY, opacity: kf(N, [[417, 0.25], [425, 1]])}}>every single time</div>
    </div>
  );
};
export const SC03_RANGE = {from: F0, to: T};
