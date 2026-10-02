import React from 'react';
import {useCurrentFrame} from 'remotion';
import {clamp01, easeOutQuad, FONT_MONO} from '../../common';
import {
  CText, Pill, SoftIn, abs, exitOp, glowOffK, exitAccel, scaleIn, fadeIn, WHITE, GREY, GREY_MID, GREY_LINE,
} from '../../ui';
import {CameraRig} from '../../fx';

/**
 * SC07 简单的网络，聪明的端点 · N 1363–1549（S10 1371–1431 + S11 1442–1547，¶ 段末）
 * 版式：中央一段极简的线（2px，y 400，x 520–760）标 `simple` 灰 Pill (640,358)；
 *       两侧两个发光端点方块（各 172×172，白边 + 内画简笔芯片；分镜表原 140×140，按"主角 ≥170px"硬规则上调），
 *       左 (340,400) `your machine`、右 (940,400) `friend's machine`（等宽 22px 灰，y 516）；
 *       端点内底部 3 条刻度线逐条点亮循环（20 帧一条，"智能感"持续动作）。
 * 节拍：1368 线 draw-on 12 帧（故意朴素，无光——与端点对比）；1407/1409 两端点 21 帧缩放入场（2 帧错峰）+ 落位白闪一次；
 *       1412/1414 机名小字 SoftIn；1442 `simple` Pill SoftIn；1487 刻度线逐条点亮循环 + 端点柔光增强（30 帧呼吸）。
 * 运镜：整组 1.0→1.05 慢推贯穿（1363→1549，camAt easeInOutPow2.5；慢推例外可进末拍）。
 * 离场：末 8 帧（1542–1549）归零，先灭光（1536 起）。停留：刻度循环持续到离场 ✓（S11 末块 61+gap）。
 * 主角：两端点组（各 172px ≥170 ✓）；光 = 端点白柔光（呼吸）；中央线无光（对比）。
 */
const F0 = 1363;
const TO = 1569; // 成片 v4：对齐注册区间末端（原 1549 = S11.to+2；区间已扩到 1569）
const T_LINE = 1368, T_BOX_L = 1407, T_BOX_R = 1409, T_LABEL = 1412, T_SIMPLE = 1442, T_TICK = 1487;

const BOX = 172;
const BOXES = [
  {cx: 340, f0: T_BOX_L, label: 'your machine'},
  {cx: 940, f0: T_BOX_R, label: "friend's machine"},
];

/** 端点方块：白边黑底 + 简笔芯片（体/核/引脚）+ 底部 3 条刻度线（lit 条数 0–3 循环） */
const EndpointBox: React.FC<{cx: number; N: number; f0: number; glowK: number; lit: number; flash: number}> = ({cx, N, f0, glowK, lit, flash}) => {
  const n = N - f0;
  if (n < 0) return null;
  const s = scaleIn(n, 21);
  const op = fadeIn(n, 6);
  const breathe = 1 + 0.15 * Math.sin((2 * Math.PI * N) / 30);
  const glowA = 0.22 * glowK * breathe;
  const bright = flash > 0 && flash < 6 ? 1 + 0.6 * Math.sin((Math.PI * flash) / 6) : 1;
  const x0 = cx - BOX / 2, y0 = 400 - BOX / 2;
  return (
    <div style={{...abs(x0, y0, BOX, BOX), opacity: op, transform: s < 1 ? `scale(${(0.2 + 0.8 * s).toFixed(4)})` : undefined, transformOrigin: '50% 50%'}}>
      <div style={{position: 'absolute', inset: 0, background: '#000', border: `3px solid ${WHITE}`, borderRadius: 12, filter: `brightness(${bright.toFixed(3)})`,
        boxShadow: `0 0 ${(16 * glowK).toFixed(0)}px ${(5 * glowK).toFixed(0)}px rgba(255,255,255,${glowA.toFixed(3)})`}} />
      {/* 简笔芯片 */}
      <svg width={BOX} height={BOX} viewBox={`0 0 ${BOX} ${BOX}`} style={{position: 'absolute', inset: 0}}>
        <rect x={44} y={32} width={84} height={84} fill="none" stroke={WHITE} strokeWidth={2.5} />
        <rect x={66} y={54} width={40} height={40} fill="none" stroke={WHITE} strokeWidth={2} />
        <circle cx={86} cy={74} r={7} fill="none" stroke={WHITE} strokeWidth={2} />
        {[42, 58, 74, 90, 106].map((p, i) => (
          <g key={i} stroke={WHITE} strokeWidth={2} opacity={0.85}>
            <line x1={p} y1={32} x2={p} y2={22} />
            <line x1={p} y1={116} x2={p} y2={126} />
            <line x1={32} y1={p} x2={22} y2={p} />
            <line x1={128} y1={p} x2={138} y2={p} />
          </g>
        ))}
      </svg>
      {/* 底部 3 条刻度线：lit 条数 0–3 循环（20 帧一条） */}
      {[0, 1, 2].map((i) => {
        const on = i < lit;
        return (
          <div key={i} style={{position: 'absolute', left: 52, top: 140 + i * 12, width: on ? 68 : 46, height: 4, borderRadius: 2,
            background: on ? WHITE : GREY_LINE, opacity: on ? 1 : 0.7,
            boxShadow: on ? '0 0 8px 2px rgba(255,255,255,.55)' : 'none'}} />
        );
      })}
    </div>
  );
};

export const SC07: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const exN = N - (TO - 8);
  const exOp = exitOp(N, TO, 8);
  const exDy = exitAccel(exN, 0.05);
  const gk = glowOffK(N, TO, 6, 8);
  // 柔光增强：1487 起 8 帧 0.55→1（乘在 glowK 上）
  const kUp = 0.55 + 0.45 * clamp01((N - T_TICK) / 8);
  // 刻度循环：20 帧一条，1→2→3→(清零)→1…
  const ph = N < T_TICK ? -1 : Math.floor((N - T_TICK) / 20);
  const lit = ph < 0 ? 0 : [1, 2, 3, 0][ph % 4];
  const lp = clamp01((N - T_LINE) / 12);

  return (
    <CameraRig N={N} keys={[{f: F0, x: 640, y: 360, s: 1}, {f: TO, x: 640, y: 360, s: 1.05}]}>
      <div style={{position: 'absolute', inset: 0, opacity: exOp, transform: exDy ? `translateY(${exDy.toFixed(1)}px)` : undefined}}>
        {/* 中央极简的线：draw-on（无光，朴素） */}
        {lp > 0 ? (
          <div style={{...abs(520, 399, 240 * easeOutQuad(lp), 2), background: WHITE, filter: 'drop-shadow(0 0 2px rgba(255,255,255,.35))'}} />
        ) : null}
        {/* `simple` 灰 Pill */}
        <SoftIn N={N} f0={T_SIMPLE}>
          <Pill x={640 - 75} y={336} w={150} h={44} fill="#000" stroke={GREY_MID} sw={2} text="simple" fontSize={26} weight={600} color={GREY} textDy={0} />
        </SoftIn>
        {/* 两端点（主角组） */}
        {BOXES.map((b) => (
          <React.Fragment key={b.label}>
            <EndpointBox cx={b.cx} N={N} f0={b.f0} glowK={gk * kUp} lit={lit} flash={N - (b.f0 + 21)} />
            <SoftIn N={N} f0={T_LABEL + (b.f0 === T_BOX_L ? 0 : 2)}>
              <CText cx={b.cx} cy={516} size={22} weight={500} family={FONT_MONO} color={GREY}>{b.label}</CText>
            </SoftIn>
          </React.Fragment>
        ))}
      </div>
    </CameraRig>
  );
};
