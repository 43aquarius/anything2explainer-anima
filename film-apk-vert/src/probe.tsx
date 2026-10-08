import React from 'react';
import {useCurrentFrame} from 'remotion';
import {EXAMPLE, ParcelIcon, HexDump, ManifestCard, WaxSeal, PhoneMock, PathRow, ZipperLine, SplitChip, PhotoCard, ClockIcon, CText, Pill, GPUChip, ChunkCard, ORANGE} from './ui';
import {Counter} from './ui';

/** 探针合成（竖版 720×1280，安全区 y240–990 / 中轴 x360）：一帧看全部本片新图元 */
export const ProbeIcons: React.FC = () => {
  const N = useCurrentFrame() + 1;
  const P = (N % 30) / 30;
  return (
    <div style={{position: 'absolute', inset: 0}}>
      {/* 第一屏段：包裹三态 + 手机 */}
      <ParcelIcon cx={170} cy={330} w={180} h={130} />
      <ParcelIcon cx={420} cy={330} w={180} h={130} openP={0.55} />
      <ParcelIcon cx={590} cy={620} w={180} h={130} accent glow sealP={P} />
      <PhoneMock x={60} y={440} w={250} h={430} installP={P} litN={5} screenLabel="ChatApp" glow />
      <ClockIcon cx={560} cy={900} r={64} N={N} />

      {/* 第二屏段：hex + 拉链 + 封印 */}
      <HexDump x={60} y={920} w={380} h={260} highlightP={P} bigPK={P > 0.5 ? (P - 0.5) * 2 : 0} />
      <ZipperLine cx={360} y={660} w={500} openP={P} />
      <WaxSeal cx={200} cy={1230} r={78} glow crackP={P > 0.6 ? (P - 0.6) * 2.5 : 0} stampP={Math.min(1, P * 2)} />
      <ManifestCard x={330} y={1190} w={380} h={160} revealP={P} active={P > 0.8} />

      {/* 第三屏段：路径 + split + 照片 */}
      <PathRow x={60} y={60} w={600} path={EXAMPLE.dataApp} note="the zip lives here" active />
      <PathRow x={60} y={110} w={600} path={EXAMPLE.dataData} note="sandbox" />
      <SplitChip cx={150} cy={190} label={EXAMPLE.splitBase} active />
      <SplitChip cx={390} cy={190} label={EXAMPLE.splitAbi} dim={P > 0.5} />
      <SplitChip cx={620} cy={190} label={EXAMPLE.splitLang} dim={P > 0.5} />
      <ChunkCard x={70} y={1560} w={250} h={52} title="classes.dex" active />
      <GPUChip cx={490} cy={1586} size={130} lit={P} label="dex2oat" />
      <Counter cx={620} cy={1660} size={54} value={EXAMPLE.dexLimit} />
      <PhotoCard x={70} y={1620} w={330} h={90} src="android_statues.jpg" source="photo: Atomic Taco · CC BY-SA 2.0 · Wikimedia Commons" note="SC12" scanP={P} />
      <CText cx={560} cy={60} size={34} weight={700} color={ORANGE}>{EXAMPLE.hexFirst}</CText>
      <Pill x={230} y={1120} w={260} h={52} text="APK probe" fontSize={28} />
    </div>
  );
};
