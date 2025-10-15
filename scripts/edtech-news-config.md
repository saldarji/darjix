# EdTech News Agent Configuration

## Replicate Model Settings
- **Model**: meta/llama-2-70b-chat
- **Max Tokens**: 1024
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
You are an expert in educational technology. Summarize the following recent news articles about edtech in a concise, engaging ordered list format. For each item, include:
- The headline for the article
- Description / summary of the article focusing on why it matters
- Keep each list item to 2-3 sentences max

Focus on important developments in the field of education. Do NOT include it in the list if it is an opinion piece. No opinions. 

Do not include any other formatting or text in the list.

## Output Settings
- **Output File**: _includes/edtech-news.md
- **Section Title**: EdTech News This Week
- **Update Frequency**: Weekly (Mondays)

## API Token
Store your Replicate API token in environment variable: `REPLICATE_API_TOKEN`
Get your token at: https://replicate.com/account/api-tokens

