# EdTech News Agent Configuration

## Replicate Model Settings
- **Model**: deepseek-ai/deepseek-r1
- **Max Tokens**: 2048
- **Temperature**: 0.7
- **Top P**: 0.9

## News API Settings
- **Keywords**: education OR "AI education" OR edtech
- **Keywords in Title**: true
- **Days Back**: 7
- **Max Articles**: 10
- **Language**: en
- **Sort By**: popularity

## Prompt Template
Summarize each of the following news articles in a natural, concise way. For each article, provide a brief summary (1-2 sentences) of what the article is about. Focus on the key facts, developments, or news. Write as a natural news summary.

Output ONLY a numbered list with your summaries. Do NOT include URLs or references. Example format:
1. Article about education policy changes in New York City
2. Study reveals how family size affects education spending

## Output Settings
- **Output File**: _includes/edtech-news.md
- **Section Title**: EdTech News This Week
- **Update Frequency**: Weekly (Mondays)

## API Token
Store your Replicate API token in environment variable: `REPLICATE_API_TOKEN`
Get your token at: https://replicate.com/account/api-tokens

