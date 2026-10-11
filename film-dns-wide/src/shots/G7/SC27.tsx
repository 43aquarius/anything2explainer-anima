import React from 'react';
import {useCurrentFrame} from 'remotion';
import {GlitchIn, clamp01, kf} from '../../common';
import {EXAMPLE, GREY, GREY_LINE, WHITE, ORANGE, PURPLE, PURPLE_LIGHT, exitOp} from '../../ui';
import {HeroGlow} from '../../fx';

const F0 = 6814, T = 7085; // SC27: 6814–7085（S46–S47：19 天的谎言）

export const SC27: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const exitK = N > T - 8 ? exitOp(N, T) : 1;
  // 大书 slideUp（6822 = S46.c1）
  const bookY = kf(N, [[6822, 100], [6840, 0]], (u) => Math.pow(1 - u, 2.5));
  // 2003 YearRoll（6882 = S47.c1）+ 19 days glitch 计数（6956 = S47.c2）
  const roll = clamp01((N - 6882) / 14);
  const year = 2003;
  const d19 = N >= 6956 ? Math.round(kf(N, [[6956, 0], [6976, 19]])) : 0;
  // 错拼域名飘落（7019 = S47.c3 起持续）
  const typos = ['shopp.example', 'sho.example', 'shop.example.com'];
  const adPulse = 0.75 + 0.25 * Math.sin(N / 22 * Math.PI * 2);
  // 运镜：33 帧 1→1.18 推向广告页（6986 前）
  const zoom = 1 + 0.18 * kf(N, [[6953, 0], [6986, 1]]);
  return (
    <div style={{position: 'absolute', inset: 0, opacity: exitK}}>
      <div style={{position: 'absolute', left: 640, top: 400, transform: `translate(-50%, -50%) scale(${zoom})`}}>
        {/* 年份 + 19 days（上） */}
        <div style={{position: 'absolute', left: -340, top: -290, textAlign: 'center', width: 680}}>
          <span style={{fontFamily: "'Orbitron', sans-serif", fontSize: 64, fontWeight: 700, color: GREY, filter: roll < 1 ? `blur(${9 - 2 * roll}px)` : undefined, opacity: roll > 0 ? 1 : 0}}>2003</span>
          {d19 > 0 && (
            <span style={{marginLeft: 40, fontFamily: "'Orbitron', sans-serif", fontSize: 96, fontWeight: 700, color: ORANGE, textShadow: '0 0 30px rgba(240,95,65,.7), 5px 5px 0 rgba(240,95,65,.3)'}}>
              <GlitchIn N={N} f0={6956}>{d19} days</GlitchIn>
            </span>
          )}
        </div>
        {/* 主角：大书（翻开） */}
        <div style={{position: 'absolute', left: -330, top: -170 + bookY}}>
          <HeroGlow x={-330} y={-160} w={660} h={340} N={N} k={0.45} />
          <svg width="660" height="330">
            {/* 左页 */}
            <path d="M330,20 C260,-4 140,0 30,26 V310 C140,284 260,288 330,310 Z" fill="#000" stroke={WHITE} strokeWidth="3" strokeLinejoin="round" />
            {/* 右页 */}
            <path d="M330,20 C400,-4 520,0 630,26 V310 C520,284 400,288 330,310 Z" fill="#000" stroke={WHITE} strokeWidth="3" strokeLinejoin="round" />
            {/* 书脊 */}
            <line x1="330" y1="20" x2="330" y2="310" stroke={WHITE} strokeWidth="3.5" />
            {/* 左页内容：.com 列表 */}
            <text x="150" y="90" fontFamily="'Sarasa Mono SC', monospace" fontSize="42" fill={GREY} textAnchor="middle">.com</text>
            {[0, 1, 2].map(j => <line key={j} x1="80" y1={130 + j * 44} x2="280" y2={130 + j * 44} stroke={GREY_LINE} strokeWidth="2" strokeDasharray="6 5" />)}
            {/* 右页：广告位 */}
            <rect x="400" y="70" width="200" height="170" fill="none" stroke={ORANGE} strokeWidth="3" strokeDasharray="10 6" opacity={adPulse} />
            <text x="500" y="165" fontFamily="'Audiowide', sans-serif" fontSize="40" fill={ORANGE} textAnchor="middle" opacity={adPulse}>ad</text>
          </svg>
        </div>
        {/* 错拼域名飘落进广告位（持续） */}
        {N >= 7019 && (() => {
          const ph = Math.floor((N - 7019) / 46);
          return typos.map((t, i) => {
            const p = clamp01(((N - 7019) % 46) / 46);
            const which = (ph + i) % 3;
            const x0 = 90 + which * 220 + 100;
            const x1 = 500;
            const y0 = -350;
            const y1 = 60;
            const ease = p * p;
            const px = x0 + (x1 - x0) * ease;
            const py = y0 + (y1 - y0) * ease;
            const show = i === 0 || ph > 0;
            return show && p < 1 ? (
              <div key={i} style={{position: 'absolute', left: px - 80, top: py, fontFamily: "'Sarasa Mono SC', monospace", fontSize: 22, color: p > 0.85 ? ORANGE : GREY, opacity: 0.95}}>{typos[which]}</div>
            ) : null;
          });
        })()}
      </div>
    </div>
  );
};
export const SC27_RANGE = {from: F0, to: T};
