import React from 'react';
import {useCurrentFrame} from 'remotion';
import {clamp01, easeInOutPow, powIn, FONT_MONO} from '../../common';
import {
  CText, MonoText, NodeDot, PacketIcon, Pill, Svg, abs, softOp, firstOp, exitOp, glowOffK, exitAccel, SoftIn, EXAMPLE,
  WHITE, GREY, GREY_MID, GREY_LIGHT, PURPLE_LIGHT,
} from '../../ui';
import {HeroGlow} from '../../fx';

/**
 * SC26 DNS：一问一答 · N 6048–6454（S43 6056–6157 + S44 6168–6339 + S45 6350–6417 ¶+gap15，段末延到 SC27.from−1 = 6454）
 * 节拍：6056 交换比仪式小 / 6168 DNS 一问一答 / 6239 通常各一个包 / 6350 握手比投递贵。
 * 上半：DNS 问答图——左节点 you (280,285)、右节点 DNS · :53 (1000,285)；问号包（紫边，随行文本 where is call.example?）
 *   6168 沿上弧 16 帧飞去 → 到达白闪 + 答案包（白边，随行文本 203.0.113.10）6190 沿下弧 16 帧飞回；轨迹 draw-on 跟随。
 * 下半：成本天平（枢轴 (640,470)，半梁 290，链 28）——右盘 1 枚白信封（delivery，6100 落入）；6350 左盘三枚灰信封
 *   （ceremony = TCP 握手 3 包）依次落入 → 天平向左倾 7.5°（握手成本更重，与 S45「a handshake would cost more」语义一致；
 *   分镜表「右盘重、向右倾」与解说词相悖，按解说词实现，见 BUILD_NOTES）→ 6392 阻尼回摆（砝码微动）→ 6398 `cheaper` 灰 Pill。
 * 持续：问答节点间小脉冲波纹（6240 起每 48 帧一去、+24 回）+ 节点光呼吸。
 * 停留：cheaper 落位 6406 → 离场 6447（末 8 帧归零），41 帧 ✓。零 glitch、零扫光、无运镜。
 * 主角：问答图+天平组（y 240–600，~360px 高）；光 = 天平 HeroGlow（低强度 0.42）+ 问号包紫光 + 右盘白 BLOOM。
 */
const F0 = 6048;
const TO = 6454;
const T_NODES = 6048;  // 节点首帧（firstOp 首帧可见）
const T_BASE = 6056;  // S43 b1：天平底座/横梁/空盘 wipe（16 帧）
const T_LABELS = 6080; // ceremony / delivery 标签
const T_RIGHT_ENV = 6100; // 右盘白信封落入（10 帧）
const T_Q = 6168;     // S44 b1：问号包出发（16 帧）
const T_A = 6190;     // 答案包飞回（16 帧）
const T_ONEEACH = 6239; // `1 packet each way`
const T_DROP = 6350;   // S45：左盘三枚灰信封（间隔 8 帧）+ 天平左倾
const T_SETTLE = 6392; // 阻尼回摆（12 帧）
const T_CHEAPER = 6398; // cheaper Pill
const T_RIPPLE = 6240; // 节点脉冲波纹起（成片 v2：每 32 帧一去、+16 帧一回——提高频率打破真静）
const EXIT = TO - 8;   // 6447

const NODE_L = {cx: 280, cy: 285, r: 42};
const NODE_R = {cx: 1000, cy: 285, r: 42};
// 弧线（二次贝塞尔）：上弧 L→R（峰 ~242），下弧 R→L（谷 ~349）
const ARC_Q = {p0: [330, 285], c: [640, 198], p1: [950, 285]};
const ARC_A = {p0: [950, 305], c: [640, 392], p1: [330, 305]};
const FLIGHT = 16;
const bez = (a: number[], c: number[], b: number[], t: number): [number, number] => {
  const u = 1 - t;
  return [u * u * a[0] + 2 * u * t * c[0] + t * t * b[0], u * u * a[1] + 2 * u * t * c[1] + t * t * b[1]];
};

// 天平几何：枢轴 (640,470)，半梁 290，链 28；d>0 = 左端低（CSS rotate(−d)）
const PIV = {x: 640, y: 470};
const HALF = 290;
const CHAIN = 28;
const beamEnd = (d: number, side: -1 | 1): [number, number] => {
  const a = (d * Math.PI) / 180;
  return [PIV.x + side * HALF * Math.cos(a), PIV.y - side * HALF * Math.sin(a)];
};
/** 倾角（度，正 = 左低）：6350 起随三枚信封落盘阶梯加深 → 6392 阻尼回摆 → 常驻 7.5 */
const tilt = (N: number): number => {
  if (N < T_DROP) return 0;
  if (N < T_SETTLE) return 7.5 * easeInOutPow(2)(clamp01((N - T_DROP) / 30));
  const s = N - T_SETTLE;
  if (s < 14) return 7.5 - 1.15 * Math.exp(-s / 4.5) * Math.sin(0.55 * s);
  // 成片 v2：落定后天平轻微余摆（±0.5°，34 帧周期——打破 6248–6353 之后的真静尾段）
  return N < TO - 30 ? 7.5 + 0.5 * Math.sin((2 * Math.PI * (s - 14)) / 34) : 7.5 + 0.5 * Math.sin((2 * Math.PI * (TO - 30 - T_SETTLE - 14)) / 34); // 成片 v2：末 30 帧天平停摆（hold）
};
const panPos = (d: number, side: -1 | 1): [number, number] => {
  const [ex, ey] = beamEnd(d, side);
  return [ex, ey + CHAIN];
};
/** 信封落盘小脉冲（10 帧内 1.12→1） */
const landPulse = (n: number) => (n < 10 ? 1 + 0.12 * Math.pow(1 - n / 10, 2) : 1);

export const SC26: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const op = exitOp(N, TO, 8);
  const exDy = exitAccel(Math.max(0, N - EXIT), 0.25);
  const gk = glowOffK(N, TO);

  const d = tilt(N);
  const [lx, ly] = panPos(d, -1);
  const [rx, ry] = panPos(d, 1);
  const [lex, ley] = beamEnd(d, -1);
  const [rex, rey] = beamEnd(d, 1);

  const baseP = clamp01((N - T_BASE) / 16);
  const beamP = clamp01((N - (T_BASE + 6)) / 16);
  const breathe = 0.5 + 0.5 * Math.sin((2 * Math.PI * N) / 40);
  const nodeGlow = clamp01((N - (T_A + 20)) / 10) * (0.3 + 0.25 * breathe);

  // 问号包 / 答案包飞行进度（成片 v2：首趟后每 96 帧循环再飞一趟——打破 6248–6353 真静窗）
  const flightT = (t0: number) => {
    let n = N - t0;
    if (n < 0) return null;
    if (n > FLIGHT) {
      // 循环：首趟落地后，每 96 帧重飞一趟（仅首次后开始；离场前不再出发）
      const firstDone = t0 + FLIGHT;
      if (N < firstDone) return null;
      const period = 96;
      const cycle = Math.floor((N - firstDone) / period);
      const t1 = firstDone + cycle * period + 20;
      if (N < t1) return null;
      if (t1 + FLIGHT > TO - 8 - 32) return null; // 成片 v2：末 32 帧不再起飞（hold 稳定期）
      n = N - t1;
      if (n > FLIGHT) return null;
    }
    return easeInOutPow(2.2)(clamp01(n / FLIGHT));
  };
  const qt = flightT(T_Q);
  const at = flightT(T_A); // 答案包（循环趟与问号包保持各自相位）
  const qArr = N - (T_Q + FLIGHT);
  const aArr = N - (T_A + FLIGHT);

  // 节点脉冲波纹（6240 起每 48 帧一去，+24 回）
  const rippleQ = N >= T_RIPPLE && N < TO - 30 ? (N - T_RIPPLE) % 32 : -1; // 成片 v2：末 30 帧波纹停发（hold）
  const rippleA = N >= T_RIPPLE + 16 && N < TO - 30 ? (N - T_RIPPLE - 16) % 32 : -1;
  const rp = (r: number) => (r >= 0 && r <= 22 ? easeInOutPow(2)(clamp01(r / 22)) : null);

  return (
    <div style={{position: 'absolute', inset: 0, opacity: op, transform: exDy ? `translateY(${exDy.toFixed(1)}px)` : undefined}}>
      {/* ============ 上半：DNS 问答图 ============ */}
      {[NODE_L, NODE_R].map((nd, i) => {
        const nn = N - (T_NODES + i * 2);
        if (nn < 0) return null;
        const s = 0.7 + 0.3 * clamp01(nn / 12);
        return (
          <div key={i} style={{...abs(nd.cx - nd.r * s, nd.cy - nd.r * s, nd.r * 2 * s, nd.r * 2 * s + 40), opacity: firstOp(nn, 8)}}>
            <NodeDot cx={nd.r * s} cy={nd.r * s} r={nd.r * s - 2} label={i === 0 ? 'you' : 'DNS · :53'} glowP={nodeGlow} labelSize={22} />
          </div>
        );
      })}

      {/* 轨迹 draw-on（跟随飞行包；飞完留 35% 底） + 节点脉冲波纹 */}
      <Svg>
        {[ARC_Q, ARC_A].map((arc, i) => {
          const t0 = i === 0 ? T_Q : T_A;
          const n = N - t0;
          if (n < -8) return null;
          const drawn = clamp01(n / FLIGHT);
          const dd = `M ${arc.p0[0]} ${arc.p0[1]} Q ${arc.c[0]} ${arc.c[1]} ${arc.p1[0]} ${arc.p1[1]}`;
          return <path key={i} d={dd} fill="none" stroke={i === 0 ? PURPLE_LIGHT : GREY_LIGHT} strokeWidth={2.5} pathLength={100}
            strokeDasharray="100" strokeDashoffset={100 * (1 - drawn)} opacity={n > FLIGHT + 12 ? 0.35 : 0.85} />;
        })}
        {(() => {
          const items: React.ReactNode[] = [];
          const rq = rp(rippleQ), ra = rp(rippleA);
          if (rq !== null) {
            const [px, py] = bez(ARC_Q.p0, ARC_Q.c, ARC_Q.p1, rq);
            items.push(<circle key="rq" cx={px} cy={py} r={5} fill={PURPLE_LIGHT} opacity={0.9} style={{filter: 'drop-shadow(0 0 5px rgba(161,117,241,.9))'}} />);
          }
          if (ra !== null) {
            const [px, py] = bez(ARC_A.p0, ARC_A.c, ARC_A.p1, ra);
            items.push(<circle key="ra" cx={px} cy={py} r={5} fill={WHITE} opacity={0.85} style={{filter: 'drop-shadow(0 0 5px rgba(255,255,255,.8))'}} />);
          }
          return items;
        })()}
      </Svg>

      {/* 问号包（紫边 + 随行问题文本） */}
      {qt !== null ? (() => {
        const [px, py] = bez(ARC_Q.p0, ARC_Q.c, ARC_Q.p1, qt);
        return (
          <React.Fragment>
            <PacketIcon cx={px} cy={py} w={92} h={62} accent glow opacity={clamp01((N - T_Q + 4) / 6)} />
            <MonoText x={px - 132} y={py + 40} size={22} color={GREY_LIGHT}>{EXAMPLE.dnsQuery}</MonoText>
          </React.Fragment>
        );
      })() : null}
      {/* 答案包（白边 + 随行答案文本） */}
      {at !== null ? (() => {
        const [px, py] = bez(ARC_A.p0, ARC_A.c, ARC_A.p1, at);
        return (
          <React.Fragment>
            <PacketIcon cx={px} cy={py} w={92} h={62} opacity={clamp01((N - T_A + 4) / 6)} />
            <MonoText x={px - 62} y={py + 42} size={24} color={WHITE} style={{letterSpacing: 0.5}}>{EXAMPLE.dnsAnswer}</MonoText>
          </React.Fragment>
        );
      })() : null}

      {/* 到达白闪 + 落点 ripple（右节点 / 左节点） */}
      {qArr >= 0 && qArr < 14 ? (
        <React.Fragment>
          <div style={{...abs(NODE_R.cx - NODE_R.r, NODE_R.cy - NODE_R.r, NODE_R.r * 2, NODE_R.r * 2), borderRadius: '50%', border: `3px solid ${PURPLE_LIGHT}`, background: 'rgba(161,117,241,0.16)', filter: `brightness(${1 + 0.5 * (1 - qArr / 5)})`, opacity: 1 - qArr / 14}} />
          <div style={{...abs(NODE_R.cx - 46 - qArr * 3.2, NODE_R.cy - 46 - qArr * 3.2, (46 + qArr * 3.2) * 2, (46 + qArr * 3.2) * 2), borderRadius: '50%', border: `2.5px solid ${PURPLE_LIGHT}`, opacity: 0.7 * (1 - qArr / 14)}} />
        </React.Fragment>
      ) : null}
      {aArr >= 0 && aArr < 14 ? (
        <React.Fragment>
          <div style={{...abs(NODE_L.cx - NODE_L.r, NODE_L.cy - NODE_L.r, NODE_L.r * 2, NODE_L.r * 2), borderRadius: '50%', border: `3px solid ${WHITE}`, background: 'rgba(255,255,255,0.14)', filter: `brightness(${1 + 0.5 * (1 - aArr / 5)})`, opacity: 1 - aArr / 14}} />
          <div style={{...abs(NODE_L.cx - 46 - aArr * 3.2, NODE_L.cy - 46 - aArr * 3.2, (46 + aArr * 3.2) * 2, (46 + aArr * 3.2) * 2), borderRadius: '50%', border: `2.5px solid ${WHITE}`, opacity: 0.7 * (1 - aArr / 14)}} />
        </React.Fragment>
      ) : null}

      {/* `1 packet each way` */}
      <SoftIn N={N} f0={T_ONEEACH}>
        <CText cx={640} cy={398} size={22} weight={600} family={FONT_MONO} color={GREY} dy={0}>1 packet each way</CText>
      </SoftIn>

      {/* ============ 下半：成本天平 ============ */}
      <HeroGlow x={PIV.x - 310} y={PIV.y - 46} w={620} h={170} r={14} N={N} k={0.42 * gk * baseP} />
      {baseP > 0 ? (
        <div style={{position: 'absolute', inset: 0, opacity: softOp(N - T_BASE, 5)}}>
          <Svg bloom={false}>
            {/* 支柱 + 底座（draw-on） */}
            <line x1={PIV.x} y1={PIV.y} x2={PIV.x} y2={PIV.y + 116} stroke={WHITE} strokeWidth={4} opacity={baseP} />
            <path d={`M ${PIV.x - 72} ${PIV.y + 130} L ${PIV.x + 72} ${PIV.y + 130} L ${PIV.x + 46} ${PIV.y + 104} L ${PIV.x - 46} ${PIV.y + 104} Z`}
              fill="#000" stroke={WHITE} strokeWidth={2.5} opacity={baseP} pathLength={100} strokeDasharray="100" strokeDashoffset={100 * (1 - baseP)} />
            {/* 横梁（自枢轴向两侧生长，rotate(−d) = 左端低） */}
            <g transform={`rotate(${(-d).toFixed(3)} ${PIV.x} ${PIV.y})`} opacity={beamP}>
              <line x1={PIV.x - HALF * beamP} y1={PIV.y} x2={PIV.x + HALF * beamP} y2={PIV.y} stroke={WHITE} strokeWidth={5} />
              <circle cx={PIV.x} cy={PIV.y} r={7} fill="#000" stroke={WHITE} strokeWidth={2.5} />
              <circle cx={lex} cy={ley} r={4.5} fill={WHITE} />
              <circle cx={rex} cy={rey} r={4.5} fill={WHITE} />
            </g>
            {/* 吊链（随梁端）+ 秤盘（保持水平；左灰右白） */}
            {([[-1, lx, ly], [1, rx, ry]] as Array<[-1 | 1, number, number]>).map(([side, px, py]) => (
              <g key={side}>
                <line x1={px - 26} y1={py - CHAIN} x2={px - 2} y2={py - 4} stroke={GREY_LIGHT} strokeWidth={1.8} opacity={0.85} />
                <line x1={px + 26} y1={py - CHAIN} x2={px + 2} y2={py - 4} stroke={GREY_LIGHT} strokeWidth={1.8} opacity={0.85} />
                <path d={`M ${px - 46} ${py - 3} Q ${px} ${py + 13} ${px + 46} ${py - 3}`} fill="#000" stroke={side === 1 ? WHITE : GREY_MID} strokeWidth={2.5} />
              </g>
            ))}
          </Svg>

          {/* 右盘：1 枚白信封（delivery，落入并随盘移动） */}
          {(() => {
            const n = N - T_RIGHT_ENV;
            if (n < 0) return null;
            const drop = Math.min(1, n / 10);
            const restY = ry - 24;
            const ey = restY - 104 * (1 - powIn(1.9)(drop));
            return (
              <div style={{position: 'absolute', inset: 0, opacity: clamp01((n + 3) / 6)}}>
                <PacketIcon cx={rx} cy={ey} w={62} h={42} scale={landPulse(n - 10)} />
              </div>
            );
          })()}

          {/* 左盘：三枚灰信封（ceremony，6350/6358/6366 依次落入堆叠，随盘移动） */}
          {[0, 1, 2].map((k) => {
            const t0 = T_DROP + k * 8;
            const n = N - t0;
            if (n < 0) return null;
            const drop = Math.min(1, n / 10);
            const restY = ly - 22 - k * 13;
            const ey = restY - 112 * (1 - powIn(1.9)(drop));
            return (
              <div key={k} style={{position: 'absolute', inset: 0, opacity: clamp01((n + 3) / 6)}}>
                <PacketIcon cx={lx - 3 + (k - 1) * 13} cy={ey} w={58} h={40} color={GREY_LIGHT} scale={landPulse(n - 10)} />
              </div>
            );
          })}

          {/* 盘标签 */}
          <SoftIn N={N} f0={T_LABELS}>
            <CText cx={lx} cy={ly + 36} size={22} weight={600} family={FONT_MONO} color={GREY} dy={0}>ceremony</CText>
          </SoftIn>
          <SoftIn N={N} f0={T_LABELS + 2}>
            <CText cx={rx} cy={ry + 36} size={22} weight={600} family={FONT_MONO} color={GREY} dy={0}>delivery</CText>
          </SoftIn>

          {/* `cheaper`（右盘上方，灰 Pill；右盘因更轻而升起） */}
          <SoftIn N={N} f0={T_CHEAPER}>
            <Pill x={rx - 58} y={ry - 88} w={116} h={32} r={16} stroke={GREY} sw={2} fill="#000"
              text="cheaper" fontSize={22} weight={700} family={FONT_MONO} color={GREY_LIGHT} textDy={0} />
          </SoftIn>
        </div>
      ) : null}
    </div>
  );
};
