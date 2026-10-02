import React from 'react';
import {useCurrentFrame} from 'remotion';
import {GlitchIn, clamp01, powOutRemain, emphasisPulse, textW, FONT_MONO, FONT_ORB, FONT_WIDE} from '../../common';
import {
  CText, Box, Pill, Cross, abs, softOp, exitOp, glowOffK, exitAccel, fadeIn,
  WHITE, GREY, GREY_MID, PURPLE, PURPLE_LIGHT, PURPLE_DEEP, ORANGE, BLOOM,
} from '../../ui';
import {HeroGlow} from '../../fx';

/**
 * SC32 QUIC 翻转 · N 8371–8910（S60 8379 + S61 8439 + S62 8743–8888 ¶，扩展到 SC33.from−1=8910）
 * **章 4 高光时刻·论点型**：居中三层堆叠卡自上而下揭示——顶层 `HTTP/3`（Noto 900 72px + `RFC 9114 · 2022`）
 * 中层 `QUIC`（Audiowide 64px + `RFC 9000 · 2021` + 卡内四枚机制 Pill）底层 `UDP`（Orbitron 56px）；两层间短竖线 draw-on；
 * 右侧大箭头自顶向下 wipe（`rides on`）；左侧旧路径 `HTTP/2`+`TCP` 一对灰小卡 SoftIn 即打红 Cross 变暗。
 * 节拍：8373 `one more twist` 灰字 SoftIn（8379−6 前挂）→ 8432 前退场｜8439 顶层卡 slideUp Δ80 + `HTTP/3`
 *       GlitchIn（本镜唯一 glitch，rgbSplit 6）+ 落位白闪 2 帧｜8508 `RFC 9114 · 2022` 打字机（4 帧/字 → 8576）
 *       ｜8633 中层 QUIC 卡 slideUp + 紫光点亮 + 竖线① draw-on + 8657 卡内四枚机制 Pill 2 帧错峰 SoftIn
 *       ｜8743 `RFC 9000 · 2021` 打字机（2 帧/字 → 8777）
 *       ｜8817 底层 UDP 卡 slideUp + 橙光 + 竖线② + 大箭头 20 帧自顶 wipe + 旧路径红叉（8825–8837）→ 变暗
 *       ｜8834/8838/8842 三层卡自上而下 1.03 微脉冲一轮（4 帧错峰，紧凑收尾保 hold）。
 * 持续（成片 v1 修复 tcpudp-wide-fix-C，全部持续到离场帧）：
 *       ①三层卡各加错峰呼吸 1.0→1.02（30 帧周期，顶/中/底相位错开 10 帧，落位后起）
 *       ②中层 QUIC 卡内四枚机制 Pill（22px 标签）20 帧一轮轮流微亮（5 帧/枚三角渐变 + 紫光）
 *       ③大箭头改流动虚线描边（dash 10/8，dashoffset 每帧 −2px 向 UDP 流动；头部随 wipe 落位）
 *       ④左侧红 Cross 后的 `HTTP/2 · TCP` 暗卡轻微下沉漂浮（±2px、36 帧周期，「被淘汰」）。
 * hold=0f 修复：底层 UDP 卡+箭头前挂 20 帧（8843→8817，分镜表 −6 容差再放宽，主会话授权），微脉冲随之压缩到 8856 前收束
 *       → 满态 8856 → 离场 8902（末 8 帧归零）≥30 ✓。
 * 版式微调：中层卡加宽加高（x335–945 × y316–464）以容纳机制 Pill 行；左侧旧路径两小卡左移到 x125–325 避让。
 * 零扫光（论点型变体：GlitchIn 大字 + 光晕，无 LightSweep/StageLine/GhostText）。
 * 主角：三层堆叠卡组 y176–598（422px）；光 = 顶/中层紫光、底层橙光（HeroGlow 呼吸）。
 */
const F0 = 8371;
const TO = 8910;
const T_TWIST = 8373;   // S60：one more twist（8379 −6 前挂）
const T_TOP = 8439;      // S61 块1：顶层卡
const T_RFC1 = 8508;     // S61 块2：RFC 9114 · 2022 打字机
const T_MID = 8633;      // S61 块3：no longer rides TCP. It rides QUIC.
const T_PILLS = 8657;    // 中层卡机制 Pill（成片 v1 修复新增）
const T_RFC2 = 8743;     // S62 块1：QUIC, standardized in 2021
const T_BOT = 8817;      // S62 块2：built on UDP（原 8843，hold=0f 修复前挂 26 帧）
const T_ARROW = 8817;    // 大箭头 20 帧自顶向下 wipe
const T_OLD = 8818;      // 左侧旧路径两小卡（随底层卡同步前挂）
const T_PULSE = [8834, 8838, 8842]; // 三层微脉冲（自上而下 4 帧错峰；8842+14=8856 收束，保 hold ≥30）
const EXIT = TO - 8;     // 8902

const CARD = {x: 410, w: 460, h: 118};
const TOP = {y: 176};
const MCARD = {x: 335, y: 316, w: 610, h: 148}; // 中层加宽加高（容纳机制 Pill 行）
const BOT = {y: 480};
const CONN = [{y0: 294, y1: 316}, {y0: 464, y1: 480}]; // 两条短竖线
const OLD = [
  {label: 'HTTP/2', y: 320},
  {label: 'TCP', y: 420},
];
const OLD_X = 125, OLD_W = 200; // 左移避让加宽的中层卡
const ARROW = {x: 1010, y0: 240, y1: 535};

const RFC1 = 'RFC 9114 · 2022';
const RFC2 = 'RFC 9000 · 2021';

// 中层卡机制 Pill（22px 标签；SC33 平台四 Pill 的同款词，QUIC「把机制搬进自己」的预告）
const MECH = ['handshake', 'sequence', 'recovery', 'encryption'];
const MPW = MECH.map((m) => Math.round(textW(m, 22)) + 24);
const MGAP = 12;
const MROW_W = MPW.reduce((a, b) => a + b, 0) + MGAP * 3;
const MROW_X0 = 640 - MROW_W / 2;
const PILL_Y = 396, PILL_H = 32;

export const SC32: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const exOp = exitOp(N, TO, 8);
  const exDy = exitAccel(Math.max(0, N - EXIT), 0.2);
  const gk = glowOffK(N, TO);

  // —— one more twist（灰字，8432 前退场）——
  const twistOp = softOp(N - T_TWIST, 8) * (1 - clamp01((N - 8420) / 12));

  // —— 卡入场（slideUp Δ80 + 淡入）——
  const cardIn = (t: number, len = 22) => {
    const n = N - t;
    if (n < 0) return null;
    return {dy: 80 * powOutRemain(n, len, 2.5), op: fadeIn(n, 8)};
  };
  const top = cardIn(T_TOP);
  const mid = cardIn(T_MID);
  const bot = cardIn(T_BOT, 18);

  // —— 顶层白闪（落位后 2 帧）——
  const topFlash = N >= T_TOP + 22 && N < T_TOP + 24;

  // —— RFC 打字机（4 帧/字 与 2 帧/字）+ 光标 ——
  const rf1N = N - T_RFC1;
  const rf1Shown = Math.max(0, Math.min(RFC1.length, Math.floor(rf1N / 4)));
  const rf1Done = rf1Shown >= RFC1.length;
  const rf2N = N - T_RFC2;
  const rf2Shown = Math.max(0, Math.min(RFC2.length, Math.floor(rf2N / 2)));
  const rf2Done = rf2Shown >= RFC2.length;
  const cursor = Math.floor(N / 8) % 2 === 0;

  // —— 竖线 draw-on（20/16 帧）——
  const connP = [clamp01((N - (T_MID + 8)) / 20), clamp01((N - (T_BOT + 3)) / 16)];
  // —— 大箭头 wipe（20 帧）——
  const arrowP = clamp01((N - T_ARROW) / 20);

  // —— 旧路径：SoftIn → 红叉 draw-on（12 帧）→ 变暗 → 轻微下沉漂浮（±2px、36 帧，成片 v1 修复）——
  const oldOp = (i: number) => softOp(N - (T_OLD + 2 * i), 8);
  const crossP = [clamp01((N - (T_OLD + 7)) / 12), clamp01((N - (T_OLD + 10)) / 12)];
  const oldDim = 1 - 0.55 * clamp01((N - (T_OLD + 19)) / 12);
  const oldFloat = N > T_OLD + 41 ? 2 * Math.sin((2 * Math.PI * (N - T_OLD - 41)) / 36) : 0;

  // —— 三层卡 1.03 微脉冲（自上而下 4 帧错峰，紧凑收尾保 hold）——
  const pulse = (t: number) => emphasisPulse(N - t, {peak: 1.03, up: 6, hold: 2, down: 6});
  const pT = pulse(T_PULSE[0]), pM = pulse(T_PULSE[1]), pB = pulse(T_PULSE[2]);

  // —— 三层卡错峰呼吸（成片 v2 收敛幅度）：1.0→1.008、30 帧周期，落位后起、顶/中/底相位错开 10 帧 ——
  const breathe = (n: number) => (n <= 0 ? 1 : 1 + 0.008 * (0.5 - 0.5 * Math.cos((2 * Math.PI * n) / 30)));
  const brT = breathe(N - (T_TOP + 22));
  const brM = breathe(N - (T_MID + 22) - 10);
  const brB = breathe(N - (T_BOT + 18) - 20);

  // —— 机制 Pill 轮流微亮：20 帧一轮（5 帧/枚，相邻三角交叉渐变）——
  const pillPos = (N / 5) % 4;
  const mechLit = (i: number) => {
    const m = (((pillPos - i) % 4) + 4) % 4;
    const d = Math.min(m, 4 - m);
    return clamp01(1 - d);
  };

  return (
    <div style={{position: 'absolute', inset: 0, opacity: exOp, transform: exDy ? `translateY(${exDy.toFixed(1)}px)` : undefined}}>
      {/* ===== one more twist（灰字，过场）===== */}
      {twistOp > 0 ? (
        <CText cx={640} cy={352} size={32} weight={500} family={FONT_MONO} color={GREY} opacity={twistOp}>one more twist</CText>
      ) : null}

      {/* ===== 顶层卡 HTTP/3（紫光）===== */}
      {top ? (
        <>
          <HeroGlow x={CARD.x} y={TOP.y} w={CARD.w} h={CARD.h} r={14} N={N} k={top.op * gk} />
          <div style={{position: 'absolute', inset: 0, opacity: top.op, transform: `translateY(${top.dy.toFixed(1)}px) scale(${(pT * brT).toFixed(4)})`, transformOrigin: '640px 235px',
            filter: topFlash ? 'brightness(1.5)' : undefined}}>
            <Box x={CARD.x} y={TOP.y} w={CARD.w} h={CARD.h} r={14} stroke={WHITE} sw={2.5} fill="rgba(0,0,0,0.82)" />
            <GlitchIn N={N} f0={T_TOP} rgbSplit={6} seed={32}>
              <CText cx={640} cy={228} size={72} weight={900} color={WHITE} letterSpacing={2}
                shadow={`0 0 26px rgba(102,48,248,${(0.5 * gk).toFixed(2)})`}
                style={{WebkitTextStroke: `2.5px ${PURPLE}`, paintOrder: 'stroke fill'}}>HTTP/3</CText>
            </GlitchIn>
            {rf1N >= 0 ? (
              <div style={{...abs(640 - 110, 264, 220, 26), fontFamily: FONT_MONO, fontSize: 22, color: GREY, lineHeight: '26px', whiteSpace: 'pre'}}>
                {RFC1.slice(0, rf1Shown)}{(!rf1Done || N < T_MID) && cursor ? <span style={{color: PURPLE_LIGHT}}>▌</span> : null}
              </div>
            ) : null}
          </div>
        </>
      ) : null}

      {/* ===== 竖线① ===== */}
      {connP[0] > 0 ? (
        <svg width={1280} height={720} viewBox="0 0 1280 720" style={{position: 'absolute', inset: 0, filter: BLOOM}}>
          <line x1={640} y1={CONN[0].y0} x2={640} y2={CONN[0].y1} stroke={WHITE} strokeWidth={2.5}
            pathLength={100} strokeDasharray="100" strokeDashoffset={100 * (1 - connP[0])} />
          <circle cx={640} cy={CONN[0].y1 - 3} r={2.6} fill={WHITE} opacity={connP[0]} />
        </svg>
      ) : null}

      {/* ===== 中层卡 QUIC（紫光；加宽加高 x335–945 × y316–464，含机制 Pill 行）===== */}
      {mid ? (
        <>
          <HeroGlow x={MCARD.x} y={MCARD.y} w={MCARD.w} h={MCARD.h} r={14} N={N} k={mid.op * gk} />
          <div style={{position: 'absolute', inset: 0, opacity: mid.op, transform: `translateY(${mid.dy.toFixed(1)}px) scale(${(pM * brM).toFixed(4)})`, transformOrigin: '640px 390px'}}>
            <Box x={MCARD.x} y={MCARD.y} w={MCARD.w} h={MCARD.h} r={14} stroke={WHITE} sw={2.5} fill="rgba(0,0,0,0.82)" />
            <CText cx={640} cy={356} size={64} weight={400} family={FONT_WIDE} letterSpacing={6} color={WHITE}
              shadow={`5px 5px 0 ${PURPLE_DEEP}, 0 0 30px rgba(102,48,248,${(0.5 * gk).toFixed(2)})`}>QUIC</CText>
            {/* 四枚机制 Pill（成片 v1 修复：20 帧一轮轮流微亮） */}
            {MECH.map((m, i) => {
              const op = softOp(N - (T_PILLS + 2 * i), 8);
              if (op <= 0.01) return null;
              const lit = mechLit(i);
              const px = MROW_X0 + MPW.slice(0, i).reduce((a, b) => a + b, 0) + i * MGAP;
              return (
                <div key={m} style={{position: 'absolute', inset: 0, opacity: op}}>
                  <Pill x={px} y={PILL_Y} w={MPW[i]} h={PILL_H} r={PILL_H / 2} stroke={GREY_MID} sw={2} fill="#000"
                    text={m} fontSize={22} weight={600} family={FONT_MONO} color={GREY} letterSpacing={0}
                    style={{opacity: 1 - 0.8 * lit}} />
                  {lit > 0.01 ? (
                    <Pill x={px} y={PILL_Y} w={MPW[i]} h={PILL_H} r={PILL_H / 2} stroke={PURPLE_LIGHT} sw={2.5} fill="#000"
                      text={m} fontSize={22} weight={600} family={FONT_MONO} color={WHITE} letterSpacing={0}
                      style={{opacity: lit, boxShadow: `0 0 ${(4 + 12 * lit).toFixed(0)}px ${(2 * lit).toFixed(0)}px rgba(102,48,248,${(0.5 * lit * gk).toFixed(2)})`}} />
                  ) : null}
                </div>
              );
            })}
            {rf2N >= 0 ? (
              <div style={{...abs(640 - 110, 432, 220, 26), fontFamily: FONT_MONO, fontSize: 22, color: GREY, lineHeight: '26px', whiteSpace: 'pre'}}>
                {RFC2.slice(0, rf2Shown)}{!rf2Done && cursor ? <span style={{color: PURPLE_LIGHT}}>▌</span> : null}
              </div>
            ) : null}
          </div>
        </>
      ) : null}

      {/* ===== 竖线② ===== */}
      {connP[1] > 0 ? (
        <svg width={1280} height={720} viewBox="0 0 1280 720" style={{position: 'absolute', inset: 0, filter: BLOOM}}>
          <line x1={640} y1={CONN[1].y0} x2={640} y2={CONN[1].y1} stroke={WHITE} strokeWidth={2.5}
            pathLength={100} strokeDasharray="100" strokeDashoffset={100 * (1 - connP[1])} />
          <circle cx={640} cy={CONN[1].y1 - 3} r={2.6} fill={WHITE} opacity={connP[1]} />
        </svg>
      ) : null}

      {/* ===== 底层卡 UDP（橙光）===== */}
      {bot ? (
        <>
          <HeroGlow x={CARD.x} y={BOT.y} w={CARD.w} h={CARD.h} r={14} N={N} k={bot.op * gk} color={ORANGE} />
          <div style={{position: 'absolute', inset: 0, opacity: bot.op, transform: `translateY(${bot.dy.toFixed(1)}px) scale(${(pB * brB).toFixed(4)})`, transformOrigin: '640px 539px'}}>
            <Box x={CARD.x} y={BOT.y} w={CARD.w} h={CARD.h} r={14} stroke={WHITE} sw={2.5} fill="rgba(0,0,0,0.82)" />
            <CText cx={640} cy={539} size={56} weight={700} family={FONT_ORB} letterSpacing={6} color={WHITE}
              shadow={`5px 5px 0 rgba(179,74,46,.9), 0 0 30px rgba(240,95,65,${(0.5 * gk).toFixed(2)})`}>UDP</CText>
          </div>
        </>
      ) : null}

      {/* ===== 右侧大箭头（rides on；成片 v1 修复：流动虚线描边，dashoffset 每帧 −2px 向 UDP）===== */}
      {arrowP > 0 ? (
        <>
          <svg width={1280} height={720} viewBox="0 0 1280 720" style={{position: 'absolute', inset: 0, filter: BLOOM}}>
            <defs>
              <clipPath id="sc32ArrowClip">
                <rect x={ARROW.x - 16} y={ARROW.y0 - 4} width={32} height={((ARROW.y1 - ARROW.y0 + 4) * arrowP).toFixed(1)} />
              </clipPath>
            </defs>
            <g clipPath="url(#sc32ArrowClip)">
              <line x1={ARROW.x} y1={ARROW.y0} x2={ARROW.x} y2={ARROW.y1 - 33} stroke={WHITE} strokeWidth={6}
                strokeDasharray="10 8" strokeDashoffset={-1 * Math.max(0, N - T_ARROW)} />
            </g>
            <polygon points={`${ARROW.x},${ARROW.y1} ${ARROW.x - 20},${ARROW.y1 - 34} ${ARROW.x + 20},${ARROW.y1 - 34}`}
              fill={WHITE} opacity={clamp01((arrowP - 0.78) / 0.22)} />
          </svg>
          <div style={{position: 'absolute', inset: 0, opacity: softOp(N - (T_ARROW + 18), 8)}}>
            <CText cx={ARROW.x} cy={206} size={22} weight={500} family={FONT_MONO} color={GREY}>rides on</CText>
          </div>
        </>
      ) : null}

      {/* ===== 左侧旧路径（HTTP/2 · TCP，灰小卡 + 红叉 → 变暗 → 下沉漂浮 ±2px/36 帧）===== */}
      <div style={{position: 'absolute', inset: 0, transform: oldFloat ? `translateY(${oldFloat.toFixed(2)}px)` : undefined}}>
        {OLD.map((c, i) => {
          const op = oldOp(i);
          if (op <= 0.01) return null;
          return (
            <div key={c.label} style={{position: 'absolute', inset: 0, opacity: op * oldDim}}>
              <Box x={OLD_X} y={c.y} w={OLD_W} h={66} r={10} stroke={GREY_MID} sw={2} fill="rgba(0,0,0,0.7)" />
              <CText cx={OLD_X + OLD_W / 2} cy={c.y + 33} size={30} weight={400} family={FONT_WIDE} letterSpacing={2} color={GREY}>{c.label}</CText>
            </div>
          );
        })}
        {/* 旧路径小连接线（成对） */}
        <svg width={1280} height={720} viewBox="0 0 1280 720" style={{position: 'absolute', inset: 0, opacity: softOp(N - (T_OLD + 2), 8) * oldDim}}>
          <line x1={OLD_X + OLD_W / 2} y1={386} x2={OLD_X + OLD_W / 2} y2={420} stroke={GREY_MID} strokeWidth={2} />
        </svg>
        {/* 红叉（draw-on 12 帧 ×2） */}
        <svg width={1280} height={720} viewBox="0 0 1280 720" style={{position: 'absolute', inset: 0}}>
          <Cross cx={OLD_X + OLD_W / 2} cy={353} size={56} p={crossP[0]} sw={7} />
          <Cross cx={OLD_X + OLD_W / 2} cy={453} size={56} p={crossP[1]} sw={7} />
        </svg>
      </div>
    </div>
  );
};
