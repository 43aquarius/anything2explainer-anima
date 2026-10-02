import React from 'react';
import {useCurrentFrame} from 'remotion';
import {clamp01, easeInOutPow, easeOutCubic, kf, FONT_MONO} from '../../common';
import {ClockIcon, CText, EXAMPLE, GREY, GREY_LINE, ORANGE, PURPLE_LIGHT, WHITE, abs, firstOp, exitOp, MonoText, SoftIn, scaleIn} from '../../ui';
import {CameraRig, HeroGlow} from '../../fx';
import {LockGlyph, tri} from './g7ui';

/**
 * SC37 信封外面仍然可见 · N 8232–8559（S47 8240–8366 / S48 8377–8517 ¶+gap20：
 *   8240 还能看见信封 / 8289 谁何时多少 / 8377 我们的谜题 / 8433 没读数据只看时序）
 * 版式：锁信封（0.8× SC05 款，封口小锁）8232 承接 SC36 保险柜滑入中央（16 帧承接位移）；
 *   三条引线标注 who（→地址栏）/ when（→信封角小钟，秒针持续转）/ how much（→右侧厚度标尺），
 *   依次 draw-on + 标签 SoftIn + 部位白闪；信封下 mini 时间轴（SC31 缩微，重发点橙依次点亮）
 *   + 紫色扫描光带循环重放（timing 重放 = 持续动作）+ `timing only` 灰字。
 * 运镜：8289–8369 80 帧 1→1.05 慢推（落位前结束，不进末拍）。零 glitch。
 * 停留：段末 ¶+gap20 — 末拍 `timing only` 落位 8441 / 橙点末枚 8459 → 离场 8551，稳定 ≥90 帧 ✓。
 * 主角：锁信封 260px（HeroGlow 常亮）；光：引线端点白亮 / 橙点橙。末 8 帧归零。
 */
const F0 = 8232, TO = 8559;
const T_ENV = 8232, T_WHO = 8289, T_WHEN = 8319, T_HOW = 8349, T_TL = 8377, T_DOTS = 8433, T_TXT = 8433;
const CAM_KEYS = [
  {f: 8289, x: 640, y: 360, s: 1},
  {f: 8369, x: 640, y: 380, s: 1.05},
];
const ENV = {x: 430, y: 200, w: 420, h: 260}; // 信封世界坐标
const TL = {x0: 460, x1: 810, y: 552};
const REQ_X = 487;
const RET_X = [522, 592, 732]; // 间隔 1s/2s/4s（缩微 0.35×）
// 引线标注
const CALLOUTS = [
  {label: 'who', lx: 298, ly: 258, x0: 340, y0: 258, x1: 450, y1: 258, t: T_WHO},
  {label: 'when', lx: 1008, ly: 240, x0: 952, y0: 240, x1: 845, y1: 228, t: T_WHEN},
  {label: 'how much', lx: 1018, ly: 335, x0: 948, y0: 335, x1: 884, y1: 335, t: T_HOW},
];

export const SC37: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const op = exitOp(N, TO, 8);
  // 承接位移：SC36 保险柜 (960,400) → 中央 (640,330)，16 帧
  const dx = kf(N, [[T_ENV, 320], [T_ENV + 16, 0]], easeInOutPow(2.5));
  const dy = kf(N, [[T_ENV, 70], [T_ENV + 16, 0]], easeInOutPow(2.5));
  const flapP = clamp01((N - (T_ENV + 4)) / 16);
  // 时间轴 wipe（20 帧）
  const tlP = easeOutCubic(clamp01((N - T_TL) / 20));
  // 扫描光带：75 帧循环（扫 60 + 驻 15）
  const scanT = N >= T_TL ? (N - T_TL) % 75 : -1;
  const scanX = scanT >= 0 && scanT < 60 ? TL.x0 + (TL.x1 - TL.x0) * (scanT / 60) : TL.x1;
  const scanOp = scanT < 0 ? 0 : scanT < 60 ? 0.85 : 0.85 * (1 - (scanT - 60) / 15);
  return (
    <div style={{position: 'absolute', inset: 0, opacity: op}}>
      <CameraRig N={N} keys={CAM_KEYS}>
        {/* ===== 锁信封（承接滑入） ===== */}
        <div style={{position: 'absolute', inset: 0, transform: `translate(${dx.toFixed(1)}px, ${dy.toFixed(1)}px)`, opacity: firstOp(N - T_ENV, 6)}}>
          <HeroGlow x={ENV.x} y={ENV.y} w={ENV.w} h={ENV.h} r={12} N={N} k={0.9} />
          {/* 信封体 */}
          <div style={{...abs(ENV.x, ENV.y, ENV.w, ENV.h), background: '#000', border: `3px solid ${WHITE}`, borderRadius: 6, filter: 'drop-shadow(0 0 2px rgba(255,255,255,.35))'}} />
          {/* 封口折线（draw-on） */}
          {flapP > 0 ? (
            <svg width={ENV.w} height={ENV.h} viewBox={`0 0 ${ENV.w} ${ENV.h}`} style={{position: 'absolute', left: ENV.x, top: ENV.y, overflow: 'visible'}}>
              <path d={`M 3,3 L ${ENV.w / 2},${145} L ${ENV.w - 3},3`} fill="none" stroke={WHITE} strokeWidth={2.5} pathLength={100} strokeDasharray={100} strokeDashoffset={100 * (1 - flapP)} strokeLinejoin="round" />
            </svg>
          ) : null}
          {/* header / payload 分隔虚线 */}
          <div style={{...abs(ENV.x + 18, ENV.y + 92, ENV.w - 36, 0), borderTop: `2.5px dashed ${GREY_LINE}`}} />
          {/* 地址（who 的目标部位） */}
          <div style={{position: 'absolute', inset: 0, filter: N >= T_WHO + 14 ? `brightness(${(1 + 0.7 * tri(N - T_WHO - 14, 9)).toFixed(2)})` : undefined}}>
            <SoftIn N={N} f0={T_ENV + 14}>
              <MonoText x={ENV.x + 26} y={ENV.y + 30} size={22} color={GREY}>{`from ${EXAMPLE.clientIp}`}</MonoText>
              <MonoText x={ENV.x + 26} y={ENV.y + 62} size={22} color={GREY}>{`to   ${EXAMPLE.serverIp}`}</MonoText>
            </SoftIn>
          </div>
          {/* payload（点阵 + 文本线条，读不到的内容示意） */}
          <SoftIn N={N} f0={T_ENV + 16}>
            {[0, 1, 2].map((i) => (
              <div key={i} style={{...abs(ENV.x + 32, ENV.y + 172 + i * 24, i === 1 ? 92 : 122, 7), background: GREY_LINE, opacity: 0.85}} />
            ))}
            {Array.from({length: 12}, (_, i) => (
              <div key={`d${i}`} style={{...abs(ENV.x + 258 + (i % 4) * 30, ENV.y + 168 + Math.floor(i / 4) * 24, 9, 9), borderRadius: 2, background: i % 5 === 0 ? PURPLE_LIGHT : GREY_LINE, opacity: 0.9}} />
            ))}
          </SoftIn>
          {/* 封口小锁（draw-on） */}
          <LockGlyph cx={ENV.x + ENV.w / 2} cy={ENV.y + 152} s={0.5} p={clamp01((N - (T_ENV + 10)) / 12)} rot={8 * Math.sin((2 * Math.PI * N) / 96)} />
          {/* 角上的小钟（when 的目标部位，秒针持续转） */}
          <div style={{position: 'absolute', inset: 0, filter: N >= T_WHEN + 14 ? `brightness(${(1 + 0.7 * tri(N - T_WHEN - 14, 9)).toFixed(2)})` : undefined}}>
            <SoftIn N={N} f0={T_ENV + 8}>
              <ClockIcon cx={ENV.x + 370} cy={ENV.y + 24} r={27} N={N} accent={PURPLE_LIGHT} />
            </SoftIn>
          </div>
        </div>
        {/* ===== 三条引线标注 ===== */}
        {CALLOUTS.map((c) => {
          const ln = N - c.t;
          if (ln < 0) return null;
          const p = clamp01(ln / 12);
          return (
            <div key={c.label}>
              <svg width={1280} height={720} viewBox="0 0 1280 720" style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
                <line x1={c.x0} y1={c.y0} x2={c.x1} y2={c.y1} stroke={WHITE} strokeWidth={2.5} pathLength={100} strokeDasharray={100} strokeDashoffset={100 * (1 - p)} />
                {p > 0.9 ? <circle cx={c.x1} cy={c.y1} r={5} fill={WHITE} style={{filter: 'drop-shadow(0 0 8px rgba(255,255,255,.9))'}} /> : null}
              </svg>
              <SoftIn N={N} f0={c.t}>
                <CText cx={c.lx} cy={c.ly} size={26} weight={700}>{c.label}</CText>
              </SoftIn>
            </div>
          );
        })}
        {/* 厚度标尺（how much 的目标部位，draw-on + 白闪） */}
        <div style={{position: 'absolute', inset: 0, filter: N >= T_HOW + 14 ? `brightness(${(1 + 0.7 * tri(N - T_HOW - 14, 9)).toFixed(2)})` : undefined}}>
          {N >= T_HOW ? (
            <svg width={40} height={150} viewBox="0 0 40 150" style={{position: 'absolute', left: 852, top: 268, overflow: 'visible', opacity: clamp01((N - T_HOW) / 6)}}>
              <line x1={20} y1={0} x2={20} y2={150} stroke={WHITE} strokeWidth={2.5} pathLength={100} strokeDasharray={100} strokeDashoffset={100 * (1 - clamp01((N - T_HOW) / 12))} />
              <line x1={6} y1={0} x2={34} y2={0} stroke={WHITE} strokeWidth={2.5} />
              <line x1={6} y1={150} x2={34} y2={150} stroke={WHITE} strokeWidth={2.5} />
              {[38, 75, 112].map((y) => (
                <line key={y} x1={12} y1={y} x2={28} y2={y} stroke={GREY} strokeWidth={2} />
              ))}
            </svg>
          ) : null}
        </div>
        {/* ===== mini 时间轴（SC31 缩微 0.35×） ===== */}
        <div style={{position: 'absolute', inset: 0, opacity: clamp01((N - T_TL) / 6)}}>
          {tlP > 0 ? <div style={{...abs(TL.x0, TL.y - 1.5, (TL.x1 - TL.x0) * tlP, 3), background: WHITE, opacity: 0.9, boxShadow: '0 0 8px rgba(255,255,255,.4)'}} /> : null}
          <SoftIn N={N} f0={T_TL + 10}>
            <CText cx={TL.x0 + 14} cy={TL.y + 26} size={22} weight={600} color={GREY} style={{fontFamily: FONT_MONO}}>t=0</CText>
          </SoftIn>
          {/* 请求点（紫） */}
          <SoftIn N={N} f0={T_TL + 12}>
            <div style={{...abs(REQ_X - 7, TL.y - 7, 14, 14), borderRadius: '50%', background: PURPLE_LIGHT, boxShadow: '0 0 10px 2px rgba(161,117,241,.55)'}} />
          </SoftIn>
          {/* 重发点（橙，依次点亮 + 扫描带经过时闪亮） */}
          {RET_X.map((rx, i) => {
            const s = scaleIn(N - (T_DOTS + i * 10), 10);
            if (s <= 0) return null;
            const cross = scanT >= 0 ? tri(scanT - ((rx - TL.x0) / (TL.x1 - TL.x0)) * 60, 10) : 0;
            const hot = 1 + 0.9 * cross;
            return <div key={i} style={{...abs(rx - 6 * s, TL.y - 6 * s, 12 * s, 12 * s), borderRadius: '50%', background: ORANGE, boxShadow: `0 0 ${Math.round(8 * hot)}px ${Math.round(2 * hot)}px rgba(240,95,65,.6)`, filter: `brightness(${hot.toFixed(2)})`}} />;
          })}
          {/* 扫描光带（timing 重放，循环） */}
          {scanOp > 0.02 ? (
            <div style={{...abs(scanX - 9, TL.y - 52, 18, 104), background: 'linear-gradient(180deg, rgba(161,117,241,0) 0%, rgba(161,117,241,.4) 30%, rgba(255,255,255,.8) 50%, rgba(161,117,241,.4) 70%, rgba(161,117,241,0) 100%)', opacity: scanOp, filter: 'drop-shadow(0 0 10px rgba(161,117,241,.5))'}} />
          ) : null}
          {/* timing only */}
          <SoftIn N={N} f0={T_TXT}>
            <CText cx={640} cy={598} size={26} weight={600} color={GREY}>timing only</CText>
          </SoftIn>
        </div>
      </CameraRig>
    </div>
  );
};
