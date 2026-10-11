import React from 'react';
import {useCurrentFrame} from 'remotion';
import {GlitchIn, clamp01, kf} from '../../common';
import {PostcardIcon, EyeGlyph, EXAMPLE, GREY, GREY_LINE, WHITE, GREEN, ORANGE, PURPLE, PURPLE_LIGHT, exitOp} from '../../ui';

const F0 = 6240, T = 6813; // SC26: 6382–6813（S44–S45：明信片 33 年 → DoT/DoH）

export const SC26: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const exitK = N > T - 8 ? exitOp(N, T) : 1;
  // 卡②③淡出（6390 起 8 帧）
  const fade23 = N >= 6390 ? Math.max(0, 1 - (N - 6390) / 8) : 1;
  // 明信片放大承接（6390-6406 位移到左半）
  const pcScale = 0.95 + 0.35 * kf(N, [[6390, 0], [6406, 1]]);
  const pcX = kf(N, [[6390, 260], [6406, -160]]);
  // 眼睛（6452 = S44.c2 依次睁；眨眼循环）
  const eyes = [{x: -60, y: -160}, {x: 130, y: -40}, {x: -10, y: 130}];
  const eyeBlink = (i: number) => {
    const openAt = 6452 + i * 14;
    if (N < openAt) return 0;
    const ph = (N + i * 17) % 90;
    return ph < 6 ? 0.1 : (ph < 12 ? 0.1 + (ph - 6) / 6 * 0.9 : 1);
  };
  // 名字被视线高亮（6517 = S44.c3）
  const scan = N >= 6517 && N < 6521;
  // 33 years（6517 后）
  const y33 = kf(N, [[6517, 0.25], [6525, 1]]);
  // 右半两卡（6584 = S45.c1）
  const dotK = N >= 6584 ? clamp01((N - 6584) / 18) : 0;
  const dohK = N >= 6604 ? clamp01((N - 6604) / 18) : 0;
  // 眼睛闭眼（6653 = S45.c2 后：全部闭）
  const closeAll = N >= 6653 ? clamp01((N - 6653) / 12) : 0;
  // 运镜：33 帧 1→1.15 推向右半（6584 前）
  const zoom = 1 + 0.15 * kf(N, [[6551, 0], [6584, 1]]);
  return (
    <div style={{position: 'absolute', inset: 0, opacity: exitK}}>
      <div style={{position: 'absolute', left: 640, top: 390, transform: `translate(-50%, -50%) scale(${zoom})`}}>
        {/* 左：明信片（33 年） */}
        <div style={{position: 'absolute', left: pcX, top: -140, transform: `scale(${pcScale})`, opacity: 1}}>
          <PostcardIcon x={0} y={0} w={300} h={210} lines={['GET ' + EXAMPLE.domain, 'plain, readable text']} stampText="UDP" />
          {/* 三只眼睛 */}
          {eyes.map((e, i) => {
            const open = Math.max(0, eyeBlink(i) - closeAll);
            const patrolX = 16 * Math.sin((N / 90 + i * 2.1) * Math.PI);
            return <div key={i} style={{position: 'absolute', left: 130 + e.x * 0.4 + patrolX, top: 105 + e.y * 0.4 + 60}}><EyeGlyph cx={0} cy={0} w={54} open={open} color={closeAll > 0.5 ? GREY : WHITE} /></div>;
          })}
          {/* 名字被视线扫过 */}
          <div style={{position: 'absolute', left: 16, top: 26, fontFamily: "'Sarasa Mono SC', monospace", fontSize: 21, color: scan ? WHITE : 'rgba(255,255,255,.9)', textShadow: scan ? '0 0 14px rgba(255,255,255,.9)' : undefined}}>{EXAMPLE.domain}</div>
          {/* 行高亮扫描（6460 起持续） */}
          {N > 6460 && (() => {
            const ph = ((N - 6460) % 60) / 60;
            const row = Math.floor(ph * 2);
            const wr = (ph * 2 - row);
            return <div style={{position: 'absolute', left: 18, top: 28 + row * 27, width: 168 * Math.min(1, wr * 1.4), height: 24, background: 'rgba(161,117,241,.28)', borderRadius: 3}} />;
          })()}
          {/* 33 years */}
          <div style={{position: 'absolute', left: -30, top: 250, width: 360, textAlign: 'center', opacity: y33}}>
            <span style={{fontFamily: "'Orbitron', sans-serif", fontSize: 56, fontWeight: 700, color: ORANGE, textShadow: '0 0 22px rgba(240,95,65,.55)'}}>33 years</span>
          </div>
        </div>
        {/* 右：DoT / DoH 卡 */}
        <div style={{position: 'absolute', left: 190, top: -160}}>
          {dotK > 0 && (
            <div style={{position: 'absolute', left: 0, top: 0, transform: `scale(${dotK})`}}>
              <div style={{width: 300, height: 130, background: '#000', border: `2.5px solid ${closeAll > 0.5 ? GREEN : WHITE}`, borderRadius: 12, boxShadow: closeAll > 0.5 ? '0 0 18px rgba(143,247,64,.35)' : undefined}} />
              <div style={{position: 'absolute', left: 20, top: 18, fontFamily: "'Exo 2', sans-serif", fontStyle: 'italic', fontWeight: 700, fontSize: 40, color: PURPLE_LIGHT}}><GlitchIn N={N} f0={6584}>DoT</GlitchIn></div>
              <div style={{position: 'absolute', left: 20, top: 74, fontFamily: "'Orbitron', sans-serif", fontSize: 26, color: GREY}}>2016</div>
              <svg width="44" height="44" style={{position: 'absolute', right: 20, top: 40}}><rect x="8" y="20" width="28" height="22" rx="4" fill="none" stroke={WHITE} strokeWidth="2.5" /><path d="M14,20 v-6 a8,8 0 0 1 16,0 v6" fill="none" stroke={WHITE} strokeWidth="2.5" /></svg>
            </div>
          )}
          {dohK > 0 && (
            <div style={{position: 'absolute', left: 0, top: 160, transform: `scale(${dohK})`}}>
              <div style={{width: 300, height: 130, background: '#000', border: `2.5px solid ${closeAll > 0.5 ? GREEN : WHITE}`, borderRadius: 12, boxShadow: closeAll > 0.5 ? '0 0 18px rgba(143,247,64,.35)' : undefined}} />
              <div style={{position: 'absolute', left: 20, top: 18, fontFamily: "'Exo 2', sans-serif", fontStyle: 'italic', fontWeight: 700, fontSize: 40, color: PURPLE_LIGHT}}>DoH</div>
              <div style={{position: 'absolute', left: 20, top: 74, fontFamily: "'Orbitron', sans-serif", fontSize: 26, color: GREY}}>2018</div>
              <svg width="44" height="44" style={{position: 'absolute', right: 20, top: 40}}><rect x="8" y="20" width="28" height="22" rx="4" fill="none" stroke={WHITE} strokeWidth="2.5" /><path d="M14,20 v-6 a8,8 0 0 1 16,0 v6" fill="none" stroke={WHITE} strokeWidth="2.5" /></svg>
            </div>
          )}
        </div>
        {/* https 地址条 */}
        {closeAll > 0 && <div style={{position: 'absolute', left: 120, top: 330, opacity: closeAll * 0.75, fontFamily: "'Sarasa Mono SC', monospace", fontSize: 26, color: GREY, border: `2px solid ${GREY_LINE}`, borderRadius: 14, padding: '4px 18px'}}>https:// ...</div>}
      </div>
    </div>
  );
};
export const SC26_RANGE = {from: F0, to: T};
