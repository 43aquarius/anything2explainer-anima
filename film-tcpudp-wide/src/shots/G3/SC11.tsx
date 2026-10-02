import React from 'react';
import {useCurrentFrame} from 'remotion';
import {clamp01, kf, easeInOutPow, FONT_HEAVY, FONT_ORB, FONT_MONO} from '../../common';
import {CText, PhotoCard, Box, Pill, abs, scaleIn, fadeIn, SoftIn, exitOp, glowOffK, glowPurpleS, WHITE, GREY, GREY_MID, PURPLE, PURPLE_LIGHT, BLOOM_SOFT} from '../../ui';
import {CameraRig} from '../../fx';

/** 承接卡首帧亮度（首帧可见，非 fadeIn(0)=0；floor 0.6 保证第一帧能被看见） */
const firstDash = (n: number) => (n < 0 ? 0 : Math.min(1, 0.6 + 0.4 * clamp01(n / 6)));

/**
 * SC11 1974 → RFC 793（2222–2509，S18 ¶，真实素材镜头②）
 * 节拍：2230 第一个是 TCP / 2285 1974 论文 / 2400 RFC 793 · 1981。
 * 版式：左 PhotoCard 双卡（kahn_modern + cerf_2007，名单字压卡底）+ 右文献卡
 *       （1974 紫 Pill + 论文题打字机 + IEEE Transactions on Communications + RFC 793 · September 1981 徽章计数）。
 * 章界承接：C2 章节卡末帧 2221 上出 → 2222 一枚虚线 TCP 卡（SC10 同款 300×200 灰虚描边）自章节卡标题位
 *       kf 16 帧位移放大成文献卡位（覆盖层无 TCP 卡可共元素，近似承接，见 BUILD_NOTES）。
 * 零 glitch（白名单外）；无扫光。运镜 2420–2453 推近 1→1.1 指向文献卡（目标 (700,340)：
 * 推完后 Kahn 卡左缘仍有 ~22px 内边距，不裁切——复核修正，原 (858,334) 会把 Kahn 卡切掉 2/3）。
 * 末 8 帧归零（2501–2509，1974 Pill 先灭光）。出处行常驻 ≥75 帧（2230–2509 ≈ 280 帧，22px 灰 0.85α）。
 */
const F0 = 2222;
const T_BEAT1 = 2230;   // PhotoCard + 文献卡
const T_PILL = 2285;    // 1974 Pill + 打字机
const T_RFC = 2400;     // RFC 徽章 + 1981 计数
const T_PUSH = 2420;    // 推近起点
const T_EXIT = 2529; // 成片 v4：对齐注册区间末端（原 2509；区间已扩到 2529）

const CARD = {x: 620, y: 168, w: 540, h: 344}; // 文献卡
const PHOTO = [
  {src: 'kahn_modern.jpg', x: 138, y: 198, w: 206, h: 268, name: 'Bob Kahn', t: 2230},
  {src: 'cerf_2007.jpg', x: 366, y: 236, w: 206, h: 268, name: 'Vint Cerf', t: 2232},
];
const TITLE_L1 = 'A Protocol for Packet';
const TITLE_L2 = 'Network Intercommunication';
const JOURNAL = 'IEEE Transactions on Communications';

export const SC11: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const ex = exitOp(N, T_EXIT, 8);
  const pillGlowK = glowOffK(N, T_EXIT, 6, 8) * clamp01((N - T_PILL - 16) / 8); // 落位后点亮，离场前先灭光

  // 章界承接：虚线 TCP 卡（SC10 同款 300×200 灰虚描边）→ 文献卡位
  const mc = kf(N, [[2222, 0], [2238, 1]], easeInOutPow(2.5));
  const dashX = 640 + (CARD.x + CARD.w / 2 - 640) * mc;
  const dashY = 372 + (CARD.y + CARD.h / 2 - 372) * mc;
  const dashW = 300 + (CARD.w - 300) * mc;
  const dashH = 200 + (CARD.h - 200) * mc;
  const dashOp = N < 2222 ? 0 : N < 2230 ? firstDash(N - 2222) : Math.max(0, 1 - (N - 2230) / 10);

  // 文献卡（2230 起 slideUp Δ56 + 淡入）
  const cn = N - T_BEAT1;
  const cardY = CARD.y + 56 * Math.pow(1 - clamp01(cn / 22), 2.5);
  const cardOp = cn < 0 ? 0 : fadeIn(cn, 8);

  // 1974 Pill：缩放入场 + 紫光呼吸
  const pn = N - T_PILL;
  const pScale = 0.55 + 0.45 * scaleIn(pn);
  const breathe = 1 + 0.12 * Math.sin((2 * Math.PI * (N - 24)) / 30);

  // 论文题打字机（每 2 帧 1 字，跨两行）
  const chars = Math.max(0, Math.floor((N - T_PILL - 6) / 2));
  const t1 = TITLE_L1.slice(0, Math.min(chars, TITLE_L1.length));
  const t2 = chars > TITLE_L1.length ? TITLE_L2.slice(0, chars - TITLE_L1.length) : '';
  const typeDone = chars >= TITLE_L1.length + TITLE_L2.length;
  const cursorOn = pn >= 0 && !typeDone && Math.floor((N - T_PILL) / 8) % 2 === 0;

  // RFC 徽章 + 1981 计数
  const rn = N - T_RFC;
  const rScale = 0.6 + 0.4 * scaleIn(rn);
  const year = rn < 4 ? 0 : Math.round(1981 * (1 - Math.pow(1 - clamp01((rn - 4) / 12), 2)));
  const flash = rn >= 16 && rn < 22 ? 1.6 - 0.6 * Math.abs((rn - 19) / 3) : 1; // 落位边框白闪

  return (
    <CameraRig N={N} keys={[{f: F0, x: 640, y: 360, s: 1}, {f: T_PUSH, x: 640, y: 360, s: 1}, {f: T_PUSH + 33, x: 700, y: 340, s: 1.1}]}>
      {/* 承接虚线 TCP 卡（章节卡 → 文献卡） */}
      {dashOp > 0.01 ? (
        <div style={{...abs(dashX - dashW / 2, dashY - dashH / 2, dashW, dashH), opacity: dashOp}}>
          <Box x={0} y={0} w={dashW} h={dashH} r={10} stroke={mc > 0.9 ? PURPLE_LIGHT : GREY_MID} sw={2.5} dashed fill="rgba(0,0,0,0.6)" opacity={0.9} />
          <CText cx={dashW / 2} cy={dashH / 2} size={Math.min(56, dashH * 0.28)} weight={900} color={GREY} opacity={0.55 * (1 - mc * 0.6)} letterSpacing={4}>TCP</CText>
        </div>
      ) : null}

      {/* 左：真实照片双卡 */}
      {PHOTO.map((p, i) => {
        const pn2 = N - p.t;
        if (pn2 < 0) return null;
        const dx = 140 * Math.pow(1 - clamp01(pn2 / 22), 2.5);
        const Ns = Math.min(N, T_EXIT - 30); // 成片 v3：末 30 帧扫描线停住（hold 稳定期）
        const scanP = ((Ns - p.t - 10) % 40 + 40) % 40 / 40; // 照片扫描线 40 帧循环
        return (
          <div key={p.src} style={{...abs(p.x - dx, p.y, p.w, p.h), opacity: ex * fadeIn(pn2, 6)}}>
            <PhotoCard x={0} y={0} w={p.w} h={p.h} src={p.src} scanP={scanP}>
              <div style={{...abs(10, p.h - 44, p.w - 20, 32), background: 'rgba(0,0,0,0.55)', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                <span style={{fontFamily: FONT_ORB, fontSize: 24, fontWeight: 700, color: WHITE, letterSpacing: 2, textShadow: '0 0 8px rgba(255,255,255,.4)'}}>{p.name}</span>
              </div>
            </PhotoCard>
          </div>
        );
      })}

      {/* 右：文献卡 */}
      {cardOp > 0 ? (
        <div style={{...abs(0, 0, 1280, 720), opacity: ex * cardOp}}>
          <div style={{...abs(CARD.x, cardY, CARD.w, CARD.h), filter: BLOOM_SOFT}}>
            <Box x={0} y={0} w={CARD.w} h={CARD.h} r={10} sw={2.5} fill="rgba(0,0,0,0.88)" />
            {/* 1974 Pill */}
            {pn >= 0 ? (
              <div style={{...abs(CARD.w / 2 - 100, 22, 200, 76), transform: `scale(${(pScale * breathe).toFixed(4)})`, transformOrigin: '50% 50%', boxShadow: glowPurpleS(pillGlowK)}}>
                <Pill x={0} y={0} w={200} h={76} r={38} fill={PURPLE} sw={2.5} text="1974" fontSize={48} weight={700} family={FONT_ORB} letterSpacing={4} style={{fontVariantNumeric: 'tabular-nums'}} />
              </div>
            ) : null}
            {/* 论文题两行（打字机） */}
            {pn >= 0 ? (
              <div style={{...abs(30, 118, CARD.w - 60, 80), fontFamily: FONT_HEAVY, fontSize: 26, fontWeight: 700, color: WHITE, lineHeight: '36px', textAlign: 'center', letterSpacing: 0.5}}>
                <div style={{position: 'relative', height: 36}}>{t1}<span style={{opacity: cursorOn ? 1 : 0, display: 'inline-block', width: 12, height: 26, background: WHITE, verticalAlign: '-4px', marginLeft: 3}} /></div>
                <div>{t2}</div>
              </div>
            ) : null}
            {/* 期刊 + 月份（打字机完成前后挂） */}
            <SoftIn N={N} f0={2386}>
              <CText cx={CARD.w / 2} cy={218} size={22} weight={500} color={GREY} letterSpacing={0.5}>{JOURNAL}</CText>
              <CText cx={CARD.w / 2} cy={252} size={22} weight={500} color={GREY_MID}>May 1974</CText>
            </SoftIn>
            {/* RFC 徽章（1981 计数） */}
            {rn >= 0 ? (
              <div style={{...abs(CARD.w / 2 - 195, 278, 390, 62), transform: `scale(${rScale.toFixed(4)})`, transformOrigin: '50% 50%', filter: flash > 1 ? `brightness(${flash})` : undefined}}>
                <Box x={0} y={0} w={390} h={62} r={8} sw={2.5} fill="#000" />
                <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, fontFamily: FONT_MONO, fontSize: 25, fontWeight: 700, color: WHITE, letterSpacing: 1}}>
                  <span>RFC 793</span>
                  <span style={{color: GREY}}>·</span>
                  <span>September {year || ''}</span>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </CameraRig>
  );
};
