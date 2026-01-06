// Admin page functionality for creating posts via GitHub API

const GITHUB_OWNER = 'saldarji';
const GITHUB_REPO = 'darjix';
const GITHUB_API_BASE = 'https://api.github.com';
const TOKEN_STORAGE_KEY = 'github_token';
const REPLICATE_TOKEN_STORAGE_KEY = 'replicate_token';
const REPLICATE_API_BASE = 'https://api.replicate.com/v1';

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
  const maxAttempts = 30;
  const pollInterval = setInterval(() => {
    attempts++;
    if (window.initializeAdminIfReady() || attempts >= maxAttempts) {
      clearInterval(pollInterval);
      if (attempts >= maxAttempts) {
        console.warn('⚠️ Admin initialization polling timed out');
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
  const replicateTokenInput = document.getElementById('replicate-token');
  const statusDiv = document.getElementById('token-status');

  saveBtn.addEventListener('click', () => {
    const githubToken = githubTokenInput.value.trim();
    const replicateToken = replicateTokenInput.value.trim();
    
    if (!githubToken) {
      showStatus(statusDiv, 'Please enter a GitHub token', 'error');
      return;
    }
    
    localStorage.setItem(TOKEN_STORAGE_KEY, githubToken);
    if (replicateToken) {
      localStorage.setItem(REPLICATE_TOKEN_STORAGE_KEY, replicateToken);
    }
    
    githubTokenInput.value = '';
    replicateTokenInput.value = '';
    showStatus(statusDiv, 'Tokens saved successfully', 'success');
    updateTokenStatus();
  });

  clearBtn.addEventListener('click', () => {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.removeItem(REPLICATE_TOKEN_STORAGE_KEY);
    githubTokenInput.value = '';
    replicateTokenInput.value = '';
    showStatus(statusDiv, 'Tokens cleared', 'success');
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
  const replicateToken = localStorage.getItem(REPLICATE_TOKEN_STORAGE_KEY);
  
  if (githubToken) {
    const masked = githubToken.substring(0, 7) + '...' + githubToken.substring(githubToken.length - 4);
    let status = `<span class="text-green-600">GitHub token saved: ${masked}</span>`;
    if (replicateToken) {
      status += '<br><span class="text-green-600">Replicate token saved</span>';
    }
    statusDiv.innerHTML = status;
  } else {
    statusDiv.innerHTML = '<span class="text-gray-600">No tokens saved</span>';
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

  // Alt text generation
  const generateAltBtn = document.getElementById('generate-single-alt-btn');
  if (generateAltBtn) {
    // Remove any existing listener first
    const newBtn = generateAltBtn.cloneNode(true);
    generateAltBtn.parentNode.replaceChild(newBtn, generateAltBtn);
    newBtn.addEventListener('click', function(e) {
      e.preventDefault();
      generateSingleAltText();
    });
  } else {
    console.warn('Generate alt text button not found');
  }

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
          <label class="block text-sm font-medium text-black">
            Alt Text <span class="text-gray-600">*</span>
            <div class="flex gap-2 mt-1">
              <input 
                type="text" 
                data-image-index="${index}"
                data-image-name="${file.name}"
                class="image-alt-text flex-1 px-3 py-1 border border-gray-300 focus:border-black focus:outline-none text-sm"
                placeholder="Describe the image"
              >
              <button 
                type="button" 
                class="generate-alt-btn px-3 py-1 border-2 border-black text-black text-sm font-medium hover:bg-gray-100 transition"
                data-image-index="${index}"
                data-image-file="${index}"
              >
                Generate
              </button>
            </div>
          </label>
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

      // Add event listener for generate button
      const genBtn = div.querySelector('.generate-alt-btn');
      if (genBtn) {
        genBtn.addEventListener('click', async function(e) {
          e.preventDefault();
          const idx = parseInt(this.dataset.imageIndex);
          await generateGalleryAltText(files[idx], idx);
        });
      }
    };
    reader.readAsDataURL(file);
  });
}

// Alt Text Generation
async function generateSingleAltText() {
  const fileInput = document.getElementById('single-image');
  const altTextInput = document.getElementById('single-alt-text');
  const btn = document.getElementById('generate-single-alt-btn');

  if (!fileInput.files || !fileInput.files[0]) {
    showStatus(document.getElementById('status-message'), 'Please select an image first', 'error');
    return;
  }

  btn.disabled = true;
  btn.textContent = 'Generating...';

  try {
    const altText = await generateAltText(fileInput.files[0]);
    altTextInput.value = altText;
    showStatus(document.getElementById('status-message'), 'Alt text generated successfully', 'success');
  } catch (error) {
    let errorMsg = error.message || 'Unknown error';
    // Provide more helpful error messages
    if (errorMsg.includes('Load failed') || errorMsg.includes('Failed to fetch') || errorMsg.includes('NetworkError')) {
      errorMsg = 'Network error. This might be a CORS issue. Check your Replicate API token and try again. If the problem persists, the Replicate API may not support browser requests from this domain.';
    }
    console.error('Alt text generation error:', error);
    showStatus(document.getElementById('status-message'), `Error generating alt text: ${errorMsg}`, 'error');
  } finally {
    btn.disabled = false;
    btn.textContent = 'Generate Alt Text';
  }
}

async function generateGalleryAltText(file, index) {
  const altTextInput = document.querySelector(`input.image-alt-text[data-image-index="${index}"]`);
  const btn = document.querySelector(`button.generate-alt-btn[data-image-index="${index}"]`);

  if (!altTextInput || !btn) return;

  btn.disabled = true;
  btn.textContent = 'Generating...';

  try {
    const altText = await generateAltText(file);
    altTextInput.value = altText;
  } catch (error) {
    showStatus(document.getElementById('status-message'), `Error generating alt text for image ${index + 1}: ${error.message}`, 'error');
  } finally {
    btn.disabled = false;
    btn.textContent = 'Generate';
  }
}

async function generateAltText(imageFile) {
  // Get Replicate API token from localStorage
  const replicateToken = localStorage.getItem(REPLICATE_TOKEN_STORAGE_KEY);
  if (!replicateToken) {
    throw new Error('Replicate API token not found. Please save it in the token management section above.');
  }

  const token = replicateToken.trim();
  const headers = {
    'Authorization': `Token ${token}`
  };

  // Replicate API doesn't support CORS for file uploads from browser
  // So we'll use base64 encoding directly (which works from browser)
  console.log('Converting image to base64...');
  const arrayBuffer = await imageFile.arrayBuffer();
  const bytes = new Uint8Array(arrayBuffer);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  const base64 = btoa(binary);
  // Determine MIME type
  const mimeType = imageFile.type || 'image/jpeg';
  const imageUrl = `data:${mimeType};base64,${base64}`;

  // Get latest model version
  let version;
  try {
    const modelResponse = await fetch('https://api.replicate.com/v1/models/salesforce/blip', {
      headers: headers
    });

    if (modelResponse.ok) {
      const modelData = await modelResponse.json();
      version = modelData.latest_version?.id;
    } else {
      console.warn('Failed to get model version, using fallback');
    }
  } catch (error) {
    console.warn('Error fetching model version, using fallback:', error);
  }
  
  // Fallback to known working version
  if (!version) {
    version = '2e1dddc8621f72155f24cf2e0adbde548458d3cab9f00c0139eea840d0ac4746';
  }

  // Create prediction with BLIP model
  let predictionResponse;
  try {
    predictionResponse = await fetch(`${REPLICATE_API_BASE}/predictions`, {
      method: 'POST',
      headers: {
        ...headers,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        version: version,
        input: {
          image: imageUrl,
          task: 'image_captioning'
        }
      })
    });
  } catch (error) {
    throw new Error(`Network error: ${error.message}. Check your internet connection and Replicate API token.`);
  }

  if (!predictionResponse.ok) {
    let errorMessage = `HTTP ${predictionResponse.status}: `;
    try {
      const errorData = await predictionResponse.json();
      errorMessage += errorData.detail || errorData.message || predictionResponse.statusText;
    } catch (e) {
      errorMessage += predictionResponse.statusText;
    }
    throw new Error(`Failed to create prediction: ${errorMessage}`);
  }

  const prediction = await predictionResponse.json();
  const predictionId = prediction.id;

  // Poll for completion (max 60 seconds)
  let result = prediction;
  let attempts = 0;
  const maxAttempts = 30;

  while ((result.status === 'starting' || result.status === 'processing') && attempts < maxAttempts) {
    await new Promise(resolve => setTimeout(resolve, 2000));
    attempts++;
    
    let statusResponse;
    try {
      statusResponse = await fetch(`${REPLICATE_API_BASE}/predictions/${predictionId}`, {
        headers: headers
      });
    } catch (error) {
      throw new Error(`Network error while checking status: ${error.message}`);
    }
    
    if (!statusResponse.ok) {
      throw new Error(`Failed to check prediction status: HTTP ${statusResponse.status} ${statusResponse.statusText}`);
    }
    
    result = await statusResponse.json();
  }

  if (result.status === 'succeeded' && result.output) {
    // Clean up the output (remove "Caption: " prefix if present)
    let altText = String(result.output).trim();
    if (altText.startsWith('Caption: ')) {
      altText = altText.substring(9).trim();
    } else if (altText.startsWith('caption: ')) {
      altText = altText.substring(9).trim();
    }
    return altText;
  } else if (result.status === 'failed') {
    throw new Error(`Prediction failed: ${result.error || 'Unknown error'}`);
  } else {
    throw new Error(`Prediction timed out or returned unexpected status: ${result.status}`);
  }
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
    const altText = document.getElementById('single-alt-text').value.trim();
    const caption = document.getElementById('single-caption').value.trim();

    if (!fileInput.files || !fileInput.files[0] || !altText) {
      throw new Error('Please select an image and provide alt text');
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
alt_text: "${altText.replace(/"/g, '\\"')}"
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
      const altTextInput = document.querySelector(`input.image-alt-text[data-image-index="${i}"]`);
      const captionInput = document.querySelector(`input.image-caption[data-image-index="${i}"]`);
      
      const altText = altTextInput ? altTextInput.value.trim() : '';
      const caption = captionInput ? captionInput.value.trim() : '';

      if (!altText) {
        throw new Error(`Please provide alt text for image ${i + 1}`);
      }

      const imagePath = `assets/images/image posts/${sanitizeFilename(file.name)}`;
      imagesToUpload.push({ file: file, path: imagePath });

      images.push({
        url: `/${imagePath}`,
        alt_text: altText.replace(/"/g, '\\"'),
        ...(caption && { caption: caption.replace(/"/g, '\\"') })
      });
    }

    // Format images array for YAML
    const imagesYaml = images.map(img => {
      let yaml = `  - url: "${img.url}"\n    alt_text: "${img.alt_text}"`;
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

