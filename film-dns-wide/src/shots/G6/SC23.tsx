import React from 'react';
import {useCurrentFrame} from 'remotion';
import {GlitchIn, clamp01, kf, emphasisPulse} from '../../common';
import {StickyNote, EXAMPLE, GREY, GREY_LINE, WHITE, ORANGE, RED_DEEP, PURPLE, PURPLE_LIGHT, exitOp, stagger, GLOW_ORANGE, GLOW_RED} from '../../ui';

const F0 = 5545, T = 5980; // SC23: {S39.from-8}–{S41.from-9}（S39–S40 ¶：1.9T 大数字 · 全片最高潮）

export const SC23: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const exitK = N > T - 8 ? exitOp(N, T) : 1;
  // 上半：九便签 TTL 同步倒数到 0 → 逐张灰掉（5553 起）
  const ttlZero = clamp01((N - 5553) / 14);
  const greyAt = (i: number) => 5567 + stagger(i, 3) + Math.floor(i / 3) * 8;
  const greying = (i: number) => clamp01((N - greyAt(i)) / 10);
  // SERVFAIL Pill（全部灰后）
  const sfK = N >= 5640 ? clamp01((N - 5640) / 12) : 0;
  // 1.9 T glitch + 计数（5749 = S40.c2）
  const tN = N - 5749;
  const tCount = tN > 0 ? kf(N, [[5749, 0], [5769, 1.9]]) : 0;
  const pulse = tN > 32 && tN < 62 ? emphasisPulse(tN - 32, {peak: 1.11, up: 13, hold: 4, down: 13}) : 1;
  // per day + one resolver（5799 = S40.c3）
  const subOp = kf(N, [[5799, 0.25], [5807, 1]]);
  // 计数器拨盘（5865 = S40.c4 持续转）
  const dialRot = N >= 5800 ? (N - 5800) * 6 : 0;
  // 运镜：33 帧 1→1.25 推向 1.9T（5749 计数时）
  const zoom = 1 + 0.25 * kf(N, [[5740, 0], [5773, 1]]);
  return (
    <div style={{position: 'absolute', inset: 0, opacity: exitK}}>
      <div style={{position: 'absolute', left: 640, top: 380, transform: `translate(-50%, -50%) scale(${zoom})`}}>
        {/* 上：九便签变灰（缩微） */}
        <div style={{position: 'absolute', left: -260, top: -310, width: 520, height: 220, transform: `scale(1.04) translateY(${kf(N, [[5615, 0], [5635, 12]])}px)`, transformOrigin: 'top center'}}>
          {Array.from({length: 9}).map((_, i) => {
            const g = greying(i);
            const col = i % 3, row = Math.floor(i / 3);
            return (
              <div key={i} style={{position: 'absolute', left: col * 172, top: row * 70, opacity: 1 - g * 0.45, filter: `grayscale(${g})`}}>
                <StickyNote x={0} y={0} w={150} h={80} lines={['facebook.com']} ttl={g >= 1 ? '0 s' : `${Math.max(0, Math.round((1 - ttlZero) * 60))} s`} ttlColor={ORANGE} tilt={0} seed={i} />
              </div>
            );
          })}
        </div>
        {/* SERVFAIL 红警示 Pill */}
        {sfK > 0 && (
          <div style={{position: 'absolute', left: -300, top: -120, transform: `translateX(240px) scale(${sfK})`}}>
            <div style={{border: `2.5px solid ${RED_DEEP}`, borderRadius: 8, padding: '6px 22px', background: '#000', fontFamily: "'Orbitron', sans-serif", fontSize: 27, color: RED_DEEP, letterSpacing: 2, boxShadow: `0 0 ${26 + 14 * Math.sin(N / 18 * Math.PI)}px rgba(236,8,31,.5)`}}>SERVFAIL</div>
          </div>
        )}
        {/* 打字机：不再是答案（5660 起） */}
        {N >= 5660 && (() => {
          const t = 'facebook.com stopped being an answer — anywhere';
          const c = Math.min(t.length, Math.floor((N - 5660) / 4.7));
          return <div style={{position: 'absolute', left: 0, top: -80, width: 640, textAlign: 'center', fontFamily: "'Sarasa Mono SC', monospace", fontSize: 25, color: GREY}}>{t.slice(0, c)}<span style={{opacity: (N % 14) < 7 ? 1 : 0, color: WHITE}}>_</span></div>;
        })()}
        {/* 主角：1.9 T 大数字（下半） */}
        {tN > 0 && (
          <div style={{position: 'absolute', left: 0, top: 60, transform: `scale(${pulse * (tN > 20 ? 1 + 0.025 * Math.sin((tN - 20) / 34 * Math.PI * 2) : 1)})`, textAlign: 'center'}}>
            <GlitchIn N={N} f0={5749}>
              <span style={{fontFamily: "'Orbitron', sans-serif", fontSize: 150, fontWeight: 700, color: ORANGE, textShadow: `0 0 ${50 + 18 * Math.sin((N - 5769) / 30 * Math.PI * 2)}px rgba(240,95,65,.85), 7px 7px 0 rgba(240,95,65,.3)`}}>{tCount.toFixed(1)} T</span>
            </GlitchIn>
            {subOp > 0 && (
              <div>
                <div style={{fontFamily: "'Noto Sans SC', sans-serif", fontSize: 34, color: GREY, marginTop: 4, opacity: subOp}}>lookups <b style={{color: WHITE}}>per day</b></div>
                <div style={{fontFamily: "'Noto Sans SC', sans-serif", fontSize: 23, color: GREY, marginTop: 14, opacity: subOp}}>one resolver alone — {EXAMPLE.resolver}</div>
              </div>
            )}
          </div>
        )}
        {/* 左：转发拨盘计数器 */}
        {N >= 5800 && (
          <div style={{position: 'absolute', left: -320, top: 110, textAlign: 'center'}}>
            <svg width="100" height="100" style={{transform: `rotate(${dialRot}deg)`}}>
              <circle cx="50" cy="50" r="44" fill="none" stroke={WHITE} strokeWidth="3" />
              {[0, 1, 2, 3, 4, 5, 6, 7].map(i => {
                const a = (i / 8) * Math.PI * 2;
                return <line key={i} x1={50 + Math.cos(a) * 34} y1={50 + Math.sin(a) * 34} x2={50 + Math.cos(a) * 44} y2={50 + Math.sin(a) * 44} stroke={GREY} strokeWidth="2.5" />;
              })}
              <line x1="50" y1="50" x2="50" y2="10" stroke={ORANGE} strokeWidth="3.5" />
            </svg>
            <div style={{fontFamily: "'Orbitron', sans-serif", fontSize: 22, color: WHITE, marginTop: 8}}>{EXAMPLE.volSec}</div>
          </div>
        )}
      </div>
    </div>
  );
};
export const SC23_RANGE = {from: F0, to: T};
