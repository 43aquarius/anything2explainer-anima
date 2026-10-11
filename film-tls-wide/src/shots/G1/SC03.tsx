import React from 'react';
import {useCurrentFrame} from 'remotion';
import {clamp01, powOutRemain, GlitchIn} from '../../common';
import {CameraRig, HeroGlow} from '../../fx';
import {PostcardIcon, EyeGlyph, CText, Svg, SoftIn, GREY, GREY_MID, WHITE, abs, fadeIn, exitOp, glowOffK} from '../../ui';

/**
 * SC03 明信片（444–601）。S04。
 * 节拍：452 明信片自下滑入（Δ110，22 帧）+ HeroGlow 点亮 + `HTTP is a postcard` 标题 SoftIn（上方针线）
 *       ｜514 路径 draw-on（左到右 20 帧）+ 5 节点 2 帧错峰亮起 + 5 只眼睛依次睁开（每只 8 帧）
 *       → 之后眼睛眨动循环（30 帧周期错峰，持续）+ 明信片沿路径轻推 8px（传递感）。
 * 运镜：33 帧 1→1.12 推向明信片（470–503，514 前结束）。主角：明信片 320px（HeroGlow 常亮）；眼睛白。
 */
const F0 = 444;
const TO = 601;

const PC = {x: 410, y: 190, w: 460, h: 320}; // 明信片（主角，中央）
const PATH_Y = 560;
const NODES = [
  {x: 240, label: 'you'},
  {x: 440, label: 'router'},
  {x: 640, label: 'ISP'},
  {x: 840, label: 'backbone'},
  {x: 1040, label: 'server'},
];
const PATH_LEN = 1040 - 240;

export const SC03: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const exit = exitOp(N, TO, 8);
  const glowK = glowOffK(N, TO);

  // 明信片 slideUp Δ110 / 22 帧 + 沿路径轻推 8px（516 起 12 帧）
  const pn = N - 452;
  const pcDy = 110 * powOutRemain(pn, 22, 2.5);
  const pcOp = fadeIn(pn, 6);
  const push8 = 8 * clamp01((N - 516) / 12);

  // 路径 draw-on（514 起 20 帧）
  const pathP = clamp01((N - 514) / 20);

  // 眼睛：随节点 2 帧错峰出现（闭眼缝）→ 依次睁开（516+i*7，各 8 帧）→ 560 起眨眼循环（错峰）
  const eyeOpen = (i: number) => {
    const t0 = 516 + i * 7;
    if (N < t0) return 0.06;
    if (N < t0 + 8) return 0.06 + 0.94 * clamp01((N - t0) / 8);
    const ph = (N + i * 6) % 30;
    return ph < 5 ? Math.max(0.15, 1 - Math.sin((Math.PI * ph) / 5) * 0.85) : 1;
  };

  return (
    <CameraRig N={N} keys={[{f: F0, x: 640, y: 360, s: 1}, {f: 470, x: 640, y: 360, s: 1}, {f: 503, x: 640, y: 355, s: 1.12}]}>
      <div style={abs(0, 0, 1280, 720)}>
        <div style={{...abs(0, 0, 1280, 720), opacity: exit}}>
          {/* ---- 传递路径（y560 水平线 + 5 节点 + 标签）---- */}
          <Svg bloom={false}>
            {pathP > 0 ? (
              <line x1={240} y1={PATH_Y} x2={240 + PATH_LEN * pathP} y2={PATH_Y} stroke={GREY_MID} strokeWidth={2.5} strokeLinecap="round" />
            ) : null}
            {NODES.map((nd, i) => {
              const on = clamp01((N - (514 + i * 2)) / 8);
              return on <= 0 ? null : (
                <g key={nd.x} opacity={on}>
                  <circle cx={nd.x} cy={PATH_Y} r={5.5} fill="#000" stroke={WHITE} strokeWidth={2.5} />
                </g>
              );
            })}
          </Svg>
          {NODES.map((nd, i) => {
            const on = clamp01((N - (514 + i * 2)) / 8);
            return (
              <div key={nd.x} style={{...abs(0, 0, 1280, 720), opacity: on}}>
                <EyeGlyph cx={nd.x} cy={533} w={44} open={eyeOpen(i)} />
                <CText cx={nd.x} cy={585} size={22} weight={600} color={GREY}>{nd.label}</CText>
              </div>
            );
          })}

          {/* ---- 明信片（主角，HeroGlow 常亮）---- */}
          <div style={{...abs(0, 0, 1280, 720), opacity: pcOp, transform: `translate(${push8.toFixed(1)}px, ${pcDy.toFixed(1)}px)`}}>
            <HeroGlow x={PC.x} y={PC.y} w={PC.w} h={PC.h} r={18} N={N} k={clamp01((N - 456) / 8) * glowK} />
            <PostcardIcon x={PC.x} y={PC.y} w={PC.w} h={PC.h} lines={['GET /cart', 'password=cafe2026', 'GET /checkout']} stampText="HTTP" />
          </div>

          {/* ---- 标题（HTTP is a postcard + 下方针线，SoftIn）---- */}
          <SoftIn N={N} f0={452}>
            <Svg bloom={false}>
              <line x1={575} y1={179} x2={705} y2={179} stroke={GREY_MID} strokeWidth={2.5} strokeLinecap="round" strokeDasharray="10 8" />
            </Svg>
          </SoftIn>
          <GlitchIn N={N} f0={452} rgbSplit={4}>
            <div style={{...abs(0, 0, 1280, 720)}}>
              <CText cx={640} cy={152} size={48} weight={900} color={WHITE} letterSpacing={0.5}>HTTP is a postcard</CText>
            </div>
          </GlitchIn>
        </div>
      </div>
    </CameraRig>
  );
};
