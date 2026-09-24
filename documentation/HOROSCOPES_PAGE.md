# Horoscopes Page & AI Agent Documentation

## Overview

The Horoscopes page (`/horoscopes/`) displays a weekly satirical horoscope inspired by current top news headlines and classic zodiac tropes. Content is automatically generated using NewsAPI for current U.S. headlines and **Google Gemini** (using models like `gemini-2.5-flash`) for witty text and Powerball-style lucky number commentary.

---

## Architecture & Data Flow

```
[ GitHub Action / Schedule ]
         │
         ▼
[ NewsAPI: GET top-headlines ] ──▶ Top U.S. Story (Title, Source, URL)
         │
         ▼
[ Google Gemini (gemini-2.5-flash) ] ──▶ 1. Page Title & Forecast
         │                               2. 12 Zodiac Sign Parodies
         │                               3. Lucky Number Quip
         ▼
[ scripts/horoscope_agent.py ] ──▶ Validates JSON Schema & Writes
         │
         ▼
[ _data/horoscopes.json ] ──▶ Rendered into [ public/archive/horoscopes/index.html ]
```

### Key Files

- **Page Template**: [`archive/horoscopes.html`](file:///Users/saldarji/Development/darjix/archive/horoscopes.html) / [`scripts/build-static-experiments.js`](file:///Users/saldarji/Development/darjix/scripts/build-static-experiments.js) - Generates and displays horoscopes, lucky numbers, news context, and metadata.
- **Data File**: [`_data/horoscopes.json`](file:///Users/saldarji/Development/darjix/_data/horoscopes.json) - JSON data source loaded by the static builder.
- **Main Agent Script**: [`scripts/horoscope_agent.py`](file:///Users/saldarji/Development/darjix/scripts/horoscope_agent.py) - Python script orchestrating NewsAPI, Google Gemini generation, payload validation, and file writing.
- **Lucky Draw Module**: [`scripts/horoscope_lucky.py`](file:///Users/saldarji/Development/darjix/scripts/horoscope_lucky.py) - Powerball-style number generator (1–69 main pool + 1–26 Powerball) and Google Gemini quip generator.
- **Zodiac Reference**: [`scripts/zodiac_traits.json`](file:///Users/saldarji/Development/darjix/scripts/zodiac_traits.json) - Trait and date metadata for all 12 zodiac signs.
- **Workflow**: [`.github/workflows/update-horoscopes.yml`](file:///Users/saldarji/Development/darjix/.github/workflows/update-horoscopes.yml) - Scheduled GitHub Action (Mondays 9:00 AM UTC).

---

## News Topic Filtering & Content Guidelines

To ensure horoscopes remain lighthearted, fun, and appropriate for entertainment:

- **Dark & Controversial Keyword Filter**: Headlines are checked against a blocklist (`DARK_OR_CONTROVERSIAL_KEYWORDS`) to exclude stories related to war, violent crime, trials/executions, disasters, fatal accidents, and disease outbreaks.
- **Category Fallback**: If general top headlines contain heavy or tragic news, the fetcher automatically falls back to `technology` and `entertainment` headline categories.
- **Prompt Tone Rules**: The prompt explicitly enforces a lighthearted, silly, and whimsical tone while forbidding morbid, tragic, or politically aggressive copy.

---

## Google Gemini Integration Details

Google Gemini is used as the primary LLM inference provider for generating creative, structured text.

### 1. Model Configuration

- **Default Model**: `gemini-2.5-flash`
- **Environment Override**: `HOROSCOPE_GEMINI_MODEL` or `GEMINI_MODEL`
- **Max Tokens**: `4096` (for full horoscope payload) / `256` (for lucky quip)
- **Temperature**: `0.85` (promotes creative, witty satire)

### 2. Invocation Pattern (`google.genai`)

The official Google GenAI Python SDK (`google-genai`) is used directly:

```python
from google import genai
from google.genai import types

client = genai.Client(api_key=api_key)
config = types.GenerateContentConfig(
    temperature=TEMPERATURE,
    max_output_tokens=MAX_TOKENS,
    response_mime_type="application/json",
    thinking_config=types.ThinkingConfig(thinking_budget=0),
)

response = client.models.generate_content(
    model=MODEL,
    contents=prompt,
    config=config,
)
raw = response.text or ""
```

### 3. Prompt Construction

Prompts supply the model with contextual inputs to ensure funny, relevant output while enforcing strict JSON structure:

```python
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
  "page_title": "Short, snappy title...",
  "weekly_forecast": "3-5 sentences satire based on news...",
  "signs": [
    {{"name": "Aries", "lines": ["line1", "line2"]}},
    ... exactly 12 objects in zodiac order
  ]
}}
"""
```

### 4. Robust JSON Extraction & Error Handling

LLM responses may contain markdown fences (` ```json `), unescaped control characters (such as raw newlines inside string literals), or non-printable bytes. To prevent JSON parsing errors:

- **Non-strict JSON parsing**: `json.loads(text, strict=False)` permits literal newlines and control characters in strings.
- **Markdown fence stripping**: Extracts JSON between markdown code blocks via regular expressions.
- **Control character sanitization**: Replaces non-printable characters (`[\x00-\x1f]+`) if non-strict parsing fails.
- **Retry Mechanism**: `main()` attempts model generation and validation up to 3 times before raising an error.

```python
def extract_json(text: str) -> dict:
    text = text.strip()
    fence = re.search(r"```(?:json)?\s*([\s\S]*?)\s*```", text)
    if fence:
        text = fence.group(1).strip()
    try:
        return json.loads(text, strict=False)
    except json.JSONDecodeError:
        start = text.find("{")
        end = text.rfind("}")
        if start >= 0 and end > start:
            snippet = text[start : end + 1]
            try:
                return json.loads(snippet, strict=False)
            except json.JSONDecodeError:
                cleaned = re.sub(r"[\x00-\x1f]+", " ", snippet)
                return json.loads(cleaned, strict=False)
        raise
```

### 5. Lucky Quip Generation (`horoscope_lucky.py`)

In addition to the main horoscope payload, a separate Google Gemini prompt generates a 1-sentence snarky commentary connecting the Powerball draw numbers with the current news story.

If Gemini fails or returns invalid text for the lucky quip, a fail-safe fallback string is generated automatically so the script never crashes:

```python
main_nums = ", ".join(str(x) for x in numbers[:5])
pb_num = numbers[5]
return f"With numbers {main_nums} and Powerball {pb_num}, the cosmos is holding its cards tight today."
```

---

## Environment Variables

| Variable | Required | Description |
| :--- | :--- | :--- |
| `GEMINI_API_KEY` | **Yes** | Google Gemini API authentication key |
| `NEWS_API_KEY` | **Yes** | NewsAPI key to fetch top headlines |
| `GEMINI_MODEL` / `HOROSCOPE_GEMINI_MODEL` | No | Gemini model (Default: `gemini-2.5-flash`) |
| `HOROSCOPE_MAX_TOKENS` | No | Max output tokens for horoscope generation (Default: `4096`) |
| `HOROSCOPE_TEMPERATURE` | No | Sampling temperature (Default: `0.85`) |

---

## Local Execution & Testing

Ensure dependencies are installed:
```bash
pip install -r scripts/requirements.txt
```

### Run Full Agent
Generates fresh news horoscopes, draws lucky numbers, and updates `_data/horoscopes.json`:
```bash
python scripts/horoscope_agent.py
```

### Run Lucky Draw Only (Merge mode)
Updates only `lucky_numbers` and `lucky_numbers_comment` using existing news in `_data/horoscopes.json`:
```bash
python scripts/horoscope_lucky.py --merge
```

---

## GitHub Actions Automated Schedule

- **Workflow Path**: [`.github/workflows/update-horoscopes.yml`](file:///Users/saldarji/Development/darjix/.github/workflows/update-horoscopes.yml)
- **Schedule**: Mondays at 9:00 AM UTC (`0 9 * * 1`)
- **Permissions**: `contents: write`, `actions: write`
- **Secrets Used**: `GEMINI_API_KEY`, `NEWS_API_KEY`, `GITHUB_TOKEN`
- **Post-run Action**: Commits `_data/horoscopes.json` and pushes to `main`, triggering Firebase Hosting deployment.
