import React from 'react';
import {useCurrentFrame} from 'remotion';
import {clamp01, GlitchIn, emphasisPulse, FONT_MONO, FONT_ORB} from '../../common';
import {
  Box, CText, HeaderBar, Pill, abs, softOp, firstOp, exitOp, glowOffK, exitAccel, SoftIn,
  WHITE, GREY, GREY_MID, GREY_LIGHT, ORANGE, CORAL, BLOOM, BLOOM_SOFT,
} from '../../ui';
import {CameraRig, BigNumber, countTo} from '../../fx';

/**
 * SC24 8 字节，4 字段 · N 5532–5730（S39 5540–5708 ¶，章 3 高光时刻·论点型）
 * 上下对照双头条：上方 UDP 短条（480×64，4 格 src port/dst port/length/checksum，橙边）+ 条端 `8`（Orbitron 120px 橙，
 * 14 帧计数 + GlitchIn rgbSplit 6 + 橙光晕脉冲）+ `bytes` 44px；下方 TCP 长条（900×64，ports2/seq/ack/flags/window，灰 dim）
 * + `≥ 20 bytes` 灰 26px；两行间 `vs` 灰小字 + UDP 条右端一条竖直虚线（长短差距可视化，draw-on 12 帧）。
 * 四枚灰章（no handshake/no numbers/no receipts/no ceremony，22px，带删除线）按解说词逐词入场（5536/5568/5600/5622，
 * 分镜表原写 5540「2 帧错峰」→ 改按词对齐覆盖 98 帧长块，防 >3s 静止，见 BUILD_NOTES）。
 * 运镜：5642–5675 33 帧 1→1.15 推向 UDP 短条（cam(660,338)；TCP 条右端 1203 / 灰章顶 161 均在画内，见 BUILD_NOTES）。
 * 停留：末元素（虚线）落位 5676 → 离场 5722（末 8 帧归零），46 帧 ✓；`8` 落位 5655 → 67 帧 ✓（S39 末块 70）。
 * 零扫光；本镜唯一 glitch = `8`（rgbSplit 6）。主角：UDP 头条 + `8` 120px 橙（章 3 唯一大面积橙光）。
 */
const F0 = 5532;
const TO = 5730;
const T_STAMPS = [5536, 5568, 5600, 5622]; // 四枚灰章（按词对齐）
const T_UDP = 5639;   // S39 块2：UDP 短条 wipe（16 帧）
const T_NUM = 5641;   // `8` 计数（14 帧 → 5655）+ GlitchIn（12 帧）
const T_TCP = 5646;   // TCP 长条自左 wipe（20 帧）+ 灰格逐格淡入
const T_VS = 5648;    // vs SoftIn
const T_UNIT = 5657;  // `bytes` SoftIn（数字落位后）
const T_DASH = 5664;  // 竖直虚线 draw-on（12 帧 → 5676）
const T_PUSH = 5642;  // 运镜 33 帧 1→1.15
const EXIT = TO - 8;  // 5722

const STAMPS = ['no handshake', 'no numbers', 'no receipts', 'no ceremony'];
const STAMP_W = [188, 160, 174, 174];
const STAMP_Y = 158, STAMP_H = 56, STAMP_GAP = 22;

const UDP = {x: 250, y: 300, w: 480, h: 64};
const TCP = {x: 250, y: 470, w: 900, h: 64};
const NUM = {cx: 830, cy: 330};
const UDP_FIELDS: Array<{label: string; weight: number}> = [
  {label: 'src port', weight: 1}, {label: 'dst port', weight: 1}, {label: 'length', weight: 1}, {label: 'checksum', weight: 1},
];
const TCP_FIELDS: Array<{label: string; weight: number}> = [
  {label: 'ports', weight: 2}, {label: 'seq', weight: 1}, {label: 'ack', weight: 1}, {label: 'flags', weight: 1}, {label: 'window', weight: 1},
];

export const SC24: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const op = exitOp(N, TO, 8);
  const exDy = exitAccel(Math.max(0, N - EXIT), 0.3);
  const gk = glowOffK(N, TO);

  // 灰章行几何（居中 640）
  const totalW = STAMP_W.reduce((a, b) => a + b, 0) + STAMP_GAP * 3;
  let sx = 640 - totalW / 2;
  const stampX = STAMP_W.map((w) => { const x = sx; sx += w + STAMP_GAP; return x; });

  // `8` 计数（14 帧）+ 落位脉冲 + 橙光晕呼吸
  const nn = N - T_NUM;
  const numVal = nn < 0 ? null : nn < 14 ? countTo(nn, 0, 8, 14) : '8';
  const land = clamp01((N - (T_NUM + 14)) / 8);
  const breathe = 0.5 + 0.5 * Math.sin((2 * Math.PI * (N - 14)) / 30);
  const haloK = land * gk;
  const numPulse = emphasisPulse(N - (T_NUM + 14), {peak: 1.11, up: 12, hold: 4, down: 13});

  // 条 wipe 进度
  const udpP = clamp01((N - T_UDP) / 16);
  const tcpP = clamp01((N - T_TCP) / 20);
  // 竖直虚线 draw-on
  const dashP = clamp01((N - T_DASH) / 12);

  return (
    <CameraRig N={N} keys={[{f: F0, x: 640, y: 360, s: 1}, {f: T_PUSH, x: 640, y: 360, s: 1}, {f: T_PUSH + 33, x: 660, y: 338, s: 1.15}]}>
      <div style={{position: 'absolute', inset: 0, opacity: op, transform: exDy ? `translateY(${exDy.toFixed(1)}px)` : undefined}}>
        {/* 四枚灰章（带删除线，按词对齐逐枚 SoftIn） */}
        {STAMPS.map((s, i) => {
          const sn = N - T_STAMPS[i];
          if (sn < 0) return null;
          const strikeP = clamp01((N - (T_STAMPS[i] + 10)) / 16); // 成片 v4：红删除线 wipe 进度
          const flinch = strikeP > 0 && strikeP < 0.55; // 划线瞬间整章闪亮（大面积，破真静）
          const p = emphasisPulse(N - (T_STAMPS[i] + 8), {peak: 1.02, up: 7, hold: 2, down: 7});
          return (
            <div key={s} style={{position: 'absolute', inset: 0, opacity: firstOp(sn, 8), transform: `scale(${(p * (flinch ? 1.06 : 1)).toFixed(4)})`, transformOrigin: `${stampX[i] + STAMP_W[i] / 2}px ${STAMP_Y + STAMP_H / 2}px`, filter: flinch ? 'brightness(1.5)' : undefined}}>
              <Pill x={stampX[i]} y={STAMP_Y} w={STAMP_W[i]} h={STAMP_H} r={20} stroke={GREY_MID} sw={2.5} fill="#000"
                text={s} fontSize={26} weight={600} family={FONT_MONO} color={GREY} letterSpacing={0} />
              {/* 删除线（出场即有） */}
              <div style={{...abs(stampX[i] + 8, STAMP_Y + STAMP_H / 2 - 2, Math.max(0, (STAMP_W[i] - 16) * clamp01((N - (T_STAMPS[i] + 10)) / 16)), 4), background: CORAL, boxShadow: '0 0 14px 4px rgba(241,96,67,.75)', transform: 'rotate(-2deg)', transformOrigin: '0 50%', opacity: 1}} />
            </div>
          );
        })}

        {/* UDP 短条（4 格，橙边，自左 wipe） */}
        {udpP > 0 ? (
          <div style={{...abs(UDP.x, UDP.y, UDP.w, UDP.h), opacity: softOp(N - T_UDP, 6)}}>
            <HeaderBar x={0} y={0} w={UDP.w} h={UDP.h} fields={UDP_FIELDS} accent={ORANGE} labelSize={22} progress={udpP} />
            {/* 成片 v2：落位后整条亮度呼吸（白罩 0.05↔0.15，40 帧周期——打破 3.3 s 真静；均值变化 ≈0.5 不破 hold） */}
            {udpP >= 1 && N < EXIT ? (
              <div style={{position: 'absolute', inset: 0, background: '#fff', opacity: 0.09 + 0.11 * (1 + Math.sin((2 * Math.PI * (N - T_UDP)) / 40)), pointerEvents: 'none'}} />
            ) : null}
          </div>
        ) : null}

        {/* `8` 大数字（计数 + GlitchIn + 橙硬投影/光晕） + `bytes` */}
        {numVal !== null ? (
          <>
            {/* 橙光晕（radial，落位后呼吸；离场前先灭） */}
            <div style={{...abs(NUM.cx - 150, NUM.cy - 110, 300, 220), borderRadius: '50%',
              background: `radial-gradient(circle, rgba(240,95,65,${(0.34 * haloK * (0.75 + 0.25 * breathe)).toFixed(3)}) 0%, rgba(240,95,65,${(0.16 * haloK * (0.75 + 0.25 * breathe)).toFixed(3)}) 42%, rgba(240,95,65,0) 72%)`}} />
            <div style={{position: 'absolute', inset: 0, transform: `scale(${numPulse.toFixed(4)})`, transformOrigin: `${NUM.cx}px ${NUM.cy}px`}}>
              <GlitchIn N={N} f0={T_NUM} rgbSplit={6} seed={24}>
                <BigNumber cx={NUM.cx} cy={NUM.cy} value={numVal} size={120} color={ORANGE} dy={-2}
                  shadow={`6px 6px 0 rgba(179,74,46,.9), 0 0 ${(16 + 26 * haloK * (0.75 + 0.25 * breathe)).toFixed(0)}px rgba(240,95,65,${(0.4 + 0.35 * haloK).toFixed(2)})`} />
              </GlitchIn>
            </div>
            <SoftIn N={N} f0={T_UNIT}>
              <CText cx={NUM.cx + 128} cy={NUM.cy + 22} size={44} weight={700} family={FONT_MONO} color={GREY_LIGHT} dy={0}>bytes</CText>
            </SoftIn>
          </>
        ) : null}

        {/* vs */}
        <SoftIn N={N} f0={T_VS}>
          <CText cx={640} cy={425} size={26} weight={600} family={FONT_MONO} italic color={GREY} opacity={0.85} dy={0}>vs</CText>
        </SoftIn>

        {/* TCP 长条（灰 dim，自左 wipe + 灰格逐格淡入） */}
        {tcpP > 0 ? (
          <div style={{...abs(TCP.x, TCP.y, TCP.w, TCP.h), opacity: softOp(N - T_TCP, 6)}}>
            <HeaderBar x={0} y={0} w={TCP.w} h={TCP.h} fields={TCP_FIELDS} accent={GREY_MID} labelSize={22} dim progress={tcpP} />
          </div>
        ) : null}
        <SoftIn N={N} f0={T_TCP + 16}>
          <CText cx={1055} cy={558} size={26} weight={600} family={FONT_MONO} color={GREY} dy={0}>≥ 20 bytes</CText>
        </SoftIn>

        {/* 竖直虚线（UDP 条右端 x738，两行之间，长短差距可视化） */}
        {dashP > 0 ? (
          <svg width={1280} height={720} viewBox="0 0 1280 720" style={{position: 'absolute', inset: 0}}>
            <line x1={738} y1={UDP.y + UDP.h + 8} x2={738} y2={TCP.y - 8} stroke={GREY_MID} strokeWidth={2} strokeDasharray="7 7"
              pathLength={100} strokeDashoffset={100 * (1 - dashP)} opacity={0.9} />
            <circle cx={738} cy={TCP.y - 8} r={3} fill={GREY_MID} opacity={dashP} />
          </svg>
        ) : null}
      </div>
    </CameraRig>
  );
};
