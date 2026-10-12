#!/usr/bin/env python3
"""VLM still 自检（bgp-G1）：逐张 z-ai vision，失败/429 等 60s 重试一次。"""
import json, subprocess, sys, time, glob, os

PROMPT = ("Frame from a black-canvas white-line-art motion graphics explainer (purple accents). "
          "Check: 1) any text overlapping other text/elements 2) anything cut off at canvas edges "
          "3) text too small/blurry 4) elements in the bottom subtitle band (y637-690) or under the top HUD "
          "5) color rule violations (only purple=focus, orange=metric/warning, grey=inactive, green=correct). "
          "List concrete problems with locations, or say PASS.")

def vlm(path):
    out = f"/tmp/vlm_g1_{os.path.basename(path)}.json"
    for attempt in (1, 2):
        r = subprocess.run(['z-ai', 'vision', '-p', PROMPT, '-i', path, '-o', out],
                           capture_output=True, text=True, timeout=180)
        try:
            d = json.load(open(out))
            c = d.get('choices', [{}])[0].get('message', {}).get('content', '')
            if c.strip():
                return c.strip()
        except Exception:
            pass
        if attempt == 1:
            print(f'  retry {os.path.basename(path)} (rc={r.returncode})', flush=True)
            time.sleep(60)
    return 'VLM-UNAVAILABLE'

files = sorted(glob.glob('/home/z/my-project/film-bgp-wide/stills/G1/f_*.png'))
if len(sys.argv) > 1:
    files = [f for f in files if any(('_' + a + '.') in f or f.endswith('_0' + a + '.png') for a in sys.argv[1:])]
for f in files:
    tag = os.path.basename(f)
    print(f'== {tag}: {vlm(f)}', flush=True)
