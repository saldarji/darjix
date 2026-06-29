#!/usr/bin/env python3
"""
Scrape Squantum Yacht Club upcoming events from the homepage widget.

The club site is behind AWS WAF (requires JS challenge). We use Playwright
to load the homepage with a real browser — the WAF challenge resolves
automatically in ~1-7s — then intercept the widget.ashx AJAX response that
contains the event cards.

Run manually:  python scripts/scrape_syc_events.py
GitHub Action: .github/workflows/update_syc_events.yml  (nightly)
"""

import asyncio
import json
import re
import sys
from datetime import date
from pathlib import Path

from bs4 import BeautifulSoup

OUTPUT = Path(__file__).parent.parent / "data" / "syc_events.json"

EXCLUDE_KEYWORDS = [
    "hall rental", "hold", "reserved", "building closed",
    "closed", "facility hold",
]

MONTHS = {
    "january": 1, "february": 2, "march": 3, "april": 4,
    "may": 5, "june": 6, "july": 7, "august": 8,
    "september": 9, "october": 10, "november": 11, "december": 12,
}


def is_excluded(name: str) -> bool:
    return any(kw in name.lower() for kw in EXCLUDE_KEYWORDS)


def parse_card_date(date_str: str) -> str | None:
    """
    Convert ClubExpress date strings to ISO YYYY-MM-DD.
    Examples: "July 4", "July 25-26", "August 6", "September 17"
    """
    date_str = date_str.strip()
    # Handle ranges like "July 25-26" — use the start date
    date_str = re.sub(r"-\d+$", "", date_str)

    m = re.match(r"(\w+)\s+(\d+)", date_str)
    if not m:
        return None

    month_name = m.group(1).lower()
    day = int(m.group(2))
    month = MONTHS.get(month_name)
    if not month:
        return None

    today = date.today()
    year = today.year
    candidate = date(year, month, day)

    # If the date has already passed this year, assume next year
    if candidate < today:
        year += 1
        candidate = date(year, month, day)

    return candidate.isoformat()


def parse_widget_html(html: str) -> list[dict]:
    soup = BeautifulSoup(html, "html.parser")
    events = []

    for card in soup.select(".widget-card.ue-card"):
        title_el = card.select_one(".card-title")
        date_el  = card.select_one(".card-date")

        if not title_el or not date_el:
            continue

        name = title_el.get_text(strip=True)
        date_raw = date_el.get_text(strip=True)

        if not name or is_excluded(name):
            continue

        iso_date = parse_card_date(date_raw)
        if not iso_date:
            print(f"  WARNING: Could not parse date {date_raw!r} for {name!r}", file=sys.stderr)
            continue

        events.append({
            "name": name[:100],
            "date": iso_date,
            "time": None,
        })

    return events


async def scrape() -> list[dict]:
    from playwright.async_api import async_playwright

    async with async_playwright() as p:
        browser = await p.chromium.launch(
            headless=True,
            channel="chrome",          # uses installed Chrome; falls back to Chromium in CI
            args=[
                "--disable-blink-features=AutomationControlled",
                "--no-sandbox",
                "--disable-dev-shm-usage",
            ],
        )
        context = await browser.new_context(
            user_agent=(
                "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
                "AppleWebKit/537.36 (KHTML, like Gecko) "
                "Chrome/124.0.0.0 Safari/537.36"
            ),
        )
        # Mask the webdriver flag that WAF checks
        await context.add_init_script(
            "Object.defineProperty(navigator, 'webdriver', {get: () => undefined})"
        )
        page = await context.new_page()

        widget_html: list[str] = []

        async def capture_widget(response):
            if "widget.ashx" in response.url:
                body = await response.body()
                widget_html.append(body.decode("utf-8", errors="replace"))

        page.on("response", capture_widget)

        print("  Loading homepage (WAF challenge usually resolves in ~7s)…")
        await page.goto("https://squantumyc.clubexpress.com/", timeout=40000)

        # Poll until WAF challenge passes
        for i in range(20):
            await page.wait_for_timeout(1000)
            title = await page.title()
            if title != "Human Verification":
                print(f"  WAF cleared after ~{i+1}s  ({title!r})")
                break
        else:
            print("  ERROR: WAF challenge did not resolve after 20s.", file=sys.stderr)
            await browser.close()
            return []

        # Wait up to 10s for the widget AJAX call
        for _ in range(10):
            await page.wait_for_timeout(1000)
            if widget_html:
                break

        await browser.close()

    if not widget_html:
        print("  ERROR: widget.ashx response not captured.", file=sys.stderr)
        return []

    print(f"  Widget response: {len(widget_html[0])} bytes")
    return parse_widget_html(widget_html[0])


if __name__ == "__main__":
    print("Scraping SYC upcoming events from homepage widget…")

    events = asyncio.run(scrape())

    if not events:
        print("WARNING: No events found. Keeping existing data.", file=sys.stderr)
        sys.exit(0)

    print(f"Found {len(events)} upcoming events:")
    for e in events:
        print(f"  {e['date']}  {e['name']}")

    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT.write_text(json.dumps(events, indent=2) + "\n")
    print(f"\nWritten → {OUTPUT}")
