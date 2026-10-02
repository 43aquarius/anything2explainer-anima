import React from 'react';
import {useCurrentFrame} from 'remotion';
import {clamp01, easeInOutPow, FONT_HEAVY, FONT_MONO} from '../../common';
import {CText, NodeDot, Pill, GREY, GREEN, ORANGE, PURPLE_LIGHT, WHITE, abs, firstOp, scaleIn, softOp, exitOp} from '../../ui';

/**
 * SC05 三路握手（竖版梯）· N 641–774（S06 649–772；块 649 先握手 / 692 SYN·SYN-ACK·ACK）
 * 版式：顶部 `you` 节点 (360,320) r40 与底部 `friend` 节点 (360,880) r40（NodeDot，标签在节点左侧）；
 *   三条平行垂直轨道 x 180（SYN 橙，上→下）/ x 360（SYN-ACK 紫，下→上）/ x 540（ACK 绿，上→下），Pill 中心 y 395–825；
 *   三枚 Pill 各 18 帧沿轨道飞行（686/694/702 出发，节奏 8 帧——分镜表「隔 12 帧」会把连接线落位挤过末拍，
 *   已压缩并记录在 BUILD_NOTES），到达对侧节点白闪 + 扩散 ripple；
 *   第三枚落位（720）后中段两侧「已连接」短亮线 draw-on（12 帧，720→732 = 692+40，与分镜表算式一致）；
 *   之后两节点呼吸光持续到离场。
 * 零 glitch（白名单：本镜无）。零扫光。运镜：无（清单不含 SC05）。
 * 停留：连接线落位 732 → 离场 766，34 帧 ✓（≥30）。末 8 帧归零。
 */
const F0 = 641;
const TO = 774;

const T_NODE = 645, T_SYN = 686, T_SYNACK = 694, T_ACK = 702, T_CONN = 720, CONN_LEN = 12;
const FLIGHT = 18;

const YOU = {cx: 360, cy: 320, r: 40};
const FRIEND = {cx: 360, cy: 880, r: 40};
const LANE_Y0 = 395, LANE_Y1 = 825; // Pill 中心飞行区间（终点略探入节点）

type Msg = {t0: number; label: string; color: string; w: number; lane: number; down: boolean; toNode: typeof YOU};
const MSGS: Msg[] = [
  {t0: T_SYN, label: 'SYN', color: ORANGE, w: 108, lane: 180, down: true, toNode: FRIEND},
  {t0: T_SYNACK, label: 'SYN-ACK', color: PURPLE_LIGHT, w: 180, lane: 360, down: false, toNode: YOU},
  {t0: T_ACK, label: 'ACK', color: GREEN, w: 108, lane: 540, down: true, toNode: FRIEND},
];

const flightT = (n: number) => easeInOutPow(2.2)(clamp01(n / FLIGHT));

export const SC05: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const exOp = exitOp(N, TO, 8);
  if (exOp <= 0) return null;

  // 节点：缩放入场（2 帧错峰）；连接后呼吸光
  const nodeGlow = clamp01((N - (T_CONN + 8)) / 10) * (0.5 + 0.5 * (0.5 + 0.5 * Math.sin((2 * Math.PI * (N - 12)) / 30)));

  return (
    <div style={{position: 'absolute', inset: 0, opacity: exOp}}>
      {/* ---- 轨道线（随 Pill draw-on；到站后压暗）---- */}
      <svg width={720} height={1280} viewBox="0 0 720 1280" style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
        {MSGS.map((m, i) => {
          const n = N - m.t0;
          if (n < -10) return null;
          const drawn = clamp01(n / FLIGHT);
          const y0 = m.down ? LANE_Y0 : LANE_Y1;
          const y1 = m.down ? LANE_Y0 + (LANE_Y1 - LANE_Y0) * drawn : LANE_Y1 - (LANE_Y1 - LANE_Y0) * drawn;
          return <line key={i} x1={m.lane} y1={y0} x2={m.lane} y2={y1} stroke={m.color} strokeWidth={2.5}
            opacity={(N > m.t0 + FLIGHT + 10 ? 0.35 : 0.85)} style={{filter: 'drop-shadow(0 0 3px rgba(255,255,255,0.35))'}} />;
        })}
        {/* 「已连接」中段两侧短亮线（自内向外 draw-on 12 帧） */}
        {N >= T_CONN ? (() => {
          const k = clamp01((N - T_CONN) / CONN_LEN);
          const half = 70 * k;
          const glow = 'drop-shadow(0 0 7px rgba(143,247,64,0.75))';
          return (
            <g>
              <line x1={360 - 90} y1={610} x2={360 - 90 - half} y2={610} stroke={GREEN} strokeWidth={3.5} style={{filter: glow}} />
              <line x1={360 + 90} y1={610} x2={360 + 90 + half} y2={610} stroke={GREEN} strokeWidth={3.5} style={{filter: glow}} />
            </g>
          );
        })() : null}
      </svg>

      {/* ---- 两端点节点（主角组：竖梯含节点 >520px 高）---- */}
      {[{nd: YOU, lab: 'you', t: T_NODE}, {nd: FRIEND, lab: 'friend', t: T_NODE + 2}].map((e, i) => {
        const nn = N - e.t;
        if (nn < 0) return null;
        const s = 0.3 + 0.7 * scaleIn(nn, 21);
        return (
          <React.Fragment key={i}>
            <div style={{position: 'absolute', inset: 0, opacity: firstOp(nn, 6), transform: `scale(${s.toFixed(4)})`, transformOrigin: `${e.nd.cx}px ${e.nd.cy}px`}}>
              <NodeDot cx={e.nd.cx} cy={e.nd.cy} r={e.nd.r} glowP={nodeGlow} />
            </div>
            <div style={{position: 'absolute', inset: 0, opacity: softOp(nn, 8)}}>
              <CText cx={e.nd.cx - 112} cy={e.nd.cy} size={24} weight={600} family={FONT_MONO} color={GREY} letterSpacing={1}>{e.lab}</CText>
            </div>
          </React.Fragment>
        );
      })}

      {/* ---- 飞行中的消息 Pill（沿垂直轨道，色光随行）---- */}
      {MSGS.map((m, i) => {
        const n = N - m.t0;
        if (n < 0 || n > FLIGHT) return null;
        const t = flightT(n);
        const y = m.down ? LANE_Y0 + (LANE_Y1 - LANE_Y0) * t : LANE_Y1 - (LANE_Y1 - LANE_Y0) * t;
        return (
          <Pill key={i} x={m.lane - m.w / 2} y={y - 23} w={m.w} h={46} r={23} stroke={m.color} sw={2.5} fill="#000"
            text={m.label} fontSize={32} weight={700} family={FONT_HEAVY} letterSpacing={1} textDy={0}
            opacity={softOp(n, 4)} style={{boxShadow: `0 0 16px 4px ${m.color}55`}} />
        );
      })}

      {/* ---- 到达效果：对侧节点白闪 + 扩散 ripple（16 帧）---- */}
      {MSGS.map((m, i) => {
        const nArr = N - (m.t0 + FLIGHT);
        if (nArr < 0 || nArr > 16) return null;
        const node = m.toNode;
        const flash = nArr < 5 ? 1 + 0.55 * (1 - nArr / 5) : 1;
        const rr = node.r + 6 + nArr * 3.2;
        return (
          <React.Fragment key={`e${i}`}>
            <div style={{...abs(node.cx - node.r, node.cy - node.r, node.r * 2, node.r * 2), borderRadius: '50%', border: `3px solid ${WHITE}`, background: 'rgba(255,255,255,0.14)', filter: `brightness(${flash.toFixed(2)})`}} />
            <div style={{...abs(node.cx - rr, node.cy - rr, rr * 2, rr * 2), borderRadius: '50%', border: `2.5px solid ${m.color}`, opacity: 0.7 * (1 - nArr / 16)}} />
          </React.Fragment>
        );
      })}
    </div>
  );
};
