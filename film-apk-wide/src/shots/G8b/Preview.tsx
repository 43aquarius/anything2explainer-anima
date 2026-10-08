import React from 'react';
import {Stage} from '../../Main';
import {SHOTS_OVERLAY, SHOTS_OVERLAY_TOP, BG_OVERLAY} from '../../overlay';
import {SHOTS_G8b, BG_G8b, FOOTAGE_G8b} from './index';
export const PreviewG8b: React.FC = () => <Stage shots={[...SHOTS_OVERLAY, ...SHOTS_G8b, ...SHOTS_OVERLAY_TOP]} bg={[...BG_OVERLAY, ...BG_G8b]} footage={FOOTAGE_G8b} />;
