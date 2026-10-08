import React from 'react';
import {Stage} from '../../Main';
import {SHOTS_OVERLAY, SHOTS_OVERLAY_TOP, BG_OVERLAY} from '../../overlay';
import {SHOTS_G2b, BG_G2b, FOOTAGE_G2b} from './index';
export const PreviewG2b: React.FC = () => <Stage shots={[...SHOTS_OVERLAY, ...SHOTS_G2b, ...SHOTS_OVERLAY_TOP]} bg={[...BG_OVERLAY, ...BG_G2b]} footage={FOOTAGE_G2b} />;
