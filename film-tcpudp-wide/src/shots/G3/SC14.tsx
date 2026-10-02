import React from 'react';
import {useCurrentFrame} from 'remotion';
import {clamp01, FONT_ORB, FONT_MONO} from '../../common';
import {CText, PacketIcon, SeqStamp, MailboxIcon, Svg, abs, fadeIn, exitOp, WHITE, GREY_MID, GREEN, BLOOM_SOFT} from '../../ui';

/**
 * SC14 编号与回执（3005–3165，S24–S25 ¶）
 * 节拍：3013 信使的规矩 / 3064 每个信封编号 / 3120 每个编号回执。
 * 版式：发送带（x 200–1080，双轨 y 296/364，wipe 18 帧）6 枚信封 convoy 2.2px/帧持续右行（wrap 回左侧重发）；
 *       每枚信封右上角橙色编号章 #1..#6 stampIn（1.4→1 + 落章闪，3064 起 2 帧错峰，wrap 时重盖），最新章带橙光；
 *       3120 虚线回流轨道（右端连接带尾 → 左端信箱）+ 绿色回执卡 ACK 1..4 预置回流（11px/帧）
 *       → 到达信箱旁叠成沓 + `+1` 上浮 + 信箱小旗竖起；右端每 26 帧续生成保持回流流（持续动作到离场）。
 * 主角：发送带+回执照（~260px 高）。光：最新编号章橙光；回执绿描边。零 glitch。末 8 帧归零（3157–3165）。
 */
const F0 = 3005;
const T_BELT = 3013, T_STAMP = 3064, T_ACK = 3120, T_EXIT = 3165;
const BELT = {x0: 200, x1: 1080, y: 330, railT: 296, railB: 364};
const ENV_W = 70, ENV_H = 48, GAPX = 131, WRAP = GAPX * 6, SPEED = 2.2;
const TRACK_Y = 480, PILE_X = 420, RSPD = 11;

export const SC14: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const ex = exitOp(N, T_EXIT, 8);
  const beltP = clamp01((N - T_BELT) / 18); // 带 wipe

  // 信封槽位：位置、wrap 周期数、本周期 stamp 时刻（成片 v5：末 46 帧整带冻结——hold 稳定期）
  const t0 = Math.max(0, Math.min(N, T_EXIT - 46) - T_BELT);
  const slots = Array.from({length: 6}, (_, i) => {
    const off = i * GAPX + t0 * SPEED;
    const cyc = Math.floor(off / WRAP);
    const raw = off % WRAP;
    const stampT = cyc === 0 ? T_STAMP + i * 2 : T_BELT + (WRAP - i * GAPX) / SPEED + (cyc - 1) * (WRAP / SPEED);
    return {i, raw, cyc, stampT};
  });
  const newest = slots.filter((s) => N >= s.stampT).reduce((m, s) => (m === undefined || s.stampT > m ? s.stampT : m), undefined as number | undefined);

  // 回执卡：预置 4 张（3120 起 2 帧错峰回流）+ 右端每 26 帧续生成（保持流，在途即可）
  type Ack = {id: number; x0: number; t0: number; label: string; arrive: number};
  const acks: Ack[] = [];
  for (let k = 0; k < 4; k++) acks.push({id: 100 + k, x0: 560 + k * 120, t0: T_ACK + k * 2, label: `ACK ${k + 1}`, arrive: T_ACK + k * 2 + (560 + k * 120 - PILE_X) / RSPD});
  for (let s = 0; ; s++) {
    const sp = 3132 + s * 26;
    if (sp > T_EXIT - 44) break; // 成片 v3：末 44 帧不再生成新回执（hold 稳定期）
    acks.push({id: 200 + s, x0: 1020, t0: sp, label: `ACK ${(4 + s) % 6 + 1}`, arrive: sp + (1020 - PILE_X) / RSPD});
  }
  const Ns14 = Math.min(N, T_EXIT - 46); // 成片 v4：入沓计数也冻结（末段不加新卡）
  const arrivedN = acks.filter((a) => Ns14 >= a.arrive).length; // 已入沓数量
  const floatUps = acks.filter((a) => Ns14 >= a.arrive && Ns14 - a.arrive < 14).map((a) => a.arrive);

  return (
    <div style={{position: 'absolute', inset: 0}}>
      {/* 发送带双轨 + 回流轨道（右端连接带尾） */}
      <Svg>
        <line x1={BELT.x0} y1={BELT.railT} x2={BELT.x0 + (BELT.x1 - BELT.x0) * beltP} y2={BELT.railT} stroke={WHITE} strokeWidth={2.5} opacity={0.9 * ex} style={{filter: 'drop-shadow(0 0 3px rgba(255,255,255,.4))'}} />
        <line x1={BELT.x0} y1={BELT.railB} x2={BELT.x0 + (BELT.x1 - BELT.x0) * beltP} y2={BELT.railB} stroke={WHITE} strokeWidth={2.5} opacity={0.9 * ex} style={{filter: 'drop-shadow(0 0 3px rgba(255,255,255,.4))'}} />
        {N >= T_ACK ? (() => {
          const p = clamp01((N - T_ACK) / 14);
          const d = `M ${BELT.x1 - 8} ${BELT.railB} Q 1152 424 1060 ${TRACK_Y - 8}`;
          return <path d={d} fill="none" stroke={GREY_MID} strokeWidth={2} strokeDasharray="9 9" pathLength={100} strokeDashoffset={100 * (1 - p)} opacity={0.75 * ex} />;
        })() : null}
        {N >= T_ACK ? (() => {
          const p = clamp01((N - T_ACK - 4) / 16);
          return <line x1={1060} y1={TRACK_Y} x2={1060 - (1060 - 380) * p} y2={TRACK_Y} stroke={GREY_MID} strokeWidth={2} strokeDasharray="9 9" opacity={0.75 * ex} />;
        })() : null}
      </Svg>

      {/* 信封 convoy（入场：随带 wipe 错峰滑入；编号章 stampIn；wrap 重盖） */}
      {slots.map((s) => {
        const kIn = clamp01((N - T_BELT - s.i * 2) / 22);
        const xFlow = BELT.x0 + 14 + s.raw;
        const x = xFlow - 90 * Math.pow(1 - kIn, 2.5); // 入场 90px 滑入
        const inOp = fadeIn(N - T_BELT - s.i * 2, 6);
        if (inOp <= 0) return null;
        const sn = N - s.stampT;
        const stampS = sn < 0 ? 0 : 1.4 - 0.4 * clamp01(sn / 8);
        const stampOp = sn < 0 ? 0 : clamp01((sn + 2) / 4);
        const flash = sn >= 0 && sn < 2;
        const isHot = newest !== undefined && s.stampT === newest && sn >= 0 && sn < 45; // 唯一橙光章
        return (
          <div key={s.i} style={{...abs(0, 0, 1280, 720), opacity: ex * inOp}}>
            <PacketIcon cx={x + ENV_W / 2} cy={BELT.y} w={ENV_W} h={ENV_H} />
            {sn >= 0 ? (
              <SeqStamp cx={x + ENV_W - 6} cy={BELT.y - ENV_H / 2 - 6} label={`#${s.i + 1}`} size={58} scale={stampS} glow={isHot || flash} opacity={stampOp} />
            ) : null}
          </div>
        );
      })}

      {/* 回执卡（预置 + 续生成，11px/帧回流） */}
      {N >= T_ACK
        ? acks.map((a) => {
            const an = Math.min(N, T_EXIT - 44) - a.t0; // 成片 v3：末 44 帧冻结在途回执位置（hold 稳定期）
            if (an < 0) return null;
            const x = a.x0 - RSPD * an;
            if (x <= PILE_X) return null; // 已入沓
            return (
              <div key={a.id} style={{...abs(x - 45, TRACK_Y - 23, 90, 46), opacity: ex * clamp01((an + 2) / 6)}}>
                <div style={{position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.9)', border: `2.5px solid ${GREEN}`, borderRadius: 6, filter: BLOOM_SOFT}} />
                <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FONT_MONO, fontSize: 22, fontWeight: 700, color: GREEN, letterSpacing: 1}}>{a.label}</div>
              </div>
            );
          })
        : null}

      {/* 信箱（回执终点；首张到达竖旗）+ 叠沓 + `+1` 上浮 */}
      {N >= T_ACK ? (
        <div style={{opacity: ex * clamp01((N - T_ACK + 2) / 8)}}>
          <MailboxIcon cx={300} cy={TRACK_Y} w={118} h={98} flagUp={arrivedN > 0} />
          {acks.filter((a) => a.t0 < T_ACK + 10).slice(0, Math.min(arrivedN, 4)).map((a, j) => (
            <div key={a.id} style={{...abs(PILE_X - 32 + j * 5, TRACK_Y - 17 - j * 4, 64, 34), background: 'rgba(0,0,0,0.92)', border: `2px solid ${GREEN}`, borderRadius: 5, opacity: ex * fadeIn(N - a.arrive, 6), filter: BLOOM_SOFT}} />
          ))}
          {floatUps.map((at, j) => (
            <CText key={`f${j}`} cx={PILE_X + 46} cy={TRACK_Y - 42 - (N - at) * 1.7} size={26} weight={700} family={FONT_ORB} color={GREEN} opacity={ex * Math.max(0, 1 - (N - at) / 14)}>+1</CText>
          ))}
        </div>
      ) : null}
    </div>
  );
};
