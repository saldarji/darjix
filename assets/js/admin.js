// Admin page functionality for creating posts via GitHub API

const GITHUB_OWNER = 'saldarji';
const GITHUB_REPO = 'darjix';
const GITHUB_API_BASE = 'https://api.github.com';
const TOKEN_STORAGE_KEY = 'github_token';

// Initialize on page load
// Note: This runs when admin content is visible (either immediately if already authenticated, or after password check)
let adminInitialized = false;

// Make this function globally accessible
window.initializeAdminIfReady = function() {
  // Don't initialize twice
  if (adminInitialized) {
    return true;
  }
  
  const adminContent = document.getElementById('admin-content');
  // Check if admin content exists and is visible
  if (adminContent && !adminContent.classList.contains('hidden')) {
    try {
      initializeTokenManagement();
      initializeFormHandlers();
      initializeMarkdownToolbar();
      initializeTabs();
      initializeFeaturedContent();
      loadSavedToken();
      setDefaultDate();
      adminInitialized = true;
      console.log('✅ Admin initialized successfully');
      return true;
    } catch (error) {
      console.error('❌ Error initializing admin:', error);
      return false;
    }
  }
  return false;
};

// Listen for custom event when admin content becomes visible
window.addEventListener('admin-content-visible', () => {
  console.log('📢 Admin content visible event received');
  setTimeout(() => {
    window.initializeAdminIfReady();
  }, 50);
});

// Use MutationObserver to watch for admin-content becoming visible
function watchForAdminContent() {
  const adminContent = document.getElementById('admin-content');
  if (!adminContent) {
    // If admin-content doesn't exist yet, wait a bit and try again
    setTimeout(watchForAdminContent, 100);
    return;
  }
  
  // Try to initialize immediately
  if (window.initializeAdminIfReady()) {
    return;
  }
  
  // Watch for class changes on admin-content
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
        if (!adminContent.classList.contains('hidden')) {
          window.initializeAdminIfReady();
          observer.disconnect();
        }
      }
    });
  });
  
  observer.observe(adminContent, {
    attributes: true,
    attributeFilter: ['class']
  });
  
  // Also poll as a fallback
  let attempts = 0;
  const maxAttempts = 50; // Increased from 30 to give more time
  const pollInterval = setInterval(() => {
    attempts++;
    if (window.initializeAdminIfReady() || attempts >= maxAttempts) {
      clearInterval(pollInterval);
      if (attempts >= maxAttempts && !adminInitialized) {
        console.warn('⚠️ Admin initialization polling timed out. Admin content may not be visible yet.');
        // Try one more time after a longer delay
        setTimeout(() => {
          window.initializeAdminIfReady();
        }, 500);
      }
    }
  }, 100);
}

// Initialize when DOM is ready
function startInitialization() {
  watchForAdminContent();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', startInitialization);
} else {
  // DOM is already loaded
  startInitialization();
}

function setDefaultDate() {
  const dateInput = document.getElementById('post-date');
  if (dateInput && !dateInput.value) {
    const today = new Date().toISOString().split('T')[0];
    dateInput.value = today;
  }
}

// Token Management
function initializeTokenManagement() {
  const saveBtn = document.getElementById('save-token-btn');
  const clearBtn = document.getElementById('clear-token-btn');
  const githubTokenInput = document.getElementById('github-token');
  const statusDiv = document.getElementById('token-status');

  saveBtn.addEventListener('click', () => {
    const githubToken = githubTokenInput.value.trim();
    
    if (!githubToken) {
      showStatus(statusDiv, 'Please enter a GitHub token', 'error');
      return;
    }
    
    localStorage.setItem(TOKEN_STORAGE_KEY, githubToken);
    
    githubTokenInput.value = '';
    showStatus(statusDiv, 'Token saved successfully', 'success');
    updateTokenStatus();
  });

  clearBtn.addEventListener('click', () => {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    githubTokenInput.value = '';
    showStatus(statusDiv, 'Token cleared', 'success');
    updateTokenStatus();
  });
}

function loadSavedToken() {
  const token = localStorage.getItem(TOKEN_STORAGE_KEY);
  if (token) {
    updateTokenStatus();
  }
}

function updateTokenStatus() {
  const statusDiv = document.getElementById('token-status');
  const githubToken = localStorage.getItem(TOKEN_STORAGE_KEY);
  
  if (githubToken) {
    const masked = githubToken.substring(0, 7) + '...' + githubToken.substring(githubToken.length - 4);
    statusDiv.innerHTML = `<span class="text-green-600">✓ GitHub token saved (${masked})</span>`;
  } else {
    statusDiv.innerHTML = '<span class="text-gray-600">No token saved</span>';
  }
}

function getGitHubToken() {
  const token = localStorage.getItem(TOKEN_STORAGE_KEY);
  if (!token) {
    throw new Error('GitHub token not found. Please save your token first.');
  }
  return token;
}

// Form Handlers
function initializeFormHandlers() {
  const form = document.getElementById('post-form');
  const postTypeRadios = document.querySelectorAll('input[name="post-type"]');
  const imageModeRadios = document.querySelectorAll('input[name="image-mode"]');

  // Toggle between post and photo sections
  postTypeRadios.forEach(radio => {
    radio.addEventListener('change', (e) => {
      const isPhoto = e.target.value === 'photo';
      document.getElementById('content-section').classList.toggle('hidden', isPhoto);
      document.getElementById('photo-section').classList.toggle('hidden', !isPhoto);
    });
  });

  // Toggle between single and gallery image modes
  imageModeRadios.forEach(radio => {
    radio.addEventListener('change', (e) => {
      const isGallery = e.target.value === 'gallery';
      document.getElementById('single-image-section').classList.toggle('hidden', isGallery);
      document.getElementById('gallery-section').classList.toggle('hidden', !isGallery);
    });
  });

  // Gallery image preview
  const galleryInput = document.getElementById('gallery-images');
  galleryInput.addEventListener('change', handleGalleryImages);

  // Form submission
  form.addEventListener('submit', handleFormSubmit);
}

function handleGalleryImages(e) {
  const files = Array.from(e.target.files);
  const previewDiv = document.getElementById('gallery-preview');
  previewDiv.innerHTML = '';

  files.forEach((file, index) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const div = document.createElement('div');
      div.className = 'border-2 border-black p-4';
      div.innerHTML = `
        <div class="mb-2">
          <img src="${event.target.result}" alt="Preview" class="max-w-xs h-32 object-cover">
        </div>
        <div class="space-y-2">
          <p class="text-xs text-gray-600">
            Alt-text will be automatically generated after you create the post.
          </p>
          <label class="block text-sm font-medium text-black">
            Caption (optional)
            <input 
              type="text" 
              data-image-index="${index}"
              class="image-caption w-full px-3 py-1 border border-gray-300 focus:border-black focus:outline-none text-sm mt-1"
              placeholder="Optional caption"
            >
          </label>
        </div>
      `;
      previewDiv.appendChild(div);
    };
    reader.readAsDataURL(file);
  });
}

// Form Submission
async function handleFormSubmit(e) {
  e.preventDefault();
  const submitBtn = document.getElementById('submit-btn');
  const statusDiv = document.getElementById('status-message');

  try {
    submitBtn.disabled = true;
    submitBtn.textContent = 'Creating post...';

    const postType = document.querySelector('input[name="post-type"]:checked').value;
    
    if (postType === 'photo') {
      await createPhotoPost();
    } else {
      await createRegularPost();
    }

    showStatus(statusDiv, 'Post created successfully! It will appear on the site after GitHub Pages rebuilds.', 'success');
    document.getElementById('post-form').reset();
    document.getElementById('gallery-preview').innerHTML = '';
    
  } catch (error) {
    showStatus(statusDiv, `Error: ${error.message}`, 'error');
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Create Post';
  }
}

async function createRegularPost() {
  const title = document.getElementById('post-title').value.trim();
  const date = document.getElementById('post-date').value;
  const content = document.getElementById('post-content').value.trim();

  if (!title || !date || !content) {
    throw new Error('Please fill in all required fields');
  }

  // Generate filename
  const slug = title.toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  const filename = `${date}-${slug}.md`;

  // Generate front matter and content
  const frontMatter = `---
layout: post
title: "${title.replace(/"/g, '\\"')}"
date: ${date}
author: "Sal Darji"
---

${content}
`;

  // Create file via GitHub API
  await createGitHubFile(`_posts/${filename}`, frontMatter, `Create post: ${title}`);
}

async function createPhotoPost() {
  const title = document.getElementById('post-title').value.trim();
  const date = document.getElementById('post-date').value;
  const imageMode = document.querySelector('input[name="image-mode"]:checked').value;

  if (!title || !date) {
    throw new Error('Please fill in title and date');
  }

  // Generate filename
  const slug = title.toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  const filename = `${date}-${slug}.md`;

  let frontMatter;
  let imagesToUpload = [];

  if (imageMode === 'single') {
    const fileInput = document.getElementById('single-image');
    const caption = document.getElementById('single-caption').value.trim();

    if (!fileInput.files || !fileInput.files[0]) {
      throw new Error('Please select an image');
    }

    const imageFile = fileInput.files[0];
    const imagePath = `assets/images/image posts/${sanitizeFilename(imageFile.name)}`;
    
    imagesToUpload.push({ file: imageFile, path: imagePath });

    frontMatter = `---
layout: photo
title: "${title.replace(/"/g, '\\"')}"
date: ${date}
author: "Sal Darji"
image: "/${imagePath}"
alt_text: "Image description will be generated automatically"
${caption ? `caption: "${caption.replace(/"/g, '\\"')}"` : ''}
---
`;
  } else {
    // Gallery mode
    const fileInput = document.getElementById('gallery-images');
    if (!fileInput.files || fileInput.files.length === 0) {
      throw new Error('Please select at least one image');
    }

    const images = [];
    const files = Array.from(fileInput.files);
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const captionInput = document.querySelector(`input.image-caption[data-image-index="${i}"]`);
      
      const caption = captionInput ? captionInput.value.trim() : '';

      const imagePath = `assets/images/image posts/${sanitizeFilename(file.name)}`;
      imagesToUpload.push({ file: file, path: imagePath });

      images.push({
        url: `/${imagePath}`,
        ...(caption && { caption: caption.replace(/"/g, '\\"') })
      });
    }

    // Format images array for YAML
    const imagesYaml = images.map(img => {
      let yaml = `  - url: "${img.url}"`;
      yaml += `\n    alt_text: "Image description will be generated automatically"`;
      if (img.caption) {
        yaml += `\n    caption: "${img.caption}"`;
      }
      return yaml;
    }).join('\n');

    frontMatter = `---
layout: photo
title: "${title.replace(/"/g, '\\"')}"
date: ${date}
author: "Sal Darji"
images:
${imagesYaml}
---
`;
  }

  // Upload images first
  for (const { file, path } of imagesToUpload) {
    const arrayBuffer = await file.arrayBuffer();
    // Convert to base64 in chunks to avoid stack overflow with large images
    const bytes = new Uint8Array(arrayBuffer);
    let binary = '';
    for (let i = 0; i < bytes.length; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    const base64 = btoa(binary);
    await createGitHubFile(path, base64, `Upload image: ${file.name}`, true);
  }

  // Create post file
  await createGitHubFile(`_posts/${filename}`, frontMatter, `Create photo post: ${title}`);
}

// GitHub API Functions
async function createGitHubFile(path, content, message, isBase64 = false) {
  const token = getGitHubToken();
  
  // Get current file SHA if it exists (for updates)
  let sha = null;
  try {
    const existingFile = await fetch(
      `${GITHUB_API_BASE}/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${encodeURIComponent(path)}`,
      {
        headers: {
          'Authorization': `token ${token}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      }
    );
    if (existingFile.ok) {
      const data = await existingFile.json();
      sha = data.sha;
    }
  } catch (e) {
    // File doesn't exist, that's fine
  }

  // Encode content as base64 if it's not already
  const encodedContent = isBase64 ? content : btoa(unescape(encodeURIComponent(content)));

  const response = await fetch(
    `${GITHUB_API_BASE}/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${encodeURIComponent(path)}`,
    {
      method: 'PUT',
      headers: {
        'Authorization': `token ${token}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: message,
        content: encodedContent,
        ...(sha && { sha: sha })
      })
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || `Failed to create file: ${response.statusText}`);
  }

  return await response.json();
}

// Utility Functions
function sanitizeFilename(filename) {
  return filename
    .replace(/[^a-zA-Z0-9._-]/g, '-')
    .replace(/-+/g, '-')
    .toLowerCase();
}

function showStatus(element, message, type) {
  element.textContent = message;
  element.className = `mt-4 text-sm ${
    type === 'error' ? 'text-red-600' : 
    type === 'success' ? 'text-green-600' : 
    'text-gray-600'
  }`;
  
  if (type === 'success' || type === 'error') {
    setTimeout(() => {
      element.textContent = '';
      element.className = 'mt-4 text-sm';
    }, 5000);
  }
}

// Tab Management
function initializeTabs() {
  const tabButtons = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');
  
  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetTab = btn.dataset.tab;
      
      // Update button states
      tabButtons.forEach(b => {
        b.classList.remove('border-black', 'text-black');
        b.classList.add('border-transparent', 'text-gray-600');
      });
      btn.classList.remove('border-transparent', 'text-gray-600');
      btn.classList.add('border-black', 'text-black');
      
      // Update content visibility
      tabContents.forEach(content => {
        content.classList.add('hidden');
      });
      document.getElementById(`tab-content-${targetTab}`).classList.remove('hidden');
    });
  });
}

// Featured Content Management
let featuredContentItems = [];

function initializeFeaturedContent() {
  const addBtn = document.getElementById('add-featured-item-btn');
  const saveBtn = document.getElementById('save-featured-content-btn');
  
  if (addBtn) {
    addBtn.addEventListener('click', addFeaturedItem);
  }
  
  if (saveBtn) {
    saveBtn.addEventListener('click', saveFeaturedContent);
  }
  
  // Load existing content
  loadFeaturedContent();
}

async function loadFeaturedContent() {
  try {
    const token = getGitHubToken();
    const response = await fetch(
      `${GITHUB_API_BASE}/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/_includes/featured-content.md`,
      {
        headers: {
          'Authorization': `token ${token}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      }
    );
    
    if (!response.ok) {
      throw new Error(`Failed to load featured content: ${response.statusText}`);
    }
    
    const data = await response.json();
    // Decode base64 content properly handling UTF-8 encoding
    // GitHub API returns base64-encoded content, decode it with proper UTF-8 handling
    const base64Content = data.content.replace(/\s/g, ''); // Remove any whitespace
    const binaryString = atob(base64Content);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    const content = new TextDecoder('utf-8').decode(bytes);
    parseFeaturedContent(content);
    renderFeaturedContent();
  } catch (error) {
    const listDiv = document.getElementById('featured-content-list');
    listDiv.innerHTML = `<div class="text-sm text-red-600">Error loading featured content: ${error.message}</div>`;
  }
}

function parseFeaturedContent(content) {
  featuredContentItems = [];
  const lines = content.split('\n').filter(line => line.trim());
  
  for (const line of lines) {
    // Parse markdown link format: - [Title](URL) [Source]
    const match = line.match(/^-\s+\[([^\]]+)\]\(([^)]+)\)\s*(?:\[([^\]]+)\])?/);
    if (match) {
      featuredContentItems.push({
        title: match[1],
        url: match[2],
        source: match[3] || ''
      });
    }
  }
}

function renderFeaturedContent() {
  const listDiv = document.getElementById('featured-content-list');
  
  if (featuredContentItems.length === 0) {
    listDiv.innerHTML = '<div class="text-sm text-gray-600">No items yet. Click "Add New Item" to get started.</div>';
    return;
  }
  
  listDiv.innerHTML = featuredContentItems.map((item, index) => `
    <div class="border-2 border-black p-4" data-index="${index}">
      <div class="flex items-start justify-between mb-2">
        <div class="flex-1 space-y-2">
          <div>
            <label class="block text-xs font-medium text-black mb-1">Title</label>
            <input 
              type="text" 
              class="featured-title w-full px-3 py-2 border border-gray-300 focus:border-black focus:outline-none text-sm"
              value="${escapeHtml(item.title)}"
              data-index="${index}"
            >
          </div>
          <div>
            <label class="block text-xs font-medium text-black mb-1">URL</label>
            <input 
              type="url" 
              class="featured-url w-full px-3 py-2 border border-gray-300 focus:border-black focus:outline-none text-sm"
              value="${escapeHtml(item.url)}"
              data-index="${index}"
            >
          </div>
          <div>
            <label class="block text-xs font-medium text-black mb-1">Source (optional)</label>
            <input 
              type="text" 
              class="featured-source w-full px-3 py-2 border border-gray-300 focus:border-black focus:outline-none text-sm"
              value="${escapeHtml(item.source)}"
              data-index="${index}"
            >
          </div>
        </div>
        <div class="ml-4 flex flex-col gap-2">
          <button 
            class="move-up-btn px-3 py-1 border border-gray-300 hover:bg-gray-100 text-sm"
            data-index="${index}"
            ${index === 0 ? 'disabled' : ''}
            title="Move up"
          >
            ↑
          </button>
          <button 
            class="move-down-btn px-3 py-1 border border-gray-300 hover:bg-gray-100 text-sm"
            data-index="${index}"
            ${index === featuredContentItems.length - 1 ? 'disabled' : ''}
            title="Move down"
          >
            ↓
          </button>
          <button 
            class="delete-item-btn px-3 py-1 border-2 border-red-600 text-red-600 hover:bg-red-50 text-sm"
            data-index="${index}"
            title="Delete"
          >
            ×
          </button>
        </div>
      </div>
    </div>
  `).join('');
  
  // Add event listeners
  document.querySelectorAll('.move-up-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const index = parseInt(e.target.dataset.index);
      if (index > 0) {
        [featuredContentItems[index], featuredContentItems[index - 1]] = 
          [featuredContentItems[index - 1], featuredContentItems[index]];
        renderFeaturedContent();
      }
    });
  });
  
  document.querySelectorAll('.move-down-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const index = parseInt(e.target.dataset.index);
      if (index < featuredContentItems.length - 1) {
        [featuredContentItems[index], featuredContentItems[index + 1]] = 
          [featuredContentItems[index + 1], featuredContentItems[index]];
        renderFeaturedContent();
      }
    });
  });
  
  document.querySelectorAll('.delete-item-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const index = parseInt(e.target.dataset.index);
      if (confirm('Are you sure you want to delete this item?')) {
        featuredContentItems.splice(index, 1);
        renderFeaturedContent();
      }
    });
  });
  
  // Update items when inputs change
  document.querySelectorAll('.featured-title, .featured-url, .featured-source').forEach(input => {
    input.addEventListener('input', (e) => {
      const index = parseInt(e.target.dataset.index);
      const field = e.target.className.includes('title') ? 'title' : 
                    e.target.className.includes('url') ? 'url' : 'source';
      featuredContentItems[index][field] = e.target.value;
    });
  });
}

function addFeaturedItem() {
  // Add new item at the top of the list
  featuredContentItems.unshift({
    title: '',
    url: '',
    source: ''
  });
  renderFeaturedContent();
  
  // Focus on the title input of the new item (now at index 0)
  setTimeout(() => {
    const newInput = document.querySelector(`.featured-title[data-index="0"]`);
    if (newInput) newInput.focus();
  }, 100);
}

async function saveFeaturedContent() {
  const saveBtn = document.getElementById('save-featured-content-btn');
  const statusDiv = document.getElementById('featured-content-status');
  
  // Validate items
  for (let i = 0; i < featuredContentItems.length; i++) {
    const item = featuredContentItems[i];
    if (!item.title || !item.url) {
      showStatus(statusDiv, `Item ${i + 1} is missing title or URL`, 'error');
      return;
    }
  }
  
  try {
    saveBtn.disabled = true;
    saveBtn.textContent = 'Saving...';
    
    // Generate markdown content
    const markdown = featuredContentItems.map(item => {
      const source = item.source ? ` [${item.source}]` : '';
      return `- [${item.title}](${item.url})${source}`;
    }).join('\n') + '\n';
    
    // Get current file SHA
    const token = getGitHubToken();
    let sha = null;
    try {
      const existingFile = await fetch(
        `${GITHUB_API_BASE}/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/_includes/featured-content.md`,
        {
          headers: {
            'Authorization': `token ${token}`,
            'Accept': 'application/vnd.github.v3+json'
          }
        }
      );
      if (existingFile.ok) {
        const data = await existingFile.json();
        sha = data.sha;
      }
    } catch (e) {
      // File doesn't exist, that's fine
    }
    
    // Save file
    const encodedContent = btoa(unescape(encodeURIComponent(markdown)));
    const response = await fetch(
      `${GITHUB_API_BASE}/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/_includes/featured-content.md`,
      {
        method: 'PUT',
        headers: {
          'Authorization': `token ${token}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: 'Update featured content',
          content: encodedContent,
          ...(sha && { sha: sha })
        })
      }
    );
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || `Failed to save: ${response.statusText}`);
    }
    
    showStatus(statusDiv, 'Featured content saved successfully! Changes will appear on the site after GitHub Pages rebuilds.', 'success');
  } catch (error) {
    showStatus(statusDiv, `Error: ${error.message}`, 'error');
  } finally {
    saveBtn.disabled = false;
    saveBtn.textContent = 'Save Changes';
  }
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Markdown Toolbar Functions
function initializeMarkdownToolbar() {
  const toolbarButtons = document.querySelectorAll('.markdown-btn');
  const textarea = document.getElementById('post-content');

  toolbarButtons.forEach(button => {
    button.addEventListener('click', (e) => {
      e.preventDefault();
      const action = button.dataset.action;
      insertMarkdown(action, textarea);
    });
  });
}

function insertMarkdown(action, textarea) {
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const selectedText = textarea.value.substring(start, end);
  const beforeText = textarea.value.substring(0, start);
  const afterText = textarea.value.substring(end);

  let insertText = '';
  let newCursorPos = start;

  switch (action) {
    case 'bold':
      insertText = selectedText || 'bold text';
      insertText = `**${insertText}**`;
      newCursorPos = start + (selectedText ? insertText.length : 11);
      break;
    
    case 'italic':
      insertText = selectedText || 'italic text';
      insertText = `*${insertText}*`;
      newCursorPos = start + (selectedText ? insertText.length : 12);
      break;
    
    case 'link':
      if (selectedText) {
        insertText = `[${selectedText}](url)`;
        newCursorPos = start + insertText.length - 1;
      } else {
        insertText = '[link text](url)';
        newCursorPos = start + insertText.length - 4;
      }
      break;
    
    case 'heading':
      insertText = selectedText || 'Heading';
      insertText = `## ${insertText}`;
      newCursorPos = start + insertText.length;
      break;
    
    case 'ul':
      if (selectedText) {
        const lines = selectedText.split('\n').filter(l => l.trim());
        insertText = lines.map(line => `- ${line}`).join('\n');
        newCursorPos = start + insertText.length;
      } else {
        insertText = '- List item';
        newCursorPos = start + insertText.length;
      }
      break;
    
    case 'ol':
      if (selectedText) {
        const lines = selectedText.split('\n').filter(l => l.trim());
        insertText = lines.map((line, i) => `${i + 1}. ${line}`).join('\n');
        newCursorPos = start + insertText.length;
      } else {
        insertText = '1. List item';
        newCursorPos = start + insertText.length;
      }
      break;
    
    case 'code':
      insertText = selectedText || 'code';
      insertText = `\`${insertText}\``;
      newCursorPos = start + (selectedText ? insertText.length : 6);
      break;
    
    case 'blockquote':
      if (selectedText) {
        const lines = selectedText.split('\n');
        insertText = lines.map(line => `> ${line}`).join('\n');
        newCursorPos = start + insertText.length;
      } else {
        insertText = '> Quote';
        newCursorPos = start + insertText.length;
      }
      break;
    
    case 'hr':
      insertText = '\n---\n';
      newCursorPos = start + insertText.length;
      break;
  }

  textarea.value = beforeText + insertText + afterText;
  textarea.focus();
  textarea.setSelectionRange(newCursorPos, newCursorPos);
}

