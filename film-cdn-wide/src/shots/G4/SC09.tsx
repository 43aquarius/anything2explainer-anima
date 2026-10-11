import React from 'react';
import {useCurrentFrame} from 'remotion';
import {clamp01, kf, easeInOutPow, GlitchIn} from '../../common';
import {CameraRig, HeroGlow} from '../../fx';
import {CText, MonoText, PacketIcon, PersonIcon, Pill, RackIcon, CacheShelf, Check, Cross, Svg, SoftIn, TechText, GREY, GREY_MID, WHITE, PURPLE_LIGHT, GREEN, abs, softOp} from '../../ui';

/**
 * SC09 缓存命中（1950–2124）。S13（段内：硬切进 SC10，不离场 → hold 不判）。
 * 节拍：1958 `GET movie` 信封 kf 飞向货架（20f）+ 近线 draw-on + 远路虚线 draw-on（26f）
 *       ｜1996 远路中段红 Cross draw-on（12f，"到不了源站"）
 *       ｜2043 命中格放大卡（`movie.mp4`）+ 副本飞回用户（20f 弧线）+ `hit` Pill 绿光 + 绿 Check
 *       ｜2097 `cache hit` 大字 GlitchIn(rgbSplit 4) + `most requests` 灰字（c3 窗 2099–2122 仅 24 帧 → 提前落位）。
 * 运镜：2043–2076 推近 1→1.12 命中格（33f，不进末拍）。主角：CacheShelf+命中格 320px + HeroGlow；命中格绿光。
 * 持续：近线光点流（请求不断）；命中格辉光呼吸（2110 起衰减 → 2124 静止硬切，避免循环进段尾）。
 */
const F0 = 1950;

// ---- 几何 ----
const USER = {cx: 170, cy: 332};
const SHELF = {cx: 640, cy: 385}; // CacheShelf 340×320 → 470–810 / 225–545（可见底框 y=537）
const HIT = {cx: 638, cy: 483}; // 货架 row1 中格（局部 128–208/230–286 → 画布 598–678/455–511）
const ORIGIN = {cx: 1055, cy: 345};

// 信封（请求）：用户 → 命中格，上弧
const REQ = {p0: [232, 318] as [number, number], p1: [420, 262] as [number, number], p2: [612, 462] as [number, number]};
// 副本（响应）：命中卡 → 用户，上弧
const COPY = {p0: [585, 470] as [number, number], p1: [420, 282] as [number, number], p2: [215, 318] as [number, number]};
// 远路（虚线，打叉）：用户 → origin，下坠弧
const FAR = {p0: [200, 392] as [number, number], p1: [600, 758] as [number, number], p2: [1012, 400] as [number, number]};

const quadPt = (t: number, p0: [number, number], p1: [number, number], p2: [number, number]): [number, number] => {
  const u = 1 - t;
  return [u * u * p0[0] + 2 * u * t * p1[0] + t * t * p2[0], u * u * p0[1] + 2 * u * t * p1[1] + t * t * p2[1]];
};
const pathD = (p0: [number, number], p1: [number, number], p2: [number, number]) => `M${p0[0]},${p0[1]} Q${p1[0]},${p1[1]} ${p2[0]},${p2[1]}`;

export const SC09: React.FC = () => {
  const N = useCurrentFrame() + F0;

  // 基础件入场（章卡 1938–1949 加速上出 → 1950 起本镜接场）
  const baseOp = softOp(N - 1950, 7);
  const originOp = softOp(N - 1952, 7);

  // 请求信封：1958–1978（20f，kf easeInOut）
  const reqT = kf(N, [[1958, 0], [1978, 1]], easeInOutPow(2));
  const reqPos = quadPt(reqT, REQ.p0, REQ.p1, REQ.p2);
  const reqOp = N < 1958 ? 0 : N <= 1978 ? 1 : 1 - clamp01((N - 1978) / 6);

  // 近线 draw-on（1960–1976）+ 光点流（1992 起，48f 周期）
  const nearP = clamp01((N - 1960) / 16);
  const dotT = (i: number) => ((Math.max(0, N - 1992) / 48 + i / 3) % 1);

  // 远路虚线 draw-on（1962–1988，clip 揭示）+ 红 Cross（1996–2008）
  const farP = clamp01((N - 1962) / 26);
  const crossP = clamp01((N - 1996) / 12);

  // 检索扫描条（1985–2039 在货架格间扫一遍）
  const scanT = clamp01((N - 1985) / 54);
  const scanOp = scanT > 0 && scanT < 1 ? Math.min(clamp01(scanT * 8), clamp01((1 - scanT) * 8)) * 0.5 : 0;

  // 命中卡（2043 缩放弹出）+ hit Pill + Check + 副本飞回（2049–2069）
  const cardN = N - 2043;
  const cardK = clamp01(cardN / 10);
  const cardS = 0.45 + 0.55 * (1 - Math.pow(1 - cardK, 3));
  const pillS = 0.5 + 0.5 * clamp01((N - 2046) / 8);
  const checkP = clamp01((N - 2046) / 12);
  const copyT = kf(N, [[2049, 0], [2069, 1]], easeInOutPow(2));
  const copyPos = quadPt(copyT, COPY.p0, COPY.p1, COPY.p2);
  // 命中格辉光呼吸（2043 起；2110 起衰减 → 2124 静止，硬切前收干净）
  const breath = (0.55 + 0.45 * Math.sin((2 * Math.PI * (N - 2043)) / 30)) * (N > 2110 ? Math.max(0, 1 - (N - 2110) / 14) : 1);

  return (
    <CameraRig N={N} keys={[{f: F0, x: 640, y: 360, s: 1}, {f: 2043, x: 640, y: 360, s: 1}, {f: 2076, x: 640, y: 375, s: 1.12}]}>
      {/* 货架主角柔光 */}
      <div style={{...abs(0, 0, 1280, 720), opacity: baseOp}}>
        <HeroGlow x={458} y={213} w={364} h={344} r={14} N={N} k={0.8} />
      </div>

      {/* 用户 / 货架 / origin */}
      <div style={{...abs(0, 0, 1280, 720), opacity: baseOp}}>
        <PersonIcon cx={USER.cx} cy={USER.cy} size={84} label="you" labelSize={22} />
        <CacheShelf cx={SHELF.cx} cy={SHELF.cy} />
      </div>
      <div style={{...abs(0, 0, 1280, 720), opacity: originOp}}>
        <RackIcon cx={ORIGIN.cx} cy={ORIGIN.cy} w={92} h={136} units={5} lit={0} color={GREY_MID} label="origin" labelSize={22} />
      </div>

      {/* 近线 + 光点流 + 远路 + Cross（SVG 层） */}
      <Svg bloom={false}>
        {nearP > 0 ? <line x1={222} y1={356} x2={222 + 246 * nearP} y2={356 + 20 * nearP} stroke={WHITE} strokeWidth={2.5} strokeLinecap="round" opacity={0.85} /> : null}
        {[0, 1, 2].map((i) => {
          if (N < 1992) return null;
          const t = dotT(i);
          return <circle key={i} cx={222 + 246 * t} cy={356 + 20 * t} r={4} fill={PURPLE_LIGHT} opacity={0.9} />;
        })}
        {farP > 0 ? (
          <g>
            <defs>
              <clipPath id="sc09-farclip">
                <rect x={200} y={385} width={Math.ceil(812 * farP)} height={200} />
              </clipPath>
            </defs>
            <path d={pathD(FAR.p0, FAR.p1, FAR.p2)} fill="none" stroke={GREY_MID} strokeWidth={2.5} strokeDasharray="8 10" opacity={0.75} clipPath="url(#sc09-farclip)" />
          </g>
        ) : null}
        {crossP > 0 ? <Cross cx={603} cy={572} size={44} p={crossP} /> : null}
      </Svg>

      {/* 请求信封 + 标签 */}
      {reqOp > 0 ? (
        <div style={{...abs(0, 0, 1280, 720), opacity: reqOp}}>
          <PacketIcon cx={reqPos[0]} cy={reqPos[1]} w={66} h={46} glow />
          <MonoText x={reqPos[0] + 44} y={reqPos[1] - 30} size={22} color={WHITE}>{`GET movie`}</MonoText>
        </div>
      ) : null}
      {/* 信封入格 blip */}
      {N >= 1978 && N < 1988 ? (
        <div style={{...abs(612 - 22, 462 - 22, 44, 44), borderRadius: '50%', border: `2.5px solid ${PURPLE_LIGHT}`, opacity: 1 - (N - 1978) / 10, transform: `scale(${0.4 + 0.6 * (N - 1978) / 10})`}} />
      ) : null}

      {/* 检索扫描条 */}
      {scanOp > 0 ? (
        <div style={{...abs(484, 345 + 170 * scanT, 312, 3), background: 'rgba(140,90,250,.55)', boxShadow: '0 0 10px 3px rgba(102,48,248,.5)', opacity: scanOp}} />
      ) : null}

      {/* 命中格放大卡（2043）：movie.mp4 + hit Pill + 绿 Check */}
      {cardN >= 0 ? (
        <div style={{...abs(0, 0, 1280, 720), opacity: softOp(cardN, 8)}}>
          <div style={{...abs(543, 440, 190, 86), transform: `scale(${cardS.toFixed(3)})`, transformOrigin: '50% 50%', background: 'rgba(10,6,22,.92)', border: `3px solid ${PURPLE_LIGHT}`, borderRadius: 10, boxShadow: `0 0 18px 6px rgba(143,247,64,${(0.28 + 0.3 * breath).toFixed(3)}), 0 0 30px 10px rgba(102,48,248,.35)`}}>
            <MonoText x={35} y={28} size={24} color={WHITE}>{`movie.mp4`}</MonoText>
          </div>
        </div>
      ) : null}
      {checkP > 0 ? (
        <Svg>
          <Check cx={728} cy={444} size={30} sw={6} p={checkP} />
        </Svg>
      ) : null}
      {N >= 2046 ? (
        <div style={{...abs(0, 0, 1280, 720), opacity: softOp(N - 2046, 8)}}>
          <div style={{...abs(755, 462, 92, 42), transform: `scale(${pillS.toFixed(3)})`, transformOrigin: '50% 50%'}}>
            <Pill x={0} y={0} w={92} h={42} r={21} fill="#000" stroke={GREEN} sw={2.5} text="hit" fontSize={26} weight={800} color={GREEN} letterSpacing={2}
              style={{boxShadow: `0 0 16px 4px rgba(143,247,64,${(0.35 + 0.3 * breath).toFixed(3)})`}} />
          </div>
        </div>
      ) : null}

      {/* 副本飞回用户 */}
      {copyT > 0 && copyT < 1 ? (
        <div style={{...abs(0, 0, 1280, 720)}}>
          <PacketIcon cx={copyPos[0]} cy={copyPos[1]} w={60} h={42} accent glow />
        </div>
      ) : null}
      {N >= 2069 && N < 2079 ? (
        <div style={{...abs(215 - 22, 318 - 22, 44, 44), borderRadius: '50%', border: `2.5px solid ${GREEN}`, opacity: 1 - (N - 2069) / 10, transform: `scale(${0.4 + 0.6 * (N - 2069) / 10})`}} />
      ) : null}

      {/* c3：cache hit 大字（本镜唯一 glitch）+ most requests */}
      <GlitchIn N={N} f0={2097} rgbSplit={4}>
        <div style={{...abs(0, 0, 1280, 720)}}>
          <CText cx={640} cy={175} size={52} weight={900} color={WHITE} letterSpacing={1}
            style={{WebkitTextStroke: '2px rgba(161,117,241,0.9)', paintOrder: 'stroke fill'}}>cache hit</CText>
        </div>
      </GlitchIn>
      <SoftIn N={N} f0={2100}>
        <TechText cx={640} cy={224} text="most requests" fontSize={26} color={GREY} glow={false} />
      </SoftIn>
    </CameraRig>
  );
};
