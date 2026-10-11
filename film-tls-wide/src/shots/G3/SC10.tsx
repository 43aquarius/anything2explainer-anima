import React from 'react';
import {useCurrentFrame} from 'remotion';
import {clamp01, kf, slideIn, emphasisPulse, GlitchIn, FONT_ORB, FONT_MONO} from '../../common';
import {CameraRig} from '../../fx';
import {CertCard, KeyIcon, CText, Svg, SoftIn, Cross, GREY, GREY_MID, WHITE, PURPLE_LIGHT, CORAL, abs, fadeIn, exitOp, glowOffK} from '../../ui';
import {BrowserEnd, RackEnd, ArcPath, Envelope, END_FULL, END_BADGE} from './parts';

/**
 * SC10 同一个秘密（1811–2100）。S13–S14（¶段末）。★高光时刻·论点型（≥90 帧编排，GlitchIn 变体，无扫光）。
 * 节拍：1819 双端自 badge 位长回全尺寸（16 帧承接 SC09）+ ServerHello 卡自右 slideIn（Δ200/16 帧）→ 飞向浏览器（kf 24 帧）→ 浏览器顶栏亮 1 帧
 *       ｜1881 CertCard 缩微接入（18 帧）+ CA 邮戳盖下（scale 1.35→1 / 8 帧）
 *       ｜1922（S14.c1）双 KeyIcon 同时自两端升起（21 帧，2 帧错峰）+ `=` SoftIn + 紫光同步点亮 + emphasisPulse
 *       ｜1979（S14.c2）连线中央大红 Cross 旋转盖下（18 帧）+ `nothing crosses the wire` 灰字 + 钥匙缓慢旋转（±6°/30 帧周期，持续）。
 * 停留：段末 Cross 落位 1997 → 离场 2092，≥30 ✓。运镜：33 帧 1→1.18 推向双钥匙（1889–1922，运镜不进末拍）。
 * 主角：双 KeyIcon 组 300px（紫光；本镜唯一大面积紫）。流程轨章：内容主区 y175–620。
 */
const F0 = 1811;
const TO = 2145; // 段末跨 gap 覆盖到 SC11 首帧前（分镜表 v2）

// 双端位置（badge → full 的插值）
const B = END_BADGE.browser, F = END_FULL.browser;
const RK_B = END_BADGE.rack, RK_F = END_FULL.rack;

export const SC10: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const exit = exitOp(N, TO, 8);
  const glowK = glowOffK(N, TO);

  // 双端长回（1811–1827，16 帧承接）
  const growT = clamp01((N - 1811) / 16);
  const bx = B.x + (F.x - B.x) * growT, by = B.y + (F.y - B.y) * growT, bs = B.s + (F.s - B.s) * growT;
  const rcx = RK_B.cx + (RK_F.cx - RK_B.cx) * growT, rcy = RK_B.cy + (RK_F.cy - RK_B.cy) * growT;
  const rw = RK_B.w + (RK_F.w - RK_B.w) * growT, rh = RK_B.h + (RK_F.h - RK_B.h) * growT;

  // ServerHello 卡（1819 slideIn Δ200/16 帧 → 1837–1861 飞向浏览器）
  const shn = N - 1819;
  const shIn = clamp01(shn / 16);
  const flyT = clamp01((N - 1837) / 24);
  const shX = 1000 - 860 * flyT, shY = 220 + 120 * flyT - 40 * Math.sin(Math.PI * flyT);
  const browFlash = N >= 1861 && N < 1862;

  // CertCard（1881 缩微接入 18 帧）
  const ccIn = clamp01((N - 1881) / 18);
  // CA 邮戳（1893 盖下 8 帧）
  const stn = N - 1893;
  const stP = clamp01(stn / 8);

  // 双钥匙（1922/1924 起 21 帧缩入）+ 紫光 + 缓转（±6°，30 帧周期）
  const keyIn = (i: number) => slideIn(N - (1922 + i * 2), 21);
  const sway = (i: number) => 6 * Math.max(0, 1 - clamp01((N - 2085) / 20)) * Math.sin(((N + i * 15) / 30) * Math.PI * 2); // 2085 起衰减（跨 gap 延长后 TO=2145，摆动破静止段+留 ≥30 帧 hold）
  // =（1930 SoftIn）
  const eqIn = clamp01((N - 1930) / 8);

  // Cross（1979 旋转盖下 18 帧）+ 灰字（1997 SoftIn）
  const crossP = clamp01((N - 1979) / 18);
  const greyIn = clamp01((N - 1997) / 8);

  return (
    <CameraRig N={N} keys={[{f: F0, x: 640, y: 360, s: 1}, {f: 1889, x: 640, y: 360, s: 1}, {f: 1922, x: 640, y: 360, s: 1.18}]}>
      <div style={{...abs(0, 0, 1280, 720), opacity: exit}}>
        {/* 双端 */}
        <BrowserEnd x={bx} y={by} s={bs} barP={0.6} />
        <RackEnd cx={rcx} cy={rcy} w={rw} h={rh} units={growT > 0.5 ? 5 : 4} lit={2} />
        {browFlash ? <div style={{position: 'absolute', left: bx, top: by, width: 470 * bs, height: 42 * bs, background: 'rgba(255,255,255,.4)'}} /> : null}

        {/* 连线（两端之间，Cross 的落点） */}
        <Svg bloom={false}>
          <line x1={bx + 470 * bs + 12} y1={by + 85 * bs} x2={rcx - rw / 2 - 10} y2={rcy - 20} stroke={GREY_MID} strokeWidth={2} strokeDasharray="9 7" opacity={0.7} />
        </Svg>

        {/* ServerHello 卡（飞向浏览器） */}
        {shIn > 0 ? (
          <div style={{...abs(0, 0, 1280, 720), opacity: shIn * (flyT >= 1 ? Math.max(0, 1 - clamp01((N - 1861) / 8)) : 1)}}>
            <div style={{position: 'absolute', left: shX, top: shY, width: 260, height: 120, background: '#000', border: `2.5px solid ${WHITE}`, borderRadius: 10}}>
              <div style={{position: 'absolute', left: 18, top: 12, fontFamily: FONT_MONO, fontSize: 26, fontWeight: 700, color: WHITE}}>ServerHello</div>
              <div style={{position: 'absolute', left: 18, top: 52, fontFamily: FONT_MONO, fontSize: 18, color: GREY}}>key_share · certificate</div>
              <div style={{position: 'absolute', left: 18, top: 78, width: 120, height: 0, borderTop: `1.5px dashed ${GREY_MID}`}} />
            </div>
          </div>
        ) : null}

        {/* CertCard 缩微 + CA 邮戳 */}
        {ccIn > 0 ? (
          <div style={{...abs(0, 0, 1280, 720), opacity: ccIn}}>
            <CertCard x={770} y={440} w={260} h={175} domain="shop.example" ca="CA" stamped={stP} />
          </div>
        ) : null}

        {/* 双 KeyIcon（主角，紫光 + 缓转） */}
        <div style={{...abs(0, 0, 1280, 720), opacity: keyIn(0), filter: `drop-shadow(0 0 22px rgba(102,45,248,${(0.5 * glowK).toFixed(2)}))`}}>
          <div style={{transform: `rotate(${sway(0).toFixed(1)}deg)`}}>
            <KeyIcon cx={420} cy={300} size={185} glow />
          </div>
        </div>
        <div style={{...abs(0, 0, 1280, 720), opacity: keyIn(1), filter: `drop-shadow(0 0 22px rgba(102,45,248,${(0.5 * glowK).toFixed(2)}))`}}>
          <div style={{transform: `rotate(${sway(1).toFixed(1)}deg)`}}>
            <KeyIcon cx={860} cy={300} size={185} glow />
          </div>
        </div>

        {/* = 等号（两把钥匙之间上方） */}
        {eqIn > 0 ? (
          <div style={{...abs(0, 0, 1280, 720), opacity: eqIn, transform: `scale(${(0.6 + 0.4 * eqIn * emphasisPulse(N - 1930, {peak: 1.08})).toFixed(3)})`}}>
            <CText cx={640} cy={290} size={64} weight={700} family={FONT_ORB} color={PURPLE_LIGHT} letterSpacing={4} style={{textShadow: '0 0 22px rgba(161,117,241,.6)'}}>=</CText>
          </div>
        ) : null}
        {/* 白名单 glitch：the same secret（`=` 下方小字） */}
        <GlitchIn N={N} f0={1934} rgbSplit={6}>
          <div style={{...abs(0, 0, 1280, 720)}}>
            <CText cx={640} cy={345} size={26} weight={700} family={FONT_MONO} color={PURPLE_LIGHT} letterSpacing={1}>the same secret</CText>
          </div>
        </GlitchIn>

        {/* 连线中央大红 Cross（旋转盖下） */}
        {crossP > 0 ? (
          <div style={{...abs(0, 0, 1280, 720), opacity: crossP, transform: `rotate(${(1 - crossP) * 22}deg) scale(${1.3 - 0.3 * crossP})`}}>
            <Cross cx={640} cy={430} size={92} sw={6} />
          </div>
        ) : null}
        {greyIn > 0 ? (
          <div style={{...abs(0, 0, 1280, 720), opacity: greyIn}}>
            <CText cx={640} cy={520} size={24} weight={400} color={GREY}>nothing crosses the wire</CText>
          </div>
        ) : null}
      </div>
    </CameraRig>
  );
};
