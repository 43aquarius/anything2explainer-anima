import React from 'react';
import {useCurrentFrame} from 'remotion';
import {clamp01, kf} from '../../common';
import {PacketIcon, EXAMPLE, GREY, GREY_LINE, WHITE, GREEN, ORANGE, PURPLE, PURPLE_LIGHT, exitOp, stagger} from '../../ui';

const F0 = 7629, T = 7971; // SC30: 7629–7971（S51–S52：僵尸网络攻击）

// 3×4 军团：cam / printer / monitor
const LEGION = Array.from({length: 12}).map((_, i) => ({i, kind: i % 3}));

export const SC30: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const exitK = N > T - 8 ? exitOp(N, T) : 1;
  // 军团入场（7700 = S52.c1 起 2 帧错峰；7752 前）——首帧军团先入（镜头首帧起）
  const legAt = (i: number) => 7629 + stagger(i, 4);
  // 红点（劫持标记）：每 10 帧一枚
  const redAt = (i: number) => 7637 + i * 10;
  // 2016 YearRoll（7752 = S52.c1）
  const roll = clamp01((N - 7752) / 14);
  const y16 = roll >= 1 ? 2016 : 2000 + Math.floor(roll * 17);
  // 信封潮（7826 = S52.c2 起）：密度渐增
  // 潮水线（7902 = S52.c3 淹没感）：每 30 帧 +20px
  const tide = N >= 7902 ? Math.min(238, ((N - 7902) / 30) * 20) : 0;
  // 柜台灯绿转橙红
  const alarm = N >= 7902 && (N % 14) < 7;
  // 运镜：33 帧 1→1.15 推向柜台（7869-7902）
  const zoom = 1 + 0.15 * kf(N, [[7869, 0], [7902, 1]]);
  return (
    <div style={{position: 'absolute', inset: 0, opacity: exitK}}>
      <div style={{position: 'absolute', left: 640, top: 390, transform: `translate(-50%, -50%) scale(${zoom})`}}>
        {/* 上：2016 */}
        <div style={{position: 'absolute', left: -360, top: -280, fontFamily: "'Orbitron', sans-serif", fontSize: 62, fontWeight: 700, color: GREY, filter: roll > 0 && roll < 1 ? `blur(${9 - roll * 9}px)` : undefined, opacity: roll > 0 ? 1 : 0}}>{roll > 0 ? y16 : ''}</div>
        {/* 左：僵尸军团 3×4 */}
        <div style={{position: 'absolute', left: -560, top: -140, width: 380, height: 360}}>
          {LEGION.map(({i, kind}) => {
            const k = clamp01((N - legAt(i)) / 12);
            if (k <= 0) return null;
            const col = i % 4, row = Math.floor(i / 4);
            const red = N >= redAt(i);
            return (
              <div key={i} style={{position: 'absolute', left: col * 92 + 10 + ((N + i * 7) % 30 < 4 ? 2 : 0), top: row * 116 + 6 - ((N + i * 11) % 42 < 5 ? 3 : 0), opacity: k * 0.95}}>
                <svg width="72" height="72">
                  {/* 摄像头 */}
                  {kind === 0 && <g><rect x="8" y="20" width="34" height="26" rx="4" fill="#000" stroke={GREY} strokeWidth="2.5" /><circle cx="25" cy="33" r="6" fill="#000" stroke={GREY} strokeWidth="2" /><rect x="42" y="28" width="18" height="10" fill="#000" stroke={GREY} strokeWidth="2" /><line x1="14" y1="52" x2="14" y2="64" stroke={GREY} strokeWidth="2.5" /><line x1="36" y1="52" x2="36" y2="64" stroke={GREY} strokeWidth="2.5" /></g>}
                  {/* 打印机 */}
                  {kind === 1 && <g><rect x="8" y="26" width="56" height="24" rx="4" fill="#000" stroke={GREY} strokeWidth="2.5" /><rect x="16" y="12" width="24" height="14" fill="#000" stroke={GREY} strokeWidth="2" /><line x1="20" y1="54" x2="20" y2="66" stroke={GREY} strokeWidth="2.5" /><line x1="52" y1="54" x2="52" y2="66" stroke={GREY} strokeWidth="2.5" /></g>}
                  {/* 婴儿监视器 */}
                  {kind === 2 && <g><rect x="12" y="14" width="48" height="40" rx="6" fill="#000" stroke={GREY} strokeWidth="2.5" /><circle cx="36" cy="34" r="8" fill="#000" stroke={GREY} strokeWidth="2" /><line x1="36" y1="54" x2="36" y2="66" stroke={GREY} strokeWidth="2.5" /><line x1="20" y1="18" x2="28" y2="18" stroke={GREY} strokeWidth="2" /></g>}
                </svg>
                {/* 被劫持红点 */}
                {red && <div style={{position: 'absolute', right: 8, top: 2, width: 12, height: 12, borderRadius: '50%', background: ORANGE, boxShadow: '0 0 10px rgba(240,95,65,.95)', opacity: 0.6 + 0.4 * ((N + i * 5) % 20 < 10 ? 1 : 0.3)}} />}
              </div>
            );
          })}
          <div style={{position: 'absolute', left: 0, bottom: -34, fontFamily: "'Noto Sans SC', sans-serif", fontSize: 22, color: GREY, opacity: kf(N, [[7645, 0], [7657, 1]])}}>hijacked devices</div>
        </div>
        {/* 中：信封潮 */}
        {N >= 7826 && (() => {
          const elapsed = N - 7826;
          const waves = Math.min(14, 3 + Math.floor(elapsed / 26));
          return Array.from({length: waves}).map((_, i) => {
            const t = ((elapsed * 0.026 + i * 0.6) % 1);
            const x = -170 + t * 560;
            const y = -20 - Math.sin(t * Math.PI) * 46 + (i % 3) * 22;
            return <div key={i} style={{position: 'absolute', left: x, top: y, opacity: t < 0.92 ? 0.92 : (1 - t) * 12}}><PacketIcon cx={0} cy={0} w={40} h={28} accent /></div>;
          });
        })()}
        {/* 右：Dyn 柜台（被淹没） */}
        <div style={{position: 'absolute', left: 420, top: -120, width: 300}}>
          <div style={{width: 280, height: 180, background: '#000', border: `3px solid ${WHITE}`, borderRadius: 10, position: 'relative'}}>
            <div style={{position: 'absolute', left: 0, right: 0, top: 14, textAlign: 'center', fontFamily: "'Exo 2', sans-serif", fontStyle: 'italic', fontWeight: 700, fontSize: 34, color: WHITE}}>Dyn</div>
            <div style={{position: 'absolute', left: 0, right: 0, top: 58, textAlign: 'center', fontFamily: "'Noto Sans SC', sans-serif", fontSize: 22, color: GREY}}>DNS provider</div>
            {/* 指示灯（绿→橙红快闪） */}
            {[0, 1, 2].map(i => <div key={i} style={{position: 'absolute', left: 40 + i * 40, bottom: 22, width: 14, height: 14, borderRadius: '50%', background: alarm ? ORANGE : GREEN, boxShadow: `0 0 10px ${alarm ? 'rgba(240,95,65,.9)' : 'rgba(143,247,64,.7)'}`}} />)}
          </div>
          {/* 潮水线（橙浪上漫） */}
          {tide > 0 && (
            <div style={{position: 'absolute', left: -20, bottom: -8, width: 320, height: tide, background: 'linear-gradient(to top, rgba(240,95,65,.55), rgba(240,95,65,.12))', borderRadius: 6, opacity: 0.85}}>
              <svg width="320" height="20" style={{position: 'absolute', top: 0, left: 0}}><path d={`M0,10 Q40,${10 + 6 * Math.sin(N / 10)} 80,10 T160,${10 - 4 * Math.cos(N / 12)} T240,10 T320,${10 + 5 * Math.sin(N / 9)}`} fill="none" stroke={ORANGE} strokeWidth="3" /></svg>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export const SC30_RANGE = {from: F0, to: T};
