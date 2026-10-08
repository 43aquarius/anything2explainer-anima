import React from 'react';
import {useCurrentFrame} from 'remotion';
import {easeInOutPow, kf, FONT_HEAVY, FONT_ORB, textW} from '../../common';
import {CText, Pill, PURPLE, GREY, WHITE, abs, exitOp, firstOp, glowOffK, softOp, slideUp} from '../../ui';

/**
 * SC49 App Bundle · N 7327–7430（S49 7335–7428：7335「In 2018, Google announced the App Bundle.」单块）
 * 章节卡承接（同 G3/SC11 模式）：章节卡「Still a Zip」7262–7326 加速上出后，`2018`（Orbitron 84px 白 + 紫硬投影）
 *   首帧即出现在章节卡标题槽位 (640,372)（不清场），节拍 7335 起 kf 16 帧移到左上 (258,188)；
 *   中央大 Pill `Android App Bundle`（白边 460×108，36px 白字）自下 slideUp Δ110/22f + 边框白光呼吸（30f 周期，主角光）；
 *   Pill 下三枚小灰标签（base + splits / signed by Play / per device，灰 22px）2 帧错峰 SoftIn + 打字机（持续动作）。
 * 停留：段内不判（S49 非 ¶）。末 8 帧归零（Pill 白光先灭 6 帧）。零 glitch（本组 glitch 只给 SC50/SC54）。
 */
const F0 = 7327, TO = 7430;
const T_MOVE = 7335; // S49.c1 → `2018` kf 16 帧移到左上
const MOVE_LEN = 16;
const T_PILL = 7335; // Bundle Pill 自下滑入
const T_TAG = 7341; // 三枚小标签 2 帧错峰

const YEAR_FROM = {x: 640, y: 372}; // 章节卡标题槽位（ChapterCard title cy=372）
const YEAR_TO = {x: 258, y: 188};

const PILL = {cx: 640, cy: 330, w: 460, h: 108};
const TAG_Y = 448;

const TAGS = ['base + splits', 'signed by Play', 'per device'];
// 灰标签边框（比 GREY_LINE 亮一档、比 GREY 暗——「非重点」语义）
const GREY_LINE_DIM = '#5c5c5d';
// 标签盒宽 = 文本宽（textW 估宽）+ 36 padding
const TAG_W = TAGS.map((t) => Math.round(textW(t, 22) + 36));
const TAG_GAP = 36;
const TAG_X0 = 640 - (TAG_W.reduce((a, b) => a + b, 0) + TAG_GAP * 2) / 2;

export const SC49: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const exOp = exitOp(N, TO, 8);
  if (exOp <= 0) return null;
  const glowK = glowOffK(N, TO, 6, 8); // Pill 白光先灭

  // ---- 2018：首帧在场（章节卡槽位），7335 起 16 帧移到左上 ----
  const p = kf(N, [[F0, 0], [T_MOVE, 0], [T_MOVE + MOVE_LEN, 1]], easeInOutPow(2.5));
  const yx = YEAR_FROM.x + (YEAR_TO.x - YEAR_FROM.x) * p;
  const yy = YEAR_FROM.y + (YEAR_TO.y - YEAR_FROM.y) * p;
  const yearOp = firstOp(N - F0, 6) * exOp;
  const yearGlow = 0.30 + 0.14 * Math.sin((2 * Math.PI * N) / 30);
  const yearShadow = `5px 5px 0 ${PURPLE}, 0 0 16px rgba(102,45,248,${(yearGlow * glowK).toFixed(2)})`;

  // ---- Bundle Pill（主角）：slideUp Δ110 / 22f + 边框白光呼吸 ----
  const pn = N - T_PILL;
  const pillDy = pn < 0 ? 110 : slideUp(pn, 110, 22);
  const pillOp = (pn < 0 ? 0 : firstOp(pn, 6)) * exOp;
  const breathe = Math.sin((2 * Math.PI * N) / 30);
  const pillGlow = `0 0 ${(12 + 7 * breathe).toFixed(1)}px ${(3.5 + 2.2 * breathe).toFixed(1)}px rgba(255,255,255,${(0.22 + 0.13 * breathe).toFixed(2)})`;

  return (
    <div style={{position: 'absolute', inset: 0, opacity: exOp}}>
      {/* 2018（承接章节卡标题槽位 → 左上） */}
      <CText cx={yx} cy={yy} size={84} weight={700} family={FONT_ORB} letterSpacing={3} color={WHITE} opacity={yearOp} shadow={yearShadow}>{'2018'}</CText>

      {/* Bundle Pill（主角） */}
      {pn >= 0 ? (
        <div style={{position: 'absolute', inset: 0, opacity: pillOp}}>
          <Pill
            x={PILL.cx - PILL.w / 2}
            y={PILL.cy - PILL.h / 2 + pillDy}
            w={PILL.w}
            h={PILL.h}
            r={54}
            sw={2.5}
            text={'Android App Bundle'}
            fontSize={36}
            weight={700}
            letterSpacing={0.5}
            glow={glowK > 0.02 ? pillGlow : undefined}
          />
        </div>
      ) : null}

      {/* 三枚小标签：2 帧错峰 SoftIn + 打字机 */}
      {TAGS.map((t, i) => {
        const tn = N - (T_TAG + i * 2);
        if (tn < 0) return null;
        const dy = 10 * Math.pow(1 - Math.min(1, (tn + 1) / 9), 2.5);
        const chars = Math.max(0, Math.floor((N - (T_TAG + i * 2 + 6)) / 2));
        return (
          <div key={t} style={{position: 'absolute', inset: 0, opacity: softOp(tn, 8)}}>
            <div style={{...abs(TAG_X0 + TAG_W.slice(0, i).reduce((a, b) => a + b, 0) + i * TAG_GAP, TAG_Y + dy, TAG_W[i], 40)}}>
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  borderRadius: 18,
                  border: `1.8px solid ${GREY_LINE_DIM}`,
                  background: 'rgba(0,0,0,0.75)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <span style={{fontFamily: FONT_HEAVY, fontSize: 22, fontWeight: 600, color: GREY, whiteSpace: 'nowrap'}}>{t.slice(0, chars)}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default SC49;
