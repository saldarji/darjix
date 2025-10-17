---
layout: post
title: "Edtech News Experiment"
date: 2025-10-16
author: "Sal Darji"
---

I built an AI-powered news aggregator using Cursor. It automatically finds and summarizes the latest education technology news every week.

## How does it work?

The system runs on a schedule. Every Monday, it:

1. Fetches recent edtech articles from NewsAPI
2. Sends them to an AI model (Deepseek R1) for summarization
3. Formats the summaries into a clean, readable list
4. Updates the website automatically

## The technology

**NewsAPI** - Finds relevant articles about education and edtech
**Deepseek R1** - An AI model that reads and summarizes the articles in natural language
**GitHub Actions** - Runs the script automatically every week without manual intervention
**Python** - The glue that connects everything together

## Expected costs

The system is designed to be cost-effective. NewsAPI offers a free tier that covers basic usage. Deepseek R1 is significantly cheaper than other AI models like Llama 2 70B. Running weekly, the total monthly cost should be under $5. This makes it an affordable way to automate content curation without breaking the bank.

## Why it matters

This experiment shows how AI can automate content curation. Instead of manually reading dozens of articles, the AI does the heavy lifting. It finds what's important and presents it in a digestible format.

The system is fully automated. Once set up, it runs itself. This frees up time to focus on other work while staying informed about the latest trends in education technology.
