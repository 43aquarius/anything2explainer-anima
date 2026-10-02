import React from 'react';
import {useCurrentFrame} from 'remotion';
import {clamp01, easeInOutPow, emphasisPulse, FONT_ORB} from '../../common';
import {CameraRig, HeroGlow, BigNumber, countTo, GlowBlob} from '../../fx';
import {Box, Pill, ClusterGrid, CText, MonoText, SoftIn, EXAMPLE, BLOOM, GREY, GREY_LIGHT, GREY_MID, PURPLE, PURPLE_LIGHT, WHITE, abs, softOp, firstOp, exitOp, glowOffK} from '../../ui';

/**
 * SC04 信封解剖与两千个信封 · N 624–949（S05 632–795 + S06 806–927 ¶）
 * 版式：左侧一枚放大的信封解剖（x100–560 y200–520，白描边 3px + 顶部封盖折线）：
 *       上带 header（紫边带 + 紫 Pill 标签 + 内 `to: 203.0.113.10` 等宽打字机）+ `about 1,500 bytes` 注；
 *       下带 payload（白边带 + 白 Pill 标签 + 3 条灰线 + 点阵逐格点亮）；
 *       右侧 (870,360) `2,000+` BigNumber Orbitron 110px 白 + 紫硬投影 + GlowBlob 主角柔光（30 帧呼吸，
 *       composition-and-light §2「光要动」），下方灰小字 `envelopes for one 3 MB photo`。
 * 节拍：632 大信封承接 SC03 流动信封（自 (860,360) kf 18 帧位移放大，SC03 已按 ¶ 归零，此为语境重入）；
 *       652 起标签与字段逐项 SoftIn（2 帧错峰）；690 起点阵逐格点亮（每格 4 帧，40 格 → 846 完成）；
 *       749 `to:` 地址打字机（每 2 帧 1 字 → 781）；806 右侧 20 帧计数 0→2,000（落定变 `2,000+`）+ 脉冲；
 *       830 数字下方小字 SoftIn。
 * 运镜：806 起 33 帧 1→1.12 居中推近（分镜表「推近 1.13」微调为 1.12 居中，保证信封与数字都不出画）。
 * 区间：S06 虽标 ¶ 但为章内段末，不用「末句 to+2」，延至 SC05.from−1=949（resume 修复：原 929–949 为 20 帧空场）。
 * 离场：末 8 帧归零（942–949；数字 GlowBlob 935–941 先灭光）。停留：脉冲结束 848 → 离场 942，≈93 帧 ✓
 *       （S06 末块 53 + 段末 gap， storyboard 原算式同步 +20 帧）。
 */
const F0 = 624;
const TO = 949;

const T_FLY = 632, T_BAND = 652, T_GRID = 690, T_TO = 749, T_NUM = 806, T_UNIT = 830, T_PULSE2 = 880;
const ENV = {x: 100, y: 200, w: 460, h: 320};

export const SC04: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const exOp = exitOp(N, TO, 8);

  // 大信封承接飞行：(860,360) → (330,360)，0.2× → 1×（18 帧）
  const fn = N - T_FLY;
  const fe = easeInOutPow(2.5)(clamp01(fn / 18));
  const dx = (860 - 330) * (1 - fe);
  const fs = 0.2 + 0.8 * fe;

  // 信封紫柔光：落位后亮起，数字登场（806）后 8 帧熄灭（重点转移）
  const envGlow = softOp(N - 650, 8) * (1 - clamp01((N - T_NUM) / 8));

  // 地址打字机
  const addr = EXAMPLE.to.slice(0, Math.max(0, Math.floor((N - T_TO) / 2)));
  const caret = N >= T_TO && N < T_TO + 40 && Math.floor((N - T_TO) / 8) % 2 === 0 ? '▌' : '';

  // 右侧数字：计数落定脉冲（826）+ 二次强调脉冲 880（S06 第二块「more than two thousand envelopes.」句中落点；
  // 峰值 1.04、20 帧短脉冲——兼把区间延长后的最长静止压在 3 s 线内，且末拍稳定期保 ≥30 帧）
  const numN = N - T_NUM;
  const numVal = numN < 0 ? null : numN < 20 ? countTo(numN, 0, 2000, 20) : EXAMPLE.envelopes;
  const numS = 1 + (emphasisPulse(N - (T_NUM + 20), {peak: 1.05, up: 8, hold: 4, down: 10}) - 1) + (emphasisPulse(N - T_PULSE2, {peak: 1.04, up: 7, hold: 3, down: 10}) - 1);

  // 点阵
  const lit = N < T_GRID ? 0 : Math.min(40, 1 + Math.floor((N - T_GRID) / 4));

  return (
    <CameraRig N={N} keys={[{f: F0, x: 640, y: 360, s: 1}, {f: T_NUM, x: 640, y: 360, s: 1}, {f: T_NUM + 33, x: 640, y: 360, s: 1.12}]}>
      <div style={{position: 'absolute', inset: 0, opacity: exOp}}>
        {/* 大信封（承接飞行 → 解剖） */}
        <div style={{position: 'absolute', inset: 0, opacity: firstOp(fn, 5), transform: `translate(${dx.toFixed(1)}px, 0px) scale(${fs.toFixed(4)})`, transformOrigin: '330px 360px'}}>
          {envGlow > 0.01 ? <HeroGlow x={ENV.x} y={ENV.y} w={ENV.w} h={ENV.h} r={12} N={N} k={envGlow} /> : null}
          <svg width={ENV.w} height={ENV.h} viewBox={`0 0 ${ENV.w} ${ENV.h}`} style={{...abs(ENV.x, ENV.y), filter: BLOOM}}>
            <rect x={1.5} y={1.5} width={ENV.w - 3} height={ENV.h - 3} fill="#000" stroke={WHITE} strokeWidth={3} />
            <path d={`M1.5,1.5 L${ENV.w / 2},68 L${ENV.w - 1.5},1.5`} fill="none" stroke={WHITE} strokeWidth={3} strokeLinejoin="round" />
          </svg>

          {/* header 带 + 标签 */}
          <SoftIn N={N} f0={T_BAND + 2}>
            <Box x={140} y={285} w={380} h={62} r={8} stroke={PURPLE_LIGHT} sw={2.5} fill="rgba(102,48,248,0.10)" />
          </SoftIn>
          <SoftIn N={N} f0={T_BAND}>
            <Pill x={152} y={271} w={104} h={34} fill={PURPLE} sw={2} text="header" fontSize={22} weight={700} letterSpacing={1} />
          </SoftIn>
          {/* 地址打字机 */}
          {N >= T_TO ? (
            <MonoText x={170} y={312} size={24} color={WHITE}>{addr}{caret}</MonoText>
          ) : null}
          {/* about 1,500 bytes 注 */}
          <SoftIn N={N} f0={T_BAND + 10}>
            <CText cx={330} cy={370} size={22} weight={600} color={GREY}>about 1,500 bytes</CText>
          </SoftIn>

          {/* payload 带 + 标签 */}
          <SoftIn N={N} f0={T_BAND + 4}>
            <Box x={140} y={390} w={380} h={112} r={8} stroke={WHITE} sw={2.5} />
          </SoftIn>
          <SoftIn N={N} f0={T_BAND + 2}>
            <Pill x={152} y={376} w={120} h={32} fill="#000" stroke={WHITE} sw={2} text="payload" fontSize={22} weight={700} letterSpacing={1} />
          </SoftIn>
          <SoftIn N={N} f0={T_BAND + 8}>
            <div style={{...abs(162, 408, 310, 4), background: GREY_MID}} />
          </SoftIn>
          <SoftIn N={N} f0={T_BAND + 10}>
            <div style={{...abs(162, 426, 244, 4), background: GREY_MID}} />
          </SoftIn>
          {/* payload 点阵（逐格点亮，持续动作） */}
          {lit > 0 ? <ClusterGrid x={162} y={446} cols={20} rows={2} cell={12} gap={5} lit={lit} accent={WHITE} color={GREY_MID} /> : null}
        </div>

        {/* 右侧：2,000+ 计数（主角柔光 GlowBlob 呼吸 + 离场前 6 帧先灭光） */}
        <GlowBlob cx={870} cy={360} r={148} N={N} k={numVal === null ? 0 : softOp(numN, 8) * glowOffK(N, TO, 6, 8)} />
        {numVal !== null ? (
          <div style={{position: 'absolute', inset: 0, opacity: softOp(numN, 4), transform: `scale(${numS.toFixed(4)})`, transformOrigin: '870px 360px'}}>
            <BigNumber cx={870} cy={360} value={numVal} size={110} />
          </div>
        ) : null}
        <SoftIn N={N} f0={T_UNIT}>
          <CText cx={870} cy={440} size={24} weight={600} color={GREY}>envelopes for one {EXAMPLE.photoMb} photo</CText>
        </SoftIn>
      </div>
    </CameraRig>
  );
};
