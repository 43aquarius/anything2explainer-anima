import React from 'react';
import {Stage} from '../../Main';
import {SHOTS_OVERLAY, SHOTS_OVERLAY_TOP, BG_OVERLAY} from '../../overlay';
import {SHOTS_G7b, BG_G7b, FOOTAGE_G7b} from './index';
export const PreviewG7b: React.FC = () => <Stage shots={[...SHOTS_OVERLAY, ...SHOTS_G7b, ...SHOTS_OVERLAY_TOP]} bg={[...BG_OVERLAY, ...BG_G7b]} footage={FOOTAGE_G7b} />;
