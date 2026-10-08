import React from 'react';
import {useCurrentFrame} from 'remotion';
import {clamp01, easeInOutPow, easeOutCubic, GlitchIn, kf, powIn, FONT_MONO, FONT_ORB} from '../../common';
import {CText, GREY, ORANGE, LineArrow, exitOp, glowOffK, softOp, scaleIn} from '../../ui';
import {CameraRig} from '../../fx';
import {DGM} from './g5ui';
import {ZipDiagram} from './g5bui';

/**
 * SC32 ★签名块解剖（章 3 高光·落章型） · N 4618–4819（S32 4626–4817：4626 签名块位置 / 4691 文件们与中央目录之间 / 4736 覆盖整个 APK）
 * 全幅 ZIP 结构图（放大版 SC17 风格 = DGM）：文件块群 | 中央目录卡 | EOCD + 索引引线；4626 新的发光 `SIGNING BLOCK`
 * （紫边金字 200×140）自下 16 帧滑入目录卡左侧，插入瞬间各块微让位（files −5 / card +7 / eocd +9，12 帧）；
 * 4691 位置注解箭头 draw-on + `immediately before the central directory`（灰 22px 两行）+ 4693 `SIGNING BLOCK` 标签
 * GlitchIn（rgbSplit 5，本镜唯一 glitch）；4736 覆盖弧 24 帧自签名块顺时针兜一圈（文件块被扫过时依次紫闪）+
 * `the entire APK` 落位 + 签名块光晕爆发后 30 帧呼吸（持续）+ 弧线虚线慢速巡行（持续）。
 * 运镜：33 帧 1→1.12 推向签名块（键位保守取 (650,340)，弧线右缘 1215 不出画布）。段内不判。末 8 帧归零。
 * 主角：结构图+签名块 ~280px；光：签名块紫光（章 3 最高光）。
 */
export const F0 = 4618;
const TO = 4819;
const B_BASE = 4619, B_SIGN = 4626, B_NUDGE = 4634, B_CURVE = 4648, B_LBL = 4652, B_NOTE = 4691, B_TITLE = 4693, B_ARC = 4736;
const ARC_DONE = B_ARC + 24; // 4760

export const SC32: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const op = exitOp(N, TO, 8);
  if (op <= 0) return null;
  const gk = glowOffK(N, TO, 6, 8);

  // 让位（12 帧缓入缓出）
  const nk = easeInOutPow(2.5)(clamp01((N - B_NUDGE) / 12));
  const dxFiles = -5 * nk, dxCard = 7 * nk, dxEocd = 9 * nk;

  // 基础结构入场（文件块 2 帧错峰缩放；目录卡自右滑入；EOCD SoftIn；点线 8 帧）
  // 文件块被弧线扫过：依次紫闪（底→顶，弧扫左肢时刻附近拉开 3 帧节奏）
  const flashAt = [4762, 4759, 4756, 4753];
  const files = DGM.files.map((_, i) => {
    const n = N - (B_BASE + i * 2);
    const t = N - flashAt[i];
    const flash = t < 0 ? 0 : t < 2 ? t / 2 : Math.max(0, 1 - (t - 2) / 10);
    return {op: n < 0 ? 0 : softOp(n, 6), s: n < 0 ? 0 : 0.55 + 0.45 * scaleIn(n, 12), flash};
  });
  const cardN = N - B_BASE;
  const cardOp = cardN < 0 ? 0 : softOp(cardN, 6);
  const cardDx = 44 * (1 - easeOutCubic(clamp01(cardN / 16)));
  const eocdOp = softOp(N - (B_BASE + 2), 8);
  const connP = clamp01((N - (B_BASE + 4)) / 8);
  const curveP = DGM.files.map((_, i) => clamp01((N - (B_CURVE + i * 3)) / 10));

  // 签名块：自下 16 帧滑入 + 光晕（爆发→30 帧呼吸）
  const sn = N - B_SIGN;
  const signDy = sn < 0 ? 200 : 200 * (1 - easeOutCubic(clamp01(sn / 16)));
  const signOp = sn < 0 ? 0 : softOp(sn, 6);
  const breathe = 0.9 + 0.25 * Math.sin((2 * Math.PI * (N - 4758)) / 30);
  const signGlow = N >= ARC_DONE + 13 ? breathe : kf(N, [[B_SIGN, 0], [B_SIGN + 10, 0.55], [B_ARC, 0.55], [B_ARC + 7, 1.45], [ARC_DONE + 13, 0.9]]);
  const signGlowK = clamp01(signGlow) * gk;

  // 覆盖弧：24 帧 draw-on → 虚线巡行；标签计数式落位
  const arcP = clamp01((N - B_ARC) / 24);
  const march = Math.max(0, N - ARC_DONE);
  const arcLabelOp = softOp(N - ARC_DONE, 6);
  const arcLabelScale = kf(N, [[ARC_DONE, 1.45], [ARC_DONE + 8, 1]], powIn(2.2));

  // 位置注解（4691）：箭头 draw-on + 两行灰字
  const noteP = clamp01((N - B_NOTE) / 12);
  const l1Op = softOp(N - (B_NOTE + 2), 8);
  const l2Op = softOp(N - (B_NOTE + 4), 8);

  return (
    <CameraRig N={N} keys={[{f: F0, x: 640, y: 360, s: 1}, {f: F0 + 33, x: 650, y: 340, s: 1.12}]}>
      <div style={{position: 'absolute', inset: 0, opacity: op}}>
        <ZipDiagram
          dxFiles={dxFiles}
          dxCard={dxCard + cardDx}
          dxEocd={dxEocd}
          files={files}
          cardOp={cardOp}
          eocdOp={eocdOp}
          connP={connP}
          curveP={curveP}
          labels={true}
          fileLabelOp={softOp(N - B_LBL, 8)}
          arcLabelOp={arcLabelOp}
          arcLabelScale={arcLabelScale}
          signDy={signDy}
          signOp={signOp}
          signGlow={signGlowK}
          dim={0}
          arcP={arcP}
          arcMarch={march}
          arcOp={1}
          arcGlow={gk}
        />

        {/* SIGNING / BLOCK 标题（GlitchIn rgbSplit 5 = 本镜唯一 glitch；金字 → ORANGE 为调色板内最近金色） */}
        <GlitchIn N={N} f0={B_TITLE} rgbSplit={5} seed={32}>
          <CText cx={DGM.signTitle.l1} cy={DGM.signTitle.y1} size={26} weight={700} family={FONT_ORB} color={ORANGE} letterSpacing={2} dy={0}>
            SIGNING
          </CText>
          <CText cx={DGM.signTitle.l2} cy={DGM.signTitle.y2} size={26} weight={700} family={FONT_ORB} color={ORANGE} letterSpacing={4} dy={0}>
            BLOCK
          </CText>
        </GlitchIn>

        {/* 位置注解：箭头指向签名块 + 两行灰字 */}
        {noteP > 0 ? (
          <LineArrow x0={612} y0={446} x1={545} y1={394} p={noteP} rodW={2.4} headL={16} headW={14} color={GREY} opacity={0.9} />
        ) : null}
        {l1Op > 0 ? (
          <CText cx={615} cy={460} size={22} weight={600} family={FONT_MONO} color={GREY} opacity={l1Op}>
            immediately before
          </CText>
        ) : null}
        {l2Op > 0 ? (
          <CText cx={615} cy={492} size={22} weight={600} family={FONT_MONO} color={GREY} opacity={l2Op}>
            the central directory
          </CText>
        ) : null}
      </div>
    </CameraRig>
  );
};

export default SC32;
