import React from 'react';
import {useCurrentFrame} from 'remotion';
import {clamp01, emphasisPulse, FONT_MONO, FONT_WIDE} from '../../common';
import {CText, abs, softOp, scaleIn, exitOp, glowOffK, slideUp, WHITE, GREY, GREY_MID, GREY_LIGHT, PURPLE} from '../../ui';

/**
 * SC35 可靠性住哪 · N 9418–9758（S65 9426–9514 + S66 9525–9721 ¶+gap15；章内段末延到 SC36.from−1=9758）
 * 版式：居中两行大字 `WHERE DOES` / `RELIABILITY LIVE?`（Audiowide 88px 白+紫描边，cy 192/282）；
 *       大字下小灰字 `reliable or fast?`（9452 灰删除线划过 = 旧问题的告别）；
 *       下半左右两个"居所"（各 260×180，y 388–568）：左冰晶格内嵌 TCP 砖（`frozen · kernel`，完全静止）
 *       vs 右幼苗土盆（`one update away`，3° 微摆持续）；中间 `vs` 灰 40px。
 * 节拍：9426/9432 大字两行依次缩放入（18 帧）；9448 `reliable or fast?` SoftIn、9452 删除线 wipe 12 帧；
 *       9525 大字 emphasisPulse + 两个居所虚线外框 slideUp（2 帧错峰；**前挂**：分镜表原未列此前置元素，
 *       为避免 9464–9582 出现 >3s 静止空窗加入，见 BUILD_NOTES）+ `vs` SoftIn；
 *       9582 左冰格晶枝 draw-on 20 帧 + 雪花记号 + TCP 砖 + `frozen · kernel`；
 *       9646 右幼苗 draw-on（盆 8 + 茎 10 + 两叶各 8）+ `app` + `one update away`，此后 3° 微摆持续。
 * 持续动作（成片 v1 修复 tcpudp-wide-fix-C）：①幼苗微摆加大到 ±5°、周期 40 帧（茎叶 + app 字一起，绕盆口）
 *       ②大字紫描边光呼吸加强（阴影 α 0.45±0.2、30 帧）③左冰格「结霜」微动：雪花记号每 45 帧轻微旋转 15° 一次
 *       ④`vs` 灰字 40 帧明暗交替（0.52↔0.88）；冰格晶枝保持静止（冻感对比）。
 * 运镜：无（Ch4 运镜清单未列本镜；静止段均 <3s）。
 * 离场：末 10 帧归零（9749–9758；大字柔光先灭）。停留：幼苗落位 9672 → 离场 9749，77 帧 ✓。
 * 主角：大字+双居所组（大字块 ink ~148–326 + 居所 180px）；光 = 大字紫描边光；苗白微光；冰格冷灰。
 */
const F0 = 9418;
const TO = 9758;
const T_L1 = 9426, T_L2 = 9432, T_Q = 9448, T_STRIKE = 9452, T_PULSE = 9525, T_FRAMES = 9525, T_VS = 9530;
const T_ICE = 9582, T_SNOW = 9590, T_BRICK = 9586, T_LBL_L = 9594;
const T_PLANT = 9646, T_APP = 9670, T_LBL_R = 9668, T_SWAY = 9672;

const BIG1 = 'WHERE DOES';
const BIG2 = 'RELIABILITY LIVE?';
const LBOX = {cx: 330, x: 200, y: 388, w: 260, h: 180};
const RBOX = {cx: 950, x: 820, y: 388, w: 260, h: 180};
const COLD = '#9DB4D6'; // 冰格冷灰蓝（点阵波底同族的冷白，非重点色）

// 冰晶枝折线（世界坐标 → 盒内局部坐标）
const ICE_LINES: Array<Array<[number, number]>> = [
  [[4, 58], [92, 22], [176, 50]],
  [[22, 168], [128, 132], [254, 158]],
  [[70, 10], [96, 170]],
  [[210, 8], [186, 120]],
];
const pathLen = (pts: Array<[number, number]>) => pts.slice(1).reduce((s, p, i) => s + Math.hypot(p[0] - pts[i][0], p[1] - pts[i][1]), 0);
const toD = (pts: Array<[number, number]>) => `M ${pts.map((p) => p.join(',')).join(' L ')}`;

export const SC35: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const exOp = exitOp(N, TO, 10);

  // 大字两行：缩放入（18 帧）+ 9525 组脉冲 + 光晕呼吸（离场前先灭光）
  const s1 = 0.55 + 0.45 * scaleIn(N - T_L1, 18);
  const s2 = 0.55 + 0.45 * scaleIn(N - T_L2, 18);
  const o1 = softOp(N - T_L1, 8);
  const o2 = softOp(N - T_L2, 8);
  const pulse = emphasisPulse(N - T_PULSE, {peak: 1.05, up: 12, hold: 4, down: 12});
  const gk = glowOffK(N, TO, 6, 10);
  // 大字紫描边光呼吸（成片 v1 修复：±0.2、30 帧，比原 ±0.075 加强 ~2.7×）
  const glowA = (0.45 + 0.2 * Math.sin((2 * Math.PI * N) / 30)) * gk;
  const bigShadow = `0 0 26px rgba(102,45,248,${glowA.toFixed(3)}), 0 0 8px rgba(255,255,255,.3)`;

  // 删除线（12 帧 wipe）+ 小灰字
  const qOp = softOp(N - T_Q, 8);
  const strikeP = clamp01((N - T_STRIKE) / 12);

  // 居所外框 slideUp（2 帧错峰）
  const frL = N - T_FRAMES;
  const frR = N - (T_FRAMES + 2);

  // 冰格晶枝 draw-on（20 帧，幂缓出，逐条错峰）
  const iceK = 1 - Math.pow(1 - clamp01((N - T_ICE) / 20), 2);

  // 幼苗：盆 8 帧 → 茎 10 帧 → 叶1/叶2 各 8 帧
  const potP = clamp01((N - T_PLANT) / 8);
  const stemP = clamp01((N - (T_PLANT + 8)) / 10);
  const leaf1P = clamp01((N - (T_PLANT + 18)) / 8);
  const leaf2P = clamp01((N - (T_PLANT + 26)) / 8);
  // 微摆加大（成片 v1 修复）：±5°、40 帧周期（叶落后开始，绕盆口旋转，茎叶 + app 一起）
  const sway = 5 * Math.sin((2 * Math.PI * (N - T_PLANT)) / 40) * clamp01((N - T_SWAY) / 12);
  // 苗白微光（呼吸 30 帧）
  const sproutGlow = `drop-shadow(0 0 ${(6 + 3 * (0.5 + 0.5 * Math.sin((2 * Math.PI * N) / 30))).toFixed(1)}px rgba(255,255,255,.45))`;
  // 雪花记号「结霜」微动（成片 v1 修复）：每 45 帧轻微旋转 15° 一次（12 帧内去而复返）
  const snowN = N - T_SNOW;
  const snowLocal = ((snowN % 45) + 45) % 45;
  const snowRot = snowN >= 0 && snowLocal < 12 ? 15 * Math.sin(Math.PI * (snowLocal / 12)) : 0;
  // `vs` 灰字 40 帧明暗交替（成片 v1 修复：0.52↔0.88）
  const vsOp = 0.7 + 0.18 * Math.sin((2 * Math.PI * N) / 40);

  return (
    <div style={{position: 'absolute', inset: 0, opacity: exOp}}>
      {/* ——— 大字两行（Audiowide 88px 白+紫描边+紫柔光；9525 组脉冲） ——— */}
      <div style={{position: 'absolute', inset: 0, transform: pulse === 1 ? undefined : `scale(${pulse.toFixed(4)})`, transformOrigin: '640px 236px'}}>
        <div style={{position: 'absolute', inset: 0, opacity: o1, transform: s1 < 1 ? `scale(${s1.toFixed(4)})` : undefined, transformOrigin: '640px 192px'}}>
          <CText cx={640} cy={192} size={88} weight={400} family={FONT_WIDE} letterSpacing={2} color={WHITE} dy={-4} shadow={bigShadow} style={{WebkitTextStroke: `2.5px ${PURPLE}`, paintOrder: 'stroke fill'}}>{BIG1}</CText>
        </div>
        <div style={{position: 'absolute', inset: 0, opacity: o2, transform: s2 < 1 ? `scale(${s2.toFixed(4)})` : undefined, transformOrigin: '640px 282px'}}>
          <CText cx={640} cy={282} size={88} weight={400} family={FONT_WIDE} letterSpacing={2} color={WHITE} dy={-4} shadow={bigShadow} style={{WebkitTextStroke: `2.5px ${PURPLE}`, paintOrder: 'stroke fill'}}>{BIG2}</CText>
        </div>
      </div>

      {/* ——— reliable or fast? + 灰删除线（旧问题的告别） ——— */}
      {qOp > 0 ? (
        <div style={{position: 'absolute', inset: 0, opacity: qOp}}>
          <CText cx={640} cy={362} size={28} weight={600} family={FONT_MONO} color={GREY} style={{opacity: 0.9}}>reliable or fast?</CText>
          {strikeP > 0 ? (
            <div style={{...abs(640 - 116, 360.5, 232, 3), background: GREY_MID, transform: `scaleX(${strikeP.toFixed(3)})`, transformOrigin: '0% 50%'}} />
          ) : null}
        </div>
      ) : null}

      {/* ——— 左居所：冰晶格 + TCP 砖（frozen · kernel，完全静止） ——— */}
      {frL >= 0 ? (
        <div style={{position: 'absolute', inset: 0, opacity: softOp(frL, 8), transform: `translateY(${slideUp(frL, 40, 16).toFixed(2)}px)`}}>
          <div style={{...abs(LBOX.x, LBOX.y, LBOX.w, LBOX.h), boxSizing: 'border-box', border: `2.5px dashed ${GREY_MID}`, borderRadius: 14, background: 'rgba(0,0,0,.4)'}} />
          {/* 冰晶枝（逐条错峰 draw-on；冷灰蓝，无光） */}
          <svg width={LBOX.w} height={LBOX.h} viewBox={`0 0 ${LBOX.w} ${LBOX.h}`} style={{position: 'absolute', left: LBOX.x, top: LBOX.y, overflow: 'visible'}}>
            {ICE_LINES.map((pts, i) => {
              const k = clamp01((iceK - i * 0.22) / 0.78);
              if (k <= 0) return null;
              const L = pathLen(pts);
              return <path key={i} d={toD(pts)} fill="none" stroke={COLD} strokeWidth={2} opacity={0.8} strokeDasharray={L} strokeDashoffset={L * (1 - k)} />;
            })}
          </svg>
          {/* 雪花记号（顶部，三线交叉；每 45 帧轻微旋转 15° 一次「结霜」微动） */}
          {N >= T_SNOW ? (
            <svg width={30} height={30} viewBox="0 0 30 30" style={{position: 'absolute', left: LBOX.cx - 15, top: LBOX.y + 10, overflow: 'visible', opacity: softOp(N - T_SNOW, 8)}}
              transform={`rotate(${snowRot.toFixed(2)} 15 15)`}>
              <line x1={15} y1={2} x2={15} y2={28} stroke={GREY_LIGHT} strokeWidth={2} strokeLinecap="round" />
              <line x1={4} y1={8.5} x2={26} y2={21.5} stroke={GREY_LIGHT} strokeWidth={2} strokeLinecap="round" />
              <line x1={4} y1={21.5} x2={26} y2={8.5} stroke={GREY_LIGHT} strokeWidth={2} strokeLinecap="round" />
            </svg>
          ) : null}
          {/* TCP 砖（嵌在冰格中央，静止无光） */}
          {N >= T_BRICK ? (
            <div style={{position: 'absolute', inset: 0, opacity: softOp(N - T_BRICK, 8)}}>
              <div style={{...abs(LBOX.cx - 46, 452, 92, 58), boxSizing: 'border-box', background: '#000', border: `2.5px solid ${GREY_LIGHT}`, borderRadius: 6}} />
              <CText cx={LBOX.cx} cy={481} size={26} weight={700} family={FONT_MONO} color={GREY_LIGHT} letterSpacing={2}>TCP</CText>
            </div>
          ) : null}
          <div style={{position: 'absolute', inset: 0, opacity: softOp(N - T_LBL_L, 8)}}>
            <CText cx={LBOX.cx} cy={596} size={24} weight={600} family={FONT_MONO} color={GREY}>frozen · kernel</CText>
          </div>
        </div>
      ) : null}

      {/* ——— vs（40 帧明暗交替） ——— */}
      {N >= T_VS ? (
        <div style={{position: 'absolute', inset: 0, opacity: softOp(N - T_VS, 8)}}>
          <CText cx={640} cy={478} size={40} weight={700} family={FONT_MONO} color={GREY} style={{opacity: vsOp}}>vs</CText>
        </div>
      ) : null}

      {/* ——— 右居所：幼苗土盆（one update away，±5° 微摆） ——— */}
      {frR >= 0 ? (
        <div style={{position: 'absolute', inset: 0, opacity: softOp(frR, 8), transform: `translateY(${slideUp(frR, 40, 16).toFixed(2)}px)`}}>
          <div style={{...abs(RBOX.x, RBOX.y, RBOX.w, RBOX.h), boxSizing: 'border-box', border: `2.5px dashed ${GREY_MID}`, borderRadius: 14, background: 'rgba(0,0,0,.4)'}} />
          {/* 土盆（draw-on 8 帧） */}
          <svg width={RBOX.w} height={RBOX.h} viewBox={`0 0 ${RBOX.w} ${RBOX.h}`} style={{position: 'absolute', left: RBOX.x, top: RBOX.y, overflow: 'visible'}}>
            <path d="M 115,118 L 145,118 L 137,158 L 123,158 Z" fill="none" stroke={WHITE} strokeWidth={2.5} strokeLinejoin="round" strokeDasharray={130} strokeDashoffset={130 * (1 - potP)} />
          </svg>
          {/* 苗（茎 + 两叶；绕盆口 (950,506) 微摆） */}
          <div style={{position: 'absolute', inset: 0, transform: `rotate(${(sway * Math.PI / 180).toFixed(4)}rad)`, transformOrigin: '950px 506px'}}>
            <svg width={140} height={120} viewBox="0 0 140 120" style={{position: 'absolute', left: 880, top: 388, overflow: 'visible', filter: stemP > 0 ? sproutGlow : undefined}}>
              {/* 茎（10 帧 draw-on，S 形） */}
              <path d="M 70,118 C 66,96 76,84 70,64" fill="none" stroke={WHITE} strokeWidth={3} strokeLinecap="round" strokeDasharray={58} strokeDashoffset={58 * (1 - stemP)} />
              {/* 叶 1（左，8 帧） */}
              {leaf1P > 0 ? <path d="M 68,80 C 46,74 38,58 42,44 C 58,46 70,60 68,80 Z" fill="#000" stroke={WHITE} strokeWidth={2.5} strokeLinejoin="round" strokeDasharray={110} strokeDashoffset={110 * (1 - leaf1P)} /> : null}
              {/* 叶 2（右，8 帧；写 app） */}
              {leaf2P > 0 ? <path d="M 72,92 C 94,86 104,70 100,54 C 84,56 71,72 72,92 Z" fill="#000" stroke={WHITE} strokeWidth={2.5} strokeLinejoin="round" strokeDasharray={110} strokeDashoffset={110 * (1 - leaf2P)} /> : null}
            </svg>
            {N >= T_APP ? (
              <div style={{position: 'absolute', inset: 0, opacity: softOp(N - T_APP, 8)}}>
                <CText cx={978} cy={452} size={22} weight={700} family={FONT_MONO} color={WHITE}>app</CText>
              </div>
            ) : null}
          </div>
          <div style={{position: 'absolute', inset: 0, opacity: softOp(N - T_LBL_R, 8)}}>
            <CText cx={RBOX.cx} cy={596} size={24} weight={600} family={FONT_MONO} color={GREY}>one update away</CText>
          </div>
        </div>
      ) : null}
    </div>
  );
};
