import React from 'react';
import {useCurrentFrame} from 'remotion';
import {clamp01, kf} from '../../common';
import {PostcardIcon, GREY, GREY_LINE, WHITE, PURPLE, PURPLE_LIGHT, exitOp, stagger} from '../../ui';

const F0 = 6196, T = 6239; // SC25: 6196–6381（S42–S43：三个诚实的答案）

const CARDS = [
  {x: 240, enter: 6196, num: '①'},
  {x: 640, enter: 6198, num: '②'},
  {x: 1040, enter: 6200, num: '③'},
];

export const SC25: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const exitK = N > T - 8 ? exitOp(N, T) : 1;
  return (
    <div style={{position: 'absolute', inset: 0, opacity: exitK}}>
      {CARDS.map((c, i) => {
        const inK = kf(N, [[c.enter, 0], [c.enter + 18, 1]], (u) => Math.pow(1 - u, 0.4));
        if (inK <= 0) return null;
        const float = 3 * Math.sin((N + i * 10) / 30 * Math.PI * 2);
        return (
          <div key={i} style={{position: 'absolute', left: c.x - 140, top: 250 + (1 - inK) * 110 + float, width: 280, height: 340, opacity: inK * 0.96}}>
            <div style={{position: 'absolute', left: 0, top: 0, width: 280, height: 340, background: '#000', border: `2.5px solid ${WHITE}`, borderRadius: 12}} />
            <div style={{position: 'absolute', left: 20, top: 14, fontFamily: "'Orbitron', sans-serif", fontSize: 40, color: PURPLE_LIGHT}}>{c.num}</div>
            {/* 卡①明信片 */}
            {i === 0 && (
              <div style={{position: 'absolute', left: 28, top: 80}}>
                <PostcardIcon x={0} y={0} w={224} h={156} lines={['readable by', 'anyone on', 'the path']} stampText="UDP" />
                <div style={{marginTop: 14, textAlign: 'center', fontFamily: "'Noto Sans SC', sans-serif", fontSize: 23, color: GREY}}>plaintext</div>
              </div>
            )}
            {/* 卡②翻开的书 */}
            {i === 1 && (
              <div style={{position: 'absolute', left: 46, top: 88}}>
                <svg width="188" height="130">
                  <path d="M94,16 V112" stroke={WHITE} strokeWidth="2.5" />
                  <path d="M94,16 C70,4 30,8 16,20 V112 C30,100 70,96 94,108" fill="#000" stroke={WHITE} strokeWidth="2.5" strokeLinejoin="round" />
                  <path d="M94,16 C118,4 158,8 172,20 V112 C158,100 118,96 94,108" fill="#000" stroke={WHITE} strokeWidth="2.5" strokeLinejoin="round" />
                  {[0, 1, 2].map(j => <line key={'l' + j} x1="28" y1={40 + j * 16} x2="78" y2={40 + j * 16} stroke={GREY} strokeWidth="2" />)}
                  {[0, 1, 2].map(j => <line key={'r' + j} x1="110" y1={40 + j * 16} x2="160" y2={40 + j * 16} stroke={GREY} strokeWidth="2" />)}
                </svg>
                <div style={{marginTop: 14, textAlign: 'center', fontFamily: "'Noto Sans SC', sans-serif", fontSize: 23, color: GREY}}>the book can lie</div>
              </div>
            )}
            {/* 卡③小锤 */}
            {i === 2 && (
              <div style={{position: 'absolute', left: 82, top: 88}}>
                <svg width="120" height="120">
                  <rect x="30" y="8" width="18" height="62" fill="#000" stroke={WHITE} strokeWidth="2.5" transform="rotate(18 39 8)" />
                  <rect x="14" y="62" width="76" height="30" rx="6" fill="#000" stroke={WHITE} strokeWidth="2.5" />
                  <rect x="48" y="92" width="8" height="16" fill="#000" stroke={WHITE} strokeWidth="2.5" />
                  <rect x="28" y="108" width="48" height="8" rx="3" fill="#000" stroke={GREY} strokeWidth="2" />
                </svg>
                <div style={{marginTop: 14, textAlign: 'center', fontFamily: "'Noto Sans SC', sans-serif", fontSize: 23, color: GREY}}>attack</div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
export const SC25_RANGE = {from: F0, to: T};
