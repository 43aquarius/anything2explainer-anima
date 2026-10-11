import React from 'react';
import {useCurrentFrame} from 'remotion';
import {clamp01, slideIn, powOutRemain, kf, FONT_ORB} from '../../common';
import {CameraRig} from '../../fx';
import {KeyIcon, LockSeal, CText, Svg, SoftIn, Box, Cross, GREY, GREY_MID, WHITE, ORANGE, CORAL, abs, fadeIn, exitOp} from '../../ui';

/**
 * SC18 昨天仍是密封的（3595–3829）。S25–S26。
 * 节拍：3603 左半保险箱 draw-on（18 帧）+ 门撬开（8 帧）+ KeyIcon 被抽走 + `tomorrow` 橙
 *       ｜3649 右半录音带 2 帧错峰 slideIn + 小锁依次扣合 + `yesterday` 灰
 *       ｜3690 被偷的 KeyIcon 飞向录音带 → 每盒小锁闪"拒开"红光（3760–3764）+ Cross（3766）
 *       ｜3792 `the past stays sealed` 灰字 + 折断 KeyIcon 滑落中央下方。
 * 持续：录音带中孔微光呼吸。运镜：1→1.15 推向右半（3595–3752，运镜不进末拍）。
 * 主角：保险箱+录音带组 320px（拒开红光闪 / 右半 BLOOM）。
 */
const F0 = 3595;
const TO = 3829;

const SAFE = {x: 200, y: 260, w: 240, h: 200};
const TAPES = [
  {x: 790, y: 460},
  {x: 870, y: 420},
  {x: 950, y: 460},
  {x: 910, y: 500},
];

export const SC18: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const exit = exitOp(N, TO, 8);

  // 保险箱 draw-on（3603 起 18 帧）+ 门撬开（3625–3633，旋转 20°）
  const safeP = clamp01((N - 3603) / 18);
  const doorP = clamp01((N - 3625) / 8);

  // 被偷的钥匙：抽走（3630–3646 向左）→ 飞向右半（3694–3714 弧线）→ 落点
  const stealT = clamp01((N - 3630) / 16);
  const flyT = clamp01((N - 3694) / 20);
  const kx = stealT < 1 ? 320 - 120 * stealT : (flyT < 1 ? 320 - 120 + 640 * flyT : 840);
  const ky = stealT < 1 ? 360 : (flyT < 1 ? 360 - 90 * Math.sin(Math.PI * flyT) : 330);

  // 录音带（3649 起 2 帧错峰 slideIn）+ 小锁扣合（3656+，每把 6 帧）
  const tapeIn = (i: number) => clamp01((N - (3649 + i * 2)) / 14);
  const lockP = (i: number) => clamp01((N - (3656 + i * 5)) / 6);

  // 拒开红光（3760–3764 各盒同步闪）+ Cross（3766–3778）
  const reject = N >= 3760 && N < 3765 ? 1 : 0;
  const crossP = clamp01((N - 3766) / 12);

  // 折断钥匙滑落（3800–3816）
  const brokenT = clamp01((N - 3800) / 16);
  const bKx = 900 - 260 * brokenT;
  const bKy = 540 + 30 * brokenT;

  // 中孔呼吸
  const holeGlow = 0.35 + 0.25 * Math.sin((N / 30) * Math.PI * 2);

  return (
    <CameraRig N={N} keys={[{f: F0, x: 640, y: 360, s: 1}, {f: 3714, x: 640, y: 360, s: 1}, {f: 3752, x: 880, y: 400, s: 1.15}]}>
      <div style={{...abs(0, 0, 1280, 720), opacity: exit}}>
        {/* 左半：保险箱（门撬开 + tomorrow） */}
        <div style={{...abs(0, 0, 1280, 720), opacity: safeP}}>
          <Box x={SAFE.x} y={SAFE.y} w={SAFE.w} h={SAFE.h} r={8} sw={3} />
          {/* 门（左铰链旋转） */}
          <div style={{...abs(SAFE.x, SAFE.y, SAFE.w / 2, SAFE.h), transform: `rotate(${-20 * doorP}deg)`, transformOrigin: `${SAFE.x}px ${SAFE.y + SAFE.h / 2}px`, border: `2.5px solid ${GREY}`, borderRadius: 6, boxSizing: 'border-box'}} />
          <div style={{position: 'absolute', left: SAFE.x + 96, top: SAFE.y + 76, width: 48, height: 48, borderRadius: '50%', border: `3px solid ${GREY_MID}`}} />
          {doorP > 0.5 ? <CText cx={320} cy={SAFE.y + 244} size={44} weight={700} family={FONT_ORB} color={ORANGE}>tomorrow</CText> : null}
        </div>

        {/* 被偷的钥匙（先抽离保险箱，后飞向录音带） */}
        <div style={{...abs(0, 0, 1280, 720), opacity: clamp01((N - 3630) / 4) * exit}}>
          <KeyIcon cx={kx} cy={ky} size={140} glow />
        </div>

        {/* 中央 vs */}
        <SoftIn N={N} f0={3680}>
          <CText cx={640} cy={360} size={40} weight={400} color={GREY_MID}>vs</CText>
        </SoftIn>

        {/* 右半：录音带堆（每盒小锁 + 拒开红光） */}
        {TAPES.map((t, i) => (
          <div key={i} style={{...abs(0, 0, 1280, 720), opacity: tapeIn(i), transform: `translateY(${(26 * (1 - tapeIn(i))).toFixed(1)}px)`}}>
            <Box x={t.x} y={t.y} w={130} h={78} r={6} sw={2.5} glow={reject ? `0 0 18px rgba(236,8,31,.5)` : undefined} />
            <div style={{position: 'absolute', left: t.x + 45, top: t.y + 26, width: 40, height: 26, borderRadius: 4, border: `2px solid ${GREY}`, background: '#000', boxShadow: `0 0 ${8 * holeGlow}px rgba(255,255,255,${(0.3 * holeGlow).toFixed(2)})`}} />
            {lockP(i) > 0 ? <div style={{...abs(0, 0, 1280, 720), opacity: lockP(i), transform: `scale(${1.3 - 0.3 * lockP(i)})`}}><LockSeal cx={t.x + 65} cy={t.y - 22} w={34} h={42} /></div> : null}
          </div>
        ))}
        <SoftIn N={N} f0={3660}>
          <CText cx={880} cy={580} size={44} weight={700} family={FONT_ORB} color={GREY}>yesterday</CText>
        </SoftIn>

        {/* 拒开 Cross（钥匙落点） */}
        {crossP > 0 ? (
          <div style={{...abs(0, 0, 1280, 720), opacity: crossP, transform: `scale(${1.3 - 0.3 * crossP})`}}>
            <Cross cx={840} cy={330} size={76} sw={5} />
          </div>
        ) : null}

        {/* 折断钥匙滑落（会话密钥早已销毁） */}
        {brokenT > 0 ? (
          <div style={{...abs(0, 0, 1280, 720), opacity: clamp01((N - 3800) / 6) * exit}}>
            <KeyIcon cx={bKx} cy={bKy} size={130} broken={1} glow />
          </div>
        ) : null}

        {/* 底部说明 */}
        <SoftIn N={N} f0={3792}>
          <CText cx={640} cy={612} size={22} weight={400} color={GREY}>keys are thrown away after each session</CText>
        </SoftIn>
        <SoftIn N={N} f0={3733}>
          <CText cx={840} cy={388} size={24} weight={500} color={CORAL}>cannot decrypt</CText>
        </SoftIn>
      </div>
    </CameraRig>
  );
};
