#!/usr/bin/env python3
"""
Weekly AI horoscopes: NewsAPI top US headline + Replicate DeepSeek V3 -> _data/horoscopes.json
"""

import json
import os
import re
import sys
from datetime import datetime
from pathlib import Path

import replicate
import requests

import horoscope_lucky

try:
    from dotenv import load_dotenv

    load_dotenv()
except ImportError:
    pass

REPO_ROOT = Path(__file__).resolve().parent.parent
DATA_PATH = REPO_ROOT / "_data" / "horoscopes.json"
TRAITS_PATH = Path(__file__).resolve().parent / "zodiac_traits.json"

MODEL = os.environ.get("HOROSCOPE_REPLICATE_MODEL", "deepseek-ai/deepseek-v3")
MAX_TOKENS = int(os.environ.get("HOROSCOPE_MAX_TOKENS", "4096"))
TEMPERATURE = float(os.environ.get("HOROSCOPE_TEMPERATURE", "0.85"))


def ordinal(n: int) -> str:
    if 11 <= (n % 100) <= 13:
        return f"{n}th"
    suffix = {1: "st", 2: "nd", 3: "rd"}.get(n % 10, "th")
    return f"{n}{suffix}"


def build_date_caption(week_start_iso: str, generated_at: datetime) -> str:
    """e.g. Created April 2, 2026 for the 14th week of 2026."""
    week_day = datetime.strptime(week_start_iso, "%Y-%m-%d").date()
    iso_year, iso_week, _ = week_day.isocalendar()
    month = generated_at.strftime("%B")
    created_part = f"{month} {generated_at.day}, {generated_at.year}"
    return (
        f"Created {created_part} for the {ordinal(iso_week)} week of {iso_year}."
    )


def load_traits() -> str:
    with open(TRAITS_PATH, "r", encoding="utf-8") as f:
        data = json.load(f)
    lines = []
    for s in data["signs"]:
        lines.append(
            f"- {s['name']} ({s['dates']}): {s['traits']}"
        )
    return "\n".join(lines)


def fetch_top_us_story() -> dict:
    api_key = os.environ.get("NEWS_API_KEY")
    if not api_key:
        raise ValueError("NEWS_API_KEY environment variable not set")

    url = "https://newsapi.org/v2/top-headlines"
    params = {
        "country": "us",
        "pageSize": 20,
        "apiKey": api_key,
    }
    r = requests.get(url, params=params, timeout=30)
    r.raise_for_status()
    body = r.json()
    if body.get("status") != "ok":
        raise RuntimeError(body.get("message", "NewsAPI error"))

    for article in body.get("articles", []):
        title = (article.get("title") or "").strip()
        desc = (article.get("description") or "").strip()
        if not title or title.lower() == "[removed]":
            continue
        if len(desc) < 20:
            desc = title
        source = article.get("source") or {}
        name = source.get("name", "Unknown") if isinstance(source, dict) else str(source)
        return {
            "title": title,
            "description": desc,
            "url": article.get("url") or "",
            "source": name,
        }

    raise RuntimeError("No usable top-headlines article returned")


def build_prompt(traits_block: str, story: dict, week_label: str) -> str:
    return f"""You are writing satirical entertainment copy for a personal blog. Nothing is real advice.

Context — leading U.S. news story right now:
Title: {story["title"]}
Source: {story["source"]}
Summary: {story["description"]}

Zodiac reference (use tone and themes, do not quote verbatim):
{traits_block}

Week label for display: {week_label}

Output ONLY valid JSON (no markdown fences, no commentary). Schema:
{{
  "page_title": "Very short, snappy title for this horoscope page (max ~8 words). Witty or dramatic; not generic phrases like 'This Week' or 'Horoscopes'. No quotes in the string.",
  "weekly_forecast": "3-5 sentences. Sarcastic, funny, slightly edgy. Based ONLY on the news story above, predict in a playful fictional way what might happen with this story in the coming week (hearings, tweets, plot twists, chaos). Clearly absurd satire—not factual reporting.",
  "signs": [
    {{"name": "Aries", "lines": ["line1", "line2", "line3"]}},
    ... exactly 12 objects in zodiac order: Aries, Taurus, Gemini, Cancer, Leo, Virgo, Libra, Scorpio, Sagittarius, Capricorn, Aquarius, Pisces
  ]
}}

Rules for each sign:
- Exactly 2 or 3 short lines per sign (array length 2 or 3).
- Sarcastic, witty, edgy-but-not-hateful; horoscope parody for laughs.
- Tie each sign lightly to the news vibe OR to classic sign stereotypes—mix it up.
- No slurs; no targeted harassment of real private individuals. Public figures in the news may be joked about lightly.
"""


def extract_json(text: str) -> dict:
    text = text.strip()
    fence = re.match(r"^```(?:json)?\s*([\s\S]*?)\s*```$", text)
    if fence:
        text = fence.group(1).strip()
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        start = text.find("{")
        end = text.rfind("}")
        if start >= 0 and end > start:
            return json.loads(text[start : end + 1])
        raise


def run_model(prompt: str) -> dict:
    if not os.environ.get("REPLICATE_API_TOKEN"):
        raise ValueError("REPLICATE_API_TOKEN environment variable not set")

    inp = {
        "prompt": prompt,
        "max_tokens": MAX_TOKENS,
        "temperature": TEMPERATURE,
    }

    raw = ""
    try:
        for event in replicate.stream(MODEL, input=inp):
            raw += str(event)
    except Exception as e:
        print(f"⚠️  Replicate stream error: {e}, trying run()…", file=sys.stderr)
        out = replicate.run(MODEL, input=inp)
        if isinstance(out, str):
            raw = out
        else:
            raw = "".join(str(x) for x in out)

    return extract_json(raw)


def validate_payload(data: dict, week_start_iso: str, week_label: str, story: dict) -> dict:
    raw_title = data.get("page_title")
    if not isinstance(raw_title, str):
        raise ValueError("page_title must be a string")
    page_title = raw_title.strip().strip('"').strip("'")
    if len(page_title) < 3 or len(page_title) > 100:
        raise ValueError("page_title length invalid")

    forecast = data.get("weekly_forecast")
    if not isinstance(forecast, str) or len(forecast.strip()) < 40:
        raise ValueError("Invalid weekly_forecast")

    signs_out = []
    signs = data.get("signs")
    if not isinstance(signs, list):
        raise ValueError("signs must be a list")

    with open(TRAITS_PATH, "r", encoding="utf-8") as f:
        expected_order = [s["name"] for s in json.load(f)["signs"]]

    by_name = {}
    for item in signs:
        if not isinstance(item, dict):
            continue
        n = item.get("name")
        lines = item.get("lines")
        if n and isinstance(lines, list):
            cleaned = [str(x).strip() for x in lines if str(x).strip()]
            if 2 <= len(cleaned) <= 3:
                by_name[n] = cleaned

    for name in expected_order:
        if name not in by_name:
            raise ValueError(f"Missing horoscope for {name}")
        signs_out.append({"name": name, "lines": by_name[name]})

    generated_at = datetime.utcnow()
    generated_at_iso = generated_at.strftime("%Y-%m-%dT%H:%M:%SZ")

    return {
        "page_title": page_title,
        "week_start_iso": week_start_iso,
        "week_label": week_label,
        "date_caption": build_date_caption(week_start_iso, generated_at),
        "generated_at_iso": generated_at_iso,
        "news": {
            "title": story["title"],
            "source": story["source"],
            "url": story["url"],
        },
        "weekly_forecast": forecast.strip(),
        "signs": signs_out,
        "generator": {
            "llm_model": MODEL,
            "llm_provider": "Replicate",
            "news_api": "NewsAPI GET /v2/top-headlines (country=us)",
            "lucky_draw": "Powerball-style: five distinct 1–69 (sorted) plus one Powerball 1–26; snarky one-liner via same LLM.",
        },
    }


def main() -> None:
    today = datetime.utcnow().date()
    week_start_iso = today.strftime("%Y-%m-%d")
    week_label = today.strftime("%B %d, %Y")

    print("📰 Fetching top U.S. headline…")
    story = fetch_top_us_story()
    print(f"   → {story['title'][:80]}…")

    traits = load_traits()
    prompt = build_prompt(traits, story, week_label)

    print(f"🔮 Calling Replicate {MODEL}…")
    data = run_model(prompt)

    payload = validate_payload(data, week_start_iso, week_label, story)

    print("🎱 Drawing Powerball-style numbers + lucky quip…")
    horoscope_lucky.apply_lucky_to_payload(payload, story)

    DATA_PATH.parent.mkdir(parents=True, exist_ok=True)
    with open(DATA_PATH, "w", encoding="utf-8") as f:
        json.dump(payload, f, indent=2, ensure_ascii=False)
        f.write("\n")

    print(f"✅ Wrote {DATA_PATH.relative_to(REPO_ROOT)}")


if __name__ == "__main__":
    main()
