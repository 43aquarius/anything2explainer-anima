import React from 'react';
import {useCurrentFrame} from 'remotion';
import {clamp01, kf} from '../../common';
import {RackIcon, PhoneBookIcon, EXAMPLE, GREY, GREY_LINE, WHITE, GREEN, ORANGE, PURPLE, PURPLE_LIGHT, exitOp} from '../../ui';
import {Check} from '../../ui';

const F0 = 7972, T = 8203; // SC31: 7972–8203（S53 ¶gap20：只有电话簿倒了）

const CARDS = [
  {x: 250, name: 'Twitter', icon: 'bird'},
  {x: 640, name: 'Netflix', icon: 'play'},
  {x: 1030, name: 'Spotify', icon: 'note'},
];

export const SC31: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const exitK = N > T - 8 ? exitOp(N, T) : 1;
  // 三卡入场（7980 = S53.c1）
  const cardK = (i: number) => kf(N, [[7980 + i * 2, 0], [7998 + i * 2, 1]], (u) => Math.pow(1 - u, 0.4));
  // 集体灰化（8057 = S53.c2）+ 红 X
  const greyK = clamp01((N - 8057) / 14);
  const xK = (i: number) => clamp01((N - 8067 - i * 8) / 10);
  // RackIcon + Check（8057）
  const rackK = kf(N, [[8057, 0.25], [8065, 1]]);
  const checkK = clamp01((N - 8082) / 12);
  // 电话簿滑入→倾倒（8118 = S53.c3）
  const pbIn = kf(N, [[8118, 300], [8140, 0]], (u) => Math.pow(1 - u, 0.6));
  const pbFall = kf(N, [[8118, 0], [8138, 85]], (u) => u * u);
  const dust = N >= 8138 && N < 8158;
  // 余震
  const aftershock = N >= 8140 && N < 8154 ? Math.sin((N - 8140) / 4) * (2 - (N - 8140) / 14) : 0;
  // shared 灰字
  const sharedOp = kf(N, [[8144, 0.25], [8152, 1]]);
  // 拉远（章末收束：8170-8200）
  const zoom = 1.12 - 0.12 * kf(N, [[8118, 0], [8150, 1]]);
  return (
    <div style={{position: 'absolute', inset: 0, opacity: exitK}}>
      <div style={{position: 'absolute', left: 640, top: 380, transform: `translate(-50%, -50%) scale(${zoom})`}}>
        {/* 三张服务卡 */}
        {CARDS.map((c, i) => {
          const k = cardK(i);
          if (k <= 0) return null;
          const g = greyK;
          const x = xK(i);
          return (
            <div key={i} style={{position: 'absolute', left: c.x - 150, top: -160 + (1 - k) * 110, width: 300, height: 260, opacity: k}}>
              <div style={{position: 'absolute', inset: 0, background: '#000', border: `2.5px solid ${GREY_LINE}`, borderRadius: 12, filter: `saturate(${1 - g})`, opacity: 1 - g * 0.35}} />
              <div style={{position: 'absolute', left: 0, right: 0, top: 24, textAlign: 'center', fontFamily: "'Noto Sans SC', sans-serif", fontWeight: 900, fontSize: 44, color: WHITE, filter: `saturate(${1 - g})`}}>{c.name}</div>
              {/* 小图标 */}
              <div style={{position: 'absolute', left: 0, right: 0, top: 92, display: 'flex', justifyContent: 'center'}}>
                {c.icon === 'bird' && <svg width="64" height="48"><path d="M8,36 C4,26 14,14 28,18 C32,8 46,6 50,14 C56,12 60,10 62,8 C60,16 56,20 52,22 C54,34 42,44 26,42 C18,44 12,42 8,36 Z" fill="none" stroke={GREY} strokeWidth="2.5" strokeLinejoin="round" /></svg>}
                {c.icon === 'play' && <svg width="64" height="52"><rect x="4" y="6" width="56" height="40" rx="6" fill="none" stroke={GREY} strokeWidth="2.5" /><polygon points="26,16 42,26 26,36" fill="none" stroke={GREY} strokeWidth="2.5" strokeLinejoin="round" /></svg>}
                {c.icon === 'note' && <svg width="44" height="56"><circle cx="14" cy="42" r="9" fill="none" stroke={GREY} strokeWidth="2.5" /><circle cx="34" cy="36" r="9" fill="none" stroke={GREY} strokeWidth="2.5" /><line x1="23" y1="42" x2="23" y2="12" stroke={GREY} strokeWidth="2.5" /><line x1="43" y1="36" x2="43" y2="6" stroke={GREY} strokeWidth="2.5" /><path d="M23,12 L43,6 L43,16 L23,22 Z" fill="none" stroke={GREY} strokeWidth="2.5" /></svg>}
              </div>
              {/* 红 X */}
              {x > 0 && (
                <div style={{position: 'absolute', left: -12, top: -12, transform: `scale(${x})`}}>
                  <svg width="56" height="56"><line x1="8" y1="8" x2="48" y2="48" stroke={ORANGE} strokeWidth="7" strokeLinecap="round" /><line x1="48" y1="8" x2="8" y2="48" stroke={ORANGE} strokeWidth="7" strokeLinecap="round" /></svg>
                </div>
              )}
            </div>
          );
        })}
        {/* 下方：服务器还活着 + 倒下的电话簿 */}
        <div style={{position: 'absolute', left: -320, top: 140, opacity: rackK}}>
          <RackIcon cx={60} cy={100} w={120} h={200} units={4} lit={2} label="servers: fine" labelSize={22} />
          {checkK > 0 && <div style={{position: 'absolute', left: 96, top: -6}}><Check cx={0} cy={0} size={64} p={checkK} sw={7} /></div>}
        </div>
        {/* 电话簿（滑入→倾倒） */}
        {pbIn < 300 && (
          <div style={{position: 'absolute', left: 240 + pbIn * 1.2, top: 110 + pbFall * 1.6, transform: `rotate(${pbFall}deg) rotate(${aftershock}deg)`, transformOrigin: 'center bottom', opacity: kf(N, [[8118, 0.4], [8130, 1]])}}>
            <PhoneBookIcon cx={0} cy={0} w={170} h={220} label="DNS" fallen={false} />
          </div>
        )}
        {/* 倒下橙尘 */}
        {dust && [0, 1, 2].map(i => (
          <div key={i} style={{position: 'absolute', left: 310 + i * 34, top: 320 - (N - 8138) * 1.6 + i * 12, width: 9, height: 9, borderRadius: '50%', background: ORANGE, opacity: 1 - (N - 8138) / 20}} />
        ))}
        {/* shared 灰字 */}
        {sharedOp > 0 && <div style={{position: 'absolute', left: -320, top: 348, width: 640, textAlign: 'center', fontFamily: "'Noto Sans SC', sans-serif", fontSize: 27, color: GREY, opacity: sharedOp}}>only <b style={{color: ORANGE}}>the shared phonebook</b> fell</div>}
      </div>
    </div>
  );
};
export const SC31_RANGE = {from: F0, to: T};
