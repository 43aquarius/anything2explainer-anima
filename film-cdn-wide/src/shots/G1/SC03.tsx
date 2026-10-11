import React from 'react';
import {useCurrentFrame} from 'remotion';
import {clamp01, BEZ_SCALE_IN, easeInOutPow, FONT_ORB} from '../../common';
import {CameraRig, GlowBlob} from '../../fx';
import {CText, SoftIn, Svg, EdgeNode, PacketIcon, GREY_MID, WHITE, PURPLE_LIGHT, GREEN, abs, fadeIn, exitOp, glowOffK, mixHex, EXAMPLE} from '../../ui';
import {WorldMapCore, WORLD, solidArcD, arcPoint} from './g1ui';

/**
 * SC03 近处等待（669–840）。S05 + S06（¶ 段末，跨 gap 到章节卡前一日：TO=840，卡 841 起）。
 * 节拍：677 世界图承接位移（16 帧：0.825×→0.55× 缩移居左）+ `1 s` 计数复现（小，绿）
 *       ｜741 远弧中段红 Cross draw-on（12 帧）+ 远弧与 `8,000 km` 降饱和灰化（10 帧）
 *       ｜792 你的城市圆圈缩放入场（快弹）+ EdgeNode 点亮紫光 + 信封堆 + 本地短线 draw-on + 光点沿线跑（持续）
 * 段末停留：城市圈 792+8 落位 → 离场 834 起，hold ≥30 ✓（运镜 758–791 推近 1.12，不进末拍）。
 * 主角：城市圈+EdgeNode 280px（EdgeNode 紫光 / GlowBlob；Cross 红）。零 glitch（白名单）。
 */
const F0 = 669;
const TO = 840;

// 世界图缩小复用：translate(-98,122) scale(0.55)（transform-origin 0 0）→ you 节点屏幕位 (210,370)
const WT = {tx: -98, ty: 122, s: 0.55};
const YOU2 = {x: 210, y: 370};
const CIRCLE = {cx: 740, cy: 420, r: 145};
// 本地线：你 → 城市圈（亮紫）
const LINE = {p0: [210, 370], p1: [420, 455], p2: [598, 400]};

export const SC03: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const exit = exitOp(N, TO, 6); // 段末 6 帧归零（834–840，章节卡 841 起）
  const glowK = glowOffK(N, TO, 6, 6); // 紫光先灭再淡出（828–834）

  // ---- 世界图承接（677 起 16 帧：0.825× → 0.55× 缩移居左）----
  const wn = clamp01((N - 677) / 16);
  const wrapS = 1.5 + (1 - 1.5) * easeInOutPow(2.5)(wn); // 1.5 → 1.0
  const worldOp = fadeIn(N - 677, 8);

  // ---- 远弧否定（741：红 Cross + 灰化）----
  const crossP = clamp01((N - 741) / 12);
  const grey = clamp01((N - 741) / 10);
  const arcColor = mixHex(WHITE, GREY_MID, grey);
  const arcOp = 1 - 0.3 * grey;

  // ---- 你的城市圆圈（792 快弹缩放入场）----
  const cs = 0.45 + 0.55 * BEZ_SCALE_IN(clamp01((N - 786) / 8));
  const circOp = fadeIn(N - 786, 5);
  const nodeK = clamp01((N - 788) / 8); // EdgeNode 紫光渐亮
  const lineP = clamp01((N - 786) / 10); // 本地线 draw-on

  // 光点沿线跑（790 起，持续动作；末拍元素前挂 −6 拍内落位）
  const dotT = (i: number) => (((N - 790) * 0.016 + i * 0.33) % 1 + 1) % 1;

  // 机架指示灯（持续闪，承接 SC01）
  const ledPh = N % 30;
  const ledOn = ledPh < 10 || (ledPh >= 14 && ledPh < 17);

  return (
    <CameraRig N={N} keys={[{f: F0, x: 640, y: 360, s: 1}, {f: 758, x: 640, y: 360, s: 1}, {f: 785, x: 640, y: 410, s: 1.12}]}>
      <div style={abs(0, 0, 1280, 720)}>
        <div style={{...abs(0, 0, 1280, 720), opacity: exit}}>
          {/* ---- 世界简图（0.55× 居左，SC01 同一套路径）---- */}
          <div
            style={{
              ...abs(0, 0, 1280, 720),
              opacity: worldOp,
              transform: `translate(${WT.tx}px, ${WT.ty}px) scale(${(WT.s * wrapS).toFixed(4)})`,
              transformOrigin: '0 0',
            }}
          >
            <WorldMapCore
              contP={1}
              arcP={1}
              arcColor={arcColor}
              arcOp={arcOp}
              rackS={1}
              rackOp={1}
              youOp={1}
              ledOn={ledOn}
              crossP={crossP}
              labelNode={
                <CText
                  cx={WORLD.km.x}
                  cy={WORLD.km.y}
                  size={44}
                  weight={700}
                  family={FONT_ORB}
                  color={mixHex('#F05F41', '#A0A0A1', grey)}
                  letterSpacing={1}
                  opacity={1 - 0.45 * grey}
                >
                  {EXAMPLE.distanceKm}
                </CText>
              }
            />
          </div>

          {/* ---- `1 s` 计数复现（小，绿）---- */}
          <SoftIn N={N} f0={678}>
            <CText cx={CIRCLE.cx} cy={205} size={44} weight={700} family={FONT_ORB} color={GREEN} letterSpacing={1} shadow={`0 0 ${(16 + 22 * glowK).toFixed(0)}px rgba(143,247,64,${(0.4 + 0.2 * glowK).toFixed(2)})`}>
              {EXAMPLE.playTime}
            </CText>
          </SoftIn>

          {/* ---- 本地线（你 → 城市圈，亮紫）+ 光点持续跑 ---- */}
          <Svg bloom={false}>
            {lineP > 0 ? <path d={solidArcD(LINE.p0, LINE.p1, LINE.p2, lineP)} fill="none" stroke={PURPLE_LIGHT} strokeWidth={5} strokeLinecap="round" opacity={0.85} /> : null}
            {lineP >= 1 ? (
              <polygon points="598,400 584.7,411.4 580.7,398.0" fill={PURPLE_LIGHT} />
            ) : null}
          </Svg>
          {lineP >= 1
            ? [0, 1, 2].map((i) => {
                const t = dotT(i);
                const f = clamp01(t / 0.08) * clamp01((1 - t) / 0.08);
                const [x, y] = arcPoint(LINE.p0, LINE.p1, LINE.p2, t);
                return f <= 0.02 ? null : (
                  <div key={i} style={{...abs(x - 4.5, y - 4.5, 9, 9), borderRadius: '50%', background: PURPLE_LIGHT, boxShadow: `0 0 8px rgba(161,117,241,.95)`, opacity: f}} />
                );
              })
            : null}
          {/* you 节点锚点光（线的起点） */}
          {lineP > 0 ? <div style={{...abs(YOU2.x - 6, YOU2.y - 6, 12, 12), borderRadius: '50%', background: WHITE, boxShadow: `0 0 10px rgba(255,255,255,${(0.8 * glowK).toFixed(2)})`}} /> : null}

          {/* ---- 你的城市圆圈（主角：EdgeNode 紫光 + GlowBlob + 信封堆）---- */}
          <div style={{...abs(0, 0, 1280, 720), opacity: circOp, transform: `scale(${cs.toFixed(3)})`, transformOrigin: `${CIRCLE.cx}px ${CIRCLE.cy}px`}}>
            <GlowBlob cx={CIRCLE.cx} cy={CIRCLE.cy + 25} r={195} N={N} k={glowK * nodeK} />
            <Svg bloom={false}>
              <circle cx={CIRCLE.cx} cy={CIRCLE.cy} r={CIRCLE.r} fill="rgba(102,45,248,0.10)" stroke={WHITE} strokeWidth={3.5} opacity={0.55 + 0.45 * glowK} />
            </Svg>
            <EdgeNode cx={725} cy={395} w={130} h={152} lit label="edge" labelSize={24} glow />
            {/* 信封堆（早就等着的副本：顶上一枚高亮紫 = 那部电影） */}
            <PacketIcon cx={800} cy={500} w={56} h={38} opacity={clamp01((N - 786) / 5)} />
            <PacketIcon cx={838} cy={492} w={56} h={38} opacity={clamp01((N - 788) / 5)} />
            <PacketIcon cx={818} cy={524} w={56} h={38} accent opacity={clamp01((N - 790) / 5)} />
          </div>
        </div>
      </div>
    </CameraRig>
  );
};
