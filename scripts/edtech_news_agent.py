#!/usr/bin/env python3
"""
EdTech News Agent - Fetches and summarizes edtech news using Replicate
Configuration is centralized in edtech-news-config.md
"""

import os
import re
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

def summarize_with_replicate(articles, config):
    """Summarize articles using Replicate"""
    # Format articles for the prompt with numbered references
    articles_text = "\n\n".join([
        f"[{i+1}] Title: {article['title']}\n"
        f"Source: {article['source']['name']}\n"
        f"Description: {article.get('description', 'N/A')}\n"
        f"URL: {article['url']}"
        for i, article in enumerate(articles)
    ])
    
    prompt = f"{config['prompt_template']}\n\n" \
             f"IMPORTANT: Include the source article number [1], [2], etc. at the start of each bullet point.\n\n" \
             f"Articles:\n{articles_text}"
    
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
        print(f"⚠️  Replicate error: {e}")
        print("Trying with alternative parameters...")
        
        # Fallback with simpler parameters
        output = replicate.run(
            config['model'],
            input={"prompt": prompt}
        )
        result = "".join(str(item) for item in output)
        result = add_article_links(result, articles)
        return result

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
                
                # Remove the article number from the summary
                ai_analysis = re.sub(r'\[(\d+)\]', '', ai_analysis).strip()
                ai_analysis = re.sub(r'https?://[^\s]+', '', ai_analysis).strip()
                
                # Only add if there's actual summary text
                if ai_analysis:
                    # Format as: #. [title with link] - AI analysis [Source]
                    formatted_item = f"{item_num}. [{title}]({url}) - {ai_analysis} [{source}]"
                    formatted_items.append(formatted_item)
    
    return '\n'.join(formatted_items)

def update_website(summary, articles, config):
    """Update the featured content file with properly formatted content"""
    formatted_summary = format_news_output(summary, articles)
    
    content = f"""# EdTech News This Week
*Updated: {datetime.now().strftime('%B %d, %Y')}*

{formatted_summary}
"""
    
    with open(config['output_file'], 'w') as f:
        f.write(content)
    
    print(f"✅ Updated {config['output_file']}")

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
        
        # Format articles for LLM
        articles_text = ""
        for j, article in enumerate(batch, 1):
            articles_text += f"[{j}] {article['title']}\n"
            articles_text += f"    Source: {article['source']['name']}\n"
            articles_text += f"    Description: {article.get('description', 'N/A')}\n\n"
        
        selection_prompt = f"""Select the top 5-8 most relevant and interesting US education stories from the following articles.

CRITICAL REQUIREMENTS:
1. US-ONLY: Reject ALL international news (UK universities, Irish edtech, etc.)
2. EDUCATION + TECHNOLOGY FOCUS: Prioritize articles about:
   - AI/ML applications in education (ChatGPT, AI tutoring, adaptive learning)
   - EdTech innovation (digital learning platforms, educational software, VR/AR in education)
   - Technology's impact on teaching/learning outcomes
   - Education technology policy and funding
   - EdTech market developments (M&A, funding, startups)

3. DIVERSITY: Avoid selecting multiple articles on the same topic/event. If there are multiple articles about the same story (e.g., ChatGPT Atlas), select only the BEST one.

REJECT articles that:
- Are about non-US education
- Are course listings or product reviews
- Are purely promotional content
- Are routine obituaries or personnel changes
- Lack clear education + technology focus
- Are duplicates of already selected topics

OUTPUT FORMAT:
For each selected article, provide:
[Article Number] [Title] - [1-2 sentence explanation of why it's relevant to US education + technology]

Also identify any "oddball" stories (unusual AI applications, controversial tech implementations, unexpected education-tech partnerships) by adding "ODDBALL:" before the explanation.

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
        match = re.match(r'^\[(\d+)\]\s+(.+?)(?:\s*-\s*(.+))?$', line)
        if not match:
            match = re.match(r'^(\d+)\.?\s+(.+?)(?:\s*-\s*(.+))?$', line)
        
        if not match:
            continue
            
        article_num = int(match.group(1))
        title = match.group(2).strip()
        reason = match.group(3).strip() if match.group(3) else "Selected for relevance"
        
        # Check if it's an oddball
        is_oddball = 'ODDBALL:' in reason
        if is_oddball:
            reason = reason.replace('ODDBALL:', '').strip()
        
        # Find the corresponding article
        if 1 <= article_num <= len(articles):
            article = articles[article_num - 1]
            
            # Verify title matches (fuzzy match)
            if title.lower() in article['title'].lower() or article['title'].lower() in title.lower():
                item = {'article': article, 'reason': reason}
                
                if is_oddball:
                    oddballs.append(item)
                else:
                    selected.append(item)
    
    return selected, oddballs


def update_website_with_scoring(top_stories, oddball_story, config):
    """Update with top stories and oddball highlight"""
    
    content = f"""# EdTech News This Week
*Updated: {datetime.now().strftime('%B %d, %Y')}*

"""
    
    # Add top stories
    for i, item in enumerate(top_stories, 1):
        article = item['article']
        reason = item['reason']
        content += f"{i}. [{article['title']}]({article['url']}) - {reason} [{article['source']['name']}]\n"
    
    # Add oddball section if present
    if oddball_story:
        article = oddball_story['article']
        reason = oddball_story['reason']
        content += f"\n## Also Worth Noting\n\n"
        content += f"[{article['title']}]({article['url']}) - {reason} [{article['source']['name']}]\n"
    
    with open(config['output_file'], 'w') as f:
        f.write(content)
    
    print(f"✅ Updated {config['output_file']}")

def main():
    import sys
    
    # Check for test mode
    test_mode = '--test' in sys.argv or '-t' in sys.argv
    
    print("🤖 EdTech News Agent Starting...")
    if test_mode:
        print("🧪 TEST MODE: Will fetch articles but NOT send to LLM")
    
    # Parse configuration
    config = parse_config()
    print(f"📋 Config loaded: Using {config['model']}")
    print(f"📊 Query Strategies: {len(config['query_strategies'])}")
    
    # Fetch news
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
    
    # Select top stories using batched approach
    print(f"\n🔍 Selecting top stories with {config['model']}...")
    top_stories, oddball_story = select_top_stories_batched(articles, config)
    print(f"✅ Selected {len(top_stories)} top stories")
    if oddball_story:
        print(f"🎯 Found oddball story: {oddball_story['article']['title'][:50]}...")
    
    # Update website
    print("\n💾 Updating website...")
    update_website_with_scoring(top_stories, oddball_story, config)
    
    print("\n🎉 Done!")

if __name__ == '__main__':
    main()

