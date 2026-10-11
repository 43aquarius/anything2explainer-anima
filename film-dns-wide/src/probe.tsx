import React from 'react';
import {useCurrentFrame} from 'remotion';
import {PacketIcon, ClockIcon, StickyNote, MilkCarton, PostcardIcon, PhoneBookIcon, PhoneIcon, StampSeal, TreeTier, EyeGlyph, RootTower, EXAMPLE, CText, RackIcon, PersonIcon} from './ui';

/** 探针合成：一帧看全部 DNS 新图元（派构建组之前先确认风格与尺寸） */
export const ProbeIcons: React.FC = () => {
  const N = useCurrentFrame() + 1;
  const k = (N % 120) / 120; // 0..1 循环，用于看动画形态
  return (
    <div style={{position: 'absolute', inset: 0}}>
      {/* 左上：层级树 */}
      <TreeTier cx={280} cy={280} w={480} progress={Math.min(1, k * 1.6)} litLeaf={Math.floor(k * 6)} />
      {/* 右上：根塔（heat 呼吸） */}
      <RootTower cx={900} cy={250} w={130} h={230} heat={k > 0.6 ? (k - 0.6) * 2.5 : 0} />
      <CText cx={900} cy={395} size={24} color="#A0A0A1">heat={k > 0.6 ? 'on' : 'off'}</CText>
      {/* 中排：便签 ×3（一张 lit） */}
      <StickyNote x={80} y={440} w={170} h={140} ttl={`${Math.round(60 - k * 60)} s`} lit={false} tilt={-2} seed={1} />
      <StickyNote x={280} y={440} w={190} h={150} lines={[EXAMPLE.domain, '= ' + EXAMPLE.ip]} ttl={EXAMPLE.ttl} lit ttlColor="#8FF740" tilt={2} seed={2} />
      {/* 中排右：牛奶盒 */}
      <MilkCarton cx={600} cy={500} w={180} h={240} label={`TTL ${EXAMPLE.ttl}`} dateText="fresh until" glow />
      {/* 右中：明信片 */}
      <PostcardIcon x={740} y={430} w={230} h={160} stampText="UDP" />
      {/* 右排：电话簿（站/倒） */}
      <PhoneBookIcon cx={1080} cy={480} w={120} h={160} label="DNS" fallen={k > 0.5} />
      {/* 下排：电话（听筒循环提起） */}
      <PhoneIcon cx={180} cy={620} w={100} h={110} lift={(Math.sin(k * Math.PI * 2) + 1) / 2} />
      {/* 下排中：眼睛开合 + 章印 + 时钟 + 信封 */}
      <EyeGlyph cx={330} cy={615} w={56} open={(Math.sin(k * Math.PI * 2) + 1) / 2 * 0.9 + 0.1} />
      <StampSeal cx={450} cy={610} r={38} text="OK" p={Math.min(1, k * 3)} />
      <ClockIcon cx={580} cy={615} r={44} N={N} />
      <PacketIcon cx={700} cy={615} w={84} h={58} accent glow />
      <PacketIcon cx={810} cy={615} w={84} h={58} stamp="?" />
      <PersonIcon cx={940} cy={610} size={92} label="resolver" />
      <div style={{position: 'absolute', left: 1000, top: 585}}><RackIcon cx={70} cy={40} w={100} h={170} lit={2} label="auth" /></div>
      <CText cx={640} cy={690} size={24} color="#888">probe: all dns primitives</CText>
    </div>
  );
};
