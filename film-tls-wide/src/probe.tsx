import React from 'react';
import {useCurrentFrame} from 'remotion';
import {PacketIcon, ClockIcon, EXAMPLE, CText, RackIcon, PersonIcon, PostcardIcon, StampSeal, EyeGlyph, BrowserWin, SheepIcon, LockSeal, PaintPot, CertCard, KeyIcon, AtomIcon, NoiseField} from './ui';

/** 探针合成：一帧看全部 TLS 新图元（派构建组之前先确认风格与尺寸） */
export const ProbeIcons: React.FC = () => {
  const N = useCurrentFrame() + 1;
  return (
    <div style={{position: 'absolute', inset: 0}}>
      <BrowserWin x={60} y={110} w={420} h={330} url={EXAMPLE.url} skelLit={3} barP={1} />
      <PostcardIcon x={540} y={110} w={300} h={200} stampText="HTTP" />
      <CertCard x={900} y={110} w={320} h={220} stamped={1} accent />
      <div style={{position: 'absolute', left: 980, top: 120}}><RackIcon cx={140} cy={120} w={180} h={260} lit={2} label="server" /></div>
      <SheepIcon cx={240} cy={540} w={220} h={160} glow />
      <LockSeal cx={480} cy={520} w={110} h={140} glow openK={(N % 60) / 60} />
      <PaintPot cx={700} cy={520} w={160} h={130} fill="#F2C94C" fillK={1} label="public" />
      <PaintPot cx={880} cy={520} w={160} h={130} fill="#E0455A" fillK={0.7} label="secret" />
      <KeyIcon cx={1080} cy={520} size={150} glow broken={(N % 45) / 45} />
      <AtomIcon cx={230} cy={760} size={150} spin={N} label="ML-KEM" />
      <NoiseField x={420} y={700} w={420} h={160} N={N} hot />
      <div style={{position: 'absolute', left: 60, top: 480}}>
        <PacketIcon cx={60} cy={30} w={72} h={50} />
        <PacketIcon cx={170} cy={30} w={72} h={50} accent glow stamp="re" />
      </div>
      <EyeGlyph cx={880} cy={180} w={56} open={Math.max(0.06, Math.abs(Math.sin(N / 20)))} />
      <StampSeal cx={940} cy={360} r={44} text="CA" p={Math.min(1, N / 30)} />
      <ClockIcon cx={1000} cy={620} r={56} N={N} />
      <CText cx={640} cy={900} size={24} color="#888">probe: tls primitives (sheep/lock/paint/cert/key/atom/noise + kept postcard/stamp/eye/browser)</CText>
    </div>
  );
};
