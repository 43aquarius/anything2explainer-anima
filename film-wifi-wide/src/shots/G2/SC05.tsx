import React from 'react';
import {useCurrentFrame} from 'remotion';
import {clamp01, easeOutCubic} from '../../common';
import {CameraRig, GlowBlob} from '../../fx';
import {
  CText, GREY, GREY_LIGHT, PURPLE_LIGHT, abs, SoftIn, softOp, firstOp, exitOp, glowOffK, scaleIn,
} from '../../ui';
import {EX, EarGlyph, DeviceGlyph, AirPulse, BackoffRing} from './g2ui';

/**
 * SC05 随机等待 · N 780–1061（S08–S10）
 *   S08：788「If the air is busy,」/ 827「it stays quiet and waits.」
 *   S09：892「When it finally talks,」/ 932「it waits a random extra beat —」
 *   S10：998「just in case someone else」/ 1028「had the same idea.」
 * 版式：左 = 共享空域（两台别人的灰色设备连发灰弧，"别人在说"）+ 我们的笔记本灰化静默（耳图标亮）；
 *   右 = BackoffRing 随机暂停环（主角，r118 + 环心骰子 2–5 随机翻点 + 走完白闪）；
 *   998 幻影设备（半透明复本）同帧也想开口 → 各退半步 → 真身延迟半拍开口紫弧。
 * 节拍（尾部硬规则：末拍 1010 ≤ TO−45=1016 ✓——分镜表 1028 的"各退半步+开口"整簇前挂 ~26f，
 *   词窗 −6 内保住 998 幻影/`same idea`，1028 的退让动作属同簇连戏，记录于 BUILD_NOTES）：
 *   782 左簇 firstOp；788 灰弧连发（A 788 / B 794，4 波 × 46f 循环）+ 设备压灰 + 耳亮 + `busy`；
 *   827 `waiting`；892 环缩入 14f；898 环走 34f（=932 走完）；932 白闪 + 骰点翻 3 次（3→5→4）+ `random`；
 *   998 幻影缩入 10f + 短紫弧"也想开口" + `same idea`；1002 真身退半步 6f；1008 幻影退半步 6f；
 *   1010 真身开口紫弧（amp 8f 爬坡后低幅循环）+ 灭耳。
 * 运镜：932→965 推近 1→1.12 向 BackoffRing（末 key 965 ≤ TO−50=1011 ✓）。停留：段内不判（S10 末块 31）。
 * glitch：零。文本取自事实清单 SC05 行：busy / waiting / random / same idea + EX.laptop。
 */
const F0 = 780;
const TO = 1061;
const T_SET = 782, T_ARCS_A = 788, T_BUSY = 789, T_WAIT = 827;
const T_RING = 892, T_WALK = 898, T_FLASH = 932, T_RANDOM = 934;
const T_PHANTOM = 998, T_SAMEIDEA = 1000, T_RET_R = 1002, T_RET_P = 1008, T_SPEAK = 1010;

// 左簇（共享空域 + 我们的设备）
const OTHERS = [
  {kind: 'phone' as const, cx: 310, cy: 318, w: 62, f0: T_ARCS_A},   // 别人 1（手机）
  {kind: 'tv' as const, cx: 570, cy: 315, w: 150, f0: T_ARCS_A + 6},  // 别人 2（电视）
];
const LAPTOP = {cx: 400, cy: 505, w: 225};  // 我们的笔记本（cy−h/2=441 顶）
const EAR = {cx: 400, cy: 422, s: 34};
const RING = {cx: 880, cy: 325, r: 118};
const PHANTOM = {cx: 570, cy: 470, w: 190};

export const SC05: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const exit = exitOp(N, TO, 5);
  const gk = glowOffK(N, TO, 3, 5);

  // 我们的设备：788 压灰（别人在说，闭嘴），1014 开口时回亮
  const dimK = 0.55 * clamp01((N - T_ARCS_A) / 8) - 0.4 * clamp01((N - T_SPEAK) / 8);
  // 耳图标：788 亮起（在听），开口时熄
  const earLit = clamp01((N - T_ARCS_A) / 8) * (1 - clamp01((N - T_SPEAK) / 6));

  // 环：缩入 + 走完 + 白闪 + 骰点翻三次（3→5→4）
  const ringS = 0.84 + 0.16 * scaleIn(N - T_RING, 14);
  const walkP = clamp01((N - T_WALK) / 34);
  const flash = N >= T_FLASH && N < T_FLASH + 7 ? Math.sin((Math.PI * (N - T_FLASH)) / 7) : 0;
  const dieVal = N >= T_FLASH + 8 ? 4 : N >= T_FLASH + 4 ? 5 : 3;
  const pipGlow = N >= T_FLASH && N < T_FLASH + 12 ? (Math.floor(N / 2) % 2 ? 1 : 0.7) : 0.9;

  // 幻影也想开口（998–1014 的短紫弧脉冲，随后收回）
  const stubAmp = N < T_PHANTOM || N > T_RET_P + 10 ? 0 : 0.55 * clamp01((N - T_PHANTOM) / 6) * (1 - clamp01((N - (T_RET_P + 2)) / 8));
  // 各退半步（6f，错开）
  const retR = -16 * easeOutCubic(clamp01((N - T_RET_R) / 6));
  const retP = 18 * easeOutCubic(clamp01((N - T_RET_P) / 6));
  // 开口紫弧：amp 爬坡 8f 后低幅循环（持续动作）
  const speakAmp = N < T_SPEAK ? 0 : 0.85 * clamp01((N - T_SPEAK) / 8);

  return (
    <CameraRig N={N} keys={[
      {f: F0, x: 640, y: 360, s: 1},
      {f: T_FLASH, x: 640, y: 360, s: 1},
      {f: 965, x: 800, y: 350, s: 1.12},
    ]}>
      <div style={{...abs(0, 0, 1280, 720), opacity: exit}}>
        {/* 左：别人的灰色设备 + 连发灰弧（"空域已被占满"） */}
        {OTHERS.map((o, i) => (
          <div key={i} style={{...abs(0, 0, 1280, 720), opacity: firstOp(N - T_SET, 8)}}>
            <div style={{...abs(0, 0, 1280, 720), transform: `scale(${(0.92 + 0.08 * scaleIn(N - T_SET - i * 2, 12)).toFixed(4)})`, transformOrigin: `${o.cx}px ${o.cy}px`}}>
              <DeviceGlyph cx={o.cx} cy={o.cy} w={o.w} kind={o.kind} dim={0.62} />
            </div>
            <AirPulse cx={o.cx} cy={o.cy - (o.kind === 'phone' ? 57 : 48)} N={N} f0={o.f0}
              waves={4} r0={24} r1={116} period={46} spread={104} rotate={0}
              color={GREY} sw={2.4} amp={0.8} />
          </div>
        ))}
        <SoftIn N={N} f0={T_BUSY} style={{opacity: exit}}>
          <CText cx={440} cy={198} size={26} weight={600} color={GREY} opacity={N >= T_WAIT ? 0.75 : 1}>busy</CText>
        </SoftIn>

        {/* 左下：我们的笔记本（静默 = 耳亮；retreat 随组平移；1014 开口紫弧） */}
        <div style={{...abs(0, 0, 1280, 720), opacity: firstOp(N - T_SET, 8), transform: `translateX(${retR.toFixed(1)}px)`}}>
          <DeviceGlyph cx={LAPTOP.cx} cy={LAPTOP.cy} w={LAPTOP.w} kind="laptop" dim={dimK} glow={N >= T_SPEAK && N < TO - 8} />
          <EarGlyph cx={EAR.cx} cy={EAR.cy} s={EAR.s} p={1} lit={earLit} glow opacity={0.95} />
          <div style={{...abs(0, 0, 1280, 720)}}>
            <CText cx={LAPTOP.cx} cy={590} size={22} weight={600} color={GREY_LIGHT} opacity={softOp(N - T_SET - 6, 8)}>{EX.laptop}</CText>
          </div>
          {speakAmp > 0.02 ? (
            <AirPulse cx={LAPTOP.cx} cy={LAPTOP.cy - 66} N={N} f0={T_SPEAK}
              waves={3} r0={26} r1={112} period={42} spread={88} rotate={0}
              color={PURPLE_LIGHT} sw={3} amp={speakAmp} glow />
          ) : null}
        </div>
        <SoftIn N={N} f0={T_WAIT} style={{opacity: exit}}>
          <CText cx={LAPTOP.cx} cy={372} size={26} weight={600} color={GREY}>waiting</CText>
        </SoftIn>

        {/* 右：BackoffRing 随机暂停环（主角） */}
        <GlowBlob cx={RING.cx} cy={RING.cy} r={175} N={N} k={softOp(N - T_RING, 10) * gk} />
        <div style={{...abs(0, 0, 1280, 720), opacity: N < T_RING ? 0 : softOp(N - T_RING, 8)}}>
          <div style={{...abs(0, 0, 1280, 720), transform: `scale(${ringS.toFixed(4)})`, transformOrigin: `${RING.cx}px ${RING.cy}px`}}>
            <BackoffRing cx={RING.cx} cy={RING.cy} r={RING.r} p={walkP} pips={dieVal} pipGlow={pipGlow} flash={flash * gk} opacity={gk} />
          </div>
        </div>
        <SoftIn N={N} f0={T_RANDOM} style={{opacity: exit}}>
          <CText cx={RING.cx} cy={486} size={26} weight={600} color={GREY}>random</CText>
        </SoftIn>

        {/* 幻影设备（半透明复本，同帧也想开口 → 各退半步"都让了"） */}
        {N >= T_PHANTOM ? (
          <div style={{...abs(0, 0, 1280, 720), opacity: 0.55 * softOp(N - T_PHANTOM, 8), transform: `translateX(${retP.toFixed(1)}px)`}}>
            <div style={{...abs(0, 0, 1280, 720), transform: `scale(${(0.82 + 0.18 * scaleIn(N - T_PHANTOM, 10)).toFixed(4)})`, transformOrigin: `${PHANTOM.cx}px ${PHANTOM.cy}px`}}>
              <DeviceGlyph cx={PHANTOM.cx} cy={PHANTOM.cy} w={PHANTOM.w} kind="laptop" dim={0.3} />
            </div>
            {stubAmp > 0.02 ? (
              <AirPulse cx={PHANTOM.cx} cy={PHANTOM.cy - 54} N={N} f0={T_PHANTOM}
                waves={2} r0={18} r1={54} period={26} spread={76} rotate={0}
                color={PURPLE_LIGHT} sw={2.2} amp={stubAmp * 0.6} />
            ) : null}
          </div>
        ) : null}
        <SoftIn N={N} f0={T_SAMEIDEA} style={{opacity: exit}}>
          <CText cx={PHANTOM.cx} cy={572} size={22} weight={600} color={GREY}>same idea</CText>
        </SoftIn>
      </div>
    </CameraRig>
  );
};
