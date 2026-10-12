import React from 'react';
import {useCurrentFrame} from 'remotion';
import {BEZ_SCALE_IN, clamp01, easeInOutPow, easeOutCubic, FONT_ORB, kf, powOutRemain, stepKf} from '../../common';
import {CameraRig, GlowBlob} from '../../fx';
import {
  Box, CText, ClockFace, Cross, EXAMPLE, GREY, GREY_LINE, GREY_MID, RED_DEEP, SoftIn, TechSub, TechText, WHITE,
  abs, exitOp, firstOp, glowOffK, mixHex, softOp,
} from '../../ui';

/**
 * SC12 缓步归队 · N 2356–2616（S22–S24，¶+gap15 章末；TO=2616 停在 C4 章节卡 2617 前一帧）。
 * 画面：中央大 ClockFace r=130 —— ghost 灰针 = 真时间（匀速 0.95°/f，起于 ~6:30 沿左弧爬升，2549 恰指 12 点）
 *       + 白针 overlay（白 6.5px，offsetDeg −8 起：rate 1.0→1.3(2455)→0.85(2505)→1.0(2549) 表 slew；
 *         追平越过 +6°（2549 的 −44）→ 回调至 0 重合，此后双针同步匀速、完全重合显示为一根）；
 *       + 盘下速率面板（连体框 488×150：`true time` 灰轨（标记停中位）/`your clock` 白轨（标记随速率 + 速率条）
 *         + `+`/`−` 微调标记（2455 `+` 亮 → 2505 换 `−` 亮 → 2549 后归平））。
 * 节拍：2356 大钟 slideUp Δ100/22f（首帧 ≈57%，幽灵针先行匀速）；2364 白针 SoftIn（落后 8°，S22.c1）；
 *       2412 `no jumps` 灰字 + 跳变小针简笔（stepKf ±62° 三跳）被红叉划掉（12f，2444–2452 一闪即收，S22.c2）；
 *       2455 速率面板入场（row2 +2f 错峰）+ `+` 亮 + 白针加速（offset −8→+6，S23.c1 speeds up）；
 *       2505 `+`→`−` 换亮 + 白针越顶回调（offset +6→0，S23.c2 slows down）；
 *       2549 重合帧：全钟白闪一拍（brightness + 扩散环）+ 紫光晕点亮（GlowBlob 0.32→1.0，S24.c1 walks back）；
 *       2594 `in step` 灰字 SoftIn（S24.c2 into step；双针已同步）。
 * 运镜：缓推 1.0→1.08（2356–2424）→ 段末拉回 1.0（2452–2534；末 key 2534 ≤ TO−50=2566 ✓，不进末拍）。
 * 停留：末拍大动效 = 2549 白闪（衰减完 ~2559 ≤ TO−45=2571 ✓）；2594 `in step` 为 24px 灰小字注释
 *       （timeline S24 末块 21⚠：块起 +0 帧入场、SoftIn 8f，小面积不触发 HOLD_THR）；hold 以 motion_check 实测为准。
 * 零 glitch（白名单：SC12 无——重合白闪是动作戏）、零扫光。文本全部取自 EXAMPLE。
 */
const F0 = 2356;
const TO = 2616;

// ---- 节拍（timeline S22–S24 字幕块起始；元素入场 −6…+3）----
const B_IN = F0;      // 大钟 slideUp（首帧即有内容）
const B_YOURS = 2364; // 白针 SoftIn（S22.c1 the gentle part）
const B_NOJMP = 2412; // `no jumps` + 跳变小针简笔（S22.c2）
const B_FAST = 2455;  // 速率面板 + 白针加速 + `+` 亮（S23.c1）
const B_SLOW = 2505;  // 越顶回调 + `−` 亮（S23.c2）
const B_MEET = 2549;  // 重合白闪 + 紫晕点亮（S24.c1）
const B_STEP = 2594;  // `in step` 灰字（S24.c2）

// ---- 大钟（ghost 灰针匀速；2549 恰指 12 点）----
const CLOCK = {cx: 640, cy: 290, r: 130};
const W_DEG = 0.95; // 幽灵针角速度 °/帧（1 圈 ~21 s——缓步，8° 落差可读）
const A0 = -(B_MEET - F0) * W_DEG; // 起始角 ≈ −183.35°（~6:30）
const angGhost = (N: number) => A0 + (N - F0) * W_DEG;
// 白针 offset（°，落后为负）：−8 → +6（越顶）→ 0（重合）。
// 与速率自洽：50f×0.3w=+14、44f×0.15w=−6.3（w=0.95）≈ 1.3 / 0.85 档。
const OFFSET_KF: Array<[number, number]> = [[F0, -8], [B_FAST, -8], [B_SLOW, 6], [B_MEET, 0]];
// 速率（面板标记/速率条显示用）
const RATE_KF: Array<[number, number]> = [
  [F0, 1], [B_FAST, 1], [B_FAST + 8, 1.3], [B_SLOW, 1.3], [B_SLOW + 8, 0.85], [B_MEET, 0.85], [B_MEET + 12, 1],
];
const rad = (deg: number) => ((deg - 90) * Math.PI) / 180; // 12 点起顺时针（ClockFace 同一约定）
const flashK = (n: number) => {
  if (n < 0 || n > 16) return 0;
  return n < 3 ? n / 3 : Math.exp(-(n - 3) / 4.5);
};

// ---- 速率面板（连体框，2455 入场；中心线 = 正常速率）----
const PANEL = {x: 396, y: 432, w: 488, h: 150};
const TRK = {x0: 440, x1: 840, cx: 640};
const ROW1 = {y: 492}; // true time（灰）
const ROW2 = {y: 556}; // your clock（白）
const MK_AMP = 70; // 标记最大偏移 px（m=±1 → ±70，微调量级）

// ---- 跳变小针简笔（2412–2452 一闪即收）----
const JK = {cx: 268, cy: 296, r: 36};
const JUMP_KF: Array<[number, number]> = [[B_NOJMP, -62], [B_NOJMP + 6, 62], [B_NOJMP + 12, -62], [B_NOJMP + 18, 62]];

export const SC12: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const ex = exitOp(N, TO, 5);
  const gk = glowOffK(N, TO, 3, 5);
  const EIO = easeInOutPow(2.2);

  // ---- 双针角度（ghost 匀速 / 白针 = ghost + offset）----
  const angG = angGhost(N);
  const offset = kf(N, OFFSET_KF, EIO);
  const angW = angG + offset;
  const tipX = 100 + Math.cos(rad(angW)) * 74;
  const tipY = 100 + Math.sin(rad(angW)) * 74;

  // ---- 速率（面板标记 + 速率条）----
  const rate = kf(N, RATE_KF, easeInOutPow(2));
  const m = (rate - 1) / 0.45;
  const mkX = TRK.cx + MK_AMP * m;

  // ---- 大钟入场 + 白闪 + 紫晕 ----
  const dialDy = 100 * powOutRemain(N - B_IN, 22, 2.5);
  const dialOp = firstOp(N - B_IN, 6);
  const flash = flashK(N - B_MEET);
  const blobK = (0.32 * softOp(N - B_IN, 12) + 0.68 * softOp(N - B_MEET, 10)) * gk;
  const needleOp = softOp(N - B_YOURS, 8);
  const ringP = clamp01((N - B_MEET) / 16);

  // ---- 速率面板入场（row2 +2f 错峰）+ `+`/`−` 换亮 ----
  const panelOp = softOp(N - B_FAST, 10);
  const panelDy = (1 - easeOutCubic(clamp01((N - B_FAST) / 14))) * 30;
  const row2Op = softOp(N - (B_FAST + 2), 10);
  const plusK = softOp(N - B_FAST, 6) * (1 - softOp(N - B_SLOW, 6));
  const minusK = softOp(N - B_SLOW, 6) * (1 - softOp(N - B_MEET, 8));

  // ---- 跳变小针（stepKf 硬跳三拍 + 红叉 12f + 收走）----
  const jkAng = stepKf(N, JUMP_KF);
  const jkOut = clamp01((N - (B_NOJMP + 32)) / 8);
  const jkOp = firstOp(N - B_NOJMP, 8) * (1 - jkOut);
  const jkS = 0.55 + 0.45 * BEZ_SCALE_IN(clamp01((N - B_NOJMP) / 10));
  const jkSink = 8 * jkOut;
  const crossP = clamp01((N - (B_NOJMP + 18)) / 12);
  const jkTipX = JK.cx + Math.cos(rad(jkAng)) * (JK.r - 8);
  const jkTipY = JK.cy + Math.sin(rad(jkAng)) * (JK.r - 8);

  // 一根刻度轨（线 + 11 刻度，中央刻度高亮）
  const trackSvg = (y: number, lineColor: string, lineW: number, lineOp: number) => (
    <svg width={1280} height={720} viewBox="0 0 1280 720" style={{...abs(0, 0), overflow: 'visible'}}>
      <line x1={TRK.x0} y1={y} x2={TRK.x1} y2={y} stroke={lineColor} strokeWidth={lineW} opacity={lineOp} />
      {Array.from({length: 11}, (_, i) => {
        const x = TRK.x0 + i * 40;
        const mid = i === 5;
        return (
          <line key={i} x1={x} y1={y - (mid ? 7 : 4)} x2={x} y2={y + (mid ? 7 : 4)}
            stroke={mid ? GREY_MID : GREY_LINE} strokeWidth={mid ? 2 : 1.5} />
        );
      })}
    </svg>
  );

  return (
    <CameraRig
      N={N}
      keys={[
        {f: F0, x: 640, y: 360, s: 1},
        {f: 2424, x: 640, y: 360, s: 1.08},
        {f: 2452, x: 640, y: 360, s: 1.08},
        {f: 2534, x: 640, y: 360, s: 1},
      ]}
    >
      <div style={{...abs(0, 0, 1280, 720), opacity: ex}}>
        {/* ---- 主角紫晕（0.32 常驻 → 2549 重合点亮 1.0；GlowBlob 内建低幅呼吸）---- */}
        <GlowBlob cx={CLOCK.cx} cy={CLOCK.cy} r={190} N={N} k={blobK} />

        {/* ---- 大钟（ghost 灰针 = 真时间匀速；白闪 brightness 施于整个钟组）---- */}
        <div
          style={{
            ...abs(0, 0, 1280, 720),
            opacity: dialOp,
            transform: `translateY(${dialDy.toFixed(1)}px)`,
            filter: flash > 0.001 ? `brightness(${(1 + 0.85 * flash).toFixed(3)})` : undefined,
          }}
        >
          <ClockFace cx={CLOCK.cx} cy={CLOCK.cy} r={CLOCK.r} N={angG / 6} ghost glow />
          {/* 白针（你的钟）：2364 SoftIn，落后 8° 起追 */}
          <div style={{...abs(0, 0, 1280, 720), opacity: needleOp}}>
            <svg
              width={260}
              height={260}
              viewBox="0 0 200 200"
              style={{
                position: 'absolute',
                left: CLOCK.cx - CLOCK.r,
                top: CLOCK.cy - CLOCK.r,
                overflow: 'visible',
                filter: `drop-shadow(0 0 3px rgba(255,255,255,${(0.55 * gk).toFixed(3)}))`,
              }}
            >
              <line x1={100} y1={100} x2={tipX.toFixed(2)} y2={tipY.toFixed(2)} stroke={WHITE} strokeWidth={5} strokeLinecap="round" />
              <circle cx={100} cy={100} r={5} fill={WHITE} />
            </svg>
          </div>
        </div>

        {/* ---- 2549 重合白闪扩散环 ---- */}
        {ringP > 0 && ringP < 1 ? (
          <svg width={1280} height={720} viewBox="0 0 1280 720" style={{...abs(0, 0), overflow: 'visible', filter: 'drop-shadow(0 0 8px rgba(255,255,255,.8))'}}>
            <circle cx={CLOCK.cx} cy={CLOCK.cy} r={46 + 66 * ringP} fill="none" stroke={WHITE} strokeWidth={3 * (1 - ringP) + 0.5} opacity={(0.85 * (1 - ringP)).toFixed(3)} />
          </svg>
        ) : null}

        {/* ---- 跳变小针简笔（2412 缩入 → 三跳 → 红叉 12f → 下沉收走）---- */}
        {jkOp > 0.01 ? (
          <div
            style={{
              ...abs(0, 0, 1280, 720),
              opacity: jkOp,
              transform: `translateY(${jkSink.toFixed(1)}px) scale(${jkS.toFixed(4)})`,
              transformOrigin: `${JK.cx}px ${JK.cy}px`,
            }}
          >
            <svg
              width={1280}
              height={720}
              viewBox="0 0 1280 720"
              style={{...abs(0, 0), overflow: 'visible', filter: crossP > 0 ? `drop-shadow(0 0 7px rgba(236,8,31,${(0.4 * gk).toFixed(2)}))` : undefined}}
            >
              <circle cx={JK.cx} cy={JK.cy} r={JK.r} fill="#000" stroke={GREY_MID} strokeWidth={2.5} />
              {[0, 90, 180, 270].map((a) => (
                <line
                  key={a}
                  x1={JK.cx + Math.cos(rad(a)) * (JK.r - 3)}
                  y1={JK.cy + Math.sin(rad(a)) * (JK.r - 3)}
                  x2={JK.cx + Math.cos(rad(a)) * (JK.r - 9)}
                  y2={JK.cy + Math.sin(rad(a)) * (JK.r - 9)}
                  stroke={GREY_MID}
                  strokeWidth={2}
                />
              ))}
              {/* 两个跳变站点（±62°，针在两站间瞬跳） */}
              {[-62, 62].map((a) => (
                <circle key={a} cx={JK.cx + Math.cos(rad(a)) * (JK.r - 8)} cy={JK.cy + Math.sin(rad(a)) * (JK.r - 8)} r={2.5} fill={GREY_MID} />
              ))}
              <line x1={JK.cx} y1={JK.cy} x2={jkTipX.toFixed(2)} y2={jkTipY.toFixed(2)} stroke={WHITE} strokeWidth={4} strokeLinecap="round" />
              <circle cx={JK.cx} cy={JK.cy} r={3.5} fill={WHITE} />
              <Cross cx={JK.cx} cy={JK.cy} size={84} sw={8} color={RED_DEEP} p={crossP} />
            </svg>
          </div>
        ) : null}
        {/* `no jumps` 灰字（保留至离场） */}
        <SoftIn N={N} f0={B_NOJMP}>
          <TechSub cx={JK.cx} cy={JK.cy + JK.r + 34} text={EXAMPLE.noJumps} size={24} />
        </SoftIn>

        {/* ---- 速率面板（连体框 2455 入场）---- */}
        <div style={{...abs(0, 0, 1280, 720), opacity: panelOp, transform: `translateY(${panelDy.toFixed(1)}px)`}}>
          <Box x={PANEL.x} y={PANEL.y} w={PANEL.w} h={PANEL.h} r={12} stroke={GREY_MID} sw={2} />
          {/* row1 · true time（灰，标记停中位 = 真时间匀速） */}
          {trackSvg(ROW1.y, GREY_MID, 2, 1)}
          <div
            style={{
              position: 'absolute',
              left: TRK.cx - 7,
              top: ROW1.y - 17,
              width: 0,
              height: 0,
              borderLeft: '7px solid transparent',
              borderRight: '7px solid transparent',
              borderTop: `10px solid ${GREY}`,
            }}
          />
          <TechSub cx={TRK.cx} cy={ROW1.y - 38} text={EXAMPLE.trueTime} size={22} />
          <CText cx={420} cy={ROW1.y} size={26} weight={700} family={FONT_ORB} color={GREY_MID}>−</CText>
          <CText cx={860} cy={ROW1.y} size={26} weight={700} family={FONT_ORB} color={GREY_MID}>+</CText>

          {/* row2 · your clock（白，标记随速率 + 速率条 + `+`/`−` 换亮；+2f 错峰） */}
          <div style={{...abs(0, 0, 1280, 720), opacity: row2Op}}>
            {trackSvg(ROW2.y, WHITE, 2.5, 0.78)}
            {Math.abs(mkX - TRK.cx) > 1.5 ? (
              <div
                style={{
                  position: 'absolute',
                  left: Math.min(TRK.cx, mkX),
                  top: ROW2.y - 3,
                  width: Math.abs(mkX - TRK.cx),
                  height: 6,
                  background: WHITE,
                  opacity: 0.5 + 0.45 * Math.min(1, Math.abs(m) * 2),
                  boxShadow: `0 0 9px rgba(255,255,255,${(0.4 * gk * Math.min(1, Math.abs(m) * 2.5)).toFixed(3)})`,
                }}
              />
            ) : null}
            <div
              style={{
                position: 'absolute',
                left: mkX - 7,
                top: ROW2.y - 17,
                width: 0,
                height: 0,
                borderLeft: '7px solid transparent',
                borderRight: '7px solid transparent',
                borderTop: `10px solid ${WHITE}`,
              }}
            />
            <TechText cx={TRK.cx} cy={ROW2.y - 38} text={EXAMPLE.yourClock} fontSize={22} color={WHITE} glow={false} letterSpacing={1.5} />
            <CText
              cx={420}
              cy={ROW2.y}
              size={26}
              weight={700}
              family={FONT_ORB}
              color={mixHex(GREY_MID, WHITE, minusK)}
              shadow={minusK > 0.05 ? `0 0 10px rgba(255,255,255,${(0.55 * minusK * gk).toFixed(3)})` : undefined}
            >
              −
            </CText>
            <CText
              cx={860}
              cy={ROW2.y}
              size={26}
              weight={700}
              family={FONT_ORB}
              color={mixHex(GREY_MID, WHITE, plusK)}
              shadow={plusK > 0.05 ? `0 0 10px rgba(255,255,255,${(0.55 * plusK * gk).toFixed(3)})` : undefined}
            >
              +
            </CText>
          </div>
        </div>

        {/* ---- 2594 · in step（双针已同步匀速，完全重合显示为一根）---- */}
        <SoftIn N={N} f0={B_STEP}>
          <TechSub cx={640} cy={610} text={EXAMPLE.inStep} size={24} />
        </SoftIn>
      </div>
    </CameraRig>
  );
};
