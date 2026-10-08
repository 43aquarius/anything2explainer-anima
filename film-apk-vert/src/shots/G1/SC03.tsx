import React from 'react';
import {useCurrentFrame} from 'remotion';
import {GlitchIn, emphasisPulse, clamp01, FONT_WIDE, rnd} from '../../common';
import {CText, ParcelIcon, PURPLE, WHITE, SoftIn, exitOp, glowOffK, scaleIn, softOp} from '../../ui';
import {CameraRig} from '../../fx';
import type {CamKey} from '../../fx';

/**
 * SC03 全是 zip · N 310–424（S03 318–390，¶+gap12：Every Android app ships as a ZIP archive.）
 * 清场 → 中央大字两行：`every Android app`（Noto 900 46px 白，cy 540）/ `is a ZIP` + `archive`
 * （Audiowide 88px 白+3px 紫描边，cy 633/727——分镜表 92px 在竖版中轴安全宽（520×1.15 预缩放+glitch 错位）
 * 放不下 "is a ZIP"（844px），按 fitSize 口径收到 88px，见 BUILD_NOTES 偏离 1）。
 * 周围 8 枚小包裹（60px）绕大字环形排布（宽八角环，侧位受竖版安全区限制只取上下弧，见偏离 2）。
 * 时序：312 第一行 SoftIn（节拍 −6）→ 318 第二行块 GlitchIn（rgbSplit 6，本镜唯一 glitch，正对节拍）
 *   → 332 emphasisPulse 1.11 → 320–348 八包裹 2 帧错峰缩放入（14 帧）→ 每 36 帧随机一枚 wink（346/382，持续）
 *   → 353–386 运镜 33 帧 1.15→1.0 拉远（世界感；入场全部落定后才开始，结束 = 离场起点 −30 ✓）。
 * 停留：段末（¶+gap12）——末拍落位 348 → 离场 416，hold ≥30 ✓（运镜结束 386 ≤ 416−30 ✓）。
 * 末 8 帧归零（紫晕先灭 6 帧）。主角 = 大字块 254px 高，光 = 大字紫描边光晕。
 */
const F0 = 310;
const TO = 424;
const T_L1 = 312;
const T_L2 = 318;
const T_PULSE = 332;
const T_PARCELS = 320;
const CAM: CamKey[] = [
  {f: 310, x: 360, y: 655, s: 1.15},
  {f: 353, x: 360, y: 655, s: 1.15},
  {f: 386, x: 360, y: 655, s: 1.0},
];
/** 8 枚小包裹环形排布（宽八角：上弧 4 + 下弧 4；侧向受安全区 x40–620 与 1.15 预缩放限制） */
const RING: Array<[number, number]> = [
  [165, 470], [295, 442], [425, 442], [555, 470],
  [555, 815], [425, 843], [295, 843], [165, 815],
];
const WINK_AT = [346]; // 落定后每 36 帧；382 的 wink 取消——段末 ≥30f 稳定期（BUILD_RULES §4：动词动作到段落边界为止）

export const SC03: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const exOp = exitOp(N, TO, 8);
  const gk = glowOffK(N, TO, 6, 8);
  const pulse = emphasisPulse(N - T_PULSE, {peak: 1.11, up: 8, hold: 2, down: 9});
  const bconv = 1 - clamp01((N - 372) / 7); // 372 后 7 帧呼吸幅度归零：段末 372→416 稳定期 ≥30f
  const breathe = 0.7 + 0.3 * bconv * Math.sin((2 * Math.PI * (N - T_L2)) / 30);
  const txtShadow = `0 0 ${Math.round(14 + 10 * breathe)}px rgba(161,117,241,${((0.55 + 0.35 * breathe) * gk).toFixed(3)}), 0 0 4px rgba(161,117,241,${(0.5 * gk).toFixed(3)})`;
  const txtStyle: React.CSSProperties = {WebkitTextStroke: `3px ${PURPLE}`, paintOrder: 'stroke fill'};

  // wink（每次随机一枚，rnd 确定性；8 帧亮度+缩放脉冲）
  let wIdx = -1;
  let wk = 0;
  WINK_AT.forEach((t0, k) => {
    const wn = N - t0;
    if (wn >= 0 && wn < 8 && wIdx < 0) {
      wIdx = Math.floor(rnd(k, 7) * 8);
      wk = 1 - Math.abs(wn / 7 - 1);
    }
  });

  return (
    <CameraRig N={N} keys={CAM}>
      {/* 第一行：every Android app */}
      <SoftIn N={N} f0={T_L1} style={{opacity: exOp}}>
        <CText cx={360} cy={540} size={46} weight={900} color={WHITE} letterSpacing={1}>
          every Android app
        </CText>
      </SoftIn>

      {/* 第二行块：is a ZIP / archive（本镜唯一 glitch：rgbSplit 6）+ emphasisPulse + 紫晕呼吸 */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          opacity: exOp,
          transformOrigin: '360px 680px',
          transform: pulse === 1 ? undefined : `scale(${pulse.toFixed(4)})`,
        }}
      >
        <GlitchIn N={N} f0={T_L2} rgbSplit={6} seed={7}>
          <CText cx={360} cy={633} size={88} weight={400} family={FONT_WIDE} color={WHITE} letterSpacing={2} shadow={txtShadow} style={txtStyle}>
            is a ZIP
          </CText>
          <CText cx={360} cy={727} size={88} weight={400} family={FONT_WIDE} color={WHITE} letterSpacing={2} shadow={txtShadow} style={txtStyle}>
            archive
          </CText>
        </GlitchIn>
      </div>

      {/* 8 枚小包裹（2 帧错峰缩放入 + 周期 wink，持续动作） */}
      {RING.map(([px, py], i) => {
        const n = N - (T_PARCELS + 2 * i);
        if (n < 0) return null;
        const s = 0.5 + 0.5 * scaleIn(n, 14);
        const op = softOp(n, 8) * exOp;
        if (op <= 0) return null;
        const isWink = wIdx === i;
        return (
          <div key={i} style={{position: 'absolute', inset: 0, opacity: op}}>
            <div
              style={{
                position: 'absolute',
                inset: 0,
                transformOrigin: `${px}px ${py}px`,
                transform: `scale(${(s * (isWink ? 1 + 0.07 * wk : 1)).toFixed(4)})`,
                filter: isWink && wk > 0 ? `brightness(${(1 + 0.7 * wk).toFixed(2)})` : undefined,
              }}
            >
              <ParcelIcon cx={px} cy={py} w={60} h={44} label={''} />
            </div>
          </div>
        );
      })}
    </CameraRig>
  );
};
