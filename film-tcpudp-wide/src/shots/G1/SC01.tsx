import React from 'react';
import {useCurrentFrame} from 'remotion';
import {CameraRig} from '../../fx';
import {scaleIn, firstOp} from '../../ui';
import {CallWin} from './parts';

/**
 * SC01 通话中发照片 · N 78–206（S01 86–204：86「You're on a video call」/ 145「you send a photo」）
 * 版式：通话窗口 mock (300,150,680×420) 居中（主角，HeroGlow 常亮 + 头像光环 30 帧呼吸）；
 *       右下照片缩略卡 145 起 24 帧环形进度转满 → 170 照片卡缩小飞向窗口右缘（发送感），原地留虚线空槽。
 * 节拍：78（=镜头首帧，承接片头出画后的第一拍，不等字幕块）窗口 21 帧缩放入场；
 *       分镜表本行还列了 215/262 两拍（窗口顶部细线 / 第二条虚线），但超出本镜 206 的区间——
 *       该两拍的概念（同一台机器/同一条线）由 SC02 的「窗口下沿引出 y430 主线」实现（见 SC02 与 BUILD_NOTES）。
 * 运镜：全镜 1.0→1.05 慢推（Ch1 运镜清单），末态 s=1.05 由 SC02 首 16 帧承接回 1.0。
 * 离场：不归零（段内镜头，SC02 承接缩角不清场；「末 8 帧归零」仅适用于硬切边界）。
 */
const F0 = 78;
const TO = 206;

export const SC01: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const n = N - F0;
  const s = 0.2 + 0.8 * scaleIn(n, 21);
  const op = firstOp(n, 6);
  return (
    <CameraRig N={N} keys={[{f: F0, x: 640, y: 360, s: 1}, {f: TO, x: 640, y: 360, s: 1.05}]}>
      <div style={{position: 'absolute', inset: 0, opacity: op, transform: s < 1 ? `scale(${s.toFixed(4)})` : undefined, transformOrigin: '640px 360px'}}>
        <CallWin N={N} />
      </div>
    </CameraRig>
  );
};
