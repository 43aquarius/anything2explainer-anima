import React from 'react';
import {useCurrentFrame} from 'remotion';
import {clamp01, kf} from '../../common';
import {BrowserWin, EXAMPLE, GREY, WHITE, PURPLE, exitOp} from '../../ui';
import {BigNumber} from '../../fx';

const F0 = 33, T = 175; // SC01: 33–175（S01：回车与半秒）

export const SC01: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const exitK = N > T - 8 ? exitOp(N, T) : 1;
  const typed = clamp01((N - 43) / 24) * EXAMPLE.domain.length;
  const appear = N >= 118;
  const counter = kf(N, [[118, 0], [138, 5]], (u) => 1 - Math.pow(1 - u, 2)) / 10;
  const skelB = appear ? 0.5 + 0.15 * Math.sin((N - 118) / 26 * Math.PI * 2) : 0.45;
  return (
    <div style={{position: 'absolute', inset: 0, opacity: exitK}}>
      {/* 浏览器（上） */}
      <div style={{position: 'absolute', left: 110, top: 300, transform: `translateY(${kf(N, [[33, 90], [51, 0]], (u) => Math.pow(1 - u, 2.5))}px)`, opacity: kf(N, [[33, 0.25], [41, 1]])}}>
        <BrowserWin x={0} y={0} w={500} h={380} typed={typed} skeleton={4} skelLit={appear ? 4 : 0} barP={appear ? 1 : 0.3} skelOpacity={skelB} />
      </div>
      {/* 计时（下，主角） */}
      <div style={{position: 'absolute', left: 0, right: 0, top: 800, textAlign: 'center'}}>
        <BigNumber cx={360} cy={0} value={(N < 118 ? 0 : counter).toFixed(1)} unit="s" size={130} />
        <div style={{fontFamily: "'Noto Sans SC', sans-serif", fontSize: 24, color: GREY, marginTop: 110}}>from Enter to first pixels</div>
        {N >= 118 && N < 121 && <div style={{position: 'fixed', inset: 0, background: WHITE, opacity: 0.5}} />}
      </div>
    </div>
  );
};
export const SC01_RANGE = {from: F0, to: T};
