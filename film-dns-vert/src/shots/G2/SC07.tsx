import React from 'react';
import {useCurrentFrame} from 'remotion';
import {clamp01, kf} from '../../common';
import {PacketIcon, BrowserWin, EXAMPLE, GREY, GREY_LINE, WHITE, ORANGE, PURPLE, PURPLE_LIGHT, exitOp} from '../../ui';

const F0 = 1202, T = 1399; // SC07: 1202–1399（S10–S11：全程 <0.1s + 便签）

export const SC07: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const exitK = N > T - 8 ? exitOp(N, T) : 1;
  // 旅程带（竖版纵向：浏览器→resolver→root→answer）
  const bandK = clamp01((N - 1210) / 24);
  const stops = [
    {y: 330, at: 1216, label: 'browser'},
    {y: 470, at: 1230, label: 'resolver'},
    {y: 610, at: 1244, label: 'counters'},
    {y: 750, at: 1258, label: 'A record'},
  ];
  // ≈0.1s（1242 = S10.c2）
  const ms = N >= 1242 ? Math.round(kf(N, [[1242, 0], [1262, 100]])) : 0;
  // 便签（1294 = S11.c1）
  const noteOp = kf(N, [[1294, 0.25], [1302, 1]]);
  const ttl = Math.max(0, 60 - Math.floor(Math.max(0, N - 1310) / 30));
  return (
    <div style={{position: 'absolute', inset: 0, opacity: exitK}}>
      {/* 左：纵向旅程带 */}
      <div style={{position: 'absolute', left: 130}}>
        <div style={{position: 'absolute', left: 30, top: 330, width: 3, height: 420 * bandK, background: WHITE}} />
        {stops.map((s, i) => {
          const k = clamp01((N - s.at) / 10);
          const hot = N > 1280 ? Math.floor((N - 1280) / 40) % 4 : -1;
          if (k <= 0) return null;
          return (
            <div key={i} style={{position: 'absolute', left: 12, top: s.y - 26, opacity: k, transform: `scale(${i === hot ? 1.16 : 1})`}}>
              <div style={{width: 40, height: 40, borderRadius: 10, border: `2.5px solid ${i === 3 ? PURPLE_LIGHT : WHITE}`, background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, color: GREY}}>{i + 1}</div>
              <div style={{position: 'absolute', left: 56, top: 8, fontFamily: "'Noto Sans SC', sans-serif", fontSize: 22, color: GREY, whiteSpace: 'nowrap'}}>{s.label}</div>
            </div>
          );
        })}
      </div>
      {/* 右：≈ms（主角） */}
      {ms > 0 && (
        <div style={{position: 'absolute', left: 380, top: 400}}>
          <span style={{fontFamily: "'Orbitron', sans-serif", fontSize: 84, fontWeight: 700, color: ORANGE, textShadow: '0 0 30px rgba(240,95,65,.7), 4px 4px 0 rgba(240,95,65,.3)'}}>&#8776;{ms} ms</span>
          <div style={{fontFamily: "'Noto Sans SC', sans-serif", fontSize: 23, color: GREY, marginTop: 10}}>the full walk</div>
        </div>
      )}
      {/* 便签（S11） */}
      {noteOp > 0 && (
        <div style={{position: 'absolute', left: 380, top: 640, opacity: noteOp, transform: 'rotate(-2deg)'}}>
          <div style={{width: 240, height: 200, background: '#000', border: `2.5px solid ${PURPLE_LIGHT}`, borderRadius: 4, position: 'relative', boxShadow: '0 0 20px rgba(102,48,248,.35)'}}>
            <div style={{position: 'absolute', left: 68, top: -9, width: 100, height: 18, background: 'rgba(102,48,248,.4)', border: '1.5px solid rgba(161,117,241,.8)'}} />
            <div style={{padding: '30px 18px 0', fontFamily: "'Noto Sans SC', sans-serif", fontSize: 24, color: WHITE, lineHeight: 1.6}}>{EXAMPLE.domain}<br /><span style={{color: PURPLE_LIGHT}}>= {EXAMPLE.ip}</span></div>
            <div style={{position: 'absolute', right: 10, bottom: 10, border: `1.5px dashed ${ORANGE}`, padding: '2px 8px', fontFamily: "'Orbitron', sans-serif", fontSize: 20, color: ORANGE}}>{ttl} s</div>
          </div>
          <div style={{fontFamily: "'Noto Sans SC', sans-serif", fontSize: 22, color: GREY, marginTop: 12}}>answers live on sticky notes</div>
        </div>
      )}
    </div>
  );
};
export const SC07_RANGE = {from: F0, to: T};
