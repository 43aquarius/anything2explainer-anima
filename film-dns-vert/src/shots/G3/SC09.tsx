import React from 'react';
import {useCurrentFrame} from 'remotion';
import {clamp01, kf} from '../../common';
import {StickyNote, EXAMPLE, GREY, GREY_LINE, WHITE, GREEN, ORANGE, exitOp, stagger} from '../../ui';

const F0 = 1490, T = 1736; // SC09: 1490–1736（S13：Facebook 11 分钟）

export const SC09: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const exitK = N > T - 8 ? exitOp(N, T) : 1;
  // 域名卡 + 熄灯（1500 = S13.c1）
  const domOp = kf(N, [[1500, 0.25], [1508, 1]]);
  // 九便签墙（1585 = S13.c2 逐张亮）
  const wallAt = (i: number) => 1585 + stagger(i, 3);
  // 沙漏（1647 = S13.c3）
  const hourK = N >= 1647 ? clamp01((N - 1647) / 14) : 0;
  const sand = kf(N, [[1647, 0], [1716, 1]]);
  // 11 min 大字（结尾定住）
  const m11 = N >= 1690 ? Math.round(kf(N, [[1690, 0], [1710, 11]])) : 0;
  return (
    <div style={{position: 'absolute', inset: 0, opacity: exitK}}>
      {/* 上：facebook.com + 熄灯 */}
      <div style={{position: 'absolute', left: 0, right: 0, top: 300, textAlign: 'center', opacity: domOp}}>
        <div style={{fontFamily: "'Noto Sans SC', sans-serif", fontWeight: 900, fontSize: 46, color: WHITE}}>facebook.com</div>
        <div style={{marginTop: 14, display: 'flex', justifyContent: 'center', gap: 30}}>
          {[0, 1, 2].map(i => {
            const dim = N >= 1520 + i * 12 ? clamp01((N - 1520 - i * 12) / 12) : 0;
            return (
              <div key={i} style={{filter: `brightness(${1 - dim * 0.8})`, opacity: 1 - dim * 0.5}}>
                <svg width="54" height="76"><rect x="4" y="4" width="46" height="68" rx="4" fill="#000" stroke={GREY} strokeWidth="2.5" /><line x1="10" y1="16" x2="44" y2="16" stroke={GREY_LINE} strokeWidth="2" /><circle cx="27" cy="40" r="5" fill={dim > 0.6 ? 'none' : GREEN} stroke={GREY_LINE} strokeWidth="2" /></svg>
              </div>
            );
          })}
        </div>
        <div style={{fontFamily: "'Noto Sans SC', sans-serif", fontSize: 22, color: GREY, marginTop: 10, opacity: kf(N, [[1520, 0], [1532, 1]])}}>nameservers go dark</div>
      </div>
      {/* 中：九便签（缓存墙，主角组） */}
      <div style={{position: 'absolute', left: 108, top: 560, width: 510, height: 330}}>
        {Array.from({length: 9}).map((_, i) => {
          const at = wallAt(i);
          const k = clamp01((N - at) / 12);
          if (k <= 0) return null;
          const col = i % 3, row = Math.floor(i / 3);
          return (
            <div key={i} style={{position: 'absolute', left: col * 172, top: row * 112, transform: `scale(${k})`, filter: `brightness(${1 + 0.1 * Math.sin(N / 26 * Math.PI * 2)})`}}>
              <StickyNote x={0} y={0} w={150} h={92} lines={['facebook.com']} lit ttl={undefined} tilt={0} seed={i} />
            </div>
          );
        })}
        <div style={{position: 'absolute', left: 0, right: 0, bottom: -40, textAlign: 'center', fontFamily: "'Noto Sans SC', sans-serif", fontSize: 23, color: WHITE, opacity: kf(N, [[1585, 0], [1600, 1]])}}>the last correct copies</div>
      </div>
      {/* 下：沙漏 + 11 min */}
      {hourK > 0 && (
        <div style={{position: 'absolute', left: 150, top: 940, transform: `scale(${hourK})`}}>
          <svg width="84" height="130">
            <path d="M8,4 h68 v14 l-26,44 v52 l-16,12 l-16,-12 v-52 l-26,-44 z" fill="none" stroke={WHITE} strokeWidth="3" strokeLinejoin="round" />
            <line x1="42" y1="62" x2="42" y2={62 + 50 * Math.min(1, sand * 1.02)} stroke={ORANGE} strokeWidth="3" opacity={sand < 1 ? 0.9 : 0} />
            <path d={`M30,120 l12,${-6 - sand * 3} l12,${sand * 3 + 6 - 6} z`} fill={ORANGE} opacity={0.3 + sand * 0.5} />
          </svg>
        </div>
      )}
      {m11 > 0 && (
        <div style={{position: 'absolute', left: 300, top: 950}}>
          <span style={{fontFamily: "'Orbitron', sans-serif", fontSize: 92, fontWeight: 700, color: ORANGE, textShadow: '0 0 34px rgba(240,95,65,.75), 5px 5px 0 rgba(240,95,65,.3)'}}>{m11} min</span>
          <div style={{fontFamily: "'Noto Sans SC', sans-serif", fontSize: 22, color: GREY, marginTop: 8}}>caches still answered</div>
        </div>
      )}
    </div>
  );
};
export const SC09_RANGE = {from: F0, to: T};
