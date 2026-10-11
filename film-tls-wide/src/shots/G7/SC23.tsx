import React from 'react';
import {useCurrentFrame} from 'remotion';
import {clamp01, slideIn, kf, GlitchIn} from '../../common';
import {CameraRig} from '../../fx';
import {LockSeal, CertCard, StampSeal, CText, Svg, SoftIn, Pill, GREY, GREY_MID, WHITE, PURPLE_LIGHT, GREEN, abs, fadeIn, exitOp, glowOffK} from '../../ui';

/**
 * SC23 Let's Encrypt（4751–4977）。S32（¶段末）。
 * 节拍：4759 `2015` YearRoll + `Let's Encrypt` GlitchIn(rgbSplit 6) + LockSeal 缩入 + 紫光点亮
 *       ｜4824 价签弹出（scale 0.5→1 / 8 帧）+ `$0` 白闪 + 绿光晕 + 流水线 draw-on（20 帧）+ 传送带启动
 *       + CertCard 依次进入（每 40 帧一张）+ 盖章机邮戳盖下
 *       ｜4904 `HTTPS stopped being a luxury` 灰字 + 锁体开合循环（40 帧周期）。
 * 停留：段末 末张盖章落位 4902 → 离场 4945，≥30 ✓。
 * 运镜：1→1.15 推向流水线（4751–4820，运镜不进末拍）。主角：LockSeal+流水线 340px（锁紫光 / `$0` 绿光晕）。
 */
const F0 = 4751;
const TO = 5012; // 段末跨 gap15 延伸到 SC24 首帧前（分镜表 v2）

const LOCK = {cx: 300, cy: 380};
const BELT = {y: 430, x0: 620, x1: 1180};

export const SC23: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const exit = exitOp(N, TO, 8);
  const glowK = glowOffK(N, TO);

  // 2015 YearRoll（4759 起 14 帧）
  const yn = N - 4759;
  const roll = clamp01(yn / 14);
  const rollVal = Math.round(2025 - 210 * (1 - Math.pow(1 - roll, 2)));

  // LockSeal 缩入（4765 起 21 帧）+ 开合循环（4840 起两个完整周期 80 帧，4920 后停性闭合）
  const lockIn = slideIn(N - 4765, 21);
  const openPh = Math.min(Math.max((N - 4840) / 40, 0), 2) * Math.PI * 2;
  const openK = Math.max(0, Math.sin(openPh)) * 0.3;

  // 价签（4824 起 8 帧）+ 白闪
  const tagN = N - 4824;
  const tagS = 0.5 + 0.5 * clamp01(tagN / 8);
  const tagFlash = N >= 4830 && N < 4833 ? 1 : 0;

  // 流水线 draw-on（4828 起 20 帧）+ 滚轮旋转（持续到 4930 冻结）
  const beltP = clamp01((N - 4828) / 20);
  const wheelSpin = Math.min(N - 4830, 100) * 6;
  // 证书流（4845 起每 40 帧一张；certT 在 4926 冻结 → 末张 4936 盖章完）
  const certT = Math.min((N - 4845) / 40, 2.025);

  // 盖章机（末端）+ 每张经过时邮戳盖下（8 帧）
  const stampX = BELT.x1 - 90;

  return (
    <CameraRig N={N} keys={[{f: F0, x: 640, y: 360, s: 1}, {f: 4786, x: 640, y: 360, s: 1}, {f: 4820, x: 900, y: 420, s: 1.15}]}>
      <div style={{...abs(0, 0, 1280, 720), opacity: exit}}>
        {/* 左：2015 + Let's Encrypt 大字 + 大锁 */}
        <div style={{...abs(0, 0, 1280, 720)}}>
          <SoftIn N={N} f0={4759}>
            <CText cx={300} cy={168} size={72} weight={700} family="'Orbitron'" color={GREY} letterSpacing={3}>{roll >= 1 ? '2015' : rollVal}</CText>
          </SoftIn>
          {N >= 4763 ? (
            <GlitchIn N={N} f0={4763} rgbSplit={6}>
              <div style={{...abs(0, 0, 1280, 720)}}>
                <CText cx={300} cy={248} size={58} weight={900} color={WHITE} letterSpacing={1}
                  style={{WebkitTextStroke: '2px rgba(161,117,241,0.9)', paintOrder: 'stroke fill'}}>Let's Encrypt</CText>
              </div>
            </GlitchIn>
          ) : null}
          <div style={{...abs(0, 0, 1280, 720), opacity: lockIn, filter: `drop-shadow(0 0 ${Math.min(24, 6 + N / 60)}px rgba(102,45,248,.45))`}}>
            <LockSeal cx={LOCK.cx} cy={LOCK.cy - 20} w={200} h={250} glow openK={openK} />
          </div>

          {/* 价签 $0 */}
          {tagN >= 0 ? (
            <div style={{...abs(LOCK.cx + 130, LOCK.cy + 60, 110, 64), opacity: clamp01(tagN / 5), transform: `scale(${tagS}) rotate(-6deg)`, background: '#000', border: `2.5px solid ${tagFlash ? '#fff' : WHITE}`, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: tagN > 8 ? `0 0 22px ${GREEN}66` : 'none'}}>
              <span style={{fontFamily: 'inherit', fontWeight: 700, fontSize: 42, color: GREEN}}>$0</span>
            </div>
          ) : null}
          <SoftIn N={N} f0={4824}>
            <CText cx={LOCK.cx + 15} cy={LOCK.cy + 190} size={24} weight={500} color={GREY}>free & automatic</CText>
          </SoftIn>
        </div>

        {/* 右：证书流水线（传送带 + 证书流 + 盖章机） */}
        <div style={{...abs(0, 0, 1280, 720), opacity: beltP > 0 ? 1 : 0}}>
          <Svg bloom={false}>
            {beltP > 0 ? <line x1={BELT.x0} y1={BELT.y + 60} x2={BELT.x0 + (BELT.x1 - BELT.x0) * beltP} y2={BELT.y + 60} stroke={GREY_MID} strokeWidth={3} strokeLinecap="round" /> : null}
            {[0, 1, 2].map((i) => {
              const wx = BELT.x0 + 90 + i * 200;
              return beltP * (BELT.x1 - BELT.x0) > wx - BELT.x0 ? (
                <g key={i} transform={`rotate(${wheelSpin % 360} ${wx} ${BELT.y + 60})`}>
                  <circle cx={wx} cy={BELT.y + 60} r={13} fill="#000" stroke={GREY_MID} strokeWidth={2.5} />
                  <line x1={wx - 10} y1={BELT.y + 60} x2={wx + 10} y2={BELT.y + 60} stroke={GREY_MID} strokeWidth={1.5} />
                </g>
              ) : null;
            })}
          </Svg>
          {/* 证书流（3 张循环） */}
          {[0, 1, 2].map((i) => {
            const t = clamp01(certT - i);
            if (certT < i) return null;
            const cx = BELT.x0 + 40 + (BELT.x1 - BELT.x0 - 160) * ((t * 1.2) % 1.2);
            const pass = cx > stampX - 20 ? clamp01((cx - (stampX - 20)) / 40) : 0;
            return (
              <div key={i} style={{...abs(0, 0, 1280, 720), opacity: 0.95}}>
                <CertCard x={cx} y={BELT.y - 60} w={150} h={104} domain="shop.example" ca="CA" stamped={pass} />
              </div>
            );
          })}
          {/* 盖章机（StampSeal 装置） */}
          <div style={{...abs(0, 0, 1280, 720), opacity: beltP >= 1 ? 1 : 0}}>
            <StampSeal cx={stampX} cy={BELT.y + 10} r={40} text="CA" p={clamp01((N - 4850) / 20)} />
            <Svg bloom={false}>
              <line x1={stampX} y1={BELT.y - 90} x2={stampX} y2={BELT.y - 34} stroke={GREY_MID} strokeWidth={2.5} />
              <rect x={stampX - 44} y={BELT.y - 116} width={88} height={26} fill="#000" stroke={GREY_MID} strokeWidth={2} rx={4} />
            </Svg>
          </div>
          <SoftIn N={N} f0={4830}>
            <CText cx={900} cy={BELT.y + 118} size={22} weight={400} color={GREY}>automatic</CText>
          </SoftIn>
        </div>

        {/* 底部结论 */}
        <SoftIn N={N} f0={4904}>
          <CText cx={640} cy={612} size={24} weight={500} color={GREY}>HTTPS stopped being a luxury</CText>
        </SoftIn>
      </div>
    </CameraRig>
  );
};
