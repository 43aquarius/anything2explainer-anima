import React from 'react';
import {useCurrentFrame} from 'remotion';
import {clamp01, easeOutCubic, emphasisPulse, GlitchIn, powIn, FONT_HEAVY, FONT_ORB} from '../../common';
import {BigNumber, CameraRig} from '../../fx';
import {CText, PacketIcon, GREY, GREY_MID, ORANGE, PURPLE, RED_DEEP, WHITE, abs, firstOp, softOp, exitOp, glowOffK, scaleIn} from '../../ui';

/**
 * SC07 一秒两秒四秒（全片最高潮·大数字型）· N 869–983（S08 877–981 ¶；块 877 丢了就重发 / 940 计时器翻倍）
 * 版式：上部（y 260–410）：发送轨道 y 320（x 100–560，白线 + 紫色原点）+ 回执轨道 y 385（虚线，R→L）；
 *   信封 #1 877 加速发射（24 帧出画）→ 回执轨道 891 画完 → 红 `×`（893，闪一次 + 断线缺口渐开）→
 *   重发信封 897 scaleIn 10 帧 + 紫光 → 907 再发射（20 帧）→ 上半 929–941 让位淡出（推近期间，同横版 SC15）。
 * 中下部：`1 s`/`2 s`/`4 s`（Orbitron 90px 橙，y 545/660/775，cx 190）6 帧错峰依次 10 帧计数落位
 *   （897/903/909——分镜表「间隔 16 帧」+ 940 起算与「7 s 满态→离场 ≥45」数学上不可兼得，见 BUILD_NOTES）；
 *   每段一条橙色等待条（x 280 起，宽 70/140/280 = 1:2:4）落位后 wipe 12 帧。
 * 底部：`7 s` BigNumber 130px 橙（(415,900)）16 帧计数 0→7（921–937，GlitchIn rgbSplit 6 本镜唯一 glitch）
 *   + emphasisPulse 1.11 + 橙光晕爆发（扩散环 16 帧 + 径向光 30 帧呼吸 ±14%，961 起收敛到 ±5%）
 *   + 左侧 `total wait` 灰 24px。满态 937 = 块 2（940）−3 ✓。
 * 运镜：908–941（33 帧）1→1.22 推向 7 s（pivot (410,865)；结束 941 = 离场起点 975 − 34 ✓ 不进末拍）。
 * 停留：满态 937 → 离场 975（末 8 帧归零，光先灭 969）= 38 帧 ✓ ≥30（45 不可达，已记录）。
 */
const F0 = 869;
const TO = 983;

const T_SEND = 877, SEND_LEN = 24, T_RTRACK = 881, T_X = 893, T_RESEND = 897, T_RELAUNCH = 907, RELAUNCH_LEN = 20, T_TOPFADE = 929;
const T_N1 = 897, T_N2 = 903, T_N3 = 909, NUM_LEN = 10, BAR_LEN = 12;
const T_7 = 921, T7_LEN = 10, T_7END = 931;

const TRACK = {x0: 100, x1: 560, ySend: 320, yBack: 385};
const XAT = 330;
const NUMS = [
  {t0: T_N1, v: 1, y: 545, barW: 70},
  {t0: T_N2, v: 2, y: 660, barW: 140},
  {t0: T_N3, v: 4, y: 775, barW: 280},
];
const BIG7 = {cx: 415, cy: 900};
const CAM_KEYS = [
  {f: F0, x: 360, y: 640, s: 1},
  {f: 908, x: 360, y: 640, s: 1},
  {f: 941, x: 410, y: 865, s: 1.22},
];

/** 发射位移：加速（powIn 1.6）从 x0 到 x1 */
const launchX = (n: number, len: number) => TRACK.x0 + (TRACK.x1 - TRACK.x0) * powIn(1.6)(clamp01(n / len));

export const SC07: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const exOp = exitOp(N, TO, 4);
  if (exOp <= 0) return null;

  const topOp = 1 - clamp01((N - T_TOPFADE) / 12); // 上半让位
  const glowOff = glowOffK(N, TO, 2, 4); // 成片 v2c：光灭推迟到 977（原 969 早灭在 973 造成假性大变化）

  // × 的呼吸 + 首次闪
  const xn = N - T_X;
  const xGlow = 0.55 + 0.35 * Math.sin((2 * Math.PI * (N - 4)) / 30);
  const xFlash = xn < 6 ? 1 + 0.8 * (1 - xn / 6) : 1;

  // 7 s 计数与强调
  const n7 = N - T_7;
  const v7 = n7 < 0 ? -1 : Math.round(7 * easeOutCubic(clamp01(n7 / T7_LEN)));
  const pulse7 = emphasisPulse(N - T_7END, {peak: 1.11, up: 3, hold: 1, down: 3}); // 成片 v2c：7 帧紧凑脉冲，938 前收尾
  const glowK = glowOff * clamp01((N - (T_7 + 4)) / 8);
  const breatheAmp = 0.14 - 0.14 * clamp01((N - (T_7END + 10)) / 4); // 成片 v2b：计数后 14 帧内收敛到 0（腾 ≥36 帧稳定期）
  const breathe = 1 + breatheAmp * Math.sin((2 * Math.PI * (N - 6)) / 30);
  const burstN = N - T_7END;

  return (
    <CameraRig N={N} keys={CAM_KEYS}>
      <div style={{position: 'absolute', inset: 0, opacity: exOp}}>
        {/* ================= 上半：丢包与重发（929–941 让位） ================= */}
        <div style={{position: 'absolute', inset: 0, opacity: topOp}}>
          {/* 发送轨道 + 紫色原点 */}
          <svg width={720} height={1280} viewBox="0 0 720 1280" style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
            <line x1={TRACK.x0} y1={TRACK.ySend} x2={TRACK.x1} y2={TRACK.ySend} stroke={WHITE} strokeWidth={2.5} opacity={0.9} style={{filter: 'drop-shadow(0 0 3px rgba(255,255,255,0.35))'}} />
            {/* 回执轨道（虚线，R→L draw-on；× 出现后断线缺口渐开） */}
            {(() => {
              const p = clamp01((N - T_RTRACK) / 10);
              const gap = 26 * clamp01((N - T_X) / 8);
              const xr = TRACK.x1 - (TRACK.x1 - TRACK.x0) * p; // draw 前沿（R→L）
              const segs: Array<[number, number]> = [];
              if (TRACK.x1 - Math.max(xr, XAT + gap) > 2) segs.push([TRACK.x1, Math.max(xr, XAT + gap)]);
              if (XAT - gap - xr > 2) segs.push([Math.min(xr, XAT - gap), XAT - gap]);
              return segs.map(([a, b], i) => (
                <line key={i} x1={a} y1={TRACK.yBack} x2={b} y2={TRACK.yBack} stroke={GREY_MID} strokeWidth={2} strokeDasharray="9 9" opacity={0.7} />
              ));
            })()}
          </svg>
          <div style={{...abs(TRACK.x0 - 7, TRACK.ySend - 7, 14, 14), borderRadius: 7, background: PURPLE, boxShadow: '0 0 10px rgba(102,45,248,.8)'}} />

          {/* 信封 #1：877 加速发射出画 */}
          {(() => {
            const n = N - T_SEND;
            if (n < 0 || n > SEND_LEN) return null;
            const x = launchX(n, SEND_LEN);
            return <PacketIcon cx={x} cy={TRACK.ySend - 24} w={60} h={44} opacity={softOp(n, 4) * clamp01(1 - (n - SEND_LEN + 4) / 4)} />;
          })()}

          {/* 红 ×（回执没回来；闪一次后呼吸；非 glitch——白名单只有 7 s） */}
          {xn >= 0 ? (
            <div style={{position: 'absolute', inset: 0, opacity: softOp(xn, 4)}}>
              <CText cx={XAT} cy={TRACK.yBack} size={72} weight={900} family={FONT_HEAVY} color={RED_DEEP}
                shadow={`0 0 ${Math.round((14 + 10 * xGlow) * xFlash)}px rgba(236,8,31,${(0.35 + 0.3 * xGlow).toFixed(2)})`}>×</CText>
            </div>
          ) : null}

          {/* 重发信封：scaleIn 10 帧（紫光）→ 907 再发射 */}
          {(() => {
            const n = N - T_RESEND;
            if (n < 0) return null;
            const s = n < 10 ? 0.3 + 0.7 * scaleIn(n, 10) : 1;
            const flying = N >= T_RELAUNCH;
            const fn = N - T_RELAUNCH;
            const x = flying ? launchX(fn, RELAUNCH_LEN) : TRACK.x0;
            const op = flying ? softOp(fn, 3) * clamp01(1 - (fn - RELAUNCH_LEN + 4) / 4) : 1;
            return (
              <div style={{position: 'absolute', inset: 0, opacity: firstOp(n, 4) * op, transform: `scale(${s.toFixed(4)})`, transformOrigin: `${TRACK.x0}px ${TRACK.ySend - 24}px`}}>
                <PacketIcon cx={x} cy={TRACK.ySend - 24} w={60} h={44} accent glow={N < T_RELAUNCH + 6} />
              </div>
            );
          })()}
        </div>

        {/* ================= 中下部：三段等待大字 + 等待条 ================= */}
        {NUMS.map((m, i) => {
          const n = N - m.t0;
          if (n < 0) return null;
          const k = clamp01(n / NUM_LEN);
          const val = Math.round(m.v * (1 - Math.pow(1 - k, 2)));
          const pop = 1 + 0.12 * (1 - k); // 落位时轻微收拢
          const barK = clamp01((N - (m.t0 + NUM_LEN)) / BAR_LEN);
          return (
            <React.Fragment key={i}>
              <div style={{...abs(190 - 150, m.y - 60, 300, 120), transform: `scale(${pop.toFixed(4)})`, transformOrigin: '150px 60px', opacity: softOp(n, 4)}}>
                <CText cx={150} cy={60} size={90} weight={700} family={FONT_ORB} color={ORANGE} letterSpacing={2} dy={0}
                  shadow="0 0 18px rgba(240,95,65,.5)" style={{fontVariantNumeric: 'tabular-nums'}}>{val} s</CText>
              </div>
              {barK > 0 ? (
                <div style={{...abs(280, m.y - 7, m.barW * barK, 14), borderRadius: 7, background: ORANGE, boxShadow: '0 0 10px 2px rgba(240,95,65,.55)'}} />
              ) : null}
            </React.Fragment>
          );
        })}

        {/* ================= 底部：7 s 主角（BigNumber 130px 橙 + 橙光晕） ================= */}
        {n7 >= 0 ? (
          <>
            {/* 径向橙光晕（30 帧呼吸 ±14% → 收敛 ±5%；离场前先灭光） */}
            <div style={{...abs(BIG7.cx - 205 * breathe, BIG7.cy - 205 * breathe, 410 * breathe, 410 * breathe), borderRadius: '50%',
              background: `radial-gradient(circle, rgba(240,95,65,${(0.34 * glowK).toFixed(3)}) 0%, rgba(240,95,65,${(0.16 * glowK).toFixed(3)}) 40%, rgba(240,95,65,0) 70%)`}} />
            {/* 光晕爆发扩散环（16 帧） */}
            {burstN >= 0 && burstN <= 16 ? (
              <svg width={720} height={1280} viewBox="0 0 720 1280" style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
                <circle cx={BIG7.cx} cy={BIG7.cy} r={115 + burstN * 14} fill="none" stroke={ORANGE} strokeWidth={Math.max(1, 4 - burstN * 0.22)} opacity={0.8 * (1 - burstN / 16)} />
              </svg>
            ) : null}
            <div style={{...abs(BIG7.cx - 240, BIG7.cy - 110, 480, 220), transform: `scale(${pulse7.toFixed(4)})`, transformOrigin: '240px 110px'}}>
              <GlitchIn N={N} f0={T_7} rgbSplit={6} seed={17}>
                <BigNumber cx={240} cy={110} value={`${v7} s`} size={130} color={ORANGE} letterSpacing={2} dy={0}
                  shadow="6px 6px 0 rgba(240,95,65,.4), 0 0 34px rgba(240,95,65,.6)" />
              </GlitchIn>
            </div>
          </>
        ) : null}

        {/* 左侧小字 total wait */}
        <div style={{position: 'absolute', inset: 0, opacity: softOp(N - (T_7 + 8), 8)}}>
          <CText cx={178} cy={BIG7.cy} size={24} weight={600} color={GREY} letterSpacing={1}>total wait</CText>
        </div>
      </div>
    </CameraRig>
  );
};
