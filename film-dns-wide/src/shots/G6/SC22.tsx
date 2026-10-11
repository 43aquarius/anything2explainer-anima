import React from 'react';
import {useCurrentFrame} from 'remotion';
import {clamp01, kf} from '../../common';
import {RackIcon, StickyNote, EXAMPLE, GREY, GREY_LINE, WHITE, ORANGE, PURPLE, PURPLE_LIGHT, exitOp, stagger} from '../../ui';

const F0 = 5259, T = 5544; // SC22: {S37.from-8}–{S39.from-9}（S37–S38：Facebook 变暗）

export const SC22: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const exitK = N > T - 8 ? exitOp(N, T) : 1;
  // 左半：域名卡 + 三台服务器（5267 入场）
  const domOp = kf(N, [[5267, 0.25], [5275, 1]]);
  const racks = [0, 1, 2].map(i => ({at: 5275 + stagger(i, 8)}));
  // 熄灯（5340 = S37.c2 起，每台 14 帧、10 帧间隔）
  const dimAt = (i: number) => 5340 + i * 10;
  // 沙漏（5399 = S38.c1）
  const hourK = N >= 5399 ? clamp01((N - 5399) / 16) : 0;
  const sandY = kf(N, [[5399, 0], [5540, 1]]); // 沙下流
  // 右半缓存墙（5399 起 2 帧错峰亮）
  const wallAt = (i: number) => 5439 + stagger(i, 3);
  // 最后的正确答案（5493 = S38.c3）
  const lastOp = kf(N, [[5493, 0.25], [5501, 1]]);
  // 慢推
  const zoom = 1 + 0.05 * clamp01((N - 5380) / 50);
  return (
    <div style={{position: 'absolute', inset: 0, opacity: exitK}}>
      <div style={{position: 'absolute', left: 640, top: 390, transform: `translate(-50%, -50%) scale(${zoom})`}}>
        {/* 左：facebook 域名卡 + 服务器熄灯 */}
        <div style={{position: 'absolute', left: -600, top: -180, width: 440}}>
          <div style={{fontFamily: "'Noto Sans SC', sans-serif", fontWeight: 900, fontSize: 54, color: WHITE, opacity: domOp}}>facebook.com</div>
          <div style={{fontFamily: "'Orbitron', sans-serif", fontSize: 40, color: GREY, marginTop: 8, opacity: domOp, textShadow: N < 5330 ? `0 0 12px rgba(255,255,255,${0.4 + 0.4 * Math.sin(N / 12 * Math.PI)})` : undefined}}>{String(2000 + Math.min(21, Math.floor((N - 5275) / 2)))}</div>
          {racks.map((r, i) => {
            const k = clamp01((N - r.at) / 14);
            const dim = N >= dimAt(i);
            const dk = dim ? clamp01((N - dimAt(i)) / 14) : 0;
            return (
              <div key={i} style={{position: 'absolute', left: 40 + i * 120, top: 170, opacity: k}}>
                <div style={{transform: 'scale(0.62)', transformOrigin: 'top left', filter: `brightness(${1 - dk * 0.75})`}}>
                  <RackIcon cx={70} cy={90} w={130} h={180} units={4} lit={dim && dk < 0.6 ? 0 : 1 + (Math.floor(N / 30) % 2)} />
                </div>
                {dim && dk > 0.6 && <div style={{position: 'absolute', left: 30, top: 40, fontFamily: "'Noto Sans SC', sans-serif", fontSize: 20, color: GREY_LINE}}>offline</div>}
              </div>
            );
          })}
          <div style={{marginTop: 220, fontFamily: "'Noto Sans SC', sans-serif", fontSize: 23, color: GREY, opacity: kf(N, [[5340, 0], [5352, 1]])}}>nameservers go dark</div>
        </div>
        {/* 中：沙漏 */}
        {hourK > 0 && (
          <div style={{position: 'absolute', left: -80, top: -60, transform: `scale(${hourK})`}}>
            <svg width="80" height="130">
              <path d="M8,4 h64 v14 l-24,45 v49 l-16,12 l-16,-12 v-49 l-24,-45 z" fill="none" stroke={WHITE} strokeWidth="3" strokeLinejoin="round" />
              {/* 上沙 */}
              <path d={`M22,22 h36 v10 l-14,26 h-8 l-14,-26 z`} fill="rgba(240,95,65,.75)" opacity={1 - sandY * 0.8} />
              {/* 下沙堆 */}
              <path d={`M32,118 l8,${-8 - sandY * 2} l8,${sandY * 2 + 8 - 8} z`} fill="rgba(240,95,65,.75)" opacity={0.4 + sandY * 0.5} style={{transform: `translateY(${2}px)`}} />
              {/* 流沙 */}
              <line x1="40" y1="58" x2="40" y2={58 + 55 * Math.min(1, sandY * 1.05)} stroke={ORANGE} strokeWidth="3" opacity={sandY < 1 ? 0.9 : 0} />
            </svg>
          </div>
        )}
        {/* 右：缓存墙（3×3 便签，主角组） */}
        <div style={{position: 'absolute', left: 120, top: -190, width: 420, height: 420}}>
          <div style={{filter: `brightness(${1 + 0.1 * Math.sin(N / 26 * Math.PI * 2)})`}}>
          {Array.from({length: 9}).map((_, i) => {
            const at = wallAt(i);
            const k = clamp01((N - at) / 12);
            if (k <= 0) return null;
            const col = i % 3, row = Math.floor(i / 3);
            return (
              <div key={i} style={{position: 'absolute', left: col * 140, top: row * 140, transform: `scale(${k})`}}>
                <StickyNote x={0} y={0} w={120} h={100} lines={['facebook.com']} lit={k >= 1} ttl={undefined} tilt={0} seed={i} />
              </div>
            );
          })}
          </div>
          {lastOp > 0 && <div style={{position: 'absolute', left: 0, right: 0, bottom: -56, textAlign: 'center', fontFamily: "'Noto Sans SC', sans-serif", fontSize: 25, color: WHITE, opacity: lastOp}}>the last correct copies</div>}
        </div>
      </div>
    </div>
  );
};
export const SC22_RANGE = {from: F0, to: T};
