import React from 'react';
import {useCurrentFrame} from 'remotion';
import {clamp01, easeInOutPow, powIn, GlitchIn, emphasisPulse, FONT_MONO, FONT_WIDE} from '../../common';
import {
  CText, Pill, WaveformStrip, abs, softOp, firstOp, exitOp, glowOffK, exitAccel, mixHex, SoftIn,
  WHITE, GREY, GREY_MID, GREY_LIGHT, ORANGE, RED_DEEP, PURPLE,
} from '../../ui';
import {CameraRig, GlowBlob, countTo} from '../../fx';

/**
 * SC27 晚到即死 · N 6455–6956（S46 6463–6521 + S47 6532–6663 + S48 6674–6800 + S49 6811–6858 + S50 6869–6934 ¶，段末）
 * **章 3 高光时刻·论点型**。节拍：6463 晚=死 / 6532 语音是包流 / 6603 每 20 毫秒一枚 / 6674 丢一枚不重等 / 6811 时刻已过 / 6869 小豁口继续走。
 * 上半：20ms 节拍时间带（x 180–1100，y 262）：橙点每 6 帧一枚自上落下（21 槽位循环，落点亮起后衰减到 55%，
 *   坠落中的当前枚带橙光）；左上 `one every 20 ms` Orbitron 44 橙（6603 词组入 + `20` 14 帧计数 + 数字随节拍闪）。
 * 6674：一枚落下途中变灰坠落穿带消失（powIn 2）+ 坠点红 `×` 闪一次；此后该槽位保持空缺（丢一枚不重等）。
 * 下半：`LATE`（Audiowide 96 白 + 紫硬投影，GlitchIn rgbSplit 6 = 本镜唯一 glitch）/ 静态白线 / `MEANS DEAD.`
 *   （白 + 紫描边 + 紫柔光）两行论点大字；右侧 SC09 缩微波形（18 bar，豁口 7–9）：6532 展开 8/18 → 6871 越过豁口
 *   继续到 18/18（「plays a tiny gap, and moves on」）+ 6869 `skip` 灰章 stampIn。
 * 运镜：6826–6859 33 帧 1→1.18 推近（cam 640,360→640,450；末态世界可见区 x[98,1182] y[145,755]，全部内容在内）。
 * 持续：橙点节拍到离场 / 波形 ±15% 律动 / GlowBlob 30 帧呼吸。
 * 停留：skip 章落位 6879 → 离场 6948（末 8 帧归零），69 帧 ✓（S50 末块 66）。零扫光。
 * 主角：`LATE / MEANS DEAD.` 96px 大字组 + 节拍带；光 = 大字紫描边光 + GlowBlob（高光时刻大面积柔光）+ 节拍橙。
 */
const F0 = 6455;
const TO = 6956;
const T_BAND = 6463;    // S46：时间带 wipe（12 帧）
const T_DOT0 = 6476;    // 首枚橙点（此后每 6 帧一枚）
const T_WAVE = 6532;    // S47 b1：波形展开 0→8/18（16 帧）
const T_MS = 6603;      // S47 b2：one every …（词组 + `20` 14 帧计数 + ms）
const T_LOST = 6674;    // S48：灰坠落（victim 槽 12）
const T_BIG = 6811;     // S49：LATE GlitchIn（12 帧）+ 6819 MEANS DEAD. SoftIn + 6815 白线
const T_SKIP = 6869;    // S50：skip 章 stampIn（10 帧）+ 6871 波形越过豁口继续展开（24 帧）
const T_PUSH = 6826;    // 运镜 33 帧 1→1.18
const EXIT = TO - 8;    // 6948

const BAND = {x0: 180, x1: 1100, y: 262};
const SLOTS = 21;
const SLOT_X = (i: number) => 200 + ((i % SLOTS) + SLOTS) % SLOTS * 44; // 200..1080
const DOT_R = 5.5;
const VICTIM_SLOT = 12; // 6674 应落此槽（dotIndex 33）→ 变灰坠落，此后保持空缺
const LAB = {x: 130, cy: 196}; // `one every 20 ms`
const WAVE = {x: 940, y: 425, w: 180, h: 90, bars: 18, gapFrom: 7, gapTo: 9};
const BIG = {cx: 530, l1: 412, line: 468, l2: 528, size: 96};
const SKIP = {cx: 1025, cy: 398};

/** 波形 revealP：0 → 8/18（6532–6548）→ 停 → 1（6871–6895，越过豁口继续） */
const waveP = (N: number) => {
  if (N < T_WAVE) return 0;
  if (N < T_WAVE + 16) return (8 / 18) * ((N - T_WAVE) / 16);
  if (N < T_SKIP + 2) return 8 / 18;
  if (N < T_SKIP + 26) return 8 / 18 + (10 / 18) * ((N - T_SKIP - 2) / 24);
  return 1;
};

export const SC27: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const op = exitOp(N, TO, 8);
  const exDy = exitAccel(Math.max(0, N - EXIT), 0.3);
  const gk = glowOffK(N, TO);
  const breatheK = N < TO - 8 - 40 ? 1 : 0.45; // 成片 v4：末 40 帧呼吸幅度减半（hold 稳定期；仍可感）
  const breathe = (0.5 - 0.5 * Math.cos((2 * Math.PI * N) / 40)) * breatheK;

  // —— 节拍带 ——
  const bandP = clamp01((N - T_BAND) / 12);
  const dotN = N - T_DOT0;
  const dotIndex = dotN >= 0 ? Math.floor(dotN / 6) : -1;
  const lastLanding = (i: number): number => {
    if (dotIndex < 0) return -1;
    const k = dotIndex - (((dotIndex - i) % SLOTS) + SLOTS) % SLOTS;
    return k >= 33 && i === VICTIM_SLOT ? 12 : k; // 受害槽只保留第 12 枚（6548），33 起空缺
  };
  const curSlot = dotIndex >= 0 ? ((dotIndex % SLOTS) + SLOTS) % SLOTS : -1;
  const falling = dotIndex >= 0 && curSlot !== VICTIM_SLOT ? ((dotN / 6) - dotIndex) : -1;

  // —— `one every 20 ms`：词组 + 计数 + 节拍闪 ——
  const msN = N - T_MS;
  const cnt20 = msN >= 2 ? (msN < 16 ? countTo(msN - 2, 0, 20, 14) : '20') : null;
  const onBeat = N > T_MS + 18 && dotN >= 0 && dotN % 6 < 2;
  const beatFlash = onBeat ? 1.45 : 1; // 成片 v2：节拍闪加强（1.22→1.45 + 1.03 scale + 发光）
  const beatScale = onBeat ? 1.03 : 1;

  // —— 大字（6811 起）——
  const bigN = N - T_BIG;
  const bigPulse = emphasisPulse(N - (T_BIG + 12), {peak: 1.05, up: 9, hold: 3, down: 9});
  const blobK = clamp01((N - (T_BIG + 8)) / 10) * gk;

  // —— skip 章 stampIn ——
  const skN = N - T_SKIP;
  const skipS = skN < 0 ? 0 : 1.4 - 0.4 * easeInOutPow(2.5)(clamp01(skN / 10));

  return (
    <CameraRig N={N} keys={[{f: F0, x: 640, y: 360, s: 1}, {f: T_PUSH, x: 640, y: 360, s: 1}, {f: T_PUSH + 33, x: 640, y: 450, s: 1.18}]}>
      <div style={{position: 'absolute', inset: 0, opacity: op, transform: exDy ? `translateY(${exDy.toFixed(1)}px)` : undefined}}>
        {/* ============ 上半：20ms 节拍时间带 ============ */}
        {bandP > 0 ? (
          <div style={{position: 'absolute', inset: 0, opacity: softOp(N - T_BAND, 5)}}>
            {/* 带线（自左 wipe）+ 槽位刻度 */}
            <div style={{...abs(BAND.x0, BAND.y - 1.25, (BAND.x1 - BAND.x0) * bandP, 2.5), background: GREY_MID, opacity: bandP >= 1 && onBeat ? 0.95 : 0.6, boxShadow: bandP >= 1 && onBeat ? '0 0 10px 3px rgba(255,255,255,.35)' : undefined, transition: 'none'}} />
            {Array.from({length: SLOTS}, (_, i) => i).filter((i) => SLOT_X(i) <= BAND.x0 + (BAND.x1 - BAND.x0) * bandP).map((i) => (
              <div key={i} style={{...abs(SLOT_X(i) - 1.25, BAND.y + 4, 2.5, 9), background: GREY_MID, opacity: 0.7}} />
            ))}
            {/* 已落位的橙点（衰减到 55%） */}
            {Array.from({length: SLOTS}, (_, i) => {
              if (i === VICTIM_SLOT && N >= T_LOST) return null; // 6674 后受害槽空缺
              const k = lastLanding(i);
              if (k < 0) return null;
              const landedAt = T_DOT0 + 6 * k;
              if (N < landedAt) return null;
              const decay = 1 - 0.45 * clamp01((N - landedAt - 4) / 30);
              return (
                <div key={`d${i}`} style={{...abs(SLOT_X(i) - DOT_R, BAND.y - 10 - DOT_R, DOT_R * 2, DOT_R * 2), borderRadius: '50%',
                  background: ORANGE, opacity: decay,
                  boxShadow: `0 0 ${8 * decay}px 2px rgba(240,95,65,${(0.4 * decay).toFixed(2)})`}} />
              );
            })}
            {/* 正在下落的当前枚（橙光）+ 落点涟漪 */}
            {falling >= 0 ? (() => {
              const fp = powIn(1.7)(falling);
              const y = 240 + 16 * fp;
              return (
                <div style={{...abs(SLOT_X(curSlot) - DOT_R, y - DOT_R, DOT_R * 2, DOT_R * 2), borderRadius: '50%', background: ORANGE,
                  boxShadow: `0 0 12px 3px rgba(240,95,65,.75)`}} />
              );
            })() : null}
            {(() => {
              const items: React.ReactNode[] = [];
              for (let i = 0; i < SLOTS; i++) {
                if (i === VICTIM_SLOT && N >= T_LOST) continue;
                const k = lastLanding(i);
                if (k < 0) continue;
                const landedAt = T_DOT0 + 6 * k;
                const rn = N - landedAt;
                if (rn >= 0 && rn < 7) {
                  items.push(<div key={`r${i}`} style={{...abs(SLOT_X(i) - 9 - rn * 1.6, BAND.y - 10 - 9 - rn * 1.6, (9 + rn * 1.6) * 2, (9 + rn * 1.6) * 2), borderRadius: '50%', border: `2px solid ${ORANGE}`, opacity: 0.5 * (1 - rn / 7)}} />);
                }
              }
              return items;
            })()}
            {/* 受害枚：6674 落下途中变灰 → 穿带坠落消失 */}
            {(() => {
              const n = N - T_LOST;
              if (n < 0 || n > 22) return null;
              const grey = clamp01((n - 2) / 3); // 第 2–5 帧橙→灰
              const y = n < 5 ? 240 + 16 * powIn(1.7)(n / 5) : 256 + Math.pow(n - 4, 2) * 0.55;
              const fade = n < 10 ? 1 : Math.max(0, 1 - (n - 10) / 12);
              return (
                <div style={{...abs(SLOT_X(VICTIM_SLOT) - DOT_R, y - DOT_R, DOT_R * 2, DOT_R * 2), borderRadius: '50%',
                  background: mixHex(ORANGE, GREY, grey), opacity: fade}} />
              );
            })()}
            {/* 坠点红 ×（闪一次） */}
            {(() => {
              const n = N - (T_LOST + 6);
              if (n < 0 || n > 24) return null;
              const fade = n < 14 ? 1 : Math.max(0, 1 - (n - 14) / 10);
              return (
                <svg width={1280} height={720} viewBox="0 0 1280 720" style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
                  <g stroke={RED_DEEP} strokeWidth={4} strokeLinecap="round" opacity={fade}>
                    <line x1={SLOT_X(VICTIM_SLOT) - 9} y1={BAND.y + 14} x2={SLOT_X(VICTIM_SLOT) + 9} y2={BAND.y + 32} />
                    <line x1={SLOT_X(VICTIM_SLOT) + 9} y1={BAND.y + 14} x2={SLOT_X(VICTIM_SLOT) - 9} y2={BAND.y + 32} />
                  </g>
                </svg>
              );
            })()}
          </div>
        ) : null}

        {/* `one every 20 ms`（词组 + `20` 计数 + 节拍闪；数字定宽防布局跳动） */}
        {msN >= 0 ? (
          <div style={{...abs(LAB.x, LAB.cy - 24, 480, 48), opacity: firstOp(msN, 8), filter: beatFlash > 1 ? `brightness(${beatFlash})` : undefined, transform: `scale(${beatScale})`, transformOrigin: '0 50%'}}>
            <div style={{display: 'flex', alignItems: 'baseline', fontFamily: 'Orbitron,Audiowide,sans-serif', fontSize: 44, fontWeight: 700, color: ORANGE, letterSpacing: 1, whiteSpace: 'nowrap',
              textShadow: `0 0 14px rgba(240,95,65,.55)`}}>
              <span style={{opacity: clamp01(msN / 6)}}>one every</span>
              <span style={{display: 'inline-block', width: 96, textAlign: 'center', opacity: clamp01((msN - 2) / 4)}}>&nbsp;{cnt20 ?? ''}&nbsp;</span>
              <span style={{opacity: clamp01((msN - 18) / 6)}}>ms</span>
            </div>
          </div>
        ) : null}

        {/* ============ 下半：论点大字 + 缩微波形 ============ */}
        <GlowBlob cx={BIG.cx} cy={(BIG.l1 + BIG.l2) / 2} r={215} N={N} k={0.24 * blobK} />
        {bigN >= 0 ? (
          <div style={{position: 'absolute', inset: 0, transform: `scale(${bigPulse.toFixed(4)})`, transformOrigin: `${BIG.cx}px ${(BIG.l1 + BIG.l2) / 2}px`}}>
            {/* 第一行：LATE（白 + 紫硬投影，本镜唯一 glitch，rgbSplit 6） */}
            <GlitchIn N={N} f0={T_BIG} rgbSplit={6} seed={27}>
              <CText cx={BIG.cx} cy={BIG.l1} size={BIG.size} weight={400} family={FONT_WIDE} color={WHITE} letterSpacing={4} dy={-2}
                shadow={`6px 6px 0 ${PURPLE}, 0 0 28px rgba(102,45,248,.5)`}>LATE</CText>
            </GlitchIn>
            {/* 中间静态白线 */}
            <SoftIn N={N} f0={T_BIG + 4} len={6} dy={0}>
              <div style={{...abs(BIG.cx - 85, BIG.line - 1.5, 170, 3), background: WHITE, opacity: 0.75}} />
            </SoftIn>
            {/* 第二行：MEANS DEAD.（白 + 紫描边 + 紫柔光） */}
            <SoftIn N={N} f0={T_BIG + 8} dy={14}>
              <CText cx={BIG.cx} cy={BIG.l2} size={BIG.size} weight={400} family={FONT_WIDE} color={WHITE} letterSpacing={4} dy={-2}
                shadow={`0 0 24px rgba(102,45,248,.55)`}
                style={{WebkitTextStroke: `2.5px ${PURPLE}`, paintOrder: 'stroke fill'}}>MEANS DEAD.</CText>
            </SoftIn>
          </div>
        ) : null}

        {/* 缩微波形（豁口 = 丢失的那一枚；6871 越过豁口继续展开） */}
        <WaveformStrip x={WAVE.x} y={WAVE.y} w={WAVE.w} h={WAVE.h} bars={WAVE.bars}
          gapFrom={WAVE.gapFrom} gapTo={WAVE.gapTo} revealP={waveP(N)} breatheP={breathe} color={WHITE} opacity={softOp(N - T_WAVE, 6) * 0.95} />

        {/* `skip` 章（豁口上方，stampIn 1.4→1） */}
        {skN >= 0 ? (
          <div style={{position: 'absolute', inset: 0, transform: `rotate(-6deg) scale(${skipS.toFixed(3)})`, transformOrigin: `${SKIP.cx}px ${SKIP.cy}px`, opacity: clamp01((skN + 2) / 6)}}>
            <Pill x={SKIP.cx - 38} y={SKIP.cy - 15} w={76} h={30} r={15} stroke={GREY} sw={2} fill="#000" dashed
              text="skip" fontSize={22} weight={700} family={FONT_MONO} color={GREY_LIGHT} textDy={0} />
          </div>
        ) : null}
      </div>
    </CameraRig>
  );
};
