import React from 'react';
import {useCurrentFrame} from 'remotion';
import {GlitchIn, clamp01, kf} from '../../common';
import {GREY, GREY_LINE, WHITE, ORANGE, CORAL, PURPLE, PURPLE_LIGHT, exitOp} from '../../ui';

const F0 = 7086, T = 7316; // SC28: 7086–7316（S48 ¶gap25：NXDOMAIN 信号；段末=下一镜头 from−9）

export const SC28: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const exitK = N > T - 10 ? exitOp(N, T) : 1;
  // NXDOMAIN glitch（7094 = S48.c1）
  const nxN = N - 7094;
  // 语义链（7163 = S48.c2 依次 draw-on）
  const chain = ['no such name', 'a signal'];
  const chainK = (i: number) => clamp01((N - 7163 - i * 24) / 12);
  // 三个依赖方（7163+48 起 2 帧错峰）
  const deps = [
    {x: 800, label: 'mail'},
    {x: 980, label: 'spam filter'},
    {x: 1160, label: 'browsers'},
  ];
  const depK = (i: number) => clamp01((N - 7211 - i * 3) / 12);
  // Cross 盖下（7217 = S48.c3）
  const crossK = N >= 7217 ? clamp01((N - 7217) / 18) : 0;
  const crossRot = (1 - crossK) * -20;
  const crossFlash = crossK >= 1 && (N % 24) < 5;
  // 三图标变灰
  const greyAll = crossK > 0.6;
  // 慢推
  const zoom = 1 + 0.06 * clamp01((N - 7120) / 60);
  return (
    <div style={{position: 'absolute', inset: 0, opacity: exitK}}>
      <div style={{position: 'absolute', left: 640, top: 380, transform: `translate(-50%, -50%) scale(${zoom})`}}>
        {/* 主角：NXDOMAIN 大字 */}
        {nxN > 0 && (
          <div style={{position: 'absolute', left: 0, top: -200, width: 640, textAlign: 'center'}}>
            <GlitchIn N={N} f0={7094}>
              <span style={{fontFamily: "'Orbitron', sans-serif", fontSize: 96, fontWeight: 700, color: WHITE, letterSpacing: 4, textShadow: `0 0 ${24 + 10 * Math.sin((nxN - 12) / 30 * Math.PI * 2)}px rgba(255,255,255,.45)`, display: 'inline-block', transform: `scale(${1 + 0.01 * Math.sin((nxN - 12) / 30 * Math.PI * 2)})`}}>NXDOMAIN</span>
            </GlitchIn>
          </div>
        )}
        {/* 打字机（7108 起填充空窗） */}
        {N >= 7108 && (() => {
          const t = 'a signal the internet depends on';
          const c = Math.min(t.length, Math.floor((N - 7108) / 1.8));
          return <div style={{position: 'absolute', left: -320, top: -116, width: 640, textAlign: 'center', fontFamily: "'Sarasa Mono SC', monospace", fontSize: 24, color: GREY}}>{t.slice(0, c)}<span style={{opacity: (N % 14) < 7 ? 1 : 0, color: WHITE}}>_</span></div>;
        })()}
        {/* 语义链（放大，下移） */}
        <div style={{position: 'absolute', left: -620, top: 30, width: 1240, textAlign: 'center'}}>
          {chain.map((c, i) => (
            <span key={i} style={{fontFamily: "'Noto Sans SC', sans-serif", fontSize: 44, color: i === 1 ? WHITE : GREY, opacity: chainK(i), margin: '0 18px'}}>{c}{i === 0 && <span style={{color: GREY_LINE, marginLeft: 18}}>&#8594;</span>}</span>
          ))}
        </div>
        {/* 三个依赖方（小图标） */}
        {deps.map((d, i) => {
          const k = depK(i);
          if (k <= 0) return null;
          return (
            <div key={i} style={{position: 'absolute', left: d.x - 80, top: 130, opacity: k * (greyAll ? 0.4 : 0.95), filter: greyAll ? 'grayscale(1)' : undefined}}>
              <div style={{width: 130, height: 110, border: `2.5px solid ${greyAll ? GREY_LINE : WHITE}`, borderRadius: 10, background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', transform: 'scale(1.3)', transformOrigin: 'center'}}>
                {i === 0 && <svg width="52" height="40"><rect x="2" y="6" width="48" height="28" fill="none" stroke={GREY} strokeWidth="2.5" /><path d="M4,8 L26,24 L48,8" fill="none" stroke={GREY} strokeWidth="2.5" /></svg>}
                {i === 1 && <svg width="52" height="46"><path d="M26,4 L48,18 V36 H4 V18 Z" fill="none" stroke={GREY} strokeWidth="2.5" /><line x1="12" y1="26" x2="40" y2="26" stroke={GREY} strokeWidth="2" /></svg>}
                {i === 2 && <svg width="52" height="42"><rect x="4" y="6" width="44" height="32" rx="4" fill="none" stroke={GREY} strokeWidth="2.5" /><line x1="12" y1="16" x2="34" y2="16" stroke={GREY} strokeWidth="2" /><line x1="12" y1="26" x2="28" y2="26" stroke={GREY} strokeWidth="2" /></svg>}
              </div>
              <div style={{marginTop: 10, textAlign: 'center', fontFamily: "'Noto Sans SC', sans-serif", fontSize: 22, color: GREY}}>{d.label}</div>
            </div>
          );
        })}
        {/* 橙 Cross 盖下（中央） */}
        {crossK > 0 && (
          <div style={{position: 'absolute', left: 460, top: 150, transform: `rotate(${crossRot}deg) scale(${1.4 + (1 - crossK) * 0.3})`}}>
            <svg width="96" height="96">
              <line x1="10" y1="10" x2="86" y2="86" stroke={CORAL} strokeWidth="12" strokeLinecap="round" />
              <line x1="86" y1="10" x2="10" y2="86" stroke={CORAL} strokeWidth="12" strokeLinecap="round" />
            </svg>
            {crossFlash && <div style={{position: 'absolute', inset: -20, background: 'rgba(241,96,67,.25)', borderRadius: 20}} />}
          </div>
        )}
      </div>
    </div>
  );
};
export const SC28_RANGE = {from: F0, to: T};
