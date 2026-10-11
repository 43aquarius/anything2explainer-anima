import React from 'react';
import {useCurrentFrame} from 'remotion';
import {clamp01, kf} from '../../common';
import {StickyNote, EXAMPLE, GREY, GREY_LINE, WHITE, PURPLE, PURPLE_LIGHT, exitOp} from '../../ui';

const F0 = 4205, T = 4305; // SC18: 4205–4305（S30：答案被写在便签上）

export const SC18: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const exitK = N > T - 8 ? exitOp(N, T) : 1;
  // 便签入场（4213 贴上墙 8 帧）
  const stick = clamp01((N - 4213) / 10);
  const pop = stick < 1 ? 1.06 - stick * 0.06 : 1;
  // 写字（4213–4290：先 shop.example 后 = 192.0.2.33，每 2 帧 1 字）
  const full = [EXAMPLE.domain, '= ' + EXAMPLE.ip];
  const chars = Math.floor(clamp01((N - 4213) / 64) * (full[0].length + full[1].length));
  const l0 = full[0].slice(0, Math.min(full[0].length, chars));
  const l1 = chars > full[0].length ? full[1].slice(0, chars - full[0].length) : '';
  // TTL 角标（4251）
  const ttlOp = N >= 4251 ? kf(N, [[4251, 0.25], [4259, 1]]) : 0;
  // TTL 倒计时持续（每秒 -1，示意；4260 起到 4490 冻结）
  const ttl = N < 4490 ? Math.max(0, 60 - Math.floor((N - 4260) / 30)) : Math.max(0, 60 - Math.floor((4490 - 4260) / 30));
  // 笔（写字时随行移动）
  const penOn = chars < full[0].length + full[1].length;
  const penX = chars < full[0].length ? 40 + chars * 13.2 : 40 + (chars - full[0].length) * 13.2;
  return (
    <div style={{position: 'absolute', inset: 0, opacity: exitK}}>
      {/* 主角：大便签（贴上墙） */}
      <div style={{position: 'absolute', left: 640, top: 380, transform: `translate(-50%, -50%) scale(${pop})`}}>
        <StickyNote x={-170} y={-160} w={340} h={320} lines={[l0, l1]} lit={chars >= full[0].length + full[1].length} ttl={ttlOp > 0 ? `${ttl} s` : undefined} seed={1} />
        {/* 笔 */}
        {penOn && N > 4215 && (
          <div style={{position: 'absolute', left: penX - 90, top: l0.length > 0 && chars <= full[0].length ? -144 : -92, transform: 'rotate(-24deg)'}}>
            <svg width="110" height="26">
              <rect x="2" y="6" width="86" height="14" fill="#000" stroke={WHITE} strokeWidth="2.5" />
              <polygon points="88,6 106,13 88,20" fill="#000" stroke={WHITE} strokeWidth="2.5" strokeLinejoin="round" />
            </svg>
          </div>
        )}
      </div>
      {/* 底部小字 */}
      <div style={{position: 'absolute', left: 0, right: 0, top: 610, textAlign: 'center', fontFamily: "'Noto Sans SC', sans-serif", fontSize: 24, color: GREY, opacity: kf(N, [[4251, 0], [4263, 0.95]])}}>every answer along the way</div>
    </div>
  );
};
export const SC18_RANGE = {from: F0, to: T};
