import React from 'react';
import {useCurrentFrame} from 'remotion';
import {PacketIcon, ClockIcon, EXAMPLE, CText, RackIcon, PersonIcon, BrowserWin, EdgeNode, GlobeArc, CacheShelf} from './ui';

/** 探针合成：一帧看全部 CDN 新图元（派构建组之前先确认风格与尺寸） */
export const ProbeIcons: React.FC = () => {
  const N = useCurrentFrame() + 1;
  return (
    <div style={{position: 'absolute', inset: 0}}>
      <BrowserWin x={60} y={110} w={420} h={330} url="player" barP={1} />
      <EdgeNode cx={640} cy={220} w={130} h={150} glow label="edge node" />
      <GlobeArc cx={980} cy={240} r={150} glow centerText="one IP" centerSize={48} />
      <CacheShelf cx={300} cy={540} w={340} h={300} litRow={1} glow label="edge cache" />
      <div style={{position: 'absolute', left: 560, top: 480}}><RackIcon cx={80} cy={80} w={140} h={200} lit={2} label="origin" /></div>
      <PersonIcon cx={820} cy={540} size={120} label="you" />
      <PacketIcon cx={960} cy={540} w={72} h={50} accent glow />
      <ClockIcon cx={1100} cy={540} r={56} N={N} />
      <CText cx={640} cy={690} size={24} color="#888">probe: cdn primitives (EdgeNode/GlobeArc/CacheShelf + BrowserWin/RackIcon/PersonIcon)</CText>
    </div>
  );
};
