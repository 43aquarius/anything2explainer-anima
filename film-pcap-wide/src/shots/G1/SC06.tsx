import React from 'react';
import {useCurrentFrame} from 'remotion';
import {clamp01, easeInOutPow, FONT_MONO} from '../../common';
import {PacketIcon, Pill, Svg, GREY, GREY_LINE, PURPLE, PURPLE_LIGHT, WHITE, abs, exitOp, SoftIn} from '../../ui';

/**
 * SC06 封装：层层嵌套 · N 875–1035（S07 883–1033：883「they nest: TCP rides inside IP」/ 980「IP rides inside Ethernet」）
 * 版式：同心嵌套（中心 640,360）：Ethernet 760×420 → IP 560×310 → TCP 380×210 → data 220×120 点阵块；
 *       每层左上角标签 Pill（外白、中白、内紫）。
 * 节拍：883 外框 draw-on 16 帧 → IP 897、TCP 909 各 12 帧（由外向内，stroke-dasharray）；标签随层 SoftIn；
 *       923 data 块（紫描边+紫柔光）draw-on 14 帧 + 'data' 等宽灰字；
 *       运镜：930–963 整组 33 帧 1→1.13 推近（中心 640,360；推后内容留 y122–607）；
 *       944 一枚白信封自画外左滑入（12.7px/帧），穿层时该层边框白闪一次：Ethernet 972 / IP 980（对齐节拍）/ TCP 987；
 *       1002 信封落在 data 块中心 (640,360) + 落定脉冲；1006 起点阵 18 格逐格点亮（3 帧/格，持续到离场），
 *       1008–1024 信封淡出（化作数据：信封进到最里层 = 数据落进 data 块）；
 *       1021 起灭 data 光、1027–1035 归零淡出。
 * 停留：段内不判（S07 非 ¶）。主角：嵌套组 420px；光：data 块紫柔光（glowPurpleS）。零 glitch。
 */
const F0 = 875;
const T_ETH = 883;
const T_DATA = 923;
const T_CAM = 930;
const T_ENV = 944;
const LAND = [972, 980, 987];
const T_LAND = 1002;
const T_DOTS = 1006;
const TO = 1035;
/** 三层框：draw-on 起始/时长 + 标签 + 白闪帧 */
const FRAMES = [
  {label: 'Ethernet', x: 260, y: 150, w: 760, h: 420, t0: T_ETH, dur: 16, pill: {x: 282, y: 168, w: 152}, purple: false},
  {label: 'IP', x: 360, y: 205, w: 560, h: 310, t0: 897, dur: 12, pill: {x: 382, y: 223, w: 84}, purple: false},
  {label: 'TCP', x: 450, y: 255, w: 380, h: 210, t0: 909, dur: 12, pill: {x: 472, y: 273, w: 96}, purple: true},
];
/** data 块与点阵 */
const DATA = {x: 530, y: 300, w: 220, h: 120};
const tri = (n: number, len = 8) => (n <= 0 || n >= len ? 0 : n < len / 2 ? n / (len / 2) : 1 - (n - len / 2) / (len / 2));

export const SC06: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const op = exitOp(N, TO, 8);
  const dataGlowK = 1 - clamp01((N - (TO - 14)) / 6); // 1021 起灭光
  // 运镜：33 帧 1→1.13
  const camS = 1 + 0.13 * easeInOutPow(2.5)(clamp01((N - T_CAM) / 33));
  // 白信封：944 自 x=-97 滑入，12.7px/帧，1002 落在 (640,360)；1008–1024 淡出（化作 data 点阵）
  const en = N - T_ENV;
  const ex = -97 + 12.7 * en;
  const landPulse = N >= T_LAND ? 1 + 0.1 * tri(N - T_LAND, 22) : 1;
  const envOp = N < 1008 ? 1 : Math.max(0, 1 - (N - 1008) / 16);
  return (
    <div style={{position: 'absolute', inset: 0, opacity: op}}>
      <div style={{position: 'absolute', inset: 0, transform: `translate(640px,360px) scale(${camS.toFixed(4)}) translate(-640px,-360px)`}}>
        {/* data 块紫柔光（在框之下） */}
        {N >= T_DATA ? <div style={{...abs(DATA.x, DATA.y, DATA.w, DATA.h), borderRadius: 6, boxShadow: `0 0 24px 8px rgba(102,45,248,${(0.6 * dataGlowK).toFixed(3)})`}} /> : null}
        <Svg>
          {FRAMES.map((f, i) => {
            const p = clamp01((N - f.t0) / f.dur);
            if (p <= 0) return null;
            const per = 2 * (f.w + f.h);
            const flash = tri(N - LAND[i], 8);
            return (
              <g key={f.label}>
                <rect x={f.x} y={f.y} width={f.w} height={f.h} fill="none" stroke={WHITE} strokeWidth={3 - i * 0.25} strokeDasharray={per} strokeDashoffset={per * (1 - p)} />
                {flash > 0 ? (
                  <rect x={f.x} y={f.y} width={f.w} height={f.h} fill="none" stroke={WHITE} strokeWidth={5} opacity={flash} style={{filter: 'drop-shadow(0 0 10px rgba(161,117,241,.9))'}} />
                ) : null}
              </g>
            );
          })}
          {/* data 块 */}
          {(() => {
            const p = clamp01((N - T_DATA) / 14);
            if (p <= 0) return null;
            const per = 2 * (DATA.w + DATA.h);
            return <rect x={DATA.x} y={DATA.y} width={DATA.w} height={DATA.h} rx={6} fill="none" stroke={PURPLE_LIGHT} strokeWidth={2.5} strokeDasharray={per} strokeDashoffset={per * (1 - p)} />;
          })()}
          {/* 点阵（18 格逐格点亮） */}
          {Array.from({length: 18}, (_, i) => {
            const c = i % 6, r = Math.floor(i / 6);
            const lit = clamp01((N - (T_DOTS + 3 * i)) / 4);
            if (lit <= 0) return null;
            return <rect key={i} x={560 + c * 34} y={345 + r * 30} width={10} height={10} rx={2} fill={lit >= 1 ? WHITE : 'rgba(255,255,255,.2)'} stroke={lit >= 1 ? WHITE : GREY_LINE} strokeWidth={1.2} opacity={0.3 + 0.7 * lit} />;
          })}
        </Svg>
        {/* 层标签 */}
        {FRAMES.map((f, i) => (
          <SoftIn key={f.label} N={N} f0={f.t0 + f.dur - 2}>
            <Pill x={f.pill.x} y={f.pill.y} w={f.pill.w} h={34} fill={f.purple ? PURPLE : '#000'} stroke={WHITE} sw={2} text={f.label} fontSize={22} weight={700} letterSpacing={0} />
          </SoftIn>
        ))}
        {/* data 标签 */}
        <SoftIn N={N} f0={T_DATA + 10}>
          <div style={{...abs(542, 306), fontFamily: FONT_MONO, fontSize: 22, color: GREY, lineHeight: 1.3, whiteSpace: 'nowrap'}}>data</div>
        </SoftIn>
        {/* 穿层白信封（落位后化作 data 点阵，淡出） */}
        {en >= 0 && envOp > 0 ? <PacketIcon cx={ex} cy={360} w={64} h={44} scale={landPulse} opacity={envOp} /> : null}
      </div>
    </div>
  );
};
