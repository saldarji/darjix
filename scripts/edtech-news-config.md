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
You are an expert in educational technology. Analyze each of the following news articles and explain why it matters to the edtech community. For each article, provide:

1. A brief analysis (2-3 sentences) explaining the significance and implications for education technology
2. Focus on trends, innovations, policy changes, or important developments
3. Do NOT include opinion pieces or subjective commentary

Output ONLY a numbered list with your analysis. No headers, no other text. Example format:
1. This development is significant because...
2. This innovation matters for edtech because...

## Output Settings
- **Output File**: _includes/edtech-news.md
- **Section Title**: EdTech News This Week
- **Update Frequency**: Weekly (Mondays)

## API Token
Store your Replicate API token in environment variable: `REPLICATE_API_TOKEN`
Get your token at: https://replicate.com/account/api-tokens

