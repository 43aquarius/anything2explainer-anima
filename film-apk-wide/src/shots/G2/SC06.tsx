import React from 'react';
import {useCurrentFrame} from 'remotion';
import {clamp01, GlitchIn, emphasisPulse, rnd, FONT_WIDE} from '../../common';
import {CText, ParcelIcon, PhoneMock, WHITE, PURPLE_LIGHT, GREY, firstOp, scaleIn, exitOp, glowOffK, SoftIn, abs} from '../../ui';

/**
 * SC06 地球都是 zip · N 871–993（S06 879–971 ¶：879 地球上每个安卓 app / 917 都是 ZIP 压缩包）
 * 清场重开（G1 SC05 末 8 帧已归零）。中央两行大字：`Every Android app`（Noto 900 56px 白）+
 * `is a ZIP archive`（Audiowide 96px 白+紫描边，GlitchIn rgbSplit 6 = 本镜唯一 glitch，白名单 SC06）+
 * emphasisPulse + 紫描边光晕 30 帧呼吸（持续）；六枚小包裹（左右各三，对角斜排避开两行大字，
 * 见 BUILD_NOTES 偏离 1）2 帧错峰缩放入场；917 后六枚同时 1.05 微脉冲一轮（「每一个」）；
 * 之后每 40 帧随机一枚 wink 白闪（持续动作，弱）。顶部 PhoneMock 缩微 0.29×（1 格紫点亮）。
 * 停留：大字落位 917+12=929 → 离场 985，56 帧 ✓。末 8 帧归零（紫晕先灭 6 帧）。
 */
const F0 = 871;
const TO = 993;
const T_L1 = 879; // 第一行 SoftIn（S06.c1）
const T_L2 = 917; // 第二行 GlitchIn（S06.c2「ships as a ZIP archive.」）
const T_PULSE = 929; // emphasisPulse（glitch 模板 929 满态）
const T_PARCEL = 875; // 六枚包裹 2 帧错峰（879 的 −4，避免镜首空场）

/** 左右各三枚对角斜排（上带 / 中带齐 line1 侧翼 / 下带），避开两行大字的包围盒 */
const PARCELS: Array<[number, number]> = [
  [172, 228], [248, 322], [172, 548],
  [1108, 228], [1032, 322], [1108, 548],
];
const PW = 84, PH = 58;

export const SC06: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const exOp = exitOp(N, TO, 8);
  const glowK = glowOffK(N, TO, 6);
  if (exOp <= 0) return null;

  // 第二行：glitch 入场 + 脉冲 + 紫描边光晕呼吸（持续）
  const pulse = emphasisPulse(N - T_PULSE, {peak: 1.11, up: 6, hold: 2, down: 8}); // 16 帧（默认 30 帧会吃到 957，压掉段末稳定期）
  const bconv = 1 - clamp01((N - 948) / 7); // 948 后 7 帧呼吸幅度归零（末拍 929 落位后保 ≥30f 稳定期；BUILD_RULES §4：找不到动词动作就让它静着）
  const breathe = 0.7 + 0.3 * bconv * Math.sin((2 * Math.PI * (N - T_L2)) / 30);

  // 包裹群：2 帧错峰缩放入场 → 921 起同步 1.05 微脉冲一轮 → 每 40 帧随机一枚 wink
  const grpPulse = emphasisPulse(N - (T_L2 + 4), {peak: 1.05, up: 12, hold: 4, down: 12});
  const winkSlot = Math.floor(N / 40);
  const winkIdx = Math.floor(rnd(61, winkSlot) * PARCELS.length);

  return (
    <div style={{position: 'absolute', inset: 0, opacity: exOp}}>
      {/* 顶部缩微手机（0.29×，1 格紫点亮 = 刚到的 ChatApp；「on Earth」的承载物） */}
      <SoftIn N={N} f0={873}>
        <div style={{...abs(605, 142, 70, 139)}}>
          <div style={{position: 'absolute', left: 0, top: 0, width: 240, height: 480, transform: 'scale(0.29)', transformOrigin: '0 0'}}>
            <PhoneMock x={0} y={0} w={240} h={480} litN={1} iconN={12} />
          </div>
        </div>
      </SoftIn>

      {/* 第一行 */}
      <SoftIn N={N} f0={T_L1}>
        <CText cx={640} cy={322} size={56} weight={900} color={WHITE} letterSpacing={1}>
          Every Android app
        </CText>
      </SoftIn>

      {/* 六枚小包裹（到处都是 zip；对角斜排） */}
      {PARCELS.map(([px, py], i) => {
        const pn = N - (T_PARCEL + 2 * i);
        if (pn < 0) return null;
        const s = 0.4 + 0.6 * scaleIn(pn, 21);
        const op = clamp01(pn / 6);
        const wink = i === winkIdx && N % 40 < 7 && N < 948 ? 1 + 0.9 * (1 - Math.abs((N % 40) - 3) / 3) : 1; // 948 后停闪：末拍 929 落位后留 ≥30f 稳定期（紫晕呼吸持续）
        return (
          <div key={i} style={{...abs(px - (PW * s) / 2, py - (PH * s) / 2, PW * s, PH * s), opacity: op, transform: `scale(${(grpPulse).toFixed(4)})`, transformOrigin: '50% 50%', filter: wink > 1 ? `brightness(${wink.toFixed(2)})` : undefined}}>
            <ParcelIcon cx={(PW * s) / 2} cy={(PH * s) / 2} w={PW} h={PH} scale={s} label="" />
          </div>
        );
      })}

      {/* 第二行（主角大字，本镜唯一 glitch） */}
      <GlitchIn N={N} f0={T_L2} rgbSplit={6} seed={16}>
        <CText
          cx={640}
          cy={424}
          size={96}
          weight={400}
          family={FONT_WIDE}
          letterSpacing={4}
          color={WHITE}
          style={{
            transform: `translate(-50%,-50%) scale(${pulse.toFixed(4)})`,
            WebkitTextStroke: `3.5px ${PURPLE_LIGHT}`,
            paintOrder: 'stroke fill',
            textShadow: `0 0 ${Math.round(16 + 12 * breathe)}px rgba(161,117,241,${(0.5 + 0.32 * breathe) * glowK + 0.02}), 0 0 4px rgba(161,117,241,${0.5 * glowK})`,
          }}
        >
          is a ZIP archive
        </CText>
      </GlitchIn>
    </div>
  );
};
