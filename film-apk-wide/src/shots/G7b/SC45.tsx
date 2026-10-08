import React from 'react';
import {useCurrentFrame} from 'remotion';
import {GlitchIn, clamp01, FONT_MONO, kf, powOutRemain} from '../../common';
import {CText, Box, EXAMPLE, PURPLE_LIGHT, exitOp, glowOffK, softOp, firstOp} from '../../ui';
import {HeroGlow} from '../../fx';
import {FENCE, SandboxFence, SandboxHouse, PLATE45, LockGlyph, BadgeGlyph} from './g7bui';

/**
 * SC45 沙箱 · N 6749–6896（S45 6757–6894：6757「Finally, a sandbox:」/ 6800「/data/data, one Linux user per app.」）
 * 6757 围栏四面墙依次合围 draw-on（18f，上→右→下→左，角柱/栅栏尖随墙冒出）+ 小屋 slideUp Δ60/16f；
 * 6772 小屋窗灯亮起（暖白，72f 周期持续微呼吸）；
 * 6800 门牌 `/data/data` GlitchIn（rgbSplit 4，**本镜唯一 glitch**）+ 锁 draw-on 12f + 锁上紫光（6810 起 8f 渐亮）；
 * 6816 三枚用户徽章（u10010/u10024/u10058 + 小人头像）2f 错峰 SoftIn + 各自虚线圈 draw-on 10f（各自隔离）。
 * 末 8 帧归零（6889–6896，门牌/锁/窗灯光先灭 6f）。
 * 停留：段内不判（末元素=末枚虚线圈 6838 落位 → 离场 6889，51f）。
 * 主角：沙箱（围栏 300px 高 + 小屋）；光：门牌 + 锁紫光；窗灯暖白。
 * 事实：EXAMPLE.dataData = '/data/data'（AOSP Application Sandbox）；UID u10010/u10024/u10058（派单事实清单）。
 */
export const F0 = 6749;
const TO = 6896, EXIT_LEN = 8;
const B_FENCE = 6757, B_HOUSE = 6757, B_WIN = 6772, B_PLATE = 6800, B_LOCK = 6800, B_BADGE = 6816;

const BADGES = [
  {cx: 140, cy: 556, text: 'u10010'},
  {cx: 265, cy: 556, text: 'u10024'},
  {cx: 390, cy: 556, text: 'u10058'},
];

export const SC45: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const op = exitOp(N, TO, EXIT_LEN);
  if (op <= 0) return null;
  const gk = glowOffK(N, TO, 6, EXIT_LEN); // 门牌/锁紫光先灭
  const winOff = glowOffK(N, TO, 8, EXIT_LEN); // 窗灯稍慢一步

  // 围栏合围（18f 线性依次）+ 小屋 slideUp
  const fenceP = clamp01((N - B_FENCE) / 18);
  const houseOp = softOp(N - B_HOUSE, 8);
  const houseSlide = 60 * powOutRemain(N - B_HOUSE, 16, 2.5);
  // 窗灯：B_WIN 起 8f 渐入，之后 72f 周期微呼吸（持续动作）
  const winOp = clamp01((N - B_WIN) / 8);
  const winK = 0.62 + 0.18 * Math.sin(((N - B_WIN) / 72) * Math.PI * 2);
  // 门牌（SoftIn −4f 前挂 + GlitchIn 6800 + 紫光 6806 起）
  const plateOp = softOp(N - (B_PLATE - 4), 8);
  const plateGlow = clamp01((N - (B_PLATE + 6)) / 8) * gk;
  // 锁（draw-on 12f + 紫光 6810 起）
  const lockP = clamp01((N - B_LOCK) / 12);
  const lockGlow = clamp01((N - (B_LOCK + 10)) / 8) * gk;
  // 徽章错峰 + 各自虚线圈
  const badgeIn = (i: number) => softOp(N - (B_BADGE + 2 * i), 8);
  const ringP = (i: number) => clamp01((N - (B_BADGE + 2 + 2 * i)) / 10);

  return (
    <div style={{position: 'absolute', inset: 0, opacity: op}}>
      {/* 围栏（四面墙依次合围） */}
      <SandboxFence p={fenceP} />

      {/* 小屋（滑入 + 窗灯呼吸） */}
      {houseOp > 0 ? (
        <div style={{position: 'absolute', inset: 0, opacity: houseOp, transform: `translateY(${houseSlide.toFixed(1)}px)`}}>
          <SandboxHouse winK={winK} winOp={winOp * winOff} />
        </div>
      ) : null}

      {/* 门牌 /data/data（屋身上、门上方；本镜唯一 glitch） */}
      {plateOp > 0 ? (
        <div style={{position: 'absolute', inset: 0, opacity: plateOp}}>
          <HeroGlow x={PLATE45.cx - PLATE45.w / 2} y={PLATE45.cy - PLATE45.h / 2} w={PLATE45.w} h={PLATE45.h} r={10} N={N} k={plateGlow} />
          <Box x={PLATE45.cx - PLATE45.w / 2} y={PLATE45.cy - PLATE45.h / 2} w={PLATE45.w} h={PLATE45.h} r={8} sw={2.5} />
          <GlitchIn N={N} f0={B_PLATE} rgbSplit={4} seed={45}>
            <CText
              cx={PLATE45.cx}
              cy={PLATE45.cy}
              size={24}
              weight={700}
              family={FONT_MONO}
              color={PURPLE_LIGHT}
              letterSpacing={0.5}
              shadow={`0 0 14px rgba(102,48,248,${(0.85 * gk).toFixed(2)})`}
            >
              {EXAMPLE.dataData}
            </CText>
          </GlitchIn>
        </div>
      ) : null}

      {/* 围栏小锁（挂在底墙正中） */}
      <LockGlyph cx={FENCE.x + FENCE.w / 2} cy={FENCE.y + FENCE.h} p={lockP} glowK={lockGlow} />

      {/* 三枚用户徽章（各自虚线圈 = 各自隔离） */}
      {BADGES.map((b, i) => (badgeIn(i) > 0 ? <BadgeGlyph key={b.text} cx={b.cx} cy={b.cy} text={b.text} ringP={ringP(i)} opacity={badgeIn(i)} /> : null))}
    </div>
  );
};

export default SC45;
