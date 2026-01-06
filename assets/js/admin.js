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
    const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
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

