#!/usr/bin/env python3
"""ASCII 探针：把 still 缩成 80x28 的灰度/色彩字符图，看版式结构（无法看图时的替代 QC）。
用法：python3 scripts/ascii_probe.py <png> [x0 y0 x1 y1]   —— 可选裁剪区放大。
字符：'#'=亮/白 '*'=中亮 '+'=暗内容 '.'=微亮 ' '=黑；R=橙 G=绿 B=紫（按通道优势染色时改写首字符）"""
import sys
from PIL import Image

CH = ' .+*##'
def main():
    p = sys.argv[1]
    box = tuple(int(v) for v in sys.argv[2:6]) if len(sys.argv) >= 6 else None
    im = Image.open(p).convert('RGB')
    if box:
        im = im.crop(box)
    W, H = 80, 30
    im2 = im.resize((W, H))
    px = im2.load()
    for y in range(H):
        row = []
        for x in range(W):
            r, g, b = px[x, y]
            lum = 0.30 * r + 0.55 * g + 0.15 * b
            c = CH[min(5, int(lum / 44))]
            if r > g + 50 and r > b + 30:
                c = 'R'
            elif b > g + 40 and r > g + 15:
                c = 'B'
            elif g > r + 40 and g > b + 20:
                c = 'G'
            row.append(c)
        print(''.join(row))
if __name__ == '__main__':
    main()
