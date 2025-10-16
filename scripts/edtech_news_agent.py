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

def parse_config(config_path='scripts/edtech-news-config.md'):
    """Parse configuration from markdown file"""
    with open(config_path, 'r') as f:
        content = f.read()
    
    config = {
        'model': 'meta/meta-llama-3.1-70b-instruct',
        'max_tokens': 1024,
        'temperature': 0.7,
        'top_p': 0.9,
        'keywords': 'edtech, educational technology, online learning',
        'days_back': 7,
        'max_articles': 10,
        'language': 'en',
        'sort_by': 'relevancy',
        'output_file': '_includes/featured-content.md',
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
    if match := re.search(r'\*\*Keywords\*\*:\s*(.+)', content):
        config['keywords'] = match.group(1).strip()
    if match := re.search(r'\*\*Keywords in Title\*\*:\s*(true|false)', content, re.IGNORECASE):
        config['keywords_in_title'] = match.group(1).lower() == 'true'
    if match := re.search(r'\*\*Days Back\*\*:\s*(\d+)', content):
        config['days_back'] = int(match.group(1))
    if match := re.search(r'\*\*Max Articles\*\*:\s*(\d+)', content):
        config['max_articles'] = int(match.group(1))
    if match := re.search(r'\*\*Domains\*\*:\s*(.+)', content):
        config['domains'] = match.group(1).strip()
    
    # Parse prompt template
    if match := re.search(r'## Prompt Template\n(.+?)(?=\n## )', content, re.DOTALL):
        config['prompt_template'] = match.group(1).strip()
    
    # Parse output settings
    if match := re.search(r'\*\*Output File\*\*:\s*(.+)', content):
        config['output_file'] = match.group(1).strip()
    
    return config

def fetch_news(config):
    """Fetch news articles using NewsAPI"""
    api_key = os.environ.get('NEWS_API_KEY')
    if not api_key:
        raise ValueError("NEWS_API_KEY environment variable not set")
    
    newsapi = NewsApiClient(api_key=api_key)
    
    from_date = datetime.now() - timedelta(days=config['days_back'])
    
    # Build parameters based on config
    params = {
        'from_param': from_date.strftime('%Y-%m-%d'),
        'language': config['language'],
        'sort_by': config['sort_by'],
        'page_size': config['max_articles']
    }
    
    # Use qInTitle if specified, otherwise use q
    if config.get('keywords_in_title', False):
        params['qintitle'] = config['keywords']
    else:
        params['q'] = config['keywords']
    
    # Add domains filter if specified
    if config.get('domains'):
        params['domains'] = config['domains']
    
    articles = newsapi.get_everything(**params)
    
    return articles['articles']

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
    
    # Run the model - using the streaming format
    try:
        output = replicate.run(
            config['model'],
            input={
                "prompt": prompt,
                "max_new_tokens": config['max_tokens'],
                "temperature": config['temperature'],
                "top_p": config['top_p'],
            }
        )
        
        # Replicate returns a generator, join the output
        result = "".join(str(item) for item in output)
        
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
    
    # Create a mapping of article numbers to URLs
    for i, article in enumerate(articles):
        url = article['url']
        
        # Find lines with this article number and add link
        lines = summary.split('\n')
        updated_lines = []
        
        for line in lines:
            # Look for various patterns: 
            # Pattern 1: * [N] Title
            # Pattern 2: N. Title [N]
            # Pattern 3: [N] Title
            
            if f"[{i+1}]" in line and '](http' not in line:  # Has reference but not linked yet
                # Pattern: N. Title [N]
                match = re.search(rf'^(\d+\.)\s*(.+?)\s*\[{i+1}\]', line)
                if match:
                    num = match.group(1)
                    title_text = match.group(2).strip()
                    line = f"{num} [{title_text}]({url}) [{i+1}]"
                else:
                    # Pattern: * [N] Title
                    match = re.search(rf'\*\s*\[{i+1}\]\s*(.+)$', line)
                    if match:
                        title_text = match.group(1).strip()
                        line = f"* [{i+1}] [{title_text}]({url})"
            
            updated_lines.append(line)
        
        summary = '\n'.join(updated_lines)
    
    return summary

def format_news_output(summary, articles):
    """Parse LLM output and format it exactly as requested"""
    import re
    
    # Clean up the summary - remove any intro text
    lines = summary.split('\n')
    formatted_items = []
    
    for line in lines:
        line = line.strip()
        if not line:
            continue
            
        # Look for numbered items: "1. AI Analysis" or "1 AI Analysis"
        match = re.match(r'^(\d+)\.?\s+(.+)$', line)
        if match:
            item_num = match.group(1)
            ai_analysis = match.group(2).strip()
            
            # Find the corresponding article
            article_index = int(item_num) - 1
            if 0 <= article_index < len(articles):
                article = articles[article_index]
                title = article['title']
                url = article['url']
                
                # Format as: #. [title with link] - AI analysis
                formatted_item = f"{item_num}. [{title}]({url}) - {ai_analysis}"
                formatted_items.append(formatted_item)
    
    return '\n'.join(formatted_items)

def update_website(summary, articles, config):
    """Update the featured content file with properly formatted content"""
    formatted_summary = format_news_output(summary, articles)
    
    content = f"""# EdTech News This Week
*Updated: {datetime.now().strftime('%B %d, %Y')}*

{formatted_summary}

---
*This summary is automatically generated from recent edtech news sources.*
"""
    
    with open(config['output_file'], 'w') as f:
        f.write(content)
    
    print(f"✅ Updated {config['output_file']}")

def main():
    print("🤖 EdTech News Agent Starting...")
    
    # Parse configuration
    config = parse_config()
    print(f"📋 Config loaded: Using {config['model']}")
    
    # Fetch news
    print(f"📰 Fetching news articles...")
    articles = fetch_news(config)
    print(f"✅ Found {len(articles)} articles")
    
    if not articles:
        print("⚠️  No articles found. Exiting.")
        return
    
    # Summarize with Replicate
    print(f"🧠 Summarizing with {config['model']}...")
    summary = summarize_with_replicate(articles, config)
    print("✅ Summary generated")
    
    # Update website
    print("💾 Updating website...")
    update_website(summary, articles, config)
    
    print("🎉 Done!")

if __name__ == '__main__':
    main()

