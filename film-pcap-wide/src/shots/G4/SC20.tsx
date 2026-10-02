import React from 'react';
import {useCurrentFrame} from 'remotion';
import {CameraRig} from '../../fx';
import {PcapFileCard} from './shared';

/**
 * SC20 pcap 记录解剖 · N 4311–4658（S25 4319–4474 + S26 4485–4656）
 * 全部内容 = 一张文件卡（shared.PcapFileCard，绝对帧 N 驱动）：4313 slideUp Δ100；4362 三记录行逐行 wipe（2 帧错峰）；
 * 4375–4465 写入扫描条逐行扫过（14px/帧），字节块随之变紫（“lands in a capture file” 的动词动作，大片点亮）；
 * 4415 `pcap` 紫大字（卡右上角）SoftIn；4485 `#2` 行 kf 16 帧放大 1.35×（#1/#3 让位变暗，占位字节块交棒三段）；
 * 4572/4584/4624 timestamp / length / bytes 三段标签依次 SoftIn；4624 起 hex 网格 4 帧/格逐格点亮（持续动作，跨入 SC21 续亮至 4720）；
 * 4638–4654 #2 行收回 1.0（交还承接姿态 → 与 SC21 交界帧像素一致）。
 * 运镜：分镜表行内「1.0→1.05 慢推」——整镜 CameraRig 线性慢推（末值 1.05 由 SC21 handoffKf 镜像承接，组界无 pop）。
 * 停留：段内不判（S26 非段末，SC21 承接不清场）→ 本镜无离场淡出。零 glitch。
 */
const F0 = 4311;

export const SC20: React.FC = () => {
  const N = useCurrentFrame() + F0;
  return (
    <CameraRig N={N} keys={[{f: 4313, x: 640, y: 380, s: 1}, {f: 4658, x: 640, y: 380, s: 1.05}]}>
      <div style={{position: 'absolute', inset: 0}}>
        <PcapFileCard N={N} />
      </div>
    </CameraRig>
  );
};
