import React from 'react';
import {useCurrentFrame} from 'remotion';
import {GlitchIn, clamp01, kf} from '../../common';
import {TreeTier, PhoneIcon, EXAMPLE, GREY, GREY_LINE, WHITE, ORANGE, PURPLE_LIGHT, exitOp, stagger} from '../../ui';

const F0 = 449, T = 752; // SC04: 449–752（S04–S05：一个文件 → DNS 诞生）

export const SC04: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const exitK = N > T - 8 ? exitOp(N, T) : 1;
  // 上：HOSTS.TXT 卡（小）+ 电话
  const cardOp = kf(N, [[457, 0.25], [465, 1]]);
  const lift = N >= 500 ? Math.max(0, Math.sin((N - 500) / 26 * Math.PI * 2)) : 0;
  // 划掉（S05 608：DNS 出现时 HOSTS.TXT 缩小变暗）
  const shrink = N >= 608 ? clamp01((N - 608) / 14) : 0;
  // 下：层级树（S05.c2 667）+ DNS 大字
  const treeP = N >= 640 ? clamp01((N - 640) / 50) : 0;
  const dnsN = N - 667;
  const rows = ['hosta  10.0.0.4', 'hostb  10.0.0.7', 'hostc  10.0.0.9'];
  const hotRow = Math.floor((N - 480) / 22) % 3;
  return (
    <div style={{position: 'absolute', inset: 0, opacity: exitK}}>
      {/* 上：HOSTS.TXT（S04） */}
      <div style={{position: 'absolute', left: 60, top: 270, width: 420, opacity: cardOp * (1 - shrink * 0.75), transform: `scale(${1 - shrink * 0.35}) translateY(${shrink * -30}px)`, filter: `saturate(${1 - shrink * 0.7})`}}>
        <div style={{width: 420, height: 190, background: '#000', border: `3px solid ${WHITE}`, borderRadius: 8, position: 'relative'}}>
          <div style={{position: 'absolute', left: 0, right: 0, top: 14, textAlign: 'center', fontFamily: "'Sarasa Mono SC', monospace", fontSize: 30, fontWeight: 700, color: WHITE, letterSpacing: 2}}>{EXAMPLE.hostFile}</div>
          {rows.map((r, i) => (
            <div key={i} style={{position: 'absolute', left: 30, top: 64 + i * 36, fontFamily: "'Sarasa Mono SC', monospace", fontSize: 21, color: i === hotRow ? WHITE : GREY, background: i === hotRow ? 'rgba(102,48,248,.2)' : 'none', borderRadius: 3, paddingLeft: i === hotRow ? 6 : 0, width: 300}}>{r}</div>
          ))}
        </div>
        <div style={{position: 'absolute', right: -96, top: 130}}><PhoneIcon cx={0} cy={0} w={92} h={100} lift={lift} /></div>
        <div style={{marginTop: 10, fontFamily: "'Noto Sans SC', sans-serif", fontSize: 22, color: GREY}}>1983 — one file, one office</div>
      </div>
      {/* 红删除线（S05 起划过） */}
      {shrink > 0 && <div style={{position: 'absolute', left: 70, top: 360, width: 400 * shrink, height: 5, background: ORANGE, boxShadow: '0 0 10px rgba(240,95,65,.8)'}} />}
      {/* 下：DNS 大字 + 层级树（S05） */}
      {dnsN > 0 && (
        <div style={{position: 'absolute', left: 0, right: 0, top: 620, textAlign: 'center'}}>
          <GlitchIn N={N} f0={667}>
            <span style={{fontFamily: "'Noto Sans SC', sans-serif", fontWeight: 900, fontSize: 52, color: WHITE, WebkitTextStroke: '2.5px #6630F8', paintOrder: 'stroke fill', filter: 'drop-shadow(0 0 16px rgba(102,48,248,.6))'}}>Domain Name System</span>
          </GlitchIn>
          <div style={{fontFamily: "'Noto Sans SC', sans-serif", fontSize: 24, color: GREY, marginTop: 14}}>a hierarchy, no center at all</div>
        </div>
      )}
      {treeP > 0 && (
        <div style={{position: 'absolute', left: 360, top: 880, transform: 'translate(-50%, -50%) scale(1.15)'}}>
          <TreeTier cx={0} cy={0} w={560} progress={treeP} litLeaf={Math.floor((N - 690) / 30) % 6} />
        </div>
      )}
    </div>
  );
};
export const SC04_RANGE = {from: F0, to: T};
