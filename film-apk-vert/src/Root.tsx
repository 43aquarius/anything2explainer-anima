import React from 'react';
import {Composition} from 'remotion';
import {W, H, FPS, TOTAL_FRAMES} from './common';
import {Video} from './Main';
import {PreviewOverlay} from './overlay/Preview';
import {PreviewG1} from './shots/G1/Preview';
import {PreviewG2} from './shots/G2/Preview';
import {PreviewG2b} from './shots/G2b/Preview';
import {PreviewG3} from './shots/G3/Preview';
import {ProbeIcons} from './probe';
import {Cover} from './Cover';

// 主合成 Video + 覆盖层预览 + 3 个构建组预览（预览合成 = 覆盖层 + 本组镜头，无音频）+ 图元探针
export const Root: React.FC = () => (
  <>
    <Composition id="Video" component={Video} durationInFrames={TOTAL_FRAMES} fps={FPS} width={W} height={H} />
    <Composition id="Overlay" component={PreviewOverlay} durationInFrames={TOTAL_FRAMES} fps={FPS} width={W} height={H} />
    <Composition id="G1" component={PreviewG1} durationInFrames={TOTAL_FRAMES} fps={FPS} width={W} height={H} />
    <Composition id="G2" component={PreviewG2} durationInFrames={TOTAL_FRAMES} fps={FPS} width={W} height={H} />
    <Composition id="G2b" component={PreviewG2b} durationInFrames={TOTAL_FRAMES} fps={FPS} width={W} height={H} />
    <Composition id="G3" component={PreviewG3} durationInFrames={TOTAL_FRAMES} fps={FPS} width={W} height={H} />
    <Composition id="Icons" component={ProbeIcons} durationInFrames={90} fps={FPS} width={W} height={H} />
    <Composition id="Cover" component={Cover} durationInFrames={1} fps={FPS} width={W} height={H} />
  </>
);
