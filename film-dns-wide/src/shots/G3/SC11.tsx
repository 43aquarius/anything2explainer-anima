import React from 'react';
import {useCurrentFrame} from 'remotion';
import {GlitchIn, clamp01, kf, emphasisPulse} from '../../common';
import {LightSweep, StageLine, GhostText, ghostOpacity} from '../../fx';
import {PacketIcon, EXAMPLE, GREY, GREY_LINE, WHITE, ORANGE, PURPLE, PURPLE_LIGHT, exitOp, GLOW_PURPLE_S} from '../../ui';

const F0 = 2631, T = 2992; // SC11: 2631–2992（S18–S20 · 高光时刻·登场型·扫光白名单①）

export const SC11: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const exitK = N > T - 8 ? exitOp(N, T) : 1;
  // SET_PIECE 编排（相对帧）
  const T0 = F0 + 4;                       // 扫光起点 2635
  const T1 = 2696;                          // 节拍帧：白闪 + 大字 glitch（S18.c2 根服务器）
  const bigN = N - T1;
  const pulse = bigN > 12 && bigN < 42 ? emphasisPulse(bigN - 12, {peak: 1.11, up: 13, hold: 4, down: 13}) : 1;
  // `13` 计数（2737 = S19.c1）
  const c13 = N >= 2737 ? Math.round(kf(N, [[2737, 0], [2757, 13]])) : 0;
  // A–M SoftIn（2757+6）
  const amOp = kf(N, [[2763, 0.25], [2771, 1]]);
  // 小信封飞来被弹开（2804 = S19.c2 永远不会）
  const envFly = N >= 2804 ? clamp01((N - 2804) / 24) : 0;
  // referral Pill + 紫箭头（2900 = S20.c2）
  const pillOp = kf(N, [[2900, 0.25], [2908, 1]]);
  const arrowK = clamp01((N - 2910) / 14);
  // 底行小字
  const footOp = kf(N, [[2920, 0], [2930, 1]]);
  return (
    <div style={{position: 'absolute', inset: 0, opacity: exitK}}>
      {/* 三轮紫光横扫（扫光白名单①） */}
      <LightSweep N={N} rounds={[T0, T0 + 18, T0 + 36]} />
      {/* 舞台光线 */}
      <StageLine N={N} f0={T0 + 14} flashAt={T1} cy={331} />
      {/* 幽灵轮廓（预示） */}
      <GhostText cx={640} cy={340} size={96} opacity={ghostOpacity(N, T0 + 33, T1)} letterSpacing={6} family="'Audiowide', sans-serif" weight={400}>THE ROOT</GhostText>
      {/* 大字（白闪 + glitch） */}
      {bigN > 0 && (
        <div style={{position: 'absolute', left: 640, top: 330, transform: `translate(-50%, -50%) scale(${pulse})`}}>
          {bigN >= 0 && bigN < 3 && <div style={{position: 'fixed', inset: 0, background: WHITE, opacity: 0.5}} />}
          <GlitchIn N={N} f0={T1}><span style={{fontFamily: "'Audiowide', sans-serif", fontSize: 96, color: WHITE, letterSpacing: 6, textShadow: '6px 6px 0 #6630F8, 0 0 34px rgba(102,48,248,.5)'}}>THE ROOT</span></GlitchIn>
        </div>
      )}
      {/* 13 计数 + A–M */}
      {c13 > 0 && (
        <div style={{position: 'absolute', left: 640, top: 470, transform: 'translate(-50%, -50%)', textAlign: 'center'}}>
          <span style={{fontFamily: "'Orbitron', sans-serif", fontSize: 86, fontWeight: 700, color: ORANGE, textShadow: '0 0 26px rgba(240,95,65,.65)'}}>{c13}</span>
          {amOp > 0 && <span style={{fontFamily: "'Noto Sans SC', sans-serif", fontSize: 30, color: GREY, marginLeft: 18, opacity: amOp}}>identities, {EXAMPLE.rootLetters}</span>}
        </div>
      )}
      {/* 小信封飞来被弹开（root 不认识） */}
      {envFly > 0 && envFly < 1 && (
        <div style={{position: 'absolute', left: 640 - 300 + envFly * 300, top: 470 - Math.sin(envFly * Math.PI) * 80, transform: `rotate(${envFly * 24}deg)`, opacity: envFly < 0.8 ? 1 : 1 - (envFly - 0.8) * 5}}>
          <PacketIcon cx={0} cy={0} w={64} h={44} />
          {envFly > 0.75 && <div style={{position: 'absolute', left: 46, top: -28, fontFamily: "'Noto Sans SC', sans-serif", fontSize: 40, color: ORANGE, fontWeight: 900}}>✕</div>}
        </div>
      )}
      {/* referral Pill + 紫箭头 */}
      {pillOp > 0 && (
        <div style={{position: 'absolute', left: 640, top: 566, transform: 'translateX(-50%)'}}>
          <div style={{border: `2px solid ${PURPLE_LIGHT}`, borderRadius: 22, padding: '8px 26px', background: '#000', fontFamily: "'Exo 2', sans-serif", fontStyle: 'italic', fontSize: 27, color: PURPLE_LIGHT, opacity: pillOp, boxShadow: GLOW_PURPLE_S}}>referral, not answer</div>
          {arrowK > 0 && (
            <svg width="220" height="60" style={{position: 'absolute', left: 200, top: 0, opacity: arrowK}}>
              <line x1="4" y1="20" x2={200 * arrowK} y2="20" stroke={PURPLE_LIGHT} strokeWidth={4} />
              {arrowK > 0.9 && <polygon points="192,8 220,20 192,32" fill={PURPLE_LIGHT} />}
            </svg>
          )}
        </div>
      )}
      {/* 底行小字 */}
      {footOp > 0 && <div style={{position: 'absolute', left: 0, right: 0, top: 622, textAlign: 'center', fontFamily: "'Noto Sans SC', sans-serif", fontSize: 23, color: GREY, opacity: footOp}}>{EXAMPLE.rootCount} letters, {EXAMPLE.instCount} instances today</div>}
    </div>
  );
};
export const SC11_RANGE = {from: F0, to: T};
