import React from 'react';
import {useCurrentFrame} from 'remotion';
import {GlitchIn, clamp01, easeOutCubic, easeInOutPow, FONT_ORB} from '../../common';
import {CText, TechText, PersonIcon, PURPLE, PURPLE_LIGHT, GREY, GREY_MID, WHITE, softOp, firstOp, exitOp, glowOffK, abs} from '../../ui';
import {CameraRig, GlowBlob} from '../../fx';

/**
 * SC07 任播 · N 1419–1683（S11 1427–1666 块 1427/1468/1517/1593；段内不判）
 * 画面：中央地球圆环（GlobeArc 同款几何：圆 + 经线椭圆 + 赤道线；自绘以支持 20 帧 draw-on）
 *       + 环上 7 个 anycast 节点 + 圆心 `one IP`（Orbitron 72 白 + 紫描边）+ 圆外左下用户点（PersonIcon `you`）。
 * 节拍：1421（c1−6）圆环 draw-on 20f + 顶部 `anycast` SoftIn（1427）+ 用户点 SoftIn（1429）；
 *       1468（c2）圆心 `one IP` GlitchIn（rgbSplit 4，本镜唯一）+ 紫光晕；
 *       1517（c3）7 节点 2 帧错峰缩入 + 各节点双圈宣告波纹（66f 周期循环扩散，持续动作）；
 *       1593（c4）7 条灰连线 2 帧错峰 draw-on（14f）→ 1615 最近一条亮紫加粗 + 脉冲 + 光点循环跑（持续）+
 *       用户点挑选光圈 12 帧收缩锁定 + `the network picks` SoftIn（1617）+ 最近节点紫光点亮。
 * 运镜：1.0→1.05 慢推（1419–1655，内容全程留在 x89–1191 / y122–607）。
 * 停留：段内不判（S11 末块 74）；末 8 帧离场（1675–1683），1669 起先灭光。
 */
const F0 = 1419;
const TO = 1683;
const CX = 680, CY = 372, R = 170;

const B_RING = 1421;  // 圆环 draw-on（c1−6）
const B_TITLE = 1427; // c1
const B_ONEIP = 1468; // c2
const B_NODES = 1517; // c3
const B_LINES = 1593; // c4
const B_LOCK = 1615;  // 最近线亮紫 + 挑选光圈（12f）
const B_PICK = 1617;  // `the network picks`

const EASE = easeOutCubic;
const EIO = easeInOutPow(2.5);
const USER = {x: 298, y: 512};
// 环上节点角度（deg；0 号 = 最近节点，朝向左下用户）
const ANG = [155, 210, 260, 310, 5, 55, 105];
const nodeXY = (i: number): [number, number] => {
  const a = (ANG[i] * Math.PI) / 180;
  return [CX + R * Math.cos(a), CY + R * Math.sin(a)];
};
const RIP_P = 66; // 宣告波纹周期

export const SC07: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const ex = exitOp(N, TO, 8);
  const gk = glowOffK(N, TO, 6, 8); // 先灭光
  // 圆环 draw-on（20f，easeOut）+ 经纬线随后淡入
  const ringP = EASE(clamp01((N - B_RING) / 20));
  const C = 2 * Math.PI * R;
  const decorOp = 0.35 * softOp(N - (B_RING + 8), 16);
  // 圆心大字的光
  const ipGlow = clamp01((N - B_ONEIP - 8) / 10) * gk;
  // 挑选光圈：r 50→28（12f），锁定后实线
  const lockP = EIO(clamp01((N - B_LOCK) / 12));
  const selR = 50 - 22 * lockP;
  // 最近线上的光点（44f 一趟，锁定后起跑，持续）
  const dotT = (((N - B_LOCK - 12) % 44) + 44) % 44 / 44;
  const dotOn = N >= B_LOCK + 12;
  const [nx, ny] = nodeXY(0);
  const dx = USER.x + (nx - USER.x) * dotT;
  const dy = USER.y + (ny - USER.y) * dotT;
  // 最近线脉冲（亮紫呼吸，持续）
  const pulse = 0.72 + 0.28 * (0.5 + 0.5 * Math.sin((2 * Math.PI * (N - B_LOCK - 12)) / 46));

  return (
    <CameraRig N={N} keys={[{f: F0, x: 640, y: 360, s: 1}, {f: 1655, x: 640, y: 360, s: 1.05}]}>
      <div style={{...abs(0, 0, 1280, 720), opacity: ex}}>
        {/* 顶部标题 anycast（Exo 2 紫斜体） */}
        <div style={{...abs(0, 0, 1280, 720), opacity: softOp(N - B_TITLE, 10)}}>
          <TechText cx={CX} cy={158} text="anycast" fontSize={40} letterSpacing={3} />
        </div>

        {/* 地球圆环 + 经纬（GlobeArc 同款几何，dashoffset draw-on 20f） */}
        <svg width={1280} height={720} viewBox="0 0 1280 720" style={{...abs(0, 0), overflow: 'visible', filter: 'drop-shadow(0 0 2px rgba(255,255,255,.35))'}}>
          <g stroke={WHITE} strokeWidth={3} fill="none">
            <circle cx={CX} cy={CY} r={R} strokeDasharray={C} strokeDashoffset={C * (1 - ringP)} transform={`rotate(-90 ${CX} ${CY})`} opacity={softOp(N - B_RING, 3)} />
            <ellipse cx={CX} cy={CY} rx={R * 0.96} ry={R * 0.36} strokeWidth={2} opacity={decorOp} />
            <line x1={CX - R} y1={CY} x2={CX + R} y2={CY} strokeWidth={2} opacity={decorOp} />
          </g>
        </svg>

        {/* 圆心柔光（镜头首帧即有亮度） */}
        <GlowBlob cx={CX} cy={CY} r={96} N={N} k={firstOp(N - F0, 8) * (0.45 + 0.55 * ipGlow) * gk} alpha={0.3} />

        {/* 圆心 one IP（Orbitron 72 白 + 紫描边 + 紫光晕；本镜唯一 glitch） */}
        <GlitchIn N={N} f0={B_ONEIP} rgbSplit={4} seed={12}>
          <CText cx={CX} cy={CY} size={72} weight={700} family={FONT_ORB} color={WHITE} letterSpacing={2}
            style={{WebkitTextStroke: '3px #A175F1', paintOrder: 'stroke fill', textShadow: `0 0 26px rgba(102,48,248,${(0.55 * ipGlow).toFixed(3)}), 0 0 60px rgba(102,48,248,${(0.35 * ipGlow).toFixed(3)})`}}>one IP</CText>
        </GlitchIn>

        {/* 节点 / 波纹 / 连线层（波纹在下、连线居中、节点在上） */}
        <svg width={1280} height={720} viewBox="0 0 1280 720" style={{...abs(0, 0), overflow: 'visible'}}>
          {/* 宣告波纹：每节点两圈，66f 周期循环扩散（持续动作） */}
          {ANG.map((_, i) => {
            const t0 = B_NODES + i * 2 + 14; // 该节点落位后起波
            const [px, py] = nodeXY(i);
            if (N < t0) return null;
            return [0, 1].map((k) => {
              const ph = ((((N - t0 - (k * RIP_P) / 2) % RIP_P) + RIP_P) % RIP_P) / RIP_P;
              const rr = 10 + 42 * ph;
              const op = (1 - ph) * 0.42 * (i === 0 && N >= B_LOCK ? 1 : 0.85);
              return <circle key={`${i}-${k}`} cx={px} cy={py} r={rr} fill="none" stroke={i === 0 && N >= B_LOCK ? PURPLE_LIGHT : GREY_MID} strokeWidth={1.6} opacity={op} />;
            });
          })}
          {/* 各节点 → 用户的连线（灰虚线，错峰 draw-on；最近一条 1615 起亮紫加粗脉冲） */}
          {ANG.map((_, i) => {
            const t0 = B_LINES + i * 2;
            const p = EASE(clamp01((N - t0) / 14));
            if (p <= 0) return null;
            const [sx, sy] = nodeXY(i);
            const near = i === 0 && N >= B_LOCK;
            return (
              <line key={`ln-${i}`} x1={sx} y1={sy} x2={sx + (USER.x - sx) * p} y2={sy + (USER.y - sy) * p}
                stroke={near ? PURPLE_LIGHT : GREY} strokeWidth={near ? 4 : 1.8} opacity={near ? pulse : 0.5}
                strokeDasharray={near ? undefined : '6 6'}
                style={near ? {filter: `drop-shadow(0 0 6px rgba(102,48,248,${(0.7 * pulse).toFixed(2)}))`} : undefined} />
            );
          })}
          {/* 最近连线上的光点（锁定后循环跑，持续动作） */}
          {dotOn ? <circle cx={dx} cy={dy} r={4.5} fill={PURPLE_LIGHT} style={{filter: 'drop-shadow(0 0 6px rgba(102,48,248,.9))'}} /> : null}
          {/* 环上节点（2 帧错峰缩入 14f；最近节点锁定后紫光） */}
          {ANG.map((_, i) => {
            const n = N - (B_NODES + i * 2);
            if (n < 0) return null;
            const r = 8 * EASE(clamp01(n / 14));
            const [px, py] = nodeXY(i);
            const near = i === 0 && N >= B_LOCK;
            return (
              <circle key={`nd-${i}`} cx={px} cy={py} r={r} fill={near ? PURPLE : '#000'} stroke={near ? PURPLE_LIGHT : WHITE} strokeWidth={2.5}
                style={near ? {filter: `drop-shadow(0 0 8px rgba(102,48,248,${(0.9 * gk).toFixed(2)}))`} : undefined} />
            );
          })}
          {/* 用户点挑选光圈：虚线收缩 → 锁定实线（12f） */}
          {N >= B_LOCK ? (
            <circle cx={USER.x} cy={USER.y - 28} r={selR} fill="none" stroke={PURPLE_LIGHT} strokeWidth={2.2}
              strokeDasharray={lockP < 1 ? '7 6' : undefined} opacity={0.9}
              style={{filter: `drop-shadow(0 0 8px rgba(102,48,248,${(0.7 * gk).toFixed(2)}))`}} />
          ) : null}
        </svg>

        {/* 用户（配角 PersonIcon 64 + you；c1 随"routes you there"入场） */}
        <div style={{...abs(0, 0, 1280, 720), opacity: softOp(N - (B_TITLE + 2), 10)}}>
          <PersonIcon cx={USER.x} cy={USER.y - 28} size={64} label="you" accent={N >= B_LOCK ? PURPLE_LIGHT : undefined} glow={N >= B_LOCK} />
        </div>

        {/* the network picks（灰 22，SoftIn） */}
        <div style={{...abs(0, 0, 1280, 720), opacity: softOp(N - B_PICK, 10)}}>
          <CText cx={452} cy={562} size={22} weight={500} color={GREY} letterSpacing={1} dy={0}>the network picks</CText>
        </div>
      </div>
    </CameraRig>
  );
};
