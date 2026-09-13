#!/usr/bin/env python3
"""
EdTech News Agent - High Impact Global Edition
Fetches candidates from Google News RSS and premier global education RSS feeds,
then curates 5-10 high-impact global stories using Google Gemini 2.5 Flash.
"""

import os
import re
import json
import feedparser
from datetime import datetime
from urllib.parse import quote

# Load environment variables from .env file if it exists
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

try:
    from google import genai
except ImportError:
    genai = None

# RSS Feed Configurations
GOOGLE_NEWS_QUERIES = [
    'EdTech OR "Education Technology"',
    '"AI in education" OR "AI tutoring" OR "AI classroom"',
    '"higher education" innovation OR "digital learning"',
    'learning technology OR "educational software"'
]

PREMIER_RSS_FEEDS = [
    ('EdSurge', 'https://www.edsurge.com/articles_feed'),
    ('Inside Higher Ed', 'https://www.insidehighered.com/rss/feed/index.xml'),
    ('Higher Ed Dive', 'https://www.highereddive.com/feeds/news/'),
    ('K-12 Dive', 'https://www.k12dive.com/feeds/news/'),
    ('Times Higher Education', 'https://www.timeshighereducation.com/rss.xml'),
    ('TechCrunch EdTech', 'https://techcrunch.com/category/edtech/feed/')
]

def fetch_rss_candidates():
    """Fetch article candidates from Google News RSS and premier education feeds"""
    candidates = []
    seen_urls = set()
    seen_titles = set()

    print("📡 Fetching candidates from Google News RSS feeds...")
    for query in GOOGLE_NEWS_QUERIES:
        encoded_q = quote(query)
        rss_url = f"https://news.google.com/rss/search?q={encoded_q}&hl=en-US&gl=US&ceid=US:en"
        try:
            feed = feedparser.parse(rss_url)
            count = 0
            for entry in feed.entries[:15]:
                title = entry.get('title', '').strip()
                url = entry.get('link', '').strip()
                published = entry.get('published', '') or entry.get('updated', '')
                source = entry.get('source', {}).get('title', 'Google News') if isinstance(entry.get('source'), dict) else 'Google News'
                
                # Extract domain/source from title if formatted like "Title - Source"
                if ' - ' in title:
                    parts = title.rsplit(' - ', 1)
                    title = parts[0].strip()
                    if source == 'Google News':
                        source = parts[1].strip()

                norm_title = re.sub(r'\W+', '', title.lower())
                if url and norm_title and norm_title not in seen_titles and url not in seen_urls:
                    seen_urls.add(url)
                    seen_titles.add(norm_title)
                    candidates.append({
                        'title': title,
                        'url': url,
                        'source': source,
                        'published': published,
                        'summary': entry.get('summary', '') or entry.get('description', '')
                    })
                    count += 1
            print(f"  ✅ Added {count} candidates for query '{query[:30]}...'")
        except Exception as e:
            print(f"  ⚠️  Error fetching Google News feed for '{query}': {e}")

    print("\n📡 Fetching candidates from Premier Education RSS feeds...")
    for source_name, feed_url in PREMIER_RSS_FEEDS:
        try:
            feed = feedparser.parse(feed_url)
            count = 0
            for entry in feed.entries[:10]:
                title = entry.get('title', '').strip()
                url = entry.get('link', '').strip()
                published = entry.get('published', '') or entry.get('updated', '')
                
                norm_title = re.sub(r'\W+', '', title.lower())
                if url and norm_title and norm_title not in seen_titles and url not in seen_urls:
                    seen_urls.add(url)
                    seen_titles.add(norm_title)
                    candidates.append({
                        'title': title,
                        'url': url,
                        'source': source_name,
                        'published': published,
                        'summary': entry.get('summary', '') or entry.get('description', '')
                    })
                    count += 1
            print(f"  ✅ Added {count} candidates from {source_name}")
        except Exception as e:
            print(f"  ⚠️  Error fetching feed for {source_name}: {e}")

    print(f"\n✅ Total candidate articles collected: {len(candidates)}")
    return candidates

def clean_html(text):
    """Strip HTML tags from summary snippets"""
    if not text:
        return ""
    clean = re.sub(r'<[^>]+>', '', text)
    return ' '.join(clean.split())

def select_and_summarize_stories(candidates, max_selected=8):
    """Select 5-10 high-impact global stories using Gemini 2.5 Flash"""
    if not candidates:
        return []

    api_key = os.environ.get('GEMINI_API_KEY')
    if not api_key or genai is None:
        print("⚠️  GEMINI_API_KEY not set or google-genai SDK unavailable. Using candidate fallback...")
        return fallback_selection(candidates, max_selected)

    # Limit to top 50 candidates for prompt efficiency
    candidates_sample = candidates[:50]
    
    prompt_items = []
    for i, c in enumerate(candidates_sample, 1):
        summary_clean = clean_html(c['summary'])[:250]
        prompt_items.append(
            f"[{i}] Title: {c['title']}\n"
            f"    Source: {c['source']}\n"
            f"    URL: {c['url']}\n"
            f"    Published: {c['published']}\n"
            f"    Snippet: {summary_clean}\n"
        )

    prompt_text = "\n".join(prompt_items)

    selection_prompt = f"""You are an expert global education and EdTech news editor.
Select the top {max_selected} MOST IMPORTANT, HIGH-IMPACT, AND COMPELLING global education and EdTech news stories from the following list.

CRITICAL SELECTION CRITERIA:
1. GLOBAL IMPACT: Choose high-impact stories from around the world (US, UK, Europe, Asia, Latin America, Australia, Africa).
2. TOPIC RELEVANCE: Focus on major policy shifts, AI in education, digital learning breakthroughs, higher education innovation, significant edtech funding/M&A, and major institutional transformations.
3. QUALITY FILTER: EXCLUDE routine local school district announcements, low-quality blog posts, self-promotional press releases, and minor personnel changes.
4. DIVERSITY: Ensure a broad variety of topics and sources. Avoid duplicate coverage of the same event.
5. QUANTITY: Select EXACTLY {max_selected} stories.

OUTPUT FORMAT:
Return ONLY a valid JSON array of objects for the {max_selected} chosen stories in this exact JSON schema:
[
  {{
    "index": 1,
    "title": "Compelling Headline",
    "url": "Exact Article URL from candidate list",
    "source": "Publisher Name",
    "date": "YYYY-MM-DD",
    "summary": "Crisp 2-sentence executive summary highlighting why this story matters globally for education."
  }}
]

Candidates:
{prompt_text}

JSON Output:"""

    try:
        print(f"\n🔍 Curating top {max_selected} stories using Gemini 2.5 Flash...")
        client = genai.Client(api_key=api_key)
        model_name = os.environ.get('GEMINI_MODEL', 'gemini-2.5-flash')
        
        response = client.models.generate_content(
            model=model_name,
            contents=selection_prompt
        )
        
        result_text = response.text or ""
        
        # Extract JSON array from response
        json_match = re.search(r'\[\s*\{.*\}\s*\]', result_text, re.DOTALL)
        if json_match:
            stories = json.loads(json_match.group(0))
            if isinstance(stories, list) and len(stories) > 0:
                print(f"✅ Gemini successfully selected {len(stories)} high-impact stories!")
                return stories

        print("⚠️  Could not parse JSON from Gemini response. Falling back to candidate sorting...")
        return fallback_selection(candidates, max_selected)

    except Exception as e:
        print(f"⚠️  Gemini API error: {e}")
        return fallback_selection(candidates, max_selected)

def fallback_selection(candidates, max_selected=8):
    """Fallback candidate selection when Gemini API is unconfigured or unavailable"""
    selected = []
    today_str = datetime.now().strftime('%Y-%m-%d')
    for c in candidates[:max_selected]:
        clean_sum = clean_html(c['summary'])[:200]
        if not clean_sum:
            clean_sum = "Recent global education and technology development."
        selected.append({
            'title': c['title'],
            'url': c['url'],
            'source': c['source'],
            'date': today_str,
            'summary': clean_sum
        })
    return selected

def update_news_file(stories, output_file='_includes/edtech-news.md'):
    """Format and write news stories to _includes/edtech-news.md"""
    today_formatted = datetime.now().strftime('%B %d, %Y')
    
    lines = [
        "# EdTech News This Week\n",
        f"*Updated: {today_formatted}*\n",
        "\n"
    ]
    
    for s in stories:
        title = s.get('title', 'Untitled')
        url = s.get('url', '#')
        source = s.get('source', 'News Source')
        date_str = s.get('date', datetime.now().strftime('%Y-%m-%d'))
        summary = s.get('summary', '').strip()
        
        entry = f"- {date_str}: [{title}]({url}) - {summary} [{source}]\n"
        lines.append(entry)
        
    with open(output_file, 'w') as f:
        f.writelines(lines)
        
    print(f"💾 Updated news file: {output_file} ({len(stories)} stories written)")

def main():
    print("📰 EdTech News Agent - High Impact Global Edition Starting...")
    
    candidates = fetch_rss_candidates()
    if not candidates:
        print("⚠️  No candidates found. Exiting.")
        return
        
    stories = select_and_summarize_stories(candidates, max_selected=8)
    if not stories:
        print("⚠️  No stories curated. Exiting.")
        return
        
    update_news_file(stories)
    print("\n🎉 EdTech News update complete!")

if __name__ == '__main__':
    main()
