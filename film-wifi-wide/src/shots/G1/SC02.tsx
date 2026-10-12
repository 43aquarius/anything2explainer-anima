import React from 'react';
import {useCurrentFrame} from 'remotion';
import {clamp01, kf, rnd} from '../../common';
import {CameraRig} from '../../fx';
import {CText, SoftIn, Svg, LineArrow, Cross, DeviceGlyph, GREY, GREY_MID, GREY_LIGHT, WHITE, CORAL, ORANGE, PURPLE_LIGHT, abs, fadeIn, exitOp, glowOffK, mixHex, EXAMPLE} from '../../ui';

/**
 * SC02 半双工（249–332）。S03：无线电不能边说边听 / 不能同时。
 * 节拍：257 笔记本缩入（21f）+ `your laptop` SoftIn｜258 嘴（扬声器）draw-on 10f + `talk`｜261 耳 draw-on 10f + `listen`
 *       ｜262 嘴波列起发（12f 一列，白弧朝外）｜270 耳波列起发（12f 一列，灰弧朝内）——两列在交点区互相穿行（"同时"的乱）
 *       ｜303 交点噪声花爆开（10f 毛刺放射）+ 红 Cross draw-on（10f）+ 全场暗一拍（303–311）+ 波列撞停
 *       ｜305 换向闸 draw-on（12f：talk ⇄ listen 双向箭头闸）→ 318 闸刀拨"嘴"（5f）+ 嘴波列复亮成紫（8f）+ 耳侧灰化 + 幽灵刀位/虚线摆程（交替示意）
 * 运镜：33f 1.0→1.12 推向交点（249–282，末 key ≤ TO−50=282 ✓；303 拍落在推近后的稳定画框里——分镜表"303 时"与末 key 铁律冲突，取铁律，记录 BUILD_NOTES）。
 * 停留：段内不判（S03 末块 27；尾部被 303 拍天然占用，hold 读数记录于 BUILD_NOTES）。
 * 主角：半双工对比图 ≈320px（噪声花橙红光；Cross 红；闸/嘴弧紫）。零 glitch（白名单：SC02 无）。
 */
const F0 = 249;
const TO = 332;

const LAPTOP = {cx: 640, cy: 522, w: 210}; // 底：半双工的本体（无线电台）
const MOUTH = {cx: 405, cy: 285}; // 左：嘴（发声弧朝外）
const EAR = {cx: 875, cy: 285}; // 右：耳（接收弧朝内）
const MEET = {cx: 640, cy: 285}; // 交点（噪声花 + Cross）
const GATE = {cx: 640, cy: 398, w: 340, h: 62}; // 换向闸（talk ⇄ listen）
const CELL_D = 85; // 闸左右格心距

const WV = 7; // 波列推进 px/f
const MOUTH_F0 = 262; // 嘴波列首列
const EAR_F0 = 270; // 耳波列首列
const WAVE_SPAN = 12; // 发列间隔
const N_BRISTLES = 14; // 噪声花毛刺数

export const SC02: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const exit = 1; // 硬切承接（节拍斩切设计：84 帧短镜，末拍即节拍；不离场镜头 hold 带~不判）
  const gOff = 1; // 不灭光，直接切

  // ---- 笔记本（257 缩入 21f）----
  const lapS = 0.55 + 0.45 * clamp01((N - 257) / 21);

  // ---- 嘴/耳图标（258/261 draw-on 10f）----
  const mP = clamp01((N - 258) / 10);
  const eP = clamp01((N - 261) / 10);
  const earDimK = kf(N, [[318, 0], [324, 1]]); // 拨到"嘴"后耳侧灰化
  const earStroke = mixHex(WHITE, GREY_MID, earDimK);

  // ---- 波列（303 撞停 → 318 嘴列复亮成紫）----
  const mouthGate = kf(N, [[303, 1], [307, 0], [318, 0], [326, 0.9]]);
  const earGate = kf(N, [[303, 1], [307, 0]]);
  const talkK = kf(N, [[318, 0], [326, 1]]);
  const mColor = mixHex(WHITE, PURPLE_LIGHT, talkK);
  const waves: React.ReactNode[] = [];
  for (let k = 0; k < 7; k++) {
    const mf = MOUTH_F0 + k * WAVE_SPAN;
    const age = N - mf;
    if (age >= 0 && age <= 50) {
      const x = MOUTH.cx + WV * age;
      const op = fadeIn(age, 5) * (1 - clamp01((x - 620) / 130)) * mouthGate;
      waves.push(
        <g key={`m${k}`} opacity={op.toFixed(3)} stroke={mColor} fill="none" strokeWidth={3} strokeLinecap="round">
          {arcSeg(x, MOUTH.cy, 34, 1)}
          {arcSeg(x, MOUTH.cy, 46, 1)}
        </g>,
      );
    }
    const ef = EAR_F0 + k * WAVE_SPAN;
    const ageE = N - ef;
    if (ageE >= 0 && ageE <= 50 && ef <= 302) {
      const x = EAR.cx - WV * ageE;
      const op = fadeIn(ageE, 5) * (1 - clamp01((660 - x) / 130)) * earGate;
      waves.push(
        <g key={`e${k}`} opacity={op.toFixed(3)} stroke={GREY_LIGHT} fill="none" strokeWidth={3} strokeLinecap="round">
          {arcSeg(x, EAR.cy, 34, -1)}
          {arcSeg(x, EAR.cy, 46, -1)}
        </g>,
      );
    }
  }

  // ---- 噪声花（303 爆开 10f）+ Cross（304 draw-on 10f）+ 全场暗一拍（303–311）----
  const flowerP = clamp01((N - 303) / 10);
  const flowerOp = fadeIn(N - 303, 4);
  const crossP = clamp01((N - 304) / 10);
  const darkOp = kf(N, [[303, 0], [305, 0.38], [309, 0.38], [312, 0]]);

  // ---- 换向闸（305 draw-on 12f；318 闸刀拨"嘴"5f + 幽灵刀位）----
  const gateP = clamp01((N - 305) / 12);
  const armOff = -CELL_D * kf(N, [[318, 0], [323, 1]]); // 0=中位 → −85=talk 格
  const ghostOp = kf(N, [[322, 0], [326, 0.65]]);
  const talkCellK = kf(N, [[318, 0], [322, 1]]);

  return (
    <CameraRig N={N} keys={[{f: F0, x: 640, y: 360, s: 1}, {f: 282, x: 640, y: 298, s: 1.12}]}>
      <div style={abs(0, 0, 1280, 720)}>
        <div style={{...abs(0, 0, 1280, 720), opacity: exit}}>
          {/* ---- 波列（嘴白→紫 / 耳灰；交点区互相穿行）---- */}
          <Svg bloom={false} style={{filter: `drop-shadow(0 0 4px rgba(255,255,255,${(0.3 * gOff).toFixed(2)}))`}}>{waves}</Svg>

          {/* ---- 嘴（扬声器，发声弧朝外）---- */}
          <div style={{...abs(0, 0, 1280, 720), opacity: fadeIn(N - 258, 6), clipPath: `inset(0 ${(100 - 100 * mP).toFixed(1)}% 0 0)`}}>
            <Svg bloom={false}>
              <g stroke={WHITE} strokeWidth={3} fill="#000" strokeLinejoin="round" strokeLinecap="round">
                <rect x={372} y={272} width={22} height={26} rx={2} />
                <path d="M394,272 L414,259 L414,311 L394,298 Z" />
              </g>
            </Svg>
          </div>
          <SoftIn N={N} f0={260}>
            <CText cx={MOUTH.cx} cy={344} size={24} weight={700} color={mixHex(GREY_LIGHT, PURPLE_LIGHT, talkK)}>talk</CText>
          </SoftIn>

          {/* ---- 耳（接收弧朝内）---- */}
          <div style={{...abs(0, 0, 1280, 720), opacity: fadeIn(N - 261, 6), clipPath: `inset(0 ${(100 - 100 * eP).toFixed(1)}% 0 0)`}}>
            <Svg bloom={false}>
              <g stroke={earStroke} strokeWidth={3} fill="none" strokeLinecap="round">
                <path d="M868,259 C894,257 894,313 868,311" />
                <path d="M872,270 C884,269 884,301 872,300" strokeWidth={2.4} />
                <circle cx={866} cy={297} r={3} fill={earStroke} stroke="none" />
              </g>
            </Svg>
          </div>
          <SoftIn N={N} f0={263}>
            <CText cx={EAR.cx} cy={344} size={24} weight={700} color={mixHex(GREY_LIGHT, GREY, earDimK)}>listen</CText>
          </SoftIn>

          {/* ---- 交点：噪声花（303 爆开）+ 红 Cross ---- */}
          {flowerOp > 0.01 ? (
            <div style={{...abs(0, 0, 1280, 720), opacity: flowerOp * exit}}>
              <GlowFlower cx={MEET.cx} cy={MEET.cy} p={flowerP} k={gOff} />
            </div>
          ) : null}
          <Svg bloom={false}>
            <Cross cx={MEET.cx} cy={MEET.cy} size={68} sw={6} p={crossP} />
          </Svg>

          {/* ---- 全场暗一拍 ---- */}
          {darkOp > 0.005 ? <div style={{...abs(0, 110, 1280, 527), background: '#000', opacity: darkOp.toFixed(3)}} /> : null}

          {/* ---- 换向闸 talk ⇄ listen（305 draw-on）---- */}
          <div style={{...abs(0, 0, 1280, 720), opacity: fadeIn(N - 305, 6), clipPath: `inset(0 ${(100 - 100 * gateP).toFixed(1)}% 0 0)`}}>
            <Svg bloom={false}>
              <rect x={GATE.cx - GATE.w / 2} y={GATE.cy - GATE.h / 2} width={GATE.w} height={GATE.h} rx={14} fill="#000" stroke={WHITE} strokeWidth={3} />
              {talkCellK > 0.01 ? (
                <rect x={GATE.cx - GATE.w / 2 + 6} y={GATE.cy - GATE.h / 2 + 6} width={GATE.w / 2 - 12} height={GATE.h - 12} rx={9} fill={`rgba(102,48,248,${(0.22 * talkCellK).toFixed(3)})`} stroke={PURPLE_LIGHT} strokeWidth={2.4} opacity={talkCellK.toFixed(3)} />
              ) : null}
            </Svg>
            <CText cx={GATE.cx - CELL_D} cy={GATE.cy + 1} size={26} weight={700} color={mixHex(GREY, WHITE, talkCellK)} shadow={`0 0 10px rgba(161,117,241,${(0.5 * talkCellK * gOff).toFixed(2)})`}>talk</CText>
            <CText cx={GATE.cx + CELL_D} cy={GATE.cy + 1} size={26} weight={700} color={GREY}>listen</CText>
            <Svg bloom={false}>
              <LineArrow x0={GATE.cx - 30} y0={GATE.cy - 6} x1={GATE.cx + 30} y1={GATE.cy - 6} p={clamp01((N - 310) / 8)} rodW={2.6} headL={12} headW={11} color={GREY_LIGHT} />
              <LineArrow x0={GATE.cx + 30} y0={GATE.cy + 8} x1={GATE.cx - 30} y1={GATE.cy + 8} p={clamp01((N - 312) / 8)} rodW={2.6} headL={12} headW={11} color={GREY_LIGHT} />
            </Svg>
          </div>
          {/* 闸刀指针（314 中位 SoftIn → 318 拨向 talk；幽灵刀位 + 虚线摆程示交替）*/}
          {N >= 314 ? (
            <Svg bloom={false}>
              <g style={{filter: `drop-shadow(0 0 6px rgba(161,117,241,${(0.8 * gOff).toFixed(2)}))`}}>
                <polygon points={`${GATE.cx + armOff - 10},${GATE.cy - GATE.h / 2 - 13} ${GATE.cx + armOff + 10},${GATE.cy - GATE.h / 2 - 13} ${GATE.cx + armOff},${GATE.cy - GATE.h / 2 - 1}`} fill={PURPLE_LIGHT} />
              </g>
              {ghostOp > 0.01 ? (
                <g opacity={ghostOp.toFixed(3)}>
                  <polygon points={`${GATE.cx + CELL_D - 10},${GATE.cy - GATE.h / 2 - 13} ${GATE.cx + CELL_D + 10},${GATE.cy - GATE.h / 2 - 13} ${GATE.cx + CELL_D},${GATE.cy - GATE.h / 2 - 1}`} fill="none" stroke={GREY} strokeWidth={2} strokeDasharray="4 4" />
                  <path d={`M${GATE.cx - CELL_D},${GATE.cy - GATE.h / 2 - 16} Q${GATE.cx},${GATE.cy - GATE.h / 2 - 52} ${GATE.cx + CELL_D},${GATE.cy - GATE.h / 2 - 16}`} fill="none" stroke={GREY} strokeWidth={2} strokeDasharray="3 7" />
                </g>
              ) : null}
            </Svg>
          ) : null}

          {/* ---- 笔记本（主角底座）---- */}
          <div style={{...abs(0, 0, 1280, 720), opacity: fadeIn(N - 257, 6), transform: `scale(${lapS.toFixed(4)})`, transformOrigin: `${LAPTOP.cx}px ${LAPTOP.cy}px`}}>
            <DeviceGlyph cx={LAPTOP.cx} cy={LAPTOP.cy} kind="laptop" w={LAPTOP.w} label={EXAMPLE.laptop} labelSize={24} />
          </div>
        </div>
      </div>
    </CameraRig>
  );
};

/** 一列波里的一道弧（dir=1 朝东 / −1 朝西；sweep 恒 1=顺时针经过目标方向） */
function arcSeg(cx: number, cy: number, r: number, dir: 1 | -1) {
  const half = (58 * Math.PI) / 180;
  const a1 = (dir === 1 ? 0 : Math.PI) - half;
  const a2 = (dir === 1 ? 0 : Math.PI) + half;
  const x1 = cx + r * Math.cos(a1), y1 = cy + r * Math.sin(a1);
  const x2 = cx + r * Math.cos(a2), y2 = cy + r * Math.sin(a2);
  return <path d={`M${x1.toFixed(1)},${y1.toFixed(1)} A${r},${r} 0 0 1 ${x2.toFixed(1)},${y2.toFixed(1)}`} />;
}

/** 噪声花：毛刺放射团（橙红）+ 软光芯 */
const GlowFlower: React.FC<{cx: number; cy: number; p: number; k: number}> = ({cx, cy, p, k}) => (
  <div style={abs(0, 0, 1280, 720)}>
    <div style={{...abs(cx - 84, cy - 84, 168, 168), borderRadius: '50%', background: `radial-gradient(circle, rgba(240,95,65,${(0.3 * k * p).toFixed(3)}) 0%, rgba(240,95,65,0) 68%)`}} />
    <svg width={168} height={168} viewBox="0 0 168 168" style={{position: 'absolute', left: cx - 84, top: cy - 84, overflow: 'visible'}}>
      <g strokeLinecap="round">
        {Array.from({length: N_BRISTLES}, (_, i) => {
          const a = (i / N_BRISTLES) * Math.PI * 2 + rnd(i, 7) * 0.22;
          const len = (26 + rnd(i, 3) * 44) * p;
          const x1 = 84 + Math.cos(a) * 7, y1 = 84 + Math.sin(a) * 7;
          const x2 = 84 + Math.cos(a) * (7 + len), y2 = 84 + Math.sin(a) * (7 + len);
          return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={i % 2 ? CORAL : ORANGE} strokeWidth={2.6 + rnd(i, 5) * 1.6} opacity={0.95} />;
        })}
        <circle cx={84} cy={84} r={7 + 4 * p} fill={ORANGE} />
      </g>
    </svg>
  </div>
);
