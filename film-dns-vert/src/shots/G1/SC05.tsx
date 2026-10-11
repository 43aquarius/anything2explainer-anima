import React from 'react';
import {useCurrentFrame} from 'remotion';
import {clamp01, kf} from '../../common';
import {PacketIcon, BrowserWin, EXAMPLE, GREY, WHITE, PURPLE, PURPLE_LIGHT, exitOp} from '../../ui';

const F0 = 753, T = 924; // SC05: 753–924（S06–S07：resolver 问 root）

export const SC05: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const exitK = N > T - 8 ? exitOp(N, T) : 1;
  // 浏览器 + 纸条（上）
  const brOp = kf(N, [[761, 0.25], [769, 1]]);
  const fly = kf(N, [[813, 0], [833, 1]]);
  // 塔登场（863 = S07.c1）
  const towerK = N >= 863 ? clamp01((N - 863) / 21) : 0;
  // 纸条到塔的弧线（895 = S07.c2）
  const qFly = N >= 895 ? clamp01((N - 895) / 18) : 0;
  // 1.1.1.1
  const ipOp = kf(N, [[761, 0.25], [773, 1]]);
  return (
    <div style={{position: 'absolute', inset: 0, opacity: exitK}}>
      {/* 浏览器（上） */}
      {brOp > 0 && (
        <div style={{position: 'absolute', left: 135, top: 260, opacity: brOp}}>
          <BrowserWin x={0} y={0} w={250} h={190} skeleton={2} barP={0.35} />
          <div style={{fontFamily: "'Noto Sans SC', sans-serif", fontSize: 22, color: GREY, marginTop: 10}}>your browser</div>
          <div style={{fontFamily: "'Orbitron', sans-serif", fontSize: 40, color: PURPLE_LIGHT, marginTop: 14, textShadow: '4px 4px 0 #6630F8', opacity: ipOp}}>1.1.1.1</div>
          <div style={{fontFamily: "'Noto Sans SC', sans-serif", fontSize: 21, color: GREY}}>the resolver</div>
        </div>
      )}
      {/* 纸条飞向塔 */}
      {fly > 0 && fly < 1 && (
        <div style={{position: 'absolute', left: 240 + fly * 200, top: 560 - Math.sin(fly * Math.PI) * 70, transform: `rotate(${fly * 8}deg)`, width: 160, height: 60, background: '#000', border: `2px solid ${WHITE}`, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Sarasa Mono SC', monospace", fontSize: 20, color: WHITE}}>
          {EXAMPLE.domain}?
        </div>
      )}
      {/* 根塔（主角，下方） */}
      {towerK > 0 && (
        <div style={{position: 'absolute', left: 360, top: 830, transform: `translate(-50%, -50%) scale(${towerK})`}}>
          <svg width="170" height="240">
            {[0, 1, 2, 3].map(i => {
              const uy = 240 - 46 - i * 46;
              const uw = 170 - i * 22;
              return <rect key={i} x={(170 - uw) / 2} y={uy} width={uw} height={38} rx={6} fill="#000" stroke={WHITE} strokeWidth={2.5} />;
            })}
            <circle cx="85" cy="20" r="8" fill="#000" stroke={PURPLE_LIGHT} strokeWidth="2.5" style={{filter: 'drop-shadow(0 0 10px rgba(161,117,241,.9))'}} />
          </svg>
          <div style={{position: 'absolute', left: 0, right: 0, top: 250, textAlign: 'center', fontFamily: "'Audiowide', sans-serif", fontSize: 34, color: WHITE, letterSpacing: 3, textShadow: '3px 3px 0 #6630F8'}}>THE ROOT</div>
          <div style={{position: 'absolute', left: 0, right: 0, top: 292, textAlign: 'center', fontFamily: "'Orbitron', sans-serif", fontSize: 26, color: GREY}}>{EXAMPLE.rootCount} letters</div>
        </div>
      )}
      {/* 问号信封飞向塔 */}
      {qFly > 0 && qFly < 1 && (
        <div style={{position: 'absolute', left: 200 + qFly * 320, top: 760 - Math.sin(qFly * Math.PI) * 60}}>
          <PacketIcon cx={0} cy={0} w={60} h={42} stamp="?" accent />
        </div>
      )}
    </div>
  );
};
export const SC05_RANGE = {from: F0, to: T};
