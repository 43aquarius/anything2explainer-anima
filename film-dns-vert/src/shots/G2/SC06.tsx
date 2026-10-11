import React from 'react';
import {useCurrentFrame} from 'remotion';
import {clamp01, kf} from '../../common';
import {RackIcon, Pill, PacketIcon, EXAMPLE, GREY, GREY_LINE, WHITE, ORANGE, PURPLE_LIGHT, exitOp} from '../../ui';

const F0 = 925, T = 1201; // SC06–SC08: 925–1201（S08–S09：referral 链 + A 记录）

export const SC06: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const exitK = N > T - 8 ? exitOp(N, T) : 1;
  // 垂直 referral 链（竖版纵向排）：root → TLD → authoritative
  const nodes = [
    {y: 330, at: 935, label: 'root', sub: 'referral'},
    {y: 520, at: 971, label: EXAMPLE.tld, sub: 'referral'},
    {y: 720, at: 1021, label: 'authoritative', sub: 'the answer'},
  ];
  const lineK = (i: number) => clamp01((N - nodes[i].at - 10) / 14);
  // 信封逐级下落（935 起循环）
  const hopIdx = N >= 1071 ? Math.min(2, Math.floor((N - 1071) / 22)) : -1;
  const hopP = N >= 1071 ? ((N - 1071) % 22) / 22 : 0;
  // A 记录大字（1071 = S09.c1）
  const ipN = N - 1071;
  const ipStr = EXAMPLE.ip;
  const roll = clamp01((N - 1071) / 20);
  const shown = ipN > 0 ? ipStr.split('').map((c, i) => (roll > (i + 1) / ipStr.length ? c : c === '.' ? '.' : String((Number(c) + Math.floor(N / 3)) % 10))).join('') : '';
  const settled = roll >= 1;
  return (
    <div style={{position: 'absolute', inset: 0, opacity: exitK}}>
      {/* 纵向链 */}
      {nodes.map((nd, i) => {
        const k = kf(N, [[nd.at, 0], [nd.at + 16, 1]], (u) => Math.pow(1 - u, 0.4));
        if (k <= 0) return null;
        return (
          <div key={i} style={{position: 'absolute', left: 130, top: nd.y, opacity: k * 0.95}}>
            <div style={{width: 320, height: 96, background: '#000', border: `2.5px solid ${i === 2 ? PURPLE_LIGHT : WHITE}`, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: i === 2 ? '0 0 18px rgba(161,117,241,.4)' : undefined}}>
              <span style={{fontFamily: i === 1 ? "'Sarasa Mono SC', monospace" : "'Noto Sans SC', sans-serif", fontSize: i === 1 ? 30 : 32, fontWeight: i === 1 ? 400 : 800, color: i === 2 ? PURPLE_LIGHT : WHITE}}>{nd.label}</span>
            </div>
            <div style={{marginTop: 6, textAlign: 'center', fontFamily: "'Exo 2', sans-serif", fontStyle: 'italic', fontSize: 22, color: GREY}}>&#8595; {nd.sub}</div>
            {/* 连线 */}
            {i < 2 && lineK(i) > 0 && <div style={{position: 'absolute', left: 159, top: 130, width: 2, height: 74 * lineK(i), background: GREY_LINE}} />}
          </div>
        );
      })}
      {/* 跳跃信封 */}
      {hopIdx >= 0 && hopIdx < 2 && hopP < 1 && (
        <div style={{position: 'absolute', left: 400, top: nodes[hopIdx].y + 60 + (nodes[hopIdx + 1].y - nodes[hopIdx].y) * hopP - Math.sin(hopP * Math.PI) * 40}}>
          <PacketIcon cx={0} cy={0} w={58} h={40} accent glow />
        </div>
      )}
      {/* A 记录大字（主角，最下） */}
      {ipN > 0 && (
        <div style={{position: 'absolute', left: 0, right: 0, top: 880, textAlign: 'center'}}>
          <div style={{fontFamily: "'Noto Sans SC', sans-serif", fontWeight: 900, fontSize: 40, color: WHITE, opacity: kf(N, [[1071, 0.25], [1081, 1]])}}>{EXAMPLE.domain}</div>
          <div style={{fontFamily: "'Orbitron', sans-serif", fontSize: 74, fontWeight: 700, color: settled ? ORANGE : GREY, textShadow: settled ? '0 0 30px rgba(240,95,65,.6), 4px 4px 0 rgba(240,95,65,.25)' : undefined, marginTop: 8}}>{shown}</div>
          <div style={{marginTop: 6}}><Pill x={256} y={0} w={210} h={42} text="A record" fontSize={26} opacity={settled ? 1 : 0} /></div>
        </div>
      )}
    </div>
  );
};
export const SC06_RANGE = {from: F0, to: T};
