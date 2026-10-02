import React from 'react';
import {useCurrentFrame} from 'remotion';
import {clamp01, easeInOutPow, rnd, FONT_MONO} from '../../common';
import {
  Pill, PacketIcon, abs, exitOp, exitAccel, scaleIn, fadeIn, firstOp, mixHex, WHITE, GREY, GREY_MID, ORANGE, RED_DEEP, PURPLE_LIGHT,
} from '../../ui';

/**
 * SC08 三种事故 · N 1570–1737（S12 1578–1735：1578「lost」/ 1661「delivered out of order」/ 1700「or copied twice」，¶ 段末）
 * 版式：三条水平泳道（y 220/360/500，各 x 160–1060，虚线泳道框 30% 白）；
 *       每条泳道 4 枚编号信封（#1–#4）2.5px/帧持续右行（持续动作，左端 420 → 右端 1045 循环补位）；
 *       泳道左端标签 Pill：lost（红边）/ reordered（橙边）/ duplicated（紫边），事故窗口内标签色光点亮。
 * 事故：lost = 中点信封 powIn2 坠落（20 帧）+ 灰 × 与粒子散开，坠后缺席至相位自然换圈回左端淡入重列
 *       （坠落点取每周期 [500,980] 内可见槽的最右侧：1581@896 / 1617@830 / 1653@764，缺席互错开，车道最少保底 2 枚；
 *       第 4 拍 1689 的坠落已删：坠落结束 1709 距离场 1729 仅 20 帧，末拍稳定期不够 30）；
 *       reordered = #2/#3 各 16 帧弧线互换（1661，一次）+ 到位后边框橙闪；
 *       duplicated = #2 后方 −76px 再生一枚半透明紫边副本（**1684 前挂 16 帧**，12 帧缩放入场 → 1696 落位、
 *       紫闪 1690–1698，与节拍 1700「or copied twice」基本同步；分镜表原 1700 落位 1714 → 离场 1729 仅 15 帧
 *       稳定期 <30，按「末拍余量不够 → 末拍元素前挂到上一块」规则处理，已记 BUILD_NOTES）。
 * 停留：末次事故（副本紫闪）结束 1698 → 离场 1729，31 帧 ✓（S12 末块 36）。
 * 节拍：1570/1572/1574 三泳道自上而下 2 帧错峰 wipe 展开（首帧 firstOp 可见）；信封流 1578 起。
 * 离场：末 8 帧（1730–1737）归零；信封流持续到离场（停留 ✓，S12 末块 36+gap）。
 * 主角：三泳道组（lane 框 900×104 折算 ~166px + 标签 + 信封列，组高 360px）；光 = 当前事故泳道标签色光；信封白（BLOOM）。
 */
const F0 = 1570;
const TO = 1737;
const FLOW0 = 1578;
const SPEED = 2.5;
const V_RAMP0 = 1737 - 8 - 44; // 成片 v3：末 44 帧减速（16 帧内降到 0.1×，hold 稳定期）
const X0 = 420, X1 = 1045, SPAN = X1 - X0;
const PHASES = [0, 156.25, 312.5, 468.75];

const LANES = [
  {y: 220, label: 'lost', color: RED_DEEP, rgba: '236,8,31', w: 108},
  {y: 360, label: 'reordered', color: ORANGE, rgba: '240,95,65', w: 196},
  {y: 500, label: 'duplicated', color: PURPLE_LIGHT, rgba: '161,117,241', w: 196},
];

const L1_CYCLES = [1581, 1617, 1653]; // 坠落周期（36 帧一循环；末次 1653+20=1673，末拍稳定期 ≥30 需要，第 4 拍已删）
const SWAP_T = 1661, SWAP_LEN = 16; // #2/#3 互换（已核 [1661,1677] 不撞右端 wrap）
const DUP_T = 1684, DUP_OFF = -76; // #2 后方副本（1684 前挂，见文件头）

const mod = (a: number, m: number) => ((a % m) + m) % m;
const vNow = (N: number) => (N < V_RAMP0 ? 1 : Math.max(0.1, 1 - (N - V_RAMP0) / 16)); // 成片 v3：16 帧降到 0.1×
const posOf = (phase: number, N: number) => X0 + mod(phase + SPEED * (Math.min(N, TO - 8 - 46) - FLOW0), SPAN); // 成片 v4：末 34 帧整列冻结（hold）
const edgeOp = (x: number) => clamp01((x - X0) / 26) * clamp01((X1 - x) / 26);

/**
 * 泳道 1 槽位状态（纯函数）：相位永久固定（4 槽始终等距 156.25，永不重叠——复核发现上一版"坠后重置相位到左端"
 * 会让重置槽与自然换圈的槽任意贴近，f_1679–f_1731 实测两信封叠成 158px 宽的团）。
 * 每周期在 [500,980] 内**可见**的槽中选最右侧者坠落（右侧坠落 → 缺席窗口短，车道不致掏空）；
 * 坠完 20 帧后该槽进入缺席（不渲染），待其相位自然换圈（mod 越过 625 → x 回到左端 420）时由
 * edgeOp 自动淡入重新入列（缺席 = 20 帧 + (X1−坠落点)/SPEED，各槽错开）。
 */
type L1Slot = {phase: number; fallT: number; back: number};
const lane1Slots = (N: number): L1Slot[] => {
  const slots: L1Slot[] = PHASES.map((p) => ({phase: p, fallT: -1, back: -1}));
  for (const T of L1_CYCLES) {
    if (T > N) break;
    let best = -1, bx = -1;
    slots.forEach((s, i) => {
      if (s.fallT >= 0 && T < s.back) return; // 坠落中/缺席 → 不可选
      const x = posOf(s.phase, T);
      if (x < 500 || x > 980) return;
      if (x > bx) {bx = x; best = i;}
    });
    if (best < 0) continue;
    slots[best].fallT = T;
    slots[best].back = Math.ceil(T + (X1 - bx) / SPEED); // 自然换圈时刻 = 重新入列
  }
  return slots;
};

/** 灰 × + 粒子散开（丢失记号，14 帧生命） */
const LossMark: React.FC<{x: number; y: number; t: number; seed: number}> = ({x, y, t, seed}) => {
  const op = 0.9 * (1 - t);
  if (op <= 0) return null;
  return (
    <svg width={1280} height={720} viewBox="0 0 1280 720" style={{position: 'absolute', inset: 0, overflow: 'visible', opacity: op}}>
      <g stroke={GREY} strokeWidth={2.5} strokeLinecap="round">
        <line x1={x - 8} y1={y - 26 + 12 * t} x2={x + 8} y2={y - 10 + 12 * t} />
        <line x1={x + 8} y1={y - 26 + 12 * t} x2={x - 8} y2={y - 10 + 12 * t} />
      </g>
      {[0, 1, 2, 3].map((k) => {
        const a = rnd(seed, k, 3) * Math.PI * 2;
        const r = 10 + 16 * t;
        return <circle key={k} cx={x + Math.cos(a) * r} cy={y - 18 + Math.sin(a) * r * 0.7} r={2.4} fill={GREY_MID} />;
      })}
    </svg>
  );
};

export const SC08: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const exN = N - (TO - 8);
  const exOp = exitOp(N, TO, 8);
  const exDy = exitAccel(exN, 0.05);

  // 标签激活窗口（事故发生时点亮色光，前后各 4 帧渐变）
  const winK = (a: number, b: number) => clamp01((N - a) / 4) * clamp01((b - N) / 4);
  const labelK = [
    Math.max(...L1_CYCLES.map((T) => winK(T, T + 18))),
    winK(SWAP_T, SWAP_T + 24),
    winK(DUP_T, DUP_T + 14),
  ];

  // 泳道 2 互换进度
  const swN = N - SWAP_T;
  const swE = swN < 0 ? 0 : easeInOutPow(2)(clamp01(swN / SWAP_LEN));
  const swapped = swN >= SWAP_LEN;
  const swArc = 15 * Math.sin(Math.PI * clamp01(swN / SWAP_LEN));
  // 到位橙闪（1677–1685）
  const fl2 = swapped ? Math.max(0, 1 - (N - (SWAP_T + SWAP_LEN)) / 8) : 0;

  // 泳道 3 副本
  const dn = N - DUP_T;
  const dupS = dn < 0 ? 0 : 0.15 + 0.85 * scaleIn(dn, 12);
  const dupOp = dn < 0 ? 0 : fadeIn(dn, 8) * 0.45;
  const fl3 = dn > 6 ? Math.max(0, 1 - (N - (DUP_T + 6)) / 8) : 0;

  return (
    <div style={{position: 'absolute', inset: 0, opacity: exOp, transform: exDy ? `translateY(${exDy.toFixed(1)}px)` : undefined}}>
      {LANES.map((lane, li) => {
        const wp = clamp01((N - (F0 + 2 * li)) / 12);
        if (wp <= 0) return null;
        return (
          <div key={lane.label} style={{position: 'absolute', inset: 0, opacity: firstOp(N - F0, 6), clipPath: `inset(0 ${((1 - wp) * 100).toFixed(2)}% 0 0)`}}>
            {/* 泳道框（虚线 30% 白） */}
            <div style={{...abs(160, lane.y - 52, 900, 104), border: `2px dashed rgba(255,255,255,.3)`, borderRadius: 10, background: 'rgba(0,0,0,.45)'}} />
            {/* 左端标签 Pill + 事故色光 */}
            <div style={{...abs(175, lane.y - 22, lane.w, 44), borderRadius: 22, boxShadow: labelK[li] > 0 ? `0 0 18px 5px rgba(${lane.rgba},${(0.5 * labelK[li]).toFixed(3)})` : 'none'}}>
              <Pill x={0} y={0} w={lane.w} h={44} fill="#000" stroke={lane.color} sw={2.5} text={lane.label} fontSize={24} weight={700} family={FONT_MONO} color={WHITE} textDy={0} />
            </div>
            {/* 信封列（4 枚，2.5px/帧右行） */}
            {PHASES.map((ph, i) => {
              if (li === 0) {
                // 泳道 1：lost 坠落（固定相位等距流动；坠后缺席至自然换圈，换圈即从左端淡入重列）
                const s = lane1Slots(N)[i];
                if (s.fallT >= 0 && N >= s.fallT + 20 && N < s.back) return null; // 缺席窗口
                const falling = s.fallT >= 0 && N >= s.fallT && N < s.fallT + 20;
                const t = falling ? (N - s.fallT) / 20 : 0;
                const x = posOf(s.phase, N);
                const dy = falling ? 52 * t * t : 0;
                const op = falling ? edgeOp(x) * (1 - t) : edgeOp(x);
                return (
                  <React.Fragment key={i}>
                    <PacketIcon cx={x} cy={lane.y + dy} w={68} h={47} opacity={op} stamp={`#${i + 1}`} />
                    {falling ? <LossMark x={posOf(s.phase, s.fallT)} y={lane.y} t={(N - s.fallT) / 14} seed={s.fallT} /> : null}
                  </React.Fragment>
                );
              }
              if (li === 1 && (i === 1 || i === 2)) {
                // 泳道 2：#2/#3 弧线互换（slot1↔slot2），之后互走对方轨迹
                const mine = swapped ? (i === 1 ? PHASES[2] : PHASES[1]) : ph;
                const other = i === 1 ? PHASES[2] : PHASES[1];
                const ax = posOf(mine, N), bx = posOf(other, N);
                const x = swapped ? ax : ax + (bx - ax) * swE;
                const dy = i === 1 ? swArc : -swArc;
                const stroke = fl2 > 0 ? mixHex(WHITE, ORANGE, fl2) : WHITE;
                return (
                  <React.Fragment key={i}>
                    {fl2 > 0 ? <div style={{...abs(x - 38, lane.y + dy - 30, 76, 60), borderRadius: 10, background: `rgba(240,95,65,${(0.1 * fl2).toFixed(3)})`, boxShadow: `0 0 16px 5px rgba(240,95,65,${(0.45 * fl2).toFixed(3)})`}} /> : null}
                    <PacketIcon cx={x} cy={lane.y + dy} w={68} h={47} color={stroke} opacity={edgeOp(x)} stamp={`#${i + 1}`} />
                  </React.Fragment>
                );
              }
              // 常规流动（泳道 2 的 #1/#4、泳道 3 全部）
              const x = posOf(ph, N);
              return <PacketIcon key={i} cx={x} cy={lane.y} w={68} h={47} opacity={edgeOp(x)} stamp={`#${i + 1}`} />;
            })}
            {/* 泳道 3：#2 的半透明副本（duplicated） */}
            {li === 2 && dn >= 0 ? (
              <React.Fragment>
                {fl3 > 0 ? <div style={{...abs(posOf(PHASES[1], N) + DUP_OFF - 38, lane.y - 30, 76, 60), borderRadius: 10, background: `rgba(161,117,241,${(0.1 * fl3).toFixed(3)})`, boxShadow: `0 0 16px 5px rgba(161,117,241,${(0.45 * fl3).toFixed(3)})`}} /> : null}
                <PacketIcon cx={posOf(PHASES[1], N) + DUP_OFF} cy={lane.y} w={68} h={47} accent opacity={dupOp} scale={dupS} stamp="#2" />
              </React.Fragment>
            ) : null}
          </div>
        );
      })}
    </div>
  );
};
