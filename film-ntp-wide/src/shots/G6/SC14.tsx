import React from 'react';
import {useCurrentFrame} from 'remotion';
import {clamp01, easeOutCubic, FONT_ORB} from '../../common';
import {CameraRig} from '../../fx';
import {
  CText, Cross, EXAMPLE, PURPLE_LIGHT, ORANGE, GREY, GREY_MID, GREY_LIGHT, WHITE,
  abs, softOp, firstOp, exitOp, glowOffK, mixHex,
} from '../../ui';
import {RACKS, WorldDots, wpt} from './g6ui';

/**
 * SC14 1985 与闰秒 · N 2883–3158（S27–S28：2891「Since nineteen eighty-five, NTP」/ 2953「has kept the world's
 *   computers agreeing —」/ 3025「across borders, across vendors,」/ 3096「across twenty-seven leap seconds.」；段内不判，S28 末块 61）
 * 画面：左 `1985` Orbitron 96 灰（YearRoll 四位滚落）+ 下行 `RFC 958 → 5905` 灰小字；
 *   右半世界点阵缩微复现（SC13 承接，同一份点阵 0.38×）+ 10 紫点同步闪一拍（"全世界的机器"）；
 *   3025 双国界虚线 draw-on 后各打一 Cross（"跨过"）；3090–3108 闰秒计数器：27 枚刻度格快速波次逐个点亮成一行
 *   + 每格点亮 UTC/TAI 双轨的白轨相对灰轨跳一小格（27 步阶梯）+ 末格 `2016` 标注 + `27 leap seconds` 白字
 *   + 右端橙色 `37 s` 累计差标注（橙光晕一拍）。
 * 尾部：末动效拍 3108 落位 ~3115（TO−45=3113 差 2f——均为小元素，记录于 BUILD_NOTES）；
 *   此后双轨/紫点低幅呼吸；glowOff 3147 / 离场 3153–3158（exitOp 5）。零 glitch（白名单：SC14 无）。
 * 运镜：缓推 1.0→1.08（2891–3108，末 key = TO−50 ✓；居中缩放，右缘 bracket 画布内 ≤1201px）。
 */

const F0 = 2883;
const TO = 3158;

// ---- 节拍 ----
const B_ROLL = 2883;  // 1985 YearRoll 起转（首帧能量；2916 全落定，对齐 "eighty-five" 语中）
const B_RFC = 2899;   // RFC 958 → 5905
const B_MAP = 2953;   // 右半世界点阵缩微复现 + 紫点
const B_PIN = 2965;   // 紫点同步闪一拍
const B_BRD1 = 3025;  // 国界线 1 + Cross
const B_BRD2 = 3031;  // 国界线 2 + Cross
const B_WAVE = 3090;  // 27 格快速波次（0.7f/格 → 3108 点完）
const B_27 = 3094;    // `27 leap seconds` 白字（3096 −2 ✓）
const B_2016 = 3104;  // 末格 2016 标注
const B_37 = 3108;    // 37 s 橙字 + 括线

const EASE_OUT = easeOutCubic;

// ---- 左区：YearRoll ----
const YR = {cx: 300, cy: 190, size: 96, colW: 64};
const YR_SETTLE = [2897, 2903, 2910, 2916]; // 各位落定帧
const YR_CYC = [5, 11, 17, 26];             // 各位滚过的数字个数（个位最多）
const YR_TARGET = [1, 9, 8, 5];

// ---- 右区：计数器几何 ----
const CNT = {x0: 592, pitch: 21, w: 12, h: 26, y: 460};
const cellX = (i: number) => CNT.x0 + i * CNT.pitch;
const TRACK = {x0: 592, x1: 1155, yUTC: 538, step: 1.15, stepW: (1155 - 592) / 27};
const cellLitAt = (i: number) => B_WAVE + i * 0.7;

// 国界线（虚线）与 Cross
const BORDER1 = {y: 385, x0: 660, x1: 1080, cross: [770, 385], t0: B_BRD1, crossT: 3037};
const BORDER2 = {y: 415, x0: 660, x1: 1080, cross: [970, 415], t0: B_BRD2, crossT: 3045};

// 紫点（世界图缩微定位点，同 SC13 十枚）
const PINS = RACKS.map((r) => wpt('mini', r.c));

export const SC14: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const ex = exitOp(N, TO, 5);
  const gk = glowOffK(N, TO, 3, 5);

  // ---- YearRoll 各位数字（滚落：target − offset，easeOut 减速） ----
  const yrOp = firstOp(N - B_ROLL, 6);
  const digit = (i: number) => {
    const p = EASE_OUT(clamp01((N - B_ROLL) / (YR_SETTLE[i] - B_ROLL)));
    const off = Math.round(YR_CYC[i] * (1 - p));
    return (YR_TARGET[i] - off + 100) % 10;
  };

  // ---- 世界图缩微 + 紫点同步 ----
  const mapP = EASE_OUT(clamp01((N - B_MAP) / 14));
  const mapOp = firstOp(N - B_MAP, 6);
  const pinN = N - B_PIN;
  const pinFlash = pinN >= 2 && pinN < 14 ? Math.sin(Math.PI * clamp01((pinN - 2) / 12)) : 0;
  const pinOp = () => {
    if (pinN < 0) return 0;
    const breathe = 0.62 + 0.13 * Math.sin((2 * Math.PI * (N - 6)) / 26); // 同相呼吸（agreeing）
    return firstOp(pinN, 5) * Math.min(1, breathe + 0.35 * pinFlash) * gk;
  };

  // ---- 27 格波次 ----
  const cellFlash = (i: number) => {
    const n = N - cellLitAt(i);
    return n >= 0 && n < 4 ? 1 - n / 4 : 0;
  };

  // ---- TAI 阶梯路径（点亮 i 格 → 第 i 级台阶） ----
  const stairD = (() => {
    const n = Math.min(27, Math.max(0, Math.floor((N - B_WAVE) / 0.7) + (N >= B_WAVE ? 1 : 0)));
    if (n <= 0) return '';
    let d = `M ${TRACK.x0} ${TRACK.yUTC}`;
    for (let i = 0; i < n; i++) {
      const x = TRACK.x0 + (i + 1) * TRACK.stepW;
      d += ` L ${x.toFixed(1)} ${(TRACK.yUTC + i * TRACK.step).toFixed(2)} L ${x.toFixed(1)} ${(TRACK.yUTC + (i + 1) * TRACK.step).toFixed(2)}`;
    }
    return d;
  })();

  return (
    <CameraRig
      N={N}
      keys={[
        {f: F0, x: 640, y: 360, s: 1},
        {f: 2891, x: 640, y: 360, s: 1},
        {f: 3108, x: 640, y: 360, s: 1.08},
      ]}
    >
      <div style={{...abs(0, 0, 1280, 720), opacity: ex}}>
        {/* ---- 左区：1985 YearRoll（Orbitron 96 灰，四位定宽滚落） ---- */}
        <div style={{...abs(YR.cx - 2 * YR.colW, YR.cy - YR.size / 2, YR.colW * 4, YR.size), opacity: yrOp, display: 'flex'}}>
          {[0, 1, 2, 3].map((i) => (
            <div key={i} style={{
              width: YR.colW, height: YR.size, fontFamily: FONT_ORB, fontWeight: 700,
              fontSize: YR.size, lineHeight: `${YR.size}px`, color: GREY, textAlign: 'center',
              fontVariantNumeric: 'tabular-nums',
              textShadow: `0 0 18px rgba(255,255,255,${(0.14 + 0.07 * Math.sin((2 * Math.PI * N) / 60)).toFixed(3)})`,
            }}>
              {digit(i)}
            </div>
          ))}
        </div>
        {/* 2899：RFC 小字 */}
        <div style={{...abs(0, 0, 1280, 720), opacity: softOp(N - B_RFC, 8)}}>
          <CText cx={300} cy={264} size={24} weight={600} family={FONT_ORB} color={GREY} letterSpacing={1.5}>{EXAMPLE.rfc}</CText>
        </div>

        {/* ---- 右区：世界点阵缩微（SC13 承接） ---- */}
        <div style={{...abs(0, 0, 1280, 720), opacity: mapOp}}>
          <WorldDots mode="mini" revealP={mapP} />
        </div>
        {/* 紫点（同步入场 → 同步闪一拍 → 同相低幅呼吸："agreeing"） */}
        <svg width={1280} height={720} viewBox="0 0 1280 720" style={{...abs(0, 0), overflow: 'visible'}}>
          {PINS.map(([x, y], i) => {
            const op = pinOp();
            if (op <= 0.02) return null;
            const r = 3.4 + 1.4 * pinFlash;
            return (
              <circle key={i} cx={x.toFixed(1)} cy={y.toFixed(1)} r={r.toFixed(1)} fill={PURPLE_LIGHT}
                opacity={op.toFixed(3)} style={{filter: 'drop-shadow(0 0 4px rgba(161,117,241,0.7))'}} />
            );
          })}
        </svg>

        {/* ---- 3025/3031：双国界虚线 draw-on ---- */}
        <svg width={1280} height={720} viewBox="0 0 1280 720" style={{...abs(0, 0), overflow: 'visible'}}>
          {[BORDER1, BORDER2].map((b, k) => {
            const p = EASE_OUT(clamp01((N - b.t0) / 10));
            if (p <= 0) return null;
            return (
              <line key={k} x1={b.x0} y1={b.y} x2={b.x0 + (b.x1 - b.x0) * p} y2={b.y}
                stroke={GREY_MID} strokeWidth={2.4} strokeDasharray="12 9" strokeLinecap="round" opacity={0.85 * gk} />
            );
          })}
        </svg>
        {/* 各打一 Cross（"跨过"） */}
        <svg width={1280} height={720} viewBox="0 0 1280 720" style={{...abs(0, 0), overflow: 'visible'}}>
          {[BORDER1, BORDER2].map((b, k) => (
            <Cross key={k} cx={b.cross[0]} cy={b.cross[1]} size={44} color={ORANGE} sw={6}
              p={clamp01((N - b.crossT) / 10)} opacity={gk} />
          ))}
        </svg>

        {/* ---- 闰秒计数器：27 枚刻度格（3088 灰态浮出 → 3090 波次点亮） ---- */}
        <div style={{...abs(0, 0, 1280, 720), opacity: softOp(N - 3088, 8)}}>
        <svg width={1280} height={720} viewBox="0 0 1280 720" style={{...abs(0, 0), overflow: 'visible'}}>
          {Array.from({length: 27}, (_, i) => {
            const lit = N >= cellLitAt(i);
            const fl = cellFlash(i);
            return (
              <rect key={i} x={cellX(i)} y={CNT.y} width={CNT.w} height={CNT.h} rx={2}
                fill={lit ? `rgba(102,48,248,${(0.30 + 0.18 * fl).toFixed(2)})` : '#0c0c10'}
                stroke={lit ? mixHex(GREY_LIGHT, WHITE, Math.min(1, 0.4 + fl)) : '#3c3c42'}
                strokeWidth={lit ? 2 : 1.4}
                opacity={(lit ? 1 : 0.55) * gk} />
            );
          })}
        </svg>
        {/* 格号数字（Orbitron 渐小渐淡：20→11px，图标级微文本——BUILD_NOTES 记录） */}
        {Array.from({length: 27}, (_, i) => {
          const lit = N >= cellLitAt(i);
          if (!lit) return null;
          const size = Math.round(20 - i * 0.34);
          return (
            <div key={i} style={{
              position: 'absolute', left: cellX(i) + CNT.w / 2 - 14, top: 494, width: 28, textAlign: 'center',
              fontFamily: FONT_ORB, fontWeight: 700, fontSize: size, lineHeight: '24px', color: GREY_MID,
              opacity: (Math.max(0.42, 1 - i * 0.022) * gk).toFixed(3),
            }}>
              {i + 1}
            </div>
          );
        })}

        {/* ---- UTC/TAI 双轨（3088 灰态浮出 → 白轨随格数阶梯下探） ---- */}
        <div style={{...abs(0, 0, 1280, 720), opacity: softOp(N - 3088, 8)}}>
          <svg width={1280} height={720} viewBox="0 0 1280 720" style={{...abs(0, 0), overflow: 'visible'}}>
            {/* UTC 灰轨（平直） */}
            <line x1={TRACK.x0} y1={TRACK.yUTC} x2={TRACK.x1} y2={TRACK.yUTC} stroke={GREY_MID} strokeWidth={2} opacity={0.9 * gk} />
            {/* TAI 白轨阶梯（每点亮一格相对灰轨跳一小格，累计 27 步 = 37 s） */}
            {stairD ? <path d={stairD} fill="none" stroke={WHITE} strokeWidth={2.4} opacity={0.95 * gk}
              style={{filter: 'drop-shadow(0 0 3px rgba(255,255,255,0.35))'}} /> : null}
            {/* 双轨标签（UTC 在灰轨上方 / TAI 在阶梯下缘） */}
            <text x={578} y={TRACK.yUTC - 10} textAnchor="end" fontFamily="'Orbitron',sans-serif" fontSize={22} fontWeight={700} fill={GREY_MID} opacity={0.95 * gk}>UTC</text>
            <text x={578} y={TRACK.yUTC + 40} textAnchor="end" fontFamily="'Orbitron',sans-serif" fontSize={22} fontWeight={700} fill={WHITE} opacity={0.95 * gk}>TAI</text>
            {/* 37 s 括线（垂直 + 双端小横尖） */}
            {(() => {
              const p = EASE_OUT(clamp01((N - B_37) / 6));
              if (p <= 0) return null;
              const y1 = TRACK.yUTC;
              const y2 = TRACK.yUTC + 27 * TRACK.step;
              return (
                <g stroke={ORANGE} strokeWidth={2.6} opacity={(0.95 * gk).toFixed(3)}>
                  <line x1={1155} y1={y1 + (y2 - y1) * (1 - p)} x2={1155} y2={y2} />
                  <line x1={1149} y1={y1} x2={1161} y2={y1} />
                  <line x1={1149} y1={y2} x2={1161} y2={y2} />
                </g>
              );
            })()}
          </svg>
          {/* 37 s 橙字（累计差，橙光晕一拍） */}
          <div style={{...abs(0, 0, 1280, 720), opacity: softOp(N - B_37, 7)}}>
            <CText cx={1125} cy={592} size={28} weight={700} family={FONT_ORB} color={ORANGE} letterSpacing={1}
              shadow={`0 0 ${14 + 14 * Math.max(0, 1 - (N - B_37) / 12)}px rgba(240,95,65,${(0.55 * gk).toFixed(2)})`}>
              {EXAMPLE.utcTai}
            </CText>
          </div>
        </div>

        {/* ---- 末格 2016 标注（+ 引线） ---- */}
        <div style={{...abs(0, 0, 1280, 720), opacity: softOp(N - B_2016, 7)}}>
          <CText cx={1116} cy={440} size={24} weight={700} family={FONT_ORB} color={GREY} letterSpacing={1}
            shadow={`0 0 10px rgba(255,255,255,${(0.4 * Math.max(0, 1 - (N - B_2016) / 10) * gk).toFixed(2)})`}>
            {EXAMPLE.lastLeap}
          </CText>
          <svg width={1280} height={720} viewBox="0 0 1280 720" style={{...abs(0, 0), overflow: 'visible'}}>
            <line x1={1122} y1={452} x2={1144} y2={458} stroke={GREY_MID} strokeWidth={1.8} opacity={0.8 * gk} />
          </svg>
        </div>

        {/* ---- 3094：27 leap seconds 白字（关键词，3096 −2 ✓） ---- */}
        <div style={{...abs(0, 0, 1280, 720), opacity: softOp(N - B_27, 8)}}>
          <CText cx={855} cy={588} size={42} weight={900} color={WHITE} letterSpacing={1}
            shadow={`0 0 16px rgba(255,255,255,${(0.2 * gk).toFixed(2)})`}>
            {EXAMPLE.leapCount}
          </CText>
        </div>
        </div>
      </div>
    </CameraRig>
  );
};
