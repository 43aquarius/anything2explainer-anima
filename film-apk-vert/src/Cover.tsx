import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Fonts, FONT_WIDE, FONT_ORB, FONT_MONO, FONT_HEAVY} from './common';
import {CText, ParcelIcon, PURPLE_LIGHT, PURPLE_TECH, WHITE, GREY_LIGHT} from './ui';

/**
 * 封面（发布物料 · TikTok 封面 720×1280）：大字钩子 + 包裹母题 + 黑底高对比。
 * 静态 1 帧、独立合成（不进正片时间轴）；渲染：npx remotion still src/index.ts Cover out/cover.png
 * 安全区：内容 x40–620（右侧按钮列）、顶部 y≥240；缩到 200px 宽仍可读。
 */
export const Cover: React.FC = () => (
  <AbsoluteFill style={{background: '#000'}}>
    <Fonts />
    {/* 点阵波静态底 */}
    <AbsoluteFill style={{backgroundImage: 'radial-gradient(rgba(255,255,255,0.05) 1.2px, transparent 1.2px)', backgroundSize: '28px 28px'}} />
    {/* 中部紫晕 */}
    <div style={{position: 'absolute', left: 40, top: 240, width: 540, height: 760, background: 'radial-gradient(ellipse at center, rgba(102,48,248,0.18), transparent 70%)'}} />

    {/* 视觉母题：大包裹 */}
    <ParcelIcon cx={360} cy={430} w={430} h={300} openP={0.45} glow label="APK" sealP={1} />
    {/* 改名钩子小卡 */}
    <div style={{position: 'absolute', left: 130, top: 618, width: 460, height: 48, border: '2px solid rgba(255,255,255,0.5)', borderRadius: 8, background: '#000'}}>
      <div style={{fontFamily: FONT_MONO, fontSize: 25, color: WHITE, lineHeight: '44px', textAlign: 'center'}}>chatapp-release<span style={{color: PURPLE_LIGHT}}>.zip</span></div>
    </div>

    {/* 大字钩子 */}
    <CText cx={360} cy={762} size={82} weight={900} family={FONT_HEAVY} color={WHITE} letterSpacing={2}>EVERY APP</CText>
    <CText
      cx={360}
      cy={880}
      size={116}
      weight={400}
      family={FONT_WIDE}
      color={WHITE}
      letterSpacing={3}
      style={{WebkitTextStroke: `3.5px ${PURPLE_LIGHT}`, paintOrder: 'stroke fill', textShadow: '0 0 20px rgba(161,117,241,0.55), 0 0 5px rgba(161,117,241,0.5)'}}
    >
      IS A ZIP
    </CText>

    {/* 事实细节 chips */}
    <div style={{position: 'absolute', left: 105, top: 952, width: 300, height: 54, border: '2.5px solid rgba(255,255,255,0.75)', borderRadius: 6, background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
      <div style={{fontFamily: FONT_MONO, fontSize: 27, color: WHITE, letterSpacing: 1}}>50 4B 03 04</div>
    </div>
    <CText cx={520} cy={979} size={54} weight={700} family={FONT_ORB} color={PURPLE_TECH} letterSpacing={2} shadow="0 0 14px rgba(101,48,244,.6)">1989</CText>

    {/* 小字钩子语境 */}
    <CText cx={360} cy={1072} size={27} weight={500} family={FONT_MONO} color={GREY_LIGHT}>rename any .apk — it just opens</CText>
  </AbsoluteFill>
);
