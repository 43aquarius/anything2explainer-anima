import React from 'react';
import {useCurrentFrame} from 'remotion';
import {clamp01, easeOutCubic, GlitchIn, emphasisPulse, FONT_ORB, BEZ_SCALE_IN} from '../../common';
import {CText, EXAMPLE, GREY, ORANGE, TechText, WHITE, abs, fadeIn, firstOp, exitOp, SoftIn, mixHex} from '../../ui';
import {CameraRig, countTo} from '../../fx';
import {ExBadge, MiniRow, OrangeGlow} from './g6ui';

/**
 * SC33 七秒 · N 7301–7586（S42 7309–7418 + S43 7429–7584）—— **全片最高潮 · 大数字型高光时刻**
 * 上半：Wireshark 精简列表 3 行（812/813/814 重传行，[TCP Retransmission] 自动橙显）+ 左侧黑底橙感叹角标 expert 行（2 帧错峰 wipe）。
 * 下半：等式 `1 + 2 + 4 =`（Orbitron 76 白，三段数字逐个 14 帧计数落位）→ `7 s` 130px 橙 + 20 帧计数 0→7 +
 *   GlitchIn（rgbSplit 6，本镜唯一 glitch）+ emphasisPulse 1.11 + 橙光晕爆发（全片唯一大面积橙光，30 帧呼吸持续）+
 *   爆发扩散环；其下 `server log: 60 ms` 灰 34px 对照（灰删除线感）。
 * 运镜：7471–7504 33 帧 1→1.25 推近 `7 s`（计数时）。停留：末元素删除线 7524 落位 → 离场 7578，54 帧 ✓。末 8 帧归零。
 * 主角：`7 s` 130px + 橙光晕；数字依据：RFC 6298（1+2+4=7 s 推导）+ EXAMPLE.requestMs。
 */
const F0 = 7301, TO = 7586;
const T_ROWS = 7309, T_BADGE = 7373, T_EQ = 7429;
const T_7 = 7471, T_GLOW = 7491, T_PULSE = 7501;
const T_LOG = 7479, T_STRIKE = 7512;
const CAM_KEYS = [
  {f: 7471, x: 640, y: 360, s: 1},
  {f: 7560, x: 860, y: 420, s: 1.25},
]; // v2: 推近从 33 帧拉长到 89 帧（结尾持续生长到离场前，修复计数落定后 3.8s 静止）
const CARD = {x: 240, y: 168, w: 816, h: 216};
const ROWS = [EXAMPLE.wsRows[3], EXAMPLE.wsRows[4], EXAMPLE.wsRows[5]]; // 812 9.010 / 813 11.03 / 814 15.06
const ROW_Y = [186, 250, 314];
const EQ = {y: 500, nums: [400, 560, 720], ops: [480, 640], eq: 800};
const BIG = {cx: 1000, cy: 495, size: 130};
const LOGTXT = {cx: 1000, cy: 604};
/** 「marks them for you」的持续动词：7386–7446 紫色 active 行沿三行重传行下移扫一遍（每行 20 帧，随后停在末行） */
const activeRow = (N: number) => (N < 7386 ? 0 : N < 7446 ? Math.floor((N - 7386) / 20) : 2);
const tri = (n: number, len = 8) => (n <= 0 || n >= len ? 0 : n < len / 2 ? n / (len / 2) : 1 - (n - len / 2) / (len / 2));

/** `7 s` 大数字（Orbitron 130 橙 + 橙硬投影 + 橙光） */
const BigSeven: React.FC<{value: number | string; pulse?: number}> = ({value, pulse = 1}) => (
  <div style={{position: 'absolute', inset: 0}}>
    <CText
      cx={BIG.cx}
      cy={BIG.cy}
      size={BIG.size}
      weight={800}
      family={FONT_ORB}
      color={ORANGE}
      letterSpacing={4}
      shadow={`6px 6px 0 rgba(70,18,4,.9), 0 0 ${Math.round(46 * pulse)}px rgba(243,95,69,.85), 0 0 ${Math.round(110 * pulse)}px rgba(243,95,69,.4)`}
      style={{fontVariantNumeric: 'tabular-nums'}}
    >
      {`${value} s`}
    </CText>
  </div>
);

export const SC33: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const op = exitOp(N, TO, 8);
  // 上半组在等式开始后压暗（焦点转移到 7 s）
  const dimK = clamp01((N - T_EQ) / 10) * 0.42;
  const upperOp = 1 - dimK;
  // 橙光晕：爆发（8 帧）+ 30 帧呼吸（持续）
  const glowK = clamp01((N - T_GLOW) / 8);
  const ringK = clamp01((N - T_GLOW) / 24);
  const pulse = emphasisPulse(N - T_PULSE, {peak: 1.11});
  const strikeP = clamp01((N - T_STRIKE) / 12);
  return (
    <div style={{position: 'absolute', inset: 0, opacity: op}}>
      <CameraRig N={N} keys={CAM_KEYS}>
        {/* ===== 上半：expert 行 ===== */}
        <div style={{position: 'absolute', inset: 0, opacity: upperOp}}>
          <div style={{position: 'absolute', inset: 0, opacity: firstOp(N - T_ROWS, 8)}}>
            <div style={{...abs(CARD.x, CARD.y, CARD.w, CARD.h), background: '#000', border: `2.5px solid ${WHITE}`, borderRadius: 10}} />
            <TechText cx={CARD.x + 150} cy={CARD.y - 22} text="expert information" fontSize={28} />
          </div>
          {ROWS.map((r, i) => {
            const rn = N - (T_ROWS + i * 2);
            if (rn < 0) return null;
            // 扫描行切换瞬间的白闪（让「逐行标记」在低分辨率采样下也可感知）
            const scanFlash = tri(N - (7386 + i * 20), 5);
            return (
              <div key={r.no} style={{opacity: fadeIn(rn, 8), clipPath: `inset(0 ${((1 - clamp01(rn / 8)) * 100).toFixed(1)}% 0 0)`, filter: scanFlash > 0 ? `brightness(${(1 + 0.5 * scanFlash).toFixed(2)})` : undefined}}>
                <MiniRow x={CARD.x + 76} y={ROW_Y[i]} w={CARD.w - 88} h={58} no={r.no} t={r.t} proto={r.proto} info={r.info} active={i === activeRow(N)} />
              </div>
            );
          })}
          {/* v3: 马克笔 — 每行 20 帧槽内一道亮紫竖条从左扫到右（「marks them for you」的可感知动词，修复 7307–7427 静止） */}
        {ROWS.map((r, i) => {
          const sn = N - (7386 + i * 20);
          if (sn < 0 || sn >= 20) return null;
          const x = CARD.x + 70 + (CARD.w - 110) * easeOutCubic(clamp01(sn / 20));
          return (
            <div key={`pen${r.no}`} style={{...abs(x, ROW_Y[i] - 4, 7, 66), background: 'linear-gradient(180deg, rgba(226,214,255,.95), rgba(161,117,241,.75))', borderRadius: 3, boxShadow: '0 0 14px 4px rgba(102,45,248,.8)'}} />
          );
        })}
        {/* 黑底橙感叹角标（6 帧缩放弹出，2 帧错峰） */}
          {ROWS.map((r, i) => {
            const bn = N - (T_BADGE + i * 2);
            if (bn < 0) return null;
            const s = 0.5 + 0.5 * easeOutCubic(clamp01(bn / 6));
            return <ExBadge key={`b${r.no}`} cx={CARD.x + 30} cy={ROW_Y[i] + 29} s={s} opacity={fadeIn(bn, 4)} />;
          })}
        </div>
        {/* ===== 下半：等式 + 7 s ===== */}
        {/* 等式数字 1 + 2 + 4 =（v2: 缩放落位 0.42→1、21 帧 — 计数中间值低分辨率下不可感知且避免中间数字上画面） */}
        {EQ.nums.map((cx, i) => {
          const cn = N - (T_EQ + i * 14);
          if (cn < 0) return null;
          const sc = 0.42 + 0.58 * BEZ_SCALE_IN(clamp01(cn / 21));
          return (
            <div key={`n${i}`} style={{position: 'absolute', inset: 0, opacity: fadeIn(cn, 5), transform: `scale(${sc.toFixed(4)})`, transformOrigin: `${cx}px ${EQ.y}px`}}>
              <CText cx={cx} cy={EQ.y} size={76} weight={700} family={FONT_ORB} color={WHITE} letterSpacing={2} shadow="0 0 12px rgba(255,255,255,.45)" style={{fontVariantNumeric: 'tabular-nums'}}>
                {[1, 2, 4][i]}
              </CText>
            </div>
          );
        })}
        {[0, 1].map((i) => {
          const on = N - (T_EQ + i * 14 + 2);
          if (on < 0) return null;
          return (
            <SoftIn key={`p${i}`} N={N} f0={T_EQ + i * 14 + 2}>
              <CText cx={EQ.ops[i]} cy={EQ.y - 4} size={56} weight={600} color={GREY}>+</CText>
            </SoftIn>
          );
        })}
        {N >= T_EQ + 30 ? (
          <SoftIn N={N} f0={T_EQ + 30}>
            <CText cx={EQ.eq} cy={EQ.y - 4} size={56} weight={600} color={GREY}>=</CText>
          </SoftIn>
        ) : null}
        {/* 橙光晕（爆发 + 呼吸）+ 扩散环 */}
        <OrangeGlow cx={BIG.cx} cy={BIG.cy} r={300} k={glowK} N={N} alpha={0.55} />
        {ringK > 0 && ringK < 1 ? (
          <svg width={420} height={420} viewBox="-210 -210 420 420" style={{position: 'absolute', left: BIG.cx - 210, top: BIG.cy - 210, opacity: (1 - ringK) * 0.85}}>
            <ellipse cx={0} cy={0} rx={150 * (0.45 + 0.9 * ringK)} ry={110 * (0.45 + 0.9 * ringK)} fill="none" stroke={ORANGE} strokeWidth={3} />
          </svg>
        ) : null}
        {/* 7 s：阶段一 20 帧计数 0→7（7471–7491）；阶段二 GlitchIn（rgbSplit 6，本镜唯一 glitch）+ 脉冲落定 */}
        {N >= T_7 && N < T_GLOW ? (
          <div style={{position: 'absolute', inset: 0, opacity: firstOp(N - T_7, 5)}}>
            <BigSeven value={countTo(N - T_7, 0, 7, 20)} pulse={1} />
          </div>
        ) : null}
        {N >= T_GLOW ? (
          <GlitchIn N={N} f0={T_GLOW} rgbSplit={6} seed={33}>
            <div style={{position: 'absolute', inset: 0, transform: `scale(${pulse.toFixed(4)})`, transformOrigin: `${BIG.cx}px ${BIG.cy}px`}}>
              <BigSeven value={7} pulse={pulse} />
            </div>
          </GlitchIn>
        ) : null}
        {/* server log: 60 ms（灰 34px 对照 + 灰删除线感） */}
        <SoftIn N={N} f0={T_LOG}>
          <CText cx={LOGTXT.cx} cy={LOGTXT.cy} size={34} weight={600} color={GREY} letterSpacing={1}>
            server log: 60 ms
          </CText>
        </SoftIn>
        {strikeP > 0 ? (
          <div style={{...abs(LOGTXT.cx - 164, LOGTXT.cy - 1.5, 328 * strikeP, 2.5), background: mixHex('#000000', GREY, 0.9)}} />
        ) : null}
      </CameraRig>
    </div>
  );
};
