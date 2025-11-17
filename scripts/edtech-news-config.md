# EdTech News Agent Configuration

## Replicate Model Settings
- **Model**: deepseek-ai/deepseek-r1
- **Max Tokens**: 2048
- **Temperature**: 0.7
- **Top P**: 0.9

## News API Settings
- **Days Back**: 10
- **Max Articles Per Query**: 100
- **Total Max Articles**: 100
- **Language**: en
- **Sort By**: relevancy

## Blacklisted Sources
- **Sources to Exclude**: fox news, foxnews.com, breitbart.com, infowars.com, theblaze.com, newsmax.com

## Query Strategy 1: EdTech News
- **Keywords**: "AI education" OR "AI tutoring" OR "AI assessment" OR "AI classroom" OR "AI teaching" OR "Edtech" OR "Education Technology" OR "Learning Platform" OR "Learning Management System" OR "Educational Software"
- **Keywords in Title**: false
- **Domains**: gizmodo.com,forbes.com,scientificamerican.com,insidehighered.com,elearningindustry.com,edsurge.com,edtechmagazine.com,chronicle.com,edweek.org,eschoolnews.com,techcrunch.com,theverge.com,wired.com,technologyreview.com,cnet.com,fastcompany.com,nytimes.com,washingtonpost.com,theatlantic.com,bloomberg.com,nature.com,science.org,hbr.org
- **Focus**: AI and education technology news from premium sources

## Query Strategy 2: Online Learning
- **Keywords**: "online learning"
- **Keywords in Title**: false
- **Domains**: 
- **Focus**: Articles about online learning from all sources

## Query Strategy 3: EdTech Search
- **Keywords**: edtech
- **Keywords in Title**: false
- **Domains**: 
- **Focus**: Articles about edtech from all sources

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
- Are personal essays, opinion pieces, or first-person narratives ("I went to college...")
- Are minor product updates or company announcements
- Are routine obituaries or personnel changes
- Are purely promotional content
- Are personal finance stories about individual students
- Are course listings or product reviews

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

