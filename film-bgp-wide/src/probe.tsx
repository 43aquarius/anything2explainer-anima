import React from 'react';
import {useCurrentFrame} from 'remotion';
import {FONT_ORB} from './common/lib';
import {CText, AsChip, RouteNote, MapFrame, SigSeal, VoiceDot, PacketIcon, BrowserWin, PURPLE_LIGHT, WHITE, GREY} from './ui';

/** 探针：一帧渲染全部 BGP 新图元（镜头构建前用 still 检查分区/压线/光效） */
export const ProbeIcons: React.FC = () => {
  const N = useCurrentFrame();
  return (
    <div style={{position: 'absolute', inset: 0, background: '#000'}}>
      <MapFrame cx={340} cy={280} w={560} h={400} />
      <AsChip cx={180} cy={180} w={130} h={130} asn="AS64512" label="you" led="on" />
      <AsChip cx={480} cy={180} w={130} h={130} asn="AS32934" label="Facebook" led="on" accent glow />
      <AsChip cx={180} cy={420} w={100} h={100} asn="AS7007" led="lie" dim />
      <RouteNote x={440} y={330} prefix="203.0.113.0/24" via="via AS1299 · AS64512" signed />
      <RouteNote x={80} y={520} prefix="208.65.153.0/24" ghost />
      <SigSeal cx={600} cy={500} r={72} />
      <SigSeal cx={740} cy={140} r={48} ghost />
      <VoiceDot cx={900} cy={200} N={N} maxR={110} />
      <VoiceDot cx={1060} cy={380} N={N} speed={50} rings={4} maxR={90} color={PURPLE_LIGHT} />
      <PacketIcon cx={900} cy={480} accent glow stamp="hop 3" />
      <BrowserWin x={980} y={520} w={280} h={180} url="facebook.com" skeleton={0} barP={0.42} />
      <CText cx={640} cy={40} size={30} weight={700} family={FONT_ORB} color={WHITE}>BGP probe — all primitives</CText>
      <CText cx={640} cy={690} size={22} weight={400} color={GREY}>frame {N}</CText>
    </div>
  );
};
