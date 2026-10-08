import React from 'react';
import {useCurrentFrame} from 'remotion';
import {clamp01, emphasisPulse, powOutRemain, FONT_MONO, FONT_ORB} from '../../common';
import {countTo} from '../../fx';
import {CText, EXAMPLE, GREY, GREY_MID, PURPLE, PURPLE_LIGHT, WHITE, exitOp, glowOffK, softOp, glowPurpleS, mixHex, fadeIn} from '../../ui';

/**
 * SC44 65536 · N 6503–6748（S44 6511–6711 ¶+gap15：6511「A single dex file tops out」/ 6557「at 65,536 methods.」/ 6660「Big apps just carry more of them.」）
 * 6511 上方小字 `methods per dex`（灰 24px）SoftIn；6557 大数字 `65,536`（Orbitron 120px 白+紫投影，EXAMPLE.dexLimit）
 * 20 帧计数 0→65,536 → 6577 落定 + emphasisPulse 1.12 + 紫投影脉冲一次（偏移 6→10→6）→ 之后 tabular 呼吸微光（30f 周期）；
 * 6660 三枚 dex 卡（classes.dex / classes2.dex / classes3.dex，等宽 20px）2f 错峰 slideUp，逐张亮起（6674/6688/6702：
 * 灰边→紫边+紫光），每张亮起时上方浮出 `+65k` 灰小字渐隐（上浮 14px / 30f）。
 * 停留：段末（¶+gap15），末张卡亮起 6702+8 → 离场 6741（TO−8），hold ≥30 ✓（分镜表「6713−8」为 S44.to+2 旧口径，
 * 按镜头区间 6748 执行末 8 帧归零，与 G6 §A2 同例）。末 8 帧归零（G7b SC45 6749 起新场景）。
 */
const F0 = 6503;
const TO = 6748;
const B_CAP = 6511, B_NUM = 6557, B_CARDS = 6660;
const NUM_LAND = B_NUM + 20; // 6577 计数落定

const CARDS = [
  {cx: 400, label: 'classes.dex'},
  {cx: 640, label: 'classes2.dex'},
  {cx: 880, label: 'classes3.dex'},
];
const CARD_W = 200, CARD_H = 82, CARD_Y = 468;
const LIGHT0 = 6674, LIGHT_STEP = 14; // 逐张亮起：6674 / 6688 / 6702

export const SC44: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const op = exitOp(N, TO, 8);
  if (op <= 0) return null;
  const gk = glowOffK(N, TO, 6, 8);

  // 大数字：20f 计数 → 落定脉冲 + 投影脉冲一次 → tabular 呼吸微光（终值 = EXAMPLE.dexLimit）
  const numVal = N - B_NUM >= 20 ? EXAMPLE.dexLimit : countTo(N - B_NUM, 0, 65536, 20);
  const pulse = emphasisPulse(N - NUM_LAND, {peak: 1.12, up: 13, hold: 4, down: 13});
  const projK = Math.sin(Math.PI * clamp01((N - NUM_LAND) / 16)); // 投影偏移脉冲一次
  const off = 6 + 4 * projK;
  const breathe = 24 + 10 * Math.sin((2 * Math.PI * N) / 30);

  return (
    <div style={{position: 'absolute', inset: 0, opacity: op}}>
      {/* 上方小字 */}
      <div style={{position: 'absolute', inset: 0, opacity: softOp(N - B_CAP, 8)}}>
        <CText cx={640} cy={208} size={24} weight={600} color={GREY}>methods per dex</CText>
      </div>

      {/* 大数字（65,536 = EXAMPLE.dexLimit；紫硬投影 + 呼吸微光） */}
      {N >= B_NUM ? (
        <CText
          cx={640}
          cy={302}
          size={120}
          weight={700}
          family={FONT_ORB}
          color={WHITE}
          letterSpacing={2}
          style={{
            transform: `translate(-50%,-50%) scale(${pulse.toFixed(4)})`,
            fontVariantNumeric: 'tabular-nums',
            textShadow: `${off.toFixed(1)}px ${off.toFixed(1)}px 0 ${PURPLE}, 0 0 ${Math.round(breathe)}px rgba(102,48,248,${(0.45 * gk).toFixed(3)})`,
          }}
        >
          {numVal}
        </CText>
      ) : null}

      {/* 三枚 dex 卡：2f 错峰 slideUp + 逐张亮起（紫边 + 紫光）+ `+65k` 灰注浮出渐隐 */}
      {CARDS.map((c, i) => {
        const tIn = B_CARDS + i * 2;
        const tLight = LIGHT0 + i * LIGHT_STEP;
        const dy = 70 * powOutRemain(N - tIn, 16, 2.5);
        const inOp = softOp(N - tIn, 8);
        if (inOp <= 0) return null;
        const k = clamp01((N - tLight) / 8);
        const edge = mixHex(GREY_MID, PURPLE_LIGHT, k);
        // +65k 注：亮起时上方浮出，上浮 14px / 30f 渐隐
        const nn = N - tLight;
        const noteOp = nn < 0 ? 0 : fadeIn(nn, 4) * (1 - clamp01((nn - 6) / 24));
        return (
          <div key={i} style={{position: 'absolute', inset: 0, opacity: inOp, transform: `translateY(${dy.toFixed(1)}px)`}}>
            <div
              style={{
                position: 'absolute', left: c.cx - CARD_W / 2, top: CARD_Y, width: CARD_W, height: CARD_H,
                boxSizing: 'border-box', background: 'rgba(0,0,0,0.9)',
                border: `2.5px solid ${edge}`, borderRadius: 10,
                boxShadow: k > 0.02 ? glowPurpleS(k * gk) : 'none',
              }}
            />
            <CText cx={c.cx} cy={CARD_Y + CARD_H / 2} size={20} weight={600} family={FONT_MONO} color={WHITE}>{c.label}</CText>
            {noteOp > 0 ? (
              <div style={{position: 'absolute', inset: 0, opacity: noteOp, transform: `translateY(${(-14 * clamp01(nn / 30)).toFixed(1)}px)`}}>
                <CText cx={c.cx} cy={CARD_Y - 24} size={22} weight={700} family={FONT_ORB} color={GREY}>+65k</CText>
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
};

export default SC44;
