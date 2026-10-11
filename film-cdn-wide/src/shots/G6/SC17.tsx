import React from 'react';
import {useCurrentFrame} from 'remotion';
import {clamp01, GlitchIn, emphasisPulse, FONT_WIDE, FONT_MONO} from '../../common';
import {CameraRig, LightSweep} from '../../fx';
import {BrowserWin, EdgeNode, CText, Svg, SoftIn, Cross, GREY, GREY_MID, WHITE, PURPLE_LIGHT, abs} from '../../ui';

/**
 * SC17 金句：就近（4040–4366）。S23–S25（¶段末片末；endingFade=2 → 压黑 4362–4364）。
 * 节拍：4048 播放器缩微回归 + `So — Friday night` ｜4120 进度条一秒快进 + 播放键亮
 *       ｜4171 "快"路径否定（小远弧 + 红 Cross）｜4230 近侧 EdgeNode 亮 + 短线光点跑
 *       ｜4288 清场 → 三轮扫光（{S25.c1}+4/+14/+24）+ 第一行 GlitchIn(rgbSplit 8)
 *       ｜4344 第二行 SoftIn len3 紫硬投影 + 小 EdgeNode 20px/帧横移。
 * 终镜不用 exitOp（endingFade 压黑接管——TLS SC27 成熟模式）。扫光白名单①。
 */
const F0 = 4040;
const TO = 4366;

const PLAYER = {x: 140, y: 240};
const EDGE = {cx: 880, cy: 360};

export const SC17: React.FC = () => {
  const N = useCurrentFrame() + F0;

  // 播放器回归（4048 缩入）+ 进度一秒快进（4120–4128）+ 键亮
  const plIn = clamp01((N - 4048) / 12);
  const ff = clamp01((N - 4120) / 8);
  const playLit = N >= 4120;
  // "快"路径否定（4171 小远弧 + Cross 4183）
  const negArc = clamp01((N - 4171) / 12);
  const negX = clamp01((N - 4183) / 10);
  // 近侧 EdgeNode（4230 缩入 + 灯亮）+ 短线光点（持续）
  const edgeIn = clamp01((N - 4230) / 14);
  const dotPh = N >= 4250 ? ((N - 4250) % 28) / 28 : -1;
  // 清场（4288–4300）→ 扫光（4292/4302/4312）→ 行1（4296 GlitchIn）→ 行2（4344 SoftIn len3）→ 灰字（4344 len3）
  const collapse = clamp01((N - 4288) / 12);
  const L1 = N - 4296;
  const L2 = N - 4338; // beat−6
  const fly2 = Math.max(0, N - 4338);

  return (
    <CameraRig N={N} keys={[{f: F0, x: 640, y: 360, s: 1}]}>
      <div style={abs(0, 0, 1280, 720)}>
        {/* 上半：周五夜回归场景（清场时收缩淡出） */}
        <div style={{...abs(0, 0, 1280, 720), opacity: plIn * Math.max(0, 1 - collapse * 1.1), transform: `scale(${(1 - 0.3 * collapse).toFixed(3)})`}}>
          <div style={{transform: `translateY(${(80 * Math.pow(1 - Math.min(1, (N - 4048) / 14), 2.5)).toFixed(1)}px)`}}>
            <BrowserWin x={PLAYER.x} y={PLAYER.y} w={430} h={320} url="player" barP={Math.min(0.97, plIn * (0.1 + 0.75 * ff) + 0.0018 * Math.max(0, N - 4128))} />
          </div>
          {/* 播放键（大三角） */}
          <Svg bloom>
            <path d={`M${PLAYER.x + 180} ${PLAYER.y + 130} l0 60 l52 -30 Z`} fill="#000" stroke={playLit ? PURPLE_LIGHT : WHITE} strokeWidth={3} strokeLinejoin="round" />
          </Svg>
          <CText cx={PLAYER.x + 215} cy={PLAYER.y + 350} size={24} weight={600} color={GREY}>2 GB</CText>
          {/* "快"路径否定 */}
          {negArc > 0 ? (
            <Svg bloom={false}>
              <path d={`M${PLAYER.x + 450} ${PLAYER.y + 100} Q${(PLAYER.x + EDGE.cx) / 2} ${PLAYER.y - 60} ${EDGE.cx - 100} ${EDGE.cy - 80}`} fill="none" stroke={GREY_MID} strokeWidth={4} strokeDasharray={`${(negArc * 720).toFixed(0)} 10000`} opacity={0.75 * negArc * (1 - collapse)} strokeLinecap="round" />
            </Svg>
          ) : null}
          {negX > 0 && collapse < 0.5 ? (
            <div style={{...abs(0, 0, 1280, 720), opacity: negX * (1 - collapse * 2), filter: `drop-shadow(0 0 ${14 + 10 * Math.abs(Math.sin(N / 10))}px rgba(236,8,31,.55))`}}>
              <Cross cx={640} cy={250} size={90} sw={6} />
            </div>
          ) : null}
          {/* "fast?" 大字 + 红线划除（4164 入，4171–4189 划线，真动作破静止段） */}
          {N >= 4164 && collapse < 0.5 ? (
            <div style={{...abs(0, 0, 1280, 720), opacity: (1 - clamp01((N - 4226) / 8)) * (1 - collapse * 2)}}>
              <CText cx={640} cy={168} size={88} weight={900} color={N < 4196 ? WHITE : GREY_MID} letterSpacing={2}
                style={{opacity: 0.95}}>fast?</CText>
              {N >= 4171 ? (
                <div style={{position: 'absolute', left: 420, top: 150, width: clamp01((N - 4171) / 18) * 440, height: 10, background: '#F16043', borderRadius: 5, boxShadow: '0 0 14px rgba(241,96,67,.7)', transform: `rotate(-6deg)`, transformOrigin: '0 50%'}} />
              ) : null}
            </div>
          ) : null}
          {/* 播放器扫光（4130–4286 循环：斜向亮带扫过，宽幅持续动作） */}
          {N >= 4130 && N < 4286 && collapse < 0.5 ? (() => {
            const sp = ((N - 4130) % 52) / 52;
            const sx = PLAYER.x - 120 + 680 * sp;
            return <div style={{position: 'absolute', left: sx, top: PLAYER.y - 30, width: 90, height: 380, background: 'linear-gradient(100deg, transparent, rgba(255,255,255,0.13) 45%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0.13) 55%, transparent)', transform: 'skewX(-12deg)', borderRadius: 8}} />;
          })() : null}
          {/* "快" 的神话持续被否定（4195–4265 每拍红脉冲，破静止段） */}
          {N >= 4130 && N < 4288 && collapse < 0.3 ? (() => {
            const ph = ((N - 4130) % 24) / 24;
            return <div style={{position: 'absolute', left: 640 - (30 + 70 * ph), top: 250 - (30 + 70 * ph), width: (60 + 140 * ph), height: (60 + 140 * ph), borderRadius: '50%', border: `3px solid rgba(241,96,67,${(0.7 * (1 - ph)).toFixed(2)})`}} />;
          })() : null}
          {/* 近侧 EdgeNode */}
          <div style={{...abs(0, 0, 1280, 720), opacity: Math.min(1, edgeIn * 2) * Math.max(0, 1 - collapse * 1.1), transform: `scale(${(0.5 + 0.5 * edgeIn).toFixed(3)})`, transformOrigin: `${EDGE.cx}px ${EDGE.cy}px`}}>
            <EdgeNode cx={EDGE.cx} cy={EDGE.cy} w={170} h={200} glow label="your city" labelSize={22} />
            <div style={{position: 'absolute', left: EDGE.cx - 90, top: EDGE.cy - 108, width: 180, height: 216, borderRadius: 14, border: `2px solid rgba(161,117,241,${(0.25 + 0.35 * Math.abs(Math.sin(N / 12))).toFixed(2)})`, opacity: edgeIn}} />
            <Svg bloom={false}>
              <line x1={PLAYER.x + 440} y1={PLAYER.y + 260} x2={EDGE.cx - 95} y2={EDGE.cy + 40} stroke={PURPLE_LIGHT} strokeWidth={3} strokeLinecap="round" opacity={0.8} />
            </Svg>
            {dotPh >= 0 ? (
              <Svg bloom>
                <circle cx={PLAYER.x + 440 + (EDGE.cx - 95 - PLAYER.x - 440) * dotPh} cy={PLAYER.y + 260 + (EDGE.cy + 40 - PLAYER.y - 260) * dotPh - 24 * Math.sin(Math.PI * dotPh)} r={8} fill={PURPLE_LIGHT} stroke="#fff" strokeWidth={1.5} />
              </Svg>
            ) : null}
          </div>
          <SoftIn N={N} f0={4048}>
            <CText cx={640} cy={612} size={24} weight={400} color={GREY}>So — Friday night</CText>
          </SoftIn>
        </div>

        {/* 金句（扫光①：三轮紧凑版） */}
        <LightSweep N={N} rounds={[4292, 4302, 4312]} alphas={[0.5, 0.45, 0.45]} dy={-40} />
        {L1 >= 0 ? (
          <GlitchIn N={N} f0={4296} rgbSplit={8} slices={16}>
            <div style={{...abs(0, 0, 1280, 720)}}>
              <CText cx={640} cy={300} size={64} weight={900} color={WHITE} letterSpacing={0.5}
                style={{WebkitTextStroke: '2.5px rgba(161,117,241,0.95)', paintOrder: 'stroke fill', transform: `scale(${emphasisPulse(L1, {peak: 1.11})})`}}>
                The internet isn't fast.</CText>
            </div>
          </GlitchIn>
        ) : null}
        {L2 >= 0 ? (
          <SoftIn N={N} f0={4338} len={3}>
            <div style={{...abs(0, 0, 1280, 720)}}>
              <CText cx={640} cy={420} size={84} weight={400} family={FONT_WIDE} color={WHITE} letterSpacing={1}
                style={{WebkitTextStroke: `4px ${PURPLE_LIGHT}`, paintOrder: 'stroke fill', textShadow: '0 0 22px rgba(161,117,241,.55), 0 0 5px rgba(161,117,241,.5)'}}>
                It's close.</CText>
            </div>
          </SoftIn>
        ) : null}
        {/* 小 EdgeNode 横移（两行之间，20px/帧） */}
        {N >= 4338 ? (
          <div style={{...abs(0, 0, 1280, 720)}}>
            <EdgeNode cx={160 + 20 * fly2} cy={360} w={54} h={64} opacity={0.85} />
          </div>
        ) : null}
        {L2 >= 0 ? (
          <SoftIn N={N} f0={4338} len={3}>
            <CText cx={640} cy={540} size={24} weight={400} color={GREY}>CDN · why your video never buffers</CText>
          </SoftIn>
        ) : null}
      </div>
    </CameraRig>
  );
};
