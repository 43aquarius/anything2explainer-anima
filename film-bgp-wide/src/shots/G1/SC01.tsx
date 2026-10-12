import React from 'react';
import {useCurrentFrame} from 'remotion';
import {clamp01, powOutRemain, GlitchIn, BEZ_SCALE_IN, kf, FONT_TECH} from '../../common';
import {CameraRig, GlowBlob} from '../../fx';
import {CText, SoftIn, Svg, BrowserWin, MapFrame, AsChip, GREY, GREY_LIGHT, WHITE, ORANGE, PURPLE_LIGHT, abs, fadeIn, exitOp, glowOffK, EXAMPLE} from '../../ui';
import {qbez} from './g1ui';

/**
 * SC01 消失之夜（78–317）。S01 + S02。高光时刻·事件型开场（路由溶解 + 灯灭）。
 * 节拍：86 浏览器 slideUp Δ110/22f + url 逐字打字（2f/字，88 起）+ 地图框左→右 wipe draw-on（90 起 20f）
 *       ｜156 大 AsChip `AS32934` 缩入（21f）+ 路由线 draw-on（162+4i，各 18f）+ 芯片灯亮紫
 *       ｜217 路由线逐条溶解（dashes 消散，4f 间隔，碎片向框边漂散）+ 灯紫→灰 + `Facebook` 标签淡出
 *       ｜283 框外用户点重试弧错峰亮起（持续动作，36f 循环）+ 载入条卡住抖动 2 次 + 橙色警示三角 GlitchIn(4)
 * 运镜：1.0→1.06 慢推贯穿（内容留 x 89–1191 / y 122–607）。停留：段内不判。
 * 主角：浏览器+地图组 340px（浏览器白柔光；芯片紫 GlowBlob→灭；警示三角橙光）。
 */
const F0 = 78;
const TO = 317;

const BR = {x: 125, y: 175, w: 290, h: 235}; // 浏览器 0.62×（470×380 × .62）
const FRAME = {cx: 880, cy: 360, w: 560, h: 400}; // 地图框
const CHIP = {cx: 838, cy: 322, r: 75}; // AS32934 大芯片（框上）
const URL0 = 88; // 打字起点

/** 四条亮紫路由线：框边锚点 → 芯片边缘（控制点垂直外弓） */
const LINES = ([
  {a: [690, 160], bow: 34},
  {a: [1160, 310], bow: -30},
  {a: [880, 560], bow: -34},
  {a: [600, 430], bow: 30},
] as Array<{a: number[]; bow: number}>).map((l) => {
  const dx = l.a[0] - CHIP.cx, dy = l.a[1] - CHIP.cy;
  const d = Math.hypot(dx, dy);
  const ux = dx / d, uy = dy / d;
  const e = [CHIP.cx + ux * CHIP.r, CHIP.cy + uy * CHIP.r];
  const mx = (l.a[0] + e[0]) / 2, my = (l.a[1] + e[1]) / 2;
  return {p0: l.a, p1: [mx - uy * l.bow, my + ux * l.bow], p2: e};
});

/** 框外用户点（各带重试脉冲弧；you = 观众位） */
const DOTS: Array<{x: number; y: number; you?: boolean}> = [
  {x: 700, y: 132},
  {x: 964, y: 128},
  {x: 1185, y: 305},
  {x: 1182, y: 470},
  {x: 912, y: 588},
  {x: 566, y: 436, you: true},
];

const SEGS = 14; // 每线路由线段数

export const SC01: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const exit = exitOp(N, TO, 8);
  const heroK = glowOffK(N, TO); // 浏览器白柔光先灭再淡出

  // ---- 浏览器（86 slideUp Δ110/22f；url 打字 88 起 2f/字；载入条 116 起爬到 55% 卡住）----
  const bn = N - 86;
  const brDy = 110 * powOutRemain(bn, 22, 2.5);
  const brOp = fadeIn(bn, 6);
  const typed = Math.max(0, Math.min(EXAMPLE.domain.length, Math.floor((N - URL0) / 2)));
  const barBase = 0.55 * clamp01((N - 116) / 64);
  const bump = (f: number) => 0.028 * Math.sin(Math.PI * clamp01((N - f) / 5)); // 载入条卡住抖动
  const barP = Math.min(0.62, barBase + bump(283) + bump(293));

  // ---- 地图框（90 左→右 wipe draw-on 20f）----
  const frameP = clamp01((N - 90) / 20);
  const frameOp = fadeIn(N - 90, 6);

  // ---- 大芯片（156 缩入 21f；灯 164 亮紫 → 217 灰；标签 217 淡出）----
  const chipS = 0.55 + 0.45 * BEZ_SCALE_IN(clamp01((N - 156) / 21));
  const chipOp = fadeIn(N - 156, 5);
  const chipDim = 1 - 0.14 * clamp01((N - 217) / 10);
  const chipGlowK = kf(N, [[156, 0], [164, 1], [217, 1], [223, 0]]);
  const ledK = N < 217 ? clamp01((N - 164) / 6) : 1 - clamp01((N - 217) / 6);
  const fbOp = N < 217 ? clamp01((N - 160) / 8) : 1 - clamp01((N - 217) / 12);

  // ---- 警示三角（283 GlitchIn rgbSplit 4，白名单）----
  const warnGlow = glowOffK(N, TO, 6, 8);

  /** 一条路由线的全部可见段（draw-on 自框边；溶解自芯片端，碎片漂散） */
  const lineSegs = (li: number): React.ReactNode[] => {
    const L = LINES[li];
    const dp = clamp01((N - (162 + 4 * li)) / 18);
    const di = 217 + 4 * li;
    const out: React.ReactNode[] = [];
    for (let j = 0; j < SEGS; j++) {
      if (dp * SEGS < j + 1) break;
      const a = qbez(L.p0, L.p1, L.p2, j / SEGS);
      const b = qbez(L.p0, L.p1, L.p2, (j + 1) / SEGS);
      const vAt = di + ((SEGS - 1 - j) / SEGS) * 12; // 该段溶解帧（芯片端先散）
      if (N < vAt) {
        out.push(<line key={j} x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke={PURPLE_LIGHT} strokeWidth={4} strokeLinecap="round" />);
      } else {
        const lt = clamp01((N - vAt) / 8);
        if (lt < 1) {
          const mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2;
          const ddx = mx - CHIP.cx, ddy = my - CHIP.cy;
          const dd = Math.hypot(ddx, ddy) || 1;
          const off = 10 * lt;
          out.push(
            <line key={j} x1={a[0] + (ddx / dd) * off} y1={a[1] + (ddy / dd) * off} x2={b[0] + (ddx / dd) * off} y2={b[1] + (ddy / dd) * off} stroke={PURPLE_LIGHT} strokeWidth={3} strokeLinecap="round" opacity={((1 - lt) * 0.75).toFixed(3)} />,
          );
        }
      }
    }
    return out;
  };

  return (
    <CameraRig N={N} keys={[{f: F0, x: 640, y: 360, s: 1}, {f: TO, x: 640, y: 360, s: 1.06}]}>
      <div style={abs(0, 0, 1280, 720)}>
        <div style={{...abs(0, 0, 1280, 720), opacity: exit}}>
          {/* ---- 地图框（wipe draw-on）---- */}
          <div style={{...abs(0, 0, 1280, 720), opacity: frameOp, clipPath: `inset(0 ${(100 - 100 * frameP).toFixed(1)}% 0 0)`}}>
            <MapFrame cx={FRAME.cx} cy={FRAME.cy} w={FRAME.w} h={FRAME.h} />
          </div>

          {/* ---- 四条亮紫路由线（draw-on → 溶解）---- */}
          <Svg bloom={false} style={{filter: 'drop-shadow(0 0 5px rgba(161,117,241,.75))'}}>
            {LINES.map((_, li) => lineSegs(li))}
          </Svg>

          {/* ---- 大芯片 AS32934（主角右半：紫 GlowBlob + 灯）---- */}
          <GlowBlob cx={CHIP.cx} cy={CHIP.cy} r={108} N={N} k={chipGlowK * 0.9} />
          <div style={{...abs(0, 0, 1280, 720), opacity: chipOp * chipDim, transform: `scale(${chipS.toFixed(4)})`, transformOrigin: `${CHIP.cx}px ${CHIP.cy}px`}}>
            <AsChip cx={CHIP.cx} cy={CHIP.cy} w={150} h={150} asn={EXAMPLE.asnFb} led="off" />
          </div>
          {/* 状态灯（紫 → 灰；AsChip 内灯位 (100,100)/120 viewBox） */}
          {ledK > 0.02 ? (
            <Svg bloom={false}>
              <circle cx={888} cy={372} r={6.4} fill={PURPLE_LIGHT} opacity={ledK.toFixed(3)} style={{filter: `drop-shadow(0 0 ${6 + 6 * ledK}px rgba(161,117,241,.9))`}} />
            </Svg>
          ) : null}
          {/* `Facebook` 标签（217 淡出，仅剩 AS32934） */}
          <div style={{...abs(0, 0, 1280, 720), opacity: fbOp}}>
            <CText cx={CHIP.cx} cy={418} size={24} weight={600} family={FONT_TECH} color={GREY}>Facebook</CText>
          </div>

          {/* ---- 框外用户点 + 重试脉冲弧（283 起错峰，持续动作）---- */}
          <Svg bloom={false}>
            {DOTS.map((d, i) => {
              const dop = fadeIn(N - (162 + 2 * i), 6);
              if (dop <= 0) return null;
              return <circle key={`d${i}`} cx={d.x} cy={d.y} r={5} fill="#000" stroke={GREY_LIGHT} strokeWidth={2.2} opacity={dop.toFixed(3)} />;
            })}
            {DOTS.map((d, i) => {
              const rp = N - 283 - 4 * i;
              if (rp < 0) return null;
              const ph = rp % 36;
              if (ph >= 28) return null;
              const t = ph / 28;
              return (
                <g key={`r${i}`}>
                  <circle cx={d.x} cy={d.y} r={6 + 18 * t} fill="none" stroke={GREY_LIGHT} strokeWidth={2.2} opacity={(0.7 * (1 - t)).toFixed(3)} />
                </g>
              );
            })}
          </Svg>
          <SoftIn N={N} f0={168}>
            <CText cx={DOTS[5].x} cy={DOTS[5].y + 38} size={22} weight={600} color={GREY}>you</CText>
          </SoftIn>

          {/* ---- 浏览器（主角左半：白柔光）---- */}
          <div style={{...abs(0, 0, 1280, 720), opacity: brOp, transform: `translateY(${brDy.toFixed(1)}px)`}}>
            <div
              style={{
                ...abs(BR.x - 10, BR.y - 6, BR.w + 20, BR.h + 30),
                borderRadius: 18,
                boxShadow: `0 0 14px 4px rgba(255,255,255,${(0.15 * heroK).toFixed(3)}), 0 0 46px 16px rgba(255,255,255,${(0.11 * heroK).toFixed(3)})`,
              }}
            />
            <BrowserWin x={BR.x} y={BR.y} w={BR.w} h={BR.h} url={EXAMPLE.domain} typed={typed} skeleton={0} barP={barP} />
          </div>

          {/* ---- 橙色警示三角（283 GlitchIn，白名单唯一 glitch）---- */}
          <GlitchIn N={N} f0={283} rgbSplit={4} seed={11}>
            <div style={{...abs(356, 214, 68, 68), filter: `drop-shadow(0 0 ${(10 + 14 * warnGlow).toFixed(0)}px rgba(240,95,65,${(0.4 + 0.35 * warnGlow).toFixed(2)}))`}}>
              <svg width={68} height={68} viewBox="0 0 68 68" style={{position: 'absolute', inset: 0}}>
                <polygon points="34,4 62,53 6,53" fill="rgba(240,95,65,.14)" stroke={ORANGE} strokeWidth={4} strokeLinejoin="round" />
                <text x={34} y={47} textAnchor="middle" fontFamily="'Orbitron',sans-serif" fontWeight={700} fontSize={26} fill={ORANGE}>!</text>
              </svg>
            </div>
          </GlitchIn>
        </div>
      </div>
    </CameraRig>
  );
};
