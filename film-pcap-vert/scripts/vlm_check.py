#!/usr/bin/env python3
"""z-ai vision 批量自检：stills 目录里指定帧 → VLM 检查 → 打印结论。
用法：python3 scripts/vlm_check.py <目录> <帧号...>   （帧号对应 f_XXXX.png）
"""
import json, subprocess, sys, os, time

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PROMPT = (
    "Frame from a black-canvas white-line-art motion graphics explainer (purple accents). "
    "Check: 1) any text overlapping other text/elements 2) anything cut off at canvas edges "
    "3) text too small/blurry 4) elements in the bottom subtitle band (y637-690) or under the top HUD capsule "
    "5) color rule violations (only purple=focus, orange=metric/warning, grey=inactive, green=correct). "
    "List concrete problems with locations, or say PASS."
)

def call(p):
    for attempt in range(5):
        r = subprocess.run(['z-ai', 'vision', '-p', PROMPT, '-i', p], capture_output=True, text=True, timeout=240)
        if '429' in (r.stderr + r.stdout) and attempt < 4:
            time.sleep(20 * (attempt + 1))
            continue
        return r.stdout
    return ''

def main():
    d = sys.argv[1]
    frames = sys.argv[2:]
    for k, fr in enumerate(frames):
        if k:
            time.sleep(6)
        p = os.path.join(d, f'f_{int(fr):04d}.png')
        if not os.path.exists(p):
            print(f'=== {fr} MISSING ===')
            continue
        out = call(p)
        i = out.find('{')
        verdict = 'ERR: ' + out[:200].replace('\n', ' ')
        if i >= 0:
            try:
                verdict = json.loads(out[i:])['choices'][0]['message']['content']
            except Exception:
                verdict = 'PARSE-ERR'
        print(f'=== {fr} ===\n{verdict}')

if __name__ == '__main__':
    main()
