import React from 'react';
import {useCurrentFrame} from 'remotion';
import {clamp01, easeOutCubic, FONT_MONO, FONT_WIDE} from '../../common';
import {
  abs, Box, CText, exitAccel, exitOp, glowOffK, GREY_LINE, MonoText, ORANGE,
  PURPLE, PURPLE_DEEP, PURPLE_LIGHT, softOp, Svg, WHITE,
} from '../../ui';
import {CameraRig, GlowBlob} from '../../fx';

/**
 * SC19 契约 · N 4220–4407（S31 4228–4405，段内：S32 同段承接，段内不判）
 * 居中契约卡（560×340，y 200–540）：卡头 `THE CONTRACT`（Audiowide 48px）+ 三行条款打字机
 * （what you send / arrives complete / in order）→ 橙色条款 `— or the connection fails loudly` + 分隔线 wipe +
 * 右上角圆形蜡章 stampIn（1.4→1.0 + 落章白环 + 微震 4 帧）+ 蜡章光晕 30 帧呼吸。
 * 运镜：整镜 1.0→1.05 慢推（CameraRig 贯穿，允许进末拍）。零 glitch。
 * 持续：打字机逐字 + 光标闪烁 + 蜡章光晕呼吸。
 */
const F0 = 4220, TO = 4407;
const B_CARD = 4220;   // 卡 slideUp Δ100（22 帧）
const B_HEAD = 4228;    // 节拍 1：That's the contract → 卡头 SoftIn
const B_CLAUSE = 4264;  // 节拍 2：complete and in order → 三行打字机
const B_ORANGE = 4307;  // 节拍 3：or it failed → 橙条款 + 分隔线 + 蜡章
const EXIT = TO;        // 段内承接，末 8 帧归零（硬切前必须归零）

const CARD = {x: 360, y: 200, w: 560, h: 340};
const CLAUSES = [
  {text: 'what you send', f: 4264, cps: 1},
  {text: 'arrives complete', f: 4281, cps: 1},
  {text: 'in order', f: 4298, cps: 1},
];
const ORANGE_LINE = {text: '— or the connection fails loudly', f: B_ORANGE, cps: 1.5}; // 33 字 → 4356 打完
const DIVIDER = {x: 430, y: 458, w: 420};
const SEAL = {cx: 878, cy: 230, r: 45};
const CORNER = 26; // 四角装饰线

export const SC19: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const op = exitOp(N, TO, 8);
  const dy = exitAccel(Math.max(0, N - (EXIT - 8)), 0.4);
  const gk = glowOffK(N, TO);
  const breath = 0.5 + 0.5 * Math.sin((2 * Math.PI * N) / 30);

  // 卡片入场：自下滑入 Δ100 / 22 帧
  const cn = N - B_CARD;
  const cardOp = cn < 0 ? 0 : softOp(cn, 8);
  const cardY = 100 * Math.pow(1 - clamp01(cn / 22), 2.5);

  // 蜡章 stampIn：1.4→1.0（10 帧）→ 白环 + 微震（4 帧）
  const sn = N - (B_ORANGE + 6);
  const sealS = sn < 0 ? 0 : 1.4 - 0.4 * easeOutCubic(clamp01(sn / 10));
  const sealShake = sn > 10 && sn <= 14 ? 2.2 * Math.sin((sn - 10) * Math.PI) * (1 - (sn - 10) / 4) : 0;

  // 打字机行渲染（行内打字 + 末尾光标闪烁）
  const typed = (text: string, f: number, cps: number) => {
    const n = N - f;
    if (n < 0) return {shown: 0, done: false};
    const k = Math.floor(n * cps);
    return {shown: Math.min(text.length, k), done: k >= text.length};
  };

  return (
    <CameraRig N={N} keys={[{f: F0, x: 640, y: 370, s: 1}, {f: TO, x: 640, y: 370, s: 1.05}]}>
      <div style={{position: 'absolute', inset: 0, opacity: op, transform: `translateY(${dy.toFixed(2)}px)`}}>
        {/* 契约卡 */}
        <div style={{position: 'absolute', inset: 0, opacity: cardOp, transform: `translateY(${cardY.toFixed(2)}px)`}}>
          <Box x={CARD.x} y={CARD.y} w={CARD.w} h={CARD.h} sw={2.5} r={6} />
          {/* 四角装饰线 */}
          <Svg bloom={false}>
            {[[CARD.x + 12, CARD.y + 12, 1, 1], [CARD.x + CARD.w - 12, CARD.y + 12, -1, 1], [CARD.x + 12, CARD.y + CARD.h - 12, 1, -1], [CARD.x + CARD.w - 12, CARD.y + CARD.h - 12, -1, -1]].map(([mx, my, sx, sy], k) => (
              <path key={k} d={`M${mx + sx * CORNER},${my} L${mx},${my} L${mx},${my + sy * CORNER}`} fill="none" stroke={PURPLE_LIGHT} strokeWidth={2.5} opacity={softOp(N - (B_CARD + 8), 8) * 0.9 * gk} />
            ))}
          </Svg>

          {/* 卡头 */}
          <CText cx={605} cy={262} size={48} family={FONT_WIDE} weight={400} color={WHITE} letterSpacing={2}
            opacity={softOp(N - B_HEAD, 8)} shadow="0 0 18px rgba(255,255,255,.35)">THE CONTRACT</CText>

          {/* 三行条款（打字机） */}
          {CLAUSES.map((c, i) => {
            const {shown, done} = typed(c.text, c.f, c.cps);
            if (shown <= 0) return null;
            return (
              <MonoText key={i} x={430} y={322 + i * 44} size={26} color={WHITE} opacity={0.95}>
                {c.text.slice(0, shown)}
                {!done || (N - (c.f + c.text.length / c.cps)) < 30 ? <span style={{color: PURPLE_LIGHT, opacity: N % 16 < 8 ? 1 : 0.1}}>_</span> : null}
              </MonoText>
            );
          })}

          {/* 分隔线 wipe */}
          <div style={{...abs(DIVIDER.x, DIVIDER.y, DIVIDER.w * clamp01((N - B_ORANGE) / 14), 2), background: GREY_LINE}} />

          {/* 橙色条款（打字机） */}
          {(() => {
            const {shown, done} = typed(ORANGE_LINE.text, ORANGE_LINE.f, ORANGE_LINE.cps);
            if (shown <= 0) return null;
            return (
              <MonoText x={402} y={478} size={24} color={ORANGE} opacity={0.98}>
                {ORANGE_LINE.text.slice(0, shown)}
                {!done ? <span style={{color: ORANGE, opacity: N % 16 < 8 ? 1 : 0.1}}>_</span> : null}
              </MonoText>
            );
          })()}
        </div>

        {/* 蜡章（右上角，紫）：stampIn + 白环 + 微震 + 光晕呼吸 */}
        {sn >= 0 ? (
          <>
            <GlowBlob cx={SEAL.cx} cy={SEAL.cy} r={SEAL.r + 26} N={N} k={0.55 * gk * (0.8 + 0.2 * breath)} alpha={0.5} />
            <div style={{...abs(SEAL.cx - SEAL.r * sealS, SEAL.cy - SEAL.r * sealS, SEAL.r * 2 * sealS, SEAL.r * 2 * sealS), transform: `translateX(${sealShake.toFixed(2)}px)`}}>
              <svg width={SEAL.r * 2 * sealS} height={SEAL.r * 2 * sealS} viewBox="0 0 90 90">
                <circle cx={45} cy={45} r={42} fill={PURPLE_DEEP} stroke={PURPLE_LIGHT} strokeWidth={2.5} />
                <circle cx={45} cy={45} r={34} fill="none" stroke={PURPLE} strokeWidth={2} strokeDasharray="3 4" opacity={0.9} />
                {/* 内嵌信封纹章（全片母题） */}
                <rect x={26} y={32} width={38} height={26} fill="#000" stroke={WHITE} strokeWidth={2.2} />
                <path d="M26 58 L45 42 L64 58" fill="none" stroke={WHITE} strokeWidth={2.2} strokeLinejoin="round" />
              </svg>
            </div>
            {/* 落章白环 */}
            {sn >= 10 && sn < 18 ? (
              <Svg>
                <circle cx={SEAL.cx} cy={SEAL.cy} r={SEAL.r + 6 + (sn - 10) * 7} fill="none" stroke={WHITE} strokeWidth={3}
                  opacity={0.85 * (1 - (sn - 10) / 8)} />
              </Svg>
            ) : null}
          </>
        ) : null}
      </div>
    </CameraRig>
  );
};
