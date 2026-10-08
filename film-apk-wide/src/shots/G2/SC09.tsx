import React from 'react';
import {useCurrentFrame} from 'remotion';
import {FONT_WIDE, FONT_ORB} from '../../common';
import {CText, WHITE, PURPLE_LIGHT, GREY, firstOp, exitOp, SoftIn, scaleIn} from '../../ui';
import {WhyCards} from './layout';

/**
 * SC09 为什么 · N 1260–1425（S09 1268–1423：1268 Why would the world's biggest mobile OS /
 * 1330 wrap its apps in a DOS-era compression format?）
 * 清场重开（SC08 末 8 帧已归零）。中央问题大字 `why?`（Audiowide 84px 白，1262 SoftIn = 节拍 −6）+
 * 每 36 帧轻微 1.03 脉冲；下方对照双卡（WhyCards）：左卡 PhoneMock 0.38× + `the biggest mobile OS`（灰 24px）、
 * 右卡包裹 + 软盘 + `a 1989 DOS format`（灰 24px），1268/1270 2 帧错峰 slideUp Δ100；两卡之间大问号
 * （紫 72px，1271 scaleIn 21 帧）+ 紫光呼吸 30 帧周期（持续动作，主角之光）。
 * 1330 右卡内包裹与软盘之间「=」两横线 draw-on（10 帧）+ 1338 右卡边框橙闪一次（违和感，橙=警示语义）。
 * 停留：段内不判（分镜表）。末 8 帧 why?/问号归零；**双卡不清场**——分镜表 SC10「承接：双卡淡出」要求双卡
 * 跨 1425|1426 边界交给 SC10 同组件同参数接管（承接优先于清场，同 SC07→SC08 SlotCard 模式；交界帧像素一致）。
 */
const F0 = 1260;
const TO = 1425;
const T_WHY = 1262; // why? SoftIn（S09 首拍 1268 的 −6）
const T_Q = 1271; // 大问号 scaleIn（节拍 +3 容差内）
const T_PULSE = 1272; // why? 每 36 帧一次 1.03 脉冲（16 帧升回）

export const SC09: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const exOp = exitOp(N, TO, 8); // 末 8 帧：why?/问号归零（双卡承接进 SC10）
  // 问号紫光呼吸（30 帧周期，持续动作）
  const br = 0.5 + 0.5 * Math.sin((2 * Math.PI * N) / 30);
  // why? 每 36 帧轻微 1.03 脉冲
  const pn = N >= T_PULSE ? (N - T_PULSE) % 36 : -1;
  const whyS = pn >= 0 && pn < 16 ? 1 + 0.03 * Math.sin((Math.PI * pn) / 16) : 1;
  // 大问号缩放入场
  const qn = N - T_Q;
  const qS = qn < 0 ? 0 : 0.55 + 0.45 * scaleIn(qn, 21);
  const qOp = qn < 0 ? 0 : firstOp(qn, 6);

  return (
    <>
      {exOp > 0 ? (
        <div style={{position: 'absolute', inset: 0, opacity: exOp}}>
          {/* 问题大字 */}
          <SoftIn N={N} f0={T_WHY}>
            <CText
              cx={640} cy={168} size={84} weight={400} family={FONT_WIDE} letterSpacing={4} color={WHITE}
              shadow="0 0 18px rgba(255,255,255,.28)"
              style={{transform: `translate(-50%,-50%) scale(${whyS.toFixed(4)})`}}
            >
              why?
            </CText>
          </SoftIn>
          {/* 两卡之间的大问号（主角之光：紫光呼吸） */}
          {qOp > 0 ? (
            <CText
              cx={640} cy={412} size={72} weight={700} family={FONT_ORB} color={PURPLE_LIGHT} opacity={qOp}
              shadow={`0 0 ${Math.round(10 + 10 * br)}px rgba(161,117,241,${(0.45 + 0.3 * br).toFixed(3)})`}
              style={{transform: `translate(-50%,-50%) scale(${qS.toFixed(4)})`}}
            >
              ?
            </CText>
          ) : null}
        </div>
      ) : null}
      {/* 对照双卡（不清场，承接进 SC10） */}
      <WhyCards N={N} />
    </>
  );
};
