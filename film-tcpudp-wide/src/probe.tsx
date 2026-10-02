import React from 'react';
import {useCurrentFrame} from 'remotion';
import {EXAMPLE, PacketIcon, ClockIcon, PhotoCard, PostcardIcon, SeqStamp, HeaderBar, CallWindow, WaveformStrip, MailboxIcon, NodeDot, PuzzlePhoto, PortRail, GamepadIcon, CText, Pill, ORANGE, GREY_MID} from './ui';
import {BigNumber} from './fx';

/** 探针合成：一帧看全部本片新图元（派构建组之前先确认风格与尺寸） */
export const ProbeIcons: React.FC = () => {
  const N = useCurrentFrame() + 1;
  const P = (N % 30) / 30; // 0–1 循环，模拟各动画参数
  return (
    <div style={{position: 'absolute', inset: 0}}>
      {/* 第一行：照片卡 ×2（真实素材） */}
      <PhotoCard x={60} y={110} w={300} h={200} src="fiber_strip.jpg" scanP={P} note="SC03" />
      <PhotoCard x={400} y={110} w={180} h={200} src="cerf_2007.jpg" source="photo: Wikimedia Commons" note="SC11" />

      {/* 第二行：通话窗口 + 波形 + 拼图 */}
      <CallWindow x={640} y={110} w={300} h={200} progress={P} haloP={0.5 + 0.5 * P} />
      <WaveformStrip x={980} y={140} w={220} h={80} gapFrom={10} gapTo={12} breatheP={P} revealP={P} />
      <PuzzlePhoto x={60} y={360} w={240} h={160} filled={5} missingIdx={4} missPulse={P} />

      {/* 第三行：明信片 / 信封+编号章 / 手柄 / 邮箱 */}
      <PostcardIcon cx={460} cy={420} w={150} h={100} accent glow stampP={P} />
      <PacketIcon cx={600} cy={420} w={80} h={54} accent glow stamp="re" />
      <SeqStamp cx={660} cy={390} label="#3" glow scale={1 + 0.1 * P} />
      <GamepadIcon cx={780} cy={420} size={100} />
      <MailboxIcon cx={920} cy={420} w={110} h={90} flagUp={P > 0.5} />

      {/* 第四行：头部条对比 + 端口轨 + 节点 */}
      <HeaderBar x={60} y={560} w={300} h={52} progress={P} fields={[{label: 'src port', weight: 1}, {label: 'dst port', weight: 1}, {label: 'length', weight: 1}, {label: 'checksum', weight: 1}]} accent={ORANGE} />
      <HeaderBar x={400} y={560} w={480} h={52} progress={P} fields={[{label: 'ports', weight: 2}, {label: 'seq', weight: 1}, {label: 'ack', weight: 1}, {label: 'flags', weight: 1}, {label: 'window', weight: 1}]} accent={GREY_MID} dim labelSize={20} />
      <div style={{position: 'absolute', left: 920, top: 560}}><PortRail x={0} y={40} w={300} label="UDP ports" color={ORANGE} sweepP={P} tickN={N} /></div>
      <NodeDot cx={100} cy={300} r={40} label="you" glowP={P} />

      {/* 大字采样 */}
      <BigNumber cx={1130} cy={330} value={EXAMPLE.totalWait} size={64} color={ORANGE} />
      <Pill x={1060} y={420} w={140} h={44} text={EXAMPLE.quicId} fontSize={24} />
      <ClockIcon cx={1130} cy={520} r={50} N={N} />
      <CText cx={640} cy={700} size={24} color="#888">probe: tcpudp primitives (P={P.toFixed(2)})</CText>
    </div>
  );
};
