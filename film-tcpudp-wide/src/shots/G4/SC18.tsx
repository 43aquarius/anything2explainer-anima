import React from 'react';
import {useCurrentFrame} from 'remotion';
import {clamp01, easeOutCubic, FONT_MONO, rnd} from '../../common';
import {
  abs, CText, exitAccel, exitOp, glowOffK, GREY, GREY_LINE, GREY_LIGHT, GREEN,
  MonoText, ORANGE, PacketIcon, Pill, RED_DEEP, softOp, Svg, TechText, WHITE, GLOW_RED,
} from '../../ui';
import {HeroGlow} from '../../fx';

/**
 * SC18 TCP 听网络说话 · N 3898–4219（S29 3906–3966 + S30 3977–4197，¶ 段内段末：延到 SC19.from−1）
 * 中央发送速率仪表盘（x 300–980, y 200–560）：上=锯齿曲线区（240 帧历史窗右端持续推进）；
 * 右=速率竖条（4041 起 14 帧高度砍半）；下=发送带（信封密度=速率）；右上=网络状态指示灯。
 * 3977/3990 两枚信封中途碎裂坠落 + 指示灯翻红 + 曲线下跌拐点；4041 `× ½` 橙 Pill；
 * 4109 指示灯回绿 + 曲线小步爬升（每 12 帧 +5%）+ `probe` 灰字。
 * 零 glitch。持续：曲线右端推进 / 发送带流动 / 指示灯呼吸 / 爬升阶梯（至 0.85 后带流持续）。
 * 停留（分镜表原判）：末元素（爬升曲线）持续，离场末 8 帧归零。
 */
const F0 = 3898, TO = 4219;
const B_DASH = 3898;  // 仪表盘 wipe（14 帧）
const B_LISTEN = 3906; // 节拍 1：TCP listens（指示灯绿呼吸）
const B_LOSS = 3977;   // 节拍 2：envelopes disappearing（碎裂 + 翻红 + 拐点）
const B_HALF = 4041;   // 节拍 3：rate in half（× ½ Pill + 砍半）
const B_PROBE = 4109;  // 节拍 4：ramp back up（回绿 + 爬升 + probe）
const EXIT = TO - 8;   // 4191

const DASH = {x: 300, y: 200, w: 680, h: 360};
const PLOT = {x: 330, y: 250, w: 600, h: 180}; // 曲线区（y 250–430）
const BAR = {x: 944, w: 24, yBase: 430, hMax: 170};
const BAND = {y: 470, x0: 330, x1: 930};
const IND = {cx: 868, cy: 226};
const PERIM = 2 * (DASH.w + DASH.h);
const HIST = 240; // 历史窗（帧）
const LOSS_TIMES = [3977, 3990];

/** 发送速率 0..1（纯函数）：平 1.0 → 3977 起缓跌 → 4041 十四帧砍半 → 4109 起每 12 帧爬 5% */
const rate = (n: number): number => {
  if (n < B_LOSS) return 1.0;
  if (n < B_HALF) return 1.0 - 0.08 * ((n - B_LOSS) / 64);
  if (n < B_HALF + 14) return 0.92 - 0.42 * easeOutCubic((n - B_HALF) / 14);
  if (n < B_PROBE) return 0.5;
  return Math.min(0.85, 0.5 + 0.05 * Math.floor((n - B_PROBE) / 12));
};
const yOf = (r: number) => PLOT.y + PLOT.h - 8 - r * (PLOT.h - 26);
const xOf = (t: number, N: number) => PLOT.x + ((t - (N - HIST)) / HIST) * PLOT.w;

/** 碎裂信封（victim）：spawn 起随带右行，break 时碎成 5 片抛物坠落 */
const Victim: React.FC<{spawn: number; breakAt: number; N: number; seed: number; op: number}> = ({spawn, breakAt, N, seed, op}) => {
  if (N < spawn) return null;
  const x0 = 392 + (Math.min(N, breakAt) - spawn) * 8;
  if (N < breakAt) return <PacketIcon cx={x0} cy={BAND.y - 16} w={46} h={32} />;
  const d = N - breakAt;
  if (d > 12) return null;
  const fade = 1 - d / 12;
  return (
    <Svg opacity={fade * op}>
      {Array.from({length: 5}, (_, k) => {
        const vx = (rnd(seed, k) - 0.5) * 7, vy = -2 - rnd(seed, k + 9) * 3;
        const px = x0 + vx * d, py = BAND.y - 16 + vy * d + 0.5 * d * d;
        return <rect key={k} x={px - 4} y={py - 3} width={8} height={6} fill={GREY_LIGHT} opacity={0.9} transform={`rotate(${(rnd(seed, k + 5) * 40 - 20).toFixed(1)} ${px} ${py})`} />;
      })}
      <rect x={x0 - 6} y={BAND.y - 22} width={12} height={2.5} fill={ORANGE} opacity={0.7} />
    </Svg>
  );
};

export const SC18: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const op = exitOp(N, TO, 8);
  const dy = exitAccel(Math.max(0, N - EXIT), 0.5);
  const gk = glowOffK(N, TO);
  const wipe = clamp01((N - B_DASH) / 16);
  const wipeOp = N < B_DASH ? 0 : softOp(N - B_DASH, 5);
  const r = rate(Math.min(N, EXIT - 30)); // 成片 v3：末 30 帧速率冻结（爬升停在档位上，hold 稳定期）
  const breath = 0.5 + 0.5 * Math.sin((2 * Math.PI * N) / 30);

  // 指示灯：绿呼吸 → 3977 红（前 6 帧闪）→ 4109 回绿呼吸
  const isRed = N >= B_LOSS && N < B_PROBE;
  const indColor = isRed ? RED_DEEP : GREEN;
  const indBlink = isRed && N < B_LOSS + 6 ? (N - B_LOSS) % 2 === 0 : true;

  // 曲线：61 个采样点（4 帧一点），右端 = 当前（成片 v2：末 30 帧冻结曲线推进——hold 稳定期）
  const Nc = Math.min(N, EXIT - 30);
  const pts: string[] = [];
  for (let t = Nc - HIST; t <= Nc; t += 4) {
    const noise = (rnd(11, Math.floor(t / 4)) - 0.5) * 5;
    pts.push(`${xOf(t, Nc).toFixed(1)},${(yOf(rate(t)) + noise).toFixed(1)}`); // 成片 v6：曲线整体随 Nc 冻结（不再左滚）
  }
  const headX = xOf(Nc, N), headY = yOf(r);
  // 发送带流速末段降为 0.4px（成片 v2 hold 稳定期）
  const bandV = N < EXIT - 30 ? 5 : Math.max(0.4, 5 - (N - (EXIT - 30)) * 0.35);

  // 发送带：密度 = 速率（8 → 4），右行 5px/帧
  const density = Math.max(3, Math.min(8, Math.round(r * 8)));
  const BAND_FREEZE = EXIT - 46; // 成片 v7：末 46 帧整带冻结（单调，不倒退）
  const envX = (i: number) => BAND.x0 + ((i * 78 + (Math.min(N, BAND_FREEZE) - F0) * 5 + (N > BAND_FREEZE ? 0.3 * (N - BAND_FREEZE) : 0)) % (BAND.x1 - BAND.x0 - 46));
  void bandV;

  return (
    <div style={{position: 'absolute', inset: 0, opacity: op, transform: `translateY(${dy.toFixed(2)}px)`}}>
      {/* 仪表盘主角柔光 */}
      <HeroGlow x={DASH.x - 12} y={DASH.y - 12} w={DASH.w + 24} h={DASH.h + 24} r={16} N={Math.min(N, EXIT - 46)} k={0.6 * gk} /> {/* 成片 v5：末 46 帧柔光呼吸冻结（hold） */}

      {/* 外框 draw-on */}
      <Svg bloom={false}>
        <rect x={DASH.x} y={DASH.y} width={DASH.w} height={DASH.h} fill="rgba(0,0,0,0.4)" stroke={WHITE} strokeWidth={3}
          strokeDasharray={`${PERIM}`} strokeDashoffset={PERIM * (1 - wipe)} />
      </Svg>

      {/* 内容（左→右 wipe；内部用画布绝对坐标，外层裁剪） */}
      <div style={{...abs(DASH.x + 2, DASH.y + 2, (DASH.w - 4) * wipe, DASH.h - 4), overflow: 'hidden', opacity: wipeOp}}>
        <div style={{position: 'absolute', left: -(DASH.x + 2), top: -(DASH.y + 2), width: 1280, height: 720}}>
          {/* 顶条：标题 + 指示灯 */}
          <TechText cx={352} cy={228} text="TCP" fontSize={34} />
          <MonoText x={404} y={216} size={22} color={GREY}>sending rate</MonoText>
          <div style={{...abs(IND.cx - 9, IND.cy - 9, 18, 18), borderRadius: '50%', background: indColor,
            opacity: indBlink ? 1 : 0.35, boxShadow: `0 0 ${10 + 10 * breath}px ${2 + 3 * breath}px ${isRed ? 'rgba(236,8,31,.55)' : 'rgba(143,247,64,.45)'}`}} />
          <MonoText x={IND.cx + 20} y={216} size={22} color={GREY}>network</MonoText>

          {/* 网格 */}
          {[0, 1, 2].map((k) => (
            <div key={k} style={{...abs(PLOT.x, PLOT.y + 30 + k * 50, PLOT.w, 1), background: GREY_LINE, opacity: 0.7}} />
          ))}

          {/* 锯齿曲线（历史窗滚动） + 当前值端点 + 丢包 × */}
          <Svg bloom={false}>
            <polyline points={pts.join(' ')} fill="none" stroke={WHITE} strokeWidth={3} strokeLinejoin="round"
              style={{filter: `drop-shadow(0 0 4px rgba(255,255,255,${0.35 * gk}))`}} />
            <circle cx={headX} cy={headY} r={5.5} fill={WHITE} style={{filter: `drop-shadow(0 0 6px rgba(255,255,255,.8))`}} />
            {LOSS_TIMES.map((L) => {
              if (L < Nc - HIST || Nc < L) return null;
              const lx = xOf(L, Nc), ly = yOf(rate(L)); // 成片 v4：× 标记随曲线冻结（不再随窗口滚动）
              return <g key={L} stroke={ORANGE} strokeWidth={3} strokeLinecap="round" opacity={softOp(N - L, 5) * 0.95}>
                <line x1={lx - 6} y1={ly - 12} x2={lx + 6} y2={ly} />
                <line x1={lx + 6} y1={ly - 12} x2={lx - 6} y2={ly} />
              </g>;
            })}
          </Svg>

          {/* 速率竖条（4041 十四帧砍半；爬升期小步长高） */}
          <div style={{...abs(BAR.x, BAR.yBase - r * BAR.hMax, BAR.w, r * BAR.hMax), background: 'rgba(102,48,248,0.5)',
            border: `2px solid ${WHITE}`, boxShadow: `0 0 ${12 * gk}px 3px rgba(102,45,248,${0.35 * gk})`}} />
          <MonoText x={BAR.x - 18} y={BAR.yBase + 10} size={22} color={GREY}>rate</MonoText>

          {/* 发送带（密度 = 速率） */}
          <div style={{...abs(BAND.x0, BAND.y - 1.25, BAND.x1 - BAND.x0, 2.5), background: GREY_LINE}} />
          {Array.from({length: 8}, (_, i) => {
            if (i >= density) return null;
            return <PacketIcon key={i} cx={envX(i)} cy={BAND.y - 16} w={46} h={32} opacity={0.95} />;
          })}

          {/* 碎裂信封 ×2（3977 / 3990） */}
          <Victim spawn={3963} breakAt={3977} N={N} seed={21} op={1} />
          <Victim spawn={3976} breakAt={3990} N={N} seed={22} op={1} />

          {/* probe 灰字（4109） */}
          <TechText cx={720} cy={276} text="probe" fontSize={24} color={GREY} glow={false} opacity={softOp(N - B_PROBE, 8)} />
        </div>
      </div>

      {/* × ½ 橙 Pill（4041 弹出，速率条旁） */}
      {N >= B_HALF ? (
        <div style={{position: 'absolute', inset: 0, transform: `scale(${0.5 + 0.5 * easeOutCubic(clamp01((N - B_HALF) / 8))})`, transformOrigin: '872px 320px'}}>
          <Pill x={828} y={300} w={88} h={44} r={22} stroke={ORANGE} fill="#000" sw={2.5}
            style={{boxShadow: `0 0 ${18 * gk}px 5px rgba(240,95,65,${0.4 * gk})`}}
            text={<span style={{fontSize: 27, fontWeight: 800, color: ORANGE}}>× ½</span>} />
        </div>
      ) : null}
    </div>
  );
};
