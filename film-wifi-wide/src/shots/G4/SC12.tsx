import React from 'react';
import {useCurrentFrame} from 'remotion';
import {clamp01, easeInOutPow, easeOutCubic, emphasisPulse, powOutRemain, FONT_TECH} from '../../common';
import {CameraRig} from '../../fx';
import {
  Check, CText, GREY, GREY_LINE, GREY_MID, PURPLE_LIGHT, WHITE, abs, SoftIn, fadeIn, firstOp, exitOp, glowOffK, glowPurple, Svg,
} from '../../ui';
import {EX, PlayerWin} from './shared';

/**
 * SC12 工程不停 · N 2486–2709（S23–S24；TO = 2709，SC13 from 2710）
 * 节拍：2494「Faster radios. Wider bands.」三张规格卡 2f 错峰 slideUp（2494/2496/2498，各 14f）+ 上升轨迹连线 draw-on（2502–2522）
 *        ｜2565「The engineering never stops」`never stops` 灰字 SoftIn + 三卡错峰低幅脉冲（2565+2i）
 *        ｜2624「But when your video stalls for a breath」播放器 slideUp（Δ70/22f）+ 进度条 0→48%（2630–2652）
 *          + 停一拍（2652–2656，"一个心跳的静止"）+ 缓冲圈转半圈（2656–2670，14f）
 *        ｜2682「then plays」缓冲圈消失 + 进度条继续走完（2682–2700，18f）+ 绿 Check 小闪（2694）+ `then plays` 灰字（2684）
 * 承接：三卡 exitOp(N,TO,5) 离场；**播放器不离场**——SC13 从 (975,515,400×190) 直接接管放大居中（motion hold 带 ~ 不判）。
 * 运镜：2486–2659 全程慢推 1→1.06（相机末 key 2659 = TO−50 ✓，中心不动）。
 * 主角：三卡+播放器 330px（三卡 glowPurple 组光；播放器 GLOW 0.55）；零 glitch（白名单）。
 */
const F0 = 2486;
const TO = 2709;

const T_C = [2494, 2496, 2498]; // 三卡 2f 错峰
const T_LINK = 2502; // 上升连线 draw-on（20f 两段）
const T_NEVER = 2565; // never stops + 三卡低幅脉冲
const T_PLAYER = 2624; // 播放器 slideUp（22f）
const T_BAR = 2630; // 进度条 0→48%（22f）
const T_BUF = 2656; // 缓冲圈转半圈（14f）
const T_PLAY = 2682; // 圈消失 + 条续走完（18f）+ Check + then plays

// ---- 几何：三卡沿"工程上升"阶梯（左下→右上），播放器右下（SC13 承接位）----
const CARDS = [
  {cx: 300, cy: 455, icon: 'radio' as const, label: EX.faster},
  {cx: 625, cy: 330, icon: 'band' as const, label: EX.wider},
  {cx: 950, cy: 205, icon: 'antenna' as const, label: EX.smarter},
];
const CARD_W = 360, CARD_H = 122;
const PLAYER = {cx: 975, cy: 515, w: 400, h: 190};

/** 规格卡：白描边框 + 左上小图标 + 底部 TechText 标签；lit 紫光随入场点亮 */
const SpecCard: React.FC<{cx: number; cy: number; icon: 'radio' | 'band' | 'antenna'; label: string; lit: number; pulse: number; exitK: number; glowK: number}> = ({cx, cy, icon, label, lit, pulse, exitK, glowK}) => {
  if (exitK <= 0.01) return null;
  const x0 = cx - CARD_W / 2, y0 = cy - CARD_H / 2;
  const iconEls: Record<'radio' | 'band' | 'antenna', React.ReactNode> = {
    radio: (
      <>
        <path d="M4,26 Q9,14 14,26 T24,26 T34,26 T44,26 T54,26" fill="none" stroke={WHITE} strokeWidth={2.4} strokeLinecap="round" />
        <path d="M44,4 L52,15 L46,15 L54,28 L40,16 L47,16 Z" fill="none" stroke={PURPLE_LIGHT} strokeWidth={2} strokeLinejoin="round" />
      </>
    ),
    band: (
      <>
        <rect x={8} y={6} width={16} height={7} rx={2} fill="none" stroke={WHITE} strokeWidth={2.2} />
        <rect x={8} y={17} width={32} height={7} rx={2} fill="none" stroke={WHITE} strokeWidth={2.2} />
        <rect x={8} y={28} width={48} height={7} rx={2} fill="none" stroke={PURPLE_LIGHT} strokeWidth={2.2} />
      </>
    ),
    antenna: (
      <>
        <line x1={28} y1={34} x2={10} y2={6} stroke={WHITE} strokeWidth={2.2} />
        <line x1={28} y1={34} x2={28} y2={2} stroke={WHITE} strokeWidth={2.2} />
        <line x1={28} y1={34} x2={46} y2={6} stroke={WHITE} strokeWidth={2.2} />
        <circle cx={10} cy={6} r={2.4} fill={PURPLE_LIGHT} stroke="none" />
        <circle cx={28} cy={2} r={2.4} fill={PURPLE_LIGHT} stroke="none" />
        <circle cx={46} cy={6} r={2.4} fill={PURPLE_LIGHT} stroke="none" />
      </>
    ),
  };
  return (
    <div style={{...abs(x0, y0, CARD_W, CARD_H), opacity: exitK, transform: `scale(${pulse.toFixed(4)})`, transformOrigin: `${cx}px ${cy}px`}}>
      <div style={{position: 'absolute', inset: 0, background: '#000', border: `2.5px solid ${lit > 0.5 ? WHITE : GREY_MID}`, borderRadius: 12, boxShadow: glowPurple(0.55 * glowK)}} />
      <svg width={58} height={38} viewBox="0 0 58 38" style={{...abs(24, 14, 58, 38), overflow: 'visible', filter: `drop-shadow(0 0 ${3 * lit}px rgba(255,255,255,.4))`}}>
        {iconEls[icon]}
      </svg>
      <div style={{position: 'absolute', left: 26, right: 26, bottom: 16, fontFamily: FONT_TECH, fontStyle: 'italic', fontWeight: 600, fontSize: 22, color: lit > 0.5 ? PURPLE_LIGHT : GREY, letterSpacing: 0.5, textShadow: lit > 0.5 ? `0 0 12px rgba(161,117,241,${(0.5 * glowK).toFixed(2)})` : 'none'}}>
        {label}
      </div>
    </div>
  );
};

export const SC12: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const exit = exitOp(N, TO, 5);
  const gk = glowOffK(N, TO, 3, 5);

  // ---- 三卡：错峰 slideUp + 连线 + 低幅脉冲 ----
  const cardUp = (i: number) => 70 * powOutRemain(N - T_C[i], 14, 2.5);
  const cardOp = (i: number) => firstOp(N - T_C[i]) * exit;
  const linkP = clamp01((N - T_LINK) / 20);
  const pulse = (i: number) => emphasisPulse(N - (T_NEVER + 2 * i), {peak: 1.05, up: 7, hold: 2, down: 7});

  // ---- 播放器：slideUp → 条 0→48% → 停一拍 → 圈半圈 → 2682 起续走完（不淡出，SC13 接管） ----
  const plUp = 70 * powOutRemain(N - T_PLAYER, 22, 2.5);
  const plOp = firstOp(N - T_PLAYER); // 不乘 exit（承接进 SC13）
  const plGlow = (0.5 + 0.1 * Math.sin((N - T_PLAYER) * 0.05)) * fadeIn(N - T_PLAYER, 10) * gk; // 低幅呼吸光
  const barK =
    N < T_BAR ? 0 :
    N < T_BAR + 22 ? 0.48 * easeInOutPow(2)(clamp01((N - T_BAR) / 22)) :
    N < T_PLAY ? 0.48 :
    N < T_PLAY + 18 ? 0.48 + 0.52 * easeInOutPow(1.8)(clamp01((N - T_PLAY) / 18)) : 1;
  const bufOp = N < T_BUF ? 0 : N < T_PLAY ? clamp01((N - T_BUF) / 4) : 1 - clamp01((N - T_PLAY) / 5);
  const bufDeg = N < T_BUF ? 0 : N < T_BUF + 14 ? 180 * easeOutCubic(clamp01((N - T_BUF) / 14)) : 180 + (N - T_BUF - 14) * 1.2; // 半圈后缓转待机
  const headFlash = clamp01((N - (T_PLAY + 12)) / 3) * (1 - clamp01((N - (T_PLAY + 18)) / 4)); // 走完时头亮一拍
  const chkP = clamp01((N - (T_PLAY + 12)) / 10);

  return (
    <CameraRig
      N={N}
      keys={[
        {f: F0, x: 640, y: 360, s: 1},
        {f: 2659, x: 640, y: 360, s: 1.06},
      ]}
    >
      <div style={{...abs(0, 0, 1280, 720)}}>
        {/* ================ 上升轨迹连线（卡1 顶 → 卡2 底 → 卡3 底，虚线 draw-on） ================ */}
        <Svg bloom={false} style={{opacity: exit}}>
          <polyline points={`${CARDS[0].cx},${CARDS[0].cy - CARD_H / 2 - 2} ${CARDS[1].cx},${CARDS[1].cy + CARD_H / 2 + 2}`} fill="none" stroke={PURPLE_LIGHT} strokeWidth={2} strokeDasharray="6 6" pathLength={1} strokeDashoffset={(1 - clamp01(linkP * 2)).toFixed(3)} opacity={0.8} />
          <polyline points={`${CARDS[1].cx},${CARDS[1].cy - CARD_H / 2 - 2} ${CARDS[2].cx},${CARDS[2].cy + CARD_H / 2 + 2}`} fill="none" stroke={PURPLE_LIGHT} strokeWidth={2} strokeDasharray="6 6" pathLength={1} strokeDashoffset={(1 - clamp01(linkP * 2 - 1)).toFixed(3)} opacity={0.8} />
        </Svg>

        {/* ================ 三张规格卡（错峰 slideUp；2565 低幅脉冲） ================ */}
        {CARDS.map((c, i) => (
          <div key={i} style={{...abs(0, cardUp(i) - 0, 1280, 720), opacity: cardOp(i)}}>
            <SpecCard cx={c.cx} cy={c.cy} icon={c.icon} label={c.label} lit={clamp01((N - T_C[i]) / 6)} pulse={pulse(i)} exitK={1} glowK={gk * clamp01((N - T_C[i]) / 8)} />
          </div>
        ))}

        {/* ================ `never stops` 灰字 ================ */}
        <SoftIn N={N} f0={T_NEVER}>
          <CText cx={620} cy={592} size={26} weight={600} color={GREY}>{EX.neverStops}</CText>
        </SoftIn>

        {/* ================ 播放器（slideUp；条 48% 停一拍 → 圈半圈 → 续走完；不离场） ================ */}
        <div style={{...abs(0, plUp, 1280, 720), opacity: plOp}}>
          <PlayerWin cx={PLAYER.cx} cy={PLAYER.cy} w={PLAYER.w} h={PLAYER.h} barK={barK} bufOp={bufOp} spinDeg={bufDeg} glowK={plGlow} headFlash={headFlash} />
        </div>

        {/* 走完后的绿 Check 小闪 + `then plays` 灰字（2684，播放器上缘外一行） */}
        {chkP > 0 ? (
          <div style={{...abs(0, plUp, 1280, 720), opacity: plOp}}>
            <Check cx={888} cy={398} size={30} sw={6} p={chkP} opacity={0.95 * gk} />
          </div>
        ) : null}
        <SoftIn N={N} f0={T_PLAY + 2}>
          <CText cx={985} cy={398} size={24} weight={600} color={GREY}>{EX.thenPlays}</CText>
        </SoftIn>
      </div>
    </CameraRig>
  );
};
