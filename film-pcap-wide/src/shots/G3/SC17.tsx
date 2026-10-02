import React from 'react';
import {useCurrentFrame} from 'remotion';
import {GlitchIn, clamp01, easeOutCubic, emphasisPulse, powIn} from '../../common';
import {CText, MonoText, PacketIcon, NICIcon, Check, Cross, PURPLE, PURPLE_LIGHT, GREY, GREY_LIGHT, GREEN, WHITE, exitOp, SoftIn, glowPurpleS, scaleIn, abs} from '../../ui';
import {HeroGlow} from '../../fx';
import {StationCircle, Funnel} from './g3ui';

/**
 * SC17 混杂模式 · N 3315–3696（S20 3323–3502 + S21 3513–3674 ¶：3323「一个例外」/ 3394「网卡默认丢弃」/
 *   3446「不是给自己的」/ 3513「混杂模式」/ 3564「全都留下」/ 3613「Wireshark 默认开启」）
 * 版式：中央 NICIcon 420×180 @ (640,400)（主控芯片 3513 灰→紫 11 帧 + 紫柔光）；上方三个投递口漏斗（x 400/640/880，y 252）；
 *   左半灰 `normal`：`for: others` 信封落到 NIC 左缘被弹开（红 Cross @3446）；
 *   右半紫 `promiscuous`：同样信封被吸入 NIC（绿 Check @3578）；
 *   (640,160) `Promiscuous mode` Noto 900 64px GlitchIn（本镜唯一 glitch，rgbSplit 4，白名单）；
 *   3613 `Wireshark: on by default` 灰小字 + 绿点；① 角标回场（"回到本机"）。
 * 持续：左右两半信封每 32 帧重演一次 + 中漏斗 48 帧/枚小信封滴入 NIC + 开场漏斗雨（3336–3394）。
 * 停留：段末（S21 ¶）— 末元素落位 3613+8 → 离场 3688，67 帧 ✓。末 8 帧归零。
 */
const F0 = 3315;
const TO = 3696;
const T_BADGE = 3316, T_FUN = 3394, T_RAIN = 3336, T_NIC = 3318, T_LBL = 3400, T_LOOP = 3400, T_CROSS = 3446, T_BIG = 3513, T_PROM = 3564, T_CHECK = 3578, T_WS = 3613; // v2: NIC 开场即入（QC v1 高空场修复：3315–3394 只有小漏斗+雨 <80px 88 帧）
const NIC = {cx: 640, cy: 400, w: 420, h: 180};
const CHIP = {x: 589.6, y: 364, w: 84, h: 72}; // NICIcon 主控芯片全局几何
const FUNNELS = [400, 640, 880];
const DROP = {y0: 276, y1: 388}; // 信封下落区间
const CYC = 32; // 左右对比循环周期

export const SC17: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const exOp = exitOp(N, TO, 8);

  // NIC + 芯片灰→紫（11 帧）+ HeroGlow（3513 增亮）
  const nicS = scaleIn(N - T_NIC, 21);
  const nicOp = N < T_NIC ? 0 : Math.min(1, (N - T_NIC) / 8);
  const chipK = clamp01((N - T_BIG) / 11);
  const glowK = 0.35 + 0.65 * chipK;

  // 左半循环（32 帧）：下落 14 帧 → 弹开 14 帧
  const pL = (N - T_LOOP) % CYC;
  const leftEnv = () => {
    if (N < T_LOOP) return null;
    if (pL < 14) {
      const t = powIn(2)(pL / 14);
      return {x: 400, y: DROP.y0 + (DROP.y1 - DROP.y0) * t, rot: 0, op: Math.min(1, pL / 2), s: 1};
    }
    if (pL < 28) {
      const e = easeOutCubic((pL - 14) / 14);
      return {x: 400 - 160 * e, y: 388 - 88 * e - 14 * Math.sin(Math.PI * e), rot: -25 * e, op: Math.max(0, 1 - (pL - 18) / 10), s: 1};
    }
    return null;
  };
  // 右半循环（3564 起，同相位节奏）：下落 14 帧 → 吸入 NIC 12 帧
  const pR = N - T_PROM;
  const rightEnv = () => {
    if (pR < 0) return null;
    const p = pR % CYC;
    if (p < 14) {
      const t = powIn(2)(p / 14);
      return {x: 880, y: DROP.y0 + (DROP.y1 - DROP.y0) * t, rot: 0, op: Math.min(1, p / 2), s: 1};
    }
    if (p < 26) {
      const e = easeOutCubic((p - 14) / 12);
      return {x: 880 - 26 * e, y: 388 + 12 * e, rot: 4 * e, op: Math.max(0, 1 - e * 0.9), s: 1 - 0.45 * e};
    }
    return null;
  };

  // 开场漏斗雨（3336–3394 出生的小信封，每漏斗 30 帧一枚、错相 10 帧，落到 y≈505 淡出）
  const rain: Array<{x: number; y: number; op: number}> = [];
  FUNNELS.forEach((fx, i) => {
    for (let s = T_RAIN + i * 10; s <= T_RAIN + 58; s += 30) {
      const t = N - s;
      if (t < 0 || t > 42) continue;
      const y = 276 + 5.5 * t;
      const op = Math.min(1, t / 3, (505 - y) / 45) * 0.55;
      if (op > 0.02) rain.push({x: fx, y, op});
    }
  });

  // 中漏斗小信封滴入 NIC（48 帧一枚）
  const drip = (() => {
    const t = (N - T_LOOP) % 48;
    if (N < T_LOOP || t >= 13) return null;
    const e = powIn(2)(t / 12);
    const op = Math.min(1, t / 2) * (t > 9 ? Math.max(0, 1 - (t - 9) / 4) : 1);
    return op > 0.02 ? {y: 276 + 30 * e, op} : null;
  })();

  const le = leftEnv();
  const re = rightEnv();
  const crossP = clamp01((N - T_CROSS) / 12);
  const checkP = clamp01((N - T_CHECK) / 12);
  const bigPulse = emphasisPulse(N - (T_BIG + 12), {peak: 1.06});

  return (
    <div style={{position: 'absolute', inset: 0, opacity: exOp}}>
      {/* ① 角标（回到本机） */}
      <SoftIn N={N} f0={T_BADGE}>
        <StationCircle cx={108} cy={158} r={30} lit digit="1" digitSize={40} />
      </SoftIn>

      {/* NIC（主角，HeroGlow） */}
      {nicOp > 0 ? (
        <>
          <HeroGlow x={NIC.cx - NIC.w / 2 + 10} y={NIC.cy - NIC.h / 2 + 10} w={NIC.w - 20} h={NIC.h - 20} r={12} N={N} k={glowK} />
          <div style={{position: 'absolute', inset: 0, opacity: nicOp, transform: `translate(${NIC.cx}px,${NIC.cy}px) scale(${(nicS * 1).toFixed(4)}) translate(${-NIC.cx}px,${-NIC.cy}px)`}}>
            <NICIcon cx={NIC.cx} cy={NIC.cy} w={NIC.w} h={NIC.h} />
          </div>
          {/* 主控芯片紫边覆盖（灰→紫 11 帧） */}
          {chipK > 0.01 ? (
            <div style={{...abs(CHIP.x, CHIP.y, CHIP.w, CHIP.h), opacity: chipK, border: `3px solid ${PURPLE_LIGHT}`, borderRadius: 4, boxShadow: glowPurpleS(1)}} />
          ) : null}
        </>
      ) : null}

      {/* 漏斗雨（开场） */}
      {rain.map((r, i) => (r ? <PacketIcon key={i} cx={r.x} cy={r.y} w={46} h={32} opacity={r.op} /> : null))}

      {/* 中漏斗滴入 NIC 的小信封 */}
      {drip ? <PacketIcon cx={640} cy={drip.y} w={44} h={30} opacity={drip.op * 0.9} /> : null}

      {/* 左半：for: others 信封 → 弹开 */}
      {le && le.op > 0.02 ? (
        <div style={{...abs(le.x - 42, le.y - 28, 84, 56), opacity: le.op, transform: `rotate(${le.rot.toFixed(1)}deg) scale(${le.s.toFixed(3)})`, transformOrigin: '50% 50%'}}>
          <PacketIcon cx={42} cy={28} w={84} h={56} />
        </div>
      ) : null}
      {/* 右半：同样信封 → 被吸入 */}
      {re && re.op > 0.02 ? (
        <div style={{...abs(re.x - 42, re.y - 28, 84, 56), opacity: re.op, transform: `rotate(${re.rot.toFixed(1)}deg) scale(${re.s.toFixed(3)})`, transformOrigin: '50% 50%'}}>
          <PacketIcon cx={42} cy={28} w={84} h={56} accent />
        </div>
      ) : null}

      {/* 三个投递口漏斗（draw-on 错峰） */}
      {FUNNELS.map((fx, i) => (
        <Funnel key={i} cx={fx} cy={252} op={N >= T_FUN + i * 6 ? Math.min(1, (N - T_FUN - i * 6) / 8) : 0} drawP={clamp01((N - T_FUN - i * 6) / 18)} />
      ))}

      {/* 标签：normal / promiscuous / for: others */}
      <SoftIn N={N} f0={T_LBL}>
        <CText cx={285} cy={300} size={28} weight={600} color={GREY} italic family="'Exo 2','Helvetica Neue',sans-serif" letterSpacing={1}>
          normal
        </CText>
      </SoftIn>
      <SoftIn N={N} f0={T_LBL + 2}>
        <MonoText x={205} y={344} size={22} color={GREY_LIGHT}>
          for: others
        </MonoText>
      </SoftIn>
      <SoftIn N={N} f0={T_PROM}>
        <CText cx={1010} cy={300} size={28} weight={600} color={PURPLE_LIGHT} italic family="'Exo 2','Helvetica Neue',sans-serif" letterSpacing={1} style={{textShadow: '0 0 12px rgba(161,117,241,.55)'}}>
          promiscuous
        </CText>
      </SoftIn>

      {/* Cross / Check */}
      {crossP > 0 ? <Cross cx={400} cy={362} size={46} p={crossP} sw={7} /> : null}
      {checkP > 0 ? <Check cx={880} cy={362} size={46} p={checkP} sw={7} /> : null}

      {/* 大字 Promiscuous mode（本镜唯一 glitch，白名单 rgbSplit 4） */}
      {N >= T_BIG ? (
        <GlitchIn N={N} f0={T_BIG} rgbSplit={4} seed={17}>
          <CText
            cx={640}
            cy={160}
            size={64}
            weight={900}
            color={WHITE}
            letterSpacing={1}
            style={{
              transform: `scale(${bigPulse.toFixed(4)})`,
              WebkitTextStroke: `2.5px ${PURPLE}`,
              paintOrder: 'stroke fill',
              textShadow: '0 0 18px rgba(102,45,248,.55)',
            }}
          >
            Promiscuous mode
          </CText>
        </GlitchIn>
      ) : null}

      {/* Wireshark: on by default + 绿点 */}
      <SoftIn N={N} f0={T_WS}>
        <div style={{...abs(466, 546, 360, 22), display: 'flex', alignItems: 'center', gap: 12}}>
          <div style={{width: 12, height: 12, borderRadius: 6, background: GREEN, boxShadow: `0 0 10px rgba(143,247,64,${(clamp01((N - (T_WS + 4)) / 8) * 0.9).toFixed(2)})`, opacity: 0.5 + 0.5 * clamp01((N - (T_WS + 4)) / 8)}} />
          <div style={{fontFamily: "'Noto Sans SC','PingFang SC',sans-serif", fontSize: 24, fontWeight: 600, color: GREY, lineHeight: 1, whiteSpace: 'nowrap'}}>Wireshark: on by default</div>
        </div>
      </SoftIn>
    </div>
  );
};
