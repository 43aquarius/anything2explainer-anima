import React from 'react';
import {useCurrentFrame} from 'remotion';
import {clamp01, powIn} from '../../common';
import {EXAMPLE, GREY_MID, WHITE, abs, exitOp, glowOffK, glowPurpleS, softOp, SoftIn} from '../../ui';
import {Antenna, GreyStamp, SignalWaves, SplitChipG8} from './g8ui';

/**
 * SC53 只下自己的 · N 7939–8055（S53 7947–8018：7947「Your phone downloads only its own pieces.」¶）
 * 三枚 SplitChip 横排（cx 320/640/960，cy 400）：`base.apk`（紫边亮 + 天线发波纹）/ `config.arm64_v8a.apk`（灰暗）/
 *   `config.xxhdpi.apk`（灰暗）+ 各自顶部小天线；7947 三枚 2 帧错峰 SoftIn；base 标签打字机（2f/字）+ 紫光保持（呼吸）；
 *   base 天线波纹 24f 周期循环（持续动作）；两枚灰暗芯片 7975/7989 起被灰删除线划过（10f wipe）+ 7985/7997 小灰章
 *   `not yours`（等宽 16px）stampIn 1.45→1.0（8f）。
 * 停留：末枚灰章落位 8005 → 离场 8047（TO−8），42f ≥30 ✓（¶）。末 8 帧归零（base 紫光先灭）。零 glitch。光：base 紫光。
 */
const F0 = 7939, TO = 8055;
const B1 = 7947;

const CHIP_Y = 400;
const CHIPS = [
  {cx: 320, label: EXAMPLE.splitBase, base: true},
  {cx: 640, label: EXAMPLE.splitAbi},
  {cx: 960, label: EXAMPLE.splitDpi},
];
const ANT_TOP = CHIP_Y - 66 - 40; // 天线顶端 y

const TYPE_T0 = 7955; // base 标签打字机
const WAVE_T0 = 7962; // base 天线波纹开始
const STRIKE_T = [7975, 7989]; // 灰删除线 wipe 起点（chip 1/2，即 arm64 / xxhdpi）
const STRIKE_LEN = 10;
const STAMP_T = [7985, 7997]; // 小灰章 stampIn 起点
const STAMP_LEN = 8;

/** stampIn 缩放：1.45 → 1.0（powIn 2） */
const stampScale = (N: number, t0: number, len: number) => (N < t0 ? 0 : 1 + 0.45 * (1 - powIn(2)(clamp01((N - t0) / len))));

export const SC53: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const exOp = exitOp(N, TO, 8);
  if (exOp <= 0) return null;
  const glowK = glowOffK(N, TO, 6, 8);

  // base 标签打字机（'base.apk' 8 字符）
  const baseChars = Math.max(0, Math.floor((N - TYPE_T0) / 2));
  const baseLabel = EXAMPLE.splitBase.slice(0, Math.min(EXAMPLE.splitBase.length, baseChars));

  // base 紫光保持（呼吸）
  const baseGlow = (0.55 + 0.2 * Math.sin((2 * Math.PI * N) / 30)) * clamp01((N - (B1 + 10)) / 8) * glowK;

  return (
    <div style={{position: 'absolute', inset: 0, opacity: exOp}}>
      {CHIPS.map((c, i) => {
        const isBase = c.base === true;
        return (
          <SoftIn key={c.label} N={N} f0={B1 + i * 2}>
            {/* 顶部小天线 */}
            <Antenna cx={c.cx} yBase={CHIP_Y - 66} yTop={ANT_TOP} color={isBase ? WHITE : GREY_MID} opacity={softOp(N - (B1 + i * 2 + 4), 6)} />
            {/* 芯片卡 */}
            <SplitChipG8
              cx={c.cx}
              cy={CHIP_Y}
              label={isBase ? baseLabel : c.label}
              dim={!isBase}
              active={isBase}
              glow={isBase && baseGlow > 0.02 ? glowPurpleS(Number(baseGlow.toFixed(3))) : undefined}
            />
          </SoftIn>
        );
      })}

      {/* base 天线波纹（24f 周期循环，持续动作） */}
      {N >= WAVE_T0 ? <SignalWaves cx={640} cy={ANT_TOP - 2} N={N - WAVE_T0} period={24} opacity={exOp * glowK} /> : null}

      {/* 两枚灰暗芯片：灰删除线 + 小灰章 not yours */}
      {[1, 2].map((k) => {
        const chip = CHIPS[k];
        const sn = N - STRIKE_T[k - 1];
        if (sn < 0) return null;
        return (
          <React.Fragment key={`x${k}`}>
            <div
              style={{
                ...abs(chip.cx - 122, CHIP_Y - 20, 244, 3),
                background: GREY_MID,
                transformOrigin: '0% 50%',
                transform: `scaleX(${clamp01(sn / STRIKE_LEN).toFixed(3)})`,
                opacity: exOp,
              }}
            />
            <GreyStamp cx={chip.cx + 64} cy={CHIP_Y - 62} text={'not yours'} s={stampScale(N, STAMP_T[k - 1], STAMP_LEN)} opacity={softOp(N - STAMP_T[k - 1], 3) * exOp} />
          </React.Fragment>
        );
      })}
    </div>
  );
};

export default SC53;
