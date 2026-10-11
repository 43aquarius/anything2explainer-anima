import React from 'react';
import {useCurrentFrame} from 'remotion';
import {PacketIcon, BrowserMock, LogCard, SwitchBox, TapBox, NICIcon, WSWindow, WSRow, FilterBar, ClockIcon, EXAMPLE, CText, RackIcon, PersonIcon} from './ui';

/** 探针合成：一帧看全部新图元（派构建组之前先确认风格与尺寸） */
export const ProbeIcons: React.FC = () => {
  const N = useCurrentFrame() + 1;
  return (
    <div style={{position: 'absolute', inset: 0}}>
      <BrowserMock x={60} y={110} w={420} h={330} progress={0.62} />
      <LogCard x={540} y={110} w={380} h={330} rows={4} highlight={2} />
      <div style={{position: 'absolute', left: 980, top: 120}}><RackIcon cx={140} cy={120} w={180} h={260} lit={2} label="server" /></div>
      <SwitchBox cx={330} cy={560} w={540} h={130} N={N} label="switch" accent />
      <TapBox cx={640} cy={560} w={160} h={110} />
      <NICIcon cx={1050} cy={560} w={380} h={160} chipGlow label="NIC" />
      <div style={{position: 'absolute', left: 60, top: 480}}>
        <PacketIcon cx={60} cy={30} w={72} h={50} />
        <PacketIcon cx={170} cy={30} w={72} h={50} accent glow stamp="re" />
      </div>
      <WSWindow x={60} y={480} w={300} h={200} paneBorders={[true, false, false]}>
        <WSRow x={3} y={49} w={294} row={EXAMPLE.wsRows[3]} active />
        <WSRow x={3} y={101} w={294} row={EXAMPLE.wsRows[0]} />
      </WSWindow>
      <FilterBar x={400} y={480} w={360} h={54} shown={13} />
      <ClockIcon cx={1000} cy={180} r={56} N={N} />
      <CText cx={640} cy={690} size={24} color="#888">probe: all pcap primitives</CText>
    </div>
  );
};
