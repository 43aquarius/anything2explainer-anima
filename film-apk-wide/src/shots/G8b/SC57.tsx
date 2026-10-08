import React from 'react';
import {useCurrentFrame} from 'remotion';
import {powOutRemain} from '../../common';
import {firstOp} from '../../ui';
import {TERM, TerminalCard} from './g8bui';

/**
 * SC57 自己验证 · N 8577–8713（S57 8585–8711：8585「Open any app under /data/app」/ 8659「on a rooted phone and check.」）
 * 终端窗口卡（x 240–1040, y 180–500：黑底白边圆角 + 顶栏 `shell`）8585 slideUp（Δ100/22 帧 + 前 6 帧渐入）；
 * 命令行打字机每 2 帧 1 字（8589 `$ cd /data/app/com.example.chat` → 8651 打完；8653 `$ xxd base.apk | head -1`
 * ——S57.c2 8659 的 −6 容差内，为结果行留帧）+ 绿色块光标（打字中常亮、闲置 16 帧周期闪烁，持续动作）；
 * 回车 ~300ms 后 8710 结果行 `00000000: 504b 0304 ...`（offset 灰 / `504b` 白待亮 / 尾灰——首 4 字符为下一镜高亮预留）
 * + 新提示行 `$ ` 光标闪烁；终端边框白光呼吸（30 帧周期，持续动作）。
 * **不归零**：SC58 承接终端卡（分镜表 SC58 行「不清场」优先于本行动效列的「末 8 帧归零」样板文字）；
 * 卡为绝对帧驱动（g8bui TERM 常量），8713|8714 交界帧像素一致。段内不判停留。
 */
export const F0 = 8577;
const T_CARD = 8585; // S57.c1：卡 slideUp

export const SC57: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const cn = N - T_CARD;
  if (cn < 0) return null;
  // slideUp Δ100/22 帧 + 前 6 帧渐入
  const y = TERM.y + 100 * powOutRemain(cn, 22, 2.5);
  const op = firstOp(cn, 6);
  return (
    <div style={{position: 'absolute', inset: 0, opacity: op}}>
      <TerminalCard N={N} y={y} />
    </div>
  );
};

export default SC57;
