import React from 'react';
import {useCurrentFrame} from 'remotion';
import {clamp01, easeInOutCubic, FONT_MONO, FONT_ORB} from '../../common';
import {
  abs, Check, exitAccel, exitOp, glowOffK, glowPurpleS, GREY, GREY_LINE, GREY_MID, NodeDot,
  ORANGE, PacketIcon, Pill, PURPLE_LIGHT, softOp, Svg, WHITE,
} from '../../ui';
import {HeroGlow} from '../../fx';

/**
 * SC17 窗口 · N 3664–3897（S28 3672–3863，¶+gap12 段内段末：延到 SC18.from−1）
 * 左：发送端节点 + 待发信封堆；右：接收端货架（4 层板，自下而上入格）+ `window: 4` 紫边 Pill +
 * 第 4 层上方紫虚线窗口边界（行进虚线）；中间发送带（小刻度持续右行）。
 * 流控演示一轮：3738–3774 快发 E1–E4 入格（快发送者）→ 3794 满格：橙 `wait` 小旗弹出、发送暂停 →
 * 3812 底格信封滑出 + 绿 Check（已读走）→ 旗落、恢复发送（E5 补进空格，E6 在途，离场时仍在飞）。
 * 零 glitch。持续：发送带刻度右行 / 窗口边界虚线行进 / 旗面微摆 / 信封入格。
 * 停留（分镜表原判）：末循环元素持续，离场末 8 帧归零（E6 3862 入格后带流持续到 3889 离场）。
 */
const F0 = 3664, TO = 3897;
const B_SHELF = 3664; // 货架 + 发送端 draw-on
const B_AD = 3672;     // 节拍 1：receiver advertises capacity（格底逐格淡入）
const B_WIN = 3725;    // 节拍 2：window（Pill + 边界 + 计数 1→4）
const B_SEND = 3738;   // E1–E4 起飞（12 帧间隔，20 帧飞行）
const B_FLAG = 3794;   // 满格 → wait 小旗（对齐节拍 3「never drowns」3792 −... +2）
const B_READ = 3812;   // 底格滑出 + Check + 旗落
const B_RESUME = 3820; // 恢复：E5（3820 起 → 3840 入底格）、E6（3842 起，在途）
const EXIT = TO - 8;   // 3857

const NODE = {cx: 220, cy: 345, r: 46};
const BAND = {y: 360, x0: 290, x1: 660};
const SHELF = {x0: 660, x1: 1130};
const BOARDS = [480, 415, 350, 285]; // 板面 y（自下而上 = 第 1..4 层）
const CELL = {cx: 750, w: 116, h: 64};
const WIN_PILL = {x: 664, y: 150, w: 188, h: 46};
const BOUND_Y = 208; // 窗口边界虚线（第 4 层格顶 221 之上）

/** 信封飞行：先沿发送带右行至 660，再抬/落进目标格（20 帧 easeInOutCubic） */
const flightPos = (t: number, targetY: number) => {
  const e = easeInOutCubic(clamp01(t / 20));
  const k = 0.62;
  if (e < k) return {x: 285 + (660 - 285) * (e / k), y: BAND.y};
  const u = (e - k) / (1 - k);
  return {x: 660 + (CELL.cx - 660) * u, y: BAND.y + (targetY - BAND.y) * u};
};

const ENVS: Array<{id: number; f: number; board: number; leave?: number}> = [
  {id: 1, f: 3738, board: 0, leave: B_READ}, // E1 → 底板，3812 被读走
  {id: 2, f: 3750, board: 1},
  {id: 3, f: 3762, board: 2},
  {id: 4, f: 3774, board: 3},
  {id: 5, f: B_RESUME, board: 0}, // 恢复后补进空出的底板
  {id: 6, f: 3842, board: 1},     // 恢复后在途（离场时未到）
];

export const SC17: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const op = exitOp(N, TO, 8);
  const dy = exitAccel(Math.max(0, N - EXIT), 0.5);
  const gk = glowOffK(N, TO);
  const shelfP = clamp01((N - B_SHELF) / 18);
  const winVal = Math.min(4, Math.max(1, Math.round(1 + 3 * clamp01((N - B_WIN) / 14))));
  const tickX = (k: number) => BAND.x0 + ((k * 62 + (N - F0) * 2.5) % (BAND.x1 - BAND.x0 - 14));
  const flagWave = 3 * Math.sin((2 * Math.PI * N) / 24);

  return (
    <div style={{position: 'absolute', inset: 0, opacity: op, transform: `translateY(${dy.toFixed(2)}px)`}}>
      {/* 货架主角柔光（含窗口 Pill 区） */}
      <HeroGlow x={SHELF.x0 - 12} y={WIN_PILL.y - 12} w={SHELF.x1 - SHELF.x0 + 24} h={BOARDS[0] - WIN_PILL.y + 80} r={18} N={N} k={0.55 * gk} />

      {/* 发送带 + 刻度（持续右行） + 箭头 */}
      <div style={{...abs(BAND.x0, BAND.y - 1.25, (BAND.x1 - BAND.x0) * shelfP, 2.5), background: WHITE, opacity: 0.9}} />
      {Array.from({length: 7}, (_, k) => (
        <div key={k} style={{...abs(tickX(k), BAND.y + 9, 14, 2.5), background: GREY_MID, opacity: softOp(N - (B_SHELF + 16), 6) * 0.8}} />
      ))}
      <Svg bloom={false}>
        <path d={`M${BAND.x1 - 4},${BAND.y - 9} L${BAND.x1 + 12},${BAND.y} L${BAND.x1 - 4},${BAND.y + 9}`} fill="none" stroke={WHITE} strokeWidth={2.5} opacity={shelfP} />
      </Svg>

      {/* 发送端节点 + 待发信封堆 */}
      <NodeDot cx={NODE.cx} cy={NODE.cy} r={NODE.r} label="fast sender" labelSize={22} opacity={softOp(N - B_SHELF, 8)} glowP={0.25 + 0.15 * Math.sin((2 * Math.PI * N) / 30)} />
      {Array.from({length: 5}, (_, k) => {
        const sn = N - (B_SHELF + 6 + k * 3);
        if (sn < 0) return null;
        return (
          <div key={k} style={{position: 'absolute', inset: 0, opacity: softOp(sn, 6)}}>
            <PacketIcon cx={132 + k * 9} cy={500 - k * 13} w={86} h={58} opacity={0.9 - k * 0.13} />
          </div>
        );
      })}

      {/* 货架：4 层板 + 格底 + 标签 */}
      {BOARDS.map((by, b) => (
        <div key={b}>
          <div style={{...abs(SHELF.x0, by, (SHELF.x1 - SHELF.x0) * clamp01((N - B_SHELF - b * 2) / 12), 3), background: WHITE, opacity: 0.85}} />
          <div style={{...abs(CELL.cx - CELL.w / 2, by - CELL.h, CELL.w, CELL.h), background: 'rgba(255,255,255,0.045)',
            border: `1.5px solid ${GREY_LINE}`, opacity: softOp(N - (B_AD + b * 2), 8) * 0.9}} />
        </div>
      ))}
      <div style={{...abs(895 - 80, 536, 160, 26), opacity: softOp(N - B_AD, 8), textAlign: 'center', fontFamily: FONT_MONO, fontSize: 24, color: GREY}}>the receiver</div>

      {/* window: 4 Pill（值计数 1→4） */}
      <div style={{position: 'absolute', inset: 0, opacity: softOp(N - B_WIN, 8)}}>
        <Pill x={WIN_PILL.x} y={WIN_PILL.y} w={WIN_PILL.w} h={WIN_PILL.h} r={23} stroke={PURPLE_LIGHT} fill="#000" sw={2.5}
          style={{boxShadow: glowPurpleS(0.8 * gk)}}
          text={<span style={{fontFamily: FONT_MONO, fontSize: 26, color: WHITE, whiteSpace: 'nowrap'}}>
            window:&nbsp;<span style={{fontFamily: FONT_ORB, color: PURPLE_LIGHT}}>{winVal}</span></span>} />
      </div>

      {/* 窗口边界虚线（行进）+ Pill 引线 */}
      <Svg bloom={false}>
        <line x1={SHELF.x0} y1={BOUND_Y} x2={SHELF.x1} y2={BOUND_Y} stroke={PURPLE_LIGHT} strokeWidth={2.5}
          strokeDasharray="10 8" strokeDashoffset={-((N - B_WIN) * 1.2)} opacity={softOp(N - (B_WIN + 2), 8) * 0.95 * gk}
          style={{filter: `drop-shadow(0 0 6px rgba(102,45,248,${0.5 * gk}))`}} />
        <line x1={CELL.cx} y1={WIN_PILL.y + WIN_PILL.h} x2={CELL.cx} y2={BOUND_Y - 4} stroke={GREY_MID} strokeWidth={1.5} strokeDasharray="3 5"
          opacity={softOp(N - (B_WIN + 4), 8) * 0.8} />
      </Svg>

      {/* wait 小旗：满格弹出（3794），读走后落下（3812） */}
      {(() => {
        const down = N >= B_READ;
        const s = !down ? 0.4 + 0.6 * clamp01((N - B_FLAG) / 8) : Math.max(0, 1 - (N - B_READ) / 8);
        if (N < B_FLAG || s <= 0.01) return null;
        return (
          <div style={{position: 'absolute', inset: 0, opacity: Math.min(1, s), transform: `scale(${s})`, transformOrigin: '262px 300px'}}>
            <div style={{...abs(262, 264, 3.5, 38), background: WHITE}} />
            <svg width={64} height={30} viewBox="0 0 64 30" style={{...abs(263, 264, 64, 30)}}>
              <path d={`M2 3 L${54 + flagWave * 0.4} 9 L2 16 Z`} fill={ORANGE}
                style={{filter: `drop-shadow(0 0 8px rgba(240,95,65,${0.5 * gk}))`}} />
            </svg>
            <div style={{...abs(288, 246, 80, 26), fontFamily: FONT_MONO, fontSize: 22, fontWeight: 700, color: ORANGE}}>wait</div>
          </div>
        );
      })()}

      {/* 演示信封：飞行 / 入格 / 读走滑出 */}
      {ENVS.map((e) => {
        const n = N - e.f;
        if (n < 0) return null;
        const targetY = BOARDS[e.board] - CELL.h / 2;
        if (e.leave && N >= e.leave) {
          const lp = clamp01((N - e.leave) / 14);
          if (lp >= 1) return null;
          return <PacketIcon key={e.id} cx={CELL.cx + lp * 360} cy={targetY} w={92} h={62} opacity={(1 - lp) * 0.95} />;
        }
        if (n < 20) {
          const p = flightPos(n, targetY);
          return <PacketIcon key={e.id} cx={p.x} cy={p.y} w={92} h={62} />;
        }
        const sq = 1 - 0.12 * (1 - clamp01((n - 21) / 7));
        return (
          <div key={e.id} style={{...abs(CELL.cx - 46, targetY - 31, 92, 62), transform: `scaleY(${sq})`, transformOrigin: '50% 100%'}}>
            <PacketIcon cx={46} cy={31} w={92} h={62} />
          </div>
        );
      })}

      {/* 读走回执：绿 Check（draw-on 12 帧，随后淡出） */}
      {N >= B_READ + 2 ? (
        <Svg>
          <Check cx={948} cy={BOARDS[0] - 100} size={62} p={clamp01((N - (B_READ + 2)) / 12)}
            opacity={clamp01((N - (B_READ + 2)) / 6) * (1 - clamp01((N - (B_READ + 46)) / 10))} />
        </Svg>
      ) : null}
    </div>
  );
};
