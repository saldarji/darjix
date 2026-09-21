const fs = require('fs');
const path = require('path');
const os = require('os');

const POSTS_JSON = path.join(__dirname, '../data/posts.json');
const CONFIG_PATH = path.join(os.homedir(), '.config/configstore/firebase-tools.json');

function toFirestoreValue(val) {
  if (val === null || val === undefined) return { nullValue: null };
  if (typeof val === 'boolean') return { booleanValue: val };
  if (typeof val === 'number') {
    return Number.isInteger(val) ? { integerValue: val.toString() } : { doubleValue: val };
  }
  if (typeof val === 'string') return { stringValue: val };
  if (Array.isArray(val)) {
    return { arrayValue: { values: val.map(toFirestoreValue) } };
  }
  if (typeof val === 'object') {
    const fields = {};
    for (const [k, v] of Object.entries(val)) {
      fields[k] = toFirestoreValue(v);
    }
    return { mapValue: { fields } };
  }
  return { stringValue: String(val) };
}

async function seedPosts() {
  console.log('🚀 Reading posts from data/posts.json...');
  if (!fs.existsSync(POSTS_JSON)) {
    console.error('❌ data/posts.json not found!');
    process.exit(1);
  }

  const posts = JSON.parse(fs.readFileSync(POSTS_JSON, 'utf-8'));
  console.log(`Found ${posts.length} posts to import.`);

  if (!fs.existsSync(CONFIG_PATH)) {
    console.error('❌ Firebase credentials not found in ~/.config/configstore/firebase-tools.json');
    process.exit(1);
  }

  const config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf-8'));
  let accessToken = config.tokens?.access_token;
  const refreshToken = config.tokens?.refresh_token;

  if (!accessToken && !refreshToken) {
    console.error('❌ No valid OAuth tokens found. Please run: npx firebase-tools login --reauth');
    process.exit(1);
  }

  // Helper to refresh token if needed
  async function refreshAccessToken() {
    if (!refreshToken) return null;
    try {
      const res = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: '563584335869-fgrhgmd47bqnekij5i8b5pr03ho849e6.apps.googleusercontent.com',
          grant_type: 'refresh_token',
          refresh_token: refreshToken
        })
      });
      const data = await res.json();
      if (data.access_token) {
        accessToken = data.access_token;
        return accessToken;
      }
    } catch (e) {
      console.warn('Could not refresh token:', e.message);
    }
    return null;
  }

  console.log('📡 Importing posts into Cloud Firestore: projects/darjix-website/databases/(default)...');

  let successCount = 0;
  let failCount = 0;

  for (const post of posts) {
    const docId = encodeURIComponent(post.slug || post.id);
    const url = `https://firestore.googleapis.com/v1/projects/darjix-website/databases/(default)/documents/posts/${docId}`;

    const fields = {};
    for (const [key, value] of Object.entries(post)) {
      fields[key] = toFirestoreValue(value);
    }

    let response = await fetch(url, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ fields })
    });

    if (response.status === 401) {
      console.log('Token expired, refreshing...');
      await refreshAccessToken();
      response = await fetch(url, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ fields })
      });
    }

    const data = await response.json();
    if (response.ok) {
      successCount++;
      console.log(`  ✓ [${successCount}/${posts.length}] Imported: ${post.title} (${post.slug || post.id})`);
    } else {
      failCount++;
      console.error(`  ✗ Failed: ${post.title}:`, data.error?.message || JSON.stringify(data));
    }
  }

  console.log(`\n🎉 Migration Complete: ${successCount} imported successfully, ${failCount} failed.`);
}

seedPosts().catch((err) => {
  console.error('Fatal error seeding posts:', err);
  process.exit(1);
});
