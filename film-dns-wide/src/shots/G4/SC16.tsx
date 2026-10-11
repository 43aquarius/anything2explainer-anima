import React from 'react';
import {useCurrentFrame} from 'remotion';
import {GlitchIn, clamp01, kf, emphasisPulse} from '../../common';
import {PersonIcon, RackIcon, Pill, BrowserWin, TreeTier, EXAMPLE, GREY, GREY_LINE, WHITE, ORANGE, PURPLE, PURPLE_LIGHT, exitOp, stagger} from '../../ui';

const F0 = 3684, T = 3918; // SC16: 3684–3918（S26–S27 · 高光时刻·论点型：四柜台全景）

// 五节点：stub 浏览器 → recursive 馆员 → root 塔 → TLD → authoritative 机架
const NODES = [
  {x: 190, label: 'browser', at: 3692},
  {x: 430, label: 'resolver', at: 3694},
  {x: 660, label: 'root', at: 3696},
  {x: 890, label: 'TLD', at: 3698},
  {x: 1100, label: 'authoritative', at: 3700},
];

export const SC16: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const exitK = N > T - 8 ? exitOp(N, T) : 1;
  // 柜台依次 slideUp（3692 起 2 帧错峰，各 18 帧）
  // 大字 glitch（3692 = S26.c1）
  const bigN = N - 3692;
  const pulse = bigN > 12 && bigN < 42 ? emphasisPulse(bigN - 12, {peak: 1.11, up: 13, hold: 4, down: 13}) : 1;
  // 柜台白闪（3756 = S26.c2）
  const flashIdx = N >= 3756 ? Math.min(4, Math.floor((N - 3756) / 8)) : -1;
  // 箭头 draw-on（3781 = S27.c1）
  const arrows = [0, 1, 2, 3].map(i => clamp01((N - 3781 - i * 10) / 10));
  // ≈100 ms 计数（3826 = S27.c2）
  const ms = N >= 3826 ? Math.round(kf(N, [[3826, 0], [3846, 100]])) : 0;
  const glow = N > 3846 ? 1 + 0.05 * Math.sin((N - 3846) / 30 * Math.PI * 2) : 1;
  // 运镜：33 帧 1→1.2 推向 ≈100ms（3826 起）
  const zoom = 1 + 0.2 * kf(N, [[3826, 0], [3859, 1]]);
  return (
    <div style={{position: 'absolute', inset: 0, opacity: exitK}}>
      {/* 大字（全景上方） */}
      {bigN > 0 && (
        <div style={{position: 'absolute', left: 640, top: 176, transform: `translate(-50%, -50%) scale(${pulse})`, textAlign: 'center'}}>
          <GlitchIn N={N} f0={3692}>
            <span style={{fontFamily: "'Noto Sans SC', sans-serif", fontWeight: 900, fontSize: 50, color: WHITE, WebkitTextStroke: '2.5px #6630F8', paintOrder: 'stroke fill', letterSpacing: 1, filter: 'drop-shadow(0 0 14px rgba(102,48,248,.55))'}}>FOUR COUNTERS</span>
          </GlitchIn>
          <div style={{marginTop: 8, fontFamily: "'Noto Sans SC', sans-serif", fontSize: 24, color: GREY, opacity: bigN > 16 ? 1 : 0}}>none of them knew the whole book</div>
        </div>
      )}
      {/* 全景（y 250–560） */}
      <div style={{position: 'absolute', left: 640, top: 400, transform: `translate(-50%, -50%) scale(${zoom})`}}>
        {/* 柜台间箭头 */}
        {arrows.map((a, i) => {
          const x0 = NODES[i].x + 70, x1 = NODES[i + 1].x - 70;
          return a > 0 && (
            <svg key={i} width={x1 - x0 + 40} height="40" style={{position: 'absolute', left: x0 - 20, top: -20}}>
              <line x1="20" y1="20" x2={20 + (x1 - x0) * a} y2="20" stroke={WHITE} strokeWidth={3} />
              {a >= 1 && <polygon points={`${x1 - x0 - 2},8 ${x1 - x0 + 26},20 ${x1 - x0 - 2},32`} fill={WHITE} />}
            </svg>
          );
        })}
        {/* 五节点 */}
        {NODES.map((nd, i) => {
          const k = kf(N, [[nd.at, 0], [nd.at + 18, 1]], (u) => Math.pow(1 - u, 0.4));
          if (k <= 0) return null;
          const hot = i === flashIdx;
          return (
            <div key={i} style={{position: 'absolute', left: nd.x - 70, top: -150 + (1 - k) * 110, width: 140, height: 200, opacity: k * 0.96}}>
              {/* 节点图形 */}
              <div style={{position: 'absolute', left: 20, top: 0, transform: `scale(${hot ? 1.12 : 1})`, filter: hot ? 'brightness(1.7)' : undefined, transition: 'none'}}>
                {i === 0 && <BrowserWin x={0} y={0} w={100} h={84} skeleton={1} barP={0.5} />}
                {i === 1 && <PersonIcon cx={50} cy={52} size={86} />}
                {i === 2 && <div style={{width: 56, height: 86, border: `3px solid ${PURPLE_LIGHT}`, borderRadius: 8, background: '#000', boxShadow: '0 0 16px rgba(161,117,241,.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Audiowide', sans-serif", fontSize: 22, color: PURPLE_LIGHT}}>R</div>}
                {i === 3 && <div style={{width: 84, height: 70, border: `3px solid ${WHITE}`, borderRadius: 8, background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Sarasa Mono SC', monospace", fontSize: 24, color: WHITE}}>{EXAMPLE.tld}</div>}
                {i === 4 && <RackIcon cx={50} cy={46} w={80} h={92} units={3} lit={1 + (Math.floor(N / 30) % 2)} />}
              </div>
              {/* 编号 ①–④（root 起编号，stub 只是起点） */}
              {i > 0 && <div style={{position: 'absolute', left: 0, top: 92, width: 100, textAlign: 'center', fontFamily: "'Orbitron', sans-serif", fontSize: 34, color: PURPLE_LIGHT, opacity: 0.9}}>{'①②③④'[i - 1]}</div>}
              <div style={{position: 'absolute', left: -10, top: 138, width: 160, textAlign: 'center', fontFamily: "'Noto Sans SC', sans-serif", fontSize: 21, color: GREY}}>{nd.label}</div>
            </div>
          );
        })}
        {/* 汇总针线 */}
        <div style={{position: 'absolute', left: -500, top: 118, width: 1000, height: 2, background: GREY_LINE, opacity: 0.6}} />
      </div>
      {/* ≈100 ms（右下，主角光） */}
      {ms > 0 && (
        <div style={{position: 'absolute', left: 1000, top: 560, transform: `translate(-50%, -50%) scale(${glow})`}}>
          <span style={{fontFamily: "'Orbitron', sans-serif", fontSize: 80, fontWeight: 700, color: ORANGE, textShadow: '0 0 34px rgba(240,95,65,.75), 4px 4px 0 rgba(240,95,65,.3)'}}>&#8776;{ms} ms</span>
          <div style={{textAlign: 'center', fontFamily: "'Noto Sans SC', sans-serif", fontSize: 22, color: GREY, marginTop: 6}}>the full walk, uncached</div>
        </div>
      )}
    </div>
  );
};
export const SC16_RANGE = {from: F0, to: T};
