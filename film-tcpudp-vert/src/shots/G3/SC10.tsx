import React from 'react';
import {useCurrentFrame} from 'remotion';
import {clamp01, powIn, emphasisPulse, FONT_MONO} from '../../common';
import {
  CText, Pill, WaveformStrip, abs, softOp, firstOp, exitOp, glowOffK, exitAccel, SoftIn, mixHex, scaleIn,
  WHITE, GREY, GREY_MID, GREY_LIGHT, ORANGE, RED_DEEP, PURPLE,
} from '../../ui';
import {CameraRig, GlowBlob} from '../../fx';

/**
 * SC10 晚到即死 · N 1212–1345（S11 1220–1343 ¶ 段末；块 1220「A late packet is a dead packet —」/ 1278「the call plays a gap, and moves on.」）
 * 版式（竖版安全区 y240–990 / x40–620，中轴 360）：
 *   竖向语音流：中轴细白线 y336–784（wipe 12 帧）+ 9 个槽位（y370–730，每 45px）；
 *   橙点每 6 帧一枚自槽位上方 26px 落入当前槽（槽位自上而下推进、循环），落位后衰减到 55%、带落点涟漪（全镜持续动作）；
 *   第 5 枚（k=4，1250 落槽 4 y550）中途变灰、脱离轨道向右坠出线外消失（powIn 2）+ 槽位小红 `×` 闪一次；
 *   此后该槽每轮都空缺（丢一枚不重等——后续 k≡4 的节拍整拍无声跳过）。
 *   1278 豁口可视化：槽 4 两侧各三根波形小竖线（WaveformStrip 13 bar、中豁 5–7，x275–445）+ `skip` 灰章 stampIn（旋转 −6°）；
 *   下方 (360,852) 大字 `late = dead`（Noto 900 64px 白 + 紫描边，缩放入场 + emphasisPulse）+ `play the gap · move on` 灰 24px (360,908)。
 * 节拍：1220 流 wipe + 1226 首枚橙点；1250 灰坠落 + 1256 红 ×；1278 大字缩放入场（16 帧→1294）+ 波形豁口 + skip 章；
 *   1286 小灰字 SoftIn。
 * 运镜：1275–1308 33 帧 1→1.18 推近（cam 360,640→360,625，推向大字）：满态内容屏幕 y292–988 / x214–567，
 *   不进字幕带、不出安全区；末态 1308 → 离场 1338，停 30 帧 ✓（段末）。
 * 离场：末 8 帧归零（1338–1345），紫光先灭；橙点持续落到最后一帧。
 * 主角：语音流（450px 高）+ `late = dead` 64px；光 = 大字紫描边光 + GlowBlob + 橙点橙。零 glitch（白名单：本镜无）。
 */
const F0 = 1212;
const TO = 1345;
const T_LINE = 1220, LINE_LEN = 12;
const T_DOT0 = 1226, DOT_EVERY = 6, SLOTS = 9, SLOT_TOP = 370, SLOT_STEP = 45, DOT_R = 7;
const VICTIM = 4;                 // 槽 4 = y550；首枚受害 dot k=4（1250）
const T_LOST = 1250;              // 受害枚落下（变灰坠出）
const T_CROSS = 1256;             // 坠点红 ×（闪一次）
const T_BIG = 1272, BIG_LEN = 12, T_PULSE = 1284; // 成片 v2b：大字前挂 + 缩短，脉冲紧凑（14 帧内完成）
const T_WAVE = 1278, T_SKIP = 1278, T_SUB = 1286;
const T_PUSH = 1272, PUSH_LEN = 33; // 成片 v2c：前挂 3 帧，1305 前收尾（不进末拍）
const EXIT = TO - 8; // 1338

const AXIS = {y0: 336, y1: 784};
const BIG = {cx: 360, cy: 852, size: 64};
const SUB = {cx: 360, cy: 908};
const WAVE = {x: 275, y: 522, w: 170, h: 56, bars: 13, gapFrom: 5, gapTo: 7};
const SKIP = {cx: 492, cy: 550};

const KEYS = [
  {f: F0, x: 360, y: 640, s: 1},
  {f: T_PUSH, x: 360, y: 640, s: 1},
  {f: T_PUSH + PUSH_LEN, x: 360, y: 625, s: 1.18},
];

const slotY = (i: number) => SLOT_TOP + i * SLOT_STEP;

export const SC10: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const op = exitOp(N, TO, 4); // 成片 v2c：4 帧离场
  if (op <= 0) return null;
  const exDy = exitAccel(Math.max(0, N - EXIT), 0.2);
  const gk = glowOffK(N, TO);
  const breathe = 0.5 - 0.5 * Math.cos((2 * Math.PI * N) / 40);

  // —— 语音流 wipe ——
  const lineP = clamp01((N - T_LINE) / LINE_LEN);

  // —— 橙点节拍（每 6 帧一枚；槽位循环；受害槽在首轮之后保持空缺）——
  // 成片 v2：末 32 帧停发新点（腾稳定期；已落位的点保持亮，在途那枚落完即止）
  const rawDot = N - T_DOT0;
  const STOP = Math.floor((TO - 8 - 38 - T_DOT0) / DOT_EVERY); // 成片 v2c：末枚涟漪 ≤1300 前完成
  const dotIndexRaw = rawDot >= 0 ? Math.floor(rawDot / DOT_EVERY) : -1;
  const dotIndex = dotIndexRaw < 0 ? -1 : Math.min(dotIndexRaw, STOP);
  const phase = dotIndexRaw < 0 ? -1 : Math.min(rawDot / DOT_EVERY - Math.min(dotIndexRaw, STOP), 1);
  const lastLanding = (i: number): number => {
    if (dotIndex < 0 || i === VICTIM) return -1; // 受害槽永不落位（那枚坠失了）
    const k = dotIndex - (((dotIndex - i) % SLOTS) + SLOTS) % SLOTS;
    return k;
  };
  const curSlot = dotIndex >= 0 ? ((dotIndex % SLOTS) + SLOTS) % SLOTS : -1;
  const falling = dotIndex >= 0 && phase < 1 && curSlot !== VICTIM ? phase : -1;

  // —— 大字（缩放入场 + 脉冲）——
  const bn = N - T_BIG;
  const bigS = 0.62 + 0.38 * scaleIn(bn, BIG_LEN);
  const bigPulse = emphasisPulse(N - T_PULSE, {peak: 1.08, up: 5, hold: 1, down: 6}); // 成片 v2b：紧凑脉冲，1296 前完成
  const blobK = clamp01((N - T_PULSE) / 10) * gk;

  // —— skip 章 stampIn ——
  const skN = N - T_SKIP;
  const skipS = skN < 0 ? 0 : 1.4 - 0.4 * clamp01(skN / 10);

  // —— 红 ×（闪一次后淡出，1278 波形豁口入场前让位）——
  const cxN = N - T_CROSS;
  const crossOp = cxN < 0 || cxN > 22 ? 0 : cxN < 12 ? 1 : Math.max(0, 1 - (cxN - 12) / 10);

  return (
    <CameraRig N={N} keys={KEYS}>
      <div style={{position: 'absolute', inset: 0, opacity: op, transform: exDy ? `translateY(${exDy.toFixed(1)}px)` : undefined}}>
        {/* ============ 竖向语音流 ============ */}
        {lineP > 0 ? (
          <div style={{position: 'absolute', inset: 0, opacity: softOp(N - T_LINE, 5)}}>
            {/* 中轴线（自上而下 wipe）+ 槽位刻度 */}
            <svg width={720} height={1280} viewBox="0 0 720 1280" style={{position: 'absolute', inset: 0}}>
              <line x1={360} y1={AXIS.y0} x2={360} y2={AXIS.y0 + (AXIS.y1 - AXIS.y0) * lineP} stroke={WHITE} strokeWidth={2.5} opacity={0.55}
                style={{filter: 'drop-shadow(0 0 3px rgba(255,255,255,0.45))'}} />
              {Array.from({length: SLOTS}, (_, i) => i).filter((i) => slotY(i) <= AXIS.y0 + (AXIS.y1 - AXIS.y0) * lineP).map((i) => (
                <line key={i} x1={352} y1={slotY(i)} x2={368} y2={slotY(i)} stroke={GREY_MID} strokeWidth={2} opacity={0.7} />
              ))}
            </svg>
            {/* 已落位的橙点（衰减到 55%） */}
            {Array.from({length: SLOTS}, (_, i) => {
              if (i === VICTIM) return null; // 受害槽空缺（那枚晚到的包坠失了）
              const k = lastLanding(i);
              if (k < 0) return null;
              const landedAt = T_DOT0 + DOT_EVERY * k;
              if (N < landedAt) return null;
              const decay = 1 - 0.45 * clamp01((N - landedAt - 4) / 30);
              return (
                <div key={`d${i}`} style={{...abs(360 - DOT_R, slotY(i) - DOT_R, DOT_R * 2, DOT_R * 2), borderRadius: '50%',
                  background: ORANGE, opacity: decay,
                  boxShadow: `0 0 ${8 * decay}px 2px rgba(240,95,65,${(0.4 * decay).toFixed(2)})`}} />
              );
            })}
            {/* 正在下落的当前枚（橙光） */}
            {falling >= 0 && curSlot !== VICTIM ? (() => {
              const fp = powIn(1.7)(falling);
              const y = slotY(curSlot) - 26 + 26 * fp;
              return (
                <div style={{...abs(360 - DOT_R, y - DOT_R, DOT_R * 2, DOT_R * 2), borderRadius: '50%', background: ORANGE,
                  boxShadow: '0 0 12px 3px rgba(240,95,65,.75)'}} />
              );
            })() : null}
            {/* 落点涟漪（7 帧） */}
            {(() => {
              const items: React.ReactNode[] = [];
              for (let i = 0; i < SLOTS; i++) {
                if (i === VICTIM) continue;
                const k = lastLanding(i);
                if (k < 0) continue;
                const landedAt = T_DOT0 + DOT_EVERY * k;
                const rn = N - landedAt;
                if (rn >= 0 && rn < 7) {
                  items.push(<div key={`r${i}`} style={{...abs(360 - 9 - rn * 1.6, slotY(i) - 9 - rn * 1.6, (9 + rn * 1.6) * 2, (9 + rn * 1.6) * 2), borderRadius: '50%', border: `2px solid ${ORANGE}`, opacity: 0.5 * (1 - rn / 7)}} />);
                }
              }
              return items;
            })()}
            {/* 受害枚：落下途中变灰 → 偏右坠出线外消失（powIn 2） */}
            {(() => {
              const n = N - T_LOST;
              if (n < 0 || n > 22) return null;
              const grey = clamp01((n - 2) / 3);        // 第 2–5 帧橙→灰
              const slide = clamp01(n / 5) * 16;         // 向右脱离轨道
              const y = n < 5 ? slotY(VICTIM) - 26 + 26 * powIn(1.7)(n / 5) : slotY(VICTIM) + Math.pow(n - 4, 2) * 1.1;
              const fade = n < 10 ? 1 : Math.max(0, 1 - (n - 10) / 12);
              return (
                <div style={{...abs(360 + slide - DOT_R, y - DOT_R, DOT_R * 2, DOT_R * 2), borderRadius: '50%',
                  background: mixHex(ORANGE, GREY, grey), opacity: fade}} />
              );
            })()}
            {/* 坠点红 ×（闪一次） */}
            {crossOp > 0 ? (
              <svg width={720} height={1280} viewBox="0 0 720 1280" style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
                <g stroke={RED_DEEP} strokeWidth={4.5} strokeLinecap="round" opacity={crossOp}>
                  <line x1={360 - 11} y1={slotY(VICTIM) - 11} x2={360 + 11} y2={slotY(VICTIM) + 11} />
                  <line x1={360 + 11} y1={slotY(VICTIM) - 11} x2={360 - 11} y2={slotY(VICTIM) + 11} />
                </g>
              </svg>
            ) : null}
          </div>
        ) : null}

        {/* ============ 豁口：波形小竖线（两侧各三根）+ skip 灰章 ============ */}
        {N >= T_WAVE ? (
          <WaveformStrip x={WAVE.x} y={WAVE.y} w={WAVE.w} h={WAVE.h} bars={WAVE.bars}
            gapFrom={WAVE.gapFrom} gapTo={WAVE.gapTo} revealP={clamp01((N - T_WAVE) / 8)} breatheP={breathe}
            color={WHITE} opacity={softOp(N - T_WAVE, 6) * 0.95 * gk} />
        ) : null}
        {skN >= 0 ? (
          <div style={{position: 'absolute', inset: 0, transform: `rotate(-6deg) scale(${skipS.toFixed(3)})`, transformOrigin: `${SKIP.cx}px ${SKIP.cy}px`, opacity: clamp01((skN + 2) / 6)}}>
            <Pill x={SKIP.cx - 42} y={SKIP.cy - 17} w={84} h={34} r={17} stroke={GREY} sw={2} fill="#000" dashed
              text="skip" fontSize={24} weight={700} family={FONT_MONO} color={GREY_LIGHT} textDy={0} />
          </div>
        ) : null}

        {/* ============ 大字 late = dead（白 + 紫描边，缩放入场 + 脉冲）============ */}
        <GlowBlob cx={BIG.cx} cy={BIG.cy} r={175} N={N} k={0.24 * blobK} />
        {bn >= 0 ? (
          <div style={{position: 'absolute', inset: 0, opacity: softOp(bn, 10), transform: `scale(${(bigS * bigPulse).toFixed(4)})`, transformOrigin: `${BIG.cx}px ${BIG.cy}px`}}>
            <CText cx={BIG.cx} cy={BIG.cy} size={BIG.size} weight={900} color={WHITE} letterSpacing={1}
              shadow={`0 0 24px rgba(102,45,248,${(0.6 * gk).toFixed(2)}), 0 0 8px rgba(255,255,255,.35)`}
              style={{WebkitTextStroke: `2.5px ${PURPLE}`, paintOrder: 'stroke fill'}}>
              late = dead
            </CText>
          </div>
        ) : null}

        {/* 小灰字 */}
        <SoftIn N={N} f0={T_SUB}>
          <CText cx={SUB.cx} cy={SUB.cy} size={24} weight={500} family={FONT_MONO} color={GREY} letterSpacing={1} dy={0}>play the gap · move on</CText>
        </SoftIn>
      </div>
    </CameraRig>
  );
};
