import React from 'react';
import {useCurrentFrame} from 'remotion';
import {clamp01, GlitchIn, powOutRemain, FONT_MONO} from '../../common';
import {CText, Pill, EXAMPLE, WHITE, GREY, PURPLE_LIGHT, exitOp, glowOffK, softOp, firstOp} from '../../ui';
import {CameraRig, HeroGlow} from '../../fx';
import {ManifestCardV, MagnifierV} from './g2ui';

/**
 * SC07 读面单 · N 1061–1243（S07 1069–1221 ¶：1069 读面单 / 1109 二进制 manifest·权限·屏幕·版本）
 * 居中大 ManifestCard（x 120–600，y 420–960，卡顶 `AXML · binary` 徽标，binary 为本镜唯一 glitch
 * rgbSplit 4）+ 卡左上小放大镜 slideIn；1069 卡 slideUp（Δ90）；1109 四行字段逐行 reveal
 * （8 帧错峰、每行 10 帧上浮淡入，permission 行 k 列橙色）；读取光标逐行下移（持续动作，末行闪烁）。
 * 运镜：1.0→1.05 慢推贯穿（竖版慢推例外）。
 * 主角：面单卡 540px 高；光：卡 HeroGlow（呼吸）。
 * 停留：段末 ¶，末行落位 1133 → 离场 1235，102 帧 ≥30 ✓。
 */
export const F0 = 1061;
const TO = 1243;
const B_CARD = 1069, B_BADGE = 1069, B_MAG = 1071, B_ROW0 = 1109;
const ROW_STEP = 8; // 行距错峰；末行落位 1109 + 3*8 + 10 = 1143 ≈ 1109+24（分镜停留口径）

const CARD = {x: 120, y: 420, w: 480, h: 540};
const ROWS_Y = [548, 662, 776, 890];
const ROWS = EXAMPLE.manifestRows;

export const SC07: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const op = exitOp(N, TO, 8);
  if (op <= 0) return null;
  const gk = glowOffK(N, TO, 6, 8);

  // 卡 slideUp（Δ90 ≤100，22 帧，1069–1091）+ 首帧即亮
  const cn = N - B_CARD;
  const cardDy = cn < 0 ? 90 : 90 * powOutRemain(cn, 22, 2.5);
  const cardOp = cn < 0 ? 0 : firstOp(cn, 6);

  // 徽标 / 放大镜
  const badgeOp = N >= B_BADGE ? softOp(N - B_BADGE, 8) : 0;
  const magDx = 60 * powOutRemain(N - B_MAG, 18, 2.5);

  // 四行逐行 reveal（每行 10 帧上浮淡入，8 帧错峰）
  const rowOp = ROWS.map((_, i) => {
    const t = N - (B_ROW0 + i * ROW_STEP);
    return t <= 0 ? 0 : t / 10;
  });

  // 读取光标：随行揭示逐行下移，末行常驻闪烁（持续动作）
  const curRow = N < B_ROW0 ? -1 : Math.min(ROWS.length - 1, Math.floor((N - B_ROW0) / ROW_STEP));
  const blinkOn = N % 26 < 19;

  return (
    <CameraRig N={N} keys={[{f: F0, x: 360, y: 690, s: 1}, {f: TO, x: 360, y: 690, s: 1.05}]}>
      <div style={{position: 'absolute', inset: 0, opacity: op}}>
        {/* 卡主角光（呼吸，随离场先灭） */}
        <div style={{position: 'absolute', inset: 0, transform: `translateY(${cardDy.toFixed(1)}px)`, opacity: cardOp}}>
          <HeroGlow x={CARD.x} y={CARD.y} w={CARD.w} h={CARD.h} r={14} N={N} k={clamp01(cardOp) * gk} />
          <ManifestCardV
            x={CARD.x}
            y={CARD.y}
            w={CARD.w}
            h={CARD.h}
            title="AndroidManifest.xml"
            rows={ROWS}
            rowsY={ROWS_Y}
            rowOp={rowOp}
            cursorRow={curRow}
            blinkOn={blinkOn}
            glowK={gk}
          />

          {/* 卡顶徽标：AXML ·（白）+ binary（GlitchIn rgbSplit 4 = 本镜唯一 glitch） */}
          {badgeOp > 0 ? (
            <div style={{position: 'absolute', inset: 0, opacity: badgeOp}}>
              <Pill x={235} y={397} w={250} h={46} r={23} fill="#000" stroke={WHITE} sw={2.5} />
              <CText cx={304} cy={420} size={26} weight={600} family={FONT_MONO} color={WHITE} letterSpacing={1} dy={0}>AXML ·</CText>
            </div>
          ) : null}
          <GlitchIn N={N} f0={B_BADGE + 2} rgbSplit={4} seed={7} style={{opacity: op}}>
            <CText cx={418} cy={420} size={26} weight={600} family={FONT_MONO} color={PURPLE_LIGHT} letterSpacing={1} dy={0}>binary</CText>
          </GlitchIn>

          {/* 卡左上放大镜（侧向滑入 Δ60，静止读卡） */}
          <MagnifierV cx={148 + magDx} cy={412} r={24} opacity={softOp(N - B_MAG, 8)} />
        </div>
      </div>
    </CameraRig>
  );
};

export default SC07;
