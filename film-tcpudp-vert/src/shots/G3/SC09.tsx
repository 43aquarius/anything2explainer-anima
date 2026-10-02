import React from 'react';
import {useCurrentFrame} from 'remotion';
import {GlitchIn, clamp01, emphasisPulse, FONT_MONO, FONT_ORB} from '../../common';
import {
  CText, HeaderBar, Pill, abs, softOp, firstOp, exitOp, glowOffK, exitAccel, SoftIn,
  WHITE, GREY, GREY_MID, ORANGE,
} from '../../ui';
import {CameraRig, countTo} from '../../fx';

/**
 * SC09 8 字节 · N 1102–1211（S10 1110–1209 段内；块 1110「No handshake. No receipts.」/ 1179「Eight bytes of header.」）
 * 版式（竖版安全区 y240–990 / x40–620，中轴 360）：
 *   上部 UDP 头部短条 x85–585（4 格 src port/dst port/length/checksum，橙边 24px 标签）+ 条下 `8 bytes`
 *   Orbitron 98px 橙（14 帧计数 + GlitchIn rgbSplit 6 = 本镜唯一 glitch + 橙光晕呼吸）；
 *   下部 TCP 头部长条 x85–610（10 格灰 dim 无名格——竖版事实清单不含 TCP 字段名，灰格多列即「 machinery 长尾」）
 *   + `≥ 20 bytes` 灰 28px；两段之间 `vs` 灰 36px；UDP 右缘竖直虚线（x585，TCP 行 y650–742，draw-on 12 帧）
 *   标记「UDP 到此为止、TCP 继续」；顶部两枚灰角标 `no handshake` `no receipts`（24px mono + 删除线，按词对齐 1110/1118）。
 * 节拍：1110 TCP 长条自左 wipe 18 帧 + ≥20 bytes SoftIn（先给「重」的）+ vs；1179 UDP 短条 wipe 14 帧 +
 *   `8 bytes` 计数落位（1193）+ 橙光晕脉冲；1191 虚线 draw-on → 1203。
 * 运镜：33 帧 1→1.15 **前置于 1130–1163**（推向 UDP 条所在上半区）：分镜表把推近写在 1179 揭示之后，
 *   但「运镜期间不做 GlitchIn」+ 本镜仅 110 帧的预算使 1179 后推近必然与 glitch(1181–1193) 重叠且挤进末 8 帧离场
 *   （1179+33=1212 > 离场 1204）——改为「先推近、UDP 条落位在推满的画框里」，见 BUILD_NOTES。
 *   末态 cam(390,570)：内容 world x85–610 → 屏幕 x9–613、y318–900，全在画内且不越 620 / 字幕带。
 * 停留：段内不判（S10→S11 同段）。末 8 帧归零（1204–1211），橙光先灭。
 * 主角：UDP 条 + `8 bytes` 98px 橙（橙光晕）；对比度由 8 / ≥ 20 数字 + 虚线承担（竖版安全宽把条长对比压到
 *   500:525，TCP 字段名不在竖版事实清单 → 无名灰格，见 BUILD_NOTES）。
 */
const F0 = 1102;
const TO = 1211;
const T_TCP = 1110, TCP_LEN = 18, T_GE = 1118, T_VS = 1116;
const T_TAG = [1110, 1118];
const T_UDP = 1179, UDP_LEN = 14;
const T_NUM = 1179, NUM_LEN = 14, T_GLI = 1181, T_LAND = 1193;
const T_DASH = 1191, DASH_LEN = 12;
const T_PUSH = 1130, PUSH_LEN = 33;
const EXIT = TO - 8; // 1204

const TAGS = [
  {text: 'no handshake', x: 162, w: 198},
  {text: 'no receipts', x: 384, w: 174},
];
const TAG_Y = 290, TAG_H = 40;

const UDP_BAR = {x: 85, y: 386, w: 500, h: 64};
const TCP_BAR = {x: 85, y: 658, w: 525, h: 76};
const NUM = {cx: 360, cy: 528};
const UDP_FIELDS: Array<{label: string; weight: number}> = [
  {label: 'src port', weight: 1}, {label: 'dst port', weight: 1}, {label: 'length', weight: 1}, {label: 'checksum', weight: 1},
];
const TCP_FIELDS: Array<{label: string; weight: number}> = Array.from({length: 10}, () => ({label: '', weight: 1}));
const DASH = {x: UDP_BAR.x + UDP_BAR.w, y0: 650, y1: 742};

const KEYS = [
  {f: F0, x: 360, y: 640, s: 1},
  {f: T_PUSH, x: 360, y: 640, s: 1},
  {f: T_PUSH + PUSH_LEN, x: 390, y: 570, s: 1.15},
];

export const SC09: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const op = exitOp(N, TO, 8);
  if (op <= 0) return null;
  const exDy = exitAccel(Math.max(0, N - EXIT), 0.25);
  const gk = glowOffK(N, TO);

  const tcpP = clamp01((N - T_TCP) / TCP_LEN);
  const udpP = clamp01((N - T_UDP) / UDP_LEN);
  const dashP = clamp01((N - T_DASH) / DASH_LEN);

  // —— `8 bytes` 计数（14 帧）+ 落位脉冲 + 橙光晕呼吸 ——
  const nn = N - T_NUM;
  const numVal = nn < 0 ? null : nn < NUM_LEN ? countTo(nn, 0, 8, NUM_LEN) : '8';
  const numPulse = emphasisPulse(N - T_LAND, {peak: 1.11, up: 12, hold: 4, down: 13});
  const breathe = 0.5 + 0.5 * Math.sin((2 * Math.PI * (N - 14)) / 30);
  const haloK = clamp01((N - T_LAND) / 8) * gk;

  return (
    <CameraRig N={N} keys={KEYS}>
      <div style={{position: 'absolute', inset: 0, opacity: op, transform: exDy ? `translateY(${exDy.toFixed(1)}px)` : undefined}}>
        {/* —— 两枚灰角标（带删除线，按词对齐）—— */}
        {TAGS.map((t, i) => {
          const tn = N - T_TAG[i];
          if (tn < 0) return null;
          const p = emphasisPulse(N - (T_TAG[i] + 8), {peak: 1.02, up: 7, hold: 2, down: 7});
          return (
            <div key={t.text} style={{position: 'absolute', inset: 0, opacity: firstOp(tn, 8), transform: `scale(${p.toFixed(4)})`, transformOrigin: `${t.x + t.w / 2}px ${TAG_Y + TAG_H / 2}px`}}>
              <Pill x={t.x} y={TAG_Y} w={t.w} h={TAG_H} r={20} stroke={GREY_MID} sw={2} fill="#000"
                text={t.text} fontSize={24} weight={600} family={FONT_MONO} color={GREY} letterSpacing={0} textDy={0} />
              <div style={{...abs(t.x + 10, TAG_Y + TAG_H / 2 - 1.25, t.w - 20, 2.5), background: GREY, transform: 'rotate(-2deg)', opacity: 0.85}} />
            </div>
          );
        })}

        {/* —— TCP 长条（灰 dim 无名格，自左 wipe 18 帧；「先给重的」）—— */}
        {tcpP > 0 ? (
          <div style={{position: 'absolute', inset: 0, opacity: softOp(N - T_TCP, 6)}}>
            <HeaderBar x={TCP_BAR.x} y={TCP_BAR.y} w={TCP_BAR.w} h={TCP_BAR.h} fields={TCP_FIELDS} accent={GREY_MID} labelSize={24} dim progress={tcpP} />
          </div>
        ) : null}
        <SoftIn N={N} f0={T_GE}>
          <CText cx={360} cy={782} size={28} weight={600} family={FONT_MONO} color={GREY} dy={0}>≥ 20 bytes</CText>
        </SoftIn>

        {/* —— vs —— */}
        <SoftIn N={N} f0={T_VS} len={6} dy={0}>
          <CText cx={360} cy={600} size={36} weight={600} family={FONT_MONO} italic color={GREY} opacity={0.85} dy={0}>vs</CText>
        </SoftIn>

        {/* —— UDP 短条（4 格橙边，自左 wipe 14 帧）—— */}
        {udpP > 0 ? (
          <div style={{position: 'absolute', inset: 0, opacity: softOp(N - T_UDP, 6)}}>
            <HeaderBar x={UDP_BAR.x} y={UDP_BAR.y} w={UDP_BAR.w} h={UDP_BAR.h} fields={UDP_FIELDS} accent={ORANGE} labelSize={24} progress={udpP} />
          </div>
        ) : null}

        {/* —— `8 bytes`（橙光晕 + 计数 + GlitchIn rgbSplit 6 = 本镜唯一 glitch）—— */}
        {numVal !== null ? (
          <>
            <div style={{...abs(NUM.cx - 165, NUM.cy - 115, 330, 230), borderRadius: '50%',
              background: `radial-gradient(circle, rgba(240,95,65,${(0.34 * haloK * (0.75 + 0.25 * breathe)).toFixed(3)}) 0%, rgba(240,95,65,${(0.16 * haloK * (0.75 + 0.25 * breathe)).toFixed(3)}) 42%, rgba(240,95,65,0) 72%)`}} />
            <div style={{position: 'absolute', inset: 0, transform: `scale(${numPulse.toFixed(4)})`, transformOrigin: `${NUM.cx}px ${NUM.cy}px`}}>
              <GlitchIn N={N} f0={T_GLI} rgbSplit={6} seed={9}>
                <CText cx={NUM.cx} cy={NUM.cy} size={98} weight={700} family={FONT_ORB} color={ORANGE} letterSpacing={2} dy={-2}
                  shadow={`4px 4px 0 rgba(179,74,46,.9), 0 0 ${(14 + 24 * haloK * (0.75 + 0.25 * breathe)).toFixed(0)}px rgba(240,95,65,${(0.38 + 0.32 * haloK).toFixed(2)})`}
                  style={{fontVariantNumeric: 'tabular-nums'}}>
                  {numVal} bytes
                </CText>
              </GlitchIn>
            </div>
          </>
        ) : null}

        {/* —— 竖直虚线（UDP 右缘 x585，标在 TCP 行上：UDP 到此为止、TCP 继续；draw-on 12 帧）—— */}
        {dashP > 0 ? (
          <svg width={720} height={1280} viewBox="0 0 720 1280" style={{position: 'absolute', inset: 0}}>
            <line x1={DASH.x} y1={DASH.y0} x2={DASH.x} y2={DASH.y1} stroke={GREY_MID} strokeWidth={2.5} strokeDasharray="7 7"
              pathLength={100} strokeDashoffset={100 * (1 - dashP)} opacity={0.9} />
            <circle cx={DASH.x} cy={DASH.y1} r={3.2} fill={GREY_MID} opacity={dashP} />
          </svg>
        ) : null}
      </div>
    </CameraRig>
  );
};
