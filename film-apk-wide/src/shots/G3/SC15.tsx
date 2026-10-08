import React from 'react';
import {useCurrentFrame} from 'remotion';
import {clamp01, easeOutCubic, kf, powOutRemain, GlitchIn, emphasisPulse, FONT_ORB} from '../../common';
import {CText, HexDump, LineArrow, WHITE, PURPLE_LIGHT, GREY, abs, exitOp, glowOffK} from '../../ui';
import {LightSweep, GlowBlob, CameraRig, Vignette} from '../../fx';

/**
 * SC15 ★PK 揭示 · N 2171–2325（S15 2179–2288 ¶+gap15：2179「Fifty, 4B.」/ 2217「Every APK on your phone starts with them.」）
 * **章 2 高光·大字型 + 扫光白名单①（全片两处之一）**。承接 HexDump（SC14 同组件同参数原样再现，交界帧像素一致）：
 * 三轮紫光横扫 2175/2193/2211（f0+4/+22/+40，各 16 帧，LightSweep——压缩版编排：高光句 S15 首块只有 38 帧，
 *   扫光与揭示叠跑）→ 2179 `50 4B` 高亮 wipe（highlightP 0→1 / 12 帧，首四字节 50 4B 03 04 依次变紫）→
 * 2182 `PK`（Orbitron 240px 紫+白描边，压在字节行上）GlitchIn rgbSplit 8（本镜唯一 glitch）+ 升起落位 2179+24=2203
 *   → 2203 紫光晕大爆发（GlowBlob 335 + 白闪 3 帧 brightness 1.6→1）后 30 帧收敛呼吸（持续）+ emphasisPulse 1.13；
 * HexDump 其余字节变暗 35%（衬托，2185–2203 渐入；避让首四格高亮）；
 * 2217 右侧箭头 draw-on 14 帧 + `his initials`（灰 26px）打字机（持续动作）；
 * 运镜 2203–2236 推 1→1.18 对准 PK（33 帧；结束 2236 ≤ 离场 2318−30 ✓）。
 * 停留：段末（¶+gap15），`PK` 落位 2203 → 离场 2325−8，hold 115 帧 ✓（分镜表「2290−8」为 S15.to+2 旧口径，
 * 本片镜头区间到 2325——按镜头末 8 帧执行，避免 2291–2325 空场 35 帧，高光满态贯穿段末停顿）。末 8 帧归零（紫晕先灭 6 帧）。
 */
const F0 = 2171, TO = 2325;
const T_HL = 2179; // 50 4B 高亮 wipe 12 帧（S15.c1）
const SWEEPS = [2175, 2193, 2211]; // f0+4 / +22 / +40
const T_PK = 2182; // PK GlitchIn；落位 2179+24 = 2203
const T_LAND = 2203; // 落位：白闪 3 帧 + 紫光晕爆发
const T_PULSE = 2206; // emphasisPulse 1.13
const T_LABEL = 2217; // 箭头 + his initials（S15.c2）
const CAM_KEYS = [
  {f: T_LAND, x: 640, y: 310, s: 1},
  {f: T_LAND + 33, x: 640, y: 310, s: 1.18},
];
const SWEEP_BARS: Array<[number, number, number, number]> = [
  [244, 6, 420, 0],
  [310, 12, 640, 2],
  [376, 6, 420, 4],
];
const HEX = {x: 240, y: 160, w: 800, h: 300, rows: 8};
// 与 SC14 同步推导的 HexDump 内部布局：行 0 文本带 y 198–229；b0 左 = x+76=316，b3 右 = x+226=466。
const ROW0_Y = HEX.y + 38; // 198
const ROW0_B = ROW0_Y + (HEX.h - 52) / HEX.rows; // 229
const CONTENT_BOTTOM = HEX.y + HEX.h - 12; // 448
const B0_X = HEX.x + 76; // 316
const B3_R = HEX.x + 226; // 466
const PK_C = {x: 640, y: 310};

export const SC15: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const exOp = exitOp(N, TO, 8);
  const glowK = glowOffK(N, TO, 6); // 紫晕先灭

  // 高亮 wipe + 变暗衬托
  const hlP = clamp01((N - T_HL) / 12);
  const dimK = clamp01((N - (T_PK + 3)) / 18) * 0.35;

  // PK：升起 + 落定 + 脉冲 + 白闪 + 紫晕爆发→收敛呼吸
  const pkN = N - T_PK;
  const pkY = kf(N, [[T_PK, 332], [T_LAND, 310]], easeOutCubic);
  const pkS = kf(N, [[T_PK, 0.75], [T_LAND, 1]], easeOutCubic);
  const pulse = emphasisPulse(N - T_PULSE, {peak: 1.13});
  const flashK = N >= T_LAND && N < T_LAND + 3 ? 1 - (N - T_LAND) * 0.33 : 0; // 白闪 3 帧（brightness 1.6→1）
  const burstT = N - T_LAND;
  const blobR = kf(N, [[T_LAND, 180], [T_LAND + 9, 335], [T_LAND + 39, 195]], easeOutCubic) + (burstT > 39 ? 12 * Math.sin((2 * Math.PI * N) / 30) : 0);
  const blobA = kf(N, [[T_LAND, 0.16], [T_LAND + 9, 0.5], [T_LAND + 39, 0.3]]) + (burstT > 39 ? 0.05 * Math.sin((2 * Math.PI * N) / 30) : 0);
  const pkBlur = 30 + 46 * powOutRemain(Math.max(0, burstT), 39, 1.6) + 5 * Math.sin((2 * Math.PI * N) / 30) * (burstT > 39 ? 1 : 0.3);

  // 2217：箭头 + his initials 打字机
  const ap = clamp01((N - T_LABEL) / 14);
  const labelText = N < T_LABEL ? '' : 'his initials'.slice(0, Math.floor((N - T_LABEL) / 2));

  return (
    <div style={{position: 'absolute', inset: 0, opacity: exOp}}>
      {/* 三轮紫光横扫（扫光白名单①；屏幕空间，不随运镜） */}
      <LightSweep N={N} rounds={SWEEPS} bars={SWEEP_BARS} />

      <CameraRig N={N} keys={CAM_KEYS}>
        {/* HexDump（SC14 同参数承接；highlightP 12 帧 wipe 首四字节变紫） */}
        <HexDump x={HEX.x} y={HEX.y} w={HEX.w} h={HEX.h} rows={HEX.rows} highlightP={hlP} />

        {/* 其余字节变暗 35%（三块矩形避让首四格高亮：行 0 左侧偏移列 / 行 0 b4–b11 / 行 1–7） */}
        {dimK > 0.005 ? (
          <>
            <div style={{...abs(HEX.x + 15, ROW0_Y, B0_X - (HEX.x + 15) - 0, ROW0_B - ROW0_Y), background: `rgba(0,0,0,${dimK.toFixed(3)})`}} />
            <div style={{...abs(B3_R, ROW0_Y, HEX.x + HEX.w - 15 - B3_R, ROW0_B - ROW0_Y), background: `rgba(0,0,0,${dimK.toFixed(3)})`}} />
            <div style={{...abs(HEX.x + 15, ROW0_B, HEX.w - 30, CONTENT_BOTTOM - ROW0_B), background: `rgba(0,0,0,${dimK.toFixed(3)})`}} />
          </>
        ) : null}

        {/* 紫光晕（PK 脚下/身后；爆发 → 30 帧收敛 → 呼吸） */}
        <GlowBlob cx={PK_C.x} cy={PK_C.y} r={Math.max(10, blobR)} alpha={Math.max(0, blobA * glowK)} />

        {/* PK 大字：GlitchIn（rgbSplit 8，本镜唯一 glitch）+ 升起 + 白闪落定 + 脉冲 */}
        {pkN >= 0 ? (
          <div style={{position: 'absolute', inset: 0, transformOrigin: '640px 310px', transform: `scale(${(pkS * pulse).toFixed(4)})`}}>
            <GlitchIn N={N} f0={T_PK} rgbSplit={8} seed={15}>
              <CText
                cx={PK_C.x}
                cy={pkY}
                size={240}
                weight={700}
                family={FONT_ORB}
                letterSpacing={8}
                color={PURPLE_LIGHT}
                shadow={`0 0 ${pkBlur.toFixed(1)}px 10px rgba(102,45,248,${(0.45 * glowK).toFixed(3)})`}
                style={{WebkitTextStroke: `4px ${WHITE}`, paintOrder: 'stroke fill', filter: flashK > 0 ? `brightness(${(1 + 0.6 * flashK).toFixed(2)})` : undefined}}
              >
                PK
              </CText>
            </GlitchIn>
          </div>
        ) : null}

        {/* 右侧箭头 + his initials */}
        {ap > 0 ? (
          <>
            <LineArrow x0={866} y0={310} x1={948} y1={310} p={ap} rodW={3} headL={18} headW={20} opacity={0.85} />
            {labelText ? <CText cx={1022} cy={310} size={26} weight={600} color={GREY}>{labelText}</CText> : null}
          </>
        ) : null}
      </CameraRig>

      {/* 屏幕空间暗角（推近同步淡入 18 帧） */}
      <Vignette k={0.25 * clamp01((N - T_LAND) / 18)} alpha={0.32} />
    </div>
  );
};
