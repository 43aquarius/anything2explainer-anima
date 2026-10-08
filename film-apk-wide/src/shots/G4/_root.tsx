import React from 'react';
import {AbsoluteFill, Composition, registerRoot, Sequence} from 'remotion';
import {Fonts, BgTrack, DotFieldBg, FootageTrack, ProgressBar, Subtitles, TOTAL_FRAMES, FPS, W, H} from '../../common';
import type {ShotDef, BgSpec, FootageSpec} from '../../common';
import {VIDEO} from '../../config';
import {SHOTS_OVERLAY, SHOTS_OVERLAY_TOP, BG_OVERLAY} from '../../overlay';
import {SHOTS_G4, BG_G4, FOOTAGE_G4} from './index';

/**
 * 【临时·自检专用】G4 私有渲染入口（交付前删除）。
 * 与 Root.tsx 的 Composition id="G4"（PreviewG4）完全同构：Stage[overlay + G4 + overlay_top]，无 audio。
 * 用途：并行组（G2/G6）构建中途会让 src/index.ts 全项目 bundle 失败（缺文件/语法错），此入口只拉
 * overlay + G4，供本组 test_render / stills / motion_check 帧序列在不临时 bundle 的前提下渲染。
 * 渲染命令与 still.sh/test_render.sh 同款：先 `npx remotion bundle src/shots/G4/_root.tsx --out-dir build_dev_g4b`，
 * 再 `npx remotion (still|render) build_dev_g4b G4 ...`（一个组只留一个 bundle）。
 */
const StageG4: React.FC = () => (
  <AbsoluteFill style={{background: '#000'}}>
    <Fonts />
    {VIDEO.bg === 'dots' ? <DotFieldBg specs={[...BG_OVERLAY, ...BG_G4]} /> : <BgTrack specs={[...BG_OVERLAY, ...BG_G4]} />}
    <FootageTrack specs={FOOTAGE_G4} />
    {([...SHOTS_OVERLAY, ...SHOTS_G4, ...SHOTS_OVERLAY_TOP] as ShotDef[]).filter((s) => s.layer !== 'aboveBar').map((s) => (
      <Sequence key={s.id} from={s.from - 1} durationInFrames={s.to - s.from + 1}>
        <s.Comp />
      </Sequence>
    ))}
    <ProgressBar />
    {([...SHOTS_OVERLAY, ...SHOTS_G4, ...SHOTS_OVERLAY_TOP] as ShotDef[]).filter((s) => s.layer === 'aboveBar').map((s) => (
      <Sequence key={s.id} from={s.from - 1} durationInFrames={s.to - s.from + 1}>
        <s.Comp />
      </Sequence>
    ))}
    <Subtitles />
  </AbsoluteFill>
);

const Root: React.FC = () => (
  <Composition id="G4" component={StageG4} durationInFrames={TOTAL_FRAMES} fps={FPS} width={W} height={H} />
);
registerRoot(Root);
