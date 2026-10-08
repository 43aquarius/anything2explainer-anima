import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Fonts, FONT_WIDE, FONT_ORB, FONT_MONO, FONT_HEAVY} from './common';
import {CText, PacketIcon, PostcardIcon, PURPLE_LIGHT, PURPLE_TECH, WHITE, GREY_LIGHT} from './ui';

/**
 * 封面（发布物料 · YouTube 缩略图 1280×720）：大字钩子 + 信封/明信片母题 + 黑底高对比。
 * 回补规范（制作流程 §8.5）。
 */
export const Cover: React.FC = () => (
  <AbsoluteFill style={{background: '#000'}}>
    <Fonts />
    <AbsoluteFill style={{backgroundImage: 'radial-gradient(rgba(255,255,255,0.05) 1.2px, transparent 1.2px)', backgroundSize: '28px 28px'}} />
    <div style={{position: 'absolute', left: 30, top: 110, width: 570, height: 510, background: 'radial-gradient(ellipse at center, rgba(102,48,248,0.18), transparent 70%)'}} />

    {/* 视觉母题：信封（TCP）vs 明信片（UDP） */}
    <PacketIcon cx={255} cy={300} w={340} h={235} glow />
    <CText cx={255} cy={448} size={40} weight={700} family={FONT_ORB} color={PURPLE_TECH} letterSpacing={4}>TCP</CText>
    <PostcardIcon cx={380} cy={520} w={330} h={200} glow />
    <CText cx={497} cy={640} size={40} weight={700} family={FONT_ORB} color={PURPLE_TECH} letterSpacing={4}>UDP</CText>
    {/* vs */}
    <CText cx={330} cy={425} size={30} weight={600} family={FONT_MONO} color={GREY_LIGHT}>vs</CText>

    {/* 大字钩子 */}
    <CText cx={940} cy={230} size={92} weight={900} family={FONT_HEAVY} color={WHITE} letterSpacing={2}>TWO WAYS</CText>
    <CText
      cx={940}
      cy={368}
      size={128}
      weight={400}
      family={FONT_WIDE}
      color={WHITE}
      letterSpacing={3}
      style={{WebkitTextStroke: `4px ${PURPLE_LIGHT}`, paintOrder: 'stroke fill', textShadow: '0 0 22px rgba(161,117,241,0.55), 0 0 5px rgba(161,117,241,0.5)'}}
    >
      TO TRAVEL
    </CText>

    {/* 事实细节 chips */}
    <div style={{position: 'absolute', left: 726, top: 470, width: 190, height: 56, border: '2.5px solid rgba(255,255,255,0.75)', borderRadius: 6, background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
      <div style={{fontFamily: FONT_MONO, fontSize: 27, color: WHITE, letterSpacing: 1}}>RFC 793</div>
    </div>
    <div style={{position: 'absolute', left: 936, top: 470, width: 190, height: 56, border: '2.5px solid rgba(255,255,255,0.75)', borderRadius: 6, background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
      <div style={{fontFamily: FONT_MONO, fontSize: 27, color: WHITE, letterSpacing: 1}}>RFC 768</div>
    </div>

    <CText cx={940} cy={576} size={26} weight={500} family={FONT_MONO} color={GREY_LIGHT} letterSpacing={0.5}>tcp never loses. udp never waits.</CText>
  </AbsoluteFill>
);
