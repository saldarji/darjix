#!/bin/bash
# Quick test script for EdTech News Agent

cd "$(dirname "$0")/.."

echo "🤖 EdTech News Agent - Local Test"
echo "=================================="
echo ""

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "❌ Virtual environment not found. Please run:"
    echo "   python3 -m venv venv"
    exit 1
fi

# Activate virtual environment
source venv/bin/activate

# Check for API keys
if [ -z "$REPLICATE_API_TOKEN" ]; then
    echo ""
    echo "📝 Enter your Replicate API token:"
    echo "   (Get it from: https://replicate.com/account/api-tokens)"
    read -r REPLICATE_API_TOKEN
    export REPLICATE_API_TOKEN
fi

if [ -z "$NEWS_API_KEY" ]; then
    echo ""
    echo "📝 Enter your NewsAPI key:"
    echo "   (Get it from: https://newsapi.org/register)"
    read -r NEWS_API_KEY
    export NEWS_API_KEY
fi

echo ""
echo "✅ API keys configured"
echo "🚀 Running agent..."
echo ""

python scripts/edtech_news_agent.py

echo ""
echo "✅ Test complete!"
echo ""
echo "💡 To save your API keys permanently, add to ~/.zshrc:"
echo "   export REPLICATE_API_TOKEN=\"your-token\""
echo "   export NEWS_API_KEY=\"your-key\""

