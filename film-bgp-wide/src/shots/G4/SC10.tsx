import React from 'react';
import {useCurrentFrame} from 'remotion';
import {clamp01, easeInOutPow, easeOutCubic, emphasisPulse, FONT_ORB, FONT_TECH} from '../../common';
import {CameraRig, HeroGlow} from '../../fx';
import {
  CText, CORAL, Cross, EXAMPLE, GREY, GREY_MID, ORANGE, PURPLE_LIGHT, WHITE,
  Pill, RouteNote, SoftIn, Svg, abs, mix, softOp, exitOp, glowOffK, scaleIn, slideUp,
} from '../../ui';
import {YearRoll, QuadArrow, quadPt} from './shared';

/**
 * SC10 2008 更具体者胜 · N 2255–2624（分镜表节拍 2263/2295/2363/2397/2442/2473/2557；2442 为分镜表未列、subs.ts 实测块界）。
 * S17–S19：2263「Two thousand eight:」/ 2295「Pakistan blocked YouTube at home.」/ 2363「The block leaked —」
 *   / 2397「and the world's YouTube traffic」/ 2442「went with it.」/ 2473「BGP trusts the more specific claim:」
 *   / 2557「name the exact address, and you win.」
 * 版式：左上 `2008`（Orbitron 72 灰）+ `Pakistan` Pill；中央对比台两张 RouteNote 并排
 *   （左 `208.65.152.0/22` 宽注灰 标 `broad claim`；右 `208.65.153.0/24` 窄注白→紫光 标 `more specific`）；
 *   两注下方各一条汇流箭头（左灰右紫）指向中下汇流点（2473 `longest match` 落此，2557 `you win` 再下）；
 *   右下世界简图（两块大陆轮廓）上 `YT` 大节点（灯亮→2397 闪橙警示）+ `PK` 小节点（2399 灯亮白）
 *   + 五条流量箭头原本汇向 YT，2397 起整群 kf 抛物线弯折（26 帧）折向 PK + `YouTube traffic` 灰标签跟着走。
 * 动效：2258 YearRoll + 2266 Pill；2295 世界 draw-on + YT 缩入灯亮 + PK 灰节点 + PK–YT 虚线 + 红叉（国内封锁）；
 *   2324 箭头群错峰 draw-on + 2357 流光点持续；2363 两注 2f 错峰 slideUp + 2385 左注先亮（白光一拍）
 *   + 2399 右注紫光盖过；2397 弯折（本镜关键动作戏）+ YT 闪橙 + PK 亮白；2442 PK 落地白闪圈；
 *   2473 `longest match` + 左箭头失亮/右箭头增益 + 右注 emphasisPulse；2557 `you win` + 右注第二次脉冲。
 * 运镜：2473–2506 33f 1→1.18 推向对比台（末拍 you win 落位 2565 → 离场 2617 → hold ≥30 ✓）。末 8 帧归零。
 * 零 glitch（折流是动作戏，白名单 SC10 无）。
 */
const F0 = 2255;
const TO = 2624;

const T_YEAR = 2258;  // 2008 YearRoll（块 2263 −5）
const T_PILL = 2266;  // Pakistan Pill
const T_WORLD = 2295; // 世界简图 draw-on
const T_YT = 2303;    // YT 节点缩入灯亮
const T_PK = 2308;    // PK 灰节点
const T_BL = 2308;    // PK–YT 封锁虚线
const T_BX = 2318;    // 封锁红叉
const T_TR = 2324;    // 流量箭头群 4f 错峰 draw-on
const T_YTL = 2330;   // `YouTube traffic` 灰标签
const T_DOTS = 2357;  // 流光点（持续）
const T_NOTE = 2363;  // 对比台两注 2f 错峰 slideUp（18f）
const T_LBL = 2367;   // 标签 broad claim / more specific
const T_JARR = 2371;  // 汇流箭头 14f draw-on
const T_LPULSE = 2385; // 左注先亮（白光一拍）
const T_BEND = 2397;  // ★ 整群折向 PK（26 帧 kf 抛物线弯折）
const T_YTF = 2397;   // YT 灯闪橙警示
const T_PKL = 2399;   // PK 灯亮白 + 右注紫光盖过
const T_FLASH = 2442; // PK 落地白闪圈（went with it）
const T_LM = 2473;    // longest match + 推近起点
const T_YW = 2557;   // you win
const T_PULSE2 = 2478; // 右注第二次脉冲（longest match 落位同拍；2557 you win 由 SoftIn 静收，保尾部稳定期）
const T_EXIT = TO - 8;

// ---- 几何 ----
const YEAR = {cx: 350, cy: 165};
const NOTE_L = {x: 360, y: 235, w: 240, h: 150};
const NOTE_R = {x: 675, y: 235, w: 240, h: 150};
const JUNC: [number, number] = [645, 470];
const YT: [number, number] = [865, 460];
const PK: [number, number] = [1135, 520];
const BLOCK_MID: [number, number] = [1000, 490];

/** 两块大陆轮廓（世界简图折线风格） */
const LANDS: string[] = [
  'M780,448 Q800,428 865,425 Q930,428 952,452 Q958,486 938,508 Q958,534 928,556 Q880,568 838,556 Q798,546 782,518 Q766,484 780,448 Z',
  'M1005,436 Q1050,414 1105,418 Q1168,428 1190,458 Q1196,492 1170,522 Q1130,552 1082,548 Q1032,540 1010,506 Q992,470 1005,436 Z',
];

/** 流量箭头群：固定起点 + 折前/折后控制点 + 甩鞭向量（sin(πe) 中途增势 → 抛物线整体弯折） */
const TRAFFIC: Array<{s: [number, number]; c0: [number, number]; c1: [number, number]; whip: [number, number]}> = [
  {s: [778, 432], c0: [792, 430], c1: [930, 428], whip: [0, -46]},
  {s: [772, 472], c0: [790, 476], c1: [936, 462], whip: [0, -52]},
  {s: [780, 512], c0: [798, 518], c1: [946, 500], whip: [0, -58]},
  {s: [800, 548], c0: [824, 534], c1: [960, 536], whip: [0, -54]},
  {s: [895, 405], c0: [878, 424], c1: [986, 448], whip: [0, -44]},
];

const EASE = easeOutCubic;
const EIO = easeInOutPow(2.2);
const EIO25 = easeInOutPow(2.5);

export const SC10: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const exit = exitOp(N, TO, 6); // 尾部稳定期：灭光/离场后移变陡，保 2566–2613 安静
  const gk = glowOffK(N, TO, 4, 6);

  // ---- 弯折进度（26 帧）----
  const bendE = EIO(clamp01((N - T_BEND) / 26));
  const whipK = Math.sin(Math.PI * bendE);
  const head: [number, number] = [mix(YT[0], PK[0], bendE), mix(YT[1], PK[1], bendE)];
  const ctrl = (i: number): [number, number] => [
    mix(TRAFFIC[i].c0[0], TRAFFIC[i].c1[0], bendE) + TRAFFIC[i].whip[0] * whipK,
    mix(TRAFFIC[i].c0[1], TRAFFIC[i].c1[1], bendE) + TRAFFIC[i].whip[1] * whipK,
  ];

  // ---- 世界 / 节点 ----
  const ytScale = 0.3 + 0.7 * scaleIn(N - T_YT, 12);
  const ytOrangeK = clamp01((N - T_YTF) / 6);
  const ytFlash = N >= T_YTF && N <= T_YTF + 14 ? ((N - T_YTF) % 7 < 4 ? 1 : 0.25) : 1;
  const pkLitK = clamp01((N - T_PKL) / 8);
  const blP = EASE(clamp01((N - T_BL) / 14));
  const bxP = clamp01((N - T_BX) / 12);
  const leakPulse = N >= T_NOTE && N <= T_NOTE + 10 ? 1 + 0.18 * Math.sin(Math.PI * ((N - T_NOTE) / 10)) : 1;

  // ---- 对比台 ----
  const noteIn = (i: number) => N - (T_NOTE + i * 2);
  const lPulse = emphasisPulse(N - T_LPULSE, {peak: 1.06});
  const lFlash = N >= T_LPULSE && N <= T_LPULSE + 10 ? Math.sin(Math.PI * ((N - T_LPULSE) / 10)) : 0;
  const rGlowK = softOp(N - T_PKL, 8) * gk;
  const rPulse1 = emphasisPulse(N - (T_PKL + 4), {peak: 1.07});
  const rPulse2 = emphasisPulse(N - T_PULSE2, {peak: 1.07});

  // ---- 汇流箭头 ----
  const jDimL = 1 - 0.6 * clamp01((N - T_LM) / 12); // 2473 左箭头失亮
  const jBoostR = 1 + 0.35 * clamp01((N - T_LM) / 12);

  // ---- 流光点（持续）----
  const dot = (i: number): [number, number] | null => {
    if (N < T_DOTS) return null;
    const u = (((N - T_DOTS) / 34) + i * 0.19) % 1;
    return quadPt(u, TRAFFIC[i].s, ctrl(i), head);
  };

  // ---- YouTube traffic 标签跟着走（弯折稍延迟跟随）----
  const labE = EIO25(clamp01((N - (T_BEND + 4)) / 26));
  const labX = mix(845, 1085, labE);
  const labY = mix(588, 585, labE);

  // PK 落地白闪圈
  const flashK = clamp01((N - T_FLASH) / 10);

  return (
    <CameraRig N={N} keys={[{f: F0, x: 640, y: 360, s: 1}, {f: T_LM, x: 640, y: 360, s: 1}, {f: T_LM + 33, x: 745, y: 370, s: 1.18}]}>
      <div style={{...abs(0, 0, 1280, 720), opacity: exit}}>
        {/* 左上：2008 + Pakistan */}
        <YearRoll N={N} f0={T_YEAR} cx={YEAR.cx} cy={YEAR.cy} size={96} from={2015} to={2008}
          shadow={`0 0 18px rgba(255,255,255,${(0.26 + 0.1 * Math.sin((2 * Math.PI * N) / 30)).toFixed(2)})`} />
        <div style={{...abs(0, 0, 1280, 720), opacity: softOp(N - T_PILL, 8)}}>
          <Pill x={265} y={224} w={170} h={46} r={23} fill="#000" stroke={WHITE} sw={2} text="Pakistan" fontSize={26} weight={700} letterSpacing={1} />
        </div>

        {/* 世界简图（两块大陆 draw-on） */}
        <svg width={1280} height={720} viewBox="0 0 1280 720" style={{...abs(0, 0), overflow: 'visible'}}>
          <defs>
            <clipPath id="g4-bl-clip">
              <rect x={YT[0]} y={YT[1] - 34} width={((PK[0] - YT[0]) * blP).toFixed(1)} height={68} />
            </clipPath>
          </defs>
          <g stroke={WHITE} strokeWidth={2.4} fill="rgba(0,0,0,.72)" strokeLinejoin="round" filter="drop-shadow(0 0 2px rgba(255,255,255,.35))">
            {LANDS.map((d, i) => {
              const p = EASE(clamp01((N - (T_WORLD + i * 6)) / 16));
              if (p <= 0) return null;
              return <path key={`land-${i}`} d={d} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - p} />;
            })}
          </g>
          {/* PK–YT 封锁虚线（clip 展开 draw-on：虚线不能用 dashoffset 动画） */}
          {blP > 0 ? (
            <g clipPath="url(#g4-bl-clip)">
              <line x1={YT[0]} y1={YT[1]} x2={PK[0]} y2={PK[1]} stroke={GREY_MID} strokeWidth={2} strokeDasharray="9 8" opacity={0.7} />
            </g>
          ) : null}
        </svg>

        {/* 封锁红叉（中点；泄漏节拍 2363 脉冲一次） */}
        {bxP > 0 ? (
          <div style={{...abs(0, 0, 1280, 720), transform: `scale(${leakPulse.toFixed(3)})`, transformOrigin: `${BLOCK_MID[0]}px ${BLOCK_MID[1]}px`}}>
            <Svg>
              <Cross cx={BLOCK_MID[0]} cy={BLOCK_MID[1]} size={38} sw={7} color={CORAL} p={bxP} opacity={gk} />
            </Svg>
          </div>
        ) : null}

        {/* 流量箭头群（draw-on → 整群折向 PK） */}
        <svg width={1280} height={720} viewBox="0 0 1280 720" style={{...abs(0, 0), overflow: 'visible'}}>
          <g filter="drop-shadow(0 0 3px rgba(255,255,255,.4))">
            {TRAFFIC.map((A, i) => {
              const p = EASE(clamp01((N - (T_TR + i * 4)) / 14));
              return <QuadArrow key={`tr-${i}`} p0={A.s} c={ctrl(i)} p1={head} p={p} color={WHITE} rodW={2.5} headL={13} headW={12} opacity={0.92} />;
            })}
          </g>
          {/* 流光点（持续） */}
          {TRAFFIC.map((_, i) => {
            const d = dot(i);
            if (!d) return null;
            return <circle key={`dot-${i}`} cx={d[0].toFixed(1)} cy={d[1].toFixed(1)} r={4} fill={WHITE} opacity={0.9} filter="drop-shadow(0 0 3px rgba(255,255,255,.6))" />;
          })}
          {/* PK 落地白闪圈（2442） */}
          {flashK > 0 && flashK < 1 ? (
            <circle cx={PK[0]} cy={PK[1]} r={(14 + 24 * flashK).toFixed(1)} fill="none" stroke={WHITE} strokeWidth={3} opacity={(0.8 * (1 - flashK)).toFixed(3)} />
          ) : null}
        </svg>

        {/* YT 大节点（灯亮 → 2397 闪橙警示） */}
        {N >= T_YT ? (
          <div style={{...abs(0, 0, 1280, 720), opacity: softOp(N - T_YT, 6), transform: `scale(${ytScale.toFixed(4)})`, transformOrigin: `${YT[0]}px ${YT[1]}px`}}>
            <svg width={1280} height={720} viewBox="0 0 1280 720" style={{...abs(0, 0), overflow: 'visible',
              filter: `drop-shadow(0 0 ${ytOrangeK > 0.02 ? 12 : 6}px rgba(${ytOrangeK > 0.02 ? '240,95,65' : '255,255,255'},${(0.55 * gk).toFixed(2)}))`}}>
              <circle cx={YT[0]} cy={YT[1]} r={18} fill="#000" stroke={WHITE} strokeWidth={3} />
              <circle cx={YT[0]} cy={YT[1]} r={8} fill={ytOrangeK > 0.5 ? ORANGE : PURPLE_LIGHT} opacity={ytFlash} />
            </svg>
            <CText cx={YT[0]} cy={YT[1] - 32} size={24} weight={700} family={FONT_ORB} color={WHITE} letterSpacing={1}>YT</CText>
          </div>
        ) : null}

        {/* PK 小节点（2399 灯亮白） */}
        {N >= T_PK ? (
          <div style={{...abs(0, 0, 1280, 720), opacity: softOp(N - T_PK, 6)}}>
            <svg width={1280} height={720} viewBox="0 0 1280 720" style={{...abs(0, 0), overflow: 'visible',
              filter: `drop-shadow(0 0 ${(4 + 8 * pkLitK).toFixed(1)}px rgba(255,255,255,${(0.25 + 0.4 * pkLitK).toFixed(2)}))`}}>
              <circle cx={PK[0]} cy={PK[1]} r={11} fill="#000" stroke={pkLitK > 0.5 ? WHITE : GREY_MID} strokeWidth={2.5} />
              <circle cx={PK[0]} cy={PK[1]} r={4.5} fill={pkLitK > 0.5 ? WHITE : GREY_MID} opacity={0.35 + 0.65 * pkLitK} />
            </svg>
            <CText cx={PK[0] + 28} cy={PK[1]} size={22} weight={700} family={FONT_ORB} color={pkLitK > 0.5 ? WHITE : GREY} letterSpacing={1}>PK</CText>
          </div>
        ) : null}

        {/* YouTube traffic 灰标签（跟着走） */}
        <div style={{...abs(0, 0, 1280, 720), opacity: softOp(N - T_YTL, 8)}}>
          <CText cx={labX} cy={labY} size={22} weight={500} color={GREY} style={{textShadow: '0 0 4px rgba(0,0,0,.9), 0 2px 6px rgba(0,0,0,.9)'}}>YouTube traffic</CText>
        </div>

        {/* ---- 中央对比台 ---- */}
        {/* 左注（宽注灰）：broad claim */}
        {(() => {
          const n = noteIn(0);
          if (n < 0) return null;
          return (
            <div style={{...abs(0, 0, 1280, 720), opacity: softOp(n, 6), transform: `translateY(${slideUp(n, 60, 18).toFixed(1)}px) scale(${lPulse.toFixed(4)})`, transformOrigin: '480px 310px',
              filter: lFlash > 0.02 ? `drop-shadow(0 0 ${Math.round(18 * lFlash)}px rgba(255,255,255,${(0.55 * lFlash).toFixed(2)}))` : undefined}}>
              <RouteNote x={NOTE_L.x} y={NOTE_L.y} w={NOTE_L.w} h={NOTE_L.h} prefix="" dim>
                <div style={{position: 'absolute', left: 18, top: 42, fontFamily: "'JetBrains Mono','Fira Mono',monospace", fontSize: 23, color: WHITE, whiteSpace: 'nowrap'}}>
                  {EXAMPLE.prefix22.slice(0, -3)}<span style={{color: GREY}}>{EXAMPLE.prefix22.slice(-3)}</span>
                </div>
              </RouteNote>
            </div>
          );
        })()}

        {/* 右注（窄注→紫光）：more specific */}
        {(() => {
          const n = noteIn(1);
          if (n < 0) return null;
          const pulse = rPulse1 > 1 ? rPulse1 : rPulse2;
          return (
            <div style={{...abs(0, 0, 1280, 720), opacity: softOp(n, 6), transform: `translateY(${slideUp(n, 60, 18).toFixed(1)}px) scale(${pulse.toFixed(4)})`, transformOrigin: '795px 310px',
              filter: rGlowK > 0.02 ? `drop-shadow(0 0 ${Math.round(12 * rGlowK)}px rgba(161,117,241,${(0.55 * rGlowK).toFixed(2)}))` : undefined}}>
              <HeroGlow x={NOTE_R.x - 14} y={NOTE_R.y - 14} w={NOTE_R.w + 28} h={NOTE_R.h + 28} N={N} k={rGlowK} />
              <RouteNote x={NOTE_R.x} y={NOTE_R.y} w={NOTE_R.w} h={NOTE_R.h} prefix="">
                <div style={{position: 'absolute', left: 18, top: 42, fontFamily: "'JetBrains Mono','Fira Mono',monospace", fontSize: 23, color: WHITE, whiteSpace: 'nowrap'}}>
                  {EXAMPLE.prefix24.slice(0, -3)}<span style={{color: PURPLE_LIGHT}}>{EXAMPLE.prefix24.slice(-3)}</span>
                </div>
              </RouteNote>
            </div>
          );
        })()}

        {/* 标签 broad claim / more specific */}
        <SoftIn N={N} f0={T_LBL}>
          <CText cx={485} cy={210} size={26} weight={600} color={GREY} letterSpacing={1}>broad claim</CText>
        </SoftIn>
        <SoftIn N={N} f0={T_LBL + 2}>
          <CText cx={800} cy={210} size={28} weight={600} family={FONT_TECH} italic color={PURPLE_LIGHT} letterSpacing={1}
            style={{textShadow: '0 0 10px rgba(102,48,248,.55)'}}>more specific</CText>
        </SoftIn>

        {/* 汇流箭头（左灰右紫，指向汇流点） */}
        <svg width={1280} height={720} viewBox="0 0 1280 720" style={{...abs(0, 0), overflow: 'visible'}}>
          <QuadArrow p0={[485, 398]} c={[512, 452]} p1={[JUNC[0] - 7, JUNC[1] - 2]} p={EASE(clamp01((N - T_JARR) / 14))}
            color={GREY_MID} rodW={2.5} headL={12} headW={11} opacity={0.85 * jDimL} />
          <g filter={`drop-shadow(0 0 3px rgba(161,117,241,${Math.max(0, 0.5 * jBoostR - 0.5).toFixed(2)}))`}>
            <QuadArrow p0={[800, 398]} c={[772, 452]} p1={[JUNC[0] + 7, JUNC[1] - 2]} p={EASE(clamp01((N - (T_JARR + 3)) / 14))}
              color={PURPLE_LIGHT} rodW={3} headL={13} headW={12} opacity={Math.min(1, 0.9 * jBoostR)} />
          </g>
        </svg>

        {/* longest match（两注之间的汇流点） */}
        <SoftIn N={N} f0={T_LM}>
          <CText cx={642} cy={512} size={30} weight={600} family={FONT_TECH} italic color={PURPLE_LIGHT} letterSpacing={1.5}
            style={{textShadow: '0 0 14px rgba(102,48,248,.6)'}}>longest match</CText>
        </SoftIn>

        {/* you win */}
        <SoftIn N={N} f0={T_YW}>
          <CText cx={642} cy={560} size={34} weight={600} color={GREY} letterSpacing={1}>you win</CText>
        </SoftIn>
      </div>
    </CameraRig>
  );
};
