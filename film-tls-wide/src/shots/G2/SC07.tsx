import React from 'react';
import {useCurrentFrame} from 'remotion';
import {clamp01, easeInOutPow, kf, powOutRemain, GlitchIn, FONT_ORB, FONT_MONO} from '../../common';
import {CText, Pill, Svg, GREY, GREY_LIGHT, WHITE, PURPLE_LIGHT, SoftIn, exitOp, glowOffK, softOp, mixHex} from '../../ui';
import {CameraRig, GlowBlob, countTo} from '../../fx';
import {LockEnvelope} from './parts';

/**
 * SC07 TLS 1.3 · N 1341–1492（S10：1349「Today's version, TLS 1.3」/ 1431「was published in 2018」；章末 ¶+gap15）
 * 版式：水平版本时间轴（y 380，x 180–1130）：5 节点 SSL 2.0·1995 / SSL 3.0·1996 / TLS 1.0·1999 / TLS 1.2·2008（灰）+
 *       末节点 `TLS 1.3` 大 Pill（放大 1.4× + 紫光 + `RFC 8446` 等宽 22px）。
 * 承接 SC06：锁+信封组（同一 LockEnvelope、同参数）16 帧缩移左下角不清场 → 时间轴自左 draw-on（24 帧，线过节点即亮）；
 * 1349 末节点 GlitchIn（rgbSplit 6，本镜唯一 glitch）+ 放大弹出（scale 0.6→1.4，14 帧）+ 紫光晕爆发 + RFC 8446 SoftIn；
 * 1431 `2018` 14 帧计数落定（1990→2018）+ 时间轴末端高亮 bracket 标注 `today`；节点错峰微呼吸 ±3%（40 帧周期）。
 * 运镜：章末拉远 37 帧 1.12→1.0（1365–1402，1431 前结束；开头 1.15→1.12 为承接跟拍）。
 * 停留：段末（章末）——`2018` 落位 1431+14=1445 → 离场 1482（末 10 帧），稳定 37 帧 ✓。
 * 主角：时间轴 + TLS 1.3 大节点（紫光晕，本镜唯一大面积紫）。
 */
const F0 = 1341;
const TO = 1492;
const B1 = 1349, B2 = 1431; // 字幕块起始

const CAM_KEYS = [
  {f: F0, x: 640, y: 354, s: 1.15}, // 与 SC06 末帧一致（无缝交接）
  {f: 1357, x: 640, y: 354, s: 1.12}, // 承接跟拍（16 帧缩移期）
  {f: 1365, x: 640, y: 354, s: 1.12},
  {f: 1402, x: 640, y: 352, s: 1.0}, // 章末拉远 37 帧 1.12→1.0（1431 前结束）
];

// 时间轴几何：线 x 180–1130（y 380），4 灰节点 + 末大节点；节点亮起 = 线尖经过时
const LINE_X0 = 180, LINE_X1 = 1130, LINE_Y = 380;
const DRAW_LEN = 24;
const NODES: Array<{name: string; year: string; x: number}> = [
  {name: 'SSL 2.0', year: '1995', x: 250},
  {name: 'SSL 3.0', year: '1996', x: 425},
  {name: 'TLS 1.0', year: '1999', x: 600},
  {name: 'TLS 1.2', year: '2008', x: 765},
];
const BIG = {x: 975, y: 420}; // 末节点中心（Pill 260×72 ≈ 常规 1.4×）

const tipX = (N: number) => LINE_X0 + (LINE_X1 - LINE_X0) * clamp01((N - F0) / DRAW_LEN);
const passT = (x: number) => F0 + DRAW_LEN * ((x - LINE_X0) / (LINE_X1 - LINE_X0));

export const SC07: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const exOp = exitOp(N, TO, 10);
  const lineP = clamp01((N - F0) / DRAW_LEN);

  // ---- 承接：锁+信封 16 帧缩移左下角（0.30×，不清场） ----
  const tMove = easeInOutPow(2.5)(clamp01((N - F0) / 16));
  const hfGlow = kf(N, [[F0, 0.715], [1357, 0.5]]) * glowOffK(N, TO, 6, 10);
  const hfLockGlow = kf(N, [[F0, 0.55], [1357, 0.38]]) * glowOffK(N, TO, 6, 10);

  // ---- 末节点 TLS 1.3 ----
  const popN = N - B1;
  const pop = 0.43 + 0.57 * (1 - powOutRemain(popN, 14, 2.5)); // 放大弹出 0.6→1.4（等效 0.43→1.0）
  const bigGlow = kf(N, [[B1, 0], [B1 + 4, 0.8], [B1 + 20, 0.5]]) * glowOffK(N, TO, 6, 10);

  // ---- `2018` 计数落定 ----
  const yearN = N - B2;

  // ---- today bracket ----
  const brLen = 2 * 12 + 223; // 左短臂+横杆+右短臂近似总长
  const brP = clamp01((N - 1433) / 10);

  return (
    <CameraRig N={N} keys={CAM_KEYS}>
      {/* ===== 时间轴层（先画，被缩移中的锁+信封短暂遮挡属设计："时间轴在锁退场时浮现"） ===== */}
      <div style={{position: 'absolute', inset: 0, opacity: exOp}}>
        {/* 主线自左 draw-on */}
        <Svg opacity={softOp(N - F0, 6)}>
          <line x1={LINE_X0} y1={LINE_Y} x2={LINE_X1} y2={LINE_Y} stroke={WHITE} strokeWidth={3}
            strokeDasharray={LINE_X1 - LINE_X0} strokeDashoffset={(LINE_X1 - LINE_X0) * (1 - lineP)} strokeLinecap="butt" />
        </Svg>

        {/* 前 4 节点：线尖经过即亮（Pill + 上方小圆点 + 年份），微呼吸 ±3% 错峰 */}
        {NODES.map((nd, i) => {
          const pt = passT(nd.x);
          const breathe = 1 + 0.03 * Math.sin((2 * Math.PI * (N - 14)) / 40 + i * 2.1);
          return (
            <React.Fragment key={nd.name}>
              <Svg>
                <circle cx={nd.x} cy={LINE_Y} r={5} fill={WHITE} opacity={softOp(N - pt, 4)} />
              </Svg>
              <SoftIn N={N} f0={Math.round(pt)} len={6}>
                <div style={{position: 'absolute', inset: 0, transformOrigin: `${nd.x}px 420px`, transform: `scale(${breathe.toFixed(4)})`}}>
                  <Pill x={nd.x - 72} y={398} w={145} h={44} r={22} sw={2} stroke={GREY} fontSize={23} weight={700} color={GREY_LIGHT} letterSpacing={1} text={nd.name} />
                </div>
              </SoftIn>
              <SoftIn N={N} f0={Math.round(pt) + 2} len={6}>
                <CText cx={nd.x} cy={472} size={22} weight={700} family={FONT_ORB} color={GREY}>{nd.year}</CText>
              </SoftIn>
            </React.Fragment>
          );
        })}

        {/* 末节点大圆点（线到达时） */}
        <Svg>
          <circle cx={BIG.x} cy={LINE_Y} r={5.5} fill={WHITE} opacity={softOp(N - Math.round(passT(BIG.x)), 4)} />
        </Svg>

        {/* 末节点 `TLS 1.3`：GlitchIn + 放大弹出 + 紫光晕爆发 */}
        <GlowBlob cx={BIG.x} cy={BIG.y} r={150} N={N} k={bigGlow} />
        <GlitchIn N={N} f0={B1} rgbSplit={6} seed={5}>
          <div style={{position: 'absolute', inset: 0, transformOrigin: `${BIG.x}px ${BIG.y}px`, transform: `scale(${pop.toFixed(4)})`}}>
            <Pill x={BIG.x - 130} y={384} w={260} h={72} r={36} sw={3} stroke={PURPLE_LIGHT} fontSize={40} weight={700} color={WHITE} letterSpacing={2}
              text="TLS 1.3" glow={bigGlow > 0 ? `0 0 24px 8px rgba(102,45,248,${(0.6 * clamp01(bigGlow * 1.6)).toFixed(3)})` : undefined} />
          </div>
        </GlitchIn>

        {/* RFC 8446（等宽 22 灰） */}
        <SoftIn N={N} f0={1355} len={8}>
          <CText cx={BIG.x} cy={540} size={22} weight={600} family={FONT_MONO} color={GREY} letterSpacing={2}>RFC 8446</CText>
        </SoftIn>

        {/* `2018`：B2 起 14 帧计数落定（1990→2018）+ 提亮 */}
        {yearN >= 0 ? (
          <CText cx={BIG.x} cy={496} size={30} weight={700} family={FONT_ORB} letterSpacing={2}
            color={mixHex(GREY, WHITE, clamp01(yearN / 8))} style={{fontVariantNumeric: 'tabular-nums'}}>
            {countTo(yearN, 1990, 2018, 14)}
          </CText>
        ) : null}

        {/* 时间轴末端高亮 bracket + `today` */}
        <Svg>
          <path d={`M 905 362 L 905 350 L 1128 350 L 1128 362`} fill="none" stroke={PURPLE_LIGHT} strokeWidth={2.5} strokeLinecap="round"
            strokeDasharray={brLen} strokeDashoffset={brLen * (1 - brP)} />
        </Svg>
        <SoftIn N={N} f0={1436} len={8}>
          <CText cx={1016} cy={332} size={22} weight={600} color={GREY} letterSpacing={2}>today</CText>
        </SoftIn>
      </div>

      {/* ===== 承接层：锁+信封缩移左下角（压在时间轴之上；SC08 由 G3 接手） ===== */}
      <div style={{position: 'absolute', inset: 0, opacity: exOp, transformOrigin: '640px 385px',
        transform: `translate(${(-410 * tMove).toFixed(2)}px, ${(170 * tMove).toFixed(2)}px) scale(${(1 - 0.7 * tMove).toFixed(4)})`}}>
        <LockEnvelope N={N} glowK={hfGlow} lockGlowK={hfLockGlow} />
      </div>
    </CameraRig>
  );
};
