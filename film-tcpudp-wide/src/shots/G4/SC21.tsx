import React from 'react';
import {useCurrentFrame} from 'remotion';
import {BEZ_SCALE_IN, clamp01, emphasisPulse, FONT_MONO, FONT_ORB} from '../../common';
import {
  abs, Check, CText, ClockIcon, exitAccel, exitOp, glowOffK, GREY, mixHex, ORANGE,
  PuzzlePhoto, PURPLE, RED_DEEP, softOp, Svg, WHITE, GREEN,
} from '../../ui';
import {countTo} from '../../fx';
import {PhoneGlyph} from './g4ui';

/**
 * SC21 完美抵达与不能拨号 · N 4649–4999（S33 4657–4746 + S34 4757–4912 + S35 4923–4997，¶+gap15 章末 → C3 章节卡）
 * 左半：SC09 拼图照片卡完整态（6/6，2 帧错峰就位）+ 绿色大 Check draw-on + 卡边绿光 + `arrives perfect` 灰字；
 * 右半：电话图标（缩放入场 + 红色 `can't dial` 角标 shake 一次）+ 50 点点阵 10×5 级联点亮（30 帧）后光点巡行 +
 * `50 × /s` Orbitron 64px 橙（14 帧计数落位）+ 小时钟快转（秒针 2× 转速，20ms 一跳的快转感）。
 * 4923（S35.c1）中央下方钩子大字 `waiting is worse than losing`（Noto 900 48px 白+紫描边）SoftIn + emphasisPulse
 * —— 章末钩子，不 glitch（组内零 glitch）。
 *
 * —— 成片 v1 修复（tcpudp-wide-fix-A）：钩子落位到整组归零只 21–27f <30（成片复测 fin_frames 实测：
 *    v1 大字 4923 入场 + 脉冲 4935–4965，离场 4989，脉冲太长把稳定期吃掉）。修法（主会话授权）：
 *    ① 大字前挂 15 帧：B_HOOK 4923 → 4908（S35.c1 4923 −15，超出「不早于 −6」容差，已记录偏离）；
 *    ② SoftIn 缩短为 12 帧（v1 为 10），落位 4920；
 *    ③ emphasisPulse：落位后第 8 帧起（4928）、12 帧完成（up6/hold2/down4，v1 为 30 帧），完成点 4940
 *       → 末 10 帧归零 4989 = 49 帧 ≥35 ✓（满态后时钟快转/光点巡行实测 diff 0.2–0.8 < 1.5，稳定期 ≈45f）。
 */
const F0 = 4649, TO = 4999;
const B_FRAME = 4649;  // 拼图卡框 SoftIn（承接入场，首帧起）
const B_FILL = 4657;   // 节拍 1：拼图块 2 帧错峰全部就位（4657–4667）
const B_CHECK = 4671;  // 绿 Check draw-on 16 帧 → 4687 落位 + 卡边绿光
const B_TXT = 4706;    // arrives perfect（S33 c2 4710 −4）
const B_PHONE = 4757;  // 节拍 2：电话缩放入场（21 帧）
const B_BADGE = 4777;  // can't dial 角标（SoftIn + shake 一次）
const B_50 = 4835;     // 节拍 3：50 点级联（30 帧）+ 50 × /s 计数 + 时钟快转
const B_HOOK = 4908;   // 节拍 4（S35.c1 4923）：钩子大字，成片 v1 前挂 15 帧
const HOOK_IN = 12;    // SoftIn 12 帧（成片 v1：10 → 12，落位 4920）
const EXIT = TO - 10;  // 4989（末 10 帧整组归零）

const PUZ = {x: 180, y: 250, w: 300, h: 220}; // 中心 (330,360)
const NUM = {cx: 1010, cy: 254};              // 50 × /s
const PHONE = {cx: 855, cy: 378, w: 130};
const BADGE = {x: 788, y: 299, w: 140, h: 30};
const GRID = {x: 940, y: 328, cols: 10, rows: 5, pitchX: 14, pitchY: 24};
const CLOCK = {cx: 1140, cy: 380, r: 38};

export const SC21: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const op = exitOp(N, TO, 10);
  const dy = exitAccel(Math.max(0, N - EXIT), 0.1); // 末帧 ≤10px，不穿字幕带
  const gk = glowOffK(N, TO, 6, 10);
  const breath = 0.5 + 0.5 * Math.sin((2 * Math.PI * N) / 30);

  const frOp = softOp(N - B_FRAME, 8);
  const filled = N < B_FILL ? 0 : Math.min(6, Math.floor((N - B_FILL) / 2) + 1);
  const checkP = clamp01((N - B_CHECK) / 16);
  const greenK = softOp(N - (B_CHECK + 16), 8);
  const phn = N - B_PHONE;
  const phnS = phn < 0 ? 0 : 0.65 + 0.35 * BEZ_SCALE_IN(clamp01(phn / 21));
  const bdn = N - B_BADGE;
  const shakeX = bdn > 6 ? 3.5 * Math.sin((bdn - 6) * Math.PI / 5) * (1 - clamp01((bdn - 6) / 10)) : 0;

  const litDots = Math.floor(clamp01((N - B_50) / 30) * 50); // 级联 30 帧 → 4865 全亮
  const hotIdx = N >= B_50 + 30 ? (N - B_50 - 30) % 50 : -1; // 全亮后一枚光点巡行（持续动作）
  const hotRun = (i: number) => (hotIdx < 0 ? 0 : Math.max(0, 1 - Math.abs(i - hotIdx) / 3));
  const cnt50 = countTo(N - (B_50 + 2), 0, 50, 14);
  const numK = softOp(N - (B_50 + 18), 8); // 计数落位后橙光增强
  // 成片 v1：脉冲在落位（B_HOOK+12）后第 8 帧起、12 帧完成（完成点 4940 → 归零 4989 = 49 帧 ≥35）
  const hookS = emphasisPulse(N - (B_HOOK + HOOK_IN + 8), {peak: 1.09, up: 6, hold: 2, down: 4});

  return (
    <div style={{position: 'absolute', inset: 0, opacity: op, transform: `translateY(${dy.toFixed(2)}px)`}}>
      {/* —— 左半：拼图照片卡（SC09 同款，完整态 6/6） —— */}
      <div style={{position: 'absolute', inset: 0, opacity: frOp}}>
        {/* 卡边框：白 → 落定绿 + 绿光呼吸 */}
        <div style={{...abs(PUZ.x - 5, PUZ.y - 5, PUZ.w + 10, PUZ.h + 10), borderRadius: 6,
          border: `2.5px solid ${mixHex(WHITE, GREEN, greenK)}`,
          boxShadow: `0 0 ${(12 + 9 * breath) * gk}px ${(3 + 3 * breath) * gk}px rgba(143,247,64,${(0.16 + 0.16 * breath) * gk})`}} />
        <PuzzlePhoto x={PUZ.x} y={PUZ.y} w={PUZ.w} h={PUZ.h} cols={3} rows={2} filled={filled} missingIdx={-1} />
      </div>
      {/* 绿色大 Check（draw-on 16 帧 + 绿光） */}
      {checkP > 0 ? (
        <Svg style={{filter: 'drop-shadow(0 0 9px rgba(143,247,64,.75))'}}>
          <Check cx={330} cy={352} size={112} sw={9} p={checkP} opacity={0.96 * gk + 0.04} />
        </Svg>
      ) : null}
      <CText cx={330} cy={522} size={26} weight={600} family={FONT_MONO} color={GREY} opacity={softOp(N - B_TXT, 8)} dy={0}>arrives perfect</CText>

      {/* —— 右半：电话 + 50 点点阵 + 小时钟 —— */}
      {phn >= 0 ? (
        <div style={{position: 'absolute', inset: 0, transform: `scale(${phnS.toFixed(4)})`, transformOrigin: `${PHONE.cx}px ${PHONE.cy}px`}}>
          <PhoneGlyph cx={PHONE.cx} cy={PHONE.cy} w={PHONE.w} />
        </div>
      ) : null}
      {/* can't dial 红角标（shake 一次） */}
      {bdn >= 0 ? (
        <div style={{position: 'absolute', inset: 0, opacity: softOp(bdn, 8), transform: `translateX(${shakeX.toFixed(2)}px)`}}>
          <div style={{...abs(BADGE.x, BADGE.y, BADGE.w, BADGE.h), border: `2px solid ${RED_DEEP}`, background: '#000', borderRadius: 5,
            transform: 'rotate(-4deg)', boxShadow: `0 0 12px 2px rgba(236,8,31,${0.32 * gk})`}} />
          <CText cx={BADGE.x + BADGE.w / 2} cy={BADGE.y + 16} size={22} weight={700} family={FONT_MONO} color={RED_DEEP} dy={0}>can't dial</CText>
        </div>
      ) : null}

      {/* 50 点点阵（10×5 级联点亮 + 光点巡行） */}
      {Array.from({length: 50}, (_, i) => {
        if (i >= litDots) return null;
        const col = i % GRID.cols, row = Math.floor(i / GRID.cols);
        const run = hotRun(i);
        const just = i === litDots - 1 && N < B_50 + 36;
        const r = 2.6 + 1.5 * run + (just ? 0.9 : 0);
        return (
          <div key={i} style={{position: 'absolute', left: GRID.x + col * GRID.pitchX - r, top: GRID.y + row * GRID.pitchY - r,
            width: 2 * r, height: 2 * r, borderRadius: r, background: ORANGE, opacity: 0.72 + 0.28 * run,
            boxShadow: run > 0.15 ? `0 0 9px 2.5px rgba(240,95,65,${(0.8 * run * gk).toFixed(2)})` : undefined}} />
        );
      })}

      {/* 50 × /s（计数落位 + 橙光增强 + 微脉冲） */}
      {N >= B_50 ? (
        <div style={{position: 'absolute', inset: 0, opacity: softOp(N - B_50, 8)}}>
          <div style={{position: 'absolute', inset: 0, transform: `scale(${emphasisPulse(N - (B_50 + 18), {peak: 1.08, up: 12, hold: 3, down: 12}).toFixed(4)})`, transformOrigin: `${NUM.cx}px ${NUM.cy}px`}}>
            <CText cx={NUM.cx} cy={NUM.cy} size={64} weight={700} family={FONT_ORB} color={ORANGE} letterSpacing={2} dy={0}
              style={{fontVariantNumeric: 'tabular-nums', textShadow: `0 0 ${(16 + 12 * numK).toFixed(0)}px rgba(240,95,65,${(0.45 + 0.3 * numK).toFixed(2)})`}}>
              {N >= B_50 + 2 ? cnt50 : 0} × /s
            </CText>
          </div>
        </div>
      ) : null}

      {/* 小时钟（秒针 2× 转速快转：一整圈 / 0.5 s ≈ 20ms 一跳的语速） */}
      <ClockIcon cx={CLOCK.cx} cy={CLOCK.cy} r={CLOCK.r} N={Math.max(0, (N - B_50) * 2)} accent={ORANGE} opacity={softOp(N - (B_50 + 2), 8)} />

      {/* —— 章末钩子大字（SoftIn 12 帧 + 12 帧脉冲，不 glitch） —— */}
      {N >= B_HOOK ? (
        <div style={{position: 'absolute', inset: 0, opacity: softOp(N - B_HOOK, HOOK_IN),
          transform: `translateY(${((1 - softOp(N - B_HOOK, HOOK_IN)) * 12).toFixed(2)}px) scale(${hookS.toFixed(4)})`, transformOrigin: '640px 570px'}}>
          <CText cx={640} cy={570} size={48} weight={900} color={WHITE} letterSpacing={0.5}
            style={{WebkitTextStroke: `2.5px ${PURPLE}`, paintOrder: 'stroke fill', textShadow: '0 0 18px rgba(102,45,248,.55)'}}>
            waiting is worse than losing
          </CText>
        </div>
      ) : null}
    </div>
  );
};
