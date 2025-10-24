# EdTech News Agent Configuration

## Replicate Model Settings
- **Model**: deepseek-ai/deepseek-r1
- **Max Tokens**: 2048
- **Temperature**: 0.7
- **Top P**: 0.9

## News API Settings
- **Days Back**: 7
- **Max Articles Per Query**: 8
- **Total Max Articles**: 40
- **Language**: en
- **Sort By**: popularity

## Blacklisted Sources
- **Sources to Exclude**: fox news, foxnews.com, breitbart.com, infowars.com, theblaze.com, newsmax.com

## Query Strategy 1: AI in Education
- **Keywords**: "AI education" OR "artificial intelligence" OR "machine learning" OR "ChatGPT" OR "AI tutoring" OR "intelligent tutoring" OR "adaptive learning" OR "AI assessment" OR "AI classroom" OR "AI teaching"
- **Keywords in Title**: true
- **Focus**: AI applications, tools, and implementations in education

## Query Strategy 2: EdTech Innovation
- **Keywords**: "edtech" OR "education technology" OR "digital learning" OR "online learning platform" OR "learning management system" OR "educational software" OR "virtual reality education" OR "augmented reality learning" OR "learning app" OR "education software"
- **Keywords in Title**: true
- **Focus**: Technology tools and platforms for education

## Query Strategy 3: Digital Learning & Outcomes
- **Keywords**: "online education" OR "remote learning" OR "hybrid learning" OR "learning analytics" OR "educational data" OR "student engagement technology" OR "personalized learning" OR "digital classroom" OR "e-learning"
- **Keywords in Title**: true
- **Focus**: Digital learning methods and their effectiveness

## Query Strategy 4: Education Technology Policy
- **Keywords**: "education technology policy" OR "digital education funding" OR "AI education regulation" OR "edtech standards" OR "technology in schools" OR "digital divide education" OR "education data privacy" OR "AI ethics education"
- **Keywords in Title**: true
- **Focus**: Policy affecting technology adoption in education

## Query Strategy 5: EdTech Market & Innovation
- **Keywords**: "edtech startup" OR "education technology investment" OR "learning technology company" OR "educational AI" OR "edtech acquisition" OR "education software" OR "Khan Academy" OR "Coursera" OR "Udemy" OR "edX" OR "education technology funding"
- **Keywords in Title**: true
- **Focus**: Commercial developments in education technology

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

