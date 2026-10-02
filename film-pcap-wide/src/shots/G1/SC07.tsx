import React from 'react';
import {useCurrentFrame} from 'remotion';
import {clamp01, easeInOutPow, easeOutCubic, emphasisPulse, textW, EM_ORB} from '../../common';
import {CText, GREY, GREY_LIGHT, WHITE, abs, fadeIn, slideUp, exitOp, scaleIn, softOp} from '../../ui';
import {BigNumber, countTo} from '../../fx';

/**
 * SC07 一包一段落 · N 1036–1227（S08 1044–1205 ¶ 段末：1044「One packet carries about 1,500 bytes —」/ 1145「roughly one paragraph of text」）
 * 版式：左 段落卡 (185,258,300,204)（DocIcon 风：黑底白边 + 折角 + 5 条文本线，首行缩进）；中 `≈` 白 46px (540,356)；
 *       右 `1,500` BigNumber Orbitron 110 (800,360) + 右下灰小字 `bytes`（26px，基线对齐数字右缘）。
 * 节拍：1044 数字 20 帧计数 0→1,500（countTo）+ 段落卡 slideUp Δ100/22 + 8 帧淡入（卡底峰值 y562，不进字幕带）；
 *       1064 数字落定 emphasisPulse 1.09（紫硬投影是主角光）；
 *       1145 `≈` 缩放入场（21 帧）+ 段落卡高亮条连续滑移（1150 起：紫色半透明高亮条以每帧连续下移的方式扫过 5 行文本线，持续动作——修复 v1 步进式高亮导致的 4.4s 静止）；
 *       1219–1227 整组归零淡出（exitOp）。
 * 停留：末拍 `≈` 落位 1166 → 离场 1219，53 帧 ✓（段末 ¶）；高亮循环为持续动作，稳定期继续跑。
 * 主角：`1,500` 110px（BigNumber 紫硬投影 + 紫柔光）；本镜零 glitch（白名单 SC07 无）。
 */
const F0 = 1036;
const T_IN = 1044; // 数字 + 段落卡同拍入场（S08 首块「1,500 bytes」）
const T_PULSE = 1064; // 数字落定脉冲
const T_APPROX = 1145; // ≈（S08 次块「one paragraph of text」）
const T_LOOP = 1150; // 高亮循环启动
const TO = 1227;
const CARD = {x: 185, y: 258, w: 300, h: 204};
const NUM = {cx: 800, cy: 360, size: 110};
/** 段落文本线（卡内局部坐标；首行缩进 x48，末行收短） */
const LINES = [
  {y: 42, x: 48, w: 198},
  {y: 78, x: 28, w: 224},
  {y: 114, x: 28, w: 210},
  {y: 150, x: 28, w: 224},
  {y: 186, x: 28, w: 126},
];
const APPROX = {cx: 540, cy: 356};
/** Orbitron 实宽比 textW(EM_ORB) 估的略宽（数字 .82em vs 估 .71em），右侧摆 bytes 时留 12% 余量 */
const NUM_W = textW('1,500', NUM.size, EM_ORB, 2) * 1.12;

export const SC07: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const op = exitOp(N, TO, 8);
  // 数字：20 帧计数 + 落定脉冲（包裹层绕数字中心缩放）
  const nn = N - T_IN;
  const val = countTo(nn, 0, 1500, 20);
  const pulse = emphasisPulse(N - T_PULSE, {peak: 1.09, up: 9, hold: 4, down: 10});
  const numOp = nn < 0 ? 0 : softOp(nn, 8);
  // 段落卡：slideUp Δ100
  const cn = N - T_IN;
  const cardY = CARD.y + slideUp(cn, 100, 22);
  const cardOp = cn < 0 ? 0 : fadeIn(cn, 8);
  // ≈：缩放入场
  const an = N - T_APPROX;
  const aS = an < 0 ? 0 : scaleIn(an, 21);
  // 高亮条：连续滑移（1150 起从第 1 行匀速滑到第 5 行，覆盖全部 5 行文本；motion 修复：帧帧有位移）
  const loopN = N - T_LOOP;
  const barTop = LINES[0].y, barBot = LINES[LINES.length - 1].y;
  // v3: 单趟下滑 30 帧（1150→1180，4.8px/帧），之后落位静态给足段末 hold（≥30f）
  const gp = clamp01(loopN / 30);
  const barY = CARD.y + barTop - 10 + (barBot - barTop) * gp;
  const barOp = loopN < 0 ? 0 : Math.min(softOp(loopN, 6), 1 - clamp01((N - (TO - 9)) / 7));
  // bytes 小字（数字右下）
  const bytesCx = NUM.cx + NUM_W / 2 + 16 + textW('bytes', 26) / 2;
  return (
    <div style={{position: 'absolute', inset: 0, opacity: op}}>
      {/* 段落卡（左，DocIcon 风：折角文档 + 5 条文本线，首行缩进） */}
      {cardOp > 0 ? (
        <div style={{...abs(CARD.x, cardY, CARD.w, CARD.h), opacity: cardOp}}>
          <svg width={CARD.w} height={CARD.h} viewBox={`0 0 ${CARD.w} ${CARD.h}`} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible', filter: 'drop-shadow(0 0 2px rgba(255,255,255,.35))'}}>
            <path d={`M2.5,2.5 H${CARD.w - 58.5} L${CARD.w - 2.5},${58.5} V${CARD.h - 2.5} H2.5 Z`} fill="#000" stroke={WHITE} strokeWidth={2.5} strokeLinejoin="round" />
            <path d={`M${CARD.w - 58.5},2.5 V58.5 H${CARD.w - 2.5}`} fill="none" stroke={WHITE} strokeWidth={2.5} strokeLinejoin="round" />
          </svg>
          {/* 高亮条（v2 修复：原画在 svg 之前被卡体不透明黑 fill 全程盖住 → 移到 svg 之后、文本线之前） */}
          {barOp > 0 ? (
            <div style={{...abs(16, barY - CARD.y, CARD.w - 32, 34), background: 'rgba(102,48,248,.62)', borderTop: '3px solid rgba(226,214,255,.95)', borderBottom: '3px solid rgba(226,214,255,.95)', borderRadius: 3, opacity: barOp}} />
          ) : null}
          {/* 5 条文本线（首行缩进，2 帧错峰 wipe） */}
          {LINES.map((l, i) => {
            const p = clamp01((cn - 4 - 2 * i) / 10);
            if (p <= 0) return null;
            return <div key={i} style={{...abs(l.x, l.y, l.w * easeOutCubic(p), 5), background: GREY_LIGHT, opacity: 0.92, borderRadius: 2}} />;
          })}
        </div>
      ) : null}
      {/* ≈（中） */}
      {an >= 0 ? (
        <CText cx={APPROX.cx} cy={APPROX.cy} size={46} weight={700} color={WHITE} letterSpacing={2} opacity={softOp(an, 8)} style={{transform: `translate(-50%,-50%) scale(${aS.toFixed(4)})`}}>
          ≈
        </CText>
      ) : null}
      {/* 数字（右，主角） */}
      <div style={{position: 'absolute', inset: 0, opacity: numOp, transform: pulse === 1 ? undefined : `scale(${pulse.toFixed(4)})`, transformOrigin: `${NUM.cx}px ${NUM.cy}px`}}>
        <BigNumber cx={NUM.cx} cy={NUM.cy} value={val} size={NUM.size} />
      </div>
      <CText cx={bytesCx} cy={NUM.cy + 34} size={26} weight={600} color={GREY} opacity={numOp}>
        bytes
      </CText>
    </div>
  );
};
