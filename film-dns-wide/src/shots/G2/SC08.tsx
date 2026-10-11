import React from 'react';
import {useCurrentFrame} from 'remotion';
import {GlitchIn, clamp01, kf, emphasisPulse} from '../../common';
import {TreeTier, EXAMPLE, GREY, GREY_LINE, WHITE, PURPLE, PURPLE_LIGHT, exitOp, stagger, GLOW_PURPLE_S} from '../../ui';

const F0 = 1645, T = 1942; // SC08: {S12.from-8}–{S14.from-9}（S12–S13：DNS 诞生 · 高光时刻·论点型）

export const SC08: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const exitK = N > T - 8 ? exitOp(N, T) : 1;
  // 年份计数落定（1653–1673）+ 人名/出处 SoftIn
  const y83 = kf(N, [[1653, 0.3], [1673, 1]]);
  const yearCount = Math.round(kf(N, [[1653, 1900], [1673, 1983]]));
  // 关键句逐词打字机（1685 起，每词 9 帧）
  const WORDS = ['proposed', 'a', 'different', 'design:', 'no', 'central', 'book', 'at', 'all'];
  const wordN = Math.max(0, Math.floor((N - 1685) / 9));
  // 层级树生长（1779 = S12.c3 起：顶点→二→三层）
  const treeP = N >= 1790 ? clamp01((N - 1790) / 60) : 0;
  // DNS 大字 glitch（1903 = S13.c2）
  const bigN = N - 1903;
  const pulse = bigN > 12 && bigN < 42 ? emphasisPulse(bigN - 12, {peak: 1.11, up: 13, hold: 4, down: 13}) : 1;
  // 树微推（1827 = S13.c1）
  const treeZoom = 1 + 0.05 * kf(N, [[1827, 0], [1855, 1]]);
  // 运镜：33 帧 1→1.18 推向树（1855 前）
  const zoom = 1 + 0.13 * kf(N, [[1885, 0], [1918, 1]]);
  return (
    <div style={{position: 'absolute', inset: 0, opacity: exitK}}>
      {/* 上半：年份 + 人名（左侧） */}
      <div style={{position: 'absolute', left: 200, top: 200, opacity: y83}}>
        <div style={{fontFamily: "'Orbitron', sans-serif", fontSize: 96, fontWeight: 700, color: WHITE, textShadow: '6px 6px 0 #6630F8, 0 0 28px rgba(102,48,248,.45)'}}>1983</div>
        <div style={{fontFamily: "'Noto Sans SC', sans-serif", fontSize: 26, color: GREY, marginTop: 10}}>Paul Mockapetris</div>
        <div style={{fontFamily: "'Sarasa Mono SC', monospace", fontSize: 22, color: GREY_LINE, marginTop: 6}}>RFC 882 / 883</div>
        <div style={{fontFamily: "'Noto Sans SC', sans-serif", fontSize: 25, color: GREY, marginTop: 26, width: 330, lineHeight: 1.5}}>{WORDS.slice(0, wordN).join(' ')}<span style={{opacity: (N % 14) < 7 && wordN < WORDS.length ? 1 : 0, color: PURPLE_LIGHT}}> ▌</span>{wordN >= 5 ? <b style={{color: WHITE}}> {WORDS.slice(5, wordN).join(' ')}</b> : null}</div>
      </div>
      {/* 主角：层级树（下半，grow draw-on） */}
      <div style={{position: 'absolute', left: 640, top: 500, transform: `translate(-50%, -50%) scale(${treeZoom * zoom})`}}>
        {treeP > 0 && <TreeTier cx={0} cy={-10} w={640} progress={treeP} litLeaf={Math.floor((N - 1850) / 40) % 6} />}
      </div>
      {/* DNS 大字（1903 glitch，本镜唯一） */}
      {bigN > 0 && (
        <div style={{position: 'absolute', left: 640, top: 190, transform: `translate(-50%, -50%) scale(${pulse})`}}>
          <GlitchIn N={N} f0={1903}>
            <span style={{fontFamily: "'Noto Sans SC', sans-serif", fontWeight: 900, fontSize: 56, color: WHITE, WebkitTextStroke: '2.5px #6630F8', paintOrder: 'stroke fill', letterSpacing: 1, filter: 'drop-shadow(0 0 16px rgba(102,48,248,.6))'}}>Domain Name System</span>
          </GlitchIn>
          <div style={{textAlign: 'center', fontFamily: "'Exo 2', sans-serif", fontStyle: 'italic', fontSize: 26, color: PURPLE_LIGHT, marginTop: 18, opacity: bigN > 16 ? 1 : 0}}>a hierarchy, worldwide</div>
        </div>
      )}
    </div>
  );
};
export const SC08_RANGE = {from: F0, to: T};
