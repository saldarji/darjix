#!/usr/bin/env python3
"""
EdTech News Agent - Fetches and summarizes edtech news using Replicate
Configuration is centralized in edtech-news-config.md
"""

import os
import re
import json
import replicate
from datetime import datetime, timedelta
from newsapi import NewsApiClient

# Load environment variables from .env file if it exists
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass  # dotenv not installed, use environment variables directly

def parse_config(config_path='scripts/edtech-news-config.md'):
    """Parse configuration from markdown file"""
    if not os.path.exists(config_path):
        raise FileNotFoundError(f"Configuration file not found: {config_path}")
    with open(config_path, 'r') as f:
        content = f.read()
    
    config = {
        'model': 'meta/meta-llama-3.1-70b-instruct',
        'max_tokens': 1024,
        'temperature': 0.7,
        'top_p': 0.9,
        'days_back': 7,
        'max_articles_per_query': 10,
        'total_max_articles': 15,
        'language': 'en',
        'sort_by': 'relevancy',
        'output_file': '_includes/featured-content.md',
        'query_strategies': []
    }
    
    # Parse model settings
    if match := re.search(r'\*\*Model\*\*:\s*(.+)', content):
        config['model'] = match.group(1).strip()
    if match := re.search(r'\*\*Max Tokens\*\*:\s*(\d+)', content):
        config['max_tokens'] = int(match.group(1))
    if match := re.search(r'\*\*Temperature\*\*:\s*([\d.]+)', content):
        config['temperature'] = float(match.group(1))
    if match := re.search(r'\*\*Top P\*\*:\s*([\d.]+)', content):
        config['top_p'] = float(match.group(1))
    
    # Parse news settings
    if match := re.search(r'\*\*Days Back\*\*:\s*(\d+)', content):
        config['days_back'] = int(match.group(1))
    if match := re.search(r'\*\*Max Articles Per Query\*\*:\s*(\d+)', content):
        config['max_articles_per_query'] = int(match.group(1))
    if match := re.search(r'\*\*Total Max Articles\*\*:\s*(\d+)', content):
        config['total_max_articles'] = int(match.group(1))
    if match := re.search(r'\*\*Sort By\*\*:\s*(.+)', content):
        config['sort_by'] = match.group(1).strip()
    
    # Parse query strategies
    strategy_pattern = r'## Query Strategy \d+:(.+?)(?=\n## Query Strategy \d+:|## Prompt Template|## Output Settings)'
    strategies = re.findall(strategy_pattern, content, re.DOTALL)
    
    for strategy_text in strategies:
        strategy = {}
        if match := re.search(r'\*\*Domains\*\*:\s*(.+)', strategy_text):
            strategy['domains'] = match.group(1).strip()
        if match := re.search(r'\*\*Keywords\*\*:\s*(.+)', strategy_text):
            strategy['keywords'] = match.group(1).strip()
        if match := re.search(r'\*\*Keywords in Title\*\*:\s*(true|false)', strategy_text, re.IGNORECASE):
            strategy['keywords_in_title'] = match.group(1).lower() == 'true'
        if match := re.search(r'\*\*Focus\*\*:\s*(.+)', strategy_text):
            strategy['focus'] = match.group(1).strip()
        config['query_strategies'].append(strategy)
    
    # Fallback to single query if no strategies found
    if not config['query_strategies']:
        # Legacy single query support
        if match := re.search(r'\*\*Keywords\*\*:\s*(.+)', content):
            config['query_strategies'] = [{'keywords': match.group(1).strip()}]
        if match := re.search(r'\*\*Domains\*\*:\s*(.+)', content):
            if config['query_strategies']:
                config['query_strategies'][0]['domains'] = match.group(1).strip()
    
    # Parse prompt template
    if match := re.search(r'## Prompt Template\n(.+?)(?=\n## )', content, re.DOTALL):
        config['prompt_template'] = match.group(1).strip()
    
    # Parse output settings
    if match := re.search(r'\*\*Output File\*\*:\s*(.+)', content):
        config['output_file'] = match.group(1).strip()
    
    # Parse blacklisted sources
    if match := re.search(r'\*\*Sources to Exclude\*\*:\s*(.+)', content):
        config['blacklisted_sources'] = [s.strip() for s in match.group(1).split(',')]
    else:
        config['blacklisted_sources'] = []
    
    return config

def fetch_news(config):
    """Fetch news articles using NewsAPI with multiple query strategies"""
    api_key = os.environ.get('NEWS_API_KEY')
    if not api_key:
        raise ValueError("NEWS_API_KEY environment variable not set")
    
    newsapi = NewsApiClient(api_key=api_key)
    from_date = datetime.now() - timedelta(days=config['days_back'])
    
    all_articles = []
    seen_urls = set()
    
    # Run each query strategy
    for i, strategy in enumerate(config['query_strategies'], 1):
        print(f"🔍 Running Query Strategy {i}: {strategy.get('focus', 'General search')}")
        
        # Build parameters based on strategy
        params = {
            'from_param': from_date.strftime('%Y-%m-%d'),
            'language': config['language'],
            'sort_by': config['sort_by'],
            'page_size': config['max_articles_per_query']
        }
        
        # Use qInTitle if specified, otherwise use q
        if strategy.get('keywords_in_title', False):
            params['qintitle'] = strategy['keywords']
        else:
            params['q'] = strategy['keywords']
        
        # Add domains filter if specified
        if strategy.get('domains'):
            params['domains'] = strategy['domains']
        
        try:
            articles = newsapi.get_everything(**params)
            
            # Deduplicate by URL and filter blacklisted sources
            new_count = 0
            for article in articles['articles']:
                url = article['url']
                source_domain = article['source']['name'].lower()
                
                # Check if source is blacklisted (check both domain and name)
                is_blacklisted = any(blacklisted in source_domain or blacklisted in article['source']['name'].lower() for blacklisted in config['blacklisted_sources'])
                if is_blacklisted:
                    continue
                
                if url not in seen_urls:
                    seen_urls.add(url)
                    all_articles.append(article)
                    new_count += 1
            
            print(f"   ✅ Found {len(articles['articles'])} articles ({new_count} new)")
            
        except Exception as e:
            print(f"   ⚠️  Error in query {i}: {e}")
            continue
    
    # Sort by popularity and limit to total max articles
    # Note: NewsAPI already returns sorted results, so we just take the first N
    all_articles = all_articles[:config['total_max_articles']]
    
    return all_articles

def summarize_with_replicate(articles, config, use_selection_prompt=False):
    """Summarize articles using Replicate with full NewsAPI response data"""
    # Format articles for the prompt with full NewsAPI data
    articles_text_parts = []
    for i, article in enumerate(articles, 1):
        article_text = f"[{i}] {article.get('title', 'N/A')}\n"
        article_text += f"    Source: {article.get('source', {}).get('name', 'Unknown') if isinstance(article.get('source'), dict) else article.get('source', 'Unknown')}\n"
        article_text += f"    URL: {article.get('url', 'N/A')}\n"
        if article.get('author'):
            article_text += f"    Author: {article['author']}\n"
        if article.get('publishedAt'):
            article_text += f"    Published: {article['publishedAt']}\n"
        article_text += f"    Description: {article.get('description', 'N/A')}\n"
        # Include content field if available (NewsAPI may provide truncated content)
        if article.get('content'):
            # Remove [Removed] or [Subscription required] markers that NewsAPI sometimes adds
            content = article['content'].replace('[Removed]', '').replace('[+X chars]', '').strip()
            if content and len(content) > 50:  # Only include if substantial content
                article_text += f"    Content: {content}\n"
        articles_text_parts.append(article_text)
    
    articles_text = "\n\n".join(articles_text_parts)
    
    # Use selection prompt for automatic selection, but summarization prompt for selected articles
    if use_selection_prompt:
        prompt = f"{config['prompt_template']}\n\n" \
                 f"IMPORTANT: Include the source article number [1], [2], etc. at the start of each bullet point.\n\n" \
                 f"Articles:\n{articles_text}"
    else:
        # Summarization prompt for pre-selected articles
        prompt = f"""Summarize the following education technology news articles. For each article, provide a brief, engaging summary (1-2 sentences) that captures the key news, developments, or insights.

IMPORTANT: 
- Include the source article number [1], [2], etc. at the start of each summary
- Write naturally as news summaries
- Focus on what makes each story relevant and interesting
- Keep summaries concise but informative

Articles:
{articles_text}

Provide a numbered list with summaries for ALL articles."""
    
    # Run the model - using the streaming format for Deepseek
    try:
        output = ""
        for event in replicate.stream(
            config['model'],
            input={
                "prompt": prompt,
                "max_tokens": config['max_tokens'],
            }
        ):
            output += str(event)
        
        result = output
        
        # Add links to the summary
        result = add_article_links(result, articles)
        return result
    except Exception as e:
        print(f"⚠️  Replicate streaming error: {e}")
        print("Trying with alternative parameters...")
        
        # Fallback with simpler parameters
        try:
            output = replicate.run(
                config['model'],
                input={"prompt": prompt}
            )
            result = "".join(str(item) for item in output)
            result = add_article_links(result, articles)
            return result
        except Exception as e2:
            print(f"❌ Replicate fallback also failed: {e2}")
            raise RuntimeError(f"Both Replicate API calls failed. Streaming error: {e}, Fallback error: {e2}")

def add_article_links(summary, articles):
    """Add markdown links to article titles in the summary"""
    import re
    
    # Don't add links here - let format_news_output handle it
    # This function was causing issues by trying to reformat LLM output
    return summary

def format_news_output(summary, articles):
    """Parse LLM output and format it exactly as requested"""
    import re
    
    # Clean up the summary - remove intro text and find the numbered list
    lines = summary.split('\n')
    formatted_items = []
    
    for line in lines:
        line = line.strip()
        if not line:
            continue
            
        # Look for numbered items in various formats:
        # Format 1: "1. [N] Summary text"
        # Format 2: "1. Summary text [N]"
        # Format 3: "[1] Summary text"
        match = re.match(r'^(\d+)\.?\s+(.+)$', line)
        if not match:
            match = re.match(r'^\[(\d+)\]\s+(.+)$', line)
        
        if match:
            item_num = match.group(1)
            ai_analysis = match.group(2).strip()
            
            # Extract article number from within the summary (e.g., [1], [11], [12])
            article_num_match = re.search(r'\[(\d+)\]', ai_analysis)
            if article_num_match:
                article_index = int(article_num_match.group(1)) - 1
            else:
                # Fallback to using the list number
                article_index = int(item_num) - 1
            
            # Find the corresponding article
            if 0 <= article_index < len(articles):
                article = articles[article_index]
                title = article['title']
                url = article['url']
                source = article['source']['name']
                
                # Get publication date from article
                pub_date = None
                if article.get('publishedAt'):
                    try:
                        # Parse ISO format date (e.g., "2025-11-07T12:00:00Z")
                        pub_datetime = datetime.fromisoformat(article['publishedAt'].replace('Z', '+00:00'))
                        pub_date = pub_datetime.strftime('%Y-%m-%d')
                    except Exception:
                        pass
                
                # Remove the article number from the summary
                ai_analysis = re.sub(r'\[(\d+)\]', '', ai_analysis).strip()
                ai_analysis = re.sub(r'https?://[^\s]+', '', ai_analysis).strip()
                # Remove leading asterisks or other formatting markers
                ai_analysis = re.sub(r'^\*+\s*', '', ai_analysis).strip()
                
                # Only add if there's actual summary text
                if ai_analysis:
                    # Format as: #. [title with link] - AI analysis [Source]
                    # Include publication date if available
                    formatted_item = f"{item_num}. [{title}]({url}) - {ai_analysis} [{source}]"
                    if pub_date:
                        formatted_item = f"{pub_date}|{formatted_item}"
                    formatted_items.append(formatted_item)
    
    return '\n'.join(formatted_items)

def update_website(summary, articles, config):
    """Update rolling include with dated items (keep last 7 days)."""
    formatted_summary = format_news_output(summary, articles)
    update_rolling_include(formatted_summary, config['output_file'])

def select_top_stories_batched(articles, config):
    """Select top stories using batched LLM processing"""
    
    # Split articles into batches if too many
    MAX_BATCH_SIZE = 15
    if len(articles) <= MAX_BATCH_SIZE:
        batches = [articles]
    else:
        batches = [articles[i:i+MAX_BATCH_SIZE] for i in range(0, len(articles), MAX_BATCH_SIZE)]
    
    all_selected = []
    all_oddballs = []
    
    for i, batch in enumerate(batches):
        print(f"🔍 Processing batch {i+1}/{len(batches)} ({len(batch)} articles)...")
        
        # Format articles for LLM with full NewsAPI response data
        articles_text = ""
        for j, article in enumerate(batch, 1):
            articles_text += f"[{j}] {article.get('title', 'N/A')}\n"
            articles_text += f"    Source: {article.get('source', {}).get('name', 'Unknown')}\n"
            articles_text += f"    URL: {article.get('url', 'N/A')}\n"
            if article.get('author'):
                articles_text += f"    Author: {article['author']}\n"
            if article.get('publishedAt'):
                articles_text += f"    Published: {article['publishedAt']}\n"
            articles_text += f"    Description: {article.get('description', 'N/A')}\n"
            # Include content field if available (NewsAPI may provide truncated content)
            if article.get('content'):
                # Remove [Removed] or [Subscription required] markers that NewsAPI sometimes adds
                content = article['content'].replace('[Removed]', '').replace('[+X chars]', '').strip()
                if content and len(content) > 50:  # Only include if substantial content
                    articles_text += f"    Content: {content}\n"
            articles_text += "\n"
        
        selection_prompt = f"""You MUST select AT LEAST 5-8 articles from the following list. Aim for 6-8 articles to provide a comprehensive weekly news roundup.

CRITICAL REQUIREMENTS:
1. US-ONLY: Reject ALL international news (UK universities, Irish edtech, etc.)
2. EDUCATION + TECHNOLOGY FOCUS: Prioritize articles about:
   - AI/ML applications in education (ChatGPT, AI tutoring, adaptive learning)
   - EdTech innovation (digital learning platforms, educational software, VR/AR in education)
   - Technology's impact on teaching/learning outcomes
   - Education technology policy and funding
   - EdTech market developments (M&A, funding, startups)

3. DIVERSITY: Avoid selecting multiple articles on the same topic/event. If there are multiple articles about the same story, select only the BEST one.

4. MINIMUM SELECTION: You MUST select at least 5 articles. If there are fewer than 5 suitable articles, select the best available ones even if they're not perfect matches.

REJECT articles that:
- Are about non-US education (UK, Ireland, Canada, etc.)
- Are course listings or product reviews
- Are purely promotional content
- Are routine obituaries or personnel changes

ACCEPT articles that:
- Mention education and technology together, even if not the primary focus
- Are about US education policy, funding, or institutional changes
- Cover edtech companies, products, or market developments
- Discuss AI/tech in educational contexts

OUTPUT FORMAT:
For each selected article, provide:
[Article Number] [Title]

Also identify any "oddball" stories (unusual AI applications, controversial tech implementations, unexpected education-tech partnerships) by adding "ODDBALL:" before the title.

IMPORTANT: Select 5-8 articles. Do not be overly selective - include articles that are reasonably relevant to education technology.

Articles:
{articles_text}

Selected Stories:"""

        try:
            output = replicate.run(
                config['model'],
                input={"prompt": selection_prompt, "max_tokens": 1024, "temperature": 0.3}
            )
            
            result = "".join(str(item) for item in output)
            selected, oddballs = parse_batched_selection(result, batch)
            all_selected.extend(selected)
            all_oddballs.extend(oddballs)
            
            print(f"  ✅ Selected {len(selected)} stories from batch")
            if oddballs:
                print(f"  🎯 Found {len(oddballs)} oddball stories")
                
        except Exception as e:
            print(f"  ❌ Error processing batch: {e}")
            # Fallback: select first few articles
            fallback = batch[:5]
            all_selected.extend([{'article': article, 'reason': 'Fallback selection'} for article in fallback])
    
    # Ensure we have at least 5 articles selected
    # If LLM was too selective, add more from the original articles list
    if len(all_selected) < 5 and len(articles) >= 5:
        print(f"  ⚠️  Only {len(all_selected)} articles selected, adding more to reach minimum of 5...")
        # Get URLs of already selected articles for comparison
        selected_urls = {item.get('article', {}).get('url') for item in all_selected if item.get('article', {}).get('url')}
        # Add articles that weren't selected yet
        for article in articles:
            if len(all_selected) >= 5:
                break
            article_url = article.get('url')
            if article_url and article_url not in selected_urls:
                all_selected.append({'article': article, 'reason': 'Minimum selection requirement'})
                selected_urls.add(article_url)
        print(f"  ✅ Now have {len(all_selected)} articles selected")
    
    # Limit to top 8 total
    final_selected = all_selected[:8]
    final_oddball = all_oddballs[0] if all_oddballs else None
    
    return final_selected, final_oddball

def parse_batched_selection(llm_output, articles):
    """Parse LLM output to extract selected articles and oddballs"""
    selected = []
    oddballs = []
    
    lines = llm_output.split('\n')
    
    for line in lines:
        line = line.strip()
        if not line:
            continue
            
        # Look for [N] format or N. format
        match = re.match(r'^\[(\d+)\]\s+(.+)$', line)
        if not match:
            match = re.match(r'^(\d+)\.?\s+(.+)$', line)
        
        if not match:
            continue
            
        article_num = int(match.group(1))
        title = match.group(2).strip()
        
        # Check if it's an oddball
        is_oddball = 'ODDBALL:' in title
        if is_oddball:
            title = title.replace('ODDBALL:', '').strip()
        
        # Find the corresponding article
        if 1 <= article_num <= len(articles):
            article = articles[article_num - 1]
            
            # Verify title matches (fuzzy match)
            if title.lower() in article['title'].lower() or article['title'].lower() in title.lower():
                item = {'article': article}
                
                if is_oddball:
                    oddballs.append(item)
                else:
                    selected.append(item)
    
    return selected, oddballs


def update_website_with_scoring(top_stories, oddball_story, config):
    """Update rolling include from selected stories (keep last 7 days)."""
    lines = []
    for i, item in enumerate(top_stories, 1):
        a = item['article']
        desc = a.get('description', 'No description available')
        lines.append(f"{i}. [{a['title']}]({a['url']}) - {desc} [{a['source']['name']}]")
    formatted = "\n".join(lines)
    update_rolling_include(formatted, config['output_file'])

def write_candidates_page(articles, config):
    """Write candidates to scripts/news_candidates.json with full NewsAPI response data."""
    today = datetime.now().strftime('%Y-%m-%d')
    os.makedirs('scripts', exist_ok=True)

    # Save full NewsAPI response data for each article
    mapping = []
    for i, a in enumerate(articles):
        article_data = {
            'index': i + 1,
            'title': a.get('title', ''),
            'url': a.get('url', ''),
            'source': a.get('source', {}).get('name', 'Unknown'),
            'description': a.get('description') or '',
            # Include all available NewsAPI fields
            'author': a.get('author', ''),
            'publishedAt': a.get('publishedAt', ''),
            'content': a.get('content', ''),  # May be truncated or None
            'urlToImage': a.get('urlToImage', '')
        }
        mapping.append(article_data)
    
    with open('scripts/news_candidates.json', 'w') as jf:
        json.dump(mapping, jf, indent=2)

    print(f"✅ Wrote candidates to scripts/news_candidates.json ({len(mapping)} articles)")

def _parse_existing_dated_items(lines):
    items = []
    for line in lines:
        line = line.strip()
        if not line or line.startswith('#') or line.startswith('*Updated:'):
            continue
        m = re.match(r'^-\s+(\d{4}-\d{2}-\d{2}):\s+(.*)$', line)
        if m:
            items.append({'date': m.group(1), 'text': m.group(2), 'raw': line})
    return items

def _extract_url(text):
    m = re.search(r'\((https?://[^)]+)\)', text)
    return m.group(1) if m else None

def update_rolling_include(formatted_text, include_path):
    today_str = datetime.now().strftime('%Y-%m-%d')

    # Convert formatted numbered lines to dated bullets
    new_lines = []
    for line in formatted_text.split('\n'):
        line = line.strip()
        if not line:
            continue
        
        # Check if line has date prefix (format: "YYYY-MM-DD|content")
        date_str = None
        if '|' in line:
            parts = line.split('|', 1)
            if len(parts) == 2:
                # Check if first part looks like a date
                try:
                    datetime.strptime(parts[0], '%Y-%m-%d')
                    date_str = parts[0]
                    line = parts[1]
                except ValueError:
                    pass
        
        m = re.match(r'^(?:\d+\.|-)\s+(.*)$', line)
        payload = m.group(1) if m else line
        
        # Use article publication date if available, otherwise use today
        date_to_use = date_str if date_str else today_str
        new_lines.append(f"- {date_to_use}: {payload}")

    existing_lines = []
    if os.path.exists(include_path):
        with open(include_path, 'r') as f:
            existing_lines = f.readlines()

    # Preserve header lines and split body
    header = []
    body = []
    after_header = False
    for l in existing_lines:
        if not after_header and (l.startswith('#') or l.startswith('*Updated:') or l.strip() == ''):
            header.append(l)
        else:
            after_header = True
            body.append(l)

    if not header:
        header = [f"# EdTech News This Week\n", f"*Updated: {datetime.now().strftime('%B %d, %Y')}*\n", "\n"]

    existing_items = _parse_existing_dated_items(body)

    combined = []
    for nl in new_lines:
        combined.append({'date': today_str, 'text': nl.split(': ', 1)[1], 'raw': nl})
    combined.extend(existing_items)

    seen = set()
    deduped = []
    for item in combined:
        url = _extract_url(item['text'])
        key = url or item['text']
        if key in seen:
            continue
        seen.add(key)
        deduped.append(item)

    cutoff = datetime.now() - timedelta(days=7)
    pruned = []
    for item in deduped:
        try:
            d = datetime.strptime(item['date'], '%Y-%m-%d')
        except Exception:
            continue
        if d >= cutoff:
            pruned.append(item)

    # Refresh the Updated line in header
    refreshed_header = []
    updated_line_written = False
    for h in header:
        if h.startswith('*Updated:'):
            refreshed_header.append(f"*Updated: {datetime.now().strftime('%B %d, %Y')}*\n")
            updated_line_written = True
        else:
            refreshed_header.append(h)
    if not updated_line_written:
        refreshed_header = [f"# EdTech News This Week\n", f"*Updated: {datetime.now().strftime('%B %d, %Y')}*\n", "\n"]

    body_lines = [f"- {item['date']}: {item['text']}\n" for item in pruned]
    with open(include_path, 'w') as f:
        f.writelines(refreshed_header)
        f.writelines(body_lines)
    print(f"✅ Updated rolling include: {include_path} ({len(body_lines)} items)")

def load_selected_articles(selection_path, candidates_json_path='scripts/news_candidates.json'):
    """Load selected articles from a text file of numbers or URLs."""
    with open(candidates_json_path, 'r') as jf:
        candidates = json.load(jf)

    url_to_item = {c['url']: c for c in candidates}
    idx_to_item = {int(c['index']): c for c in candidates}

    if not os.path.exists(selection_path):
        raise FileNotFoundError(f"Selection file not found: {selection_path}")

    selected = []
    with open(selection_path, 'r') as sf:
        for line in sf:
            token = line.strip()
            if not token or token.startswith('#'):
                continue
            if token.isdigit():
                idx = int(token)
                if idx in idx_to_item:
                    selected.append(idx_to_item[idx])
            else:
                # Try exact match first
                if token in url_to_item:
                    selected.append(url_to_item[token])
                else:
                    # Try partial URL matching (in case of query params or trailing slashes)
                    for url, item in url_to_item.items():
                        if token in url or url in token:
                            selected.append(item)
                            break

    # Convert to the article shape expected by summarization/formatters
    # Preserve all NewsAPI fields from JSON
    articles = []
    for item in selected:
        article = {
            'title': item.get('title', ''),
            'url': item.get('url', ''),
            'source': {'name': item.get('source', 'Unknown')},
            'description': item.get('description') or ''
        }
        # Include all other NewsAPI fields if available
        if item.get('author'):
            article['author'] = item['author']
        if item.get('publishedAt'):
            article['publishedAt'] = item['publishedAt']
        if item.get('content'):
            article['content'] = item['content']
        if item.get('urlToImage'):
            article['urlToImage'] = item['urlToImage']
        articles.append(article)
    return articles

def main():
    import sys
    
    # Flags
    test_mode = '--test' in sys.argv or '-t' in sys.argv
    candidates_mode = '--candidates' in sys.argv
    summarize_from = None
    if '--summarize-from' in sys.argv:
        i = sys.argv.index('--summarize-from')
        if i + 1 < len(sys.argv):
            summarize_from = sys.argv[i + 1]
    
    print("🤖 EdTech News Agent Starting...")
    if test_mode:
        print("🧪 TEST MODE: Will fetch articles but NOT send to LLM")
    if candidates_mode:
        print("📝 CANDIDATES MODE: Will fetch and write candidates only (no AI)")
    if summarize_from:
        print(f"🧾 SUMMARIZE MODE: Will summarize articles listed in {summarize_from}")
    
    # Parse configuration
    config = parse_config()
    print(f"📋 Config loaded: Using {config['model']}")
    print(f"📊 Query Strategies: {len(config['query_strategies'])}")
    
    # SUMMARIZE SELECTED: Use selection file to choose articles, then summarize
    # Do this BEFORE fetching news to avoid unnecessary API calls
    if summarize_from:
        print("\n🧭 Loading selected articles...")
        selected_articles = load_selected_articles(summarize_from)
        if not selected_articles:
            print("⚠️  No matching selections found. Exiting.")
            return
        print(f"✅ Loaded {len(selected_articles)} selected articles")

        print(f"\n🧠 Summarizing with {config['model']}...")
        summary = summarize_with_replicate(selected_articles, config, use_selection_prompt=False)
        print("\n💾 Updating website...")
        update_website(summary, selected_articles, config)
        print("\n🎉 Done!")
        return
    
    # Fetch news (only if not in summarize mode)
    print(f"\n📰 Fetching news articles...")
    articles = fetch_news(config)
    print(f"\n✅ Total unique articles found: {len(articles)}")
    
    if not articles:
        print("⚠️  No articles found. Exiting.")
        return
    
    # TEST MODE: Just display articles without LLM
    if test_mode:
        print("\n" + "="*80)
        print("📋 ARTICLES FETCHED (Test Mode - No LLM Processing)")
        print("="*80)
        print(f"\nTotal Articles: {len(articles)}")
        print(f"\nSources Breakdown:")
        sources = {}
        for article in articles:
            source = article['source']['name']
            sources[source] = sources.get(source, 0) + 1
        for source, count in sorted(sources.items(), key=lambda x: x[1], reverse=True):
            print(f"  - {source}: {count}")
        
        print(f"\n\nArticle List:")
        for i, article in enumerate(articles, 1):
            print(f"\n{i}. {article['title']}")
            print(f"   Source: {article['source']['name']}")
            print(f"   URL: {article['url']}")
            desc = article.get('description') or 'N/A'
            print(f"   Description: {desc[:150]}{'...' if len(desc) > 150 else ''}")
        
        print("\n" + "="*80)
        print("✅ Test complete! Review articles above.")
        print("Run without --test flag to process with LLM and update website.")
        print("="*80)
        return

    # CANDIDATES MODE: Write list for manual selection, then exit
    if candidates_mode:
        print("\n💾 Writing candidates page...")
        write_candidates_page(articles, config)
        print("\n🎉 Done!")
        return

    
    # Default behavior: automatic selection + summarization + update
    # Save candidates for reference/debugging
    print("\n💾 Writing candidates to JSON...")
    write_candidates_page(articles, config)
    
    print(f"\n🔍 Selecting top stories with {config['model']}...")
    top_stories, oddball_story = select_top_stories_batched(articles, config)
    print(f"✅ Selected {len(top_stories)} top stories")
    if oddball_story:
        print(f"🎯 Found oddball story: {oddball_story['article']['title'][:50]}...")
    
    # Extract articles from selected stories
    selected_articles = [item['article'] for item in top_stories]
    if oddball_story:
        selected_articles.append(oddball_story['article'])
    
    # Summarize selected articles
    print(f"\n🧠 Summarizing {len(selected_articles)} selected articles with {config['model']}...")
    summary = summarize_with_replicate(selected_articles, config, use_selection_prompt=False)
    
    # Update website with summaries
    print("\n💾 Updating website...")
    update_website(summary, selected_articles, config)
    
    # Verify the output file was created/updated
    output_file = config['output_file']
    if os.path.exists(output_file):
        file_size = os.path.getsize(output_file)
        print(f"✅ Output file exists: {output_file} ({file_size} bytes)")
        with open(output_file, 'r') as f:
            content = f.read()
            print(f"   Preview (first 200 chars): {content[:200]}...")
    else:
        print(f"⚠️  WARNING: Output file not found: {output_file}")
    
    print("\n🎉 Done!")

if __name__ == '__main__':
    import sys
    try:
        main()
    except KeyboardInterrupt:
        print("\n⚠️  Interrupted by user")
        sys.exit(1)
    except Exception as e:
        print(f"\n❌ Fatal error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

