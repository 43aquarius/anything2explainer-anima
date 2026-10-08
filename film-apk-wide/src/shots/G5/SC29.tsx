import React from 'react';
import {useCurrentFrame} from 'remotion';
import {clamp01, easeInOutPow, easeOutCubic, powIn} from '../../common';
import {CText, GREY, exitOp, glowOffK, softOp, firstOp} from '../../ui';
import {GRP, ParcelGlow, GapGlowAt, FileBlockSmall, Receipt, VersionPill} from './g5ui';

/**
 * SC29 v1 收条时代 · N 4032–4263（S29 4040–4261：4040 旧方案 v1 / 4134 Java 世界的 JAR 签名 / 4174 每文件一张签收条）
 * 左上 Pill `v1`（橙 stampIn）+ 标签 `JAR signing`（灰 24）；主区：包裹 openP 0→0.5 展开（14 帧）+ 缝隙紫光呼吸 +
 * 6 个文件块自缝隙错峰飞出到 3×2 网格（2 帧错峰、16 帧）；4174 起六张收条逐张贴上（每张 8 帧 stampIn 落下 + 白闪 +
 * 绿勾 draw-on，12 帧间隔——盖章节奏即持续动作）；右下 `from the Java world`（灰 22）。
 * 末 8 帧归零（SC30 以 0.8× 承接召回）。停留：段内不判（末张收条落定 4242 → 离场 4256，14 帧 + 盖章余韵，见偏离记录）。
 * 主角：包裹+收条组 415px（组包围盒）；光：缝隙紫光 + 收条绿勾。
 */
export const F0 = 4032;
const TO = 4263;
const B_V1 = 4040, B_OPEN = 4134, B_RCPT = 4174;
const RCPT_STEP = 12; // 每张收条间隔

export const SC29: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const op = exitOp(N, TO, 8);
  if (op <= 0) return null;

  const pop = firstOp(N - F0, 6);
  // 包裹展开 openP 0→0.5（14 帧）+ 缝隙光
  const openP = 0.5 * easeInOutPow(2)(clamp01((N - B_OPEN) / 14));
  const gapK = clamp01((N - B_OPEN) / 8) * glowOffK(N, TO, 6, 8);

  // 文件块：自缝隙 (640,455) 飞到网格（16 帧 easeOutCubic，2 帧错峰）
  const blockAnim = (i: number): {x: number; y: number; s: number; op: number} => {
    const n = N - (B_OPEN + 2 + i * 2);
    const b = GRP.blocks[i];
    if (n < 0) return {x: b.cx, y: b.cy, s: 0, op: 0};
    const t = easeOutCubic(clamp01(n / 16));
    return {x: 640 + (b.cx - 640) * t, y: 455 + (b.cy - 455) * t, s: 0.3 + 0.7 * t, op: clamp01(n / 6)};
  };

  // 收条：逐张 stampIn（8 帧落下）+ 白闪 + 绿勾 draw-on
  const rcptAnim = (i: number) => {
    const n = N - (B_RCPT + i * RCPT_STEP);
    if (n < 0) return null;
    const drop = powIn(2.2)(clamp01(n / 8));
    const s = 1.35 - 0.35 * drop;
    const flash = N >= B_RCPT + i * RCPT_STEP + 6 && N < B_RCPT + i * RCPT_STEP + 9 ? 1 - (N - (B_RCPT + i * RCPT_STEP + 6)) * 0.33 : 0;
    const checkP = clamp01((N - (B_RCPT + i * RCPT_STEP + 7)) / 6);
    return {dy: -26 * (1 - drop), s, flash, checkP};
  };

  return (
    <div style={{position: 'absolute', inset: 0, opacity: op}}>
      {/* v1 Pill + 标签 */}
      <VersionPill x={90} y={118} w={104} h={48} text="v1" color="#F05F41" glowColor="rgba(240,95,65,.55)" n={N - B_V1} />
      <CText cx={272} cy={142} size={24} weight={600} color={GREY} opacity={softOp(N - (B_V1 + 4), 8)}>
        JAR signing
      </CText>

      {/* 展开的包裹（openP 0.5 + 缝隙紫光呼吸） */}
      <ParcelGlow cx={GRP.parcel.cx} cy={GRP.parcel.cy} w={GRP.parcel.w} h={GRP.parcel.h} N={N} openP={openP} glowK={0.7 * gapK} opacity={pop} />
      <GapGlowAt cx={GRP.parcel.cx} cy={GRP.parcel.cy} w={GRP.parcel.w} h={GRP.parcel.h} openP={openP} N={N} opacity={pop * gapK} />

      {/* 6 个文件块（自缝隙错峰飞出） */}
      {GRP.blocks.map((b, i) => {
        const a = blockAnim(i);
        if (a.op <= 0) return null;
        return <FileBlockSmall key={i} cx={a.x} cy={a.y} s={a.s} opacity={a.op} />;
      })}

      {/* 六张签收条（逐张盖章：stampIn + 白闪 + 绿勾 draw-on） */}
      {GRP.blocks.map((b, i) => {
        const r = rcptAnim(i);
        if (!r) return null;
        const rn = N - (B_RCPT + i * RCPT_STEP);
        return (
          <div
            key={`r${i}`}
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              width: 1280,
              height: 720,
              transform: `translateY(${r.dy.toFixed(1)}px)`,
              opacity: 0.3 + 0.7 * clamp01(rn / 4),
            }}
          >
            <Receipt cx={b.cx + GRP.receiptOff.dx} cy={b.cy + GRP.receiptOff.dy} s={r.s} flash={r.flash} checkP={r.checkP} />
          </div>
        );
      })}

      {/* 右下小字 */}
      <CText cx={1064} cy={556} size={22} weight={500} color={GREY} opacity={softOp(N - (B_OPEN + 2), 8)}>
        from the Java world
      </CText>
    </div>
  );
};

export default SC29;
