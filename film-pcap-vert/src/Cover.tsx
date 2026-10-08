import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Fonts, FONT_WIDE, FONT_ORB, FONT_MONO, FONT_HEAVY} from './common';
import {CText, PacketIcon, PURPLE_LIGHT, PURPLE_TECH, WHITE, GREY_LIGHT} from './ui';

/** 封面（发布物料 · TikTok 封面 720×1280）：大字钩子 + 信封母题。安全区 x40–620 / y240–990。 */
export const Cover: React.FC = () => (
  <AbsoluteFill style={{background: '#000'}}>
    <Fonts />
    <AbsoluteFill style={{backgroundImage: 'radial-gradient(rgba(255,255,255,0.05) 1.2px, transparent 1.2px)', backgroundSize: '28px 28px'}} />
    <div style={{position: 'absolute', left: 40, top: 240, width: 540, height: 760, background: 'radial-gradient(ellipse at center, rgba(102,48,248,0.18), transparent 70%)'}} />

    {/* 视觉母题：三连信封 */}
    <PacketIcon cx={250} cy={560} w={320} h={220} glow />
    <PacketIcon cx={380} cy={440} w={280} h={200} glow opacity={0.9} />
    <PacketIcon cx={480} cy={330} w={230} h={165} glow opacity={0.75} />
    <div style={{position: 'absolute', left: 130, top: 618, width: 460, height: 48, border: '2px solid rgba(255,255,255,0.5)', borderRadius: 8, background: '#000'}}>
      <div style={{fontFamily: FONT_MONO, fontSize: 25, color: WHITE, lineHeight: '44px', textAlign: 'center'}}>tcp<span style={{color: PURPLE_LIGHT}}>.</span>retransmission</div>
    </div>

    {/* 大字钩子 */}
    <CText cx={360} cy={762} size={76} weight={900} family={FONT_HEAVY} color={WHITE} letterSpacing={2}>THE WIRE</CText>
    <CText
      cx={360}
      cy={880}
      size={94}
      weight={400}
      family={FONT_WIDE}
      color={WHITE}
      letterSpacing={1}
      style={{WebkitTextStroke: `3.5px ${PURPLE_LIGHT}`, paintOrder: 'stroke fill', textShadow: '0 0 20px rgba(161,117,241,0.55), 0 0 5px rgba(161,117,241,0.5)'}}
    >
      DOESN'T LIE.
    </CText>

    {/* chips */}
    <div style={{position: 'absolute', left: 105, top: 952, width: 290, height: 54, border: '2.5px solid rgba(255,255,255,0.75)', borderRadius: 6, background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
      <div style={{fontFamily: FONT_MONO, fontSize: 27, color: WHITE, letterSpacing: 1}}>Wireshark</div>
    </div>
    <CText cx={520} cy={979} size={54} weight={700} family={FONT_ORB} color={PURPLE_TECH} letterSpacing={2} shadow="0 0 14px rgba(101,48,244,.6)">1988</CText>

    <CText cx={360} cy={1072} size={27} weight={500} family={FONT_MONO} color={GREY_LIGHT}>pcap — how packet capture works</CText>
  </AbsoluteFill>
);
