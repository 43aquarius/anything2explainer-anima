import React from 'react';
import {useCurrentFrame} from 'remotion';
import {clamp01, easeInOutPow, powOutRemain} from '../../common';
import {CameraRig} from '../../fx';
import {CText, Check, GREY, GREY_MID, GREY_LIGHT, GREEN, WHITE, PURPLE_LIGHT, abs, SoftIn, softOp, firstOp, exitOp, glowOffK, scaleIn, Svg} from '../../ui';
import {EX, EarGlyph, DeviceGlyph, RouterGlyph, arcPath, pol} from './g2ui';

/**
 * SC04 先听 · N 603–779（第 2 章首镜，S06–S07）
 *   S06：631「So how does everyone」/ 654「not talk over each other?」
 *   S07：703「Before speaking,」/ 733「your device listens first.」
 * 版式：章首承接 = SC03 轮流环缩微左下角（路由器 + 三设备点 + 聚光弧轮换，灰阶 0.42）；
 *   中央侦听设备图（主角）：笔记本 310px + 顶部耳朵图标 + 耳上扇形「侦听扫描弧」（雷达式一去一回）
 *   + 扫描路径空气点微亮 + `quiet?` 随弧 → 扫描完成绿 Check + `clear`。
 * 节拍（尾部硬规则全守，末拍 734 ≤ TO−45=734）：
 *   603 缩微承接 firstOp；605 笔记本缩入 16f；631 问号 `?` SoftIn；654 `not talk over each other` SoftIn（问号调暗）；
 *   703 耳朵 draw-on 9f（S07 首块 +0）；710 扫描弧去 11f + 回 11f（=732 扫完，quiet? 随弧）；
 *   732 绿 Check draw-on 10f（S07 末块 −1）+ 734 `clear`；此后扫描弧低幅待机呼吸 ±4°。
 * 运镜：603→728 慢推 1→1.08（末 key = TO−51 ✓）。停留：段内不判（S07 末块 45）。末 5 帧归零、光先灭。
 * glitch：本镜零 glitch（白名单）。文本全部取自分镜表事实清单 SC04 行。
 */
const F0 = 603;
const TO = 779;
const T_MINI = 603, T_LAPTOP = 605, T_LABEL = 611, T_Q = 631, T_PHRASE = 654;
const T_EAR = 703, T_SCAN = 710, T_QUIET = 712, T_CHECK = 732, T_CLEAR = 734;

const LAPTOP = {cx: 640, cy: 470, w: 310};        // 主角（墨迹高 175px + 耳 + 扫描扇区 ≈ 420px 群组）
const EAR = {cx: 640, cy: 352, s: 46};            // 耳朵 = 扫描扇心（传感器在听）
const SCAN = {cx: 640, cy: 352, r: 112, spread: 78};
const MINI = {cx: 168, cy: 566};                  // SC03 轮流环缩微承接（左下角）
// 扫描路径空气点（角度/半径，扇区内确定性散布）
const DOTS: Array<{a: number; r: number}> = [
  {a: -52, r: 96}, {a: -33, r: 70}, {a: -18, r: 102}, {a: -2, r: 78}, {a: 14, r: 100}, {a: 32, r: 72}, {a: 50, r: 92},
];

/** 扫描角（自竖直向上起算 ±68°）：去 11f → 回 11f（停在 0°）→ 低幅待机呼吸 ±4°；dir 为扫描方向（拖尾用） */
const beamAng = (N: number): {th: number; dir: number} => {
  if (N < T_SCAN) return {th: -68, dir: 1};
  const n = N - T_SCAN;
  if (n < 11) return {th: -68 + 136 * easeInOutPow(2)(n / 11), dir: 1};
  if (n < 22) return {th: 68 * (1 - easeInOutPow(2)((n - 11) / 11)), dir: -1};
  return {th: 4 * Math.sin((2 * Math.PI * (n - 22)) / 56), dir: 0};
};

export const SC04: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const exit = exitOp(N, TO, 5);
  const gk = glowOffK(N, TO, 3, 5);

  const {th, dir} = beamAng(N);
  const scanDone = N >= T_SCAN + 22;

  // 问句两行：654 后问号调暗、703 后整体再压（注意力转向设备；8f 平滑）
  const dimQ = 1 - 0.45 * clamp01((N - T_PHRASE) / 8) - 0.15 * clamp01((N - T_EAR) / 8);
  const dimPh = 1 - 0.4 * clamp01((N - T_EAR) / 8);

  // 空气点：扫过时亮起 + 余辉 18f；扫完后保持 0.3 底亮（已确认安静）
  const dotLit = (a: number) => {
    if (N < T_SCAN) return 0;
    let best = 0;
    for (let m = 0; m <= 6; m++) {
      const d = Math.abs(beamAng(N - 3 * m).th - a);
      if (d < 15) best = Math.max(best, (1 - d / 15) * (1 - m / 7));
    }
    return Math.max(scanDone ? 0.3 : 0, best);
  };

  // quiet? 随弧移动；Check 出现后淡出
  const quietOp = softOp(N - T_QUIET, 8) * (1 - clamp01((N - T_CHECK) / 8));
  const [qx, qy] = pol(SCAN.cx, SCAN.cy, 96, th - 90);

  return (
    <CameraRig N={N} keys={[{f: F0, x: 640, y: 360, s: 1}, {f: 728, x: 640, y: 360, s: 1.08}]}>
      <div style={{...abs(0, 0, 1280, 720), opacity: exit}}>
        {/* 章首承接：SC03 轮流环缩微（路由器 + 三设备点 + 聚光弧轮换，低透明度静挂左下角） */}
        <div style={{
          ...abs(0, 0, 1280, 720), opacity: firstOp(N - T_MINI, 6) * 0.42,
          transformOrigin: `${MINI.cx}px ${MINI.cy}px`,
          transform: `scale(${(1 + 0.22 * powOutRemain(N - T_MINI, 10, 2.5)).toFixed(4)})`,
        }}>
          <RouterGlyph cx={MINI.cx} cy={MINI.cy} w={58} h={25} N={N} dim={0.55} led="active" />
          {[90, 210, 330].map((a) => {
            const [dx, dy] = pol(MINI.cx, MINI.cy, 37, a);
            return <div key={a} style={{...abs(dx - 4.5, dy - 4.5, 9, 9), borderRadius: '50%', background: '#000', border: '2px solid #A0A0A1'}} />;
          })}
          <Svg bloom={false} style={{opacity: gk}}>
            <path d={arcPath(MINI.cx, MINI.cy, 37, 74, ((N * 360) / 90) % 360)} fill="none" stroke={PURPLE_LIGHT} strokeWidth={3} opacity={0.75} strokeLinecap="round" />
          </Svg>
        </div>

        {/* 问句（631 `?` → 654 短语； thereafter 调暗） */}
        <SoftIn N={N} f0={T_Q} style={{opacity: exit}}>
          <CText cx={640} cy={168} size={54} weight={900} color={GREY} opacity={dimQ}>?</CText>
        </SoftIn>
        <SoftIn N={N} f0={T_PHRASE} style={{opacity: exit}}>
          <CText cx={640} cy={218} size={26} weight={600} color={GREY} opacity={dimPh}>not talk over each other</CText>
        </SoftIn>

        {/* 侦听扇区：扫描弧 + 拖尾 + 半径线 + 空气点（710 起一去一回，22f） */}
        {N >= T_SCAN ? (
          <Svg style={{opacity: exit}}>
            {/* 半径指示线（雷达式） */}
            {(() => {
              const [lx0, ly0] = pol(SCAN.cx, SCAN.cy, 44, th - 90);
              const [lx1, ly1] = pol(SCAN.cx, SCAN.cy, SCAN.r - 6, th - 90);
              return <line x1={lx0} y1={ly0} x2={lx1} y2={ly1} stroke={GREY_MID} strokeWidth={1.8} opacity={0.5} />;
            })()}
            {/* 拖尾（沿扫描方向后方两道渐弱弧） */}
            {dir !== 0 ? [7, 15].map((off, i) => (
              <path key={off} d={arcPath(SCAN.cx, SCAN.cy, SCAN.r - 4 - i * 5, SCAN.spread - 8, th - dir * off)} fill="none" stroke={PURPLE_LIGHT} strokeWidth={2.4} opacity={(0.4 - i * 0.18).toFixed(2)} strokeLinecap="round" />
            )) : null}
            {/* 主扫描弧（白、带光） */}
            <path d={arcPath(SCAN.cx, SCAN.cy, SCAN.r, SCAN.spread, th)} fill="none" stroke={WHITE} strokeWidth={3.2} opacity={0.95} strokeLinecap="round" />
            {/* 空气点 */}
            {DOTS.map((d, i) => {
              const lit = dotLit(d.a);
              if (lit <= 0.02) return null;
              const [px, py] = pol(SCAN.cx, SCAN.cy, d.r, d.a - 90);
              return (
                <g key={i} opacity={(lit * gk).toFixed(2)}>
                  <circle cx={px.toFixed(1)} cy={py.toFixed(1)} r={3.1} fill={lit > 0.55 ? WHITE : GREY_LIGHT} />
                  {lit > 0.55 ? <circle cx={px.toFixed(1)} cy={py.toFixed(1)} r={7} fill="none" stroke={WHITE} strokeWidth={1.2} opacity={0.5} /> : null}
                </g>
              );
            })}
          </Svg>
        ) : null}

        {/* quiet? 随弧（712 起，Check 出现即收） */}
        {quietOp > 0.02 ? (
          <div style={{...abs(0, 0, 1280, 720), opacity: quietOp}}>
            <CText cx={qx} cy={qy - 16} size={23} weight={600} color={GREY_LIGHT}>quiet?</CText>
          </div>
        ) : null}

        {/* 耳朵图标（703 draw-on 9f；此后常亮白——正在听） */}
        <EarGlyph cx={EAR.cx} cy={EAR.cy} s={EAR.s} p={clamp01((N - T_EAR) / 9)} lit={clamp01((N - T_EAR - 6) / 8)} glow opacity={exit} />

        {/* 扫描完成：绿 Check + clear（732 / 734） */}
        {N >= T_CHECK ? (
          <div style={{...abs(0, 0, 1280, 720), opacity: exit}}>
            <Check cx={742} cy={290} size={52} p={clamp01((N - T_CHECK) / 10)} opacity={gk} />
            <SoftIn N={N} f0={T_CLEAR} len={8} style={{opacity: gk}}>
              <CText cx={806} cy={296} size={26} weight={700} color={GREEN}>clear</CText>
            </SoftIn>
          </div>
        ) : null}

        {/* 主角：笔记本（605 缩入 16f + 白柔光） */}
        <div style={{...abs(0, 0, 1280, 720), opacity: firstOp(N - T_LAPTOP, 6)}}>
          <div style={{...abs(0, 0, 1280, 720), transform: `scale(${(0.88 + 0.12 * scaleIn(N - T_LAPTOP, 16)).toFixed(4)})`, transformOrigin: `${LAPTOP.cx}px ${LAPTOP.cy}px`}}>
            <DeviceGlyph cx={LAPTOP.cx} cy={LAPTOP.cy} w={LAPTOP.w} kind="laptop" glow={N < TO - 8} />
          </div>
        </div>
        <SoftIn N={N} f0={T_LABEL} style={{opacity: exit}}>
          <CText cx={640} cy={592} size={22} weight={600} color={GREY_LIGHT}>{EX.laptop}</CText>
        </SoftIn>
      </div>
    </CameraRig>
  );
};
