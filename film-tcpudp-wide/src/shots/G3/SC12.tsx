import React from 'react';
import {useCurrentFrame} from 'remotion';
import {clamp01, easeInOutPow, GlitchIn, FONT_WIDE, FONT_HEAVY} from '../../common';
import {CText, Pill, PersonIcon, NodeDot, Svg, abs, scaleIn, fadeIn, exitOp, WHITE, GREY, ORANGE, GREEN, PURPLE_LIGHT} from '../../ui';

/**
 * SC12 三路握手（2530–2846，S19–S22）
 * 节拍：2538 先打个电话 / 2644 SYN / 2703 SYN-ACK / 2798 ACK。
 * 版式：左右端点圆（(280,360)/(1000,360) r90，内 PersonIcon，标签 you/friend）
 *       + 上下两条弧线轨道（顶 y≈250 / 底 y≈470）+ 顶部 `THE HANDSHAKE` Audiowide 64px。
 * 消息：SYN 橙 Pill 沿上弧 L→R（2644+16）→ SYN-ACK 紫 Pill 沿下弧 R→L（2703+16）→ ACK 绿 Pill 上弧 L→R（2798+16）；
 *       每条到达对侧节点白闪 + 落点 ripple；弧线轨迹 draw-on 跟随 Pill；完成后"已连接"状态线自中点向两端点亮（12 帧）
 *       + 两节点呼吸光。2538–2644 左节点持续"拨号"波纹（makes a call 的动词动作，SYN 出发即停）。
 * glitch 白名单：`THE HANDSHAKE`（rgbSplit 4，本镜唯一）。零扫光。运镜：无（SC12→SC13 的承接位移在 SC13 做）。
 * 离场：末 8 帧非节点元素归零（2839–2846）；两节点+标签不归零，SC13 同几何承接。
 */
const F0 = 2530;
const T_TITLE = 2538, T_SYN = 2644, T_SYNACK = 2703, T_ACK = 2798, T_CONN = T_ACK + 16, T_EXIT = 2846;

const NODE_L = {cx: 280, cy: 360, r: 90};
const NODE_R = {cx: 1000, cy: 360, r: 90};
// 弧线（二次贝塞尔）：上弧 L→R（峰 y≈242），下弧 R→L（峰 y≈478）
const ARC_TOP = {p0: [345, 312], c: [640, 172], p1: [935, 312]};
const ARC_BOT = {p0: [935, 408], c: [640, 548], p1: [345, 408]};
const bez = (a: number[], c: number[], b: number[], t: number): [number, number] => {
  const u = 1 - t;
  return [u * u * a[0] + 2 * u * t * c[0] + t * t * b[0], u * u * a[1] + 2 * u * t * c[1] + t * t * b[1]];
};

type Arc = typeof ARC_TOP;
type Msg = {t0: number; label: string; color: string; w: number; arc: Arc; toNode: typeof NODE_R};
const MSGS: Msg[] = [
  {t0: T_SYN, label: 'SYN', color: ORANGE, w: 104, arc: ARC_TOP, toNode: NODE_R},
  {t0: T_SYNACK, label: 'SYN-ACK', color: PURPLE_LIGHT, w: 156, arc: ARC_BOT, toNode: NODE_L},
  {t0: T_ACK, label: 'ACK', color: GREEN, w: 104, arc: ARC_TOP, toNode: NODE_R},
];
const FLIGHT = 16;

export const SC12: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const ex = exitOp(N, T_EXIT, 8); // 非节点元素归零
  const nodeGlow = clamp01((N - T_CONN) / 10) * (0.5 + 0.5 * (0.5 + 0.5 * Math.sin((2 * Math.PI * (N - 12)) / 30))); // 连接后呼吸

  return (
    <div style={{position: 'absolute', inset: 0}}>
      {/* 顶部大字（本镜唯一 glitch，rgbSplit 4） */}
      <GlitchIn N={N} f0={T_TITLE} rgbSplit={4} seed={12} style={{opacity: ex}}>
        <CText cx={640} cy={152} size={64} weight={400} family={FONT_WIDE} color={WHITE} letterSpacing={6} shadow="0 0 22px rgba(102,45,248,.5), 6px 6px 0 #5A3AD5">THE HANDSHAKE</CText>
      </GlitchIn>

      {/* 拨号波纹（makes a call：左节点环形波纹每 54 帧三轮，SYN 出发即停） */}
      {N >= 2556 && N < T_SYN ? [0, 1, 2].map((k) => {
        const rn = (N - 2556 - k * 18) % 54;
        if (rn < 0 || rn > 38) return null;
        const rr = 96 + rn * 2.2;
        return <div key={k} style={{...abs(NODE_L.cx - rr, NODE_L.cy - rr, rr * 2, rr * 2), borderRadius: '50%', border: `2px solid ${GREY}`, opacity: 0.36 * (1 - rn / 38) * fadeIn(N - 2556, 10) * ex}} />;
      }) : null}

      {/* 弧线轨迹 draw-on（跟随 Pill）+ 已连接状态线 */}
      <Svg>
        {MSGS.map((m, i) => {
          const n = N - m.t0;
          if (n < -10) return null;
          const [x0, y0] = m.arc.p0, [xc, yc] = m.arc.c, [x1, y1] = m.arc.p1;
          const d = `M ${x0} ${y0} Q ${xc} ${yc} ${x1} ${y1}`;
          const drawn = clamp01(n / FLIGHT);
          return <path key={i} d={d} fill="none" stroke={m.color} strokeWidth={2.5} pathLength={100} strokeDasharray="100" strokeDashoffset={100 * (1 - drawn)} opacity={(N > m.t0 + FLIGHT + 10 ? 0.4 : 0.9) * ex} />;
        })}
        {N >= T_CONN ? (() => {
          const k = clamp01((N - T_CONN) / 12);
          const half = ((NODE_R.cx - NODE_L.cx) / 2 - 96) * k;
          return <line x1={640 - half} y1={360} x2={640 + half} y2={360} stroke={GREEN} strokeWidth={3} opacity={0.9 * ex} style={{filter: 'drop-shadow(0 0 6px rgba(143,247,64,.8))'}} />;
        })() : null}
      </Svg>

      {/* 飞行中的消息 Pill（HTML 层，沿贝塞尔） */}
      {MSGS.map((m, i) => {
        const n = N - m.t0;
        if (n < 0 || n > FLIGHT) return null;
        const t = easeInOutPow(2.2)(clamp01(n / FLIGHT));
        const [px, py] = bez(m.arc.p0, m.arc.c, m.arc.p1, t);
        return (
          <Pill key={i} x={px - m.w / 2} y={py - 24} w={m.w} h={48} r={24} stroke={m.color} sw={2.5} fill="#000"
            text={m.label} fontSize={24} weight={700} family={FONT_HEAVY} letterSpacing={2} opacity={ex * clamp01((n + 4) / 8)}
            style={{boxShadow: `0 0 14px ${m.color}55`}} />
        );
      })}

      {/* 到达效果：对侧节点白闪 + 落点 ripple（16 帧） */}
      {MSGS.map((m, i) => {
        const nArr = N - (m.t0 + FLIGHT);
        if (nArr < 0 || nArr > 16) return null;
        const node = m.toNode;
        const flash = nArr < 5 ? 1 + 0.55 * (1 - nArr / 5) : 1;
        const rr = node.r + 6 + nArr * 3.4;
        return (
          <React.Fragment key={`e${i}`}>
            <div style={{...abs(node.cx - node.r, node.cy - node.r, node.r * 2, node.r * 2), borderRadius: '50%', border: `3px solid ${WHITE}`, background: 'rgba(255,255,255,0.14)', filter: `brightness(${flash})`, opacity: ex}} />
            <div style={{...abs(node.cx - rr, node.cy - rr, rr * 2, rr * 2), borderRadius: '50%', border: `2.5px solid ${m.color}`, opacity: 0.7 * (1 - nArr / 16) * ex}} />
          </React.Fragment>
        );
      })}

      {/* 两端点（承接元素：不随离场归零，SC13 同几何续用） */}
      {[NODE_L, NODE_R].map((nd, i) => {
        const nn = N - (T_TITLE + i * 2);
        if (nn < 0) return null;
        const s = 0.6 + 0.4 * scaleIn(nn);
        return (
          <div key={i} style={{...abs(nd.cx - nd.r, nd.cy - nd.r, nd.r * 2, nd.r * 2 + 44), transform: `scale(${s.toFixed(4)})`, transformOrigin: '50% 50%', opacity: fadeIn(nn, 6)}}>
            <NodeDot cx={nd.r} cy={nd.r} r={nd.r - 2} label={i === 0 ? 'you' : 'friend'} glowP={nodeGlow} labelSize={24} />
            <div style={{position: 'absolute', left: nd.r, top: nd.r, transform: 'translate(-50%,-50%)'}}>
              <PersonIcon cx={0} cy={0} size={nd.r * 1.28} opacity={0.92} />
            </div>
          </div>
        );
      })}
    </div>
  );
};
