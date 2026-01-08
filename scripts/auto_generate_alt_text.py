#!/usr/bin/env python3
"""
Automatically generate alt-text for images in photo posts that are missing alt-text.

This script:
1. Scans all photo posts in _posts/
2. Finds images without alt-text (or with placeholder text)
3. Generates alt-text using Replicate's BLIP model
4. Updates the post files

Can be run manually or via GitHub Actions.

Usage:
    python scripts/auto_generate_alt_text.py [--dry-run] [--post <post_path>]
    
Options:
    --dry-run    Don't modify files, just show what would be changed
    --post       Only process a specific post file
"""

import os
import sys
import re
import argparse
from pathlib import Path

# Import the alt-text generation function from the existing script
# We'll add it to the path so we can import it
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from generate_alt_text import generate_alt_text, update_post_file


def is_placeholder_alt_text(alt_text):
    """
    Check if alt-text is a placeholder or less than 2-3 sentences that should be regenerated.
    All images should have at least 2-3 sentences describing the image comprehensively.
    
    Args:
        alt_text: The alt-text string to check
        
    Returns:
        bool: True if the alt-text appears to be a placeholder or is less than 2 sentences
    """
    if not alt_text or alt_text.strip() == '':
        return True
    
    alt_text = alt_text.strip()
    alt_lower = alt_text.lower()
    
    # Check for explicit placeholder keywords
    placeholder_keywords = ['placeholder', 'tbd', 'todo', 'description', 'alt text', 'image', 'photo', 'picture']
    if alt_lower in placeholder_keywords:
        return True
    
    # Count sentences (ending with . ! ?)
    sentence_endings = ['.', '!', '?']
    sentence_count = sum(1 for char in alt_text if char in sentence_endings)
    
    # If it's very short (less than 20 characters), regenerate
    if len(alt_text) < 20:
        return True
    
    # If it has less than 2 sentences, regenerate (we want 2-3 sentences)
    if sentence_count < 2:
        return True
    
    # Check for patterns like "Bear #2", "Image 1", "Photo 3", etc.
    if re.match(r'^[a-z]+\s*#?\d+$', alt_lower):
        return True
    
    # Check for very short alt-text (2 words or less) - these are likely placeholders
    words = alt_text.split()
    if len(words) <= 2:
        return True
    
    return False


def find_photo_posts(posts_dir='_posts', specific_post=None):
    """
    Find all photo posts that need alt-text generation.
    
    Returns:
        list: List of tuples (post_path, images_needing_alt_text)
    """
    posts_dir = Path(posts_dir)
    if not posts_dir.exists():
        print(f"❌ Posts directory not found: {posts_dir}")
        return []
    
    posts_to_process = []
    
    # Get list of post files to check
    if specific_post:
        post_files = [Path(specific_post)]
    else:
        post_files = list(posts_dir.glob('*.md'))
    
    for post_file in post_files:
        if not post_file.exists():
            continue
            
        with open(post_file, 'r') as f:
            content = f.read()
        
        # Check if it's a photo post
        if 'layout: photo' not in content:
            continue
        
        images_needing_alt = []
        
        # Check for gallery mode (images array)
        if 'images:' in content:
            # Parse images array
            images_pattern = r'images:\s*\n((?:\s+-\s+url:.*\n(?:\s+alt_text:.*\n)?(?:\s+caption:.*\n)?)+)'
            match = re.search(images_pattern, content, re.MULTILINE)
            
            if match:
                images_block = match.group(1)
                # Find each image entry
                image_entries = re.finditer(
                    r'-\s+url:\s*["\']([^"\']+)["\']\s*\n(?:\s+alt_text:\s*["\']([^"\']*)["\']\s*\n)?(?:\s+caption:.*\n)?',
                    images_block,
                    re.MULTILINE
                )
                
                for img_match in image_entries:
                    image_url = img_match.group(1)
                    alt_text = img_match.group(2) if img_match.group(2) else None
                    
                    # Check if alt-text is missing or is a placeholder
                    if is_placeholder_alt_text(alt_text):
                        # Convert URL to file path
                        if image_url.startswith('/'):
                            image_url = image_url[1:]  # Remove leading slash
                        image_path = Path(image_url)
                        if image_path.exists():
                            images_needing_alt.append({
                                'url': image_url,
                                'path': str(image_path),
                                'filename': image_path.name,
                                'current_alt': alt_text  # Store current alt for logging
                            })
        
        # Check for single image mode
        else:
            image_match = re.search(r'image:\s*["\']([^"\']+)["\']', content)
            if image_match:
                image_url = image_match.group(1)
                alt_text_match = re.search(r'alt_text:\s*["\']([^"\']*)["\']', content)
                alt_text = alt_text_match.group(1) if alt_text_match else None
                
                # Check if alt-text is missing or is a placeholder
                if is_placeholder_alt_text(alt_text):
                    # Convert URL to file path
                    if image_url.startswith('/'):
                        image_url = image_url[1:]  # Remove leading slash
                    image_path = Path(image_url)
                    if image_path.exists():
                        images_needing_alt.append({
                            'url': image_url,
                            'path': str(image_path),
                            'filename': image_path.name,
                            'current_alt': alt_text  # Store current alt for logging
                        })
        
        if images_needing_alt:
            posts_to_process.append((str(post_file), images_needing_alt))
    
    return posts_to_process


def process_posts(dry_run=False, specific_post=None):
    """
    Process all photo posts and generate missing alt-text.
    """
    posts_to_process = find_photo_posts(specific_post=specific_post)
    
    if not posts_to_process:
        print("✅ No photo posts found that need alt-text generation.")
        return 0
    
    print(f"📋 Found {len(posts_to_process)} photo post(s) needing alt-text generation:\n")
    
    total_images = sum(len(images) for _, images in posts_to_process)
    print(f"   Total images to process: {total_images}\n")
    
    if dry_run:
        print("🔍 DRY RUN MODE - No files will be modified\n")
    
    processed_count = 0
    error_count = 0
    
    for post_path, images in posts_to_process:
        print(f"📄 Processing: {post_path}")
        print(f"   Images needing alt-text: {len(images)}")
        
        for img_info in images:
            current_alt = img_info.get('current_alt', '')
            alt_status = f" (current: '{current_alt}')" if current_alt else " (missing)"
            print(f"\n   🖼️  Processing: {img_info['filename']}{alt_status}")
            
            if dry_run:
                print(f"      [DRY RUN] Would generate alt-text for {img_info['path']}")
                if current_alt:
                    print(f"      [DRY RUN] Would replace placeholder alt-text: '{current_alt}'")
                print(f"      [DRY RUN] Would update {post_path}")
                continue
            
            try:
                # Generate alt-text
                alt_text = generate_alt_text(img_info['path'])
                print(f"      ✅ Generated: {alt_text}")
                
                # Update post file
                update_post_file(post_path, alt_text, image_path=img_info['path'])
                print(f"      ✅ Updated post file")
                
                processed_count += 1
                
            except Exception as e:
                print(f"      ❌ Error: {e}")
                error_count += 1
        
        print()
    
    print(f"\n📊 Summary:")
    print(f"   ✅ Successfully processed: {processed_count} image(s)")
    if error_count > 0:
        print(f"   ❌ Errors: {error_count} image(s)")
    
    return 0 if error_count == 0 else 1


def main():
    parser = argparse.ArgumentParser(
        description='Automatically generate alt-text for images in photo posts',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Check what would be processed (dry run)
  python scripts/auto_generate_alt_text.py --dry-run
  
  # Process all posts
  python scripts/auto_generate_alt_text.py
  
  # Process a specific post
  python scripts/auto_generate_alt_text.py --post "_posts/2025-11-20-Photo-Post.md"
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

