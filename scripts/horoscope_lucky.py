#!/usr/bin/env python3
"""
Powerball-style lucky draw: 5 distinct numbers from 1–69 (sorted) + 1 Powerball 1–26
(may match a main number). Plus one snarky AI line from Replicate (entertainment only).

Also: python scripts/horoscope_lucky.py --merge
  Updates only lucky_numbers and lucky_numbers_comment in _data/horoscopes.json
  using existing news in the file (no full horoscope regen).
"""

import json
import os
import random
import sys
from pathlib import Path

import replicate

try:
    from dotenv import load_dotenv

    load_dotenv()
except ImportError:
    pass

REPO_ROOT = Path(__file__).resolve().parent.parent
DATA_PATH = REPO_ROOT / "_data" / "horoscopes.json"

MODEL = os.environ.get("HOROSCOPE_REPLICATE_MODEL", "deepseek-ai/deepseek-v3")
LUCKY_MAX_TOKENS = int(os.environ.get("HOROSCOPE_LUCKY_MAX_TOKENS", "256"))
LUCKY_TEMPERATURE = float(os.environ.get("HOROSCOPE_LUCKY_TEMP_REPLICATE", "0.85"))


def draw_powerball() -> list[int]:
    """Return [n1..n5 sorted, powerball]; main pool 1–69, Powerball 1–26."""
    rng = random.SystemRandom()
    main = sorted(rng.sample(range(1, 70), 5))
    powerball = rng.randint(1, 26)
    return main + [powerball]


def _normalize_story(story: dict) -> dict:
    s = dict(story)
    desc = (s.get("description") or "").strip()
    if not desc:
        s["description"] = (s.get("title") or "").strip()
    return s


def _build_lucky_prompt(story: dict, numbers: list[int]) -> str:
    story = _normalize_story(story)
    main = numbers[:5]
    pb = numbers[5]
    return f"""Write ONE short sentence for an entertainment-only fake horoscope page.

News context (not factual advice):
Title: {story["title"]}
Source: {story["source"]}
Summary: {story["description"]}

The page just drew lottery-style numbers: five main numbers (1–69) {main} and Powerball (1–26) {pb}.

Requirements:
- Snarky, witty, slightly edgy; tie the numbers and the news together loosely or absurdly.
- Past or present tense; no second person required.
- No slurs; no harassment of private individuals.
- Plain text only: exactly one sentence, under 220 characters, no quotes around the whole thing, no JSON.
"""


def generate_lucky_comment(story: dict, numbers: list[int]) -> str:
    if len(numbers) != 6:
        raise ValueError("numbers must be 6 ints (5 main + Powerball)")
    if not os.environ.get("REPLICATE_API_TOKEN"):
        raise ValueError("REPLICATE_API_TOKEN environment variable not set")

    prompt = _build_lucky_prompt(story, numbers)
    inp = {
        "prompt": prompt,
        "max_tokens": LUCKY_MAX_TOKENS,
        "temperature": LUCKY_TEMPERATURE,
    }
    raw = ""
    try:
        for event in replicate.stream(MODEL, input=inp):
            raw += str(event)
    except Exception as e:
        print(f"⚠️  Replicate stream error: {e}, trying run()…", file=sys.stderr)
        out = replicate.run(MODEL, input=inp)
        raw = out if isinstance(out, str) else "".join(str(x) for x in out)

    line = raw.strip().split("\n")[0].strip()
    line = line.strip('"').strip("'")
    if len(line) < 12:
        raise ValueError("Lucky comment too short from model")
    if len(line) > 500:
        line = line[:497] + "…"
    return line


def apply_lucky_to_payload(payload: dict, story: dict) -> None:
    """Set lucky_numbers (6 ints) and lucky_numbers_comment on payload in place."""
    nums = draw_powerball()
    comment = generate_lucky_comment(_normalize_story(story), nums)
    payload["lucky_numbers"] = nums
    payload["lucky_numbers_comment"] = comment
    gen = payload.setdefault("generator", {})
    if isinstance(gen, dict):
        gen.setdefault(
            "lucky_draw",
            "Powerball-style: five distinct 1–69 (sorted) plus one Powerball 1–26; snarky one-liner via same LLM.",
        )


def merge_into_horoscopes_json(path: Path | None = None) -> None:
    path = path or DATA_PATH
    if not path.exists():
        raise FileNotFoundError(path)

    with open(path, "r", encoding="utf-8") as f:
        data = json.load(f)

    if data.get("placeholder"):
        print("⚠️  horoscopes.json is placeholder; nothing to merge.", file=sys.stderr)
        sys.exit(1)
    news = data.get("news")
    if not news or not news.get("title"):
        print("⚠️  Missing news in horoscopes.json.", file=sys.stderr)
        sys.exit(1)

    story = _normalize_story(news)
    nums = draw_powerball()
    print(f"🎱 Draw: {' '.join(str(x) for x in nums[:5])} | PB {nums[5]}")
    comment = generate_lucky_comment(story, nums)
    print(f"💬 {comment}")

    data["lucky_numbers"] = nums
    data["lucky_numbers_comment"] = comment

    gen = data.setdefault("generator", {})
    if isinstance(gen, dict):
        gen.setdefault(
            "lucky_draw",
            "Powerball-style: five distinct 1–69 (sorted) plus one Powerball 1–26; snarky one-liner via same LLM.",
        )

    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
        f.write("\n")
    print(f"✅ Updated {path.relative_to(REPO_ROOT)}")


def main() -> None:
    if len(sys.argv) > 1 and sys.argv[1] == "--merge":
        try:
            merge_into_horoscopes_json()
        except ModuleNotFoundError as e:
            if e.name == "replicate":
                print(
                    "Install deps: pip install -r scripts/requirements.txt (use a venv)",
                    file=sys.stderr,
                )
            raise
        return
    print("Usage: python scripts/horoscope_lucky.py --merge", file=sys.stderr)
    sys.exit(1)


if __name__ == "__main__":
    main()
