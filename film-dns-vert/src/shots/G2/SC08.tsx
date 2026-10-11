import React from 'react';
import {useCurrentFrame} from 'remotion';
import {clamp01, kf} from '../../common';
import {MilkCarton, EXAMPLE, GREY, GREY_LINE, WHITE, GREEN, ORANGE, exitOp} from '../../ui';

const F0 = 1410, T = 1491; // SC08: 1410–1491（S12：TTL 保质期）

export const SC08: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const exitK = N > T - 8 ? exitOp(N, T) : 1;
  const cartonK = clamp01((N - 1410) / 16);
  const sec = Math.round(kf(N, [[1420, 0], [1440, 60]]));
  const lid = 0.5 + 0.5 * Math.sin(N / 24 * Math.PI * 2);
  return (
    <div style={{position: 'absolute', inset: 0, opacity: exitK}}>
      {/* 主角：牛奶盒（居中放大） */}
      {cartonK > 0 && (
        <div style={{position: 'absolute', left: 360, top: 560, transform: `translate(-50%, -50%) scale(${cartonK})`}}>
          <MilkCarton cx={0} cy={0} w={260} h={350} label={`TTL ${sec} s`} dateText="fresh until" glow />
          <div style={{position: 'absolute', left: -70, top: -150, width: 120, height: 10, background: '#000', border: `2px solid ${WHITE}`, transform: `rotate(${lid * 4 - 2}deg)`, transformOrigin: 'left center', opacity: 0.85}} />
        </div>
      )}
      {/* 保质期说明（软入，落定即末拍） */}
      <div style={{position: 'absolute', left: 0, right: 0, top: 880, textAlign: 'center', fontFamily: "'Noto Sans SC', sans-serif", fontSize: 27, color: GREY, opacity: kf(N, [[1442, 0.25], [1450, 1]])}}>fresh until — then ask again</div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 300, textAlign: 'center', fontFamily: "'Noto Sans SC', sans-serif", fontSize: 30, color: GREY, opacity: kf(N, [[1410, 0.25], [1420, 1]])}}>an expiry date</div>
    </div>
  );
};
export const SC08_RANGE = {from: F0, to: T};
