import React from 'react';
import {clamp01, easeInOutPow, easeOutCubic, kf, powOutRemain, GlitchIn, emphasisPulse, FONT_MONO, FONT_ORB} from '../../common';
import {CText, Box, ParcelIcon, PhoneMock, EXAMPLE, WHITE, PURPLE_LIGHT, GREY, GREY_MID, GREY_LINE, ORANGE, BLOOM_SOFT, firstOp, exitOp, glowOffK, mixHex, abs} from '../../ui';
import {countTo} from '../../fx';

/**
 * G2 第 1 章下半共用布局（SC06–SC10）：全都是 zip → 2008 选了 1989 → 两个问题。
 * 所有状态是绝对帧号 N 的纯函数；SC07/SC08 共用 SlotCard（虚线空槽卡 → 1989 揭示），镜头边界零跳变
 * （SC07 末态 = SC08 首态：卡不清场、相机停在同一位 (950,360,1.06)）。
 * 节拍（timeline.json 已核）：S06 879/917 · S07 1002/1084 · S08 1163 · S09 1268/1330 · S10 1434/1466。
 */

// ---- SC07/SC08 虚线空槽卡（= "package format?" 之问 → 1989 之答）----
export const SLOT_C = {cx: 950, cy: 360};
const SLOT0 = {w: 380, h: 200}; // SC07 态（分镜表参考值 x760–1140, y260–460）
const SLOT1 = {w: 500, h: 300}; // 1989 落位后放大（130px Orbitron 四位数 + 边距，见 BUILD_NOTES）
export const T_CARD_IN = 1002; // 卡 SoftIn（S07.c1）
export const T_FLIP = 1163; // 问号翻面（S08 块首）：4 帧 ? 收合
export const T_1989 = 1167; // 1989 GlitchIn + 14 帧计数
export const T_SOLID = 1171; // 卡虚线 → 实线（12 帧）
export const T_BURST = 1181; // 1989 落位：紫光晕爆发 + emphasisPulse

const SLOT_PERIM = 2 * (SLOT1.w + SLOT1.h) + 200; // 放大态周长（dash 用上限）

/**
 * 虚线空槽卡：SC07 1002 SoftIn + `?` 30 帧轮换大小（悬念，持续动作）；
 * SC08 1163 起翻面 → 1989（GlitchIn rgbSplit 6，SC08 唯一 glitch）+ 计数落位 + 卡放大 + 虚线变实线 + 紫晕呼吸。
 * SC07 传 exitAt=Infinity（卡承接进 SC08 不清场）；SC08 传 1259（末 8 帧归零）。
 */
export const SlotCard: React.FC<{N: number; exitAt?: number}> = ({N, exitAt = Infinity}) => {
  const inOp = firstOp(N - T_CARD_IN, 8);
  const exOp = exitOp(N, exitAt, 8);
  const op = inOp * exOp;
  if (op <= 0) return null;
  const glowK = exitAt === Infinity ? 1 : glowOffK(N, exitAt, 6);

  // 卡几何：1163 起 14 帧 easeInOut 放大（中心不动）
  const gk = easeInOutPow(2.5)(clamp01((N - T_FLIP) / 14));
  const w = SLOT0.w + (SLOT1.w - SLOT0.w) * gk;
  const h = SLOT0.h + (SLOT1.h - SLOT0.h) * gk;
  const x = SLOT_C.cx - w / 2;
  const y = SLOT_C.cy - h / 2;

  // 虚线 → 实线（dash 长度涨满周长、gap 收零）
  const sk = clamp01((N - T_SOLID) / 12);
  const dash = 14 + (SLOT_PERIM - 14) * sk;
  const gap = Math.max(0.01, 10 * (1 - sk));

  // `?`：30 帧轮换大小（悬念）；1163 起 4 帧 scaleX 收合（翻面的前半）
  const qP = N < T_FLIP ? 1 : 1 - clamp01((N - T_FLIP) / 4);
  const qScale = (1 + 0.07 * Math.sin((2 * Math.PI * N) / 30)) * Math.max(0, qP);

  // 1989：翻面后半（scaleX 0→1）+ 14 帧计数 + GlitchIn rgbSplit 6
  const yIn = clamp01((N - T_1989) / 4);
  const year = countTo(N - T_1989, 1800, EXAMPLE.zipYear, 14);
  const pulse = emphasisPulse(N - (T_BURST + 4), {peak: 1.1});
  // 紫光晕：落位爆发（1.6×，10 帧收敛）→ 30 帧呼吸（持续动作）
  const burst = kf(N, [[T_BURST, 1.6], [T_BURST + 10, 1]], easeOutCubic);
  const breathe = 0.7 + 0.3 * Math.sin((2 * Math.PI * (N - T_1989)) / 30);
  const gA = (0.5 + 0.32 * breathe) * Math.max(burst, 1) * glowK;

  return (
    <div style={{position: 'absolute', inset: 0, opacity: op}}>
      {/* 卡体（虚线 → 实线） */}
      <svg width={SLOT1.w + 40} height={SLOT1.h + 40} viewBox={`0 0 ${SLOT1.w + 40} ${SLOT1.h + 40}`} style={{position: 'absolute', left: x - 20, top: y - 20, overflow: 'visible', filter: BLOOM_SOFT}}>
        <rect x={20} y={20} width={w} height={h} rx={12} fill="rgba(0,0,0,0.82)" stroke={WHITE} strokeWidth={2.5} strokeDasharray={`${dash.toFixed(0)} ${gap.toFixed(2)}`} />
      </svg>
      {/* `?`（翻面前） */}
      {qP > 0.01 ? (
        <CText cx={SLOT_C.cx} cy={325} size={84} weight={700} family={FONT_ORB} color={WHITE} opacity={0.92} shadow="0 0 16px rgba(255,255,255,.35)"
          style={{transform: `translate(-50%,-50%) scale(${qScale.toFixed(4)})`}}>
          ?
        </CText>
      ) : null}
      {/* `1989`（翻面后，SC08 唯一 glitch） */}
      {N >= T_1989 ? (
        <GlitchIn N={N} f0={T_1989} rgbSplit={6} seed={21}>
          <CText cx={SLOT_C.cx} cy={325} size={130} weight={700} family={FONT_ORB} letterSpacing={6} color={WHITE}
            shadow={`0 0 ${Math.round(14 + 22 * gA)}px ${Math.round(4 + 10 * gA)}px rgba(102,48,248,${clamp01(gA).toFixed(3)})`}
            style={{fontVariantNumeric: 'tabular-nums', transform: `translate(-50%,-50%) scaleX(${yIn.toFixed(3)}) scale(${pulse.toFixed(4)})`, WebkitTextStroke: `3px ${PURPLE_LIGHT}`, paintOrder: 'stroke fill'}}>
            {year}
          </CText>
        </GlitchIn>
      ) : null}
      {/* `package format?`（回答落地后变暗退居问句） */}
      <CText cx={SLOT_C.cx} cy={kf(N, [[T_FLIP, 415], [T_FLIP + 14, 450]], easeInOutPow(2.5))} size={30} weight={500}
        family={FONT_MONO} color={GREY} opacity={N >= T_1989 ? 0.55 : 0.95}>
        package format?
      </CText>
    </div>
  );
};

// ---- SC07 机器人简笔（白线条，绿色不出现）----
/** draw-on 头(7f)→天线(6f,5f 起)→眼(6f,12f 起)，blink 8 帧眼睛压扁；op/s 由调用方给 */
export const RobotGlyph: React.FC<{cx: number; cy: number; N: number; f0: number; blinkAt: number; op: number; s?: number}> = ({cx, cy, N, f0, blinkAt, op, s = 1}) => {
  const n = N - f0;
  if (n < 0 || op <= 0) return null;
  const pHead = clamp01(n / 7);
  const pAnt = clamp01((n - 5) / 6);
  const pEye = clamp01((n - 12) / 6);
  const bT = N - blinkAt;
  const blink = bT >= 0 && bT < 8 ? Math.sin((Math.PI * bT) / 8) : 0; // 8 帧眨一次
  const C = 2 * Math.PI * 30;
  return (
    <div style={{...abs(cx - 48 * s, cy - 55 * s, 96 * s, 110 * s), opacity: op}}>
      <svg width={96 * s} height={110 * s} viewBox="0 0 96 110" style={{position: 'absolute', left: 0, top: 0, overflow: 'visible', filter: BLOOM_SOFT}}>
        <g fill="none" stroke={WHITE} strokeWidth={4} strokeLinecap="round">
          <circle cx={48} cy={62} r={30} pathLength={100} strokeDasharray={100} strokeDashoffset={100 * (1 - pHead)} />
          <path d="M34,34 L25,14" pathLength={100} strokeDasharray={100} strokeDashoffset={100 * (1 - pAnt)} />
          <path d="M62,34 L71,14" pathLength={100} strokeDasharray={100} strokeDashoffset={100 * (1 - pAnt)} />
          <circle cx={25} cy={11} r={4.5} fill="#000" pathLength={100} strokeDasharray={100} strokeDashoffset={100 * (1 - pAnt)} />
          <circle cx={71} cy={11} r={4.5} fill="#000" pathLength={100} strokeDasharray={100} strokeDashoffset={100 * (1 - pAnt)} />
          <g transform={`translate(0,${62}) scale(1,${(1 - 0.85 * blink).toFixed(3)}) translate(0,${-62})`}>
            <circle cx={38} cy={62} r={5} opacity={pEye} />
            <circle cx={58} cy={62} r={5} opacity={pEye} />
          </g>
        </g>
      </svg>
    </div>
  );
};

// ---- SC08 DOS 时代小元素（白线条简笔，各 ≤80px）----
/** 软盘 64×64 */
export const FloppyGlyph: React.FC<{cx: number; cy: number; op: number; s?: number}> = ({cx, cy, op, s = 1}) => {
  if (op <= 0) return null;
  return (
    <div style={{...abs(cx - 32 * s, cy - 32 * s, 64 * s, 64 * s), opacity: op}}>
      <svg width={64 * s} height={64 * s} viewBox="0 0 64 64" style={{position: 'absolute', left: 0, top: 0, overflow: 'visible', filter: BLOOM_SOFT}}>
        <g fill="#000" stroke={WHITE} strokeWidth={2.5} strokeLinejoin="round">
          <rect x={4} y={4} width={56} height={56} rx={5} />
          <rect x={18} y={7} width={28} height={17} />
          <rect x={35} y={11} width={8} height={10} fill={WHITE} stroke="none" opacity={0.85} />
          <rect x={15} y={32} width={34} height={25} />
        </g>
        {[38, 44, 50].map((ly) => <rect key={ly} x={20} y={ly} width={24} height={2.4} fill={GREY_MID} />)}
      </svg>
    </div>
  );
};

/** CRT 显示器（屏上小光标持续闪烁） */
export const CRTGlyph: React.FC<{cx: number; cy: number; N: number; op: number; s?: number}> = ({cx, cy, N, op, s = 1}) => {
  if (op <= 0) return null;
  const cur = Math.floor(N / 24) % 2 === 0 ? 1 : 0.15;
  return (
    <div style={{...abs(cx - 42 * s, cy - 38 * s, 84 * s, 76 * s), opacity: op}}>
      <svg width={84 * s} height={76 * s} viewBox="0 0 84 76" style={{position: 'absolute', left: 0, top: 0, overflow: 'visible', filter: BLOOM_SOFT}}>
        <g fill="#000" stroke={WHITE} strokeWidth={2.5} strokeLinejoin="round">
          <rect x={2} y={2} width={80} height={58} rx={5} />
          <rect x={9} y={9} width={56} height={44} stroke={GREY_LINE} />
          <path d="M34,60 L50,60 L58,70 L26,70 Z" />
          <rect x={14} y={70} width={56} height={4} rx={2} />
        </g>
        <rect x={71} y={26} width={3} height={3} fill={WHITE} />
        <rect x={71} y={34} width={3} height={3} fill={WHITE} />
        <rect x={16} y={40} width={12} height={8} fill={WHITE} opacity={cur * 0.9} />
      </svg>
    </div>
  );
};

/** 点阵打印机（纸 + 点阵行） */
export const PrinterGlyph: React.FC<{cx: number; cy: number; op: number; s?: number}> = ({cx, cy, op, s = 1}) => {
  if (op <= 0) return null;
  return (
    <div style={{...abs(cx - 40 * s, cy - 34 * s, 80 * s, 68 * s), opacity: op}}>
      <svg width={80 * s} height={68 * s} viewBox="0 0 80 68" style={{position: 'absolute', left: 0, top: 0, overflow: 'visible', filter: BLOOM_SOFT}}>
        <g fill="#000" stroke={WHITE} strokeWidth={2.5} strokeLinejoin="round">
          <rect x={22} y={2} width={36} height={22} stroke={GREY_LINE} />
          <rect x={2} y={24} width={76} height={30} rx={4} />
          <path d="M14,54 L66,54 L62,66 L18,66 Z" />
        </g>
        {[8, 15, 22, 29].map((ly) => (
          <g key={ly} fill={GREY_MID}>
            {[30, 37, 44, 51, 58].map((lx) => <rect key={lx} x={lx} y={ly + 4} width={2.6} height={2.6} />)}
          </g>
        ))}
        <rect x={66} y={32} width={6} height={4} fill={WHITE} />
      </svg>
    </div>
  );
};

/** 命令行提示光标（> + 下划线闪烁，无文字） */
export const PromptGlyph: React.FC<{cx: number; cy: number; N: number; op: number; s?: number}> = ({cx, cy, N, op, s = 1}) => {
  if (op <= 0) return null;
  const cur = Math.floor(N / 20) % 2 === 0 ? 1 : 0.12;
  return (
    <div style={{...abs(cx - 40 * s, cy - 24 * s, 80 * s, 48 * s), opacity: op}}>
      <svg width={80 * s} height={48 * s} viewBox="0 0 80 48" style={{position: 'absolute', left: 0, top: 0, overflow: 'visible', filter: BLOOM_SOFT}}>
        <rect x={2} y={2} width={76} height={44} rx={5} fill="#000" stroke={WHITE} strokeWidth={2.5} />
        <path d="M16,14 L28,24 L16,34" fill="none" stroke={WHITE} strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" />
        <rect x={36} y={16} width={22} height={16} fill={WHITE} opacity={cur} />
      </svg>
    </div>
  );
};

// ---- SC10 十秒时钟（主角）：圆盘 draw-on + 12 刻度错峰 + 快速扫弧的时针/分针 ----
export const CLOCK = {cx: 640, cy: 330, r: 150};
export const T_DIAL = 1428; // 圆盘 draw-on 18 帧（S10 块首 1434 的 −6）
/** 指针角（deg，0=12 点，顺时针）：1434–1464 快弧 −60→+60（4°/f），之后 0.5°/f 匀速（10 秒流逝感，持续动作）。
 *  慢漂由 0.9 降为 0.5：0.9°/f 会让橙分针（aM=1.55·aH−20）在 ~1505 后扫过表盘内 `10 s` 文本（1531 时 aM≈166°，针尖 (664,431) 落在文本框内）；
 *  0.5°/f 时 1531 的 aM≈125°，针尖 (724.8,389.5) 在文本（cy425/64px，右上角 (719.8,393)）之外，全程无碰撞。 */
export const clockAngle = (N: number) => {
  if (N < 1434) return -60;
  if (N < 1464) return -60 + 4 * (N - 1434);
  return 60 + 0.5 * (N - 1464);
};
/** 时钟表盘：圆 + 刻度 + 双针。glowK 为离场前灭光系数。 */
export const TenClock: React.FC<{N: number; glowK?: number; op?: number}> = ({N, glowK = 1, op = 1}) => {
  if (op <= 0) return null;
  const dialP = clamp01((N - T_DIAL) / 18);
  const handOp = clamp01((N - 1434) / 8);
  const aH = clockAngle(N);
  const aM = 1.55 * aH - 20;
  const rad = (d: number) => (d * Math.PI) / 180;
  const tip = (a: number, len: number) => ({
    x2: CLOCK.cx + len * Math.sin(rad(a)),
    y2: CLOCK.cy - len * Math.cos(rad(a)),
  });
  const hH = tip(aH, 72);
  const hM = tip(aM, 104);
  return (
    <div style={{position: 'absolute', inset: 0, opacity: op}}>
      <svg width={1280} height={720} viewBox="0 0 1280 720" style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
        {/* 圆盘黑底单独 fade-in（8 帧）：避免 1426 首帧黑盘突然盖住承接中的双卡（描边走 dash draw-on，各自独立） */}
        <circle cx={CLOCK.cx} cy={CLOCK.cy} r={CLOCK.r} fill="rgba(0,0,0,0.88)" opacity={clamp01((N - T_DIAL) / 8)} />
        <circle cx={CLOCK.cx} cy={CLOCK.cy} r={CLOCK.r} fill="none" stroke={WHITE} strokeWidth={3.5}
          pathLength={100} strokeDasharray={100} strokeDashoffset={100 * (1 - dialP)} style={{filter: 'drop-shadow(0 0 2px rgba(255,255,255,.4))'}} />
        {Array.from({length: 12}, (_, i) => {
          const a = (i / 12) * Math.PI * 2;
          const tOp = N >= T_DIAL + 2 * i ? clamp01((N - (T_DIAL + 2 * i)) / 2) : 0;
          if (tOp <= 0) return null;
          const big = i % 3 === 0;
          return <circle key={i} cx={CLOCK.cx + (CLOCK.r - 13) * Math.sin(a)} cy={CLOCK.cy - (CLOCK.r - 13) * Math.cos(a)} r={big ? 4.2 : 3} fill={big ? WHITE : GREY_MID} opacity={tOp} />;
        })}
        {/* 时针（白）+ 分针（橙 accent） */}
        <line x1={CLOCK.cx} y1={CLOCK.cy} x2={hH.x2} y2={hH.y2} stroke={WHITE} strokeWidth={5} strokeLinecap="round" opacity={handOp * glowK} />
        <line x1={CLOCK.cx} y1={CLOCK.cy} x2={hM.x2} y2={hM.y2} stroke={ORANGE} strokeWidth={3.2} strokeLinecap="round" opacity={handOp * glowK} style={{filter: `drop-shadow(0 0 5px rgba(240,95,65,${(0.55 * glowK).toFixed(2)}))`}} />
        <circle cx={CLOCK.cx} cy={CLOCK.cy} r={6.5} fill="#000" stroke={WHITE} strokeWidth={2.5} opacity={handOp} />
      </svg>
    </div>
  );
};

// ---- SC09/SC10 对照双卡（why? 之问的两方：最大的移动 OS ↔ 1989 DOS 格式）----
export const WHY = {
  A: {x: 170, y: 278, w: 360, h: 272}, // 左卡：PhoneMock 缩微 + the biggest mobile OS
  B: {x: 750, y: 278, w: 360, h: 272}, // 右卡：包裹 + 软盘 + `=` + a 1989 DOS format
};
export const T_CARD_A = 1268; // 左卡 slideUp Δ100/22 帧（S09.c1「world's biggest mobile OS」）
export const T_CARD_B = 1270; // 右卡 slideUp（2 帧错峰）
export const T_EQ = 1330; // 右卡内「=」draw-on 10 帧（S09.c2「DOS-era compression format」）
export const T_FLASH = 1338; // 右卡边框橙闪一次（违和感）

const whySlide = (N: number, f0: number) => 100 * powOutRemain(N - f0, 22, 2.5);

/**
 * 对照双卡：SC09 1268/1270 自下滑入后**常驻不清场**（分镜表 SC10「承接：双卡淡出」——双卡跨 1425|1426 边界
 * 交给 SC10 同组件同参数原样接管，交界帧像素一致）；SC10 传 exitAt=1441 → 1427–1441 淡出。
 * 1330 右卡内包裹与软盘之间「=」两横线 draw-on（10 帧）；1338 右卡边框白→橙闪一次后回白。
 */
export const WhyCards: React.FC<{N: number; exitAt?: number}> = ({N, exitAt = Infinity}) => {
  const opA = firstOp(N - T_CARD_A, 6) * exitOp(N, exitAt, 14);
  const opB = firstOp(N - T_CARD_B, 6) * exitOp(N, exitAt, 14);
  if (opA <= 0 && opB <= 0) return null;
  const eqP = clamp01((N - T_EQ) / 10);
  const flashK = kf(N, [[T_FLASH, 0], [T_FLASH + 2, 1], [T_FLASH + 6, 1], [T_FLASH + 12, 0]]);
  return (
    <>
      {/* 左卡：PhoneMock 0.38×（套缩放盒）+ the biggest mobile OS */}
      {opA > 0 ? (
        <div style={{position: 'absolute', inset: 0, opacity: opA, transform: `translateY(${whySlide(N, T_CARD_A).toFixed(2)}px)`}}>
          <Box x={WHY.A.x} y={WHY.A.y} w={WHY.A.w} h={WHY.A.h} r={12} sw={2.5} fill="rgba(0,0,0,0.82)" />
          <div style={{...abs(304, 295, 92, 183)}}>
            <div style={{position: 'absolute', left: 0, top: 0, width: 240, height: 480, transform: 'scale(0.38)', transformOrigin: '0 0'}}>
              <PhoneMock x={0} y={0} w={240} h={480} litN={1} iconN={12} />
            </div>
          </div>
          <CText cx={350} cy={512} size={24} weight={500} color={GREY}>the biggest mobile OS</CText>
        </div>
      ) : null}
      {/* 右卡：包裹 = 软盘（1989 DOS 格式之答）+ a 1989 DOS format */}
      {opB > 0 ? (
        <div style={{position: 'absolute', inset: 0, opacity: opB, transform: `translateY(${whySlide(N, T_CARD_B).toFixed(2)}px)`}}>
          <Box
            x={WHY.B.x} y={WHY.B.y} w={WHY.B.w} h={WHY.B.h} r={12} sw={2.5} fill="rgba(0,0,0,0.82)"
            stroke={flashK > 0 ? mixHex(WHITE, ORANGE, flashK) : WHITE}
            style={flashK > 0.02 ? {boxShadow: `0 0 18px 6px rgba(240,95,65,${(0.45 * flashK).toFixed(3)})`} : undefined}
          />
          <ParcelIcon cx={848} cy={378} w={104} h={74} label="APK" />
          {eqP > 0
            ? [371, 381].map((ly) => (
                <div
                  key={ly}
                  style={{
                    position: 'absolute', left: 925, top: ly, width: 26, height: 3.5, background: WHITE,
                    transformOrigin: 'left center', transform: `scaleX(${eqP.toFixed(3)})`,
                    boxShadow: '0 0 6px rgba(255,255,255,.4)',
                  }}
                />
              ))
            : null}
          <FloppyGlyph cx={1030} cy={378} op={1} s={1.05} />
          <CText cx={930} cy={512} size={24} weight={500} color={GREY}>{`a ${EXAMPLE.zipYear} DOS format`}</CText>
        </div>
      ) : null}
    </>
  );
};

// ---- 通用：三角脉冲（0→1→0）----
export const tri = (n: number, len = 12) => (n <= 0 || n >= len ? 0 : n < len / 2 ? n / (len / 2) : 1 - (n - len / 2) / (len / 2));
