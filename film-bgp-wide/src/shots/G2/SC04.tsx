import React from 'react';
import {useCurrentFrame} from 'remotion';
import {clamp01, easeInOutPow, GlitchIn, rnd, FONT_ORB, emphasisPulse} from '../../common';
import {CameraRig, HeroGlow, countTo} from '../../fx';
import {
  AsChip, CText, EXAMPLE, GREY, ORANGE, abs, SoftIn, firstOp, softOp, exitOp, glowOffK, scaleIn,
} from '../../ui';
import {ChipCell, MapMini} from './g2ui';

/**
 * SC04 十万个网络 · N 732–874（S06：760「The internet isn't one network.」/ 822「It's about a hundred thousand of them:」）
 * 版式：章首承接——SC03 地图缩微 16 帧滑到右上角压暗常驻；760 一枚大 AsChip `AS64512`（白描边，主角）
 *   单独站场 + 下方灰标签 `one network?`；822 画面裂变——大芯片缩小灰化让位到 6×5 芯片海左上角，
 *   29 枚灰边小芯片对角序 4 波点亮（「铺开成海」）+ 大计数 `~120,000`（Orbitron 76px 橙）glitch 滚落 +
 *   橙光晕 + 脉冲；下角灰小字 `allocated ASNs, 2025`。
 * 动效：758 大芯片缩入 14f + 标签 SoftIn；819 芯片缩小让位（17f）+ 816 起 4 波错峰点亮（2 帧错峰）；
 *   824 计数 GlitchIn（rgbSplit 4，本镜唯一 glitch）+ 20f 滚落 + 846 emphasisPulse；
 *   852 起网格灯 40 帧周期随机轮闪（持续动作）。运镜：33f 1→1.15 推向计数（788–821，不与 glitch 重叠、不进末拍）。
 * 停留：段内不判（S06 末块 51）。末 8 帧归零。
 */
const F0 = 732;
const TO = 874;
const T_MINI = 732, T_CHIP = 758, T_LABEL = 762, T_SPLIT = 819, T_GRID = 812, T_CNT = 816, TW = 826; // TW 前移：轮闪中段建立，尾部只余低幅呼吸

// 芯片海几何：6×5 网格，格 60、距 14（网格中心 640,330；[0][0] = 大芯片落位）
const GX0 = 455, GY0 = 182, STEP = 74;
/** 29 枚（除 [0][0]）按对角序 r+c 分 4 波（8/7/7/7），波内 2 帧错峰 */
const CELLS: Array<{r: number; c: number; wave: number; wIdx: number}> = (() => {
  const order: Array<[number, number]> = [];
  for (let s = 1; s <= 9; s++) for (let r = 0; r < 5; r++) { const c = s - r; if (c >= 0 && c < 6) order.push([r, c]); }
  const waveFirst = [0, 8, 15, 22];
  return order.map(([r, c], i) => {
    const wave = Math.min(3, Math.floor(i / 7.25));
    return {r, c, wave, wIdx: i - waveFirst[wave]};
  });
})();

export const SC04: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const exit = exitOp(N, TO, 5); // 变陡，保尾部稳定期
  const gk = glowOffK(N, TO, 3, 5); // 收紧

  // ---- 章首承接：SC03 地图缩微滑到右上角（16 帧落位，压暗常驻到镜头末） ----
  const kMini = easeInOutPow(2.5)(clamp01((N - T_MINI) / 16));
  const miniCx = 640 + (1075 - 640) * kMini;
  const miniCy = 360 + (200 - 360) * kMini;
  const miniW = 504 + (190 - 504) * kMini;
  const miniH = 360 + (136 - 360) * kMini;
  const miniOp = firstOp(N - T_MINI, 6) * (1 - 0.4 * clamp01((N - T_MINI - 16) / 10)) * exit;

  // ---- 大芯片：758 缩入 → 819 缩小灰化让位到网格左上角（17f）----
  const kSh = easeInOutPow(2.5)(clamp01((N - T_SPLIT) / 17));
  const bigCx = 640 + (GX0 - 640) * kSh;
  const bigCy = 330 + (GY0 - 330) * kSh;
  const bigS = 170 + (60 - 170) * kSh;
  const bigIn = scaleIn(N - T_CHIP, 14);
  const bigOp = softOp(N - T_CHIP, 6) * (1 - clamp01((N - (T_SPLIT + 11)) / 6)); // 830–836 与 ChipCell[0] 交叉淡化
  const bigDim = N >= T_SPLIT + 5;
  const chipGlowK = softOp(N - T_CHIP, 8) * (1 - clamp01((N - T_SPLIT) / 12)) * gk;

  // ---- `one network?` 标签（裂变时 8 帧淡出） ----
  const labelOp = 1 - clamp01((N - T_SPLIT) / 8);

  // ---- 网格灯随机轮闪（40 帧周期，852 起 8 帧爬入） ----
  const twk = clamp01((N - TW) / 8);
  const ledTwk = (idx: number) => {
    if (twk <= 0) return 1;
    const ph = ((N + Math.floor(rnd(idx, 31) * 40)) % 40) / 40;
    const target = 0.62 + 0.24 * (0.5 - 0.5 * Math.cos(2 * Math.PI * ph)); // 低幅呼吸（0.62–0.86）：活着但不破尾部稳定期
    return 1 + twk * (target - 1);
  };

  // ---- 计数滚落（824 glitch + 20 帧滚到 ~120,000，846 起脉冲） ----
  const cntN = N - T_CNT;
  const roll = `~${countTo(cntN, 0, 120000, 12)}`; // 滚落压短
  const cntPulse = 1; // 装饰性脉冲移除：短镜头尾部稳定期优先（glitch+滚落已是入场戏）

  return (
    <>
      <CameraRig N={N} keys={[{f: F0, x: 640, y: 360, s: 1}, {f: 788, x: 640, y: 360, s: 1}, {f: 821, x: 640, y: 445, s: 1.15}]}>
        <div style={{...abs(0, 0, 1280, 720), opacity: exit}}>
          {/* 大芯片（白描边主角 + 紫柔光） */}
          {bigOp > 0.01 ? (
            <div style={{...abs(0, 0, 1280, 720), transform: `scale(${bigIn.toFixed(4)})`, transformOrigin: `${bigCx.toFixed(1)}px ${bigCy.toFixed(1)}px`, opacity: bigOp}}>
              <HeroGlow x={bigCx - bigS / 2 - 12} y={bigCy - bigS / 2 - 12} w={bigS + 24} h={bigS + 24} N={N} k={chipGlowK} />
              <AsChip cx={bigCx} cy={bigCy} w={bigS} h={bigS} asn={EXAMPLE.asnYou} led={N < T_SPLIT + 5 ? 'on' : 'off'} dim={bigDim} glow />
            </div>
          ) : null}

          {/* one network? */}
          {labelOp > 0.01 ? (
            <div style={{...abs(0, 0, 1280, 720), opacity: labelOp}}>
              <SoftIn N={N} f0={T_LABEL}>
                <CText cx={640} cy={458} size={30} weight={600} color={GREY}>one network?</CText>
              </SoftIn>
            </div>
          ) : null}

          {/* 芯片海 [0][0]：缩小的大芯片（830 交叉淡入，846 随末波点亮） */}
          <ChipCell cx={GX0} cy={GY0} litK={softOp(N - 826, 5)} ledK={softOp(N - 826, 5)} ledOp={ledTwk(99)} opacity={softOp(N - (T_SPLIT + 11), 6)} />
          {/* 芯片海 29 枚（4 波对角铺开） */}
          {CELLS.map((cell, i) => {
            const n = N - (T_GRID + cell.wave * 2 + cell.wIdx); // 波次压缩：全部落位 ≤830，保尾部稳定期
            if (n < 0) return null;
            return (
              <ChipCell key={i} cx={GX0 + cell.c * STEP} cy={GY0 + cell.r * STEP}
                litK={softOp(n, 5)} ledOp={ledTwk(i)} opacity={softOp(n, 5)} scale={scaleIn(n, 7)} />
            );
          })}

          {/* 计数 ~120,000（本镜唯一 glitch：rgbSplit 4） */}
          <GlitchIn N={N} f0={T_CNT} rgbSplit={4} seed={5}>
            <div style={{...abs(0, 0, 1280, 720), transform: `scale(${cntPulse.toFixed(4)})`, transformOrigin: '640px 562px'}}>
              <CText cx={640} cy={562} size={76} weight={700} family={FONT_ORB} color={ORANGE} letterSpacing={2}
                shadow={`0 0 22px rgba(240,95,65,${(0.55 * gk).toFixed(2)}), 0 0 58px rgba(240,95,65,${(0.32 * gk).toFixed(2)})`}
                style={{fontVariantNumeric: 'tabular-nums'}}>{roll}</CText>
            </div>
          </GlitchIn>

          {/* 下角灰小字 */}
          <SoftIn N={N} f0={T_CNT + 6}>
            <CText cx={300} cy={592} size={22} weight={500} color={GREY}>allocated ASNs, 2025</CText>
          </SoftIn>
        </div>
      </CameraRig>

      {/* SC03 地图缩微（屏幕空间承接，不随运镜） */}
      <MapMini cx={miniCx} cy={miniCy} w={miniW} h={miniH} opacity={miniOp} dotsOp={softOp(N - (T_MINI + 4), 8)} />
    </>
  );
};
