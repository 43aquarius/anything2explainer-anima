import React from 'react';
import {useCurrentFrame} from 'remotion';
import {GlitchIn, FONT_ORB} from '../../common';
import {CameraRig} from '../../fx';
import {CText, GREY, exitOp, glowOffK, SoftIn} from '../../ui';
import {ServerRing} from './shared';

/**
 * SC10 四台答案 · N 2005–2163（S18–S19：节拍 2013/2046/2094/2134）。
 * S18：2013「So your laptop asks」/ 2046「four servers at once.」
 * S19：2094「Their answers disagree —」/ 2134「of course they do.」
 * 版式：中央 `your laptop` + 四台服务器弧形环绕（srv A–D 机架 + 各一只小时钟读数）+ 四条连线扇形散射；
 *   读数 `11:59:58 / 11:59:59 / 12:00:01 / 11:59:52`（EXAMPLE.reads，D 台微抖）；
 *   2134 相邻读数间比对弧 draw-on（A–B ✓、B–C ✓、C–D 弧上 ?）。
 * 动效：2007 笔记本缩入（拍 2013 前挂 −6）；2013 四机架 2f 错峰缩入 + 连线 3f 错峰 draw-on；
 *   2027+2i 四只询问信封沿连线飞向机架（12f，到站灯闪）；
 *   2046 四只小时钟**同帧**弹入（"at once"）+ `four servers` Orbitron 44 灰 GlitchIn（rgbSplit 4，本镜唯一，白名单）；
 *   2094 四读数**同帧**出现（"同时到"）+ 秒针各自走（速率微差，持续）+ D 读数微微抖动；
 *   2134 比对弧错峰 draw-on + ✓✓? 记号 + `of course they do` 灰字 SoftIn。
 * 运镜：2080–2113 33f 1→1.12 推向钟群（末 key 2113 = TO−50 ✓；分镜表"2094 时"前挂 14f，保末拍不进运镜）。
 * 环不清场：主角环直通 SC11（CDN SC13→SC14 承接先例；SC10 仅两行灰字 exitOp 离场）→ hold 带 ~。
 * 停留：段内不判（S19 末块 27）。
 */
const F0 = 2005;
const TO = 2163;

/** SC10 入场节拍（SC11 复用同一组 → N≥2164 时入场全部饱和，实现帧级无缝承接） */
const B = {racks: 2013, lines: 2014, clocks: 2046, reads: 2094, arcs: 2134};

const T_TEXT = 2046; // `four servers` GlitchIn（S18.c2）
const T_OFCD = 2136; // `of course they do`（S19.c2 拍 2134 +2）

export const SC10: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const exit = exitOp(N, TO, 5); // 只有本镜两行灰字离场（环直通 SC11）
  const gk = glowOffK(N, TO, 3, 5);

  return (
    <CameraRig N={N} keys={[{f: F0, x: 640, y: 360, s: 1}, {f: 2080, x: 640, y: 360, s: 1}, {f: 2113, x: 640, y: 340, s: 1.12}]}>
      {/* ---- 主角环（不清场直通 SC11）---- */}
      <ServerRing N={N} B={B} glowK={gk} />

      {/* ---- four servers（Orbitron 44 灰；本镜唯一 glitch，白名单）---- */}
      <GlitchIn N={N} f0={T_TEXT} rgbSplit={4} seed={15} style={{opacity: exit}}>
        <CText
          cx={640}
          cy={144}
          size={44}
          weight={700}
          family={FONT_ORB}
          color={GREY}
          letterSpacing={1}
          shadow={`0 0 14px rgba(255,255,255,${(0.2 * gk).toFixed(2)})`}
        >
          four servers
        </CText>
      </GlitchIn>

      {/* ---- of course they do（灰，S19.c2）---- */}
      <SoftIn N={N} f0={T_OFCD} len={8} style={{opacity: exit}}>
        <CText cx={640} cy={602} size={26} weight={600} color={GREY}>of course they do</CText>
      </SoftIn>
    </CameraRig>
  );
};
