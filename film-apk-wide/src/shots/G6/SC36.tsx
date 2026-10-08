import React from 'react';
import {useCurrentFrame} from 'remotion';
import {clamp01, easeOutCubic, kf, powIn, powOutRemain, FONT_MONO} from '../../common';
import {CText, KeyGlyph, ParcelIcon, Box, Svg, Check, Cross, WHITE, GREY, PURPLE_LIGHT, ORANGE, CORAL, exitOp, glowOffK, softOp} from '../../ui';

/**
 * SC36 同钥匙才能更新 · N 5183–5328（S36 5191–5294 ¶：5191「You sign your own app,」/ 5229「and only the same key can ship an update.」）
 * 上半（正例）：`v1.0` 包裹 + 紫钥匙（same key）→ `v2.0` 更新卡自右滑入叠加 + 绿 Check draw-on；
 * 下半（反例）：同款动作但灰钥匙（different key）→ 更新卡接近后被弹开（powIn 加速接近 → 白闪 → powOut 弹开）+ 红 Cross + `signature mismatch`（橙打字机）；
 * 5229 起上排渐暗 38%（焦点移到下半），两行之间灰虚线分隔。
 * 段末（¶）：弹开/错误字落位 ~5267→离场 5321，hold 54 ≥30 ✓（分镜表「5296−8」为 S36.to+2 旧口径，按本片镜头末 8 帧执行）。末 8 帧归零。
 * 本镜零 glitch、零扫光。事实：research §4「更新必须同密钥：换签名无法覆盖安装」；v1.0/v2.0 为分镜表指定的示意版本号（非事实数字）。
 */
const F0 = 5183, TO = 5328;
const B_SIGN = 5191, B_CARD1 = 5200, B_CHECK = 5216, B_BOT = 5229, B_APPR = 5237, B_REJ = 5251, B_ERR = 5257;

const TOP = {py: 245, ky: 248, cw: 700, cy: 245};
const BOT = {py: 465, ky: 468, cy: 465};

/** 更新卡：`v2.0` + 上箭头（黑底白边小卡，配角尺寸） */
const UpdCard: React.FC<{cx: number; cy: number; opacity?: number; rotate?: number; flash?: number}> = ({cx, cy, opacity = 1, rotate = 0, flash = 0}) => (
  <div
    style={{
      position: 'absolute',
      left: cx - 70,
      top: cy - 40,
      width: 140,
      height: 80,
      opacity,
      transform: rotate ? `rotate(${rotate.toFixed(2)}deg)` : undefined,
      filter: flash > 0 ? `brightness(${(1 + 0.6 * flash).toFixed(2)})` : undefined,
    }}
  >
    <Box x={0} y={0} w={140} h={80} r={8} sw={2.5} />
    <CText cx={60} cy={40} size={30} weight={700} family={FONT_MONO} color={WHITE}>
      v2.0
    </CText>
    <svg width={140} height={80} viewBox="0 0 140 80" style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
      <path d="M108,62 L108,20 M100,28 L108,18 L116,28" fill="none" stroke={WHITE} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  </div>
);

export const SC36: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const op = exitOp(N, TO, 8);
  if (op <= 0) return null;
  const gk = glowOffK(N, TO, 6);

  // 上排（正例）：包裹 + 紫钥匙 + 标签
  const topOp = softOp(N - B_SIGN, 8) * (1 - 0.38 * clamp01((N - B_BOT) / 10));
  // 更新卡 1：自右滑入（Δ240 / 16f powOut）
  const dx1 = 240 * powOutRemain(N - B_CARD1, 16, 2.5);
  const card1Op = softOp(N - B_CARD1, 6);
  const checkP = clamp01((N - B_CHECK) / 12);

  // 下排（反例）
  const botOp = softOp(N - B_BOT, 8);
  const divOp = softOp(N - (B_BOT + 2), 10);
  // 更新卡 2：powIn 加速接近 → 白闪 2f → powOut 弹开 + 左倾
  const apprX = kf(N, [[B_APPR, 950], [B_REJ, 660]], powIn(2.2));
  const bounceX = kf(N, [[B_REJ, 660], [B_REJ + 14, 802]], easeOutCubic);
  const c2x = N < B_REJ ? apprX : bounceX;
  const c2rot = kf(N, [[B_REJ, 0], [B_REJ + 14, -10]], easeOutCubic);
  const c2Op = softOp(N - B_APPR, 6);
  const flash = N >= B_REJ && N < B_REJ + 3 ? 1 - (N - B_REJ) * 0.33 : 0;
  const crossP = clamp01((N - B_REJ) / 12);
  const errText = N < B_ERR ? '' : 'signature mismatch'.slice(0, Math.floor((N - B_ERR) / 2));

  return (
    <div style={{position: 'absolute', inset: 0, opacity: op}}>
      {/* 上排：v1.0 包裹 + 紫钥匙（same key）+ 更新卡 + 绿 Check */}
      <div style={{position: 'absolute', inset: 0, opacity: topOp}}>
        {N >= B_SIGN ? (
          <>
            <ParcelIcon cx={300} cy={TOP.py} w={140} h={100} label={'v1.0'} />
            <KeyGlyph cx={480} cy={TOP.ky} w={150} color={PURPLE_LIGHT} glow />
            <CText cx={480} cy={322} size={22} weight={600} color={GREY} opacity={softOp(N - (B_SIGN + 4), 8)}>
              same key
            </CText>
          </>
        ) : null}
        {card1Op > 0 ? (
          <div style={{position: 'absolute', inset: 0, opacity: card1Op, transform: `translateX(${dx1.toFixed(1)}px)`}}>
            <UpdCard cx={TOP.cw} cy={TOP.cy} />
          </div>
        ) : null}
        {checkP > 0 ? <Check cx={700} cy={163} size={54} p={checkP} /> : null}
      </div>

      {/* 两行分隔虚线 */}
      {divOp > 0 ? (
        <Svg bloom={false} opacity={divOp}>
          <line x1={170} y1={350} x2={1110} y2={350} stroke={GREY} strokeWidth={1.5} strokeDasharray="10 12" opacity={0.5} />
        </Svg>
      ) : null}

      {/* 下排：v1.0 包裹 + 灰钥匙（different key）→ 更新卡被弹开 + Cross + signature mismatch */}
      {botOp > 0 ? (
        <div style={{position: 'absolute', inset: 0, opacity: botOp}}>
          <ParcelIcon cx={300} cy={BOT.py} w={140} h={100} label={'v1.0'} />
          <KeyGlyph cx={480} cy={BOT.ky} w={150} color={GREY} />
          <CText cx={480} cy={542} size={22} weight={600} color={GREY} opacity={softOp(N - (B_BOT + 4), 8)}>
            different key
          </CText>
          {c2Op > 0 ? <UpdCard cx={c2x} cy={BOT.cy} opacity={c2Op} rotate={c2rot} flash={flash} /> : null}
          {crossP > 0 ? <Cross cx={660} cy={BOT.cy} size={60} color={CORAL} p={crossP} /> : null}
          {errText ? (
            <CText cx={805} cy={560} size={24} weight={700} color={ORANGE} shadow={`0 0 10px rgba(240,95,65,${(0.55 * gk).toFixed(2)})`}>
              {errText}
            </CText>
          ) : null}
        </div>
      ) : null}
    </div>
  );
};

export default SC36;
