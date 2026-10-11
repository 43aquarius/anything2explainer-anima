#!/usr/bin/python3
"""G1 自检替代（VLM 429 时的肉眼替代）：
1) 二值结构图（96x30，阈 140/200）——核对构图
2) 高亮墨迹 bbox / 画布顶边截断检查（≥200 亮度，排除点阵波幕底）
3) 字幕带（y637-690）两侧禁区、HUD 下沿（y80-110）墨迹检查
用法: python3 scripts/g1_check.py <still1.png> [still2.png ...]  [--map]
"""
import sys
import numpy as np
from PIL import Image

args = [a for a in sys.argv[1:] if a != '--map']
want_map = '--map' in sys.argv

for path in args:
    im = np.asarray(Image.open(path).convert('L')).astype(int)
    h, w = im.shape
    ink = im > 200
    ys, xs = np.where(ink)
    print(f'== {path}')
    if len(ys) == 0:
        print('  (无高亮墨迹)')
    else:
        x0, x1, y0, y1 = xs.min(), xs.max(), ys.min(), ys.max()
        print(f'  bright-ink bbox: x {x0}-{x1}, y {y0}-{y1}')
        edge = []
        if y0 < 20: edge.append(f'top y={y0}')
        if x0 < 3: edge.append(f'left x={x0}')
        if x1 > w - 4: edge.append(f'right x={x1}')
        print(f'  edges: {edge if edge else "OK"}')
        band = im[637:691, :]
        bink = band > 200
        left = bink[:, 40:205].sum(); right = bink[:, 1075:1240].sum()
        print(f'  subtitle-band side-ink: L={left} R={right} {"!! CHECK" if max(left, right) > 40 else "OK"}')
        hud = im[80:110, :]
        hink = (hud > 200).sum()
        print(f'  y80-110 bright px: {hink} {"!! CHECK" if hink > 30 else "OK"}')
    if want_map:
        # 最大值池化（保留细线），96 列 x 30 行
        g = im[:720, :1248]
        pooled = g.reshape(30, 24, 96, 13).max(axis=(1, 3))
        for row in pooled:
            print('  ' + ''.join('#' if v > 200 else ('+' if v > 140 else ('.' if v > 90 else ' ')) for v in row))
