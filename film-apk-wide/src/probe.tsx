import React from 'react';
import {useCurrentFrame} from 'remotion';
import {EXAMPLE, ParcelIcon, HexDump, ManifestCard, WaxSeal, KeyGlyph, PhoneMock, PathRow, ZipperLine, SplitChip, PhotoCard, ClockIcon, CText, Pill, GPUChip, ChunkCard, ORANGE, GREY_MID} from './ui';
import {Counter} from './ui';

/** 探针合成：一帧看全部本片新图元（派构建组之前先确认风格与尺寸） */
export const ProbeIcons: React.FC = () => {
  const N = useCurrentFrame() + 1;
  const P = (N % 30) / 30; // 0–1 循环，模拟各动画参数
  return (
    <div style={{position: 'absolute', inset: 0}}>
      {/* 第一行：包裹（母题）三态：闭合 / 半开 / accent 发光 */}
      <ParcelIcon cx={140} cy={150} w={140} h={100} />
      <ParcelIcon cx={330} cy={150} w={140} h={100} openP={0.5} />
      <ParcelIcon cx={520} cy={150} w={140} h={100} accent glow sealP={P} />
      <PhoneMock x={640} y={60} w={190} h={360} installP={P} litN={4} screenLabel="ChatApp" glow />
      <ClockIcon cx={980} cy={150} r={58} N={N} />

      {/* 第二行：十六进制窗口（PK 魔数高亮 + 大字叠加） + 拉链条 */}
      <HexDump x={70} y={280} w={520} h={210} highlightP={P} bigPK={P > 0.5 ? (P - 0.5) * 2 : 0} />
      <ZipperLine cx={640} y={300} w={420} openP={P} />
      <KeyGlyph cx={1060} cy={310} w={150} glow />
      <WaxSeal cx={1060} cy={430} r={62} glow crackP={P > 0.6 ? (P - 0.6) * 2.5 : 0} stampP={Math.min(1, P * 2)} />

      {/* 第三行：面单卡 + 目录行 + split 芯片 */}
      <ManifestCard x={80} y={520} w={330} h={170} revealP={P} active={P > 0.8} />
      <PathRow x={460} y={530} path={EXAMPLE.dataApp} note="the zip lives here" active />
      <PathRow x={460} y={570} path={EXAMPLE.dataData} note="sandbox" />
      <PathRow x={460} y={610} path=".../classes.dex" note="bytecode" />
      <SplitChip cx={800} cy={560} label={EXAMPLE.splitBase} active />
      <SplitChip cx={990} cy={560} label={EXAMPLE.splitAbi} dim={P > 0.5} />
      <SplitChip cx={1150} cy={560} label={EXAMPLE.splitLang} dim={P > 0.5} />

      {/* 第四行：dex → CPU（dex2oat 视觉）+ 计数 + 照片卡 */}
      <ChunkCard x={90} y={660} w={210} h={40} title="classes.dex" active />
      <GPUChip cx={400} cy={682} size={110} lit={P} label="dex2oat" />
      <Counter cx={540} cy={682} size={44} value={EXAMPLE.dexLimit} />
      <PhotoCard x={620} y={640} w={280} h={70} src="android_statues.jpg" source="photo: Atomic Taco · CC BY-SA 2.0 · Wikimedia Commons" note="SC31" scanP={P} />
      <CText cx={1020} cy={680} size={30} weight={700} color={ORANGE}>{EXAMPLE.hexFirst}</CText>
      <Pill x={40} y={40} w={220} h={48} text="APK probe" fontSize={26} />
    </div>
  );
};
