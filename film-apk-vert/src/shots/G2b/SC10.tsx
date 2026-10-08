import React from 'react';
import {useCurrentFrame} from 'remotion';
import {GlitchIn, clamp01, powOutRemain, FONT_MONO} from '../../common';
import {CText, Box, EXAMPLE, PURPLE_LIGHT, WHITE, exitOp, glowOffK, softOp} from '../../ui';
import {HeroGlow} from '../../fx';
import {SandboxFenceV, SandboxHouseV, LockGlyphV, BadgeGlyphV, FENCE} from './g2bui';

/**
 * SC10 沙箱 · N 1506–1645（S10 1514–1608：1514「And builds a sandbox:」/ 1557「one hidden Linux user per app」¶）
 * 居中「围墙沙箱」（围栏 x110–610 + 内小屋 + 门牌 `/data/data`）+ 围栏锁（挂底墙正中）+ 下缘三枚用户徽章。
 * 1514 围栏四面墙依次合围 draw-on（18f）+ 小屋 slideUp Δ60/16f；1530 窗灯亮起（暖白，72f 周期持续呼吸）；
 * 1557 门牌 `/data/data` GlitchIn（rgbSplit 4，**本镜唯一 glitch**）+ 三枚徽章 2f 错峰 SoftIn
 * + 各自虚线圈 draw-on（每圈 10f，= 各自隔离）；1559 锁 draw-on 12f + 紫光 1569 起。
 * 停留：末圈落位 1575 → 末 8 帧归零（1637–1645），hold ≈62 ✓（S10 末块 52）。
 * 主角：沙箱（围栏 352 + 小屋整体 472 高）；光：门牌 HeroGlow + 锁 GLOW_PURPLE_S + 窗灯暖白。
 * 事实：/data/data（research §5.6 AOSP Application Sandbox）；u10010/u10024/u10058（派单事实清单）。
 * 零扫光；无运镜。
 */
export const F0 = 1506;
const TO = 1645, EXIT_LEN = 8;
const B_FENCE = 1514, B_HOUSE = 1516, B_WIN = 1530, B_PLATE = 1557, B_LOCK = 1559, B_BADGE = 1557;

const PLATE = {cx: 360, cy: 690, w: 170, h: 34};
const BADGES = [
  {cx: 200, text: 'u10010'},
  {cx: 360, text: 'u10024'},
  {cx: 520, text: 'u10058'},
];
const BADGE_CY = 896;

export const SC10: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const op = exitOp(N, TO, EXIT_LEN);
  if (op <= 0) return null;
  const gk = glowOffK(N, TO, 6, EXIT_LEN); // 门牌/锁紫光先灭
  const winOff = glowOffK(N, TO, 8, EXIT_LEN); // 窗灯稍慢一步

  // 围栏合围（18f 依次）+ 小屋 slideUp
  const fenceP = clamp01((N - B_FENCE) / 18);
  const houseOp = softOp(N - B_HOUSE, 8);
  const houseSlide = 60 * powOutRemain(N - B_HOUSE, 16, 2.5);
  // 窗灯：B_WIN 起 8f 渐入，之后 72f 周期微呼吸（持续动作）
  const winOp = clamp01((N - B_WIN) / 8);
  const winK = 0.62 + 0.18 * Math.sin(((N - B_WIN) / 72) * Math.PI * 2);
  // 门牌（SoftIn −4f 前挂 + GlitchIn 1557 + 紫光 1563 起）
  const plateOp = softOp(N - (B_PLATE - 4), 8);
  const plateGlow = clamp01((N - (B_PLATE + 6)) / 8) * gk;
  // 锁（draw-on 12f + 紫光 1569 起）
  const lockP = clamp01((N - B_LOCK) / 12);
  const lockGlow = clamp01((N - (B_LOCK + 10)) / 8) * gk;
  // 徽章错峰（2f）+ 各自虚线圈（10f，ring 起点比徽章晚 4f）
  const badgeIn = (i: number) => softOp(N - (B_BADGE + 2 * i), 8);
  const ringP = (i: number) => clamp01((N - (B_BADGE + 4 + 2 * i)) / 10);

  return (
    <div style={{position: 'absolute', inset: 0, opacity: op}}>
      {/* 围栏（四面墙依次合围 + 角柱 + 栅栏尖） */}
      <SandboxFenceV p={fenceP} />

      {/* 小屋（滑入 + 窗灯呼吸） */}
      {houseOp > 0 ? (
        <div style={{position: 'absolute', inset: 0, opacity: houseOp, transform: `translateY(${houseSlide.toFixed(1)}px)`}}>
          <SandboxHouseV winK={winK} winOp={winOp * winOff} />
        </div>
      ) : null}

      {/* 门牌 /data/data（屋身面上、门上方；本镜唯一 glitch） */}
      {plateOp > 0 ? (
        <div style={{position: 'absolute', inset: 0, opacity: plateOp}}>
          <HeroGlow x={PLATE.cx - PLATE.w / 2} y={PLATE.cy - PLATE.h / 2} w={PLATE.w} h={PLATE.h} r={10} N={N} k={plateGlow} />
          <Box x={PLATE.cx - PLATE.w / 2} y={PLATE.cy - PLATE.h / 2} w={PLATE.w} h={PLATE.h} r={8} sw={2.5} />
          <GlitchIn N={N} f0={B_PLATE} rgbSplit={4} seed={10} style={{opacity: op}}>
            <CText
              cx={PLATE.cx}
              cy={PLATE.cy}
              size={26}
              weight={700}
              family={FONT_MONO}
              color={PURPLE_LIGHT}
              letterSpacing={0.5}
              dy={0}
              shadow={`0 0 14px rgba(102,48,248,${(0.85 * gk).toFixed(2)})`}
            >
              {EXAMPLE.dataData}
            </CText>
          </GlitchIn>
        </div>
      ) : null}

      {/* 围栏小锁（挂在底墙正中） */}
      <LockGlyphV cx={FENCE.x + FENCE.w / 2} cy={FENCE.y + FENCE.h} p={lockP} glowK={lockGlow} />

      {/* 三枚用户徽章（各自虚线圈 = 各自隔离） */}
      {BADGES.map((b, i) => (badgeIn(i) > 0 ? <BadgeGlyphV key={b.text} cx={b.cx} cy={BADGE_CY} text={b.text} ringP={ringP(i)} opacity={badgeIn(i)} /> : null))}
    </div>
  );
};

export default SC10;
