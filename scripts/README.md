# EdTech News Agent

Automatically fetches and summarizes edtech news using Replicate AI.

## Setup

### 1. Install Dependencies
```bash
pip install -r scripts/requirements.txt
```

### 2. Get API Keys

**Replicate API Token:**
1. Go to https://replicate.com/account/api-tokens
2. Create a new token
3. Set environment variable: `export REPLICATE_API_TOKEN="your-token"`

**NewsAPI Key:**
1. Go to https://newsapi.org/register
2. Get your free API key (free tier: 100 requests/day)
3. Set environment variable: `export NEWS_API_KEY="your-key"`

### 3. Configure

Edit `scripts/edtech-news-config.md` to customize:
- Model selection (Llama, Mistral, etc.)
- Keywords to search for
- Output format and location
- Prompt template

### 4. Run Locally

```bash
cd /Users/saldarji/Development/darjix
export REPLICATE_API_TOKEN="your-token"
export NEWS_API_KEY="your-key"
python scripts/edtech_news_agent.py
```

### 5. Automate with GitHub Actions

Add secrets to your GitHub repository:
1. Go to Settings → Secrets and variables → Actions
2. Add `REPLICATE_API_TOKEN`
3. Add `NEWS_API_KEY`

The workflow runs every Monday at 9am UTC, or trigger manually:
- Go to Actions tab → "Update EdTech News" → "Run workflow"

## Cost Estimate

**NewsAPI:** Free (100 requests/day)
**Replicate (Llama 3.1 70B):**
- ~$0.005-0.01 per run
- ~$0.02-0.04 per month (weekly runs)

**Total: Less than $1/year** 🎉

## Configuration

All settings are in `edtech-news-config.md`:
- Model parameters (temperature, tokens, etc.)
- News search keywords
- Output file location
- Prompt template

Change the config file and the script will automatically use the new settings!

## Troubleshooting

**"No articles found":**
- Check your NewsAPI key is valid
- Try broader keywords in config

**Replicate errors:**
- Verify your API token is set correctly
- Check you have credits at https://replicate.com/account

**GitHub Actions failing:**
- Make sure secrets are added in GitHub settings
- Check the Actions tab for error logs

