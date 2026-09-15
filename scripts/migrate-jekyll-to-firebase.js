const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

const POSTS_DIR = path.join(__dirname, '../_posts');
const OUTPUT_JSON = path.join(__dirname, '../data/posts.json');

function transformJekyllIncludes(markdown) {
  if (!markdown) return '';

  // Transform legacy Liquid {% include inset.html ... %} tags into clean HTML figures
  return markdown.replace(/\{%\s*include\s+inset\.html[\s\S]*?%\}/gi, (fullMatch) => {
    // Extract content="..." and caption="..."
    const contentMatch = fullMatch.match(/content=\s*["']([\s\S]*?)["']\s*(?:caption=|%})/i);
    const captionMatch = fullMatch.match(/caption=\s*["']([\s\S]*?)["']\s*%}/i);

    let content = contentMatch ? contentMatch[1].trim() : '';
    let caption = captionMatch ? captionMatch[1].trim() : '';

    // Unescape inner quotes if needed
    content = content.replace(/\\"/g, '"');
    caption = caption.replace(/\\"/g, '"');

    return `\n<figure class="my-6 border border-gray-200 p-4 rounded bg-gray-50 overflow-x-auto">\n  ${content}\n  ${
      caption ? `<figcaption class="mt-2 text-sm text-gray-600 italic text-center">${caption}</figcaption>` : ''
    }\n</figure>\n`;
  });
}

function migratePosts() {
  console.log('🚀 Starting Jekyll markdown to Firestore data migration...');
  
  if (!fs.existsSync(POSTS_DIR)) {
    console.error('❌ _posts directory not found!');
    return;
  }

  const files = fs.readdirSync(POSTS_DIR);
  const posts = [];

  files.forEach((filename) => {
    if (!filename.endsWith('.md') && !filename.endsWith('.markdown')) return;

    const filePath = path.join(POSTS_DIR, filename);
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const { data: frontmatter, content } = matter(fileContent);

    // Extract date from filename if not in frontmatter (YYYY-MM-DD-title.md)
    let dateStr = frontmatter.date;
    let slug = filename.replace(/\.(md|markdown)$/, '');

    const dateMatch = filename.match(/^(\d{4}-\d{2}-\d{2})-(.+)$/);
    if (dateMatch) {
      if (!dateStr) dateStr = dateMatch[1];
      slug = dateMatch[2].toLowerCase();
    }

    // Format date string safely
    const parsedDate = new Date(dateStr || Date.now());
    const isoDate = isNaN(parsedDate.getTime()) ? new Date().toISOString() : parsedDate.toISOString();

    const cleanContent = transformJekyllIncludes(content.trim());

    const postDoc = {
      id: slug,
      slug: slug,
      title: frontmatter.title || slug.replace(/-/g, ' '),
      date: isoDate,
      content: cleanContent,
      excerpt: frontmatter.excerpt || cleanContent.slice(0, 160) + '...',
      layout: frontmatter.layout || 'post',
      image: frontmatter.image || null,
      images: frontmatter.images || null,
      caption: frontmatter.caption || null,
      alt_text: frontmatter.alt_text || null,
      published: frontmatter.published !== false,
      tags: frontmatter.tags || [],
      created_at: isoDate,
      updated_at: new Date().toISOString(),
    };

    posts.push(postDoc);
  });

  // Sort descending by date
  posts.sort((a, b) => new Date(b.date) - new Date(a.date));

  // Ensure data output dir exists
  const dataDir = path.dirname(OUTPUT_JSON);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  fs.writeFileSync(OUTPUT_JSON, JSON.stringify(posts, null, 2));
  console.log(`✅ Successfully processed ${posts.length} posts and exported to data/posts.json.`);
  console.log('📌 You can now import data/posts.json into Firebase Cloud Firestore using Firebase Admin SDK or Console.');
}

migratePosts();
