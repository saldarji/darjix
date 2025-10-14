# EdTech News Agent - Quick Start

## ✅ What's Working

Your agent successfully:
- Fetches education technology news from NewsAPI
- Summarizes articles using Llama 2 70B on Replicate
- Updates your website's featured content automatically
- Costs less than $0.50/year to run!

## 🚀 Run It Manually

```bash
cd /Users/saldarji/Development/darjix
source venv/bin/activate
export NEWS_API_KEY="your-newsapi-key-here"
export REPLICATE_API_TOKEN="your-replicate-token-here"
python scripts/edtech_news_agent.py
```

Or use the shortcut script:
```bash
./scripts/test_agent.sh
```

## ⚙️ Customize It

Edit `scripts/edtech-news-config.md` to change:
- **Keywords** - What news to search for
- **Model** - Which AI model to use (currently: meta/llama-2-70b-chat)
- **Frequency** - How many days back to search
- **Prompt** - How to format the summaries

## 🤖 Automate It (Optional)

To run automatically every week:

1. **Add secrets to GitHub**:
   - Go to your repo → Settings → Secrets and variables → Actions
   - Add `NEWS_API_KEY` = your-newsapi-key
   - Add `REPLICATE_API_TOKEN` = your-replicate-token

2. **Push your changes**:
   ```bash
   git add .
   git commit -m "Add EdTech news agent"
   git push
   ```

3. **It will run every Monday at 9am UTC automatically!**

   Or trigger manually: Actions tab → "Update EdTech News" → "Run workflow"

## 📁 Files Created

- `scripts/edtech_news_agent.py` - Main agent script
- `scripts/edtech-news-config.md` - Configuration (edit this!)
- `scripts/requirements.txt` - Python dependencies
- `scripts/test_agent.sh` - Quick test script
- `.github/workflows/update-edtech-news.yml` - Automation
- `_includes/featured-content.md` - Generated content (on your site!)

## 🎨 Customize the Output

Want different formatting? Edit the "Prompt Template" section in `edtech-news-config.md`

Want more/fewer articles? Change "Max Articles" in the config

Want different news sources? Change "Keywords" in the config

## 💡 Tips

- Run it weekly to keep content fresh
- Review the summaries before publishing (run locally first)
- Adjust keywords if articles aren't relevant enough
- Try different models in the config for different styles

## 🆘 Troubleshooting

**No articles found:** Try broader keywords like "education technology" or "AI education"

**Replicate errors:** Make sure your API token is valid at https://replicate.com/account

**GitHub Actions fails:** Check that secrets are added correctly in repo settings

## Next Steps

1. Check how it looks on your website
2. Adjust the config to your liking
3. Set up GitHub Actions for automation
4. Enjoy automated content! 🎉

