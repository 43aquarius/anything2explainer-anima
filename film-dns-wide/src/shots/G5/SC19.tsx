import React from 'react';
import {useCurrentFrame} from 'remotion';
import {GlitchIn, clamp01, kf} from '../../common';
import {StickyNote, EXAMPLE, GREY, GREY_LINE, WHITE, ORANGE, PURPLE, PURPLE_LIGHT, exitOp, stagger} from '../../ui';

const F0 = 4306, T = 4658; // SC19: 4306–4658（S31–S32：三层便签塔 + 1ms）

export const SC19: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const exitK = N > T - 8 ? exitOp(N, T) : 1;
  // 三层依次入场（4314/4322/4330 差错峰——注意 timeline 上 S31.c1=4314）
  const layers = [
    {y: 60, at: 4314, label: 'browser', w: 150, h: 130, cnt: 1},
    {y: 210, at: 4322, label: 'OS', w: 180, h: 150, cnt: 2},
    {y: 390, at: 4330, label: 'resolver', w: 210, h: 170, cnt: 6},
  ];
  // 底层加厚（4425 = S31.c3）
  const stackExtra = N >= 4425 ? Math.min(2, Math.floor((N - 4425) / 16)) : 0;
  // biggest stack 灰字（4425）
  const stackOp = kf(N, [[4425, 0.25], [4433, 1]]);
  // 循环箭头（4501 = S32.c1 draw-on + 慢转）
  const arrowK = clamp01((N - 4501) / 12);
  const arrowRot = N > 4513 ? (N - 4513) * 0.02 : 0;
  // ≈1 ms glitch 计数（4537 = S32.c2）
  const msN = N - 4537;
  const ms = msN > 0 ? Math.round(kf(N, [[4537, 0], [4557, 1]])) : 0;
  // 快门（4656 后 = S32.c3；快门图标 8 帧闭合一次）
  const shutterAt = 4609; const shutN = N - shutterAt;
  const shutter = shutN > 30 && shutN < 40 ? 1 - (shutN - 30) / 10 : 1; // 光圈闭合度
  // 微脉冲（4656）
  const pulseAll = N > 4609 && N < 4636 ? 1.02 : 1;
  // 运镜：33 帧 1→1.18 推向 ≈1 ms（4609 前）
  const zoom = 1 + 0.18 * kf(N, [[4504, 0], [4537, 1]]);
  return (
    <div style={{position: 'absolute', inset: 0, opacity: exitK}}>
      <div style={{position: 'absolute', left: 640, top: 380, transform: `translate(-50%, -50%) scale(${zoom})`}}>
        {/* 左：三层便签塔 */}
        <div style={{position: 'absolute', left: -390, top: -230, width: 420, height: 620}}>
          {layers.map((L, i) => {
            const k = kf(N, [[L.at, 0], [L.at + 18, 1]], (u) => Math.pow(1 - u, 0.4));
            if (k <= 0) return null;
            return (
              <div key={i} style={{position: 'absolute', left: 210 - L.w / 2, top: L.y, opacity: k * 0.96, transform: `scale(${i === 2 ? pulseAll : 1})`}}>
                {Array.from({length: L.cnt + (i === 2 ? stackExtra : 0)}).map((_, j) => (
                  <div key={j} style={{position: 'absolute', left: (j % 2) * 10 - 5, top: -j * 26}} >
                    <StickyNote x={0} y={0} w={L.w} h={L.h} lines={[EXAMPLE.noteRows[(i + j) % 4].name]} ttl={i === 2 ? `${EXAMPLE.noteRows[(i + j) % 4].ttl - (N > 4940 ? 1 : 0)} s` : undefined} lit={i === 2 && j === L.cnt + stackExtra - 1} tilt={(i + j) % 2 ? 2 : -2} seed={i * 3 + j} />
                  </div>
                ))}
                <div style={{position: 'absolute', left: -120, top: L.h / 2 - 16, width: 100, textAlign: 'right', fontFamily: "'Noto Sans SC', sans-serif", fontSize: 24, color: i === 2 ? WHITE : GREY, fontWeight: i === 2 ? 800 : 500}}>{L.label}</div>
              </div>
            );
          })}
          {stackOp > 0 && <div style={{position: 'absolute', left: 60, top: 570, fontFamily: "'Noto Sans SC', sans-serif", fontSize: 23, color: GREY, opacity: stackOp}}>the biggest stack</div>}
        </div>
        {/* 中：循环箭头 */}
        {arrowK > 0 && (
          <div style={{position: 'absolute', left: 40, top: -30, transform: `rotate(${arrowRot}deg) scale(${arrowK})`}}>
            <svg width="86" height="86">
              <path d="M 43 8 A 35 35 0 1 1 8 43" fill="none" stroke={WHITE} strokeWidth="4.5" strokeLinecap="round" strokeDasharray={220} strokeDashoffset={(1 - arrowK) * 220} />
              <polygon points="6,30 6,56 28,43" fill="#000" stroke={WHITE} strokeWidth="3" strokeLinejoin="round" />
            </svg>
          </div>
        )}
        {/* 右：≈1 ms（主角） */}
        {msN > 0 && (
          <div style={{position: 'absolute', left: 300, top: -60, textAlign: 'center'}}>
            <GlitchIn N={N} f0={4537}>
              <span style={{fontFamily: "'Orbitron', sans-serif", fontSize: 100, fontWeight: 700, color: ORANGE, textShadow: '0 0 30px rgba(240,95,65,.65), 5px 5px 0 rgba(240,95,65,.28)'}}>&#8776;{ms} ms</span>
            </GlitchIn>
            <div style={{fontFamily: "'Noto Sans SC', sans-serif", fontSize: 24, color: GREY, marginTop: 12}}>cached answer</div>
            {/* 快门（光圈叶片） */}
            <svg width="70" height="70" style={{marginTop: 16}}>
              <circle cx="35" cy="35" r="30" fill="none" stroke={WHITE} strokeWidth="3" />
              {[0, 1, 2, 3, 4, 5].map(i => {
                const a = (i / 6) * Math.PI * 2;
                const ir = 26 * shutter;
                return <polygon key={i} points={`${35},${35} ${35 + Math.cos(a - 0.5) * 30},${35 + Math.sin(a - 0.5) * 30} ${35 + Math.cos(a) * ir},${35 + Math.sin(a) * ir} ${35 + Math.cos(a + 0.5) * 30},${35 + Math.sin(a + 0.5) * 30}`} fill="#000" stroke={WHITE} strokeWidth="1.5" />;
              })}
            </svg>
          </div>
        )}
      </div>
    </div>
  );
};
export const SC19_RANGE = {from: F0, to: T};
