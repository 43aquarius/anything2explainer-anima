import React from 'react';
import {useCurrentFrame} from 'remotion';
import {clamp01, kf} from '../../common';
import {CodeCard, TreeTier, EXAMPLE, GREY, GREY_LINE, WHITE, PURPLE, PURPLE_LIGHT, exitOp} from '../../ui';

const F0 = 1943, T = 2212; // SC09: {S14.from-8}–{S15.to+2}（S14–S15：1987 与中心之问 · 章末）

export const SC09: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const exitK = N > T - 10 ? exitOp(N, T) : 1;
  // RFC 卡 slideUp（1951）
  const card = kf(N, [[1951, 90], [1969, 0]], (u) => Math.pow(1 - u, 2.5));
  const cardOp = kf(N, [[1951, 0.25], [1959, 1]]);
  // 年份 YearRoll（1992 = S14.c2：滚动落定 14 帧，全程模糊）
  const roll = clamp01((N - 1992) / 14);
  const year = Math.round(1980 + roll * 7);
  const blur = roll < 1 ? 9 - 0 * roll : 0;
  // 树缩微承接（2079 = S14.c3）
  const treeOp = N >= 2079 ? kf(N, [[2079, 0], [2091, 1]]) : 0;
  // ? 缩放入（2137 = S15.c1）
  const qN = N - 2137;
  const q = qN >= 0 ? Math.min(1, qN / 21) : 0;
  const qBreath = qN > 21 ? 1 + 0.05 * Math.sin((qN - 21) / 30 * Math.PI * 2) : 1;
  // 章末拉远（2137 前：2050-2086）
  const zoom = 1.12 - 0.12 * kf(N, [[2050, 0], [2086, 1]]);
  return (
    <div style={{position: 'absolute', inset: 0, opacity: exitK}}>
      <div style={{position: 'absolute', left: 640, top: 360, transform: `translate(-50%, -50%) scale(${zoom})`}}>
        {/* 左：RFC 卡（主角 340×420） */}
        <div style={{position: 'absolute', left: -500, top: -210 + card, opacity: cardOp}}>
          <CodeCard x={0} y={0} w={340} h={420} tag="RFC 1034 / 1035" lines={7} active={N > 1992} />
          <div style={{position: 'absolute', left: 0, right: 0, top: 452, textAlign: 'center'}}>
            <div style={{fontFamily: "'Orbitron', sans-serif", fontSize: 48, fontWeight: 700, color: WHITE, filter: roll < 1 ? `blur(${blur + 2}px)` : undefined, textShadow: '4px 4px 0 #6630F8, 0 0 20px rgba(102,48,248,.4)'}}>{year === 1987 ? '1987' : '19' + String(80 + Math.floor(roll * 8))}</div>
            <div style={{fontFamily: "'Noto Sans SC', sans-serif", fontSize: 23, color: GREY, marginTop: 8}}>November 1987</div>
            <div style={{fontFamily: "'Noto Sans SC', sans-serif", fontSize: 22, color: GREY_LINE, marginTop: 10, opacity: N > 2079 ? 1 : 0.55}}>predates the web itself</div>
          </div>
        </div>
        {/* 右：树缩微 + ? */}
        {treeOp > 0 && (
          <div style={{position: 'absolute', left: 190, top: -60, opacity: treeOp, transform: 'scale(0.5)', transformOrigin: 'center'}}>
            <TreeTier cx={0} cy={0} w={560} progress={1} litLeaf={Math.floor((N - 2091) / 40) % 6} />
          </div>
        )}
        {q > 0 && (
          <div style={{position: 'absolute', left: 330, top: -150, transform: `scale(${q * qBreath})`, transformOrigin: 'center'}}>
            <div style={{fontFamily: "'Orbitron', sans-serif", fontSize: 110, fontWeight: 700, color: '#000', WebkitTextStroke: '4px #A175F1', paintOrder: 'stroke fill', filter: 'drop-shadow(0 0 16px rgba(161,117,241,.7))', lineHeight: 1}}>?</div>
          </div>
        )}
        {/* 下方灰字 */}
        <div style={{position: 'absolute', left: -320, top: 258, width: 640, textAlign: 'center', fontFamily: "'Noto Sans SC', sans-serif", fontSize: 25, color: GREY, opacity: kf(N, [[2168, 0.25], [2176, 1]])}}>a book with no center</div>
      </div>
    </div>
  );
};
export const SC09_RANGE = {from: F0, to: T};
