import React from 'react';
import {useCurrentFrame} from 'remotion';
import {GlitchIn, clamp01, kf} from '../../common';
import {LightSweep} from '../../fx';
import {PacketIcon, EXAMPLE, GREY, WHITE, PURPLE, PURPLE_LIGHT, exitOp} from '../../ui';

const F0 = 1864, T = 1956; // SC11: 1864–1956（S15：金句 · 高光时刻·象征物+回扣·扫光）

export const SC11: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const l1N = N - 1874;
  const l2N = N - 1914;
  const sweepRounds = [F0 + 4, F0 + 14, F0 + 24];
  const flash = l1N >= 0 && l1N < 3;
  const envX = l2N > 0 ? -320 + l2N * 16 : -320;
  const envY = -8 + Math.sin(l2N / 22 * Math.PI * 2) * 8;
  const subOp = kf(N, [[1936, 0.25], [1944, 1]]);
  return (
    <div style={{position: 'absolute', inset: 0}}>
      <LightSweep N={N} rounds={sweepRounds} alphas={[0.5, 0.45, 0.45]} />
      {flash && <div style={{position: 'fixed', inset: 0, background: WHITE, opacity: 0.45}} />}
      {/* 行 1 */}
      {l1N > 0 && (
        <div style={{position: 'absolute', left: 0, right: 0, top: 560, textAlign: 'center'}}>
          <span style={{fontFamily: "'Noto Sans SC', sans-serif", fontWeight: 900, fontSize: 56, color: WHITE, WebkitTextStroke: '2.5px #6630F8', paintOrder: 'stroke fill', filter: 'drop-shadow(0 0 18px rgba(102,48,248,.6))', opacity: kf(N, [[1874, 0.25], [1882, 1]])}}>A name is a question.</span>
        </div>
      )}
      {/* 行 2（主角） */}
      {l2N > 0 && (
        <div style={{position: 'absolute', left: 0, right: 0, top: 680, textAlign: 'center'}}>
          <GlitchIn N={N} f0={1914}>
            <span style={{fontFamily: "'Audiowide', sans-serif", fontSize: 66, color: WHITE, letterSpacing: 2, textShadow: '6px 6px 0 #6630F8, 0 0 34px rgba(102,48,248,.55)'}}>DNS is the answer.</span>
          </GlitchIn>
        </div>
      )}
      {/* 飞越信封 */}
      {l2N > 0 && envX < 420 && (
        <div style={{position: 'absolute', left: 360 + envX, top: 640 + envY, opacity: 0.95}}>
          <PacketIcon cx={0} cy={0} w={54} h={38} accent glow />
        </div>
      )}
      {/* 小灰字 */}
      {subOp > 0 && (
        <div style={{position: 'absolute', left: 0, right: 0, top: 810, textAlign: 'center', fontFamily: "'Noto Sans SC', sans-serif", fontSize: 24, color: GREY, opacity: subOp}}>DNS · the internet's phonebook</div>
      )}
    </div>
  );
};
export const SC11_RANGE = {from: F0, to: T};
