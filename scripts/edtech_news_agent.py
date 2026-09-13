#!/usr/bin/env python3
"""
EdTech News Agent - High Impact Global Edition
Fetches candidates from Google News RSS and premier global education RSS feeds published in the past 7 days,
then curates 5-10 high-impact global stories using Google Gemini 2.5 Flash.
"""

import os
import re
import json
import time
import feedparser
from datetime import datetime, timedelta, timezone
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

def fetch_rss_candidates(days_back=7):
    """Fetch article candidates from Google News RSS and premier education feeds within past N days"""
    candidates = []
    seen_urls = set()
    seen_titles = set()

    now_utc = datetime.now(timezone.utc)
    cutoff_dt = now_utc - timedelta(days=days_back)

    print(f"📡 Fetching candidates published since {cutoff_dt.strftime('%Y-%m-%d')} (past {days_back} days)...")

    print("\n🔍 Querying Google News RSS feeds...")
    for query in GOOGLE_NEWS_QUERIES:
        encoded_q = quote(query)
        rss_url = f"https://news.google.com/rss/search?q={encoded_q}&hl=en-US&gl=US&ceid=US:en"
        try:
            feed = feedparser.parse(rss_url)
            count = 0
            for entry in feed.entries[:20]:
                title = entry.get('title', '').strip()
                url = entry.get('link', '').strip()
                source = entry.get('source', {}).get('title', 'Google News') if isinstance(entry.get('source'), dict) else 'Google News'
                
                # Check publication date
                pub_parsed = getattr(entry, 'published_parsed', None)
                if pub_parsed:
                    pub_dt = datetime.fromtimestamp(time.mktime(pub_parsed), tz=timezone.utc)
                    if pub_dt < cutoff_dt:
                        continue  # Skip articles older than 7 days
                else:
                    pub_dt = now_utc

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
                        'published_dt': pub_dt,
                        'published_str': pub_dt.strftime('%Y-%m-%d'),
                        'formatted_date': pub_dt.strftime('%B %d, %Y'),
                        'summary': entry.get('summary', '') or entry.get('description', '')
                    })
                    count += 1
            print(f"  ✅ Added {count} fresh candidates for '{query[:30]}...'")
        except Exception as e:
            print(f"  ⚠️  Error fetching Google News feed for '{query}': {e}")

    print("\n🔍 Querying Premier Education RSS feeds...")
    for source_name, feed_url in PREMIER_RSS_FEEDS:
        try:
            feed = feedparser.parse(feed_url)
            count = 0
            for entry in feed.entries[:15]:
                title = entry.get('title', '').strip()
                url = entry.get('link', '').strip()
                
                pub_parsed = getattr(entry, 'published_parsed', None)
                if pub_parsed:
                    pub_dt = datetime.fromtimestamp(time.mktime(pub_parsed), tz=timezone.utc)
                    if pub_dt < cutoff_dt:
                        continue
                else:
                    pub_dt = now_utc

                norm_title = re.sub(r'\W+', '', title.lower())
                if url and norm_title and norm_title not in seen_titles and url not in seen_urls:
                    seen_urls.add(url)
                    seen_titles.add(norm_title)
                    candidates.append({
                        'title': title,
                        'url': url,
                        'source': source_name,
                        'published_dt': pub_dt,
                        'published_str': pub_dt.strftime('%Y-%m-%d'),
                        'formatted_date': pub_dt.strftime('%B %d, %Y'),
                        'summary': entry.get('summary', '') or entry.get('description', '')
                    })
                    count += 1
            print(f"  ✅ Added {count} fresh candidates from {source_name}")
        except Exception as e:
            print(f"  ⚠️  Error fetching feed for {source_name}: {e}")

    # Sort candidates by publication date descending
    candidates.sort(key=lambda x: x['published_dt'], reverse=True)
    print(f"\n✅ Total fresh candidate articles collected: {len(candidates)}")
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

    # Sample top 40 candidates
    candidates_sample = candidates[:40]
    
    prompt_items = []
    for i, c in enumerate(candidates_sample, 1):
        summary_clean = clean_html(c['summary'])[:250]
        prompt_items.append(
            f"[{i}] Title: {c['title']}\n"
            f"    Source: {c['source']}\n"
            f"    URL: {c['url']}\n"
            f"    Date: {c['published_str']}\n"
            f"    Snippet: {summary_clean}\n"
        )

    prompt_text = "\n".join(prompt_items)

    selection_prompt = f"""You are an expert global education and EdTech news editor.
Select the top {max_selected} MOST IMPORTANT, HIGH-IMPACT, AND COMPELLING global education and EdTech news stories published in the past week from the following list.

CRITICAL SELECTION CRITERIA:
1. RECENT & FRESH: Only select recent stories published within the past week.
2. GLOBAL IMPACT: Choose high-impact stories from around the world (US, UK, Europe, Asia, Latin America, Australia, Africa).
3. TOPIC RELEVANCE: Focus on major policy shifts, AI in education, digital learning breakthroughs, higher education innovation, significant edtech funding/M&A, and major institutional transformations.
4. QUALITY FILTER: EXCLUDE routine local school district announcements, low-quality blog posts, self-promotional press releases, and minor personnel changes.
5. DIVERSITY: Ensure a broad variety of topics and sources. Avoid duplicate coverage of the same event.
6. QUANTITY: Select EXACTLY {max_selected} stories.

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
    for c in candidates[:max_selected]:
        clean_sum = clean_html(c['summary'])[:200]
        if not clean_sum:
            clean_sum = "Recent global education and technology development."
        selected.append({
            'title': c['title'],
            'url': c['url'],
            'source': c['source'],
            'date': c['published_str'],
            'summary': clean_sum
        })
    return selected

def format_story_html(story):
    """Format an individual news story as a clean, responsive HTML card with divider separator"""
    title = story.get('title', 'Untitled Headline').strip()
    url = story.get('url', '#').strip()
    source = story.get('source', 'EdTech News').strip()
    date_raw = story.get('date', '')
    summary = story.get('summary', '').strip()

    # Format date nicely
    formatted_date = date_raw
    if date_raw:
        try:
            dt = datetime.strptime(date_raw, '%Y-%m-%d')
            formatted_date = dt.strftime('%B %d, %Y')
        except Exception:
            pass

    card_html = (
        '<div style="margin-bottom: 24px; padding-bottom: 24px; border-bottom: 1px solid #e5e7eb;">\n'
        '  <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; flex-wrap: wrap; gap: 8px;">\n'
        f'    <span style="font-size: 0.8125rem; font-weight: 600; color: #4f46e5; background-color: #eef2ff; padding: 2px 8px; border-radius: 4px;">{source}</span>\n'
        f'    <span style="font-size: 0.8125rem; color: #6b7280;">{formatted_date}</span>\n'
        '  </div>\n'
        f'  <h3 style="margin: 0 0 8px 0; font-size: 1.125rem; font-weight: 600; line-height: 1.4;"><a href="{url}" target="_blank" rel="noopener noreferrer" style="color: #111827; text-decoration: none;">{title}</a></h3>\n'
        f'  <p style="margin: 0; font-size: 0.9375rem; color: #374151; line-height: 1.6;">{summary}</p>\n'
        '</div>'
    )
    return card_html

def update_news_file(stories, output_file='_includes/edtech-news.md'):
    """Format and write news stories to _includes/edtech-news.md using clean HTML cards"""
    today_formatted = datetime.now().strftime('%B %d, %Y')
    
    header = [
        "# EdTech News This Week\n",
        f"*Updated: {today_formatted}*\n",
        "\n"
    ]
    
    body_cards = [format_story_html(s) for s in stories]
    body_content = "\n\n".join(body_cards) + "\n"
    
    with open(output_file, 'w') as f:
        f.writelines(header)
        f.write(body_content)
        
    print(f"💾 Updated news file: {output_file} ({len(stories)} stories written with separators)")

def main():
    print("📰 EdTech News Agent - High Impact Global Edition Starting...")
    
    candidates = fetch_rss_candidates(days_back=7)
    if not candidates:
        print("⚠️  No candidate articles from past 7 days found. Retrying with 14 days back...")
        candidates = fetch_rss_candidates(days_back=14)
        
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
