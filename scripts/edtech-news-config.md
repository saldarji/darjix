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
You are an expert in educational technology. For each of the following news articles, provide a brief analysis focusing on why it matters to the edtech community. Keep each analysis to 2-3 sentences max.

Focus on important developments in the field of education. Do NOT include it in the list if it is an opinion piece. No opinions.

Output format: Just a numbered list (1., 2., 3., etc.) with your analysis of each article. No other text, headers, or formatting.

## Output Settings
- **Output File**: _includes/edtech-news.md
- **Section Title**: EdTech News This Week
- **Update Frequency**: Weekly (Mondays)

## API Token
Store your Replicate API token in environment variable: `REPLICATE_API_TOKEN`
Get your token at: https://replicate.com/account/api-tokens

