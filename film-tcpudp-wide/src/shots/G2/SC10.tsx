import React from 'react';
import {useCurrentFrame} from 'remotion';
import {GlitchIn, emphasisPulse, clamp01, easeOutQuad, FONT_MONO, FONT_WIDE} from '../../common';
import {
  CText, SoftIn, PacketIcon, PostcardIcon, abs, exitOp, glowOffK, exitAccel, fadeIn, WHITE, GREY, GREY_MID, GREY_LIGHT, PURPLE, PURPLE_DEEP,
} from '../../ui';
import {LightSweep, StageLine, GhostText, ghostOpacity} from '../../fx';

/**
 * SC10 两个承诺 · N 1890–2146（S15 1898–1974 + S16 1985–2068 + S17 2079–2144，¶+章末，进 C2 章节卡）
 * 章 1 高光时刻·登场型（扫光白名单①；本镜唯一 glitch = `TWO`，rgbSplit 8）。
 * 版式：清场 → 中央 `TWO`（Audiowide 130px 白+紫描边+紫硬投影）(640,315)；下一行 `promises`（Noto 900 56px 灰白）(640,425)；
 *       两侧虚线空卡 300×200（左 TCP (300,350)、右 UDP (980,350)，字 30% 透明度灰虚描边"还没登场"）；
 *       卡下小字 `never loses` / `never waits`（灰 22px 低透明度，y 478）；
 *       大字下方一枚信封 + 一枚明信片小图标自左右两侧 1.8px/帧缓缓滑来（持续动作）。
 * 标准登场编排（SET_PIECE）：1894/1912/1930 三轮紫光横扫（LightSweep，每轮 3 条 16 帧）；
 *       1908 StageLine 展宽呼吸（cy 316）；1927 GhostText `TWO` 白描边轮廓 10% 隐现；
 *       1985（=S16 节拍）光线白闪 3 帧 + `TWO` GlitchIn（rgbSplit 8 / slices 20）+ 1997 emphasisPulse 1.11；
 *       2028 两枚虚线卡自两侧滑入（Δ180，18 帧）；2050 卡下小字 SoftIn；
 *       2079（=S17 节拍）卡内 TCP/UDP 从虚描边变半亮（12 帧）+ `promises` SoftIn + 信封/明信片缓行开始；
 *       2137–2146 末 10 帧整组归零（先灭光）。
 * 停留：末元素（TCP/UDP 半亮）落位 2091 → 离场 2137，≥45 ✓（S17 末块 42+gap15）。
 * 主角：`TWO` 大字 130px（≥96 ✓）+ 双虚线卡组；光 = 白闪 + 紫硬投影（登场唯一大面积光）。
 */
const F0 = 1890;
const TO = 2146;
const SWEEPS = [1894, 1912, 1930];
const T_LINE = 1908, T_GHOST = 1927, T_BIG = 1985, T_PULSE = 1997;
const T_CARD = 2028, T_SMALL = 2050, T_LIT = 2079;

const CARDS = [
  {cx: 300, label: 'TCP', sub: 'never loses', dir: -1},
  {cx: 980, label: 'UDP', sub: 'never waits', dir: 1},
];

export const SC10: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const exN = N - (TO - 10);
  const exOp = exitOp(N, TO, 10);
  const exDy = exitAccel(exN, 0.05);

  const gk = glowOffK(N, TO, 6, 10);
  const glowA = 0.5 * (1 + 0.15 * Math.sin((2 * Math.PI * N) / 30)) * gk;
  const pulse = emphasisPulse(N - T_PULSE, {peak: 1.11});

  // 虚线卡滑入（Δ180，18 帧）
  const cardN = N - T_CARD;
  const slide = 180 * (1 - easeOutQuad(clamp01(cardN / 18)));
  // TCP/UDP 字：30% 透明度灰虚描边 → 半亮（12 帧）
  const lit = clamp01((N - T_LIT) / 12);
  // 信封 / 明信片缓行（1.8px/帧，2079 起）
  const iconN = N - T_LIT;

  return (
    <div style={{position: 'absolute', inset: 0, opacity: exOp, transform: exDy ? `translateY(${exDy.toFixed(1)}px)` : undefined}}>
      {/* 三轮紫光横扫（扫光白名单①） */}
      <LightSweep N={N} rounds={SWEEPS} />
      {/* 中央舞台光线：展宽 → 呼吸 → 1985 白闪 3 帧后消失 */}
      <StageLine N={N} f0={T_LINE} flashAt={T_BIG} cx={640} cy={316} w={720} />
      {/* `TWO` 白描边轮廓 10% 隐现（预示，脉冲起撤掉） */}
      <GhostText cx={640} cy={315} size={130} family={FONT_WIDE} letterSpacing={8} dy={-4} opacity={ghostOpacity(N, T_GHOST, T_PULSE)}>
        TWO
      </GhostText>
      {/* 主角大字：GlitchIn（本镜唯一 glitch，rgbSplit 8）+ 脉冲 + 紫描边/紫硬投影 */}
      <div style={{position: 'absolute', inset: 0, transformOrigin: '640px 315px', transform: pulse === 1 ? undefined : `scale(${pulse.toFixed(4)})`}}>
        <GlitchIn N={N} f0={T_BIG} rgbSplit={8} slices={20} sliceBands={4} seed={8}>
          <CText cx={640} cy={315} size={130} weight={400} family={FONT_WIDE} letterSpacing={8} color={WHITE} dy={-4}
            shadow={`6px 6px 0 ${PURPLE_DEEP}, 0 0 30px rgba(102,48,248,${Math.max(0, glowA).toFixed(3)})`}
            style={{WebkitTextStroke: `2.5px ${PURPLE}`, paintOrder: 'stroke fill'}}>
            TWO
          </CText>
        </GlitchIn>
      </div>
      {/* 下一行 `promises`（灰白，随 S17 出现） */}
      <SoftIn N={N} f0={T_LIT}>
        <CText cx={640} cy={425} size={56} weight={900} letterSpacing={2} color={GREY_LIGHT}>promises</CText>
      </SoftIn>
      {/* 两侧虚线空卡 + 卡内字 + 卡下小字 */}
      {CARDS.map((c, i) => {
        if (cardN < 0) return null;
        const x = c.cx - 150 + c.dir * slide;
        const op = fadeIn(cardN, 6);
        return (
          <div key={c.label} style={{position: 'absolute', inset: 0, opacity: op}}>
            <div style={{...abs(x, 250, 300, 200), border: `2.5px dashed ${GREY_MID}`, borderRadius: 14, background: 'rgba(0,0,0,.35)'}} />
            <CText cx={x + 150} cy={350} size={62} weight={400} family={FONT_WIDE} letterSpacing={4} dy={-2}
              color={`rgba(255,255,255,${(0.28 + 0.52 * lit).toFixed(3)})`}
              style={{WebkitTextStroke: `2px rgba(160,160,160,${(0.4 + 0.5 * lit).toFixed(3)})`, paintOrder: 'stroke fill'}}>
              {c.label}
            </CText>
            <SoftIn N={N} f0={T_SMALL + 2 * i}>
              <CText cx={c.cx} cy={478} size={22} weight={500} family={FONT_MONO} color={GREY} style={{opacity: 0.65}}>{c.sub}</CText>
            </SoftIn>
          </div>
        );
      })}
      {/* 信封 + 明信片：自左右两侧向大字下方缓缓滑来（1.8px/帧，持续） */}
      {iconN >= 0 ? (
        <>
          <PacketIcon cx={430 + 1.8 * iconN} cy={490} w={64} h={44} opacity={fadeIn(iconN, 10)} />
          <PostcardIcon cx={850 - 1.8 * iconN} cy={490} w={88} h={58} opacity={fadeIn(iconN, 10)} />
        </>
      ) : null}
    </div>
  );
};
