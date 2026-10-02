import React from 'react';
import {useCurrentFrame} from 'remotion';
import {clamp01, easeInOutPow, easeOutCubic} from '../../common';
import {CameraRig} from '../../fx';
import {Box, Counter, MailboxIcon, MonoText, PacketIcon, SeqStamp, GREY_MID, GREEN, ORANGE, WHITE, abs, firstOp, softOp, exitOp} from '../../ui';

/**
 * SC06 编号与回执 · N 775–868（S07 783–866；块 783 每个都编号 / 831 每个都有回执）
 * 版式：上部发送带（y 420，x 76–604——分镜表 80–640 按 1.05 慢推后的安全区收敛，见 BUILD_NOTES），
 *   信封 56×40 以 3px/帧持续右行；编号章 #1..#4 在 x 250 处逐枚 stampIn（1.4→1）并随信封行进；
 *   右端折返轨道（虚线）自 (604,450) 下折到信箱口 (375,730)；绿回执卡 `ACK 1` 104×48 沿轨道 kf 16 帧
 *   滑入信箱（831 出发、847 到达，每 30 帧循环——831/861）→ 信箱口白闪 + 旗子竖起 + 橙 `+1` 计数。
 * 节拍：777 带 wipe + 信列入场（=783−6）；789/813/837/861 编号章；831 首张回执（块 2 对齐）。
 * 运镜：1.0→1.05 慢推（775→856，中轴 pivot，慢推贯穿例外）。零 glitch。零扫光。
 * 停留：段内不判（S07 后 S08 同段）。末 8 帧归零（860–868，回执循环持续到离场）。
 */
const F0 = 775;
const TO = 868;

const T_BELT = 777, T_BOX = 779, T_RCPT0 = 831, RCPT_LEN = 16, RCPT_CYCLE = 30;

const BELT = {x0: 76, x1: 604, y: 420};
const STAMP_X = 250;
const MAIL = {cx: 360, cy: 760, w: 150, h: 120};

// 信封队：x0 = 783 帧时的中心 x（72px 间距）；速度 3px/帧
const ENVS = [232, 160, 88, 16, -56, -128].map((x0, i) => ({x0, i}));
const envX = (e: {x0: number}, N: number) => e.x0 + 3 * Math.max(0, N - 783);
// 折返轨道（回程）：自发送带右端下折到信箱口
const RPATH: Array<[number, number]> = [[604, 450], [588, 560], [470, 650], [375, 730]];
const SEG = RPATH.slice(1).map((p, i) => Math.hypot(p[0] - RPATH[i][0], p[1] - RPATH[i][1]));
const TOT = SEG.reduce((s, v) => s + v, 0);
const pathAt = (t: number): [number, number] => {
  const d = clamp01(t) * TOT;
  let acc = 0;
  for (let i = 0; i < SEG.length; i++) {
    if (d <= acc + SEG[i]) {
      const k = (d - acc) / SEG[i];
      return [RPATH[i][0] + (RPATH[i + 1][0] - RPATH[i][0]) * k, RPATH[i][1] + (RPATH[i + 1][1] - RPATH[i][1]) * k];
    }
    acc += SEG[i];
  }
  return RPATH[RPATH.length - 1];
};
// 回执：出发时刻 / 文案
const RCPTS = [{t0: T_RCPT0, label: 'ACK 1'}, {t0: T_RCPT0 + RCPT_CYCLE, label: 'ACK 2'}];

export const SC06: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const exOp = exitOp(N, TO, 8);
  if (exOp <= 0) return null;

  const beltP = clamp01((N - T_BELT) / 12); // 带 wipe
  const trackP = clamp01((N - (T_RCPT0 - 10)) / 12); // 折返轨道 draw-on（首张回执前 10 帧起）
  const mailGlow = clamp01((N - (T_RCPT0 + RCPT_LEN + 6)) / 8); // 首张到达后信箱微亮

  return (
    <CameraRig N={N} keys={[{f: F0, x: 360, y: 640, s: 1}, {f: 856, x: 360, y: 640, s: 1.05}]}>
      <div style={{position: 'absolute', inset: 0, opacity: exOp}}>
        {/* ---- 发送带（wipe 12 帧）---- */}
        <div style={{...abs(BELT.x0, BELT.y - 1.5, (BELT.x1 - BELT.x0) * beltP, 3), background: WHITE, opacity: 0.9, boxShadow: '0 0 8px rgba(255,255,255,.45)'}} />

        {/* ---- 信封队（3px/帧右行；越过 x 250 时盖章）---- */}
        {ENVS.map((e) => {
          const x = envX(e, N);
          if (x < BELT.x0 - 32 || x > BELT.x1 + 32) return null;
          const op = firstOp(N - T_BELT + 2, 8) * clamp01((BELT.x1 + 30 - x) / 40);
          if (op <= 0.01) return null;
          return <PacketIcon key={e.i} cx={x} cy={BELT.y} w={56} h={40} opacity={op} />;
        })}

        {/* ---- 编号章（stampIn 1.4→1，随信封行进；最新一枚带橙光）---- */}
        {ENVS.map((e, k) => {
          const t = N - (789 + k * 24); // #1@789 / #2@813 / #3@837 / #4@861
          if (t < 0) return null;
          const x = envX(e, N);
          if (x > BELT.x1 + 20) return null;
          const stS = 1.4 - 0.4 * easeOutCubic(clamp01(t / 10));
          const newest = N < 789 + (k + 1) * 24; // 最新一枚带橙光（重点光 ≤1 处）
          return (
            <SeqStamp key={`s${e.i}`} cx={x + 30} cy={BELT.y - 26} label={`#${k + 1}`} size={34} scale={stS}
              opacity={softOp(t, 6)} glow={newest} />
          );
        })}

        {/* ---- 折返轨道（虚线 draw-on，clip 自上而下展开）---- */}
        {trackP > 0 ? (
          <svg width={720} height={1280} viewBox="0 0 720 1280" style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
            <defs>
              <clipPath id="g2s6track"><rect x={0} y={440} width={720} height={310 * trackP} /></clipPath>
            </defs>
            <path d={`M ${RPATH.map((p) => p.join(' ')).join(' L ')}`} fill="none" stroke={GREY_MID} strokeWidth={2.5} strokeDasharray="8 9" opacity={0.75} clipPath="url(#g2s6track)" />
          </svg>
        ) : null}

        {/* ---- 信箱（回执接收端；首张到达后旗子竖起 + 口部白闪）---- */}
        <div style={{position: 'absolute', inset: 0, opacity: softOp(N - T_BOX, 8)}}>
          <MailboxIcon cx={MAIL.cx} cy={MAIL.cy} w={MAIL.w} h={MAIL.h} flagUp={N >= T_RCPT0 + RCPT_LEN} />
        </div>
        {(() => {
          const nA = N - (T_RCPT0 + RCPT_LEN); // 首张到达白闪（847）
          if (nA < 0 || nA > 10) return null;
          const flash = nA < 5 ? 1 + 0.5 * (1 - nA / 5) : 1;
          return <div style={{...abs(MAIL.cx - 36, MAIL.cy - 4, 72, 20), borderRadius: 7, border: `2.5px solid ${GREEN}`, background: 'rgba(143,247,64,0.22)', filter: `brightness(${flash.toFixed(2)})`}} />;
        })()}
        {mailGlow > 0 ? <div style={{...abs(MAIL.cx - 80, MAIL.cy - 62, 160, 124), borderRadius: 20, boxShadow: `0 0 ${Math.round(14 * mailGlow)}px ${Math.round(4 * mailGlow)}px rgba(255,255,255,${(0.14 * mailGlow).toFixed(3)})`}} /> : null}

        {/* ---- 回执卡（沿折返轨道 16 帧；每 30 帧循环）---- */}
        {RCPTS.map((r, i) => {
          const n = N - r.t0;
          if (n < 0 || n > RCPT_LEN + 6) return null;
          const t = easeInOutPow(2.5)(clamp01(n / RCPT_LEN));
          const [x, y] = pathAt(t);
          const gone = clamp01((n - RCPT_LEN) / 4); // 到达后收进信箱
          return (
            <div key={`r${i}`} style={{...abs(x - 52, y - 24, 104, 48), opacity: softOp(n, 5) * (1 - gone)}}>
              <Box x={0} y={0} w={104} h={48} r={9} sw={2.5} stroke={GREEN} fill="#000" style={{boxShadow: '0 0 14px 4px rgba(143,247,64,0.35)'}} />
              <MonoText x={14} y={11} size={24} color={GREEN}>{r.label}</MonoText>
            </div>
          );
        })}

        {/* ---- `+1` 计数（首张到达后亮起，橙）---- */}
        {N >= T_RCPT0 + RCPT_LEN ? (() => {
          const n = N - (T_RCPT0 + RCPT_LEN);
          const pop = 1 + 0.35 * Math.exp(-n / 5);
          return (
            <div style={{position: 'absolute', inset: 0, opacity: softOp(n, 6)}}>
              <div style={{...abs(495, 733, 90, 54), transform: `scale(${pop.toFixed(4)})`, transformOrigin: '45px 27px'}}>
                <Counter cx={45} cy={27} value="+1" size={54} color={ORANGE} />
              </div>
            </div>
          );
        })() : null}

        {/* ---- 带右端箭头（流向标）---- */}
        {beltP >= 1 ? (
          <div style={{...abs(BELT.x1 + 2, BELT.y - 7, 0, 0), opacity: softOp(N - (T_BELT + 12), 6) * 0.85, borderTop: `7px solid transparent`, borderBottom: `7px solid transparent`, borderLeft: `12px solid ${WHITE}`}} />
        ) : null}
      </div>
    </CameraRig>
  );
};
