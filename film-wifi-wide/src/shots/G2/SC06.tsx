import React from 'react';
import {useCurrentFrame} from 'remotion';
import {clamp01, easeOutCubic, powOutRemain} from '../../common';
import {CameraRig, GlowBlob} from '../../fx';
import {
  CText, Check, Cross, GPUChip, GREY, GREY_MID, GREY_LIGHT, GREEN, WHITE, PURPLE, PURPLE_LIGHT,
  abs, SoftIn, softOp, firstOp, exitOp, glowOffK, Svg,
} from '../../ui';
import {BackoffRing} from './g2ui';

/**
 * SC06 好礼貌 · N 1062–1298（S11–S12，¶ 段末镜头——章末停 1298=C3−54，卡片 1299 起）
 *   S11：1070「That little pause」/ 1097「is why your network works.」
 *   S12：1150「No referee. No schedule.」/ 1212「Just good manners,」/ 1249「built into the radio itself.」
 * 版式：右上角 BackoffRing 缩微承接（SC05 随机暂停环余韵）+ `works` 绿 Check；
 *   三张卡横排 `referee`（哨子）→ Cross / `schedule`（时刻表）→ Cross / `good manners`（握手，紫光晕、无叉）；
 *   下方无线电芯片剖面（GPUChip 引脚 + 内部方阵 + 环心一枚心形点亮）+ 芯片→第三卡连接线（"装进去了"）。
 * 节拍（尾部硬规则：末拍 1243 ≤ TO−45=1253 ✓；末拍簇 1243–1253 落位，1293 离场前 hold ≥30f）：
 *   1062 缩微承接 firstOp（16f 收缩落定）；1070 `that little pause`；1097 绿 Check draw-on 10f + `works`；
 *   1150/1152 卡一卡二 slideUp（Δ64/16f，2f 错峰）；1168/1176 各被 Cross 盖掉（10f）+ 压灰；
 *   1210 卡三 slideUp + 紫光晕 + 握手 draw-on 14f（拍 1212 前挂 −2）；1243 芯片 wipe 10f + 1245 连接线
 *   + 1253 环心心形白闪一拍后常亮呼吸（低幅）。
 * 运镜：1062→1120 慢推 1→1.05 → 1210 1.06 → 1245 拉回 1.0（末 key = TO−53 ✓；拉回 35f）。
 * glitch：零（Cross 是动作戏）。文本取自事实清单 SC06 行：that little pause / works / referee / schedule / good manners。
 */
const F0 = 1062;
const TO = 1298;
const T_MINI = 1062, T_PAUSE = 1070, T_WORKS = 1097;
const T_C1 = 1150, T_C2 = 1152, T_X1 = 1168, T_X2 = 1176;
const T_C3 = 1210, T_SHAKE = 1214, T_CHIP = 1243, T_LINE = 1245, T_HEART = 1253;

const MINI = {cx: 1080, cy: 192, r: 40};                 // SC05 BackoffRing 缩微承接（右上角）
const CARDS = [
  {cx: 350, label: 'referee'},
  {cx: 625, label: 'schedule'},
  {cx: 900, label: 'good manners'},
];
const CY = 360, CW = 230, CH = 190;                       // 卡行
const CHIP = {cx: 640, cy: 545, size: 140};              // 无线电芯片剖面
// 芯片 → 第三卡连接线（"装进去了"）
const LINK = {d: 'M702 490 Q780 506 856 458', L: 190};

export const SC06: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const exit = exitOp(N, TO, 5);
  const gk = glowOffK(N, TO, 3, 5);

  // 卡片入场 / 被叉压灰
  const cardIn = (t0: number) => ({op: N < t0 ? 0 : softOp(N - t0, 8), dy: 64 * powOutRemain(N - t0, 16, 2.5)});
  const crossed = (t0: number) => clamp01((N - t0) / 8); // 0→1 被盖掉
  const c1 = cardIn(T_C1), c2 = cardIn(T_C2), c3 = cardIn(T_C3);

  // 芯片 wipe + 心形点亮（白闪一拍后低幅呼吸）
  const chipP = clamp01((N - T_CHIP) / 10);
  const heartPulse = N >= T_HEART && N < T_HEART + 8 ? Math.sin((Math.PI * (N - T_HEART)) / 8) : 0;
  const heartK = clamp01((N - T_HEART) / 6) * (0.88 + 0.12 * Math.sin((2 * Math.PI * N) / 30));
  const linkP = easeOutCubic(clamp01((N - T_LINE) / 10));

  return (
    <CameraRig N={N} keys={[
      {f: F0, x: 640, y: 360, s: 1},
      {f: 1120, x: 640, y: 360, s: 1.05},
      {f: 1210, x: 640, y: 360, s: 1.06},
      {f: 1245, x: 640, y: 360, s: 1},
    ]}>
      <div style={{...abs(0, 0, 1280, 720), opacity: exit}}>
        {/* 右上：BackoffRing 缩微承接 + `works`（SC05 的"那一小下停顿"起作用） */}
        <div style={{
          ...abs(0, 0, 1280, 720), opacity: firstOp(N - T_MINI, 6) * 0.55,
          transformOrigin: `${MINI.cx}px ${MINI.cy}px`,
          transform: `scale(${(1 + 0.18 * powOutRemain(N - T_MINI, 16, 2.5)).toFixed(4)})`,
        }}>
          <BackoffRing cx={MINI.cx} cy={MINI.cy} r={MINI.r} p={1} pips={4} dim={0.45} opacity={gk} />
        </div>
        <SoftIn N={N} f0={T_PAUSE} style={{opacity: exit}}>
          <CText cx={640} cy={232} size={27} weight={600} color={GREY}>that little pause</CText>
        </SoftIn>
        {N >= T_WORKS ? (
          <div style={{...abs(0, 0, 1280, 720), opacity: exit}}>
            {/* works 打拍涟漪（绿环扩散一拍，给 1097–1107 段一个可量到的动作） */}
            {N >= T_WORKS && N < T_WORKS + 14 ? (
              <div style={{...abs(MINI.cx - 60, 262 - 60, 120, 120), borderRadius: '50%', border: '2.5px solid #8FF740', opacity: (0.65 * (1 - (N - T_WORKS) / 14)).toFixed(2), transform: `scale(${(0.55 + 0.75 * easeOutCubic((N - T_WORKS) / 14)).toFixed(3)})`}} />
            ) : null}
            <Check cx={MINI.cx} cy={262} size={56} p={clamp01((N - T_WORKS) / 10)} opacity={gk} />
            <SoftIn N={N} f0={T_WORKS + 2} style={{opacity: gk}}>
              <CText cx={MINI.cx} cy={304} size={26} weight={700} color={GREEN}>works</CText>
            </SoftIn>
          </div>
        ) : null}

        {/* 卡一 referee（哨子）→ Cross */}
        {c1.op > 0.02 ? (
          <div style={{...abs(0, 0, 1280, 720), opacity: c1.op, transform: `translateY(${c1.dy.toFixed(1)}px)`}}>
            <div style={{...abs(CARDS[0].cx - CW / 2, CY - CH / 2, CW, CH), boxSizing: 'border-box', background: '#000', border: `2.5px solid ${GREY_MID}`, borderRadius: 12, opacity: 1 - 0.35 * crossed(T_X1)}} />
            <Svg bloom={false} style={{opacity: (1 - 0.4 * crossed(T_X1)) * exit}}>
              {/* 哨子：球腔 + 吹嘴 + 挂绳 + 声波 */}
              <circle cx={CARDS[0].cx - 14} cy={318} r={15} fill="#000" stroke={WHITE} strokeWidth={2.6} />
              <path d={`M${CARDS[0].cx - 1} 311 L${CARDS[0].cx + 22} 315 L${CARDS[0].cx + 22} 327 L${CARDS[0].cx + 1} 328 Z`} fill="#000" stroke={WHITE} strokeWidth={2.6} strokeLinejoin="round" />
              <line x1={CARDS[0].cx - 14} y1={303} x2={CARDS[0].cx - 20} y2={288} stroke={WHITE} strokeWidth={2.2} />
              <circle cx={CARDS[0].cx - 21} cy={285} r={3.5} fill="none" stroke={WHITE} strokeWidth={2} />
              <path d={`M${CARDS[0].cx + 30} 312 q7 8 0 16 M${CARDS[0].cx + 40} 308 q11 12 0 24`} fill="none" stroke={GREY_LIGHT} strokeWidth={2.2} strokeLinecap="round" />
            </Svg>
            <CText cx={CARDS[0].cx} cy={418} size={28} weight={700} color={GREY_LIGHT} opacity={1 - 0.4 * crossed(T_X1)}>{CARDS[0].label}</CText>
            {N >= T_X1 ? <Cross cx={CARDS[0].cx} cy={CY - 8} size={78} p={clamp01((N - T_X1) / 10)} opacity={gk} /> : null}
          </div>
        ) : null}

        {/* 卡二 schedule（时刻表网格）→ Cross */}
        {c2.op > 0.02 ? (
          <div style={{...abs(0, 0, 1280, 720), opacity: c2.op, transform: `translateY(${c2.dy.toFixed(1)}px)`}}>
            <div style={{...abs(CARDS[1].cx - CW / 2, CY - CH / 2, CW, CH), boxSizing: 'border-box', background: '#000', border: `2.5px solid ${GREY_MID}`, borderRadius: 12, opacity: 1 - 0.35 * crossed(T_X2)}} />
            <Svg bloom={false} style={{opacity: (1 - 0.4 * crossed(T_X2)) * exit}}>
              <rect x={CARDS[1].cx - 30} y={292} width={60} height={50} rx={3} fill="#000" stroke={WHITE} strokeWidth={2.6} />
              <line x1={CARDS[1].cx - 30} y1={306} x2={CARDS[1].cx + 30} y2={306} stroke={WHITE} strokeWidth={2.2} />
              <line x1={CARDS[1].cx - 10} y1={306} x2={CARDS[1].cx - 10} y2={342} stroke={GREY_LIGHT} strokeWidth={1.6} />
              <line x1={CARDS[1].cx + 10} y1={306} x2={CARDS[1].cx + 10} y2={342} stroke={GREY_LIGHT} strokeWidth={1.6} />
              <line x1={CARDS[1].cx - 30} y1={324} x2={CARDS[1].cx + 30} y2={324} stroke={GREY_LIGHT} strokeWidth={1.6} />
              <rect x={CARDS[1].cx - 27} y={310} width={15} height={11} rx={1.5} fill={PURPLE} opacity={0.85} />
              <rect x={CARDS[1].cx + 13} y={327} width={14} height={11} rx={1.5} fill="#141414" stroke={GREY_MID} strokeWidth={1.2} />
            </Svg>
            <CText cx={CARDS[1].cx} cy={418} size={28} weight={700} color={GREY_LIGHT} opacity={1 - 0.4 * crossed(T_X2)}>{CARDS[1].label}</CText>
            {N >= T_X2 ? <Cross cx={CARDS[1].cx} cy={CY - 8} size={78} p={clamp01((N - T_X2) / 10)} opacity={gk} /> : null}
          </div>
        ) : null}

        {/* 卡三 good manners（握手，紫光晕，无叉） */}
        {c3.op > 0.02 ? (
          <div style={{...abs(0, 0, 1280, 720), opacity: c3.op, transform: `translateY(${c3.dy.toFixed(1)}px)`}}>
            <GlowBlob cx={CARDS[2].cx} cy={CY} r={150} N={N} k={softOp(N - T_C3, 12) * gk} />
            <div style={{...abs(CARDS[2].cx - CW / 2, CY - CH / 2, CW, CH), boxSizing: 'border-box', background: '#000', border: `2.5px solid ${PURPLE_LIGHT}`, borderRadius: 12, boxShadow: `0 0 24px 8px rgba(102,45,248,${(0.42 * gk).toFixed(2)})`}} />
            <Svg style={{opacity: exit}}>
              {/* 握手 draw-on：两臂 + 相扣的手 + 线条抖动 */}
              <path d={`M${CARDS[2].cx - 48} 326 L${CARDS[2].cx - 18} 314`} stroke={WHITE} strokeWidth={7} strokeLinecap="round" pathLength={100} strokeDasharray={100} strokeDashoffset={100 - 100 * clamp01((N - T_SHAKE) / 10)} />
              <path d={`M${CARDS[2].cx + 48} 326 L${CARDS[2].cx + 18} 314`} stroke={WHITE} strokeWidth={7} strokeLinecap="round" pathLength={100} strokeDasharray={100} strokeDashoffset={100 - 100 * clamp01((N - T_SHAKE - 2) / 10)} />
              <rect x={CARDS[2].cx - 16} y={304} width={32} height={20} rx={6} fill="#000" stroke={WHITE} strokeWidth={2.6} opacity={clamp01((N - T_SHAKE - 8) / 6)} />
              <path d={`M${CARDS[2].cx - 6} 308 v12 M${CARDS[2].cx + 2} 308 v12 M${CARDS[2].cx + 10} 308 v12`} stroke={GREY_LIGHT} strokeWidth={1.6} opacity={0.7 * clamp01((N - T_SHAKE - 10) / 6)} />
              <path d={`M${CARDS[2].cx - 10} 296 q4 -6 0 -12 M${CARDS[2].cx + 12} 296 q-4 -6 0 -12`} fill="none" stroke={PURPLE_LIGHT} strokeWidth={2.2} strokeLinecap="round" opacity={0.8 * clamp01((N - T_SHAKE - 10) / 6)} />
            </Svg>
            <CText cx={CARDS[2].cx} cy={418} size={30} weight={800} color={WHITE} opacity={softOp(N - T_C3 - 6, 8)}>{CARDS[2].label}</CText>
          </div>
        ) : null}

        {/* 无线电芯片剖面（1243 wipe 落位）+ 芯片→第三卡连接线 + 环心心形 */}
        {N >= T_CHIP ? (
          <div style={{...abs(0, 0, 1280, 720), opacity: exit, clipPath: `inset(0 0 ${(100 - 100 * chipP).toFixed(1)}% 0)`}}>
            <GPUChip cx={CHIP.cx} cy={CHIP.cy} size={CHIP.size} grid={5} lit={0.22 + 0.33 * chipP} glowK={softOp(N - T_CHIP, 8) * gk} sw={3} />
          </div>
        ) : null}
        {linkP > 0.01 ? (
          <Svg bloom={false} style={{opacity: exit}}>
            <path d={LINK.d} fill="none" stroke={PURPLE_LIGHT} strokeWidth={2.6} strokeDasharray="9 7" pathLength={LINK.L} strokeDashoffset={LINK.L * (1 - linkP)} strokeLinecap="round" />
            {linkP > 0.92 ? <circle cx={856} cy={458} r={4} fill={PURPLE_LIGHT} opacity={gk} /> : null}
          </Svg>
        ) : null}
        {heartK > 0.02 ? (
          <div style={{...abs(0, 0, 1280, 720), opacity: exit}}>
            <div style={{...abs(CHIP.cx - 23, CHIP.cy - 23, 46, 46), borderRadius: '50%', background: '#000', boxShadow: `0 0 ${(14 * heartK).toFixed(1)}px ${(5 * heartK).toFixed(1)}px rgba(102,45,248,${(0.75 * heartK).toFixed(2)})`}} />
            <svg width={30} height={28} viewBox="0 0 24 24" style={{position: 'absolute', left: CHIP.cx - 15, top: CHIP.cy - 14, overflow: 'visible', filter: 'drop-shadow(0 0 3px rgba(255,255,255,.6))'}}>
              <path d="M12 21 C6 16 2 12 2 7.5 C2 4.5 4.5 2.5 7 2.5 C9 2.5 11 4 12 6 C13 4 15 2.5 17 2.5 C19.5 2.5 22 4.5 22 7.5 C22 12 18 16 12 21 Z"
                fill={heartPulse > 0.15 ? WHITE : PURPLE_LIGHT} stroke={WHITE} strokeWidth={1.6} opacity={heartK.toFixed(2)} />
            </svg>
          </div>
        ) : null}
      </div>
    </CameraRig>
  );
};
