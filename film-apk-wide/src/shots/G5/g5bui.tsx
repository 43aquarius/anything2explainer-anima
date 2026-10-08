import React from 'react';
import {clamp01, FONT_MONO} from '../../common';
import {CText, GREY} from '../../ui';
import {
  GRP, ParcelGlow, GapGlowAt, FileBlockSmall, Receipt,
  DGM, dgmCurves, CovArc, FileBlk, DirCard, EocdTag, SignBlkBody,
} from './g5ui';

/**
 * G5b 组内共用图元（SC30–SC34）。全部纯函数（动画量由调用方按 N 算好传入）；随机只用 rnd。
 * - V1Group —— SC29 末态「v1 收条包裹组」的 1:1 复刻（同一 GRP 坐标 + ParcelGlow/GapGlowAt/FileBlockSmall/Receipt
 *   同参数），保证 4263|4264 组界像素一致；lit/flash 驱动 SC30 的「逐条验过」白闪。
 * - ZipDiagram —— SC32/SC33 共用的「ZIP 结构图 + 签名块 + 覆盖弧」（SC32 全幅态；SC33 以 0.5× 承接缩到左侧），
 *   两组共用同一组件同参数 → 4819|4820 组界一致。标题（SIGNING/BLOCK）与位置注解由各镜头自行渲染
 *   （SC32 用 GlitchIn，SC33 用普通淡出；注解仅 SC32 常驻）。
 */

// ---------- SC30：SC29 末态收条包裹组（1:1 复刻，供 0.8× 承接） ----------
export const V1Group: React.FC<{
  N: number; // GapGlow 30 帧呼吸用
  lit: number[]; // 各收条 0–1（白→橙边）
  flash: number[]; // 各收条白闪 0–1
  text: boolean; // 收条 sha1 小字（0.8× 缩微态省略）
  gapK: number; // 缝隙紫光强度
  glowK: number; // 包裹 HeroGlow 强度
  opacity?: number;
}> = ({N, lit, flash, text, gapK, glowK, opacity = 1}) => {
  if (opacity <= 0) return null;
  return (
    <div style={{position: 'absolute', inset: 0, opacity}}>
      <ParcelGlow cx={GRP.parcel.cx} cy={GRP.parcel.cy} w={GRP.parcel.w} h={GRP.parcel.h} N={N} openP={0.5} glowK={glowK} />
      <GapGlowAt cx={GRP.parcel.cx} cy={GRP.parcel.cy} w={GRP.parcel.w} h={GRP.parcel.h} openP={0.5} N={N} opacity={gapK} />
      {GRP.blocks.map((b, i) => (
        <FileBlockSmall key={i} cx={b.cx} cy={b.cy} s={1} opacity={1} />
      ))}
      {GRP.blocks.map((b, i) => (
        <Receipt
          key={`r${i}`}
          cx={b.cx + GRP.receiptOff.dx}
          cy={b.cy + GRP.receiptOff.dy}
          s={1}
          lit={lit[i]}
          flash={flash[i]}
          checkP={1}
          text={text}
        />
      ))}
    </div>
  );
};

// ---------- SC32 / SC33：ZIP 结构图 + 签名块 + 覆盖弧（共用，保证组界一致） ----------
export type DiaFile = {op: number; s: number; flash: number};

export const ZipDiagram: React.FC<{
  /** 签名块插入后的让位位移（SC32 末态 = SC33 全程：files −5 / card +7 / eocd +9） */
  dxFiles: number;
  dxCard: number;
  dxEocd: number;
  files: DiaFile[];
  cardOp: number;
  eocdOp: number;
  connP: number; // 目录—EOCD 点线 draw-on 0–1
  curveP: number[]; // 各索引引线 draw-on 0–1（−1/0 = 未开始）
  labels: boolean; // 卡内小字（缩微态 false）
  fileLabelOp: number; // `local file headers` 透明度
  arcLabelOp: number; // `the entire APK` 透明度
  arcLabelScale: number; // `the entire APK` 落位缩放
  signDy: number; // 签名块自下滑入位移（0 = 落位）
  signOp: number;
  signGlow: number;
  dim: number; // 全图变暗 0–1（SC33 被拒后）
  arcP: number; // 覆盖弧 draw-on 0–1
  arcMarch: number; // 完成后虚线行进帧数
  arcOp: number;
  arcGlow: number;
}> = ({
  dxFiles, dxCard, dxEocd, files, cardOp, eocdOp, connP, curveP, labels,
  fileLabelOp, arcLabelOp, arcLabelScale, signDy, signOp, signGlow, dim, arcP, arcMarch, arcOp, arcGlow,
}) => {
  const curves = dgmCurves(dxCard, dxFiles);
  const connX0 = DGM.conn.x0 + dxCard;
  const connX1 = DGM.conn.x1 + dxEocd;
  return (
    <div style={{position: 'absolute', inset: 0}}>
      {/* 索引引线（目录卡 → 各文件块，绕签名块下方；clipPath 自目录侧向左 wipe） */}
      <svg width={1280} height={720} viewBox="0 0 1280 720" style={{position: 'absolute', left: 0, top: 0, overflow: 'visible', opacity: 1 - dim * 0.6}}>
        <defs>
          {curves.map((_, i) => (
            <clipPath key={i} id={`g5b-cv${i}`}>
              <rect x={DGM.card.x + dxCard - 500 * curveP[i]} y={200} width={500} height={330} />
            </clipPath>
          ))}
        </defs>
        {curves.map((d, i) =>
          curveP[i] > 0 ? (
            <path key={i} d={d} fill="none" stroke="#A0A0A1" strokeWidth={1.6} opacity={0.55} clipPath={`url(#g5b-cv${i})`} />
          ) : null,
        )}
      </svg>

      {/* 文件块群（让位 dx；弧线扫过时紫闪） */}
      {DGM.files.map((f, i) => (
        <FileBlk key={i} x={f.x + dxFiles} y={f.y} s={files[i].s} opacity={files[i].op} flash={files[i].flash} dim={dim} />
      ))}
      {fileLabelOp > 0 ? (
        <CText cx={DGM.fileLabel.cx + dxFiles} cy={DGM.fileLabel.cy} size={22} weight={600} family={FONT_MONO} color={GREY} opacity={fileLabelOp}>
          local file headers
        </CText>
      ) : null}

      {/* 中央目录卡 + EOCD + 点线 */}
      <DirCard x={DGM.card.x + dxCard} y={DGM.card.y} opacity={cardOp} dim={dim} labels={labels} />
      <EocdTag x={DGM.eocd.x + dxEocd} y={DGM.eocd.y} opacity={eocdOp} dim={dim} labels={labels} />
      {connP > 0 ? (
        <svg width={1280} height={720} viewBox="0 0 1280 720" style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
          <defs>
            <clipPath id="g5b-conn">
              <rect x={connX0 - 2} y={DGM.conn.y - 8} width={(connX1 - connX0 + 4) * clamp01(connP)} height={16} />
            </clipPath>
          </defs>
          <line x1={connX0} y1={DGM.conn.y} x2={connX1} y2={DGM.conn.y} stroke="#A0A0A1" strokeWidth={2} strokeDasharray="5 6" opacity={0.7 - dim * 0.4} clipPath="url(#g5b-conn)" />
        </svg>
      ) : null}

      {/* 覆盖弧（自签名块顶顺时针兜一圈 + 完成后虚线慢速巡行） */}
      <CovArc p={arcP} march={arcMarch} opacity={arcOp} glowK={arcGlow} />
      {arcLabelOp > 0 ? (
        <div style={{position: 'absolute', inset: 0, transform: `scale(${arcLabelScale.toFixed(4)})`, transformOrigin: '650px 148px', opacity: arcLabelOp}}>
          <CText cx={DGM.arcLabel.cx} cy={DGM.arcLabel.cy} size={22} weight={700} family={FONT_MONO} color={'#FFFFFF'}>
            the entire APK
          </CText>
        </div>
      ) : null}

      {/* 签名块（紫边 + 迷你火漆；标题由镜头渲染在 DGM.signTitle） */}
      <SignBlkBody x={DGM.sign.x} y={DGM.sign.y + signDy} opacity={signOp} glowK={signGlow} dim={dim} />
    </div>
  );
};
