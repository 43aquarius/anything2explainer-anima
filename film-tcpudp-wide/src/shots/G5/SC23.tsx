import React from 'react';
import {useCurrentFrame} from 'remotion';
import {clamp01, easeOutCubic, powIn, emphasisPulse, FONT_MONO} from '../../common';
import {
  Box, CText, MonoText, PostcardIcon, abs, softOp, firstOp, exitOp, glowOffK, exitAccel, SoftIn, EXAMPLE,
  WHITE, GREY, GREY_MID, GREY_LIGHT, ORANGE, BLOOM_SOFT,
} from '../../ui';
import {CameraRig, HeroGlow} from '../../fx';

/**
 * SC23 整个仪式就这些 · N 5391–5531（S38 5399–5529：写好+地址 / 投进邮筒 / 仪式到此为止；段内，S39 同段）
 * 三格连环画横排（各 300×260，y300，x 180/490/800）：① 笔在明信片上划两道线（draw-on 8 帧/条）；
 * ② 地址行打字机（`to: 203.0.113.10`）；③ 明信片 kf 14 帧 easeIn 落入邮筒（筒口白闪 2 帧 + 小旗弹起）。
 * 卡间手绘箭头 draw-on；第三卡下灰字 `that's the whole ceremony`。
 * 节拍：5399 ①② ｜ 5450 ③ 落筒 ｜ 5491 三卡 1.02 微脉冲 + 灰字 SoftIn + 邮筒小旗弹起（→ 持续 ±6° 微摆）。
 * 运镜：5455–5488 整组 33 帧 1→1.12 推向第三卡（目标自第三卡中心 (950,430) 调到 (735,425)：
 *   三联卡横跨 x180–1100，中心对准第三卡会把卡①推出画 222px，右移量收敛后卡① 仍在画内、卡③ 占右半屏，见 BUILD_NOTES；
 *   结束 5488 ≤ 离场起点 5523 − 30）。
 * 零 glitch、零扫光。主角：三格连环画组（③ 邮筒为主，HeroGlow 白微光）。
 * 邮筒为卡内自绘小图（小旗需弹起+微摆参数，共用 MailboxIcon 的旗是静态 flagUp，见 BUILD_NOTES）。
 * 离场：末 8 帧归零（5523–5531）。停留：段内不判（S38 后 S39 同段）。
 */
const F0 = 5391;
const TO = 5531;
const T_CARD = 5391;    // 三卡 2 帧错峰 slideIn（5391/5393/5395）
const T_ARROW = 5397;   // 两支手绘箭头 draw-on（10 帧）
const T_PEN1 = 5399;    // ① 笔划第 1 条线（8 帧）
const T_PEN2 = 5409;    // ① 第 2 条线（8 帧）
const T_ADDR = 5415;    // ② 地址打字机（2 帧/字 × 16 → 5447）
const T_DROP = 5450;    // ③ 明信片落筒（14 帧 easeIn）
const T_FLASH = 5464;   // 筒口白闪（2 帧）
const T_PUSH = 5455;    // 运镜 33 帧 1→1.12 推向第三卡
const T_BEAT3 = 5465;   // 三卡脉冲 + 灰字 + 小旗弹起（成片 v5 再前挂 10 帧；灰字落 5473 ≈ S38.c3 −4 节拍容差内）
const EXIT = TO - 8;    // 5523

const CARDS = [
  {x: 180, y: 300, w: 300, h: 260, t: 5391},
  {x: 490, y: 300, w: 300, h: 260, t: 5393},
  {x: 800, y: 300, w: 300, h: 260, t: 5395},
];
const MINI = {w: 220, h: 140};                       // 卡①②内迷你明信片
const miniAt = (i: number) => ({x: CARDS[i].x + 40, y: 372});
const LINE_Y = [412, 448];                            // ① 两条手写线（绝对坐标）
// 邮筒（卡③内，自绘）：半圆顶柱形 + 投递口 + 可动侧旗
const MB = {x0: 896, x1: 1004, bodyY: 448, bodyBot: 516, slotY: 458, cx: 950, flagPivot: [950, 466]};

/** 手写波浪线（x0 起，宽 w，4 段） */
const scribD = (x0: number, y: number, w: number) => `M ${x0} ${y} q ${w / 8} -4 ${w / 4} 0 t ${w / 4} 0 t ${w / 4} 0 t ${w / 4} 0`;

export const SC23: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const op = exitOp(N, TO, 5); // 成片 v5：5 帧离场
  const exDy = exitAccel(Math.max(0, N - EXIT), 0.35);
  const gk = glowOffK(N, TO);

  // 三卡同时 1.02 微脉冲（5491，山丘 18 帧）
  const pulse = emphasisPulse(N - T_BEAT3, {peak: 1.02, up: 8, hold: 2, down: 8});

  // ① 笔线进度与笔位置
  const penP1 = clamp01((N - T_PEN1) / 8);
  const penP2 = clamp01((N - T_PEN2) / 8);
  const penOn1 = N >= T_PEN1 && N < T_PEN1 + 8;
  const penOn2 = N >= T_PEN2 && N < T_PEN2 + 8;
  const m0 = miniAt(0);
  const tipX = m0.x + 20 + 95 * (penOn2 ? penP2 : penP1);
  const tipY = penOn2 ? LINE_Y[1] : LINE_Y[0];
  const penAng = penOn2 ? -5 : 4;

  // ② 地址打字机 + 光标
  const addrShown = Math.max(0, Math.min(EXAMPLE.to.length, Math.floor((N - T_ADDR) / 2)));
  const addrDone = N >= T_ADDR + EXAMPLE.to.length * 2;
  const cursorOn = N >= T_ADDR - 2 && N < T_BEAT3 && Math.floor(N / 8) % 2 === 0;

  // ③ 落筒：y 345→440 + 缩到 0.45（14 帧 powIn 2）→ 沉入筒口
  const dn = N - T_DROP;
  const dropT = clamp01(dn / 14);
  const dropY = 345 + 95 * powIn(2)(dropT);
  const dropS = 1 - 0.55 * powIn(2)(dropT);
  const dropOp = dn < 0 ? 0 : dropT >= 1 ? Math.max(0, 1 - (dn - 14) / 4) : 1;
  const flash = N >= T_FLASH && N < T_FLASH + 2;

  // 邮筒小旗：-80°（垂下）→ 弹起过冲 +10° → 回 0° + ±6° 微摆（50 帧周期，持续动作）
  const fn = N - T_BEAT3;
  const flagAngle = fn < 0 ? -80
    : fn < 10 ? -80 + 90 * easeOutCubic(clamp01(fn / 10))
    : Math.max(-8, 10 - 10 * clamp01((fn - 10) / 6)) + (N < TO - 8 - 46 ? 6 * Math.sin((N / 50) * 2 * Math.PI) : 6 * Math.sin(((TO - 8 - 46) / 50) * 2 * Math.PI)); // 成片 v5：末 46 帧旗摆停（hold）
  const flagLit = flagAngle > -40;

  // 箭头 draw-on
  const arrowP = clamp01((N - T_ARROW) / 10);

  return (
    <CameraRig N={N} keys={[{f: F0, x: 640, y: 360, s: 1}, {f: T_PUSH, x: 640, y: 360, s: 1}, {f: T_PUSH + 33, x: 735, y: 425, s: 1.12}]}>
      <div style={{position: 'absolute', inset: 0, opacity: op, transform: exDy ? `translateY(${exDy.toFixed(1)}px)` : undefined}}>
        {/* 三张卡（③ 主角白微光；5491 同时微脉冲） */}
        {CARDS.map((c, i) => {
          const cn = N - c.t;
          if (cn < 0) return null;
          const cy = 46 * Math.pow(1 - clamp01(cn / 20), 2.5);
          const isMain = i === 2;
          return (
            <div key={i} style={{position: 'absolute', inset: 0, opacity: firstOp(cn, 6), transform: `translateY(${cy.toFixed(1)}px) scale(${(isMain ? pulse : 1).toFixed(4)})`, transformOrigin: `${c.x + c.w / 2}px ${c.y + c.h / 2}px`}}>
              {isMain ? <HeroGlow x={c.x} y={c.y} w={c.w} h={c.h} r={10} N={N} k={softOp(cn, 10) * gk} color="FFFFFF" /> : null}
              <Box x={c.x} y={c.y} w={c.w} h={c.h} r={10} sw={2.5} />
            </div>
          );
        })}

        {/* ① 迷你明信片 + 笔划两条线 */}
        {(() => {
          const m = miniAt(0);
          const cn = N - CARDS[0].t;
          if (cn < 6) return null;
          return (
            <div style={{position: 'absolute', inset: 0, opacity: softOp(cn - 6, 8)}}>
              <svg width={MINI.w} height={MINI.h} viewBox={`0 0 ${MINI.w} ${MINI.h}`} style={{...abs(m.x, m.y), overflow: 'visible', filter: BLOOM_SOFT}}>
                <rect x={1.25} y={1.25} width={MINI.w - 2.5} height={MINI.h - 2.5} fill="#000" stroke={WHITE} strokeWidth={2.5} />
                <line x1={MINI.w * 0.58} y1={8} x2={MINI.w * 0.58} y2={MINI.h - 8} stroke={GREY_MID} strokeWidth={1.5} strokeDasharray="5 5" />
              </svg>
              {/* 两条手写线（draw-on 8 帧/条，绝对坐标） */}
              <svg width={1280} height={720} viewBox="0 0 1280 720" style={{position: 'absolute', inset: 0}}>
                {LINE_Y.map((ly, k) => {
                  const p = k === 0 ? penP1 : penP2;
                  if (p <= 0) return null;
                  return <path key={ly} d={scribD(m.x + 20, ly, 95)} fill="none" stroke={GREY_LIGHT} strokeWidth={2.5}
                    pathLength={100} strokeDasharray="100" strokeDashoffset={100 * (1 - p)} />;
                })}
              </svg>
              {/* 笔（跟随当前线端点） */}
              {(penOn1 || penOn2) ? (
                <div style={{...abs(tipX - 8, tipY - 30, 62, 12), transform: `rotate(${penAng}deg)`, transformOrigin: '8px 10px', opacity: 0.95}}>
                  <div style={{width: 52, height: 7, background: GREY_LIGHT, borderRadius: 3, filter: BLOOM_SOFT}} />
                  <div style={{position: 'absolute', left: -6, top: 2, width: 0, height: 0, borderTop: '3px solid transparent', borderBottom: '3px solid transparent', borderRight: '8px solid #FFF'}} />
                </div>
              ) : null}
            </div>
          );
        })()}

        {/* ② 迷你明信片 + 地址打字机 */}
        {(() => {
          const m = miniAt(1);
          const cn = N - CARDS[1].t;
          if (cn < 6) return null;
          return (
            <div style={{position: 'absolute', inset: 0, opacity: softOp(cn - 6, 8)}}>
              <svg width={MINI.w} height={MINI.h} viewBox={`0 0 ${MINI.w} ${MINI.h}`} style={{...abs(m.x, m.y), overflow: 'visible', filter: BLOOM_SOFT}}>
                <rect x={1.25} y={1.25} width={MINI.w - 2.5} height={MINI.h - 2.5} fill="#000" stroke={WHITE} strokeWidth={2.5} />
                <line x1={MINI.w * 0.58} y1={8} x2={MINI.w * 0.58} y2={MINI.h - 8} stroke={GREY_MID} strokeWidth={1.5} strokeDasharray="5 5" />
                <rect x={MINI.w - 36} y={10} width={24} height={20} fill="#000" stroke={WHITE} strokeWidth={1.5} />
                <path d={`M ${MINI.w - 32} 20 q 4 -4 8 0 t 8 0`} fill="none" stroke={GREY} strokeWidth={1.4} />
              </svg>
              {/* 地址行（打字机 + 光标） */}
              {N >= T_ADDR - 2 ? (
                <MonoText x={m.x + 16} y={m.y + 90} size={22} color={WHITE}>
                  {EXAMPLE.to.slice(0, addrShown)}
                  {(!addrDone || N < T_BEAT3) && cursorOn ? <span style={{color: GREY_LIGHT}}>▌</span> : null}
                </MonoText>
              ) : null}
              {/* 地址下划线（随打字生长） */}
              <div style={{...abs(m.x + 14, m.y + 122, 176 * clamp01((N - T_ADDR + 4) / 20), 2), background: GREY_MID, opacity: 0.7}} />
            </div>
          );
        })()}

        {/* ③ 邮筒（自绘）+ 落下的明信片 */}
        {(() => {
          const cn = N - CARDS[2].t;
          if (cn < 6) return null;
          return (
            <div style={{position: 'absolute', inset: 0, opacity: softOp(cn - 6, 8)}}>
              <svg width={1280} height={720} viewBox="0 0 1280 720" style={{position: 'absolute', inset: 0, overflow: 'visible', filter: BLOOM_SOFT}}>
                <path d={`M ${MB.x0} ${MB.bodyY} a 54 54 0 0 1 ${MB.x1 - MB.x0} 0 Z`} fill="#000" stroke={WHITE} strokeWidth={2.5} />
                <rect x={MB.x0} y={MB.bodyY} width={MB.x1 - MB.x0} height={MB.bodyBot - MB.bodyY} fill="#000" stroke={WHITE} strokeWidth={2.5} />
                <rect x={923} y={MB.slotY} width={54} height={7} fill="#000" stroke={WHITE} strokeWidth={2} />
                <line x1={MB.cx} y1={MB.bodyBot} x2={MB.cx} y2={556} stroke={WHITE} strokeWidth={3} />
                {flash ? <rect x={921} y={MB.slotY - 2} width={58} height={11} fill="#FFF" opacity={0.85} /> : null}
                {/* 侧旗：弹起 + 微摆 */}
                <g transform={`rotate(${flagAngle.toFixed(2)} ${MB.flagPivot[0]} ${MB.flagPivot[1]})`}>
                  <line x1={MB.flagPivot[0]} y1={MB.flagPivot[1]} x2={1010} y2={MB.flagPivot[1]} stroke={flagLit ? ORANGE : GREY_MID} strokeWidth={3} />
                  <rect x={1006} y={446} width={13} height={17} fill={flagLit ? ORANGE : 'none'} stroke={ORANGE} strokeWidth={2} />
                </g>
              </svg>
              {dropOp > 0.01 ? (
                <PostcardIcon cx={950} cy={dropY} w={96} h={64} scale={dropS} opacity={dropOp} />
              ) : null}
            </div>
          );
        })()}

        {/* 卡间手绘箭头 */}
        <svg width={1280} height={720} viewBox="0 0 1280 720" style={{position: 'absolute', inset: 0}}>
          {[486, 796].map((ax) => (
            <path key={ax} d={`M ${ax - 10} 428 q 10 -16 20 0 q 10 16 20 0`} fill="none" stroke={GREY} strokeWidth={2.5}
              pathLength={100} strokeDasharray="100" strokeDashoffset={100 * (1 - arrowP)} opacity={0.85} />
          ))}
        </svg>

        {/* 第三卡下灰字 */}
        <SoftIn N={N} f0={T_BEAT3}>
          <CText cx={950} cy={594} size={24} weight={500} color={GREY}>that's the whole ceremony</CText>
        </SoftIn>
      </div>
    </CameraRig>
  );
};
