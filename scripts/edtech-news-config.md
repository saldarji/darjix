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
- **Keywords**: "higher education" OR "education policy" OR "education funding" OR "edtech" OR "education reform" OR "college" OR "university" OR "student loans" OR "academic" OR "campus" OR "tuition" OR "enrollment" OR "student debt"
- **Keywords in Title**: true
- **Focus**: Major policy changes, funding announcements, institutional changes, significant edtech developments

## Query Strategy 2: Commercial & M&A News
- **Keywords**: "education company" OR "edtech" OR "Cengage" OR "McGraw Hill" OR "Blackboard" OR "2U" OR "Chegg" OR "Coursera" OR "Khan Academy" OR "Udemy" OR "edX" OR "education acquisition" OR "education merger" OR "education bankruptcy" OR "education IPO" OR "education investment" OR "education startup"
- **Keywords in Title**: true
- **Focus**: M&A activity, bankruptcies, private equity deals, commercial partnerships, company financials

## Prompt Template
Select the top 10 most RELEVANT and INTERESTING US EDUCATION stories from the following articles.

CRITICAL REQUIREMENTS:
1. US-ONLY: Reject ALL international news (UK universities, Irish edtech, etc.)
2. EDUCATION-FOCUSED: Only articles PRIMARILY about education
3. RELEVANT: Stories that matter to US education stakeholders (students, educators, policymakers, investors)
4. INTERESTING: Choose compelling stories, not routine announcements

REJECT articles that:
- Are about non-US education (UK, Ireland, Canada, etc.)
- Mention education only tangentially or in passing
- Are about other topics (government shutdowns, natural disasters, general politics) that happen to mention education
- Are local news about specific schools or districts (unless nationally significant)
- Are personal essays or opinion pieces
- Are minor product updates or company announcements
- Are routine obituaries or personnel changes
- Are purely promotional content

PRIORITIZE articles about:
- Major US policy changes, funding announcements, and institutional changes
- Significant edtech developments and innovations in the US
- M&A activity, bankruptcies, and private equity deals in US education companies
- Commercial partnerships and company financials in the US education sector
- Major research findings about US education
- Significant changes to US higher education institutions
- Student loan policy changes
- College affordability and access issues
- Edtech companies making news in the US market

For each article, provide a brief, engaging summary (1-2 sentences) that captures what makes it relevant and interesting. Focus on the key facts, developments, or news. Write as a natural news summary.

Output ONLY a numbered list with your summaries. Do NOT include URLs or references. Example format:
1. Article about education policy changes in New York City
2. Study reveals how family size affects education spending
3. Major edtech company announces acquisition of digital learning platform

## Output Settings
- **Output File**: _includes/edtech-news.md
- **Section Title**: EdTech News This Week
- **Update Frequency**: Weekly (Mondays)

## API Token
Store your Replicate API token in environment variable: `REPLICATE_API_TOKEN`
Get your token at: https://replicate.com/account/api-tokens

