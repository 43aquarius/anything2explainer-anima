#!/usr/bin/env python3
"""进度条像素校验（制作流程 §7.5）：抽 8 个采样点，量进度条填充边缘 x 坐标 vs 期望值，偏差应 <2px。
竖版进度条要确认条体可见（高度从 H 推导）。用法：python3 progressbar_check.py <fin_frames_dir> <total_frames> <bar_y0> <bar_y1>
"""
import sys, glob
import numpy as np
from PIL import Image

frames_dir, total, y0, y1 = sys.argv[1], int(sys.argv[2]), int(sys.argv[3]), int(sys.argv[4])
W = None
samples = [int(total * f) for f in [0.06, 0.18, 0.31, 0.44, 0.57, 0.7, 0.83, 0.96]]
worst = 0
for sf in samples:
    # fin_frames 1 起：f_0001 = 帧 1 = 视频帧 0 → 帧号 n 的文件 = f_{n+1:04d}
    path = f"{frames_dir}/f_{sf + 1:04d}.jpg"
    im = np.asarray(Image.open(path).convert("L")).astype(int)
    H, W = im.shape
    band = im[y0:y1, :]
    row = band[band.shape[0] // 2] if band.shape[0] else im[y0]
    lit = np.where(row > 60)[0]
    if len(lit) == 0:
        print(f"frame {sf}: BAR NOT VISIBLE (band max {band.max()})")
        continue
    edge = lit.max()
    expect = int(round(W * sf / total))
    d = abs(edge - expect)
    worst = max(worst, d)
    print(f"frame {sf:5d}: bar edge x={edge:4d} expect={expect:4d} diff={d}px {'OK' if d < 2 else 'FAIL'}")
print(f"worst deviation: {worst}px ({'PASS' if worst < 2 else 'CHECK'})")
