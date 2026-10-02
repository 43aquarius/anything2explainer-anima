import React from 'react';
import {useCurrentFrame} from 'remotion';
import {clamp01, easeInOutPow, kf} from '../../common';
import {abs, Check, CText, GREY, GREEN, Pill, PURPLE, SoftIn, WHITE, exitOp, firstOp, scaleIn} from '../../ui';
import {PermitCard, tri} from './g3ui';

/**
 * SC11 许可 · N 1772–1852（S12 1780–1840：1780 只抓授权的，段末 ¶+gap）
 * 版式：中央许可状卡（440×300，(360,560)）：`authorized` 紫 Pill + 签名线 + 大章（scale 1.3→1 落章 +
 *   白闪）+ 绿 Check（draw-on 12 帧）+ 卡边框绿光点亮；卡下小字 `get permission first` 灰。
 * 节拍：1780 卡缩放入场（21 帧）+ 签名线 draw-on；1782 authorized Pill SoftIn；1790 章落（10 帧）→
 *   1800 白闪 + stampLit；1792–1804 绿 Check draw-on；1804–1812 边框绿光点亮（末拍）。
 * 停留：段末 ¶+gap，Check 落位 1804 → 离场 1844，40 帧 ✓。末 8 帧归零。零 glitch（白名单 SC11 无）。
 * 主角：许可状 300px；光：章紫光 / Check 绿 / 边框绿光。运镜：无。
 */
const F0 = 1772, TO = 1852;
const T_CARD = 1780, T_PILL = 1782, T_STAMP = 1790, T_CHECK = 1792, T_GREEN = 1804, T_TXT = 1788;
const CARD = {cx: 360, cy: 560, w: 440, h: 300};
const STAMP_FLASH = T_STAMP + 10;

export const SC11: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const op = exitOp(N, TO, 8);
  const cardN = N - T_CARD;
  const cardS = cardN < 0 ? 0 : 0.7 + 0.3 * scaleIn(cardN);
  // 章落：1.3 → 1（10 帧）
  const stampS = kf(N, [[T_STAMP, 1.3], [T_STAMP + 10, 1]], easeInOutPow(2.5));
  const stampFlash = tri(N - STAMP_FLASH, 8);
  const checkP = clamp01((N - T_CHECK) / 12);
  const greenK = clamp01((N - T_GREEN) / 8);
  return (
    <div style={{position: 'absolute', inset: 0, opacity: op}}>
      {/* ===== 许可状卡（缩放入场 + 章落白闪） ===== */}
      <div style={{position: 'absolute', inset: 0, opacity: firstOp(cardN, 8), transform: cardS >= 1 ? undefined : `scale(${cardS.toFixed(4)})`, transformOrigin: '360px 560px', filter: stampFlash > 0 ? `brightness(${(1 + 0.6 * stampFlash).toFixed(2)})` : undefined}}>
        <PermitCard cx={CARD.cx} cy={CARD.cy} w={CARD.w} h={CARD.h} p={clamp01(cardN / 14)} stampK={clamp01((N - T_STAMP) / 8)} stampS={stampS} stampLit={N >= STAMP_FLASH} glow={N >= T_CARD + 10} />
        {/* authorized 紫 Pill */}
        <SoftIn N={N} f0={T_PILL}>
          <Pill x={CARD.cx - 110} y={CARD.cy - CARD.h / 2 + 14} w={220} h={44} fill={PURPLE} sw={2.5} text="authorized" fontSize={26} weight={700} textDy={0} glow="0 0 20px 5px rgba(102,45,248,.45)" />
        </SoftIn>
        {/* 绿 Check（签名线右侧，draw-on 12 帧） */}
        <Check cx={CARD.cx + 80} cy={CARD.cy + 95} size={50} p={checkP} />
      </div>
      {/* 卡边框绿光（Check 落位后点亮） */}
      {greenK > 0 ? (
        <div style={{...abs(CARD.cx - CARD.w / 2 - 3, CARD.cy - CARD.h / 2 - 3, CARD.w + 6, CARD.h + 6), borderRadius: 8, border: `2.5px solid ${GREEN}`, opacity: greenK * 0.9, boxShadow: `0 0 ${Math.round(18 * greenK)}px ${Math.round(4 * greenK)}px rgba(143,247,64,.35)`}} />
      ) : null}
      {/* 卡下小字 */}
      <SoftIn N={N} f0={T_TXT}>
        <CText cx={360} cy={CARD.cy + CARD.h / 2 + 52} size={26} weight={500} color={GREY} letterSpacing={2}>
          get permission first
        </CText>
      </SoftIn>
    </div>
  );
};
