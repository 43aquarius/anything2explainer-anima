import React from 'react';
import {useCurrentFrame} from 'remotion';
import {clamp01, powIn, FONT_MONO} from '../../common';
import {CText, Box, PacketIcon, WHITE, PURPLE_LIGHT, GREY, GREY_LIGHT, GREY_LINE, fadeIn, scaleIn, exitOp, glowPurpleS} from '../../ui';

/**
 * SC09 复印检查站 · N 1426–1641（S10 1434–1639：1434「不拦截不改变」/ 1499「只是复制」/ 1532「检查站」/ 1578「每个信封」）
 * 版式：水平传送带（两条白线 y 407/453，x 160–1120），信封（白描边，母题）自左向右 3.5px/帧连续流动；
 *   传送带中央上方「复印机」盒子 250×170（白边黑底 + 顶部紫色扫描灯条 + 标签 checkpoint + 底部出纸缝）；
 *   传送带之下、复印机正下方虚线托盘接收半透明紫色副本。
 * 节拍：1434 传送带界线 wipe（20 帧自左）+ 信封随 wipe 依次滑入流动（持续动作）；
 *   1499 复印机缩放入场（21 帧）+ 扫描灯条呼吸（紫光 30 帧周期，全镜持续）；
 *   1532 标签 `checkpoint` SoftIn；1578 首枚信封到达复印机正下方：白闪 4 帧（竖直光束 + 灯条增亮）→
 *   托盘落下一张紫色副本（14 帧落下 powIn 2）；1618 第二枚 → 第二张副本；
 *   原件信封全部继续走出画右缘（预载 3 枚分别于 ~1488/1540/1593 出画 ——「不拦截」的视觉证明）。
 * 停留：段内不判。末 8 帧归零。
 */
const F0 = 1426, TO = 1641;
const T_BELT = 1434, T_COPIER = 1432, T_LABEL = 1532; // v2: 复印机提前到开场（1434 节拍 −2；QC v1 中空场修复：1426–1520 只有小信封 80 帧）
const V = 3.5; // 传送带速度 px/帧
const BELT = {x0: 160, x1: 1120, yTop: 407, yBot: 453, cy: 430};
const COPIER = {x: 515, y: 165, w: 250, h: 170}; // 中心 (640,250)
const COPY_AT = [1578, 1618]; // 信封到检查站正下方 → 副本落下的帧
/** 信封名册：(spawn 帧, spawn x)。前 3 枚预载（随 wipe 滑入、全部走出右缘）；第 4 枚 1578 过站、第 5 枚 1618 过站 */
const ENVS: Array<[number, number]> = [
  [1434, 980],
  [1434, 800],
  [1434, 615],
  [1434, 134], // → 1578 过站（第一份副本）
  [1464, 100], // → 1618 过站（第二份副本）
  [1518, 100],
  [1572, 100],
];
const TRAY = {x: 566, y: 492, w: 148, h: 68};
/** 托盘副本：[落下帧, 落点 cx, 落点 cy] */
const COPIES: Array<[number, number, number]> = [
  [COPY_AT[0], 640, 541],
  [COPY_AT[1], 630, 518],
];

/** 4 帧三角脉冲 0→1→0（白闪） */
const flash = (n: number, len = 4) => (n <= 0 || n >= len ? 0 : n < len / 2 ? n / (len / 2) : 1 - (n - len / 2) / (len / 2));

export const SC09: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const exOp = exitOp(N, TO, 8);
  const bn = N - T_BELT;
  // 传送带界线 wipe：自左展宽 20 帧（幂 2.5 缓出）
  const beltP = bn < 0 ? 0 : 1 - Math.pow(1 - clamp01(bn / 20), 2.5);
  const beltW = (BELT.x1 - BELT.x0) * beltP;
  // 复印机：21 帧缩放入场
  const cn = N - T_COPIER;
  const copierS = cn < 0 ? 0 : scaleIn(cn, 21);
  const copierOp = cn < 0 ? 0 : fadeIn(cn, 8);
  // 扫描灯条：30 帧呼吸 + 过站瞬间增亮
  const scanN = Math.max(0, N - T_COPIER);
  const copyFlash = Math.max(...COPY_AT.map((t) => flash(N - t)));
  const breathe = 0.45 + 0.3 * Math.sin((2 * Math.PI * scanN) / 30);
  const scanA = Math.min(1, breathe + 0.55 * copyFlash);
  // 过站光束（复印机底 → 传送带，4 帧）
  const beamA = copyFlash;

  return (
    <div style={{position: 'absolute', inset: 0, opacity: exOp}}>
      {/* 传送带两条界线（自左 wipe） */}
      {[BELT.yTop, BELT.yBot].map((y) => (
        <div key={y} style={{position: 'absolute', left: BELT.x0, top: y - 1, width: beltW, height: 2.5, background: WHITE, opacity: 0.8}} />
      ))}
      {/* 原件信封流（持续动作；全部继续向右，预载 3 枚走出画右缘） */}
      {ENVS.map(([sf, sx], i) => {
        const x = sx + V * (N - sf);
        if (x > 1300) return null;
        const op = fadeIn(N - sf, 8);
        // 预载信封随 wipe 自左滑入（18 帧 40px 回弹）
        const dx = sf === 1434 && sx > 200 ? -40 * Math.pow(1 - clamp01(bn / 18), 2.5) : 0;
        return <PacketIcon key={i} cx={x + dx} cy={BELT.cy} opacity={op} />;
      })}
      {/* 复印机（主角 170px；扫描灯条 = 它的光） */}
      {copierOp > 0 ? (
        <div
          style={{
            position: 'absolute',
            left: COPIER.x,
            top: COPIER.y,
            width: COPIER.w,
            height: COPIER.h,
            opacity: copierOp,
            transformOrigin: '125px 85px',
            transform: copierS === 1 ? undefined : `scale(${copierS.toFixed(4)})`,
          }}
        >
          <Box x={0} y={0} w={COPIER.w} h={COPIER.h} r={10} sw={3} />
          {/* 顶部扫描灯条：紫色 + 呼吸 + 过站增亮 */}
          <div
            style={{
              position: 'absolute',
              left: 20,
              top: 18,
              width: COPIER.w - 40,
              height: 14,
              borderRadius: 7,
              background: `linear-gradient(90deg, transparent, ${PURPLE_LIGHT} 18%, ${PURPLE_LIGHT} 82%, transparent)`,
              boxShadow: glowPurpleS(Math.min(1, scanA)),
              opacity: Math.min(1, 0.5 + scanA * 0.5),
            }}
          />
          {/* 出纸缝 */}
          <div style={{position: 'absolute', left: 55, top: COPIER.h - 14, width: COPIER.w - 110, height: 5, borderRadius: 3, background: '#0c0c0e', border: `1.5px solid ${GREY_LINE}`}} />
          {/* 标签 checkpoint（1532） */}
          {N >= T_LABEL ? (
            <CText cx={COPIER.w / 2} cy={COPIER.h - 52} size={24} weight={600} family={FONT_MONO} color={GREY_LIGHT} opacity={fadeIn(N - T_LABEL, 8)}>
              checkpoint
            </CText>
          ) : null}
        </div>
      ) : null}
      {/* 过站光束（白闪 4 帧） */}
      {beamA > 0 ? (
        <div
          style={{
            position: 'absolute',
            left: 633,
            top: COPIER.y + COPIER.h,
            width: 14,
            height: BELT.yTop - (COPIER.y + COPIER.h),
            opacity: beamA,
            background: `linear-gradient(180deg, rgba(161,117,241,.9), rgba(255,255,255,.85) 45%, rgba(161,117,241,.9))`,
            boxShadow: `0 0 18px 5px rgba(102,45,248,${(0.6 * beamA).toFixed(2)})`,
          }}
        />
      ) : null}
      {/* 托盘（虚线框）+ 紫色副本落下 */}
      {bn >= 0 ? <Box x={TRAY.x} y={TRAY.y} w={TRAY.w} h={TRAY.h} r={8} sw={2} dashed stroke={GREY} opacity={fadeIn(bn, 10)} /> : null}
      {COPIES.map(([t, cx, cy], i) => {
        const n = N - t;
        if (n < 0) return null;
        const drop = powIn(2)(clamp01(n / 14)); // 14 帧加速落下
        const y = 440 + (cy - 440) * drop;
        return <PacketIcon key={i} cx={cx} cy={y} w={56} h={38} accent opacity={0.55 * fadeIn(n, 4)} glow={false} />;
      })}
    </div>
  );
};
