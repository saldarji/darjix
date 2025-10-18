# EdTech News Agent Configuration

## Replicate Model Settings
- **Model**: deepseek-ai/deepseek-r1
- **Max Tokens**: 2048
- **Temperature**: 0.7
- **Top P**: 0.9

## News API Settings
- **Days Back**: 7
- **Max Articles Per Query**: 15
- **Total Max Articles**: 30
- **Language**: en
- **Sort By**: popularity

## Query Strategy 1: Policy & Institutional News
- **Domains**: edweek.org,chronicle.com,insidehighered.com,edsurge.com,nytimes.com,washingtonpost.com,npr.org,apnews.com
- **Keywords**: "higher education" OR "education policy" OR "education funding" OR "edtech" OR "education reform" OR "college" OR "university" OR "student loans" OR "academic"
- **Keywords in Title**: true
- **Focus**: Major policy changes, funding announcements, institutional changes, significant edtech developments

## Query Strategy 2: Commercial & M&A News
- **Domains**: edweek.org,chronicle.com,insidehighered.com,edsurge.com,nytimes.com,washingtonpost.com,bloomberg.com,reuters.com,wsj.com
- **Keywords**: "education company" OR "edtech" OR "Pearson" OR "Cengage" OR "McGraw Hill" OR "Blackboard" OR "2U" OR "Chegg" OR "Coursera" OR "education acquisition" OR "education merger" OR "education bankruptcy" OR "education IPO" OR "education investment"
- **Keywords in Title**: true
- **Focus**: M&A activity, bankruptcies, private equity deals, commercial partnerships, company financials

## Prompt Template
Select the top 10 most significant national EDUCATION stories from the following articles. 

CRITICAL: Only select articles that are PRIMARILY about education. Reject articles that:
- Mention education only tangentially or in passing
- Are about other topics (government shutdowns, natural disasters, general politics) that happen to mention education
- Are international news (unless major global education policy)
- Are local news about specific schools or districts
- Are personal essays or opinion pieces
- Are minor product updates or company announcements

Include ONLY articles about:
- Major policy changes, funding announcements, and institutional changes in education
- Significant edtech developments and innovations
- M&A activity, bankruptcies, and private equity deals in education companies
- Commercial partnerships and company financials in the education sector
- Major research findings about education
- Significant changes to higher education institutions

For each article, provide a brief summary (1-2 sentences) of what the article is about. Focus on the key facts, developments, or news. Write as a natural news summary.

Output ONLY a numbered list with your summaries. Do NOT include URLs or references. Example format:
1. Article about education policy changes in New York City
2. Study reveals how family size affects education spending
3. Pearson announces acquisition of digital learning platform

## Output Settings
- **Output File**: _includes/edtech-news.md
- **Section Title**: EdTech News This Week
- **Update Frequency**: Weekly (Mondays)

## API Token
Store your Replicate API token in environment variable: `REPLICATE_API_TOKEN`
Get your token at: https://replicate.com/account/api-tokens

