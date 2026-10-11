import React from 'react';
import {useCurrentFrame} from 'remotion';
import {clamp01, kf, easeInOutPow, GlitchIn, emphasisPulse, FONT_ORB} from '../../common';
import {CameraRig, GlowBlob} from '../../fx';
import {CText, MonoText, PacketIcon, Pill, RackIcon, Check, LineArrow, Svg, SoftIn, GREY_MID, WHITE, PURPLE_LIGHT, GREEN, ORANGE, abs, softOp, mixHex} from '../../ui';
import {G4Shelf, quadPt} from './shared';

/**
 * SC10 TTL 循环（2125–2395）。S14（段内：硬切进 SC11，不离场 → hold 不判）。
 * 节拍：2133 环形计时器圆环 draw-on（20f）+ 指针开始走（顺时针匀速，一圈 = 一个 TTL）+ 左下缩微货架（内容住在那）
 *       ｜2166 `TTL` Pill GlitchIn(rgbSplit 4) + 数字倒计分段滚动 60→10（每 10f 一格）
 *       ｜2225 到 0：白闪 + `0 s` 红橙闪烁 + miss 状态激活（箭头指 origin）+ 回源虚线 draw-on（14f）
 *       ｜2236 小信封去 origin（24f）→2264 拿新副本回来（24f，紫描边）
 *       ｜2288 新副本入架（格子闪一下）+ `miss` Pill 橙光 + emphasisPulse
 *       ｜2354 计时器重置：白闪② + 指针倒转一圈跳回（10f）+ 数字回 60 + hit 复绿 + 指针继续走（持续到硬切）。
 * 运镜：1.0→1.05 慢推（整镜，参照 TLS SC16 慢推+GlitchIn 并存先例）。主角：环形计时器 296px + 橙光。
 */
const F0 = 2125;

const RING = {cx: 640, cy: 350, r: 148};
const C = 2 * Math.PI * RING.r;
const SHELF_MINI = {cx: 265, cy: 515};
const ORIGIN = {cx: 1000, cy: 505};
// 回源弧：缩微货架 → origin（从环下方绕过）
const PULL = {p0: [318, 522] as [number, number], p1: [640, 665] as [number, number], p2: [948, 512] as [number, number]};

// 指针：一圈 92f（2133→2225 恰好走满一圈到 0）；2225–2354 停在满圈；2354 倒转一圈跳回；2364 起第二圈
const needleAngle = (N: number) => {
  if (N < 2133) return 0;
  if (N <= 2225) return 3.913 * (N - 2133);
  if (N < 2354) return 360;
  if (N < 2364) return 360 * (1 - Math.pow(clamp01((N - 2354) / 10), 1.6));
  return 3.913 * (N - 2364);
};

// 数字：[步进帧, 数值]（lap1 2166–2225 每 10f 一格 60→0；lap2 2354 起 60/50/40/30）
const stepF = (N: number): [number, number] => {
  if (N < 2166) return [0, 60];
  if (N < 2225) {
    const i = Math.min(5, Math.floor((N - 2166) / 10));
    return [2166 + i * 10, 60 - i * 10];
  }
  if (N < 2354) return [2225, 0];
  const i = Math.min(3, Math.floor((N - 2354) / 9));
  return [2354 + i * 9, 60 - i * 10];
};

const pathD = (p0: [number, number], p1: [number, number], p2: [number, number]) => `M${p0[0]},${p0[1]} Q${p1[0]},${p1[1]} ${p2[0]},${p2[1]}`;

export const SC10: React.FC = () => {
  const N = useCurrentFrame() + F0;

  // 圆环 draw-on + 刻度
  const ringP = clamp01((N - 2133) / 20);
  // 指针
  const ang = needleAngle(N) * (Math.PI / 180);
  const nx = RING.cx + Math.sin(ang) * 74, ny = RING.cy - Math.cos(ang) * 74;
  const tx = RING.cx + Math.sin(ang) * 132, ty = RING.cy - Math.cos(ang) * 132;
  // 数字
  const [stepFrame, val] = stepF(N);
  const numOp = softOp(N - 2166, 8);
  const pop = N >= stepFrame && N < stepFrame + 5 ? 1 + 0.09 * (1 - clamp01((N - stepFrame) / 5)) : 1;
  const blink = N >= 2229 && N < 2348 ? 0.3 + 0.7 * (0.5 + 0.5 * Math.cos(((N - 2229) * 2 * Math.PI) / 26)) : 1;
  const zeroK = N >= 2225 && N < 2354 ? 1 : 0; // 过期态（数字转红橙）
  // 白闪：0 瞬间 / 重置瞬间（环闪 3f）
  const flash1 = N >= 2225 && N < 2228 ? [0.95, 0.55, 0.25][N - 2225] : 0;
  const flash2 = N >= 2354 && N < 2357 ? [0.6, 0.3, 0.12][N - 2354] : 0;

  // hit/miss 状态（dimK：过期灰化；actK：miss 激活）
  const dimK = N < 2225 ? 0 : N < 2354 ? clamp01((N - 2225) / 6) : 1 - clamp01((N - 2354) / 6);
  const actK = N < 2224 ? 0 : N < 2354 ? 1 : 1 - clamp01((N - 2354) / 6);
  const breath = 0.5 + 0.5 * Math.sin((2 * Math.PI * N) / 30);

  // 回源：虚线 draw-on（2226–2240）+ 信封往返（2236–2260 出 / 2264–2288 回）
  const pullP = clamp01((N - 2226) / 14);
  const outT = kf(N, [[2236, 0], [2260, 1]], easeInOutPow(2));
  const backT = kf(N, [[2264, 0], [2288, 1]], easeInOutPow(2));
  const envPos = N < 2264 ? quadPt(outT, PULL.p0, PULL.p1, PULL.p2) : quadPt(1 - backT, PULL.p0, PULL.p1, PULL.p2);
  const envShow = N >= 2236 && N < 2292;
  // 新副本入架闪（2288–2302）+ miss Pill pulse
  const landFlash = Math.max(0, 1 - (N - 2288) / 14);
  const missPulse = N >= 2288 ? emphasisPulse(N - 2288, {peak: 1.08, up: 10, hold: 3, down: 10}) : 1;
  const originBusy = N >= 2256 && N < 2274;

  return (
    <CameraRig N={N} keys={[{f: F0, x: 640, y: 360, s: 1}, {f: 2395, x: 640, y: 372, s: 1.05}]}>
      {/* 计时器橙光（主角光） */}
      <GlowBlob cx={RING.cx} cy={RING.cy} r={215} N={N} k={0.75} alpha={0.26} />

      {/* 圆环 + 刻度 + 进度弧 + 指针 */}
      <Svg bloom={false}>
        <circle cx={RING.cx} cy={RING.cy} r={RING.r} fill="none" stroke={WHITE} strokeWidth={3.5}
          strokeDasharray={C} strokeDashoffset={C * (1 - ringP)} transform={`rotate(-90 ${RING.cx} ${RING.cy})`} opacity={0.95} />
        {Array.from({length: 12}, (_, i) => {
          const a = (i / 12) * Math.PI * 2;
          const op = softOp(N - (2136 + i * 2), 6);
          if (op <= 0) return null;
          const r0 = i === 0 ? 128 : 132, r1 = 142;
          return <line key={i} x1={RING.cx + Math.sin(a) * r0} y1={RING.cy - Math.cos(a) * r0} x2={RING.cx + Math.sin(a) * r1} y2={RING.cy - Math.cos(a) * r1}
            stroke={i === 0 ? WHITE : GREY_MID} strokeWidth={i % 3 === 0 ? 3 : 2} opacity={op * (i === 0 ? 1 : 0.8)} />;
        })}
        {ringP >= 1 ? (
          <circle cx={RING.cx} cy={RING.cy} r={RING.r} fill="none" stroke={ORANGE} strokeWidth={5} strokeLinecap="round"
            strokeDasharray={C} strokeDashoffset={C * (1 - clamp01(needleAngle(N) / 360))} transform={`rotate(-90 ${RING.cx} ${RING.cy})`} opacity={0.8} />
        ) : null}
        {flash1 > 0 || flash2 > 0 ? <circle cx={RING.cx} cy={RING.cy} r={RING.r} fill="none" stroke={WHITE} strokeWidth={6} opacity={Math.max(flash1, flash2)} /> : null}
        {N >= 2133 ? (
          <g>
            <line x1={nx} y1={ny} x2={tx} y2={ty} stroke={ORANGE} strokeWidth={4.5} strokeLinecap="round" opacity={0.95} />
            <circle cx={RING.cx} cy={RING.cy} r={7} fill={PURPLE_LIGHT} />
          </g>
        ) : null}
      </Svg>

      {/* TTL Pill（本镜唯一 glitch，环顶） */}
      <GlitchIn N={N} f0={2166} rgbSplit={4}>
        <div style={{...abs(584, 180, 112, 44)}}>
          <Pill x={0} y={0} w={112} h={44} r={22} fill="#6630F8" sw={2} text="TTL" fontSize={26} weight={800} color={WHITE} letterSpacing={3} family={FONT_ORB}
            style={{boxShadow: '0 0 18px 4px rgba(102,48,248,.55)'}} />
        </div>
      </GlitchIn>

      {/* 中心倒计数字 */}
      {numOp > 0 ? (
        <div style={{...abs(0, 0, 1280, 720), opacity: numOp * blink, transform: `scale(${pop.toFixed(3)})`, transformOrigin: '640px 350px'}}>
          <CText cx={RING.cx} cy={RING.cy} size={54} weight={700} family={FONT_ORB} letterSpacing={1}
            color={zeroK ? (N >= 2225 && N < 2228 ? WHITE : ORANGE) : ORANGE}
            shadow={zeroK ? '0 0 22px rgba(241,96,67,.75)' : '0 0 18px rgba(240,95,65,.55)'}
            style={{fontVariantNumeric: 'tabular-nums'}}>{`${val} s`}</CText>
        </div>
      ) : null}

      {/* hit 状态位（左）：绿 Check + hit Pill（计时中亮，过期灰化，重置复绿） */}
      <div style={{...abs(0, 0, 1280, 720), opacity: softOp(N - 2166, 8)}}>
        <Svg bloom={false}>
          <Check cx={306} cy={350} size={26} sw={6} color={mixHex(GREEN, GREY_MID, dimK)} p={clamp01((N - 2168) / 10)} />
        </Svg>
        <Pill x={330} y={328} w={130} h={44} r={22} fill="#000" sw={2.5} text="hit" fontSize={26} weight={800} letterSpacing={2}
          color={mixHex(GREEN, GREY_MID, dimK)} stroke={mixHex(GREEN, GREY_MID, dimK)}
          style={{boxShadow: `0 0 16px 4px rgba(143,247,64,${(0.4 * (1 - dimK) * (0.7 + 0.3 * breath)).toFixed(3)})`}} />
      </div>

      {/* miss 状态位（右）：miss Pill + 指向 origin 的橙箭头（到 0 激活） */}
      <div style={{...abs(0, 0, 1280, 720), opacity: softOp(N - 2168, 8)}}>
        <div style={{...abs(820, 328, 130, 44), transform: `scale(${missPulse.toFixed(3)})`, transformOrigin: '50% 50%'}}>
          <Pill x={0} y={0} w={130} h={44} r={22} fill="#000" sw={2.5} text="miss" fontSize={26} weight={800} letterSpacing={2}
            color={mixHex(GREY_MID, ORANGE, actK)} stroke={mixHex(GREY_MID, ORANGE, actK)}
            style={{boxShadow: `0 0 16px 4px rgba(240,95,65,${(0.45 * actK * (0.7 + 0.3 * breath)).toFixed(3)})`}} />
        </div>
        <Svg bloom={false}>
          {actK > 0 ? <LineArrow x0={958} y0={352} x1={1002} y1={396} p={clamp01((N - 2224) / 8)} rodW={3.5} headL={16} headW={16} color={ORANGE} opacity={0.9} /> : null}
        </Svg>
      </div>

      {/* 左下：缩微货架（内容住在那）+ movie.mp4 */}
      <SoftIn N={N} f0={2133} dy={14}>
        <G4Shelf cx={SHELF_MINI.cx} cy={SHELF_MINI.cy} s={0.55} lit flash={N >= 2288 ? landFlash : 0} />
      </SoftIn>
      <SoftIn N={N} f0={2136}>
        <MonoText x={330} y={502} size={22} color={WHITE}>{`movie.mp4`}</MonoText>
      </SoftIn>

      {/* 右下：origin（信封到达时状态灯亮起） */}
      <SoftIn N={N} f0={2133} dy={12}>
        <RackIcon cx={ORIGIN.cx} cy={ORIGIN.cy} w={88} h={120} units={4} lit={originBusy ? 4 : 0} color={GREY_MID} label="origin" labelSize={22} />
      </SoftIn>

      {/* 回源虚线（货架 → origin） */}
      <Svg bloom={false}>
        {pullP > 0 ? (
          <g>
            <defs>
              <clipPath id="sc10-pullclip">
                <rect x={318} y={505} width={Math.ceil(630 * pullP)} height={110} />
              </clipPath>
            </defs>
            <path d={pathD(PULL.p0, PULL.p1, PULL.p2)} fill="none" stroke={ORANGE} strokeWidth={2.5} strokeDasharray="9 8" opacity={0.7} clipPath="url(#sc10-pullclip)" />
          </g>
        ) : null}
      </Svg>

      {/* 回源小信封（去程白描边，回程紫描边 = 新副本） */}
      {envShow ? <PacketIcon cx={envPos[0]} cy={envPos[1]} w={52} h={36} accent={N >= 2264} glow={N >= 2264} /> : null}
      {/* origin 处取件 blip */}
      {N >= 2260 && N < 2268 ? (
        <div style={{...abs(948 - 20, 512 - 20, 40, 40), borderRadius: '50%', border: `2.5px solid ${ORANGE}`, opacity: 1 - (N - 2260) / 8, transform: `scale(${0.5 + 0.5 * (N - 2260) / 8})`}} />
      ) : null}
    </CameraRig>
  );
};
