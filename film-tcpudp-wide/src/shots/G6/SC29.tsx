import React from 'react';
import {useCurrentFrame} from 'remotion';
import {clamp01, easeInOutPow, powOutRemain, emphasisPulse, FONT_MONO} from '../../common';
import {
  Box, CText, MonoText, abs, softOp, firstOp, exitOp, glowOffK, exitAccel, mixHex, SoftIn, EXAMPLE,
  WHITE, GREY, GREY_MID, GREY_LINE, PURPLE, PURPLE_LIGHT,
} from '../../ui';
import {HeroGlow} from '../../fx';

/**
 * SC29 不是疏忽，是诚实 · N 7182–7414（S52 7190–7239 + S53 7250–7412 ¶+gap12，**C3 章末镜头**）
 * 节拍：7190 UDP 不粗心 / 7250 对线诚实 / 7322 应用自己决定 / 7373 什么值得等。
 * 画面：居中一枚大明信片（0.8× SC22 款，480×256）正对观众（缩放入场 1.06→1.0 + −1.2°→0 的「转身」感），
 *   内含手写线/竖分隔/地址区 `to: 203.0.113.10`/邮票框/邮戳圆章/出处小字（0.8× 缩微、软淡入）；
 *   左侧一枚「线的印章」（r54 圆 + 水平线 + 波纹，白，−8°）7250 draw-on 12 帧 + 印章-明信片连线 wipe；
 *   右侧「应用层控制台」面板（240×250，头标 `apps`）7322 侧向滑入（Δ280/16 帧）；
 *   三枚拨杆 `wait` `retry` `order` 从 ON 逐枚拨到 OFF（7334/7344/7354 各 10 帧 + 落位咔嗒白闪 2 帧 + 白环）；
 *   底部大字 `the app decides`（Noto 900 52px 白+紫描边+紫柔光）7373 SoftIn + emphasisPulse；
 *   拨杆标签拨完后持续微呼吸（持续动作）。
 * 停留：大字 7373 SoftIn + 脉冲至 7397 → 末 10 帧整组归零（EXIT 7404，进 C4 章节卡，其后 7415–7467 章前空白）。
 *   末块 40⚠ 帧所限，大字稳定期 ≈13–24 帧（分镜表自记 ≥30 按「节拍帧 7373→离场 7404」计）；已记录待主会话裁定。
 * 零 glitch、零扫光、无运镜。主角：明信片+控制台组（~300px）；光 = 明信片 HeroGlow（0.38）+ 大字紫描边光。
 */
const F0 = 7182;
const TO = 7414;
const T_CARD = 7190;   // S52：明信片缩放入场
const T_STAMP = 7250;  // S53 b1：线印章 draw-on（12 帧）
const T_LINE = 7262;   // 印章-明信片连线 wipe（8 帧）
const T_PANEL = 7322;  // S53 b2：控制台侧向滑入（Δ280 / 16 帧）
const FLIPS = [7334, 7344, 7354]; // 三枚拨杆逐枚拨 OFF（各 10 帧 + 咔嗒白闪）
const T_BIG = 7358;    // S53 b3：the app decides（成片 v2 前挂 15 帧腾稳定期）
const EXIT = TO - 8;   // 7406（末 8 帧整组归零，进 C4 章节卡）

const CARD = {x: 400, y: 196, w: 480, h: 256}; // 0.8× SC22（600×320 → 480×256）
const CC = {cx: 640, cy: 324};                  // 明信片中心
const STAMP = {cx: 285, cy: 324, r: 54};        // 线的印章
const LINE = {x0: 343, x1: 397, y: 324};        // 印章-明信片连线
const PANEL = {x: 940, y: 199, w: 240, h: 250}; // 应用层控制台
const ROW_Y = [277, 335, 393];                  // 三行拨杆
const SLOT = {x: 1094, w: 64, h: 26};           // 拨杆槽（槽心 x 1126）
const BIG = {cx: 640, cy: 555, size: 52};

/** 手写感波浪线（局部坐标） */
const waveD = (y: number, amp: number) => `M 24 ${y} q 30 ${-amp} 60 0 t 60 0 t 60 0 t 58 0`;

export const SC29: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const op = exitOp(N, TO, 4); // 成片 v5：4 帧离场
  const exDy = exitAccel(Math.max(0, N - EXIT), 0.08);
  const gk = glowOffK(N, TO, 2, 4);

  // —— 明信片入场（1.06→1.0 + −1.2°→0，18 帧）——
  const cn = N - T_CARD;
  const settle = easeInOutPow(2.5)(clamp01(cn / 18));
  const cardS = 1.06 - 0.06 * settle;
  const cardR = -1.2 * (1 - settle);
  const cOp = firstOp(cn, 8);
  const cardIn = cn >= 0;
  // 成片 v2：落位后轻微呼吸（±0.8% scale，44 帧周期——打破 7262–7322 真静窗；离场前不叠加）
  const cardBreathe = 1 + (N < TO - 8 - 46 ? 0.008 : 0) * Math.sin((2 * Math.PI * Math.max(0, cn - 18)) / 44); // 成片 v5：末 46 帧呼吸停（hold）

  // —— 线印章 draw-on ——
  const sn = N - T_STAMP;
  const ringP = clamp01(sn / 12);
  const wireP = clamp01((sn - 6) / 6);
  const waveP = clamp01((sn - 8) / 6);
  const lineP = clamp01((N - T_LINE) / 8);

  // —— 控制台滑入 ——
  const pn = N - T_PANEL;
  const pr = powOutRemain(pn, 16, 2.5);

  // —— 大字 ——
  const bp = 1; // 成片 v5：大字脉冲移除（发光呼吸已足够；腾 hold）

  return (
    <div style={{position: 'absolute', inset: 0, opacity: op, transform: exDy ? `translateY(${exDy.toFixed(1)}px)` : undefined}}>
      {/* 主角柔光（明信片，先灭光再淡出） */}
      <HeroGlow x={CARD.x} y={CARD.y} w={CARD.w} h={CARD.h} r={14} N={N} k={0.38 * gk * softOp(cn, 10)} />

      {/* ============ 大明信片（0.8× SC22 款，正对观众） ============ */}
      {cardIn ? (
        <div style={{position: 'absolute', inset: 0, opacity: cOp, transform: `rotate(${cardR.toFixed(2)}deg) scale(${(cardS * cardBreathe).toFixed(4)})`, transformOrigin: `${CC.cx}px ${CC.cy}px`}}>
          <svg width={CARD.w} height={CARD.h} viewBox={`0 0 ${CARD.w} ${CARD.h}`} style={{...abs(CARD.x, CARD.y), overflow: 'visible'}}>
            {/* 卡体 */}
            <rect x={1.5} y={1.5} width={CARD.w - 3} height={CARD.h - 3} rx={10} fill="#000" stroke={WHITE} strokeWidth={3} opacity={softOp(cn, 8)} />
            {/* 右半竖分隔线 */}
            <line x1={278} y1={16} x2={278} y2={CARD.h - 16} stroke={GREY_MID} strokeWidth={1.5} strokeDasharray="6 6" opacity={0.9 * softOp(cn - 3, 8)} />
            {/* 左半两条手写线（draw-on） */}
            {[97, 154].map((wy, i) => {
              const p = clamp01((cn - 4 - i * 3) / 14);
              if (p <= 0) return null;
              return <path key={wy} d={waveD(wy, i % 2 === 0 ? 6 : 7)} fill="none" stroke={GREY} strokeWidth={2} opacity={0.85}
                pathLength={100} strokeDasharray="100" strokeDashoffset={100 * (1 - p)} />;
            })}
            {/* 地址区两条浅灰底线 */}
            <line x1={294} y1={141} x2={456} y2={141} stroke={GREY_MID} strokeWidth={1.6} opacity={0.5 * softOp(cn - 6, 8)} />
            <line x1={294} y1={184} x2={456} y2={184} stroke={GREY_MID} strokeWidth={1.6} opacity={0.5 * softOp(cn - 6, 8)} />
            {/* 邮票框（右上角，虚线边 + 波纹） */}
            <g opacity={softOp(cn - 9, 8)}>
              <rect x={413} y={18} width={50} height={53} fill="#000" stroke={WHITE} strokeWidth={2} strokeDasharray="4 3" />
              <path d="M 418 48 q 7 -7 14 0 t 14 0" fill="none" stroke={GREY} strokeWidth={1.5} opacity={0.9} />
              <path d="M 418 56 q 7 -7 14 0 t 14 0" fill="none" stroke={GREY} strokeWidth={1.5} opacity={0.9} />
            </g>
            {/* 邮戳圆章（紫，draw-on） */}
            {cn - 12 >= 0 ? (
              <g>
                <circle cx={362} cy={61} r={32} fill="none" stroke={PURPLE_LIGHT} strokeWidth={2.5}
                  pathLength={100} strokeDasharray="100" strokeDashoffset={100 * (1 - clamp01((cn - 12) / 12))} opacity={0.95}
                  style={{filter: 'drop-shadow(0 0 6px rgba(102,45,248,.5))'}} />
                <circle cx={362} cy={61} r={23} fill="none" stroke={PURPLE_LIGHT} strokeWidth={1.5} strokeDasharray="5 5" opacity={0.7 * clamp01((cn - 16) / 8)} />
                <path d="M 336 67 q 8 -5 16 0 t 16 0 t 16 0" fill="none" stroke={PURPLE_LIGHT} strokeWidth={1.6} opacity={0.75 * clamp01((cn - 18) / 8)} />
              </g>
            ) : null}
          </svg>
          {/* 地址文本 */}
          <MonoText x={CARD.x + 294} y={CARD.y + 112} size={22} color={WHITE} opacity={softOp(cn - 6, 8)}>{EXAMPLE.to}</MonoText>
          {/* 右下角出处小字（0.8× 缩微） */}
          <MonoText x={CARD.x} y={CARD.y + 264} size={22} color={GREY} opacity={0.85 * softOp(cn - 15, 8)}
            style={{width: CARD.w, textAlign: 'right'}}>RFC 768 · 1980 · Jon Postel</MonoText>
        </div>
      ) : null}

      {/* ============ 线的印章（左） ============ */}
      {sn >= 0 ? (
        <svg width={1280} height={720} viewBox="0 0 1280 720" style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
          <g transform={`translate(${STAMP.cx} ${STAMP.cy}) rotate(-8)`} style={{filter: 'drop-shadow(0 0 2px rgba(255,255,255,.35))'}} opacity={firstOp(sn, 6)}>
            {/* 外圈 draw-on 12 帧 */}
            <circle r={STAMP.r} fill="#000" fillOpacity={0.55 * ringP} stroke={WHITE} strokeWidth={3}
              pathLength={100} strokeDasharray="100" strokeDashoffset={100 * (1 - ringP)} />
            {/* 水平线（the wire） */}
            <line x1={-30} y1={6} x2={30} y2={6} stroke={WHITE} strokeWidth={2.5}
              pathLength={100} strokeDasharray="100" strokeDashoffset={100 * (1 - wireP)} />
            {/* 上下波纹 */}
            <path d="M -26 20 q 8 -7 16 0 t 16 0 t 16 0" fill="none" stroke={WHITE} strokeWidth={2}
              pathLength={100} strokeDasharray="100" strokeDashoffset={100 * (1 - waveP)} />
            <path d="M -18 -10 q 6 -6 12 0 t 12 0" fill="none" stroke={WHITE} strokeWidth={2}
              pathLength={100} strokeDasharray="100" strokeDashoffset={100 * (1 - waveP)} />
          </g>
        </svg>
      ) : null}
      {/* 印章-明信片连线（wipe 8 帧） */}
      {lineP > 0 ? (
        <div style={{...abs(LINE.x0, LINE.y - 1, (LINE.x1 - LINE.x0) * lineP, 2), background: GREY_MID}} />
      ) : null}

      {/* ============ 应用层控制台（右） ============ */}
      {pn >= 0 ? (
        <div style={{position: 'absolute', inset: 0, transform: `translateX(${(280 * pr).toFixed(1)}px)`, opacity: softOp(pn, 6)}}>
          <Box x={PANEL.x} y={PANEL.y} w={PANEL.w} h={PANEL.h} r={10} sw={2.5} glow="0 0 14px 4px rgba(255,255,255,.16)" />
          {/* 头标 + 分隔线 */}
          <CText cx={PANEL.x + PANEL.w / 2} cy={PANEL.y + 28} size={22} weight={700} family={FONT_MONO} color={GREY} dy={0}>apps</CText>
          <div style={{...abs(PANEL.x + 22, PANEL.y + 46, PANEL.w - 44, 1.5), background: GREY_LINE}} />
          {/* 三行拨杆 */}
          {['wait', 'retry', 'order'].map((label, k) => {
            const flipP = clamp01((N - FLIPS[k]) / 10);
            const e = easeInOutPow(2.2)(flipP);
            const knobDx = 19 - 38 * e; // +19=ON（右） → −19=OFF（左）
            const strokeC = mixHex(WHITE, GREY_MID, e);
            const knobFill = mixHex(WHITE, '#000000', e);
            const slotCx = SLOT.x + SLOT.w / 2;
            const cy = ROW_Y[k];
            const clicked = N - (FLIPS[k] + 10);
            const flash = clicked >= 0 && clicked < 2 ? 1.7 - 0.35 * clicked : 1;
            // 标签：拨前白（ON），拨完变灰 + 持续微呼吸（10 帧渐入振幅，46 帧周期，三行错相）
            const bn2 = clicked;
            const amp = clamp01(bn2 / 10) * 0.18;
            const labelOp = bn2 > 0 ? 1 - amp + amp * Math.sin((2 * Math.PI * Math.min(bn2, TO - 8 - 46 - T_PANEL - 16)) / 46 + k * 1.3) : 1;
            const labelCol = flipP >= 1 ? GREY : mixHex(WHITE, GREY, e);
            return (
              <React.Fragment key={label}>
                <div style={{...abs(PANEL.x + 26, cy - 15, 120, 30), fontFamily: FONT_MONO, fontSize: 24, fontWeight: 700, color: labelCol, opacity: labelOp, lineHeight: '30px'}}>{label}</div>
                {/* 拨杆槽 */}
                <div style={{...abs(SLOT.x, cy - SLOT.h / 2, SLOT.w, SLOT.h), borderRadius: SLOT.h / 2, border: `2.5px solid ${strokeC}`, background: '#000'}} />
                {/* 拨钮（咔嗒白闪 2 帧） */}
                <div style={{...abs(slotCx + knobDx - 10, cy - 10, 20, 20), borderRadius: '50%', background: knobFill, border: `2.5px solid ${strokeC}`,
                  filter: flash > 1 ? `brightness(${flash})` : undefined}} />
                {/* 落位白环 */}
                {clicked >= 0 && clicked < 5 ? (
                  <div style={{...abs(slotCx - 19 - (12 + clicked * 2), cy - (12 + clicked * 2), (12 + clicked * 2) * 2, (12 + clicked * 2) * 2), borderRadius: '50%',
                    border: `2px solid ${WHITE}`, opacity: 0.7 * (1 - clicked / 5)}} />
                ) : null}
              </React.Fragment>
            );
          })}
        </div>
      ) : null}

      {/* ============ 底部大字 the app decides ============ */}
      <div style={{position: 'absolute', inset: 0, transform: `scale(${bp.toFixed(4)})`, transformOrigin: `${BIG.cx}px ${BIG.cy}px`}}>
        <SoftIn N={N} f0={T_BIG} len={8} dy={12}>
          <CText cx={BIG.cx} cy={BIG.cy} size={BIG.size} weight={900} letterSpacing={1} color={WHITE} dy={0}
            shadow="0 0 18px rgba(102,45,248,.5)"
            style={{WebkitTextStroke: `2.5px ${PURPLE}`, paintOrder: 'stroke fill'}}>the app decides</CText>
        </SoftIn>
      </div>
    </div>
  );
};
