#!/usr/bin/env python3
"""
EdTech Podcast Agent - Fetches and selects relevant podcast episodes using Replicate
"""

import os
import re
import json
import replicate
import time
import urllib.parse
import urllib.request
from datetime import datetime, timedelta

# Load environment variables from .env file if it exists
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass  # dotenv not installed, use environment variables directly

def fetch_itunes_episodes(keyword, limit=25):
    """Fetch podcast episodes from iTunes Search API"""
    search_term = urllib.parse.quote(keyword)
    api_url = f"https://itunes.apple.com/search?term={search_term}&media=podcast&entity=podcastEpisode&limit={limit}&country=us"
    
    try:
        with urllib.request.urlopen(api_url) as response:
            data = json.loads(response.read().decode())
            return data.get('results', [])
    except Exception as e:
        print(f"  ⚠️  Error fetching episodes for '{keyword}': {e}")
        return []

def fetch_all_episodes(keywords, searches_per_keyword=5):
    """Fetch episodes using multiple searches per keyword"""
    all_episodes = []
    seen_episodes = set()
    
    # Filter to episodes from last 30 days
    one_month_ago = datetime.now() - timedelta(days=30)
    
    for keyword in keywords:
        print(f"🔍 Searching for '{keyword}' ({searches_per_keyword} searches)...")
        
        for search_num in range(searches_per_keyword):
            episodes = fetch_itunes_episodes(keyword, limit=25)
            
            for episode in episodes:
                # Deduplicate by trackId
                episode_id = episode.get('trackId')
                if not episode_id or episode_id in seen_episodes:
                    continue
                
                # Filter by date (last 30 days)
                release_date_str = episode.get('releaseDate')
                if release_date_str:
                    try:
                        # Parse ISO format date
                        release_date = datetime.fromisoformat(release_date_str.replace('Z', '+00:00'))
                        if release_date >= one_month_ago:
                            seen_episodes.add(episode_id)
                            all_episodes.append(episode)
                    except Exception:
                        pass
            
            # Rate limiting: 20 requests/minute = 3 seconds between requests
            # Add small buffer to be safe
            if search_num < searches_per_keyword - 1:
                time.sleep(3.5)
        
        print(f"  ✅ Found {len([e for e in all_episodes if keyword.lower() in (e.get('trackName', '') + ' ' + e.get('collectionName', '')).lower()])} episodes for '{keyword}'")
    
    print(f"\n✅ Total unique episodes found: {len(all_episodes)}")
    return all_episodes

def select_top_episodes(episodes, config, max_candidates=15, max_selected=10):
    """Use Replicate to select the most relevant episodes"""
    if len(episodes) == 0:
        return []
    
    # Sort by release date (most recent first) and take top candidates
    sorted_episodes = sorted(episodes, key=lambda e: e.get('releaseDate', ''), reverse=True)
    candidates = sorted_episodes[:max_candidates]
    
    print(f"\n🔍 Selecting top {max_selected} episodes from {len(candidates)} candidates using {config['model']}...")
    
    # Format episodes for LLM
    episodes_text = ""
    for i, episode in enumerate(candidates, 1):
        episodes_text += f"[{i}] {episode.get('trackName', 'N/A')}\n"
        episodes_text += f"    Podcast: {episode.get('collectionName', 'Unknown')}\n"
        episodes_text += f"    Artist: {episode.get('artistName', 'Unknown')}\n"
        episodes_text += f"    URL: {episode.get('trackViewUrl', 'N/A')}\n"
        if episode.get('releaseDate'):
            episodes_text += f"    Released: {episode.get('releaseDate')}\n"
        if episode.get('trackTimeMillis'):
            minutes = episode.get('trackTimeMillis', 0) // 60000
            episodes_text += f"    Duration: {minutes} minutes\n"
        description = episode.get('description') or episode.get('shortDescription') or 'No description available'
        # Truncate description if too long
        if len(description) > 500:
            description = description[:500] + "..."
        episodes_text += f"    Description: {description}\n"
        episodes_text += "\n"
    
    selection_prompt = f"""Select the top {max_selected} most relevant and interesting education technology podcast episodes from the following list.

CRITICAL REQUIREMENTS:
1. EDUCATION + TECHNOLOGY FOCUS: Prioritize episodes about:
   - AI/ML applications in education (ChatGPT, AI tutoring, adaptive learning)
   - EdTech innovation (digital learning platforms, educational software, VR/AR in education)
   - Technology's impact on teaching/learning outcomes
   - Education technology policy and funding
   - EdTech market developments (M&A, funding, startups)
   - Higher education technology trends
   - Learning technology innovations

2. RELEVANCE: Choose episodes that are genuinely about education technology, not just tangentially related.

3. DIVERSITY: Avoid selecting multiple episodes from the same podcast or on the same topic. Prioritize variety.

REJECT episodes that:
- Are not primarily about education technology
- Are promotional content or ads
- Are about unrelated topics (general business, non-edtech startups, etc.)
- Are duplicates or very similar to already selected episodes

OUTPUT FORMAT:
For each selected episode, provide:
[Episode Number] [Episode Title]

Episodes:
{episodes_text}

Selected Episodes:"""

    try:
        output = replicate.run(
            config['model'],
            input={"prompt": selection_prompt, "max_tokens": 1024, "temperature": 0.3}
        )
        
        result = "".join(str(item) for item in output)
        selected = parse_selection(result, candidates)
        
        print(f"✅ Selected {len(selected)} episodes")
        return selected
        
    except Exception as e:
        print(f"⚠️  Replicate error: {e}")
        print("Falling back to top episodes by date...")
        # Fallback: return top episodes by date
        return candidates[:max_selected]

def parse_selection(llm_output, episodes):
    """Parse LLM output to extract selected episodes"""
    selected = []
    
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
            
        episode_num = int(match.group(1))
        title = match.group(2).strip()
        
        # Find the corresponding episode
        if 1 <= episode_num <= len(episodes):
            episode = episodes[episode_num - 1]
            
            # Verify title matches (fuzzy match)
            episode_title = episode.get('trackName', '')
            if title.lower() in episode_title.lower() or episode_title.lower() in title.lower():
                selected.append(episode)
    
    return selected

def format_episode_output(episodes):
    """Format selected episodes for markdown output"""
    lines = []
    
    for episode in episodes:
        title = episode.get('trackName', 'Untitled Episode')
        url = episode.get('trackViewUrl', '#')
        podcast = episode.get('collectionName', '')
        artist = episode.get('artistName', '')
        release_date = episode.get('releaseDate', '')
        duration_ms = episode.get('trackTimeMillis', 0)
        description = episode.get('description') or episode.get('shortDescription') or ''
        
        # Format date
        date_str = ''
        formatted_date = ''
        if release_date:
            try:
                dt = datetime.fromisoformat(release_date.replace('Z', '+00:00'))
                date_str = dt.strftime('%Y-%m-%d')
                formatted_date = dt.strftime('%B %d, %Y')
            except Exception:
                pass
        
        # Format duration
        duration_str = ''
        if duration_ms:
            minutes = duration_ms // 60000
            hours = minutes // 60
            mins = minutes % 60
            if hours > 0:
                duration_str = f"{hours}h {mins}m"
            else:
                duration_str = f"{minutes}m"
        
        # Build markdown line with date prefix
        episode_line = f"[{title}]({url})"
        
        # Add metadata
        metadata_parts = []
        if podcast:
            metadata_parts.append(f"from **{podcast}**")
        if artist:
            metadata_parts.append(f"by {artist}")
        if formatted_date:
            metadata_parts.append(formatted_date)
        if duration_str:
            metadata_parts.append(duration_str)
        
        if metadata_parts:
            episode_line += f" - {', '.join(metadata_parts)}"
        
        # Add description if available
        if description:
            # Clean and truncate description
            desc = description.strip()
            # Remove HTML tags if present
            desc = re.sub(r'<[^>]+>', '', desc)
            if len(desc) > 300:
                desc = desc[:300] + "..."
            episode_line += f"\n\n  {desc}"
        
        if date_str:
            lines.append(f"- {date_str}: {episode_line}")
        else:
            lines.append(f"- {episode_line}")
    
    return '\n'.join(lines)

def update_podcasts_file(episodes, output_file='_includes/edtech-podcasts.md'):
    """Update the podcasts include file"""
    today_str = datetime.now().strftime('%B %d, %Y')
    
    header = [
        "# EdTech Podcast Episodes\n",
        f"*Updated: {today_str}*\n",
        "\n"
    ]
    
    body = format_episode_output(episodes)
    body_lines = [line + '\n' for line in body.split('\n') if line.strip()]
    
    with open(output_file, 'w') as f:
        f.writelines(header)
        f.writelines(body_lines)
    
    print(f"✅ Updated podcasts file: {output_file} ({len(episodes)} episodes)")

def main():
    print("🎙️  EdTech Podcast Agent Starting...")
    
    # Configuration
    config = {
        'model': os.environ.get('REPLICATE_MODEL', 'deepseek-ai/deepseek-r1'),
        'keywords': ['edtech', 'education technology', 'higher education', 'learning technology'],
        'searches_per_keyword': 5,
        'max_candidates': 15,
        'max_selected': 10  # Will select 5-10 episodes
    }
    
    # Check for Replicate API token
    if not os.environ.get('REPLICATE_API_TOKEN'):
        print("⚠️  REPLICATE_API_TOKEN not set. Exiting.")
        return
    
    print(f"📋 Using model: {config['model']}")
    print(f"📊 Keywords: {', '.join(config['keywords'])}")
    print(f"🔢 Searches per keyword: {config['searches_per_keyword']}")
    
    # Fetch episodes
    print(f"\n📡 Fetching episodes from iTunes API...")
    all_episodes = fetch_all_episodes(config['keywords'], config['searches_per_keyword'])
    
    if not all_episodes:
        print("⚠️  No episodes found. Exiting.")
        return
    
    # Select top episodes using AI
    selected_episodes = select_top_episodes(
        all_episodes, 
        config, 
        max_candidates=config['max_candidates'],
        max_selected=config['max_selected']
    )
    
    if not selected_episodes:
        print("⚠️  No episodes selected. Exiting.")
        return
    
    # Update website
    print("\n💾 Updating website...")
    update_podcasts_file(selected_episodes)
    
    print("\n🎉 Done!")

if __name__ == '__main__':
    main()

