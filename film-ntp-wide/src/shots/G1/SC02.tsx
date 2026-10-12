import React from 'react';
import {useCurrentFrame} from 'remotion';
import {clamp01, powOutRemain, GlitchIn, kf, FONT_ORB, FONT_MONO, rnd} from '../../common';
import {CameraRig} from '../../fx';
import {CText, SoftIn, Svg, Check, GREY, GREY_MID, GREY_LIGHT, WHITE, CORAL, ORANGE, PURPLE_LIGHT, abs, fadeIn, exitOp, glowOffK, mixHex, EXAMPLE} from '../../ui';

/**
 * SC02 表可以错（352–554）。S04–S05：手表无妨 / 互联网不行 / 登录码 30 秒过期。
 * 节拍：360 左表 SoftIn（灰调慢针，持续 2°/帧）+ `fine` SoftIn + 绿 Check draw-on（10f）
 *       ｜419 `≠` GlitchIn（rgbSplit 4，白名单）+ 手机 slideUp Δ80/16f
 *       ｜480 码打字机入场（2f/字）+ 倒计圈走动（12°/帧，持续）+ `30 s` SoftIn
 *       ｜镜头中段演示一轮"过期换新"（前挂至 480 块内）：495 整圈红闪 4f → 499 旧码灰化+划除 → 503 新码滚入（509 落定）
 * 运镜：33f 1→1.12 推向手机（437–470，末 key ≤ TO−50 ✓；让开 419 的 GlitchIn/slideUp）。停留：段内不判（末拍簇 480–509，安静窗 509→546=37f）。
 * 主角：手机倒计环 300px（倒计圈紫光；`≠` 橙）。零扫光、无字幕。
 * 新码 `806 274` 为示意值（与 EXAMPLE.code 同性质的演示码，见 BUILD_NOTES）。
 */
const F0 = 352;
const TO = 554;

const WATCH = {cx: 300, cy: 318, r: 78}; // 左：手表简笔（灰调）
const NEQ = {cx: 640, cy: 318}; // 中缝：`≠`
const PHONE = {x: 745, y: 118, w: 270, h: 430}; // 右：手机
const CODE = {cx: 880, cy: 300, size: 40, r: 98}; // 码 + 倒计圈
const CODE2 = '806 274'; // 演示"换新"后的示意码

/** 手机边框的微弱白柔光（随离场先灭） */
const BLOOM_SAFE = (k: number) => `drop-shadow(0 0 4px rgba(255,255,255,${(0.18 * k).toFixed(2)}))`;

export const SC02: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const exit = exitOp(N, TO, 5);
  const gOff = glowOffK(N, TO, 3, 5);

  // ---- 手表（360 SoftIn；慢针 2°/帧持续）----
  const wtOp = fadeIn(N - 360, 8);
  const wtDy = 34 * powOutRemain(N - 360, 14, 2.5);
  const handA = (N * 2 - 90) * (Math.PI / 180);

  // ---- 手机（419 slideUp Δ80/16f）----
  const phOp = fadeIn(N - 419, 8);
  const phDy = 80 * powOutRemain(N - 419, 16, 2.5);

  // ---- 码（480 打字机 2f/字 → 494 满；499 灰化划除；503 滚入新码）----
  const typed = Math.max(0, Math.min(EXAMPLE.code.length, Math.floor((N - 480) / 2)));
  const greyK = kf(N, [[499, 0], [502, 1]]);
  const backK = kf(N, [[503, 0], [506, 1]]);
  const strikeP = clamp01((N - 499) / 4);
  const strikeOp = 1 - clamp01((N - 503) / 5);
  const rollOn = N >= 503 && N < 508;
  const codeStr = (() => {
    if (N < 499) return EXAMPLE.code.slice(0, typed);
    if (N < 503) return EXAMPLE.code;
    let out = '';
    for (let i = 0; i < CODE2.length; i++) {
      out += rollOn && CODE2[i] !== ' ' ? String(Math.floor(rnd(i * 7 + 1, Math.floor((N - 503) / 2)) * 10)) : CODE2[i];
    }
    return out;
  })();
  const codeColor = mixHex(WHITE, GREY, greyK * (1 - backK));

  // ---- 倒计圈（480 draw-on 10f → 12°/帧走动持续；495 整圈红闪 4f）----
  const ringOn = N >= 480;
  const C = 2 * Math.PI * CODE.r;
  const walk = 12 * Math.max(0, N - 480);
  const arcFrac = 300 * clamp01((N - 480) / 10) / 360;
  const redFlash = kf(N, [[495, 0], [496, 0.95], [499, 0]]);
  const whiteFlash = kf(N, [[495, 0], [496, 0.5], [499, 0]]);

  return (
    <CameraRig N={N} keys={[{f: F0, x: 640, y: 360, s: 1}, {f: 437, x: 640, y: 360, s: 1}, {f: 470, x: 730, y: 330, s: 1.12}]}>
      <div style={abs(0, 0, 1280, 720)}>
        <div style={{...abs(0, 0, 1280, 720), opacity: exit}}>
          {/* ---- 手表（灰调主角左翼）---- */}
          <div style={{...abs(0, 0, 1280, 720), opacity: wtOp, transform: `translateY(${wtDy.toFixed(1)}px)`}}>
            <Svg bloom={false}>
              <g stroke={GREY} strokeWidth={3} fill="#000" strokeLinejoin="round">
                <path d="M280,242 L290,204 H310 L320,242 Z" stroke={GREY_MID} />
                <path d="M280,394 L290,432 H310 L320,394 Z" stroke={GREY_MID} />
                <circle cx={WATCH.cx} cy={WATCH.cy} r={WATCH.r} />
                <rect x={377} y={310} width={9} height={16} rx={3} stroke={GREY_MID} strokeWidth={2.2} />
              </g>
              {Array.from({length: 12}, (_, i) => {
                const a = (i / 12) * Math.PI * 2;
                return <line key={i} x1={WATCH.cx + Math.cos(a) * 66} y1={WATCH.cy + Math.sin(a) * 66} x2={WATCH.cx + Math.cos(a) * 72} y2={WATCH.cy + Math.sin(a) * 72} stroke={GREY_MID} strokeWidth={i % 3 === 0 ? 3.4 : 2.2} />;
              })}
              <line x1={WATCH.cx} y1={WATCH.cy} x2={WATCH.cx + Math.cos(handA) * 52} y2={WATCH.cy + Math.sin(handA) * 52} stroke={GREY_LIGHT} strokeWidth={4} strokeLinecap="round" />
              <circle cx={WATCH.cx} cy={WATCH.cy} r={4} fill={GREY_LIGHT} />
            </Svg>
          </div>
          {/* `fine` + 绿 Check（360 块："手表无妨"） */}
          <SoftIn N={N} f0={362}>
            <CText cx={326} cy={486} size={26} weight={700} color={GREY_LIGHT}>fine</CText>
          </SoftIn>
          {clamp01((N - 366) / 10) > 0 ? (
            <Svg bloom={false}>
              <Check cx={248} cy={486} size={38} p={clamp01((N - 366) / 10)} sw={6} />
            </Svg>
          ) : null}

          {/* ---- 中缝 `≠`（419 GlitchIn，白名单）---- */}
          <GlitchIn N={N} f0={419} rgbSplit={4} seed={22}>
            <CText cx={NEQ.cx} cy={NEQ.cy} size={64} weight={700} family={FONT_ORB} color={ORANGE} shadow={`0 0 ${(14 + 10 * gOff).toFixed(0)}px rgba(240,95,65,${(0.35 + 0.3 * gOff).toFixed(2)})`}>{'\u2260'}</CText>
          </GlitchIn>

          {/* ---- 手机（主角右翼：倒计圈紫光）---- */}
          <div style={{...abs(0, 0, 1280, 720), opacity: phOp, transform: `translateY(${phDy.toFixed(1)}px)`}}>
            <div style={{...abs(PHONE.x, PHONE.y, PHONE.w, PHONE.h), boxSizing: 'border-box', background: '#000', border: `2.5px solid ${WHITE}`, borderRadius: 26, filter: BLOOM_SAFE(gOff)}} />
            {/* 听筒 + home 条 */}
            <div style={{...abs(850, 134, 60, 6), borderRadius: 3, border: `1.5px solid ${GREY_MID}`}} />
            <div style={{...abs(835, 528, 90, 5), borderRadius: 2.5, background: GREY_MID, opacity: 0.8}} />
            {/* 倒计圈（走动 = 持续动作） */}
            {ringOn ? (
              <svg width={270} height={430} viewBox="0 0 270 430" style={{position: 'absolute', left: PHONE.x, top: PHONE.y, overflow: 'visible'}}>
                <g transform={`rotate(${walk} 135 182)`} style={{filter: `drop-shadow(0 0 6px rgba(161,117,241,${(0.75 * gOff).toFixed(2)}))`}}>
                  {arcFrac > 0.005 ? <circle cx={135} cy={182} r={CODE.r} fill="none" stroke={PURPLE_LIGHT} strokeWidth={5} strokeLinecap="round" strokeDasharray={`${(C * arcFrac).toFixed(1)} ${C.toFixed(1)}`} transform="rotate(-90 135 182)" opacity={0.95} /> : null}
                </g>
                {redFlash > 0.01 ? <circle cx={135} cy={182} r={CODE.r} fill="none" stroke={ORANGE} strokeWidth={6} opacity={redFlash.toFixed(3)} style={{filter: 'drop-shadow(0 0 10px rgba(240,95,65,.9))'}} /> : null}
              </svg>
            ) : null}
            {/* 码（打字机 → 灰化划除 → 滚入新码） */}
            <CText cx={CODE.cx} cy={CODE.cy} size={CODE.size} weight={600} family={FONT_MONO} letterSpacing={2} color={codeColor}>{codeStr}</CText>
            {strikeP > 0 && strikeOp > 0.01 ? (
              <div style={{...abs(0, 0, 1280, 720), opacity: strikeOp.toFixed(3), clipPath: `inset(0 ${(100 - 100 * strikeP).toFixed(1)}% 0 0)`}}>
                <Svg bloom={false}>
                  <line x1={790} y1={300} x2={970} y2={300} stroke={CORAL} strokeWidth={5} strokeLinecap="round" />
                </Svg>
              </div>
            ) : null}
            {whiteFlash > 0.01 ? <div style={{...abs(PHONE.x + 6, PHONE.y + 6, PHONE.w - 12, PHONE.h - 12), borderRadius: 20, background: '#fff', opacity: whiteFlash.toFixed(3)}} /> : null}
            <SoftIn N={N} f0={482}>
              <CText cx={880} cy={428} size={24} weight={600} family={FONT_ORB} color={GREY}>{EXAMPLE.totp}</CText>
            </SoftIn>
          </div>
        </div>
      </div>
    </CameraRig>
  );
};
