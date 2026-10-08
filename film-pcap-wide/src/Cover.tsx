import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Fonts, FONT_WIDE, FONT_ORB, FONT_MONO, FONT_HEAVY} from './common';
import {CText, PacketIcon, PURPLE_LIGHT, PURPLE_TECH, WHITE, GREY_LIGHT} from './ui';

/**
 * 封面（发布物料 · YouTube 缩略图 1280×720）：大字钩子 + 信封母题 + 黑底高对比。
 * 回补规范（制作流程 §8.5）：与第三部（APK）起执行的封面标准对齐。
 */
export const Cover: React.FC = () => (
  <AbsoluteFill style={{background: '#000'}}>
    <Fonts />
    <AbsoluteFill style={{backgroundImage: 'radial-gradient(rgba(255,255,255,0.05) 1.2px, transparent 1.2px)', backgroundSize: '28px 28px'}} />
    <div style={{position: 'absolute', left: 30, top: 110, width: 570, height: 510, background: 'radial-gradient(ellipse at center, rgba(102,48,248,0.18), transparent 70%)'}} />

    {/* 视觉母题：三连信封（包 = packet） */}
    <PacketIcon cx={250} cy={430} w={330} h={230} glow />
    <PacketIcon cx={395} cy={320} w={300} h={210} glow opacity={0.9} />
    <PacketIcon cx={520} cy={205} w={250} h={175} glow opacity={0.75} />
    {/* 捕获光标小卡 */}
    <div style={{position: 'absolute', left: 105, top: 578, width: 400, height: 46, border: '2px solid rgba(255,255,255,0.5)', borderRadius: 8, background: '#000'}}>
      <div style={{fontFamily: FONT_MONO, fontSize: 24, color: WHITE, lineHeight: '42px', textAlign: 'center'}}>tcp<span style={{color: PURPLE_LIGHT}}>.</span>retransmission</div>
    </div>

    {/* 大字钩子 */}
    <CText cx={940} cy={225} size={90} weight={900} family={FONT_HEAVY} color={WHITE} letterSpacing={2}>THE WIRE</CText>
    <CText
      cx={940}
      cy={362}
      size={116}
      weight={400}
      family={FONT_WIDE}
      color={WHITE}
      letterSpacing={2}
      style={{WebkitTextStroke: `4px ${PURPLE_LIGHT}`, paintOrder: 'stroke fill', textShadow: '0 0 22px rgba(161,117,241,0.55), 0 0 5px rgba(161,117,241,0.5)'}}
    >
      DOESN'T LIE.
    </CText>

    {/* 事实细节 chips */}
    <div style={{position: 'absolute', left: 700, top: 468, width: 210, height: 56, border: '2.5px solid rgba(255,255,255,0.75)', borderRadius: 6, background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
      <div style={{fontFamily: FONT_MONO, fontSize: 27, color: WHITE, letterSpacing: 1}}>Wireshark</div>
    </div>
    <CText cx={1020} cy={496} size={56} weight={700} family={FONT_ORB} color={PURPLE_TECH} letterSpacing={2} shadow="0 0 14px rgba(101,48,244,.6)">1988</CText>

    <CText cx={940} cy={576} size={26} weight={500} family={FONT_MONO} color={GREY_LIGHT} letterSpacing={0.5}>pcap — how packet capture works</CText>
  </AbsoluteFill>
);
