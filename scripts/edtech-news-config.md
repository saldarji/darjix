# EdTech News Agent Configuration

## Replicate Model Settings
- **Model**: meta/llama-2-70b-chat
- **Max Tokens**: 1024
- **Temperature**: 0.7
- **Top P**: 0.9

## News API Settings
- **Keywords**: education technology
- **Days Back**: 7
- **Max Articles**: 10
- **Language**: en
- **Sort By**: relevancy

## Prompt Template
You are an expert in educational technology. Summarize the following recent news articles about edtech in a concise, engaging bulleted list format. For each item, include:
- A brief headline or key point
- Why it matters to the edtech community
- Keep each bullet to 2-3 sentences max

Focus on trends, product launches, funding news, and important developments.

## Output Settings
- **Output File**: _includes/edtech-news.md
- **Section Title**: EdTech News This Week
- **Update Frequency**: Weekly (Mondays)

## API Token
Store your Replicate API token in environment variable: `REPLICATE_API_TOKEN`
Get your token at: https://replicate.com/account/api-tokens

