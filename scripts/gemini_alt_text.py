#!/usr/bin/env python3
"""
Script to add alt text to all images using Google's Gemini API directly.

Features:
    - Generates descriptive alt text (max 300 characters) optimized for accessibility
    - Rate limited to 5 requests per minute (free tier limit)
    - Processes images directly without temporary file creation

Usage:
    python scripts/gemini_alt_text.py [--dry-run] [--post <post_path>]
    
Options:
    --dry-run    Don't modify files, just show what would be changed
    --post       Only process a specific post file

Requirements:
    - GEMINI_API_KEY environment variable must be set
    - google-genai package: pip install google-genai

Rate Limiting:
    The script automatically handles rate limiting (5 requests/minute) to comply
    with Google's Gemini API free tier limits. If processing more than 5 images,
    the script will automatically wait between batches.
"""

import os
import sys
import re
import argparse
import base64
import time
from pathlib import Path

# Load environment variables from .env file if it exists
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

# Try to import Google Gemini API
try:
    from google import genai
    from google.genai import types
    GEMINI_AVAILABLE = True
except ImportError:
    GEMINI_AVAILABLE = False



def generate_alt_text_gemini(image_path):
    """
    Generate alt-text for an image using Google's Gemini API directly.
    
    Args:
        image_path: Path to the image file
        
    Returns:
        str: Generated alt-text description (max 300 characters)
    """
    if not os.path.exists(image_path):
        raise FileNotFoundError(f"Image not found: {image_path}")
    
    if not GEMINI_AVAILABLE:
        raise RuntimeError(
            "google-genai package is not installed.\n"
            "Install it with: pip install google-genai"
        )
    
    api_key = os.environ.get('GEMINI_API_KEY')
    if not api_key:
        raise ValueError(
            "GEMINI_API_KEY environment variable not set. "
            "Get your API key at: https://ai.google.dev/"
        )
    
    print(f"🖼️  Processing image: {image_path}")
    
    try:
        # Read and encode image as base64 directly
        print("   📤 Encoding image...")
        with open(image_path, 'rb') as image_file:
            image_data = image_file.read()
        
        if len(image_data) == 0:
            raise RuntimeError(f"Image file is empty: {image_path}")
        
        base64_image = base64.b64encode(image_data).decode('utf-8')
        
        # Determine MIME type from file extension
        ext = os.path.splitext(image_path)[1].lower()
        mime_types = {
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.png': 'image/png',
            '.gif': 'image/gif',
            '.webp': 'image/webp'
        }
        mime_type = mime_types.get(ext, 'image/jpeg')
        
        # Initialize Gemini client
        client = genai.Client(api_key=api_key)
        
        # Create prompt for descriptive but concise alt text (max 300 chars)
        prompt = (
            "Describe this image in detail for people who cannot see it. "
            "Be descriptive and interesting, focusing on the main subject, setting, colors, "
            "composition, mood, and notable details. Write a clear, engaging description "
            "that helps someone visualize the scene. Keep it under 300 characters. "
            "Write only the description, no prefix or label."
        )
        
        print("   🔄 Generating alt-text with Gemini 2.5 Flash...")
        
        # Create the content with image and prompt
        # Use dictionary format which is more reliable
        contents = [
            {
                "role": "user",
                "parts": [
                    {"text": prompt},
                    {
                        "inline_data": {
                            "mime_type": mime_type,
                            "data": base64_image
                        }
                    }
                ]
            }
        ]
        
        # Generate content
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=contents
        )
        
        # Extract text from response
        if not response.candidates or not response.candidates[0].content.parts:
            raise RuntimeError("No response from Gemini API")
        
        alt_text = ""
        for part in response.candidates[0].content.parts:
            if part.text:
                alt_text += part.text
        
        if not alt_text:
            raise RuntimeError("Empty response from Gemini API")
        
        # Clean up the response
        alt_text = alt_text.strip()
        
        # Remove common prefixes
        prefixes = [
            "Caption: ", "caption: ", "Alt-text: ", "alt-text: ", 
            "Description: ", "description: ", "Alt text: ", "alt text: ",
            "This image shows ", "This image depicts ", "The image shows "
        ]
        for prefix in prefixes:
            if alt_text.lower().startswith(prefix.lower()):
                alt_text = alt_text[len(prefix):].strip()
        
        # Remove markdown formatting
        alt_text = re.sub(r'\*\*([^*]+)\*\*', r'\1', alt_text)
        alt_text = re.sub(r'---+\s*', '', alt_text)
        
        # Clean up whitespace
        alt_text = re.sub(r'\n+', ' ', alt_text)
        alt_text = re.sub(r'\s+', ' ', alt_text).strip()
        
        # Truncate to 300 characters if needed (at word boundary)
        if len(alt_text) > 300:
            truncated = alt_text[:300].rsplit(' ', 1)[0]
            if len(truncated) > 250:  # Only truncate if we got a reasonable length
                alt_text = truncated + "..."
            else:
                alt_text = alt_text[:297] + "..."
        
        char_count = len(alt_text)
        sentence_count = len([c for c in alt_text if c in '.!?'])
        
        print(f"   ✅ Generated alt-text ({char_count} chars, {sentence_count} sentence(s))")
        print(f"   Preview: {alt_text[:100]}...")
        
        return alt_text
            
    except Exception as e:
        print(f"   ❌ Error generating alt-text: {e}")
        raise


def update_post_file(post_path, alt_text, image_path=None):
    """
    Update the alt_text field in a photo post markdown file.
    Supports both single image and gallery modes.
    """
    if not os.path.exists(post_path):
        raise FileNotFoundError(f"Post file not found: {post_path}")
    
    print(f"📝 Updating post file: {post_path}")
    
    with open(post_path, 'r') as f:
        content = f.read()
    
    if 'layout: photo' not in content:
        print("   ⚠️  Warning: This doesn't appear to be a photo post (missing 'layout: photo')")
    
    is_gallery = 'images:' in content
    
    if is_gallery and image_path:
        # Gallery mode - find the specific image by URL
        image_filename = os.path.basename(image_path)
        url_pattern = rf'(url:\s*["\'][^"\']*{re.escape(image_filename)}[^"\']*["\'])'
        
        lines = content.split('\n')
        new_lines = []
        i = 0
        updated = False
        
        while i < len(lines):
            line = lines[i]
            new_lines.append(line)
            
            if re.search(url_pattern, line) and not updated:
                j = i + 1
                found_alt = False
                while j < len(lines) and j < i + 5:
                    if re.match(r'^\s*alt_text:\s*', lines[j]):
                        new_lines.append(f'    alt_text: "{alt_text}"')
                        found_alt = True
                        updated = True
                        j += 1
                        break
                    elif re.match(r'^\s*(url|caption):\s*', lines[j]):
                        new_lines.append(f'    alt_text: "{alt_text}"')
                        found_alt = True
                        updated = True
                        break
                    j += 1
                
                if found_alt:
                    i = j
                    continue
                else:
                    new_lines.append(f'    alt_text: "{alt_text}"')
                    updated = True
            
            i += 1
        
        if updated:
            new_content = '\n'.join(new_lines)
            print(f"   ✅ Updated alt_text for image in gallery")
        else:
            # Fallback: update first alt_text
            pattern = r'(images:\s*\n(?:\s+- url:.*\n(?:\s+alt_text:.*\n)?(?:\s+caption:.*\n)?)+)'
            def replace_first_alt(match):
                content = match.group(1)
                return re.sub(r'(\s+alt_text:\s*["\'][^"\']*["\'])', f'    alt_text: "{alt_text}"', content, count=1)
            new_content = re.sub(pattern, replace_first_alt, content, flags=re.MULTILINE | re.DOTALL)
    else:
        # Single image mode
        pattern = r'alt_text:\s*["\']([^"\']*)["\']'
        
        if re.search(pattern, content):
            new_content = re.sub(
                pattern,
                f'alt_text: "{alt_text}"',
                content,
                count=1
            )
            print(f"   ✅ Updated existing alt_text field")
        else:
            image_pattern = r'(image:\s*["\'][^"\']*["\'])'
            if re.search(image_pattern, content):
                new_content = re.sub(
                    image_pattern,
                    f'\\1\nalt_text: "{alt_text}"',
                    content
                )
                print(f"   ✅ Added new alt_text field")
            else:
                raise ValueError("Could not find image field in post file")
    
    with open(post_path, 'w') as f:
        f.write(new_content)
    
    print(f"   ✅ Post file updated successfully")


def find_photo_posts(posts_dir='_posts', specific_post=None):
    """Find all photo posts that need alt-text generation."""
    posts_dir = Path(posts_dir)
    if not posts_dir.exists():
        print(f"❌ Posts directory not found: {posts_dir}")
        return []
    
    posts_to_process = []
    
    if specific_post:
        post_files = [Path(specific_post)]
    else:
        post_files = list(posts_dir.glob('*.md'))
    
    for post_file in post_files:
        if not post_file.exists():
            continue
            
        with open(post_file, 'r') as f:
            content = f.read()
        
        if 'layout: photo' not in content:
            continue
        
        images_needing_alt = []
        
        # Check for gallery mode
        if 'images:' in content:
            images_pattern = r'images:\s*\n((?:\s+-\s+url:.*\n(?:\s+alt_text:.*\n)?(?:\s+caption:.*\n)?)+)'
            match = re.search(images_pattern, content, re.MULTILINE)
            
            if match:
                images_block = match.group(1)
                image_entries = re.finditer(
                    r'-\s+url:\s*["\']([^"\']+)["\']\s*\n(?:\s+alt_text:\s*["\']([^"\']*)["\']\s*\n)?(?:\s+caption:.*\n)?',
                    images_block,
                    re.MULTILINE
                )
                
                for img_match in image_entries:
                    image_url = img_match.group(1)
                    alt_text = img_match.group(2) if img_match.group(2) else None
                    
                    # Process all images (or you could filter for missing ones)
                    if image_url.startswith('/'):
                        image_url = image_url[1:]
                    image_path = Path(image_url)
                    if image_path.exists():
                        images_needing_alt.append({
                            'url': image_url,
                            'path': str(image_path),
                            'filename': image_path.name,
                            'current_alt': alt_text
                        })
        
        # Check for single image mode
        else:
            image_match = re.search(r'image:\s*["\']([^"\']+)["\']', content)
            if image_match:
                image_url = image_match.group(1)
                alt_text_match = re.search(r'alt_text:\s*["\']([^"\']*)["\']', content)
                alt_text = alt_text_match.group(1) if alt_text_match else None
                
                if image_url.startswith('/'):
                    image_url = image_url[1:]
                image_path = Path(image_url)
                if image_path.exists():
                    images_needing_alt.append({
                        'url': image_url,
                        'path': str(image_path),
                        'filename': image_path.name,
                        'current_alt': alt_text
                    })
        
        if images_needing_alt:
            posts_to_process.append((str(post_file), images_needing_alt))
    
    return posts_to_process


def process_posts(dry_run=False, specific_post=None):
    """Process all photo posts and generate alt-text using Gemini with rate limiting."""
    posts_to_process = find_photo_posts(specific_post=specific_post)
    
    if not posts_to_process:
        print("✅ No photo posts found.")
        return 0
    
    print(f"📋 Found {len(posts_to_process)} photo post(s):\n")
    
    total_images = sum(len(images) for _, images in posts_to_process)
    print(f"   Total images to process: {total_images}\n")
    
    if dry_run:
        print("🔍 DRY RUN MODE - No files will be modified\n")
    
    # Rate limiting: 5 requests per minute (free tier limit)
    RATE_LIMIT_PER_MINUTE = 5
    request_times = []
    
    processed_count = 0
    error_count = 0
    
    for post_path, images in posts_to_process:
        print(f"📄 Processing: {post_path}")
        print(f"   Images: {len(images)}")
        
        for img_info in images:
            current_alt = img_info.get('current_alt', '')
            alt_status = f" (current: '{current_alt}')" if current_alt else " (missing)"
            print(f"\n   🖼️  Processing: {img_info['filename']}{alt_status}")
            
            if dry_run:
                print(f"      [DRY RUN] Would generate alt-text for {img_info['path']}")
                print(f"      [DRY RUN] Would update {post_path}")
                continue
            
            # Rate limiting: wait if we've made 5 requests in the last minute
            current_time = time.time()
            # Remove requests older than 1 minute
            request_times = [t for t in request_times if current_time - t < 60]
            
            if len(request_times) >= RATE_LIMIT_PER_MINUTE:
                wait_time = 60 - (current_time - request_times[0]) + 1
                print(f"   ⏳ Rate limit reached (5/min). Waiting {wait_time:.1f} seconds...")
                time.sleep(wait_time)
                # Update current time after waiting
                current_time = time.time()
                request_times = []
            
            try:
                alt_text = generate_alt_text_gemini(img_info['path'])
                print(f"      ✅ Generated: {alt_text}")
                
                # Record this request time
                request_times.append(time.time())
                
                update_post_file(post_path, alt_text, image_path=img_info['path'])
                print(f"      ✅ Updated post file")
                
                processed_count += 1
                
            except Exception as e:
                print(f"      ❌ Error: {e}")
                error_count += 1
                # Still record the request time even on error (rate limit applies to API calls)
                request_times.append(time.time())
        
        print()
    
    print(f"\n📊 Summary:")
    print(f"   ✅ Successfully processed: {processed_count} image(s)")
    if error_count > 0:
        print(f"   ❌ Errors: {error_count} image(s)")
    
    return 0 if error_count == 0 else 1


def main():
    parser = argparse.ArgumentParser(
        description='Generate alt-text for images using Google Gemini API directly',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Check what would be processed (dry run)
  python scripts/gemini_alt_text.py --dry-run
  
  # Process all posts
  python scripts/gemini_alt_text.py
  
  # Process a specific post
  python scripts/gemini_alt_text.py --post "_posts/2025-11-20-Photo-Post.md"
        """
    )
    
    parser.add_argument(
        '--dry-run',
        action='store_true',
        help='Show what would be changed without modifying files'
    )
    
    parser.add_argument(
        '--post',
        dest='specific_post',
        help='Only process a specific post file'
    )
    
    args = parser.parse_args()
    
    try:
        return process_posts(dry_run=args.dry_run, specific_post=args.specific_post)
    except KeyboardInterrupt:
        print("\n\n⚠️  Interrupted by user")
        return 1
    except Exception as e:
        print(f"\n❌ Error: {e}", file=sys.stderr)
        import traceback
        traceback.print_exc()
        return 1


if __name__ == '__main__':
    sys.exit(main())
