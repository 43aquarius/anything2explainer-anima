import React from 'react';
import {useCurrentFrame} from 'remotion';
import {clamp01, kf, rnd} from '../../common';
import {CText, Pill, PacketIcon, BrowserWin, EXAMPLE, GREY, GREY_LINE, GREY_MID, WHITE, PURPLE, PURPLE_LIGHT, exitOp, GLOW_PURPLE_S, BLOOM_SOFT} from '../../ui';
import {HeroGlow} from '../../fx';

const F0 = 605, T = 875; // SC04: 605–875 (S05–S06)

export const SC04: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const exitK = N > T - 8 ? exitOp(N, T) : 1;
  // 信封自下滑入（697 节拍，Δ110，22 帧）
  const envIn = N >= 640 ? kf(N, [[640, 110], [682, 0]], (u) => Math.pow(1 - u, 2.5)) : 999;
  const envOp = N >= 640 ? kf(N, [[640, 0.25], [646, 1]]) : 0;
  // 地址框虚线 draw-on（697 后 8 帧）
  const boxK = clamp01((N - 650) / 12);
  // 浏览器缩略（613）
  const brOp = N >= 613 ? kf(N, [[613, 0], [625, 1]]) : 0;
  // 漂浮名字（664）
  const floatName = N >= 664 ? kf(N, [[664, 0], [674, 1]]) : 0;
  const floatY = Math.sin(N / 24) * 5;
  // 光标闪烁（769 起）
  const cursor = N >= 700 && (N % 16) < 8;
  // 铅笔（824 起，打转）
  const pencil = N >= 742 ? clamp01((N - 742) / 10) : 0;
  const pencilRot = N >= 742 ? Math.sin((N - 742) / 30 * Math.PI * 2) * 14 : 0;
  // 运镜：33 帧 1→1.12 推向地址框（790–823）
  const zoom = 1 + 0.12 * kf(N, [[790, 0], [823, 1]]);
  return (
    <div style={{position: 'absolute', inset: 0, opacity: exitK}}>
      <div style={{position: 'absolute', left: 640, top: 380, transform: `translate(-50%, -50%) scale(${zoom})`}}>
        {/* 主角：巨信封（空地址） */}
        {envOp > 0 && (
          <div style={{position: 'absolute', left: -215, top: -170 + Math.min(envIn, 110) + (N > 719 ? Math.sin((N - 719) / 40) * 0 : 0), width: 430, height: 320, opacity: envOp}}>
            <HeroGlow x={-215} y={-165} w={430} h={330} N={N} />
            <svg width="430" height="320" style={{position: 'absolute', left: 0, top: 0}}>
              <rect x="2" y="2" width="426" height="316" rx="10" fill="#000" stroke={WHITE} strokeWidth={3} />
              {/* 封口折线（上半中缝） */}
              <line x1="10" y1="88" x2="215" y2="150" stroke={GREY} strokeWidth={2} />
              <line x1="420" y1="88" x2="215" y2="150" stroke={GREY} strokeWidth={2} />
              {/* 空地址框（虚线 draw-on） */}
              <rect x="80" y="170" width="270" height="64" fill="none" stroke={PURPLE_LIGHT} strokeWidth={2.5} strokeDasharray="10 7"
                strokeDashoffset={boxK > 0 ? (1 - boxK) * 400 : 400} opacity={boxK > 0 ? 1 : 0.35} />
            </svg>
            {/* 地址框内：光标 + 名字（名字在手，地址没有） */}
            {cursor && <div style={{position: 'absolute', left: 96, top: 186, width: 8, height: 32, background: PURPLE_LIGHT}} />}
            {/* 漂浮的 shop.example（虚名，不是地址） */}
            {floatName > 0 && (
              <div style={{position: 'absolute', left: 74, top: -46 + floatY, opacity: floatName * 0.95, fontFamily: "'Noto Sans SC', sans-serif", fontSize: 26, fontWeight: 700, color: GREY, letterSpacing: 0.5}}>
                {EXAMPLE.domain}
                <div style={{position: 'absolute', right: -34, top: -4, fontSize: 22, color: GREY_MID}}>?</div>
              </div>
            )}
            {/* 铅笔（824：写不了地址，打转） */}
            {pencil > 0 && (
              <div style={{position: 'absolute', left: 332, top: 138, opacity: pencil, transform: `rotate(${-40 + pencilRot}deg)`, transformOrigin: 'center', filter: BLOOM_SOFT}}>
                <svg width="90" height="90">
                  <rect x="28" y="8" width="16" height="52" fill="#000" stroke={WHITE} strokeWidth={2.5} />
                  <polygon points="28,60 44,60 36,80" fill="#000" stroke={WHITE} strokeWidth={2.5} strokeLinejoin="round" />
                </svg>
              </div>
            )}
          </div>
        )}
        {/* 左下：浏览器缩略（持有者） */}
        {brOp > 0 && (
          <div style={{position: 'absolute', left: -560, top: 150, opacity: brOp * 0.92}}>
            <BrowserWin x={0} y={0} w={220} h={170} skeleton={2} skelLit={0} barP={0.2} />
            <div style={{position: 'absolute', left: 6, top: 178, fontFamily: "'Noto Sans SC', sans-serif", fontSize: 22, color: GREY}}>the browser</div>
          </div>
        )}
      </div>
    </div>
  );
};
export const SC04_RANGE = {from: F0, to: T};
export const _S = {rnd, GREY_LINE};
