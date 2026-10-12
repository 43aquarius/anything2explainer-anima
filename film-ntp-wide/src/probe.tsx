import React from 'react';
import {useCurrentFrame} from 'remotion';
import {FONT_ORB} from './common/lib';
import {CText, ClockFace, QuartzCrystal, AtomClock, SatGlyph, StratumTier, DriftLine, EXAMPLE, WHITE, GREY, PURPLE_LIGHT} from './ui';

/** 探针：一帧渲染全部 NTP 新图元（镜头构建前用 still 检查分区/压线/光效） */
export const ProbeIcons: React.FC = () => {
  const N = useCurrentFrame();
  return (
    <div style={{position: 'absolute', inset: 0, background: '#000'}}>
      <ClockFace cx={230} cy={220} r={120} N={N} glow label="your laptop" readout={EXAMPLE.readGood} />
      <ClockFace cx={230} cy={480} r={70} N={N} rate={0.5} ghost readout="11:59:52" />
      <QuartzCrystal cx={520} cy={140} N={N} label="quartz" />
      <AtomClock cx={640} cy={330} N={N} glow label="stratum 0" />
      <SatGlyph cx={950} cy={170} N={N} label="GPS" />
      <StratumTier cx={950} y={330} w={330} n={4} label="stratum 2" lit />
      <StratumTier cx={950} y={400} w={330} n={6} dim />
      <DriftLine x={120} y={610} w={500} k={0.55} label={EXAMPLE.driftDay} />
      <CText cx={640} cy={40} size={30} weight={700} family={FONT_ORB} color={WHITE}>NTP probe — all primitives</CText>
      <CText cx={640} cy={690} size={22} weight={400} color={GREY}>frame {N}</CText>
    </div>
  );
};
