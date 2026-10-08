import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Fonts, FONT_WIDE, FONT_ORB, FONT_MONO, FONT_HEAVY} from './common';
import {CText, ParcelIcon, PURPLE_LIGHT, PURPLE_TECH, WHITE, GREY_LIGHT} from './ui';

/**
 * 封面（发布物料 · YouTube 缩略图 1280×720）：大字钩子 + 包裹母题 + 黑底高对比。
 * 静态 1 帧、独立合成（不进正片时间轴）；渲染：npx remotion still src/index.ts Cover out/cover.png
 * 自检标准（制作流程 §8.5）：缩到 200px 宽仍可读；标题不压安全区。
 */
export const Cover: React.FC = () => (
  <AbsoluteFill style={{background: '#000'}}>
    <Fonts />
    {/* 点阵波静态底（与正片同视觉语言，低亮度） */}
    <AbsoluteFill style={{backgroundImage: 'radial-gradient(rgba(255,255,255,0.05) 1.2px, transparent 1.2px)', backgroundSize: '28px 28px'}} />
    {/* 左侧紫晕 */}
    <div style={{position: 'absolute', left: 30, top: 110, width: 570, height: 510, background: 'radial-gradient(ellipse at center, rgba(102,48,248,0.18), transparent 70%)'}} />

    {/* 视觉母题：大包裹（拉链半开·缝隙紫光·底部火漆） */}
    <ParcelIcon cx={315} cy={370} w={410} h={290} openP={0.45} glow label="APK" sealP={1} />
    {/* 改名钩子小卡：.apk → .zip */}
    <div style={{position: 'absolute', left: 85, top: 566, width: 460, height: 46, border: '2px solid rgba(255,255,255,0.5)', borderRadius: 8, background: '#000'}}>
      <div style={{fontFamily: FONT_MONO, fontSize: 24, color: WHITE, lineHeight: '42px', textAlign: 'center'}}>chatapp-release<span style={{color: PURPLE_LIGHT}}>.zip</span></div>
    </div>

    {/* 大字钩子（全片最反直觉的一句话） */}
    <CText cx={935} cy={222} size={92} weight={900} family={FONT_HEAVY} color={WHITE} letterSpacing={2}>EVERY APP</CText>
    <CText
      cx={935}
      cy={362}
      size={148}
      weight={400}
      family={FONT_WIDE}
      color={WHITE}
      letterSpacing={3}
      style={{WebkitTextStroke: `4px ${PURPLE_LIGHT}`, paintOrder: 'stroke fill', textShadow: '0 0 22px rgba(161,117,241,0.55), 0 0 5px rgba(161,117,241,0.5)'}}
    >
      IS A ZIP
    </CText>

    {/* 事实细节 chips：首四字节 + 年份 */}
    <div style={{position: 'absolute', left: 664, top: 468, width: 330, height: 56, border: '2.5px solid rgba(255,255,255,0.75)', borderRadius: 6, background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
      <div style={{fontFamily: FONT_MONO, fontSize: 28, color: WHITE, letterSpacing: 1}}>50 4B 03 04</div>
    </div>
    <CText cx={1062} cy={496} size={58} weight={700} family={FONT_ORB} color={PURPLE_TECH} letterSpacing={2} shadow="0 0 14px rgba(101,48,244,.6)">1989</CText>

    {/* 小字钩子语境 */}
    <CText cx={935} cy={576} size={26} weight={500} family={FONT_MONO} color={GREY_LIGHT} letterSpacing={0.5}>rename any .apk — it just opens</CText>
  </AbsoluteFill>
);
