import React from 'react';
import {useCurrentFrame} from 'remotion';
import {clamp01, kf, powOutRemain, emphasisPulse, easeOutCubic, easeInOutPow, GlitchIn, FONT_ORB, FONT_HEAVY} from '../../common';
import {CameraRig, GlowBlob, Vignette} from '../../fx';
import {SheepIcon, LockSeal, Box, Pill, CText, Svg, scaleIn, GREY, GREY_MID, GREY_LINE, WHITE, PURPLE, PURPLE_LIGHT, ORANGE, abs, fadeIn, exitOp, glowOffK, glowPurpleS} from '../../ui';
import {MouseCursor, GlobeIcon} from './g1ui';

/**
 * SC04 Firesheep（602–862）。S05（段末 ¶）。高光时刻·论点型（610 拍起编排 610–852 共 242 帧 ≥90）。
 * 节拍：610 `2010` 20 帧计数落定 + SheepIcon 缩放入场（21 帧）+ `Firesheep` Pill GlitchIn（rgbSplit 6，本镜唯一 glitch）
 *       + emphasisPulse｜684 侧栏面板 slideIn（Δ240 侧向 18 帧）+ 受害者行 2 帧错峰亮起
 *       ｜778 `bob` 行被"双击"：光标移入 + 行高亮脉冲 + 双击波纹两圈（12 帧）→ 行尾小锁被"拿走"
 *       （小锁从 bob 行飞向左侧羊，kf 20 帧弧线，827 落定）｜827 bob 行名字变 `attacker`（翻转 12 帧）
 *       + 羊头顶出现小锁（偷来的会话）+ 侧栏底部 `logged in as bob` SoftIn｜此后受害者行呼吸轮亮（40 帧周期）。
 * 运镜：33 帧 1→1.15 推向侧栏（706–739，778 前结束）。主角：SheepIcon+侧栏 360px（羊白描边 BLOOM + 紫光斑；侧栏无光）。
 */
const F0 = 602;
const TO = 912; // 段末跨 gap30 延伸到 SC05 首帧前（分镜表 v2）

// 左半
const YEAR = {cx: 250, cy: 166};
const SHEEP = {cx: 320, cy: 385, w: 260, h: 200};
const PILL = {x: 210, y: 227, w: 220, h: 46};
const LOCK_HOME = {cx: 445, cy: 296}; // 偷来的小锁停在羊头顶
// 右半（侧栏）
const SB = {x: 680, y: 170, w: 500, h: 360};
const ROWS = [
  {name: 'alice', y: 252},
  {name: 'bob', y: 320},
  {name: 'carol', y: 388},
  {name: 'dave', y: 456},
];
const CLICK = {x: 830, y: 320}; // 双击落点（bob 行名字上）
const LOCK_FROM = {cx: 1140, cy: 320}; // bob 行尾

/** 左锚单行文字 */
const LeftText: React.FC<{x: number; y: number; size: number; color: string; weight?: number; children: React.ReactNode; sx?: number; style?: React.CSSProperties}> = ({x, y, size, color, weight = 700, children, sx = 1, style}) => (
  <div style={{position: 'absolute', left: x, top: y - size / 2, display: 'flex', alignItems: 'center', height: size, transform: `scaleX(${sx.toFixed(3)})`, transformOrigin: '0 50%', whiteSpace: 'nowrap', ...style}}>
    <span style={{fontFamily: FONT_HEAVY, fontWeight: weight, fontSize: size, lineHeight: 1, color}}>{children}</span>
  </div>
);

export const SC04: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const exit = exitOp(N, TO, 10);
  const glowK = glowOffK(N, TO, 6, 10);

  // ---- 610：2010 计数（20 帧落定）----
  const year = Math.round(kf(N, [[610, 0], [630, 2010]], easeOutCubic));
  const yearOp = fadeIn(N - 610, 6);

  // ---- 610：羊缩放入场（21 帧）----
  const sheepS = scaleIn(N - 610);

  // ---- 610：Firesheep Pill GlitchIn + emphasisPulse（622 起）----
  const pillPulse = emphasisPulse(N - 622, {peak: 1.11});

  // ---- 684：侧栏 slideIn Δ240 / 18 帧；行 2 帧错峰亮起（696 起）----
  const sn = N - 684;
  const sbX = 240 * powOutRemain(sn, 18, 2.5);
  const sbOp = fadeIn(sn, 6);

  // ---- 778：光标移入（10 帧）→ 788/795 双击波纹两圈；bob 行高亮脉冲 ----
  const curT = clamp01((N - 778) / 10);
  const curX = 1150 + (CLICK.x - 1150) * easeInOutPow(2)(curT);
  const curY = 590 + (CLICK.y + 2 - 590) * easeInOutPow(2)(curT);
  const curOp = N < 778 ? 0 : clamp01((N - 778) / 4) * (1 - clamp01((N - 812) / 8));
  const ripple = (f0: number) => clamp01((N - f0) / 6);
  const rowPulse = N >= 788 ? Math.max(0, 1 - (N - 788) / 14) : 0;

  // ---- 800：小锁在 bob 行尾出现；807–827 弧线飞向羊；827 落定弹一下 ----
  const lockBorn = clamp01((N - 800) / 6);
  const lockFly = easeInOutPow(1.6)(clamp01((N - 807) / 20));
  const landed = N >= 827;
  const lockPop = 1 + 0.22 * (1 - clamp01((N - 827) / 8));
  // 二次贝塞尔弧线：P0 bob 行尾 → P1 高点 → P2 羊头顶
  const bez = (p0: number, p1: number, p2: number, t: number) => (1 - t) * (1 - t) * p0 + 2 * (1 - t) * t * p1 + t * t * p2;
  const lockX = bez(LOCK_FROM.cx, 790, LOCK_HOME.cx, lockFly);
  const lockY = bez(LOCK_FROM.cy, 192, LOCK_HOME.cy, lockFly);
  const lockTilt = 16 * Math.sin(Math.PI * lockFly);

  // ---- 827：bob → attacker（12 帧翻转）----
  const flipT = clamp01((N - 827) / 12);
  const isAttacker = flipT >= 0.5;
  const nameSx = Math.abs(1 - 2 * flipT);

  // ---- 843 起：受害者行呼吸轮亮（40 帧周期）----
  const rowShade = (i: number) => (N < 843 || N > 883 ? (N <= 883 ? 0 : Math.max(0, Math.sin(((883 - 843) / 40) * Math.PI * 2 - i * 1.57))) : Math.max(0, Math.sin(((N - 843) / 40) * Math.PI * 2 - i * 1.57))); // 一个周期后在 883 冻结

  // 运镜（706–739 推近 1.15）+ 暗角同步
  const vigK = clamp01((N - 706) / 18) * (1 - clamp01((N - 902) / 8));

  return (
    <>
      <CameraRig N={N} keys={[{f: F0, x: 640, y: 360, s: 1}, {f: 706, x: 640, y: 360, s: 1}, {f: 739, x: 690, y: 350, s: 1.15}]}>
        <div style={abs(0, 0, 1280, 720)}>
          <div style={{...abs(0, 0, 1280, 720), opacity: exit}}>
            {/* ---- 左半：2010 / Firefox extension ---- */}
            <div style={{...abs(0, 0, 1280, 720), opacity: yearOp}}>
              <CText cx={YEAR.cx} cy={YEAR.cy} size={64} weight={700} family={FONT_ORB} color={GREY} letterSpacing={2} style={{fontVariantNumeric: 'tabular-nums'}}>{year}</CText>
              <CText cx={YEAR.cx} cy={YEAR.cy + 46} size={22} weight={600} color={GREY}>Firefox extension</CText>
            </div>

            {/* ---- 左半：羊（主角，白描边 BLOOM + 紫光斑）---- */}
            <div style={{...abs(0, 0, 1280, 720), transformOrigin: `${SHEEP.cx}px ${SHEEP.cy}px`, transform: `scale(${sheepS.toFixed(3)})`}}>
              <GlowBlob cx={SHEEP.cx} cy={SHEEP.cy + 30} r={185} N={N} k={glowK * clamp01((N - 614) / 10)} />
              <SheepIcon cx={SHEEP.cx} cy={SHEEP.cy} w={SHEEP.w} h={SHEEP.h} glow />
            </div>

            {/* Firesheep Pill（GlitchIn rgbSplit 6 + emphasisPulse） */}
            <div style={{...abs(0, 0, 1280, 720), transformOrigin: `${PILL.x + PILL.w / 2}px ${PILL.y + PILL.h / 2}px`, transform: `scale(${pillPulse.toFixed(3)})`}}>
              <GlitchIn N={N} f0={610} rgbSplit={6}>
                <Pill x={PILL.x} y={PILL.y} w={PILL.w} h={PILL.h} fill={PURPLE} stroke={WHITE} sw={2} text="Firesheep" fontSize={26} weight={800} letterSpacing={1} glow={glowPurpleS(0.55 * glowK)} />
              </GlitchIn>
            </div>

            {/* ---- 右半：侧栏 people nearby（无光）---- */}
            <div style={{...abs(0, 0, 1280, 720), opacity: sbOp, transform: `translateX(${sbX.toFixed(1)}px)`}}>
              <Box x={SB.x} y={SB.y} w={SB.w} h={SB.h} r={10} fill="#000" stroke={GREY_LINE} sw={2} />
              <div style={{...abs(0, 0, 1280, 720), opacity: clamp01((N - 690) / 8)}}>
                <LeftText x={SB.x + 26} y={197} size={22} color={GREY} weight={600}>people nearby</LeftText>
              </div>
              {ROWS.map((r, i) => {
                const on = clamp01((N - (696 + i * 2)) / 8);
                return (
                  <div key={r.name} style={{...abs(0, 0, 1280, 720), opacity: on}}>
                    {/* 呼吸轮亮（843 起，40 帧周期滚动） */}
                    <div style={{...abs(SB.x + 20, r.y - 26, SB.w - 40, 52), background: `rgba(255,255,255,${(0.05 * rowShade(i)).toFixed(3)})`, borderRadius: 8}} />
                    <svg width={34} height={34} viewBox="0 0 34 34" style={{position: 'absolute', left: SB.x + 29, top: r.y - 17}}>
                      <circle cx={17} cy={17} r={14.5} fill="#000" stroke={GREY_MID} strokeWidth={2} />
                      <circle cx={17} cy={13} r={4.5} fill="none" stroke={GREY_MID} strokeWidth={2} />
                      <path d="M8.5 25 Q17 19.5 25.5 25" fill="none" stroke={GREY_MID} strokeWidth={2} strokeLinecap="round" />
                    </svg>
                    {r.name === 'bob' ? (
                      <LeftText x={SB.x + 82} y={r.y} size={26} color={isAttacker ? ORANGE : WHITE} weight={isAttacker ? 800 : 700} sx={nameSx}>{isAttacker ? 'attacker' : 'bob'}</LeftText>
                    ) : (
                      <LeftText x={SB.x + 82} y={r.y} size={26} color={WHITE} weight={700}>{r.name}</LeftText>
                    )}
                    <GlobeIcon cx={SB.x + 410} cy={r.y} r={13} color={GREY_MID} />
                  </div>
                );
              })}
              {/* bob 行选中态（双击后紫描边 + 脉冲） */}
              {N >= 788 ? (
                <Box x={SB.x + 20} y={ROWS[1].y - 26} w={SB.w - 40} h={52} r={8} fill="rgba(102,48,248,0.05)" stroke={PURPLE} sw={2} opacity={clamp01((N - 788) / 4)} glow={glowPurpleS(clamp01(0.25 + rowPulse * 0.75) * glowK)} />
              ) : null}
              {/* 侧栏底部：logged in as bob */}
              <div style={{...abs(0, 0, 1280, 720), opacity: clamp01((N - 829) / 8)}}>
                <CText cx={SB.x + SB.w / 2} cy={508} size={22} weight={600} color={GREY}>logged in as bob</CText>
              </div>
            </div>

            {/* ---- 双击：光标 + 波纹两圈 ---- */}
            {curOp > 0 ? <MouseCursor x={curX} y={curY} opacity={curOp} /> : null}
            <Svg bloom={false}>
              {[788, 795].map((f0) => {
                const p = ripple(f0);
                return p > 0 && p < 1 ? (
                  <circle key={f0} cx={CLICK.x} cy={CLICK.y} r={10 + 34 * p} fill="none" stroke={PURPLE_LIGHT} strokeWidth={2.5} opacity={0.85 * (1 - p)} />
                ) : null;
              })}
            </Svg>

            {/* ---- 小锁：bob 行尾 → 羊头顶（弧线 20 帧；827 落定弹一下 + 紫光） ---- */}
            {!landed && lockBorn > 0 ? (
              <div style={{...abs(0, 0, 1280, 720), opacity: lockBorn}}>
                <LockSeal cx={lockX} cy={lockY} w={34} h={42} tilt={lockTilt} />
              </div>
            ) : null}
            {landed ? (
              <div style={{...abs(0, 0, 1280, 720), transformOrigin: `${LOCK_HOME.cx}px ${LOCK_HOME.cy}px`, transform: `scale(${lockPop.toFixed(3)})`}}>
                <div style={{...abs(0, 0, 1280, 720), filter: `drop-shadow(0 0 ${10 * glowK}px ${4 * glowK}px rgba(102,45,248,${(0.55 * glowK).toFixed(2)}))`}}>
                  <LockSeal cx={LOCK_HOME.cx} cy={LOCK_HOME.cy} w={34} h={42} glow />
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </CameraRig>
      <Vignette k={vigK} alpha={0.32} />
    </>
  );
};
