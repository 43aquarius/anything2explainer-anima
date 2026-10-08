import React from 'react';
import {useCurrentFrame} from 'remotion';
import {GREY} from '../../ui';
import {CText, exitOp} from '../../ui';
import {SoftIn} from '../../ui';
import {EntryList, FocusRing} from './layout';

/**
 * SC05 逐个点名 · N 652–870（S05 660–868：660 Manifest / 722 classes.dex / 774 arsc·res·META-INF）
 * 承接 SC04 的条目列表（列表保留在右侧，零跳变）；左侧放大镜聚焦圈（虚线椭圆 + 柄，24 帧周期呼吸）
 * 逐条套到当前念到的条目上：660→674 Manifest / 722→736 classes.dex（3 行小字节码线点缀）/ 774–804 依次扫过 arsc·res·META-INF（每腿 10 帧）；
 * 套中条目 1.12× 放大 + 紫边 + 紫光，其余条目变暗 40%；底部小字 `a zip with rules`（灰 24px，782 SoftIn）。
 * 无运镜（分镜表 CH1 运镜清单不含本镜）。末 8 帧归零（G2 SC06 清场重开）。
 */
const F0 = 652;
const TO = 870;

export const SC05: React.FC = () => {
  const N = useCurrentFrame() + F0;
  return (
    <>
      {/* 条目列表（承接 SC04 完成态；SC05 起接受聚焦/变暗/字节码线） */}
      <EntryList N={N} />
      {/* 放大镜聚焦圈（主角） */}
      <FocusRing N={N} />
      {/* 底部小字 */}
      <SoftIn N={N} f0={782} style={{opacity: exitOp(N, TO, 8)}}>
        <CText cx={640} cy={592} size={24} weight={500} color={GREY} letterSpacing={0.5}>
          a zip with rules
        </CText>
      </SoftIn>
    </>
  );
};
