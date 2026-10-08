import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Fonts, FONT_WIDE, FONT_ORB, FONT_MONO, FONT_HEAVY} from './common';
import {CText, PacketIcon, PostcardIcon, PURPLE_LIGHT, PURPLE_TECH, WHITE, GREY_LIGHT} from './ui';

/** 封面（发布物料 · TikTok 封面 720×1280）：大字钩子 + 信封/明信片母题。安全区 x40–620 / y240–990。 */
export const Cover: React.FC = () => (
  <AbsoluteFill style={{background: '#000'}}>
    <Fonts />
    <AbsoluteFill style={{backgroundImage: 'radial-gradient(rgba(255,255,255,0.05) 1.2px, transparent 1.2px)', backgroundSize: '28px 28px'}} />
    <div style={{position: 'absolute', left: 40, top: 240, width: 540, height: 760, background: 'radial-gradient(ellipse at center, rgba(102,48,248,0.18), transparent 70%)'}} />

    {/* 视觉母题：信封（TCP）vs 明信片（UDP） */}
    <PacketIcon cx={235} cy={400} w={300} h={210} glow />
    <CText cx={235} cy={532} size={38} weight={700} family={FONT_ORB} color={PURPLE_TECH} letterSpacing={4}>TCP</CText>
    <PostcardIcon cx={400} cy={610} w={300} h={185} glow />
    <CText cx={470} cy={718} size={38} weight={700} family={FONT_ORB} color={PURPLE_TECH} letterSpacing={4}>UDP</CText>
    <CText cx={317} cy={573} size={28} weight={600} family={FONT_MONO} color={GREY_LIGHT}>vs</CText>

    {/* 大字钩子 */}
    <CText cx={360} cy={828} size={80} weight={900} family={FONT_HEAVY} color={WHITE} letterSpacing={2}>TWO WAYS</CText>
    <CText
      cx={360}
      cy={940}
      size={100}
      weight={400}
      family={FONT_WIDE}
      color={WHITE}
      letterSpacing={2}
      style={{WebkitTextStroke: `3.5px ${PURPLE_LIGHT}`, paintOrder: 'stroke fill', textShadow: '0 0 20px rgba(161,117,241,0.55), 0 0 5px rgba(161,117,241,0.5)'}}
    >
      TO TRAVEL
    </CText>

    {/* chips */}
    <div style={{position: 'absolute', left: 105, top: 1010, width: 250, height: 54, border: '2.5px solid rgba(255,255,255,0.75)', borderRadius: 6, background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
      <div style={{fontFamily: FONT_MONO, fontSize: 26, color: WHITE, letterSpacing: 1}}>RFC 793</div>
    </div>
    <div style={{position: 'absolute', left: 375, top: 1010, width: 250, height: 54, border: '2.5px solid rgba(255,255,255,0.75)', borderRadius: 6, background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
      <div style={{fontFamily: FONT_MONO, fontSize: 26, color: WHITE, letterSpacing: 1}}>RFC 768</div>
    </div>

    <CText cx={360} cy={1115} size={27} weight={500} family={FONT_MONO} color={GREY_LIGHT}>tcp never loses. udp never waits.</CText>
  </AbsoluteFill>
);
