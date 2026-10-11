import React from 'react';
import {useCurrentFrame} from 'remotion';
import {GlitchIn, clamp01, kf} from '../../common';
import {StickyNote, EXAMPLE, GREY, GREY_LINE, WHITE, ORANGE, GREEN, PURPLE, PURPLE_LIGHT, exitOp} from '../../ui';

const F0 = 4974, T = 5258; // SC21: 4974–5258（S35–S36：传播的真相）

export const SC21: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const exitK = N > T - 8 ? exitOp(N, T) : 1;
  // 左半：propagation 删除线 + nothing is pushed glitch（4982/5015）
  const delK = clamp01((N - 4995) / 12);
  const pushN = N - 5015;
  // 冰箱（5109 = S36.c1 draw-on 20 帧）
  const fridgeK = clamp01((N - 5109) / 20);
  // 新便签贴上（5146 = S36.c2）
  const newK = N >= 5146 ? clamp01((N - 5146) / 18) : 0;
  // 旧三张 TTL 倒计时持续（5146 起；5230 冻结）
  const ttlOf = (base: number) => N < 5230 ? Math.max(0, base - Math.floor((N - 5146) / 30)) : Math.max(0, base - Math.floor((5230 - 5146) / 30));
  // 8s 那张闪红（5216 = S36.c3）
  const alarm = N >= 5216 && (N % 20) < 10;
  // expire 灰字（5216）
  const expOp = kf(N, [[5216, 0.25], [5224, 1]]);
  // 运镜：33 帧 1→1.12 推向便签组（5146 前）
  const zoom = 1 + 0.12 * kf(N, [[5113, 0], [5146, 1]]);
  return (
    <div style={{position: 'absolute', inset: 0, opacity: exitK}}>
      <div style={{position: 'absolute', left: 640, top: 380, transform: `translate(-50%, -50%) scale(${zoom})`}}>
        {/* 左半：propagation 谎言 */}
        <div style={{position: 'absolute', left: -600, top: -40, width: 460, textAlign: 'center'}}>
          <div style={{position: 'relative', display: 'inline-block', fontFamily: "'Noto Sans SC', sans-serif", fontSize: 40, color: GREY, opacity: kf(N, [[4982, 0.25], [4990, 1]])}}>
            "DNS propagation"
            <div style={{position: 'absolute', left: -14, right: -14, top: '50%', height: 5, background: ORANGE, transform: `scaleX(${delK})`, boxShadow: '0 0 10px rgba(240,95,65,.8)'}} />
          </div>
          {pushN > 0 && (
            <svg width="180" height="110" style={{marginTop: 24, display: 'block', margin: '24px auto 0'}}>
              <circle cx="90" cy="55" r="50" fill="none" stroke={ORANGE} strokeWidth="4" strokeDasharray="14 8" />
              <line x1="60" y1="55" x2="120" y2="55" stroke={GREY} strokeWidth="6" />
              <polygon points="120,40 142,55 120,70" fill="#000" stroke={GREY} strokeWidth="4" strokeLinejoin="round" />
              <line x1="66" y1="31" x2="114" y2="79" stroke={ORANGE} strokeWidth="7" strokeLinecap="round" />
              <line x1="114" y1="31" x2="66" y2="79" stroke={ORANGE} strokeWidth="7" strokeLinecap="round" />
            </svg>
          )}
          {pushN > 0 && (
            <div style={{marginTop: 28}}>
              <GlitchIn N={N} f0={5015}>
                <span style={{fontFamily: "'Noto Sans SC', sans-serif", fontWeight: 900, fontSize: 44, color: WHITE, WebkitTextStroke: '2px #6630F8', paintOrder: 'stroke fill'}}>nothing is pushed</span>
              </GlitchIn>
            </div>
          )}
        </div>
        {/* 右半：冰箱 + 便签（主角组） */}
        {fridgeK > 0 && (
          <div style={{position: 'absolute', left: 60, top: -180, width: 520, height: 400}}>
            {/* 冰箱轮廓 */}
            <div style={{position: 'absolute', inset: 0, border: `3px solid ${WHITE}`, borderRadius: 14, background: '#000', opacity: 0.92}} />
            {/* 冰箱门缝 */}
            <div style={{position: 'absolute', left: 0, right: 0, top: 130, height: 3, background: GREY_LINE}} />
            {/* 门把手 */}
            <div style={{position: 'absolute', right: 26, top: 60, width: 7, height: 44, background: GREY, borderRadius: 3}} />
            {/* 旧三张便签（TTL 倒计时） */}
            {[0, 1, 2].map(i => {
              const at = 5109 + 24 + i * 10;
              const k = clamp01((N - at) / 12);
              const rows = EXAMPLE.noteRows;
              const base = [53, 27, 8][i];
              const isAlarm = i === 2 && alarm;
              return k > 0 && (
                <div key={i} style={{position: 'absolute', left: 46 + i * 150, top: 176 + (i % 2) * 44, transform: `scale(${k})`}}>
                  <StickyNote x={0} y={0} w={130} h={110} lines={[rows[i + 1].name]} ttl={`${ttlOf(base)} s`} ttlColor={isAlarm ? ORANGE : GREY} tilt={i % 2 ? 2 : -3} seed={i + 7} />
                </div>
              );
            })}
            {/* 新便签（紫，贴最上） */}
            {newK > 0 && (
              <div style={{position: 'absolute', left: 300, top: 60, transform: `scale(${newK}) rotate(-2deg)`}}>
                <div style={{width: 150, height: 120, background: '#000', border: `2.5px solid ${PURPLE_LIGHT}`, borderRadius: 4, boxShadow: '0 0 22px rgba(102,48,248,.55)', position: 'relative'}}>
                  <div style={{position: 'absolute', left: 40, top: -8, width: 66, height: 16, background: 'rgba(102,48,248,.4)', border: '1.5px solid rgba(161,117,241,.8)', transform: 'rotate(2deg)'}} />
                  <div style={{padding: '26px 12px 0', fontFamily: "'Noto Sans SC', sans-serif", fontSize: 22, color: WHITE, lineHeight: 1.5}}>{EXAMPLE.domain}<br /><span style={{color: PURPLE_LIGHT}}>= 192.0.2.51</span></div>
                  <div style={{position: 'absolute', right: 8, bottom: 6, fontFamily: "'Orbitron', sans-serif", fontSize: 19, color: GREEN}}>{EXAMPLE.ttl}</div>
                </div>
              </div>
            )}
            {/* expire 灰字 */}
            {expOp > 0 && <div style={{position: 'absolute', left: 0, right: 0, bottom: -52, textAlign: 'center', fontFamily: "'Noto Sans SC', sans-serif", fontSize: 25, color: GREY, opacity: expOp}}>old answers sit in caches — until they expire</div>}
          </div>
        )}
      </div>
    </div>
  );
};
export const SC21_RANGE = {from: F0, to: T};
