import React from 'react';
import {useCurrentFrame} from 'remotion';
import {clamp01, easeInOutPow, GlitchIn, emphasisPulse, FONT_WIDE, FONT_MONO} from '../../common';
import {
  Box, CText, MonoText, abs, softOp, exitOp, glowOffK, exitAccel, SoftIn, EXAMPLE,
  WHITE, GREY, GREY_MID, GREY_LIGHT, PURPLE, PURPLE_LIGHT, BLOOM, BLOOM_SOFT,
} from '../../ui';
import {HeroGlow} from '../../fx';

/** 进度 kf 0→1（easeInOutPow 2.5），起止帧版 */
const kf0 = (N: number, f0: number, len: number) => easeInOutPow(2.5)(clamp01((N - f0) / len));

/**
 * SC22 明信片 · N 5060–5390（S36 5068–5297 ¶ + S37 5328–5388）
 * 节拍：5068 第二个协议 / 5143 RFC 768 · 1980 / 5328 明信片（前挂 5324）。
 * 版式：中央大明信片 600×320（x340–940, y200–520，白描边 3px）：左半 3 条手写感灰线（draw-on），
 *       右半竖分隔线（x688 虚线）+ 地址区（`to: 203.0.113.10` 等宽打字机）+ 邮票框（stampIn + 落章白闪）
 *       + 邮戳圆章（draw-on 12 帧，紫）；右下小字 `RFC 768 · 1980 · Jon Postel`（灰 22px）。
 * 章界承接：C3 章节卡（覆盖层，末帧 5059 上出）→ 5060 一枚虚线 UDP 卡（SC10 同款 300×200 灰虚描边）
 *       自章节卡标题位 (640,372) kf 16 帧位移放大成明信片位（覆盖层无 UDP 卡可共元素，近似承接，见 BUILD_NOTES）。
 * 持续：地址打字机（5170–5258）→ 光标闪烁；明信片右缘两根「投递风」流线 2px/帧滑过（5100 起）；
 *       HeroGlow 30 帧呼吸。零扫光。本镜唯一 glitch = `POSTCARD`（rgbSplit 4）。
 * 停留：POSTCARD 脉冲结束 5352 → 离场 5382（末 8 帧归零），≈30 帧 ✓。
 */
const F0 = 5060;
const TO = 5390;
const T_MORPH = 5060;   // 承接 kf 起点（= 镜头首帧，章节卡刚上出）
const T_CARD = 5068;    // S36 块1：明信片主体成形
const T_GUIDE = 5072;   // 3 条手写线 draw-on（每条 24 帧 → 5144）
const T_STAMP = 5143;   // S36 块2：邮票框 stampIn（10 帧 + 白闪 2 帧）
const T_MARK = 5147;    // 邮戳圆章 draw-on（12 帧）
const T_ATTR = 5155;    // 出处小字 SoftIn
const T_ADDR = 5170;    // 地址打字机（约 5.5 帧/字 × 16 → 5258）
const T_WIND = 5100;    // 投递风流线起（2px/帧，持续到离场）
const T_POST = 5322;    // S37「A UDP packet is a postcard」（5328 −6 前挂，节拍容差内）：POSTCARD GlitchIn
const T_PULSE = 5330;   // 明信片整体 1.04 微脉冲（12 帧，成片 v2 缩短腾稳定期）
const EXIT = TO - 8;    // 5382

const PC = {x: 340, y: 200, w: 600, h: 320}; // 明信片
const DIV_X = 688;                              // 右半竖分隔线（0.58）
const STAMP = {x: 856, y: 222, w: 62, h: 66};  // 邮票框（右上角，绝对坐标）
const MARK = {cx: 792, cy: 276, r: 40};         // 邮戳圆章

/** 承接卡首帧亮度（首帧可见，非 fadeIn(0)=0） */
const firstDash = (n: number) => (n < 0 ? 0 : Math.min(1, 0.6 + 0.4 * clamp01(n / 6)));

/** 手写感波浪线（x366→660，6 段 49px） */
const guideD = (y: number, amp: number) => `M 366 ${y} q 24.5 ${-amp} 49 0 t 49 0 t 49 0 t 49 0 t 49 0 t 49 0`;

export const SC22: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const exOp = exitOp(N, TO, 5); // 成片 v5：5 帧离场
  const exDy = exitAccel(Math.max(0, N - EXIT), 0.3);
  const gk = glowOffK(N, TO, 2, 4);

  // —— 章界承接：虚线 UDP 卡（SC10/SC11 同款）→ 明信片位（16 帧 easeInOutPow 2.5）——
  const mc = kf0(N, T_MORPH, 16);
  const dashW = 300 + (PC.w - 300) * mc;
  const dashH = 200 + (PC.h - 200) * mc;
  const dashY = 372 + (PC.y + PC.h / 2 - 372) * mc;
  const dashOp = N < T_MORPH ? 0 : N < T_CARD + 6 ? firstDash(N - T_MORPH) : Math.max(0, 1 - (N - (T_CARD + 6)) / 10);

  // —— 明信片主体（5068 起）——
  const cn = N - T_CARD;
  const cardOp = softOp(cn, 10);
  const pulse = emphasisPulse(N - T_PULSE, {peak: 1.04, up: 5, hold: 1, down: 5}); // 成片 v6：脉冲缩短

  // 手写线 draw-on（3 条，每条 24 帧，2 条顺延）
  const guideP = (i: number) => clamp01((N - (T_GUIDE + i * 24)) / 24);

  // 邮票 stampIn：1.4→1.0（10 帧）+ 落位白闪 2 帧
  const sn = N - T_STAMP;
  const stampS = sn < 0 ? 0 : 1.4 - 0.4 * easeInOutPow(2.5)(clamp01(sn / 10));
  const stampFlash = sn >= 10 && sn < 12 ? 1.6 - 0.3 * (sn - 10) : 1;

  // 邮戳 draw-on（外圈 12 帧 + 波纹 8 帧）
  const mn = N - T_MARK;
  const markP = clamp01(mn / 12);
  const markWaveP = clamp01((mn - 8) / 8);

  // 地址打字机（5.5 帧/字）+ 光标
  const addrShown = Math.max(0, Math.min(EXAMPLE.to.length, Math.floor((N - T_ADDR) * 2 / 11)));
  const addrDone = N >= T_ADDR + (EXAMPLE.to.length * 11) / 2;
  const cursorOn = N >= T_ADDR - 2 && Math.floor(N / 8) % 2 === 0;

  // 投递风流线（两根，2px/帧下滑 + 220px 循环）
  const windN = N - T_WIND;
  const windY = (i: number) => 250 + ((1.5 * Math.min(windN, TO - 8 - 46 - T_WIND) + i * 150) % 300); // 成片 v5：末 46 帧风线停（hold）

  return (
    <div style={{position: 'absolute', inset: 0, opacity: exOp, transform: exDy ? `translateY(${exDy.toFixed(1)}px)` : undefined}}>
      {/* 承接虚线 UDP 卡（章节卡 → 明信片） */}
      {dashOp > 0.01 ? (
        <div style={{...abs(640 - dashW / 2, dashY - dashH / 2, dashW, dashH), opacity: dashOp}}>
          <Box x={0} y={0} w={dashW} h={dashH} r={12} stroke={mc > 0.9 ? PURPLE_LIGHT : GREY_MID} sw={2.5} dashed fill="rgba(0,0,0,0.6)" />
          <CText cx={dashW / 2} cy={dashH / 2} size={Math.min(56, dashH * 0.28)} weight={400} family={FONT_WIDE} color={GREY} opacity={0.55 * (1 - mc * 0.7)} letterSpacing={4} dy={-2}>UDP</CText>
        </div>
      ) : null}

      {/* 主角柔光（先灭光再淡出） */}
      <HeroGlow x={PC.x} y={PC.y} w={PC.w} h={PC.h} r={14} N={Math.min(N, TO - 8 - 46)} k={softOp(cn, 10) * gk} /> {/* 成片 v7：末 46 帧柔光呼吸冻结（hold） */}

      {/* 明信片本体 */}
      {cardOp > 0.01 ? (
        <div style={{position: 'absolute', inset: 0, opacity: cardOp, transform: pulse !== 1 ? `scale(${pulse.toFixed(4)})` : undefined, transformOrigin: '640px 360px'}}>
          <svg width={PC.w} height={PC.h} viewBox={`0 0 ${PC.w} ${PC.h}`} style={{...abs(PC.x, PC.y), overflow: 'visible', filter: BLOOM}}>
            <rect x={1.5} y={1.5} width={PC.w - 3} height={PC.h - 3} rx={10} fill="#000" stroke={WHITE} strokeWidth={3} />
            {/* 右半竖分隔线 */}
            <line x1={DIV_X - PC.x} y1={16} x2={DIV_X - PC.x} y2={PC.h - 16} stroke={GREY_MID} strokeWidth={1.5} strokeDasharray="6 6" opacity={softOp(cn - 4, 8)} />
            {/* 地址区两条浅灰底线 */}
            <line x1={364} y1={196} x2={578} y2={196} stroke={GREY_MID} strokeWidth={1.6} opacity={0.5 * softOp(cn - 8, 8)} />
            <line x1={364} y1={236} x2={578} y2={236} stroke={GREY_MID} strokeWidth={1.6} opacity={0.5 * softOp(cn - 8, 8)} />
          </svg>

          {/* 左半 3 条手写感灰线（draw-on，24 帧/条） */}
          <svg width={PC.w} height={PC.h} viewBox={`0 0 ${PC.w} ${PC.h}`} style={{...abs(PC.x, PC.y)}}>
            {[96, 152, 208].map((gy, i) => {
              const p = guideP(i);
              if (p <= 0) return null;
              return <path key={gy} d={guideD(gy, i % 2 === 0 ? 5 : 6)} fill="none" stroke={GREY} strokeWidth={2} opacity={0.85}
                pathLength={100} strokeDasharray="100" strokeDashoffset={100 * (1 - p)} />;
            })}
          </svg>

          {/* 邮票框（stampIn + 落章白闪）+ 内部波纹 */}
          {sn >= 0 ? (
            <div style={{...abs(STAMP.x - (STAMP.w * (stampS - 1)) / 2, STAMP.y - (STAMP.h * (stampS - 1)) / 2, STAMP.w * stampS, STAMP.h * stampS), filter: stampFlash > 1 ? `brightness(${stampFlash})` : undefined}}>
              <svg width={STAMP.w * stampS} height={STAMP.h * stampS} viewBox={`0 0 ${STAMP.w} ${STAMP.h}`} style={{overflow: 'visible', filter: BLOOM_SOFT}}>
                <rect x={1.25} y={1.25} width={STAMP.w - 2.5} height={STAMP.h - 2.5} fill="#000" stroke={WHITE} strokeWidth={2.5} strokeDasharray="4 3" />
                <path d={`M 10 42 q 7 -7 14 0 t 14 0 t 14 0`} fill="none" stroke={GREY} strokeWidth={1.6} opacity={0.9} />
                <path d={`M 10 50 q 7 -7 14 0 t 14 0 t 14 0`} fill="none" stroke={GREY} strokeWidth={1.6} opacity={0.9} />
              </svg>
            </div>
          ) : null}
          {/* 落章白环 */}
          {sn >= 10 && sn < 18 ? (
            <svg width={1280} height={720} viewBox="0 0 1280 720" style={{position: 'absolute', inset: 0}}>
              <circle cx={STAMP.x + STAMP.w / 2} cy={STAMP.y + STAMP.h / 2} r={40 + (sn - 10) * 5} fill="none" stroke={WHITE} strokeWidth={3} opacity={0.8 * (1 - (sn - 10) / 8)} />
            </svg>
          ) : null}

          {/* 邮戳圆章（draw-on + 紫光）：外圈 + 内圈虚线 + 3 根波纹 */}
          {mn >= 0 ? (
            <svg width={1280} height={720} viewBox="0 0 1280 720" style={{position: 'absolute', inset: 0, overflow: 'visible', filter: 'drop-shadow(0 0 8px rgba(102,45,248,.55))'}}>
              <circle cx={MARK.cx} cy={MARK.cy} r={MARK.r} fill="none" stroke={PURPLE_LIGHT} strokeWidth={2.5}
                pathLength={100} strokeDasharray="100" strokeDashoffset={100 * (1 - markP)} opacity={0.95} />
              <circle cx={MARK.cx} cy={MARK.cy} r={MARK.r - 9} fill="none" stroke={PURPLE_LIGHT} strokeWidth={1.5} strokeDasharray="5 5" opacity={0.7 * markP} />
              {[0, 1, 2].map((k) => (
                <path key={k} d={`M ${MARK.cx - MARK.r - 14} ${MARK.cy - 12 + k * 12} q 12 -6 24 0 t 24 0 t 24 0 t 24 0 t 24 0`}
                  fill="none" stroke={PURPLE_LIGHT} strokeWidth={1.8} opacity={0.75 * clamp01((markWaveP - k * 0.2) / 0.5)} />
              ))}
            </svg>
          ) : null}

          {/* 地址区打字机 + 光标（持续闪烁） */}
          {N >= T_ADDR - 2 ? (
            <MonoText x={PC.x + 364} y={PC.y + 168} size={24} color={WHITE} opacity={0.95}>
              {EXAMPLE.to.slice(0, addrShown)}
              {(!addrDone || N < T_POST) && cursorOn && N < TO - 8 - 40 ?  <span style={{color: PURPLE_LIGHT}}>▌</span> : null}
            </MonoText>
          ) : null}

          {/* 右下角出处小字（明信片下缘右对齐） */}
          <SoftIn N={N} f0={T_ATTR}>
            <div style={{...abs(PC.x, PC.y + 338, PC.w, 26), fontFamily: FONT_MONO, fontSize: 22, color: GREY, textAlign: 'right', whiteSpace: 'pre', opacity: 0.9}}>
              RFC 768 · 1980 · Jon Postel
            </div>
          </SoftIn>
        </div>
      ) : null}

      {/* `POSTCARD`（左上角，本镜唯一 glitch，rgbSplit 4）+ 紫描边紫光 */}
      <div style={{position: 'absolute', inset: 0, opacity: cardOp, transform: `rotate(-3deg)`, transformOrigin: '505px 250px'}}>
        <GlitchIn N={N} f0={T_POST} rgbSplit={4} seed={22}>
          <CText cx={505} cy={250} size={44} weight={400} family={FONT_WIDE} color={WHITE} letterSpacing={4} dy={-2}
            shadow={`0 0 16px rgba(102,45,248,.6)`}
            style={{WebkitTextStroke: `2px ${PURPLE}`, paintOrder: 'stroke fill'}}>POSTCARD</CText>
        </GlitchIn>
      </div>

      {/* 投递风流线（成片 v2：右缘两根加长加亮（1.5px/帧下滑 + 300px 循环）——明信片区的持续动词，破 5226–5325 真静窗） */}
      {windN >= 0 ? (
        <svg width={1280} height={720} viewBox="0 0 1280 720" style={{position: 'absolute', inset: 0, overflow: 'visible', filter: BLOOM_SOFT}}>
          {[0, 1].map((i) => {
            const y = windY(i);
            const op = softOp(windN - i * 24, 10) * 0.8 * (y > 480 ? Math.max(0.2, 1 - (y - 480) / 80) : 1);
            return <path key={i} d={`M 952 ${y} q 14 7 28 0 q 14 -7 28 0 q 14 7 28 0 q 14 -7 28 0 q 14 7 28 0 q 14 -7 28 0`} fill="none" stroke={GREY_LIGHT} strokeWidth={3} opacity={op} />;
          })}
        </svg>
      ) : null}
    </div>
  );
};
