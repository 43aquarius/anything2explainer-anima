import React from 'react';
import {useCurrentFrame} from 'remotion';
import {GlitchIn, clamp01, kf} from '../../common';
import {LightSweep} from '../../fx';
import {PacketIcon, EXAMPLE, GREY, GREY_LINE, WHITE, PURPLE, PURPLE_LIGHT, exitOp} from '../../ui';

const F0 = 8455, T = 8546; // SC33: 8455–8546（S56 ¶：金句 · 高光时刻·象征物+回扣·扫光②）

export const SC33: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const n0 = N - F0;
  // 两行大字（8463 = S56.c1 行1；8499 = S56.c2 行2）
  const l1N = N - 8463;
  const l2N = N - 8499;
  // 扫光三轮（8459/8469/8479 —— 紧凑版）
  const sweepRounds = [F0 + 4, F0 + 14, F0 + 24];
  // 白闪（行1 glitch 时）
  const flash = l1N >= 0 && l1N < 3;
  // 信封飞越（8499 起 20px/帧 到画右）
  const envX = l2N > 0 ? -520 + l2N * 20 : -520;
  const envY = -10 + Math.sin(l2N / 26 * Math.PI * 2) * 10;
  // 小灰字
  const subOp = kf(N, [[8513, 0.25], [8521, 1]]);
  return (
    <div style={{position: 'absolute', inset: 0}}>
      {/* 三轮紫光横扫（扫光白名单②） */}
      <LightSweep N={N} rounds={sweepRounds} alphas={[0.5, 0.45, 0.45]} />
      {flash && <div style={{position: 'fixed', inset: 0, background: WHITE, opacity: 0.45}} />}
      {/* 行 1 */}
      {l1N > 0 && (
        <div style={{position: 'absolute', left: 640, top: 310, transform: 'translate(-50%, -50%)', textAlign: 'center'}}>
          <span style={{fontFamily: "'Noto Sans SC', sans-serif", fontWeight: 900, fontSize: 64, color: WHITE, WebkitTextStroke: '2.5px #6630F8', paintOrder: 'stroke fill', filter: 'drop-shadow(0 0 16px rgba(102,48,248,.55))', opacity: kf(N, [[8463, 0.25], [8471, 1]])}}>A name is a question.</span>
        </div>
      )}
      {/* 行 2（主角大字） */}
      {l2N > 0 && (
        <div style={{position: 'absolute', left: 640, top: 420, transform: 'translate(-50%, -50%)', textAlign: 'center'}}>
          <GlitchIn N={N} f0={8499}>
            <span style={{fontFamily: "'Audiowide', sans-serif", fontSize: 76, color: WHITE, letterSpacing: 3, textShadow: '6px 6px 0 #6630F8, 0 0 34px rgba(102,48,248,.55)'}}>DNS is the answer.</span>
          </GlitchIn>
        </div>
      )}
      {/* 飞越的信封 */}
      {l2N > 0 && envX < 720 && (
        <div style={{position: 'absolute', left: 640 + envX, top: 380 + envY, opacity: 0.95}}>
          <PacketIcon cx={0} cy={0} w={52} h={36} accent glow />
        </div>
      )}
      {/* 小灰字 */}
      {subOp > 0 && (
        <div style={{position: 'absolute', left: 0, right: 0, top: 536, textAlign: 'center', fontFamily: "'Noto Sans SC', sans-serif", fontSize: 24, color: GREY, opacity: subOp}}>DNS · the internet's phonebook</div>
      )}
    </div>
  );
};
export const SC33_RANGE = {from: F0, to: T};
