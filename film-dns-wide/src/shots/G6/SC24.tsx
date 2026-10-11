import React from 'react';
import {useCurrentFrame} from 'remotion';
import {clamp01, kf} from '../../common';
import {GREY, GREY_LINE, WHITE, PURPLE, PURPLE_LIGHT, exitOp, GLOW_PURPLE_S} from '../../ui';
import {HaloRing} from '../../fx';

const F0 = 5981, T = 6150; // SC24: {S41.from-8}–{S41.to+2}（S41 ¶ 章末：什么会出错）

export const SC24: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const exitK = N > T - 10 ? exitOp(N, T) : 1;
  // ? 缩放入场（5989 = S41.c1）
  const qN = N - 5989;
  const q = qN >= 0 ? Math.min(1, qN / 21) : 0;
  const breathe = qN > 21 ? 1 + 0.08 * Math.sin((qN - 21) / 30 * Math.PI * 2) : 1;
  // 白闪（落位）
  const flash = qN >= 21 && qN < 24;
  // 涟漪（6104 = S41.c3 起：draw-on 后持续外扩）
  const rippleK = N >= 6104 ? clamp01((N - 6104) / 20) : 0;
  const rippleR = N > 6124 ? ((N - 6124) % 40) / 40 : 0;
  // 三张剪影卡（6104 淡入 40%）
  const silOp = N >= 6104 ? kf(N, [[6104, 0], [6116, 0.4]]) : 0;
  return (
    <div style={{position: 'absolute', inset: 0, opacity: exitK}}>
      {flash && <div style={{position: 'fixed', inset: 0, background: WHITE, opacity: 0.4}} />}
      {/* 涟漪光环 */}
      {rippleK > 0 && (
        <div style={{position: 'absolute', left: 640, top: 330}}>
          <HaloRing cx={0} cy={0} rxo={150 + rippleR * 40} ryo={36 + rippleR * 10} rxi={110} ryi={26} p={rippleK} fillOp={0.35} phase={Math.floor(N / 20)} />
        </div>
      )}
      {/* 主角：巨型 ? */}
      {q > 0 && (
        <div style={{position: 'absolute', left: 640, top: 330, transform: `translate(-50%, -50%) scale(${q * breathe})`}}>
          <div style={{fontFamily: "'Orbitron', sans-serif", fontSize: 150, fontWeight: 700, color: '#000', WebkitTextStroke: '5px #A175F1', paintOrder: 'stroke fill', filter: 'drop-shadow(0 0 24px rgba(161,117,241,.8))', lineHeight: 1}}>?</div>
        </div>
      )}
      {/* 三张剪影卡（预告下章） */}
      {silOp > 0 && [0, 1, 2].map(i => (
        <div key={i} style={{position: 'absolute', left: 460 + i * 190, top: 540, width: 150, height: 100, border: `2px solid ${GREY_LINE}`, borderRadius: 8, background: 'rgba(0,0,0,.6)', opacity: silOp, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
          {i === 0 && <svg width="70" height="48"><rect x="2" y="2" width="66" height="44" rx="4" fill="none" stroke={GREY} strokeWidth="2.5" /><rect x="10" y="10" width="16" height="20" fill="none" stroke={GREY} strokeWidth="2" /><line x1="36" y1="12" x2="60" y2="12" stroke={GREY} strokeWidth="2" /><line x1="36" y1="20" x2="56" y2="20" stroke={GREY} strokeWidth="2" /></svg>}
          {i === 1 && <svg width="64" height="56"><path d="M8,54 V10 a4,4 0 0 1 4,-4 h40 a4,4 0 0 1 4,4 v44 z" fill="none" stroke={GREY} strokeWidth="2.5" /><line x1="18" y1="54" x2="18" y2="16" stroke={GREY} strokeWidth="2" /><line x1="32" y1="54" x2="32" y2="16" stroke={GREY} strokeWidth="2" /></svg>}
          {i === 2 && <svg width="56" height="56"><rect x="6" y="6" width="44" height="30" rx="5" fill="none" stroke={GREY} strokeWidth="2.5" /><line x1="14" y1="46" x2="42" y2="46" stroke={GREY} strokeWidth="3" strokeLinecap="round" /></svg>}
        </div>
      ))}
    </div>
  );
};
export const SC24_RANGE = {from: F0, to: T};
