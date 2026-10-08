#!/usr/bin/env python3
"""humanize.py — run narration/copy through the Humanizer skill (blader/humanizer).

Usage:
    python3 tools/humanize.py <input.txt> <output.txt> [--genre narration|title|description]

Pipeline position: between the narration draft and the formatted `script/narration.txt`.
The input is plain prose (chapter headings allowed as lines starting with `#`).
The output is the humanized rewrite plus a fact audit printed to stderr and saved
next to the output as <output>.audit.md.

How it works:
  - system prompt = tools/humanizer/SKILL.md (the Humanizer skill, MIT, blader/humanizer)
    + a short addendum that pins the video-narration constraints (keep facts, keep
      `#` heading lines, no new claims, no markdown decoration).
  - user prompt = the draft text.
  - The LLM call goes through the local `z-ai chat` CLI.
  - After the rewrite, every number and quoted term from the draft is checked
    against the output; anything missing or changed is reported so a human can
    fix it. Facts must survive the pass untouched — that is the rule.
"""
import json
import re
import subprocess
import sys
import tempfile
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent
SKILL = REPO / "tools" / "humanizer" / "SKILL.md"

OPERATOR = (
    "You are the Humanizer skill running as a batch rewriting tool, not a chat assistant. "
    "The user message is the text to rewrite. Apply every rule in the skill below to that text "
    "and output ONLY the final rewritten text — no preamble, no commentary, no markdown "
    "decoration that was not in the source. If the source has no AI tells, return it unchanged.\n\n"
    "--- SKILL (blader/humanizer, MIT) ---\n"
)
ADDENDUM = {
    "narration": (
        "\n\n## Addendum for this run (video narration)\n"
        "- The text is a voice-over narration for a technical explainer video. Rewrite it "
        "with the rules above; keep every fact, number, name, year, and technical term exactly as given.\n"
        "- Keep every line that starts with `#` (chapter markers) unchanged.\n"
        "- Do not add facts, examples, or claims that are not in the source. If a sentence "
        "needs a missing detail, leave it out rather than invent one.\n"
        "- Output only the rewritten text, no commentary.\n"
    ),
    "title": (
        "\n\n## Addendum for this run (platform title/caption)\n"
        "- The text is a short video title or caption for a video platform. Rewrite with the "
        "rules above; keep the topic and every fact exactly.\n"
        "- No clickbait inflation, no emoji unless the source has them, no ALL CAPS.\n"
        "- Output only the rewritten text, no commentary.\n"
    ),
    "description": (
        "\n\n## Addendum for this run (video description)\n"
        "- The text is a video description. Rewrite with the rules above; keep every fact, "
        "number, name, year exactly. Keep any URLs unchanged, one per line.\n"
        "- Output only the rewritten text, no commentary.\n"
    ),
}


def call_llm(system: str, user: str, retries: int = 3) -> str:
    last = None
    for attempt in range(1, retries + 1):
        try:
            with tempfile.NamedTemporaryFile("w", suffix=".json", delete=False) as tf:
                out = tf.name
            cmd = ["z-ai", "chat", "-p", user, "-s", system, "-o", out]
            r = subprocess.run(cmd, capture_output=True, text=True, timeout=300)
            raw = ""
            p = Path(out)
            if p.exists() and p.stat().st_size > 0:
                raw = p.read_text()
            else:
                # CLI quirk: with very long -s prompts it prints the JSON to stdout instead
                s = r.stdout
                i = s.find("{")
                j = s.rfind("}")
                if i >= 0 and j > i:
                    raw = s[i:j + 1]
            if not raw.strip():
                raise RuntimeError(f"no response (exit {r.returncode}): {r.stderr[-300:]}")
            data = json.loads(raw)
            content = (data.get("content")
                       or data.get("choices", [{}])[0].get("message", {}).get("content", ""))
            if not content.strip():
                raise RuntimeError("empty response")
            return content.strip()
        except Exception as e:  # noqa: BLE001
            last = e
            print(f"[humanize] attempt {attempt} failed: {e}", file=sys.stderr)
    raise SystemExit(f"[humanize] giving up after {retries} attempts: {last}")


FACT_RE = re.compile(r"\d[\d.,:x×-]*[A-Za-z%]*|PK\\x0?3\\x0?4", re.IGNORECASE)


def facts_of(text: str):
    nums = set(m.group(0).rstrip(".,:;") for m in FACT_RE.finditer(text))
    caps = set(w for w in re.findall(r"\b[A-Z][A-Za-z0-9.+-]{2,}\b", text)
               if w not in {"The", "And", "But", "For", "Not", "You", "Your", "Why", "How", "What", "When",
                           "Its", "It's", "One", "Two", "All", "So", "If", "In", "On", "At", "Do", "Does"})
    return nums, caps


def main():
    if len(sys.argv) < 3:
        print(__doc__)
        sys.exit(1)
    src = Path(sys.argv[1])
    dst = Path(sys.argv[2])
    genre = "narration"
    if "--genre" in sys.argv:
        genre = sys.argv[sys.argv.index("--genre") + 1]
    if genre not in ADDENDUM:
        raise SystemExit(f"unknown genre {genre}")

    draft = src.read_text()
    system = OPERATOR + SKILL.read_text() + ADDENDUM[genre]
    print(f"[humanize] {src} ({len(draft.split())} words) -> {dst} [genre={genre}]", file=sys.stderr)

    rewritten = call_llm(system, draft)

    # fact audit: numbers and proper nouns must survive
    n_in, c_in = facts_of(draft)
    missing_n = sorted(n for n in n_in if n not in rewritten)
    missing_c = sorted(c for c in c_in if c not in rewritten)
    audit = ["# humanize audit", "",
             f"- input: {src}", f"- output: {dst}", f"- genre: {genre}",
             f"- numbers checked: {len(n_in)}, missing: {len(missing_n)}",
             f"- proper nouns checked: {len(c_in)}, missing: {len(missing_c)}"]
    if missing_n:
        audit.append("- MISSING NUMBERS: " + ", ".join(missing_n))
    if missing_c:
        audit.append("- MISSING TERMS: " + ", ".join(missing_c))
    if not missing_n and not missing_c:
        audit.append("- verdict: all facts survived")
    else:
        audit.append("- verdict: REVIEW REQUIRED (fix by hand before adopting)")
    audit_text = "\n".join(audit) + "\n"
    Path(str(dst) + ".audit.md").write_text(audit_text)

    dst.write_text(rewritten)
    print(audit_text, file=sys.stderr)
    print(f"[humanize] done -> {dst}", file=sys.stderr)


if __name__ == "__main__":
    main()
