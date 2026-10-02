import React from 'react';
import {useCurrentFrame} from 'remotion';
import {clamp01, easeOutCubic, GlitchIn, powOutRemain, FONT_MONO, FONT_WIDE} from '../../common';
import {CameraRig} from '../../fx';
import {Box, CText, MonoText, Pill, GREY, GREY_LIGHT, GREY_MID, ORANGE, PURPLE_DEEP, WHITE, abs, firstOp, softOp, exitOp, scaleIn} from '../../ui';
import {EXAMPLE} from '../../ui';

/**
 * SC08 明信片（UDP 登场）· N 1016–1101（S09 1024–1099；单块 1024）
 * 版式：大明信片 x 90–600、y 380–900（510×520 主角，白描边 3px；分镜表 x 100–620 按 1.06 慢推安全区收敛）：
 *   左半书写区 2 条灰线；右半地址区 `to: 203.0.113.10`（等宽 24px 打字机）+ 右上角邮票框（内简笔波纹）
 *   + 邮戳圆章（draw-on 12 帧）+ 右下角 `RFC 768 · 1980`（灰 24px——分镜表 22px 低于竖版最小字号，已抬到 24）；
 *   左上角 `POSTCARD`（Audiowide 56px，GlitchIn rgbSplit 4 本镜唯一 glitch）。
 * 节拍：1018 整卡自右滑入（Δ140，前 6 帧渐入，18 帧到位）+ `UDP` 橙 Pill stampIn 在卡上角；
 *   1044 `POSTCARD` GlitchIn（=1024+20）；1046 邮票框 stampIn；1050 地址打字机（2.5 帧/字，40 帧到 1090）；
 *   1066 邮戳 draw-on；1060 RFC 小字 SoftIn；投递风流线在卡右缘持续下滑（2px/帧，循环到离场）。
 * 运镜：整卡 1.0→1.06 慢推（1016→1091，慢推贯穿例外）。零扫光。
 * 停留：段内不判（S09 后 S10 同段）。末 8 帧归零（1093–1101）。
 */
const F0 = 1016;
const TO = 1101;

const T_CARD = 1018, CARD_LEN = 18, T_UDP = 1018, T_PC = 1044, T_STAMP = 1046, T_ADDR = 1050, T_RFC = 1060, T_MARK = 1066, MARK_LEN = 12;

const CARD = {x: 90, y: 380, w: 510, h: 520};
const DIV_X = 355;
const ADDR = EXAMPLE.to;

export const SC08: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const exOp = exitOp(N, TO, 8);
  if (exOp <= 0) return null;

  const nCard = N - T_CARD;
  const slide = 140 * powOutRemain(nCard, CARD_LEN, 2.5); // 侧向滑入 Δ140
  const cardOp = clamp01(nCard / 6); // 前 6 帧渐入
  const udpS = 1.4 - 0.4 * easeOutCubic(clamp01((N - T_UDP) / 12)); // UDP Pill stampIn
  const stampS = 1.3 - 0.3 * easeOutCubic(clamp01((N - T_STAMP) / 10)); // 邮票框 stampIn
  const markP = clamp01((N - T_MARK) / MARK_LEN); // 邮戳 draw-on
  const typed = Math.min(ADDR.length, Math.floor((N - T_ADDR) / 2.5)); // 地址打字机
  const cardIn = clamp01((nCard + 1) / 7);

  return (
    <CameraRig N={N} keys={[{f: F0, x: 360, y: 640, s: 1}, {f: 1091, x: 360, y: 640, s: 1.06}]}>
      <div style={{position: 'absolute', inset: 0, opacity: exOp}}>
        {/* ---- 投递风流线（卡右缘，2px/帧持续下滑，循环到离场）---- */}
        {nCard > 10 ? [0, 1, 2].map((i) => {
          const cyc = 160;
          const y = 500 + ((2 * (N - T_CARD) + i * 54) % cyc);
          const w = 30 + i * 8;
          const fade = Math.sin(Math.PI * ((y - 500) / cyc)); // 循环首尾淡入淡出
          return <div key={i} style={{...abs(578 - i * 4, y, w, 3), borderRadius: 2, background: WHITE, opacity: (0.42 * fade * clamp01((nCard - 10) / 8)).toFixed(3)}} />;
        }) : null}

        {/* ---- 明信片主体（整卡自右滑入）---- */}
        <div style={{position: 'absolute', inset: 0, opacity: cardOp}}>
          <div style={{transform: `translateX(${slide.toFixed(2)}px)`}}>
            {/* 卡体 */}
            <Box x={CARD.x} y={CARD.y} w={CARD.w} h={CARD.h} r={10} sw={3} stroke={WHITE} fill="#000" style={{boxShadow: '0 0 26px 8px rgba(255,255,255,0.10)'}} />
            {/* 中缝竖分隔线（虚线）+ 书写区 2 条灰线 */}
            <svg width={720} height={1280} viewBox="0 0 720 1280" style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
              <line x1={DIV_X} y1={505} x2={DIV_X} y2={868} stroke={GREY_MID} strokeWidth={1.8} strokeDasharray="6 7" opacity={0.85 * cardIn} />
              <line x1={125} y1={630} x2={320} y2={630} stroke={GREY} strokeWidth={2.2} opacity={0.8 * cardIn} />
              <line x1={125} y1={700} x2={320} y2={700} stroke={GREY} strokeWidth={2.2} opacity={0.8 * cardIn} />
              <line x1={125} y1={770} x2={268} y2={770} stroke={GREY} strokeWidth={2.2} opacity={0.55 * cardIn} />
            </svg>

            {/* `UDP` 橙 Pill（卡上角 stampIn）*/}
            {N >= T_UDP ? (
              <div style={{position: 'absolute', inset: 0, opacity: firstOp(N - T_UDP, 5), transform: `scale(${udpS.toFixed(4)})`, transformOrigin: '160px 380px'}}>
                <Pill x={95} y={354} w={130} h={52} r={26} stroke={ORANGE} sw={3} fill="#000"
                  text="UDP" fontSize={32} weight={400} family={FONT_WIDE} color={ORANGE} letterSpacing={3} textDy={0}
                  style={{boxShadow: '0 0 18px 5px rgba(240,95,65,.45)'}} />
              </div>
            ) : null}

            {/* `POSTCARD`（Audiowide 56px；本镜唯一 glitch rgbSplit 4）*/}
            <GlitchIn N={N} f0={T_PC} rgbSplit={4} seed={28}>
              <CText cx={275} cy={465} size={56} weight={400} family={FONT_WIDE} color={WHITE} letterSpacing={2}
                shadow={`0 0 22px rgba(102,45,248,.5), 6px 6px 0 ${PURPLE_DEEP}`}>POSTCARD</CText>
            </GlitchIn>

            {/* 邮票框（右上角，内简笔波纹；stampIn）*/}
            {N >= T_STAMP ? (
              <div style={{position: 'absolute', inset: 0, opacity: firstOp(N - T_STAMP, 5), transform: `scale(${stampS.toFixed(4)})`, transformOrigin: '555px 424px'}}>
                <svg width={720} height={1280} viewBox="0 0 720 1280" style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
                  <rect x={526} y={402} width={58} height={46} fill="#000" stroke={WHITE} strokeWidth={2.2} />
                  <path d="M 532 432 q 5 -7 10 0 q 5 7 10 0 q 5 -7 10 0 q 5 7 10 0" fill="none" stroke={GREY} strokeWidth={1.8} />
                  <path d="M 532 418 q 5 -6 10 0 q 5 6 10 0 q 5 -6 10 0 q 5 6 10 0" fill="none" stroke={GREY_MID} strokeWidth={1.4} opacity={0.7} />
                </svg>
              </div>
            ) : null}

            {/* 邮戳圆章（draw-on 12 帧 + 波纹销戳线）*/}
            {markP > 0 ? (
              <svg width={720} height={1280} viewBox="0 0 720 1280" style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
                <circle cx={500} cy={452} r={37} fill="none" stroke={WHITE} strokeWidth={2.4} opacity={0.9}
                  strokeDasharray={232} strokeDashoffset={232 * (1 - markP)} transform="rotate(-90 500 452)" />
                <circle cx={500} cy={452} r={28} fill="none" stroke={GREY_MID} strokeWidth={1.4} strokeDasharray="5 6" opacity={0.8 * markP} />
                {[0, 1, 2].map((i) => {
                  const k = clamp01((markP - 0.25 - i * 0.12) / 0.4);
                  if (k <= 0) return null;
                  const x1 = 462 - i * 2;
                  return <path key={i} d={`M ${x1} ${444 + i * 8} q -14 -6 -28 0 q -14 6 -28 0 q -14 -6 -28 0`} fill="none" stroke={GREY_LIGHT} strokeWidth={2} opacity={0.75 * k} />;
                })}
              </svg>
            ) : null}

            {/* 地址区（打字机）*/}
            {typed > 0 ? (
              <div style={{position: 'absolute', inset: 0, opacity: clamp01((N - T_ADDR + 2) / 5)}}>
                <MonoText x={362} y={548} size={24} color={WHITE}>{ADDR.slice(0, typed)}</MonoText>
                {/* 光标 */}
                {typed < ADDR.length ? <div style={{...abs(362 + typed * 14.5, 549, 11, 26), background: WHITE, opacity: 0.85 * (Math.floor((N - T_ADDR) / 6) % 2 === 0 ? 1 : 0.15)}} /> : null}
              </div>
            ) : null}

            {/* 右下角出处小字 */}
            <div style={{position: 'absolute', inset: 0, opacity: softOp(N - T_RFC, 8)}}>
              <CText cx={487} cy={858} size={24} weight={600} family={FONT_MONO} color={GREY} letterSpacing={1}>RFC 768 · 1980</CText>
            </div>
          </div>
        </div>
      </div>
    </CameraRig>
  );
};
