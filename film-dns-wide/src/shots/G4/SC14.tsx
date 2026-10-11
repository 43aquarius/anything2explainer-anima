import React from 'react';
import {useCurrentFrame} from 'remotion';
import {GlitchIn, clamp01, kf, emphasisPulse} from '../../common';
import {RackIcon, Pill, EXAMPLE, GREY, GREY_LINE, WHITE, ORANGE, PURPLE, PURPLE_LIGHT, exitOp} from '../../ui';

const F0 = 3341, T = 3556; // SC14: 3341–3556（S24：A 记录）

export const SC14: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const exitK = N > T - 8 ? exitOp(N, T) : 1;
  // 域名 SoftIn（3349）
  const nameOp = kf(N, [[3349, 0.25], [3357, 1]]);
  // Rack 承接缩小移位（3349 16 帧）
  const rackS = 0.55 + 0.45 * kf(N, [[3341, 0], [3357, 1]]); // 1→0.55 缩
  const rackX = kf(N, [[3341, 0], [3357, 300]]); // 移到右下
  // IP glitch + 逐位滚动（3435）
  const ipN = N - 3435;
  // 8 位数字滚动落定（3435+20）
  const ipRoll = clamp01((N - 3435) / 20);
  const ipStr = '192.0.2.33';
  const shown = ipN > 0 ? ipStr.split('').map((c, i) => (ipRoll > (i + 1) / ipStr.length ? c : c === '.' ? '.' : String((Number(c) + Math.floor(N / 3)) % 10))).join('') : '';
  const settled = ipRoll >= 1;
  const pulse = ipN > 32 && ipN < 62 ? emphasisPulse(ipN - 32, {peak: 1.11, up: 13, hold: 4, down: 13}) : 1;
  // 映射线 + A record Pill
  const lineK = clamp01((N - 3447) / 14);
  const pillOp = kf(N, [[3455, 0.25], [3463, 1]]);
  // 运镜：33 帧 1→1.2 推向 IP（3435 计数时）
  const zoom = 1 + 0.2 * kf(N, [[3430, 0], [3463, 1]]);
  return (
    <div style={{position: 'absolute', inset: 0, opacity: exitK}}>
      <div style={{position: 'absolute', left: 640, top: 360, transform: `translate(-50%, -50%) scale(${zoom})`}}>
        {/* Rack 缩移到右下（承接 SC13） */}
        <div style={{position: 'absolute', left: -140 + rackX, top: 40, opacity: 0.9}}>
          <div style={{transform: `scale(${rackS})`, transformOrigin: 'center', opacity: kf(N, [[3341, 0.6], [3349, 1]])}}>
            <RackIcon cx={90} cy={100} w={170} h={220} units={4} lit={2 + (Math.floor(N / 30) % 2)} />
          </div>
        </div>
        {/* 域名（上） */}
        <div style={{position: 'absolute', left: 0, top: -140, width: 640, textAlign: 'center', fontFamily: "'Noto Sans SC', sans-serif", fontWeight: 900, fontSize: 66, color: WHITE, opacity: nameOp}}>{EXAMPLE.domain}</div>
        {/* 映射线 */}
        <svg width="240" height="70" style={{position: 'absolute', left: 200, top: -60}}>
          <line x1="120" y1="4" x2="120" y2={64 * lineK} stroke={PURPLE_LIGHT} strokeWidth={3} />
          <line x1="60" y1="2" x2="180" y2="2" stroke={GREY} strokeWidth={2.5} />
        </svg>
        {/* A record Pill */}
        {pillOp > 0 && <div style={{position: 'absolute', left: -120, top: 60}}><Pill x={0} y={0} w={180} h={44} text="A record" fontSize={26} opacity={pillOp} /></div>}
        {/* IP 大字（下，主角，橙） */}
        {ipN > 0 && (
          <div style={{position: 'absolute', left: 0, top: 130, width: 640, textAlign: 'center', transform: `scale(${pulse})`}}>
            <GlitchIn N={N} f0={3435}>
              <span style={{fontFamily: "'Orbitron', sans-serif", fontSize: 88, fontWeight: 700, color: settled ? ORANGE : GREY, textShadow: settled ? '0 0 30px rgba(240,95,65,.6), 4px 4px 0 rgba(240,95,65,.25)' : undefined, letterSpacing: 2}}>{shown}</span>
            </GlitchIn>
            {/* 背景大 A 轮廓（8% 透明度） */}
            <div style={{position: 'absolute', left: 0, right: 0, top: -110, textAlign: 'center', fontFamily: "'Audiowide', sans-serif", fontSize: 260, color: WHITE, opacity: 0.06, pointerEvents: 'none'}}>A</div>
          </div>
        )}
      </div>
    </div>
  );
};
export const SC14_RANGE = {from: F0, to: T};
