import React from 'react';
import {useCurrentFrame} from 'remotion';
import {clamp01, easeOutCubic, powOutRemain, FONT_MONO, FONT_WIDE} from '../../common';
import {
  CText, Pill, Box, abs, softOp, firstOp, exitOp, glowOffK, exitAccel,
  WHITE, GREY, GREY_MID, GREY_LIGHT, PURPLE_LIGHT, ORANGE,
} from '../../ui';
import {HeroGlow} from '../../fx';

/**
 * SC33 线上重建一切 · N 8911–9180（S63 8919–9178，段内镜头：S63 后 S64 同段，不停顿）
 * 节拍：8919/8921 `handshake`/`sequence` stampIn｜8980/8982 `recovery`/`encryption` stampIn（对齐前两拍）
 *       ｜9036 下方地基 wipe + 旧 `TCP` 砖 SoftIn（灰、无光）+ `kernel · frozen`｜9048 `UDP` 橙砖 SoftIn
 *       ｜9091 平台板 slideDown 入位（Δ60，16 帧）+ 四 Pill kf 14 帧弧线飞升落到平台上 + 平台白光点亮
 *       ｜9121 两条虚线支柱 draw-on（平台 → UDP 砖）｜9135 `evolve` 灰 Pill SoftIn（9141 −6 前挂）
 *       ｜9141 起 平台 36 帧上下浮动 2px + Pill 轮流微亮（「可迭代」生命感）；地基砖完全静止（对比）。
 * 版式：双平面图——下方灰色「内核地基」横带（y500–560，`kernel · frozen` + 旧 TCP 砖 + 右端 UDP 橙砖）；
 *       上方悬浮「应用层平台」白边板（x210–1070, y330–390, `apps · one update away`），四枚机制 Pill 立于板上，
 *       两条虚线支柱（x900/x1000）连接平台与 UDP 砖（QUIC 建在 UDP 上的视觉）。
 * 停留：段内不判（末拍 evolve 9143 → 离场 9172，≈29 帧；S64 同段续讲，见 BUILD_NOTES）。末 8 帧归零。
 * 零 glitch；零扫光；无运镜（Ch4 运镜预算在 SC34/SC36）。
 * 主角：应用层平台组 y282–390 + 支柱到 508；光 = 平台紫 HeroGlow 呼吸 + Pill 轮流紫微亮；地基灰无光。
 */
const F0 = 8911;
const TO = 9180;
const T_P = [8919, 8921, 8980, 8982]; // 四枚机制 Pill stampIn
const T_GROUND = 9036; // 地基 wipe
const T_BRICK_T = 9044; // 旧 TCP 砖
const T_BRICK_U = 9048; // UDP 橙砖
const T_PLAT = 9091;    // 平台板 slideDown（16 帧）+ Pill 飞升（9095+4i，14 帧/枚）
const T_PILLAR = 9121;  // 虚线支柱 draw-on（16 帧）
const T_EVOLVE = 9135;  // evolve 灰 Pill（9141 −6）
const T_FLOAT = 9141;   // 平台浮动 + Pill 轮流微亮起
const EXIT = TO - 8;    // 9172

const MECH = ['handshake', 'sequence', 'recovery', 'encryption'];
const PW = 190, PH = 48, PGAP = 20;
const PILL_CX = [325, 535, 745, 955];
const PILL_Y0 = 452; // 初始行（地基上方悬浮）
const PILL_Y1 = 306; // 平台上落位（slab 顶 330 上贴）

const SLAB = {x: 210, y: 330, w: 860, h: 60};
const GROUND = {x: 240, y: 500, w: 800, h: 60};
const BRICK_T = {cx: 350, y: 512, w: 150, h: 44};
const BRICK_U = {cx: 950, y: 512, w: 150, h: 44};
const PILLARS = [900, 1000];

export const SC33: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const exOp = exitOp(N, TO, 8);
  const exDy = exitAccel(Math.max(0, N - EXIT), 0.18);
  const gk = glowOffK(N, TO);

  // —— 地基 wipe（自左 18 帧）——
  const groundP = clamp01((N - T_GROUND) / 18);

  // —— 平台 slideDown（Δ60，16 帧）——
  const platN = N - T_PLAT;
  const platDy = platN < 0 ? null : -60 * powOutRemain(platN, 16, 2.5);
  const platOp = platN < 0 ? 0 : firstOp(platN, 8);
  const platFlash = platN >= 16 && platN < 19;

  // —— 平台浮动（36 帧 ±2px，9141 起）——
  const floatDy = N >= T_FLOAT ? 2 * Math.sin((2 * Math.PI * (N - T_FLOAT)) / 36) : 0;
  const platOff = (platDy ?? 0) + floatDy; // 世界坐标偏移（Pill 落位追踪）

  // —— Pill：stampIn（初始行）→ kf 14 帧弧线飞升（追踪平台位移，落位后随平台浮动）——
  const pillState = (i: number) => {
    const sn = N - T_P[i];
    if (sn < 0) return null;
    const scale = 1.4 - 0.4 * clamp01(sn / 10);
    const flyN = N - (T_PLAT + 4 + 4 * i);
    if (flyN < 0) return {cy: PILL_Y0, dx: 0, scale, op: softOp(sn, 8)};
    const t = clamp01(flyN / 14);
    const p = easeOutCubic(t);
    const cy = PILL_Y0 + (PILL_Y1 + platOff - PILL_Y0) * p;
    const dx = 22 * Math.sin(Math.PI * t) * (i % 2 === 0 ? 1 : -1);
    return {cy, dx, scale, op: softOp(sn, 8)};
  };

  // —— 支柱 draw-on（16 帧）——
  const pillarP = clamp01((N - T_PILLAR) / 16);
  // —— Pill 轮流微亮（112 帧周期错峰，9141 起）——
  const pillGlow = (i: number) => (N < T_FLOAT ? 0 : Math.max(0, Math.sin((2 * Math.PI * (N - T_FLOAT)) / 112 - (i * Math.PI) / 2)));

  return (
    <div style={{position: 'absolute', inset: 0, opacity: exOp, transform: exDy ? `translateY(${exDy.toFixed(1)}px)` : undefined}}>
      {/* ===== 下方地基（kernel · frozen，灰、静止）===== */}
      {groundP > 0 ? (
        <div style={{position: 'absolute', inset: 0, clipPath: `inset(0 ${((1 - groundP) * 100).toFixed(2)}% 0 0)`}}>
          <Box x={GROUND.x} y={GROUND.y} w={GROUND.w} h={GROUND.h} stroke={GREY_MID} sw={2} fill="rgba(0,0,0,0.7)" r={8} />
          <div style={{position: 'absolute', inset: 0, opacity: softOp(N - (T_GROUND + 4), 8)}}>
            <CText cx={640} cy={530} size={22} weight={500} family={FONT_MONO} color={GREY}>kernel · frozen</CText>
          </div>
          {/* 旧 TCP 砖（灰、无光） */}
          <div style={{position: 'absolute', inset: 0, opacity: softOp(N - T_BRICK_T, 8)}}>
            <Box x={BRICK_T.cx - BRICK_T.w / 2} y={BRICK_T.y} w={BRICK_T.w} h={BRICK_T.h} stroke={GREY_MID} sw={2} fill="#0c0c0e" r={4} />
            <CText cx={BRICK_T.cx} cy={BRICK_T.y + BRICK_T.h / 2} size={24} weight={400} family={FONT_WIDE} letterSpacing={2} color={GREY}>TCP</CText>
          </div>
          {/* UDP 橙砖（右端，平台支柱落脚） */}
          <div style={{position: 'absolute', inset: 0, opacity: softOp(N - T_BRICK_U, 8)}}>
            <Box x={BRICK_U.cx - BRICK_U.w / 2} y={BRICK_U.y} w={BRICK_U.w} h={BRICK_U.h} stroke={ORANGE} sw={2.5} fill="#0c0c0e" r={4} />
            <CText cx={BRICK_U.cx} cy={BRICK_U.y + BRICK_U.h / 2} size={24} weight={400} family={FONT_WIDE} letterSpacing={2} color={WHITE}>UDP</CText>
          </div>
        </div>
      ) : null}

      {/* ===== 上方应用层平台（slab + label；Pill 独立层追踪平台位移）===== */}
      {platDy !== null ? (
        <div style={{position: 'absolute', inset: 0, transform: `translateY(${(platDy + floatDy).toFixed(2)}px)`, opacity: platOp}}>
          {/* 平台白光点亮（落位后 HeroGlow 紫呼吸） */}
          <HeroGlow x={SLAB.x} y={SLAB.y} w={SLAB.w} h={SLAB.h} r={12} N={N} k={clamp01((N - (T_PLAT + 16)) / 8) * gk} />
          <div style={{position: 'absolute', inset: 0, filter: platFlash ? 'brightness(1.45)' : undefined}}>
            <Box x={SLAB.x} y={SLAB.y} w={SLAB.w} h={SLAB.h} stroke={WHITE} sw={2.5} fill="rgba(0,0,0,0.85)" r={12} />
            <div style={{...abs(SLAB.x, SLAB.y + 18, SLAB.w, 26), fontFamily: FONT_MONO, fontSize: 24, color: GREY_LIGHT, textAlign: 'center', lineHeight: '26px'}}>
              apps · one update away
            </div>
          </div>
        </div>
      ) : null}

      {/* ===== 四枚机制 Pill（紫边，轮流微亮；先悬浮于地基上方，后飞升落板）===== */}
      {MECH.map((m, i) => {
        const st = pillState(i);
        if (!st) return null;
        const g = pillGlow(i);
        return (
          <div key={m} style={{position: 'absolute', inset: 0, opacity: st.op, transform: `translateX(${st.dx.toFixed(1)}px) scale(${st.scale.toFixed(3)})`, transformOrigin: `${PILL_CX[i]}px ${st.cy}px`}}>
            <Pill x={PILL_CX[i] - PW / 2} y={st.cy - PH / 2} w={PW} h={PH} r={24} stroke={PURPLE_LIGHT} sw={2.5} fill="#000"
              text={m} fontSize={24} weight={600} family={FONT_MONO} color={WHITE} letterSpacing={0}
              style={{boxShadow: g > 0.02 ? `0 0 ${(18 * g).toFixed(0)}px ${(6 * g).toFixed(0)}px rgba(102,48,248,${(0.55 * g * gk).toFixed(2)})` : undefined}} />
          </div>
        );
      })}

      {/* ===== 虚线支柱（平台 → UDP 砖）===== */}
      {pillarP > 0 ? (
        <svg width={1280} height={720} viewBox="0 0 1280 720" style={{position: 'absolute', inset: 0}}>
          {PILLARS.map((x) => (
            <line key={x} x1={x} y1={SLAB.y + SLAB.h} x2={x} y2={BRICK_U.y} stroke={ORANGE} strokeWidth={2.2} strokeDasharray="7 7"
              pathLength={100} strokeDashoffset={100 * (1 - pillarP)} opacity={0.85 * gk} />
          ))}
        </svg>
      ) : null}

      {/* ===== evolve 灰 Pill（9135）===== */}
      <div style={{position: 'absolute', inset: 0, opacity: softOp(N - T_EVOLVE, 8)}}>
        <Pill x={640 - 76} y={214} w={152} h={44} r={22} stroke={GREY_MID} sw={2} fill="#000"
          text="evolve" fontSize={24} weight={600} family={FONT_MONO} color={GREY} letterSpacing={0} />
      </div>
    </div>
  );
};
