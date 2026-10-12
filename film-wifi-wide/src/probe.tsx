import React from 'react';
import {useCurrentFrame} from 'remotion';
import {RouterGlyph, AirPulse, DeviceGlyph, ChannelBand, BackoffRing, PacketIcon, BrowserWin, CText, GREY, PURPLE_LIGHT, WHITE} from './ui';

/** 探针合成：一帧看全部 WiFi 新图元（派构建组之前先确认风格与尺寸） */
export const ProbeIcons: React.FC = () => {
  const N = useCurrentFrame() + 1;
  return (
    <div style={{position: 'absolute', inset: 0}}>
      <RouterGlyph cx={220} cy={190} s={1.35} glow label="the router" />
      <DeviceGlyph cx={480} cy={200} kind="laptop" w={170} label="your laptop" />
      <DeviceGlyph cx={660} cy={195} kind="phone" h={150} label="your phone" />
      <DeviceGlyph cx={900} cy={200} kind="tv" w={210} label="your TV" />
      <DeviceGlyph cx={1130} cy={330} kind="laptop" w={120} dim label="dimmed" />
      <AirPulse cx={220} cy={330} N={N} arcs={4} speed={10} maxR={95} glow />
      <AirPulse cx={480} cy={380} N={N} arcs={3} speed={14} maxR={80} color={PURPLE_LIGHT} glow />
      <AirPulse cx={1130} cy={480} N={N} arcs={3} speed={12} maxR={70} up={false} />
      <ChannelBand x={210} y={430} w={860} h={200} lit={[1, 6, 11]} />
      <BackoffRing cx={1050} cy={200} r={78} N={(N % 45) / 45} dots={5} glow />
      <BrowserWin x={60} y={110} w={140} h={110} url="probe" barP={0.4} />
      <PacketIcon cx={100} cy={300} w={60} h={42} accent glow />
      <CText cx={640} cy={680} size={24} color="#888">probe: wifi primitives (RouterGlyph/AirPulse/DeviceGlyph/ChannelBand/BackoffRing)</CText>
      <CText cx={640} cy={40} size={24} color={WHITE}>frame {N}</CText>
    </div>
  );
};
