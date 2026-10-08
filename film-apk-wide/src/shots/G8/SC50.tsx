import React from 'react';
import {useCurrentFrame} from 'remotion';
import {GlitchIn, clamp01, easeOutCubic, emphasisPulse, kf, powIn, FONT_MONO, FONT_ORB} from '../../common';
import {CText, Box, GREY_LINE, GREY_MID, PURPLE, PURPLE_LIGHT, WHITE, abs, exitOp, firstOp, glowOffK, glowPurpleS, softOp, slideUp, TEXT_GLOW} from '../../ui';

/**
 * SC50 2021 强制 · N 7431–7616（S50 7439–7579：7439「Since August 2021,」/ 7499「every new app on the Play Store」/ 7549「has to use one.」¶+gap15）
 * 中央日历卡（440–840 × 200–440，白边 + 顶部年份条 + 4×3 月格）：7439 卡 slideUp Δ100/22f + `2021` 年份计数 2018→2021（14f）
 *   + **GlitchIn rgbSplit 5（本镜唯一 glitch，给 `2021`）** + AUG 格紫底高亮 wipe 12f + 紫光呼吸（主角光）；
 * 7495–7499 三枚 app 图标（白边圆）SoftIn 于卡下 → 7499/7524/7549 逐一 kf 跳入 AUG 格（14f powIn 下落弧，末段缩成小点「被收纳」），
 *   每次落格 AUG 白闪 3f + 卡微脉冲。末 8 帧归零（AUG 紫光先灭）。
 * 停留：末枚图标落位 7563 → 离场 7608（TO−8），45f ≥30 ✓（¶）。
 */
const F0 = 7431, TO = 7616;
const B1 = 7439, B2 = 7499, B3 = 7549;

const CARD = {x: 440, y: 200, w: 400, h: 240};
const YEAR_T0 = 7443, YEAR_LEN = 16; // 计数 2018→2021
const AUG_WIPE = 7452;

// 月格：4 列 × 3 行（AUG = 第 8 格，行 1 列 3）
const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
const CELL = {w: 82, h: 50, gx: 10, gy: 10};
const GRID_X0 = CARD.x + 21, GRID_Y0 = CARD.y + 60;
const AUG_IDX = 7; // MONTHS[7] === 'AUG'
const AUG_C = {
  x: GRID_X0 + (AUG_IDX % 4) * (CELL.w + CELL.gx) + CELL.w / 2,
  y: GRID_Y0 + Math.floor(AUG_IDX / 4) * (CELL.h + CELL.gy) + CELL.h / 2,
};

// 三枚 app 图标：卡下等待位 → 跳入 AUG 格内小点位
const ICONS = [
  {sx: 560, slot: AUG_C.x - 16},
  {sx: 640, slot: AUG_C.x},
  {sx: 720, slot: AUG_C.x + 16},
];
const ICON_Y = 505;
const JUMP_T = [B2, B2 + 25, B3]; // 起跳帧（节拍 7499 / 7524 / 7549）
const JUMP_LEN = 14;

export const SC50: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const exOp = exitOp(N, TO, 8);
  if (exOp <= 0) return null;
  const glowK = glowOffK(N, TO, 6, 8);

  // ---- 日历卡：slideUp Δ100 / 22f ----
  const cn = N - B1;
  const cardDy = cn < 0 ? 100 : slideUp(cn, 100, 22);
  const cardOp = (cn < 0 ? 0 : firstOp(cn, 6)) * exOp;

  // 年份：计数 2018→2021（落到 2021）
  const yearVal = Math.round(kf(N, [[YEAR_T0, 2018], [YEAR_T0 + YEAR_LEN, 2021]]));

  // AUG 高亮 wipe + 紫光呼吸（主角光；末枚落格后幅度收敛 ±6%，给停留读数留稳定期）
  const augWipe = clamp01((N - AUG_WIPE) / 12);
  const bconv = 1 - 0.75 * clamp01((N - (JUMP_T[2] + JUMP_LEN)) / 7); // 7563 后 7 帧收敛到 25%
  const augGlowK = (0.62 + 0.24 * bconv * Math.sin((2 * Math.PI * N) / 30)) * clamp01((N - AUG_WIPE - 6) / 8) * glowK;

  // 卡微脉冲（每次落格 1.025 一轮，9 帧——末枚 7563+9=7572 前结束，保 ≥30f 稳定期）
  const landPulse = ICONS.reduce(
    (m, _c, i) => Math.max(m, emphasisPulse(N - (JUMP_T[i] + JUMP_LEN), {peak: 1.025, up: 4, hold: 1, down: 4})),
    1,
  );

  // AUG 白闪：最近一次落格后 3f
  const augFlash = ICONS.reduce((m, _c, i) => {
    const ln = N - (JUMP_T[i] + JUMP_LEN);
    return ln >= 0 && ln < 3 ? Math.max(m, 1 - ln / 3) : m;
  }, 0);

  // 图标跳入：powIn 下落 + 上抛弧线，末段缩成小点
  const iconAnim = (i: number) => {
    const jn = N - JUMP_T[i];
    if (jn < 0) return null;
    const t = clamp01(jn / JUMP_LEN);
    const tx = ICONS[i].sx + (ICONS[i].slot - ICONS[i].sx) * t;
    const ty = ICON_Y + (AUG_C.y - ICON_Y) * powIn(1.5)(t) - 86 * Math.sin(Math.PI * Math.pow(t, 0.9));
    const r = 26 - 18.5 * easeOutCubic(Math.max(0, (t - 0.35) / 0.65)); // 26 → 7.5
    const landed = jn >= JUMP_LEN;
    const squash = landed && jn < JUMP_LEN + 3 ? 1 - 0.16 * (1 - (jn - JUMP_LEN) / 3) : 1;
    return {x: landed ? ICONS[i].slot : tx, y: landed ? AUG_C.y : ty, r: landed ? 7.5 : r, squash, landed};
  };

  return (
    <div style={{position: 'absolute', inset: 0, opacity: exOp}}>
      {cn >= 0 ? (
        <div style={{position: 'absolute', inset: 0, opacity: cardOp, transform: `scale(${landPulse.toFixed(4)})`, transformOrigin: '640px 320px'}}>
          {/* 卡体 + 年份条分隔线 */}
          <Box x={CARD.x} y={CARD.y + cardDy} w={CARD.w} h={CARD.h} r={12} sw={2.5} fill="rgba(0,0,0,0.92)" />
          <div style={{...abs(CARD.x + 3, CARD.y + cardDy + 52, CARD.w - 6, 0), borderTop: `2px solid ${GREY_LINE}`}} />

          {/* 年份条：2021 计数落位 + GlitchIn（本镜唯一 glitch） */}
          <GlitchIn N={N} f0={B1 + 4} rgbSplit={5} seed={50}>
            <CText cx={640} cy={CARD.y + cardDy + 26} size={34} weight={700} family={FONT_ORB} letterSpacing={3} color={WHITE} shadow={glowK > 0.02 ? TEXT_GLOW : undefined}>
              {`${yearVal}`}
            </CText>
          </GlitchIn>

          {/* 12 月格 */}
          {MONTHS.map((m, i) => {
            const cx = GRID_X0 + (i % 4) * (CELL.w + CELL.gx) + CELL.w / 2;
            const cy = GRID_Y0 + Math.floor(i / 4) * (CELL.h + CELL.gy) + CELL.h / 2 + cardDy;
            const isAug = i === AUG_IDX;
            return (
              <div key={m} style={{...abs(cx - CELL.w / 2, cy - CELL.h / 2, CELL.w, CELL.h)}}>
                <div style={{position: 'absolute', inset: 0, borderRadius: 6, border: `1.5px solid ${isAug ? PURPLE_LIGHT : GREY_LINE}`}} />
                {isAug ? (
                  <>
                    <div style={{position: 'absolute', inset: 0, borderRadius: 6, background: PURPLE, transformOrigin: '0% 50%', transform: `scaleX(${augWipe.toFixed(3)})`, opacity: 0.88}} />
                    {augFlash > 0 ? <div style={{position: 'absolute', inset: 0, borderRadius: 6, background: '#FFF', opacity: Number((0.85 * augFlash).toFixed(2))}} /> : null}
                    {augGlowK > 0.02 ? <div style={{position: 'absolute', inset: -4, borderRadius: 9, boxShadow: glowPurpleS(Number(augGlowK.toFixed(3)))}} /> : null}
                  </>
                ) : null}
                <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FONT_MONO, fontSize: 22, color: isAug ? WHITE : GREY_MID, textShadow: isAug ? TEXT_GLOW : 'none'}}>
                  {m}
                </div>
              </div>
            );
          })}

          {/* 已收纳图标小点（跳入后驻留 AUG 格） */}
          {ICONS.map((_c, i) => {
            const a = iconAnim(i);
            if (!a || !a.landed) return null;
            return <div key={`d${i}`} style={{...abs(a.x - 7.5, a.y - 7.5, 15, 15), borderRadius: '50%', border: `2px solid ${WHITE}`, background: '#000'}} />;
          })}
        </div>
      ) : null}

      {/* 跳入中的 app 图标（卡外 → AUG 格） */}
      {ICONS.map((_c, i) => {
        const appearN = N - (B2 - 4 + i * 2); // 7495/7497/7499 SoftIn（节拍 7499 −4 内）
        const a = iconAnim(i);
        if (appearN < 0 || !a || a.landed) return null;
        return (
          <div key={`i${i}`} style={{...abs(a.x - a.r, a.y - a.r * a.squash, 2 * a.r, 2 * a.r * a.squash), opacity: softOp(appearN, 6) * exOp}}>
            <div style={{position: 'absolute', inset: 0, borderRadius: '50%', border: `2.5px solid ${WHITE}`, background: 'rgba(0,0,0,0.9)'}} />
            <div style={{position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%,-50%)', width: a.r * 0.72, height: a.r * 0.72, borderRadius: 5, border: `2px solid ${WHITE}`}} />
          </div>
        );
      })}
    </div>
  );
};

export default SC50;
