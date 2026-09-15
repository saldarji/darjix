const fs = require('fs');
const path = require('path');

const OUTPUT_JSON = path.join(__dirname, '../data/posts.json');

function transformJekyllIncludes(markdown) {
  if (!markdown) return '';

  return markdown.replace(/\{%\s*include\s+inset\.html[\s\S]*?%\}/gi, (fullMatch) => {
    const contentMatch = fullMatch.match(/content=\s*["']([\s\S]*?)["']\s*(?:caption=|%})/i);
    const captionMatch = fullMatch.match(/caption=\s*["']([\s\S]*?)["']\s*%}/i);

    let content = contentMatch ? contentMatch[1].trim() : '';
    let caption = captionMatch ? captionMatch[1].trim() : '';

    content = content.replace(/\\"/g, '"');
    caption = caption.replace(/\\"/g, '"');

    return `\n<figure class="my-6 border border-gray-200 p-4 rounded bg-gray-50 overflow-x-auto">\n  ${content}\n  ${
      caption ? `<figcaption class="mt-2 text-sm text-gray-600 italic text-center">${caption}</figcaption>` : ''
    }\n</figure>\n`;
  });
}

function cleanPosts() {
  if (!fs.existsSync(OUTPUT_JSON)) {
    console.error('data/posts.json not found!');
    return;
  }

  const posts = JSON.parse(fs.readFileSync(OUTPUT_JSON, 'utf-8'));
  posts.forEach((post) => {
    if (post.content) {
      post.content = transformJekyllIncludes(post.content);
    }
  });

  fs.writeFileSync(OUTPUT_JSON, JSON.stringify(posts, null, 2));
  console.log('✅ Cleaned all Liquid includes from data/posts.json!');
}

cleanPosts();
