import React from 'react';
import {useCurrentFrame} from 'remotion';
import {GlitchIn, easeInOutPow, clamp01, kf, FONT_MONO, powOutRemain} from '../../common';
import {CText, MonoText, Pill, Box, PURPLE, PURPLE_LIGHT, GREY, GREY_LINE, WHITE, softOp, fadeIn, exitOp, glowOffK, abs} from '../../ui';
import {CameraRig, GradBall, Sparkle} from '../../fx';
import {BrowserEnd, RackEnd, Envelope, qBez, END_FULL, END_BADGE} from './parts';

/**
 * SC09 ClientHello · N 1669–1810（S12 1677–1808：1677「浏览器发出 ClientHello」/ 1737「密码套件清单和一份 key-share」）
 * 画面：双端缩到两端角（承接不清场）+ 中央大 hello 卡（480×300：卡头 ClientHello + 5 枚密码套件胶囊 + key_share 紫虚线块 + GradBall）
 *       + 卡右缘小信封轮廓 → 飞向右端服务器（ kf 弧线 26 帧，落位指示灯亮 1 颗）。
 * 节拍：1669 双端 16 帧缩到两端角（相机 1.05→1.0 同步收）；1677 卡自左 slideIn（Δ240，18 帧）+ 卡头 GlitchIn（rgbSplit 4，本镜唯一）；
 *       1699 信封起飞（26 帧，运镜跟随卡位移：1→1.15，1737 前结束）；1725 机架灯 +1；1737 胶囊 2 帧错峰 SoftIn + key_share 紫光点亮
 *       + GradBall 轨道点旋转（持续）+ 胶囊微呼吸（错峰）。
 * 停留：段内不判。双端角标不随末 8 帧离场（SC10 首帧同参数承接）。
 */
const F0 = 1669;
const TO = 1810;
const EASEIO = easeInOutPow(2.5);
// 信封飞行：卡右缘 → 机架角标
const FLY: [[number, number], [number, number], [number, number]] = [[884, 464], [1042, 432], [1126, 252]];

const PILLS: Array<[string, number, number, number]> = [
  // [text, x, y, w] —— 行 1 y 316 / 行 2 y 368，高 40
  ['TLS 1.3', 420, 316, 124],
  ['AES-128-GCM', 558, 316, 177],
  ['X25519', 749, 316, 111],
  ['SHA-256', 436, 368, 124],
  ['CHACHA20_POLY1305', 574, 368, 270],
];

export const SC09: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const exOp = exitOp(N, TO, 8);
  // 双端缩角（1669–1685）：SC08 末态 → 角标
  const sk = EASEIO(clamp01((N - 1669) / 16));
  const b = {
    x: kf(N, [[1669, END_FULL.browser.x], [1685, END_BADGE.browser.x]]),
    y: kf(N, [[1669, END_FULL.browser.y], [1685, END_BADGE.browser.y]]),
    s: kf(N, [[1669, END_FULL.browser.s], [1685, END_BADGE.browser.s]]),
  };
  const r = {
    cx: kf(N, [[1669, END_FULL.rack.cx], [1685, END_BADGE.rack.cx]]),
    cy: kf(N, [[1669, END_FULL.rack.cy], [1685, END_BADGE.rack.cy]]),
    w: kf(N, [[1669, END_FULL.rack.w], [1685, END_BADGE.rack.w]]),
    h: kf(N, [[1669, END_FULL.rack.h], [1685, END_BADGE.rack.h]]),
  };
  const badgeOp = 0.88 + 0.12 * (1 - sk);
  const labelOp = kf(N, [[1669, 1], [1677, 0]]);
  // 机架灯：1（承接）→ 信封到达 1725 后 2
  const arrived = N >= 1725;
  const lit = arrived ? 2 : 1;
  // hello 卡（自左 slideIn Δ240）
  const cn = N - 1677;
  const cardX = 400 - 240 * powOutRemain(cn, 18, 2.5);
  const cardOp = fadeIn(cn, 6);
  // 信封飞行
  const fn = N - 1699;
  const flyT = EASEIO(clamp01(fn / 26));
  const envPos = qBez(flyT, FLY[0], FLY[1], FLY[2]);
  const envOp = fn < 0 ? 0 : fn <= 26 ? fadeIn(fn, 4) : Math.max(0, 1 - (fn - 26) / 6);
  // key_share 紫光 + 呼吸
  const ksK = clamp01((N - 1737) / 8) * glowOffK(N, TO, 6, 8);
  const orbit = 2 * Math.PI * (N / 36); // 轨道点旋转（持续动作）

  return (
    <CameraRig N={N} keys={[
      {f: 1669, x: 640, y: 360, s: 1.05},
      {f: 1685, x: 640, y: 360, s: 1},
      {f: 1699, x: 640, y: 360, s: 1},
      {f: 1712, x: 700, y: 355, s: 1.08},
      {f: 1732, x: 640, y: 345, s: 1.15},
    ]}>
      {/* 双端（SC08 末态承接 → 缩到两端角，不清场） */}
      <BrowserEnd x={b.x} y={b.y} s={b.s} op={badgeOp} />
      <RackEnd cx={r.cx} cy={r.cy} w={r.w} h={r.h} units={5} lit={lit} labelOp={labelOp} op={badgeOp} />
      {arrived && fn < 40 ? (
        <Sparkle cx={r.cx - r.w / 2 - 6} cy={r.cy - r.h / 2 + 8} r={12} opacity={Math.max(0, 1 - (N - 1725) / 14)} color={PURPLE_LIGHT} />
      ) : null}

      {/* hello 卡 */}
      <div style={{position: 'absolute', inset: 0, opacity: cardOp * exOp, transform: `translateX(${(cardX - 400).toFixed(1)}px)`}}>
        <Box x={400} y={220} w={480} h={300} r={12} stroke={WHITE} sw={2.5} />
        <GlitchIn N={N} f0={1677} rgbSplit={4} seed={12}>
          <CText cx={640} cy={268} size={48} weight={900} color={WHITE} letterSpacing={1}
            style={{WebkitTextStroke: `2px ${PURPLE}`, paintOrder: 'stroke fill', textShadow: '0 0 18px rgba(102,45,248,.35)'}}>ClientHello</CText>
        </GlitchIn>
        {/* 分隔线 */}
        <div style={{...abs(424, 296, 432, 1.5), background: GREY_LINE, opacity: 0.7 * softOp(N - 1737, 8)}} />
        {/* 密码套件胶囊（2 帧错峰 SoftIn + 微呼吸） */}
        {PILLS.map(([t, px, py, pw], i) => {
          const pN = N - (1737 + i * 2);
          if (pN < 0) return null;
          const br = 1 + 0.016 * Math.sin((2 * Math.PI * (N - 1737 - i * 2)) / 46);
          return (
            <div key={t} style={{position: 'absolute', inset: 0, opacity: softOp(pN, 8) * exOp}}>
              <div style={{position: 'absolute', inset: 0, transformOrigin: `${px + pw / 2}px ${py + 20}px`, transform: `scale(${br.toFixed(4)})`}}>
                <Pill x={px} y={py} w={pw} h={40} r={20} fill="#000" stroke={GREY_LINE} sw={1.5} text={t} fontSize={22} family={FONT_MONO} weight={500} color={GREY} textDy={0} letterSpacing={0} />
              </div>
            </div>
          );
        })}
        {/* key_share 钥匙材料块（紫虚线框 + 渐变球 + 轨道点 + 蚂蚁线） */}
        <div style={{position: 'absolute', inset: 0, opacity: exOp}}>
          <Box x={560} y={424} w={120} h={80} fill="rgba(102,45,248,0.08)" stroke="none" sw={0} opacity={softOp(N - 1737, 8)} glow={ksK > 0.01 ? `0 0 24px 8px rgba(102,45,248,${(0.6 * ksK).toFixed(3)})` : undefined} />
          <svg width={128} height={88} viewBox="0 0 128 88" style={{...abs(556, 420), overflow: 'visible', opacity: softOp(N - 1737, 8)}}>
            <rect x={1.5} y={1.5} width={125} height={85} rx={6} fill="none" stroke={PURPLE_LIGHT} strokeWidth={2} strokeDasharray="9 7" strokeDashoffset={-((N * 0.8) % 16)} />
          </svg>
          {N >= 1737 ? (
            <>
              <GradBall cx={618} cy={464} r={15} />
              {[0, Math.PI].map((ph0, i) => (
                <div key={i} style={{...abs(618 + Math.cos(orbit + ph0) * 26 - 3, 464 + Math.sin(orbit + ph0) * 26 - 3, 6, 6), borderRadius: '50%', background: PURPLE_LIGHT, boxShadow: '0 0 8px 2px rgba(102,45,248,.7)'}} />
              ))}
              <MonoText x={700} y={450} size={22} color={PURPLE_LIGHT}>key_share</MonoText>
            </>
          ) : null}
        </div>
        {/* 卡右缘信封轮廓（起飞前静置） */}
        {fn < 0 ? <Envelope cx={884} cy={464} w={44} opacity={softOp(N - 1690, 8) * exOp} /> : null}
      </div>

      {/* 飞行的信封（卡 → 机架角标） */}
      {envOp > 0.01 ? <Envelope cx={envPos[0]} cy={envPos[1]} w={44} tilt={8} opacity={envOp * exOp} accent /> : null}
    </CameraRig>
  );
};
