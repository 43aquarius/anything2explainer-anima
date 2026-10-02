import React from 'react';
import {useCurrentFrame} from 'remotion';
import {BEZ_SCALE_IN, clamp01, easeInOutPow, emphasisPulse, FONT_MONO, powOutRemain} from '../../common';
import {
  abs, BLOOM_SOFT, CText, exitAccel, exitOp, glowOffK, GLOW_ORANGE, GREY, GREY_LINE,
  MonoText, ORANGE, PacketIcon, PURPLE_LIGHT, SeqStamp, softOp, Svg, WHITE, GREEN,
} from '../../ui';
import {HeroGlow} from '../../fx';

/**
 * SC16 重排与缺口 · N 3425–3663（S27 3433–3641，¶ 段内段末：按组约定延到 SC17.from−1，不用 to+2 截短）
 * 接收端格子墙（x 300–980, y 220–500，2×3 槽位）：#1 #2 #4 #5 #6 依次落入自己的编号槽（乱序抵达、按序码放），
 * #3 槽保持黑色空缺 + 橙虚线框呼吸 + 上方小沙漏漏沙（等待母题）；3553 紫描边重发信封弧线飞入补位 →
 * 落位白环闪 + #3 格点亮绿边 → 全部 6 格轻微整排 pulse（完成感）。
 * 零 glitch。持续：沙漏漏沙（3465–3573 一轮流尽）/ 缺口虚线呼吸 / 绿边光呼吸 / 墙体柔光呼吸。
 * 停留：补位落位 3553+22 ≈ 3575 → 离场 3655（末 8 帧归零），≈80 帧 ✓（S27 末块 49 + 段末空白也由本镜覆盖）。
 */
const F0 = 3425, TO = 3663;
const B_WALL = 3425;   // 墙 draw-on 18 帧
const B_ENV = 3433;     // 首枚信封（节拍 1：re-stacks in order）
const B_GAP = 3465;     // 缺口强调（节拍 2：holds the gap open）
const B_FILL = 3553;    // 重发信封起飞（节拍 3：until the missing one arrives）
const B_PULSE = 3577;   // 整排 pulse
const EXIT = TO - 8;    // 3635

const WALL = {x: 300, y: 220, w: 680, h: 280};
const CW = WALL.w / 3, CH = WALL.h / 2;
const GAP_IDX = 2; // #3（第一行第三格，中心 (867,290)）
/** 乱序抵达：#1 #2 先到，#4 #5 #6 也到了，#3 缺 */
const DROPS: Array<{idx: number; f: number}> = [
  {idx: 0, f: 3433}, {idx: 1, f: 3443}, {idx: 3, f: 3451}, {idx: 4, f: 3455}, {idx: 5, f: 3462},
];
const cellC = (i: number) => ({cx: WALL.x + ((i % 3) + 0.5) * CW, cy: WALL.y + (Math.floor(i / 3) + 0.5) * CH});
const GAP_C = cellC(GAP_IDX);
const PERIM = 2 * (WALL.w + WALL.h);

/** 沙漏（等待母题）：level 1→0 为顶瓶剩余沙比例 */
const Hourglass: React.FC<{cx: number; cy: number; level: number; opacity: number}> = ({cx, cy, level, opacity}) => {
  const w = 44, h = 58, topH = 20, botH = 20, neckY = 29;
  const flowing = level > 0.001 && level < 0.999;
  return (
    <div style={{...abs(cx - w / 2, cy - h / 2, w, h), opacity}}>
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{filter: BLOOM_SOFT}}>
        <line x1={5} y1={3} x2={w - 5} y2={3} stroke={WHITE} strokeWidth={3} strokeLinecap="round" />
        <line x1={5} y1={h - 3} x2={w - 5} y2={h - 3} stroke={WHITE} strokeWidth={3} strokeLinecap="round" />
        <path d={`M8 5 L${w - 8} 5 L${w / 2} ${neckY - 2} Z`} fill="none" stroke={WHITE} strokeWidth={2} />
        <path d={`M${w / 2} ${neckY + 2} L8 ${h - 5} L${w - 8} ${h - 5} Z`} fill="none" stroke={WHITE} strokeWidth={2} />
        <clipPath id="hg-top"><rect x={0} y={5} width={w} height={Math.max(0, topH * level)} /></clipPath>
        <clipPath id="hg-bot"><rect x={0} y={h - 5 - botH * (1 - level)} width={w} height={botH * (1 - level)} /></clipPath>
        <path d={`M9 6 L${w - 9} 6 L${w / 2} ${neckY - 3} Z`} fill={ORANGE} clipPath="url(#hg-top)" />
        <path d={`M${w / 2} ${neckY + 3} L9 ${h - 6} L${w - 9} ${h - 6} Z`} fill={ORANGE} clipPath="url(#hg-bot)" />
        {flowing ? <line x1={w / 2} y1={neckY} x2={w / 2} y2={h - 7} stroke={ORANGE} strokeWidth={1.6} /> : null}
      </svg>
    </div>
  );
};

/** 重发弧线（1180,430) → 控制 (1010,175) → #3 格 (867,290) */
const bz = (t: number) => {
  const u = 1 - t;
  return {x: u * u * 1180 + 2 * u * t * 1010 + t * t * 867, y: u * u * 430 + 2 * u * t * 175 + t * t * 290};
};

export const SC16: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const op = exitOp(N, TO, 8);
  const dy = exitAccel(Math.max(0, N - EXIT), 0.55);
  const gk = glowOffK(N, TO); // 光先灭
  const breath = 0.5 + 0.5 * Math.sin((2 * Math.PI * N) / 30);

  const wallP = clamp01((N - B_WALL) / 18);
  const divOp = (k: number) => softOp(N - (3438 + k * 3), 6);
  const flightE = easeInOutPow(2.2)(clamp01((N - B_FILL) / 20));
  const landed = N >= B_FILL + 20;
  const hgLevel = clamp01(1 - (N - B_GAP) / 108);
  const hgOp = N < B_GAP ? 0 : softOp(N - B_GAP, 8) * (landed ? 0.35 : 1);
  const fp = bz(flightE);

  return (
    <div style={{position: 'absolute', inset: 0, opacity: op, transform: `translateY(${dy.toFixed(2)}px)`}}>
      {/* 主角柔光（格子墙 280px） */}
      <HeroGlow x={WALL.x - 14} y={WALL.y - 14} w={WALL.w + 28} h={WALL.h + 28} r={20} N={N} k={0.75 * gk} />

      {/* 格子墙外框 draw-on + 分隔线 */}
      <Svg bloom={false}>
        <rect x={WALL.x} y={WALL.y} width={WALL.w} height={WALL.h} fill="rgba(0,0,0,0.35)" stroke={WHITE} strokeWidth={3}
          strokeDasharray={`${PERIM}`} strokeDashoffset={PERIM * (1 - wallP)} />
        <line x1={WALL.x + CW} y1={WALL.y} x2={WALL.x + CW} y2={WALL.y + WALL.h} stroke={GREY_LINE} strokeWidth={2} opacity={divOp(0) * 0.9} />
        <line x1={WALL.x + CW * 2} y1={WALL.y} x2={WALL.x + CW * 2} y2={WALL.y + WALL.h} stroke={GREY_LINE} strokeWidth={2} opacity={divOp(1) * 0.9} />
        <line x1={WALL.x} y1={WALL.y + CH} x2={WALL.x + WALL.w} y2={WALL.y + CH} stroke={GREY_LINE} strokeWidth={2} opacity={divOp(2) * 0.9} />
      </Svg>

      {Array.from({length: 6}, (_, i) => {
        const c = cellC(i);
        const isGap = i === GAP_IDX;
        const pl = emphasisPulse(N - (B_PULSE + i * 2), {peak: 1.05, up: 8, hold: 2, down: 8});

        if (isGap && landed) {
          // 补位后的 #3：信封 + 绿边 + 编号章
          const sn = N - (B_FILL + 20);
          const squash = 1 - 0.14 * (1 - clamp01((sn - 2) / 8));
          return (
            <div key={i} style={{...abs(0, 0, 0, 0)}}>
              <div style={{...abs(c.cx - CW / 2 + 7, c.cy - CH / 2 + 7, CW - 14, CH - 14), border: `2.5px solid ${GREEN}`,
                boxShadow: `0 0 ${14 + 8 * breath}px ${2 + 3 * breath}px rgba(143,247,64,${(0.22 + 0.14 * breath) * gk})`}} />
              <div style={{...abs(c.cx - 75, c.cy + 8 - 50, 150, 100), transform: `scaleY(${squash})`, transformOrigin: '50% 100%'}}>
                <PacketIcon cx={75} cy={50} w={150} h={100} />
              </div>
              <SeqStamp cx={c.cx + 76} cy={c.cy - 46} label="#3" size={52} opacity={softOp(sn, 6)}
                scale={1.4 - 0.4 * clamp01((sn - 2) / 8)} glow={gk > 0.4} />
            </div>
          );
        }
        if (isGap) {
          // 缺口：黑底 + 虚线框（3465 起橙 + 呼吸）+ #3 灰字
          const hot = N >= B_GAP;
          const dashOp = hot ? 0.55 + 0.45 * breath : 0.5;
          return (
            <div key={i}>
              <div style={{...abs(c.cx - CW / 2 + 10, c.cy - CH / 2 + 10, CW - 20, CH - 20), border: `2.5px dashed ${hot ? ORANGE : GREY_LINE}`, opacity: dashOp}} />
              {hot ? <div style={{...abs(c.cx - CW / 2 + 10, c.cy - CH / 2 + 10, CW - 20, CH - 20), boxShadow: GLOW_ORANGE, opacity: 0.5 * breath * gk}} /> : null}
              <MonoText x={c.cx - 16} y={c.cy - 14} size={26} color={hot ? ORANGE : GREY} opacity={0.9}>#3</MonoText>
            </div>
          );
        }
        const drop = DROPS.find((d) => d.idx === i);
        const n = drop ? N - drop.f : -1;
        if (n < 0) return null;
        // 普通信封：12 帧 scaleIn + 自上落下 + 落位 squash + 编号章 stampIn
        const s = 0.55 + 0.45 * BEZ_SCALE_IN(clamp01(n / 12));
        const dropDy = 40 * powOutRemain(n, 12, 2.5);
        const sq = n > 11 ? 1 - 0.14 * (1 - clamp01((n - 11) / 8)) : 1;
        return (
          <div key={i} style={{transform: `scale(${pl})`, transformOrigin: `${c.cx}px ${c.cy}px`, position: 'absolute', inset: 0}}>
            <div style={{...abs(c.cx - 75 * s, c.cy + 8 - 50 * s + dropDy, 150 * s, 100 * s), transform: `scaleY(${sq})`, transformOrigin: '50% 100%'}}>
              <PacketIcon cx={75 * s} cy={50 * s} w={150} h={100} />
            </div>
            <SeqStamp cx={c.cx + 76} cy={c.cy - 46} label={`#${i + 1}`} size={52} opacity={softOp(n - 8, 6)}
              scale={1.4 - 0.4 * clamp01((n - 8) / 8)} />
          </div>
        );
      })}

      {/* 重发信封（飞行 + 拖影），落位后由上方 #3 分支接管 */}
      {!landed && N >= B_FILL ? (
        <>
          {[0.12, 0.06, 0].map((off, k) => {
            const p2 = bz(clamp01(flightE - off));
            return <PacketIcon key={k} cx={p2.x} cy={p2.y} w={96} h={64} accent opacity={k === 0 ? 1 : 0.4} glow={k === 0} />;
          })}
          <CText cx={1180} cy={500} size={22} weight={600} color={PURPLE_LIGHT} opacity={softOp(N - B_FILL, 6)}
            style={{fontFamily: FONT_MONO}}>resend</CText>
        </>
      ) : null}

      {/* 落位白环 */}
      {landed && N < B_FILL + 32 ? (
        <Svg>
          <circle cx={GAP_C.cx} cy={GAP_C.cy} r={20 + 58 * clamp01((N - (B_FILL + 20)) / 9)} fill="none" stroke={WHITE}
            strokeWidth={4} opacity={0.85 * (1 - clamp01((N - (B_FILL + 20)) / 9))} />
        </Svg>
      ) : null}

      {/* 沙漏（缺口上方） */}
      {hgOp > 0 ? <Hourglass cx={GAP_C.cx} cy={176} level={hgLevel} opacity={hgOp} /> : null}

      {/* 标签 */}
      <CText cx={640} cy={541} size={26} weight={600} color={GREY} opacity={softOp(N - B_ENV, 8)}>the receiver</CText>
    </div>
  );
};
