import React from 'react';
import {useCurrentFrame} from 'remotion';
import {clamp01, FONT_ORB} from '../../common';
import {CameraRig} from '../../fx';
import {CText, Svg, SoftIn, Cross, GREY, GREY_MID, WHITE, PURPLE_LIGHT, abs, exitOp} from '../../ui';

/**
 * SC11 不过洋（2396–2678）。S15（¶段末章末：TO=2678，停在 Ch4 卡 2679–2723 前一帧）。
 * 节拍：2404 海浪线 draw-on（持续微动）+ 跨海弧 + 红 Cross（2447–2459）+ 近侧连线亮
 *       ｜2459 占比条伸展（20 帧）+ >½ 段紫光 ｜2507 `nearly all`（占比条尾段全亮 + emphasisPulse）
 *       ｜2598/2626 `served from an edge` 灰字。段末落位 ≥30 再离场。
 * 运镜：章末拉远 37 帧 1.12→1.0（{S15.c4}=2598 前结束）。主角：不过洋对照图 340px。零 glitch。
 */
const F0 = 2396;
const TO = 2678;

const SEA = {y: 560, x0: 120, x1: 1160};
const YOU = {x: 200, y: 380};
const EDGE = {x: 1080, y: 380};

export const SC11: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const exit = exitOp(N, TO, 8);

  // 海浪（2404 draw-on 18 帧；持续微动，TO−40=2638 冻结）
  const seaP = clamp01((N - 2404) / 18);
  const waveK = Math.min(Math.max((N - 2404) / 34, 0), (2638 - 2404) / 34);
  const wave = 4 * Math.sin((waveK * 2 * Math.PI)) ;

  // 跨海大弧（2422 draw-on 20 帧）+ Cross（2447–2459）
  const arcP = clamp01((N - 2422) / 20);
  const crossP = clamp01((N - 2447) / 12);
  // 近侧连线（2455 亮起 12 帧）
  const nearP = clamp01((N - 2455) / 12);
  // 占比条（2459 伸展 20 帧）+ nearly all（2507 全亮）
  const barP = clamp01((N - 2459) / 20);
  const allP = clamp01((N - 2507) / 12);
  // 灰字（2598）
  const greyIn = clamp01((N - 2598) / 8);

  return (
    <CameraRig N={N} keys={[{f: F0, x: 640, y: 360, s: 1.12}, {f: 2560, x: 640, y: 360, s: 1.12}, {f: 2597, x: 640, y: 360, s: 1}]}>
      <div style={{...abs(0, 0, 1280, 720), opacity: exit}}>
        {/* 连体大框（整幅对照图外框，大主体） */}
        <div style={{position: 'absolute', left: 100, top: 170, width: 1080, height: 430, border: `2.5px solid ${GREY_MID}`, borderTop: `12px solid rgba(255,255,255,0.35)`, borderRadius: 16, opacity: clamp01((N - 2406) / 8), background: 'rgba(255,255,255,0.03)'}} />
        {/* 海（波浪线带 + 小船） */}
        <Svg bloom={false}>
          {seaP > 0 ? Array.from({length: 12}).map((_, i) => {
            const x0 = SEA.x0 + i * 87, x1 = x0 + 60 * seaP;
            return <path key={i} d={`M${x0} ${SEA.y + wave * (i % 2)} q30 ${-14} 60 0 t30 0 t30 0`} fill="none" stroke={GREY_MID} strokeWidth={2.5} strokeLinecap="round" opacity={0.8} />;
          }) : null}
          {/* 跨海大弧（打叉） */}
          {arcP > 0 ? <path d={`M${YOU.x + 40} ${YOU.y - 30} Q640 120 ${EDGE.x - 40} ${EDGE.y - 30}`} fill="none" stroke={GREY_MID} strokeWidth={2.5} strokeDasharray="10 9" opacity={0.65 * arcP} /> : null}
          {/* 近侧连线（亮） */}
          {nearP > 0 ? <path d={`M${YOU.x + 40} ${YOU.y + 60} Q640 ${EDGE.y + 130} ${EDGE.x - 40} ${EDGE.y + 60}`} fill="none" stroke={PURPLE_LIGHT} strokeWidth={3.5} strokeLinecap="round" strokeDasharray={`${nearP * 900} 900`} /> : null}
        </Svg>
        {/* 小船 */}
        <Svg bloom={false}>
          <path d="M610 548 l60 0 l-12 18 l-36 0 Z" fill="#000" stroke={WHITE} strokeWidth={2.5} opacity={seaP} />
        </Svg>

        {/* 你 / 边缘 节点 */}
        <SoftIn N={N} f0={2404}>
          <CText cx={YOU.x} cy={YOU.y + 20} size={26} weight={700} color={WHITE}>you</CText>
          <CText cx={EDGE.x} cy={EDGE.y + 20} size={26} weight={700} color={PURPLE_LIGHT}>edge</CText>
        </SoftIn>

        {/* Cross（跨海弧中点） */}
        {crossP > 0 ? (
          <div style={{...abs(0, 0, 1280, 720), opacity: crossP, transform: `rotate(${(1 - crossP) * 16}deg) scale(${1.3 - 0.3 * crossP})`}}>
            <Cross cx={640} cy={195} size={86} sw={6} />
          </div>
        ) : null}

        {/* 占比条 */}
        {barP > 0 ? (
          <div style={{...abs(340, 620 - 260 + 130, 600, 44), opacity: 1}}>
            <div style={{position: 'absolute', left: 0, top: 0, width: 600, height: 44, border: `2px solid ${GREY_MID}`, borderRadius: 8, background: '#000'}} />
            <div style={{position: 'absolute', left: 2, top: 2, width: (596 * 0.5 * barP), height: 40, borderRadius: 6, background: 'rgba(102,48,248,.45)', boxShadow: '0 0 18px 6px rgba(102,48,248,.35)'}} />
            {allP > 0 ? <div style={{position: 'absolute', left: 2, top: 2, width: 596 * (0.5 + 0.42 * allP), height: 40, borderRadius: 6, background: 'rgba(102,48,248,.6)', boxShadow: '0 0 24px 8px rgba(102,48,248,.5)'}} /> : null}
            <div style={{position: 'absolute', left: 0, right: 0, top: 54, textAlign: 'center', fontFamily: 'inherit', fontSize: 24, color: GREY}}>video &gt; &frac12; of all traffic</div>
          </div>
        ) : null}

        {/* 灰字结论 */}
        {greyIn > 0 ? (
          <SoftIn N={N} f0={2598}>
            <CText cx={640} cy={600} size={24} weight={400} color={GREY}>served from an edge</CText>
          </SoftIn>
        ) : null}
      </div>
    </CameraRig>
  );
};
