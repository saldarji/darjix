const fs = require('fs');
const path = require('path');
const { marked } = require('marked');

const HEADER_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>__TITLE__ - DARJIX</title>
  <link rel="stylesheet" href="/assets/css/style.css">
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-white text-gray-900 min-h-screen flex flex-col">
  <header class="bg-white border-b border-gray-200">
    <nav class="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12">
      <div class="flex justify-between items-center h-16">
        <a href="/" class="text-3xl font-bold text-black tracking-wider">DARJIX</a>
        <div class="flex items-center space-x-6 text-sm font-medium">
          <a href="/about" class="text-gray-600 hover:text-black">About</a>
          <a href="/contact" class="text-gray-600 hover:text-black">Contact</a>
        </div>
      </div>
    </nav>
  </header>
  <main class="flex-grow">`;

const FOOTER_HTML = `</main>
  <footer class="bg-white border-t border-gray-200 mt-12">
    <div class="max-w-6xl mx-auto py-12 px-6 sm:px-8 lg:px-12">
      <div class="text-center mb-8">
        <nav class="flex justify-center space-x-4 mb-4">
          <a href="/about" class="text-base text-gray-600 hover:text-black">About</a>
          <span class="text-base text-gray-600">|</span>
          <a href="/contact" class="text-base text-gray-600 hover:text-black">Contact</a>
        </nav>
        <p class="text-sm text-gray-600 max-w-2xl mx-auto mb-4">Darjix.com - Insights, thoughts, and experiments by Sal Darji.</p>
        <p class="text-xs text-gray-500 text-center">&copy; ${new Date().getFullYear()} DARJIX</p>
      </div>
    </div>
  </footer>
</body>
</html>`;

function renderPage(title, bodyContent) {
  return HEADER_HTML.replace('__TITLE__', title) + bodyContent + FOOTER_HTML;
}

function buildNews() {
  const newsMdPath = path.join(__dirname, '../_includes/edtech-news.md');
  if (!fs.existsSync(newsMdPath)) return;

  const mdContent = fs.readFileSync(newsMdPath, 'utf-8');
  const bodyHtml = marked.parse(mdContent);

  const fullPage = renderPage(
    'EdTech News',
    `<section class="py-16 bg-white">
      <div class="max-w-4xl mx-auto px-6 sm:px-8 lg:px-12">
        <h1 class="text-3xl font-bold text-black mb-8">EdTech News Digest</h1>
        <div class="prose max-w-none">${bodyHtml}</div>
        <div class="mt-8 p-6 bg-gray-50 border border-gray-200 rounded">
          <h3 class="text-sm font-bold text-gray-800 uppercase tracking-wider mb-3">About This Page</h3>
          <p class="text-sm text-gray-600 mb-3">This page is automatically updated with recent news about educational technology, summarized using AI.</p>
          <p class="text-xs text-gray-500">Powered by Google Gemini and Google News / RSS Feeds</p>
        </div>
        <div class="mt-8 text-center"><a href="/" class="text-gray-600 hover:text-black text-sm">← Back to Home</a></div>
      </div>
    </section>`
  );

  fs.mkdirSync(path.join(__dirname, '../public/news'), { recursive: true });
  fs.writeFileSync(path.join(__dirname, '../public/news/index.html'), fullPage);
  console.log('✅ Built static page: /news/index.html');
}

function buildPodcasts() {
  const podcastMdPath = path.join(__dirname, '../_includes/edtech-podcasts.md');
  if (!fs.existsSync(podcastMdPath)) return;

  const mdContent = fs.readFileSync(podcastMdPath, 'utf-8');
  const bodyHtml = marked.parse(mdContent);

  const fullPage = renderPage(
    'EdTech Podcasts',
    `<section class="py-16 bg-white">
      <div class="max-w-4xl mx-auto px-6 sm:px-8 lg:px-12">
        <h1 class="text-3xl md:text-4xl font-bold text-black mb-8">Education Technology Podcast Episodes</h1>
        <div class="prose max-w-none">${bodyHtml}</div>
        <div class="mt-8 p-6 bg-gray-50 border border-gray-200 rounded">
          <h3 class="text-sm font-bold text-gray-800 uppercase tracking-wider mb-3">About This Page</h3>
          <p class="text-sm text-gray-600 mb-3">This page displays recent podcast episodes related to educational technology from Apple Podcasts.</p>
          <p class="text-xs text-gray-500">Powered by iTunes Search API and Google Gemini</p>
        </div>
        <div class="mt-8 text-center"><a href="/" class="text-gray-600 hover:text-black text-sm">← Back to Home</a></div>
      </div>
    </section>`
  );

  fs.mkdirSync(path.join(__dirname, '../public/podcasts'), { recursive: true });
  fs.writeFileSync(path.join(__dirname, '../public/podcasts/index.html'), fullPage);
  console.log('✅ Built static page: /podcasts/index.html');
}

function buildArchiveIndex() {
  const archiveHtmlPath = path.join(__dirname, '../archive.html');
  if (!fs.existsSync(archiveHtmlPath)) return;

  let content = fs.readFileSync(archiveHtmlPath, 'utf-8');
  content = content.replace(/^---[\s\S]*?---/, ''); // Strip frontmatter
  content = content.replace(/\{\{\s*['"](.*?)['"]\s*\|\s*relative_url\s*\}\}/g, '$1');

  const fullPage = renderPage('Archive', content);

  fs.mkdirSync(path.join(__dirname, '../public/archive'), { recursive: true });
  fs.writeFileSync(path.join(__dirname, '../public/archive/index.html'), fullPage);
  console.log('✅ Built static page: /archive/index.html');
}

function buildHoroscopes() {
  const jsonPath = path.join(__dirname, '../_data/horoscopes.json');
  if (!fs.existsSync(jsonPath)) return;

  const h = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));

  const ZODIAC_DATES = {
    'Aries': 'Mar 21 – Apr 19',
    'Taurus': 'Apr 20 – May 20',
    'Gemini': 'May 21 – Jun 20',
    'Cancer': 'Jun 21 – Jul 22',
    'Leo': 'Jul 23 – Aug 22',
    'Virgo': 'Aug 23 – Sep 22',
    'Libra': 'Sep 23 – Oct 22',
    'Scorpio': 'Oct 23 – Nov 21',
    'Sagittarius': 'Nov 22 – Dec 21',
    'Capricorn': 'Dec 22 – Jan 19',
    'Aquarius': 'Jan 20 – Feb 18',
    'Pisces': 'Feb 19 – Mar 20'
  };

  const ZODIAC_GLYPHS = {
    'Aries': '♈︎',
    'Taurus': '♉︎',
    'Gemini': '♊︎',
    'Cancer': '♋︎',
    'Leo': '♌︎',
    'Virgo': '♍︎',
    'Libra': '♎︎',
    'Scorpio': '♏︎',
    'Sagittarius': '♐︎',
    'Capricorn': '♑︎',
    'Aquarius': '♒︎',
    'Pisces': '♓︎'
  };

  const title = h.page_title || 'Horoscopes';
  const dateCaptionHtml = h.date_caption ? `<p class="mt-4 text-sm text-gray-600">${h.date_caption}</p>` : '';

  let luckyHtml = '';
  if (h.lucky_numbers && h.lucky_numbers.length > 0) {
    let numbersDisplay = '';
    if (h.lucky_numbers.length === 6) {
      const mainNums = h.lucky_numbers.slice(0, 5).join(' · ');
      const pbNum = h.lucky_numbers[5];
      numbersDisplay = `${mainNums} <span aria-hidden="true"> · </span><span class="inline-flex items-center justify-center rounded-full border-2 border-red-400 text-red-400 font-mono tabular-nums align-middle ml-1 px-2 py-0.5 md:px-2.5 md:py-1 leading-none" title="Powerball (1–26)">${pbNum}</span>`;
    } else {
      numbersDisplay = h.lucky_numbers.join(' · ');
    }
    const commentHtml = h.lucky_numbers_comment ? `<p class="mt-2 text-sm text-gray-600 leading-snug max-w-2xl">${h.lucky_numbers_comment}</p>` : '';
    luckyHtml = `
      <section class="mb-12" aria-labelledby="lucky-heading">
        <h2 id="lucky-heading" class="text-xs font-bold text-black uppercase tracking-wider mb-3">Lucky numbers today</h2>
        <p class="text-2xl md:text-3xl font-mono text-gray-700 tracking-wide">${numbersDisplay}</p>
        ${commentHtml}
      </section>`;
  }

  let newsHtml = '';
  if (h.news && h.news.title) {
    const newsLink = h.news.url
      ? `<a href="${h.news.url}" class="text-gray-800 underline hover:text-black" target="_blank" rel="noopener noreferrer">${h.news.title}</a>`
      : `<span class="text-gray-800">${h.news.title}</span>`;
    newsHtml = `<p class="text-sm text-gray-500 mb-4">Based on headline: ${newsLink} <span class="text-gray-400"> · ${h.news.source || ''}</span></p>`;
  }

  let signsHtml = '';
  if (h.signs && Array.isArray(h.signs)) {
    const signCards = h.signs.map(sign => {
      const glyph = ZODIAC_GLYPHS[sign.name] || '◦';
      const dates = ZODIAC_DATES[sign.name] || '';
      const lines = sign.lines.map(line => `<p>${line}</p>`).join('');
      return `
        <article class="border-t border-gray-200 pt-4">
          <h3 class="text-lg font-bold text-black mb-2 flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
            <span class="sign-zodiac-glyph select-none text-xl leading-none text-black" aria-hidden="true">${glyph}</span>
            <span class="inline-flex flex-wrap items-baseline gap-x-2">
              <span>${sign.name}</span>
              <span class="text-[10px] sm:text-[11px] font-normal font-sans text-gray-500 tracking-wide">${dates}</span>
            </span>
          </h3>
          <div class="text-sm text-gray-700 leading-relaxed space-y-1">${lines}</div>
        </article>`;
    }).join('');

    signsHtml = `
      <section aria-labelledby="signs-heading">
        <h2 id="signs-heading" class="text-xs font-bold text-black uppercase tracking-wider mb-6">The twelve signs</h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-10">${signCards}</div>
      </section>`;
  }

  let generatorTech = '';
  if (h.generator) {
    generatorTech = `
      <p class="text-xs text-gray-400 leading-relaxed">
        Technical: copy from <code class="text-gray-500">_data/horoscopes.json</code>.
        LLM <code class="text-gray-500">${h.generator.llm_model}</code> via ${h.generator.llm_provider}.
        News context from ${h.generator.news_api}.
        ${h.generator.lucky_draw || ''}
        Scheduled weekly (Mondays UTC) with GitHub Actions.
        ${h.generated_at_iso ? `Last generation timestamp (UTC): <code class="text-gray-500">${h.generated_at_iso}</code>.` : ''}
      </p>`;
  }

  const content = `
    <section class="py-16 bg-white">
      <div class="max-w-4xl mx-auto px-6 sm:px-8 lg:px-12">
        <header class="mb-12 border-b border-gray-200 pb-8">
          <h1 class="text-3xl md:text-4xl font-bold text-black">${title}</h1>
          ${dateCaptionHtml}
        </header>

        ${luckyHtml}

        <section class="mb-14" aria-labelledby="forecast-heading">
          <h2 id="forecast-heading" class="text-xs font-bold text-black uppercase tracking-wider mb-3 flex items-baseline gap-2">
            <span class="sign-zodiac-glyph select-none text-xl leading-none text-black" aria-hidden="true">&#x2C17;</span>
            <span>News oracle (this week)</span>
          </h2>
          ${newsHtml}
          <div class="prose prose-lg max-w-none text-gray-800">
            <p class="whitespace-pre-line">${h.weekly_forecast || ''}</p>
          </div>
        </section>

        ${signsHtml}

        <footer class="mt-16 pt-8 border-t border-gray-200">
          <p class="text-xs text-gray-500 leading-relaxed mb-3">
            For entertainment only. Not advice, not predictive, not astrological guidance.
          </p>
          ${generatorTech}
          <p class="text-center mt-8 space-x-4">
            <a href="/archive" class="text-gray-600 hover:text-black text-sm">← Back to Archive</a>
            <span class="text-gray-300">|</span>
            <a href="/" class="text-gray-600 hover:text-black text-sm">Home</a>
          </p>
        </footer>
      </div>
      <style>
        .sign-zodiac-glyph {
          font-variant-emoji: text;
          font-family: "Apple Symbols", "Segoe UI Symbol", "Noto Sans Symbols 2", "DejaVu Sans", serif;
        }
      </style>
    </section>`;

  const fullPage = renderPage(`${title} - Horoscopes`, content);
  fs.mkdirSync(path.join(__dirname, '../public/archive/horoscopes'), { recursive: true });
  fs.writeFileSync(path.join(__dirname, '../public/archive/horoscopes/index.html'), fullPage);
  console.log('✅ Built static page: /archive/horoscopes/index.html');
}

function copyArchiveFiles() {
  const srcArchive = path.join(__dirname, '../archive');
  const destArchive = path.join(__dirname, '../public/archive');

  if (fs.existsSync(srcArchive)) {
    fs.cpSync(srcArchive, destArchive, { recursive: true });
    console.log('✅ Copied archive static directory to /public/archive');
  }
}

function copySycEvents() {
  const src = path.join(__dirname, '../data/syc_events.json');
  const dest = path.join(__dirname, '../public/data/syc_events.json');
  if (fs.existsSync(src)) {
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.copyFileSync(src, dest);
    console.log('✅ Copied syc_events.json to /public/data/syc_events.json');
  }
}

function run() {
  console.log('🚀 Building static experiment pages...');
  buildNews();
  buildPodcasts();
  buildArchiveIndex();
  buildHoroscopes();
  copyArchiveFiles();
  copySycEvents();
  console.log('🎉 Static experiment pages ready!');
}

run();
