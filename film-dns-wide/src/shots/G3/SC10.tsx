import React from 'react';
import {useCurrentFrame} from 'remotion';
import {GlitchIn, clamp01, kf} from '../../common';
import {BrowserWin, PersonIcon, Pill, EXAMPLE, GREY, GREY_LINE, WHITE, PURPLE, PURPLE_LIGHT, exitOp} from '../../ui';

const F0 = 2273, T = 2630; // SC10: 2273–2630 (S16–S17)

export const SC10: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const exitK = N > T - 8 ? exitOp(N, T) : 1;
  // 浏览器缩略 SoftIn（2281）
  const brOp = kf(N, [[2281, 0.25], [2289, 1]]);
  // 纸条 draw-on 飞向右侧（2338，kf 18 帧）
  const noteFly = kf(N, [[2338, 0], [2356, 1]], (u) => u);
  // 馆员入场接住（2348 起）
  const manK = N >= 2348 ? clamp01((N - 2348) / 21) : 0;
  // 1.1.1.1 glitch（2403）
  const ipN = N - 2403;
  // Pill（2520）
  const pillOp = kf(N, [[2520, 0.25], [2528, 1]]);
  // 手臂举起（2520-2538 一次性）+ 思考点循环（2578 起）
  const armRot = kf(N, [[2520, 0], [2538, -28]]);
  const dots = ['·', '·', '·'];
  const dotShow = N >= 2540 ? Math.min(3, Math.floor((N - 2540) / 12)) : -1;
  // 慢推
  const zoom = 1 + 0.05 * clamp01((N - 2560) / 40);
  return (
    <div style={{position: 'absolute', inset: 0, opacity: exitK}}>
      <div style={{position: 'absolute', left: 640, top: 390, transform: `translate(-50%, -50%) scale(${zoom})`}}>
        {/* 左：浏览器缩略 */}
        <div style={{position: 'absolute', left: -520, top: -90, opacity: brOp}}>
          <BrowserWin x={0} y={0} w={250} h={190} skeleton={2} barP={0.35} skelOpacity={N < 2572 ? 0.45 + 0.2 * (0.5 + 0.5 * Math.sin(N / 26 * Math.PI * 2)) : 0.55} />
          <div style={{marginTop: 12, fontFamily: "'Noto Sans SC', sans-serif", fontSize: 22, color: GREY}}>your browser</div>
        </div>
        {/* 中：纸条（shop.example? 飞向右侧） */}
        {noteFly > 0 && noteFly < 1 && (
          <div style={{position: 'absolute', left: -200 + noteFly * 320, top: -50 - Math.sin(noteFly * Math.PI) * 60, width: 150, height: 64, background: '#000', border: `2px solid ${WHITE}`, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Sarasa Mono SC', monospace", fontSize: 21, color: WHITE, opacity: 1, transform: `rotate(${noteFly * 8}deg)`}}>
            {EXAMPLE.domain}?
          </div>
        )}
        {/* 右：解析器馆员（主角） */}
        {manK > 0 && (
          <div style={{position: 'absolute', left: 300, top: -20}}>
            <div style={{transform: `scale(${manK})`, transformOrigin: 'center bottom'}}>
              <PersonIcon cx={0} cy={0} size={200} label="recursive resolver" labelSize={24} />
              {/* 手臂（举起动作） */}
              <div style={{position: 'absolute', left: 86, top: -36, width: 70, height: 12, background: '#000', border: `2.5px solid ${WHITE}`, borderRadius: 6, transformOrigin: 'left center', transform: `rotate(${armRot}deg)`}} />
              {/* 接住的纸条 */}
              {noteFly >= 1 && (
                <div style={{position: 'absolute', left: 130, top: -92, transform: `rotate(${armRot * -0.3}deg)`, width: 150, height: 64, background: '#000', border: `2px solid ${WHITE}`, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Sarasa Mono SC', monospace", fontSize: 21, color: WHITE}}>
                  {EXAMPLE.domain}?
                </div>
              )}
              {/* 思考点循环（2578 起） */}
              {dotShow >= 0 && (
                <div style={{position: 'absolute', left: 96, top: -142, fontSize: 40, color: GREY, letterSpacing: 6, opacity: N < 2578 ? 0.7 + 0.3 * Math.sin((N - 2540) / 14 * Math.PI) : 0.92}}>
                  dots.slice(0, Math.min(3, dotShow + 1)).join('')
                </div>
              )}
            </div>
          </div>
        )}
        {/* 1.1.1.1（glitch，主角光，落定后呼吸 ±1.5%） */}
        {ipN > 0 && (
          <div style={{position: 'absolute', left: 330, top: 130, textAlign: 'center', transform: `scale(${ipN > 12 && N < 2572 ? 1 + 0.015 * Math.sin((ipN - 12) / 26 * Math.PI * 2) : 1})`}}>
            <GlitchIn N={N} f0={2403}>
              <span style={{fontFamily: "'Orbitron', sans-serif", fontSize: 52, fontWeight: 700, color: WHITE, textShadow: '5px 5px 0 #6630F8, 0 0 22px rgba(102,48,248,.5)'}}>1.1.1.1</span>
            </GlitchIn>
            <div style={{marginTop: 8, fontFamily: "'Noto Sans SC', sans-serif", fontSize: 22, color: GREY}}>yours — or a public one</div>
          </div>
        )}
        {N > 2415 && N < 2570 && [0, 1, 2].map(k => {
          const period = 90;
          const t = ((N - 2415 + k * 30) % period) / period;
          const px = -430 + t * 760;
          return <div key={k} style={{position: 'absolute', left: px, top: -54, width: 9, height: 9, borderRadius: '50%', background: PURPLE_LIGHT, boxShadow: '0 0 10px rgba(161,117,241,.95)', opacity: t < 0.9 ? 1 : (1 - t) * 10}} />;
        })}
        {N > 2403 && (() => {
          const ph = ((N - 2403) % 44) / 44;
          const sx = -380 + ph * 760;
          return <div style={{position: 'absolute', left: sx, top: 128, width: 190, height: 92, border: `2.5px solid ${PURPLE_LIGHT}`, borderRadius: 8, opacity: N > 2556 ? Math.max(0, 0.85 - (N - 2556) * 0.28) : 0.85, boxShadow: '0 0 18px rgba(161,117,241,.5)'}} />;
        })()}
        {/* librarian Pill */}
        {pillOp > 0 && <div style={{position: 'absolute', left: 260, top: 230}}><Pill x={0} y={0} w={280} h={44} text="hired to fetch one book" fontSize={23} opacity={pillOp} /></div>}
      </div>
    </div>
  );
};
export const SC10_RANGE = {from: F0, to: T};
