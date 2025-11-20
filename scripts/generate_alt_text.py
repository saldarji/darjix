#!/usr/bin/env python3
"""
Generate Alt Text for Images using Replicate's BLIP Model

This script uses Salesforce's BLIP model to automatically generate
descriptive alt-text for images, which can be used in photo posts.

The BLIP model is available at: https://replicate.com/salesforce/blip/api

Usage:
    python scripts/generate_alt_text.py <image_path> [--update-post <post_path>]
    
Example:
    python scripts/generate_alt_text.py "assets/images/image posts/IMG_4346.jpeg"
    python scripts/generate_alt_text.py "assets/images/image posts/IMG_4346.jpeg" --update-post "_posts/2025-11-18-Photo-Post.md"

Requirements:
    - REPLICATE_API_TOKEN environment variable must be set
    - Get your token at: https://replicate.com/account/api-tokens
"""

import os
import sys
import re
import argparse
import requests
import json
import time
from pathlib import Path

# Load environment variables from .env file if it exists
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass  # dotenv not installed, use environment variables directly


def generate_alt_text(image_path):
    """
    Generate alt-text for an image using Replicate's BLIP model.
    
    Args:
        image_path: Path to the image file
        
    Returns:
        str: Generated alt-text description
    """
    # Check if image exists
    if not os.path.exists(image_path):
        raise FileNotFoundError(f"Image not found: {image_path}")
    
    # Check for Replicate API token
    api_token = os.environ.get('REPLICATE_API_TOKEN')
    if not api_token:
        raise ValueError(
            "REPLICATE_API_TOKEN environment variable not set. "
            "Get your token at: https://replicate.com/account/api-tokens"
        )
    
    print(f"🖼️  Processing image: {image_path}")
    
    try:
        # Use Replicate REST API directly
        # API docs: https://replicate.com/docs/api
        api_token = os.environ.get('REPLICATE_API_TOKEN')
        api_url = "https://api.replicate.com/v1/predictions"
        
        print("   📤 Uploading image to Replicate...")
        
        # Upload the image file to Replicate's file service
        headers = {
            "Authorization": f"Token {api_token}",
        }
        
        # Read the image file
        with open(image_path, 'rb') as f:
            file_data = f.read()
        
        # Upload file - Replicate API expects the file in the 'file' field
        files = {
            'file': (os.path.basename(image_path), file_data, 'image/jpeg')
        }
        
        # Don't set Content-Type header - requests will set it with boundary for multipart
        upload_headers = {k: v for k, v in headers.items() if k != 'Content-Type'}
        upload_response = requests.post(
            "https://api.replicate.com/v1/files",
            headers=upload_headers,
            files=files
        )
        
        if upload_response.status_code == 201:
            uploaded_file_url = upload_response.json()['urls']['get']
            print("   ✅ Image uploaded successfully")
        else:
            # Try alternative: use data URL or base64
            print(f"   ⚠️  Upload failed ({upload_response.status_code}), trying alternative method...")
            import base64
            with open(image_path, 'rb') as f:
                image_data = base64.b64encode(f.read()).decode('utf-8')
            uploaded_file_url = f"data:image/jpeg;base64,{image_data}"
            print("   ✅ Using base64 encoded image")
        
        # Now create a prediction using BLIP model
        # Try salesforce/blip model
        print("   🔄 Creating prediction with salesforce/blip model...")
        
        # Get the latest version of the model
        model_response = requests.get(
            "https://api.replicate.com/v1/models/salesforce/blip",
            headers=headers
        )
        
        if model_response.status_code == 200:
            model_data = model_response.json()
            latest_version = model_data.get("latest_version", {}).get("id")
            if latest_version:
                print(f"   ✅ Found model version: {latest_version}")
                
                # Create prediction
                prediction_data = {
                    "version": latest_version,
                    "input": {
                        "image": uploaded_file_url,
                        "task": "image_captioning"
                    }
                }
                
                response = requests.post(
                    api_url,
                    headers={**headers, "Content-Type": "application/json"},
                    data=json.dumps(prediction_data)
                )
                
                if response.status_code == 201:
                    prediction = response.json()
                    prediction_id = prediction["id"]
                    print(f"   ✅ Prediction created: {prediction_id}")
                else:
                    raise RuntimeError(f"Failed to create prediction: {response.status_code} - {response.text}")
            else:
                raise RuntimeError("Could not find latest version for salesforce/blip model")
        else:
            raise RuntimeError(f"Failed to get model info: {model_response.status_code} - {model_response.text}")
        
        # Poll for prediction completion
        print("   ⏳ Waiting for prediction to complete...")
        max_attempts = 30
        attempt = 0
        
        while attempt < max_attempts:
            response = requests.get(
                f"{api_url}/{prediction_id}",
                headers=headers
            )
            response.raise_for_status()
            prediction = response.json()
            
            status = prediction["status"]
            
            if status == "succeeded":
                output = prediction.get("output", "")
                alt_text = str(output).strip()
                # Remove "Caption: " prefix if present
                if alt_text.startswith("Caption: "):
                    alt_text = alt_text[9:].strip()
                elif alt_text.startswith("caption: "):
                    alt_text = alt_text[9:].strip()
                print(f"   ✅ Generated alt-text: {alt_text}")
                return alt_text
            elif status == "failed":
                error = prediction.get("error", "Unknown error")
                raise RuntimeError(f"Prediction failed: {error}")
            elif status in ["starting", "processing"]:
                attempt += 1
                if attempt % 3 == 0:  # Print status every 3 attempts
                    print(f"   ⏳ Status: {status}... ({attempt * 2}s)")
                time.sleep(2)
            else:
                raise RuntimeError(f"Unexpected status: {status}")
        
        raise RuntimeError(f"Prediction timed out after {max_attempts * 2} seconds")
            
    except Exception as e:
        error_msg = str(e)
        print(f"   ❌ Error generating alt-text: {e}")
        
        # Provide helpful error messages
        if "404" in error_msg or "not found" in error_msg.lower():
            print("\n   💡 Troubleshooting:")
            print("      - The model identifier might be incorrect")
            print("      - Check https://replicate.com/salesforce/blip/api for the correct model name")
            print("      - You may need to use a specific version hash")
            print("      - Example: 'salesforce/blip:VERSION_HASH'")
        elif "401" in error_msg or "unauthorized" in error_msg.lower():
            print("\n   💡 Troubleshooting:")
            print("      - Check that REPLICATE_API_TOKEN is set correctly")
            print("      - Get your token at: https://replicate.com/account/api-tokens")
        
        raise


def update_post_file(post_path, alt_text):
    """
    Update the alt_text field in a photo post markdown file.
    
    Args:
        post_path: Path to the post markdown file
        alt_text: The alt-text to insert
    """
    if not os.path.exists(post_path):
        raise FileNotFoundError(f"Post file not found: {post_path}")
    
    print(f"📝 Updating post file: {post_path}")
    
    # Read the file
    with open(post_path, 'r') as f:
        content = f.read()
    
    # Check if it's a photo post
    if 'layout: photo' not in content:
        print("   ⚠️  Warning: This doesn't appear to be a photo post (missing 'layout: photo')")
    
    # Update alt_text field
    # Pattern: alt_text: "..." or alt_text: '...'
    pattern = r'alt_text:\s*["\']([^"\']*)["\']'
    
    if re.search(pattern, content):
        # Replace existing alt_text
        new_content = re.sub(
            pattern,
            f'alt_text: "{alt_text}"',
            content
        )
        print(f"   ✅ Updated existing alt_text field")
    else:
        # Add alt_text field after image field
        image_pattern = r'(image:\s*["\'][^"\']*["\'])'
        if re.search(image_pattern, content):
            new_content = re.sub(
                image_pattern,
                f'\\1\nalt_text: "{alt_text}"',
                content
            )
            print(f"   ✅ Added new alt_text field")
        else:
            # Add after title or date
            title_pattern = r'(title:\s*["\'][^"\']*["\'])'
            if re.search(title_pattern, content):
                new_content = re.sub(
                    title_pattern,
                    f'\\1\nalt_text: "{alt_text}"',
                    content
                )
                print(f"   ✅ Added alt_text field after title")
            else:
                # Just add it at the end of front matter
                front_matter_end = content.find('---', content.find('---') + 3)
                if front_matter_end != -1:
                    new_content = content[:front_matter_end] + f'alt_text: "{alt_text}"\n' + content[front_matter_end:]
                    print(f"   ✅ Added alt_text field to front matter")
                else:
                    raise ValueError("Could not find front matter in post file")
    
    # Write the updated content
    with open(post_path, 'w') as f:
        f.write(new_content)
    
    print(f"   ✅ Post file updated successfully")


def main():
    parser = argparse.ArgumentParser(
        description='Generate alt-text for images using Replicate BLIP model',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Generate alt-text only
  python scripts/generate_alt_text.py "assets/images/image posts/IMG_4346.jpeg"
  
  # Generate alt-text and update a post file
  python scripts/generate_alt_text.py "assets/images/image posts/IMG_4346.jpeg" \\
      --update-post "_posts/2025-11-18-Photo-Post.md"
        """
    )
    
    parser.add_argument(
        'image_path',
        help='Path to the image file'
    )
    
    parser.add_argument(
        '--update-post',
        dest='post_path',
        help='Path to photo post markdown file to update with generated alt-text'
    )
    
    args = parser.parse_args()
    
    try:
        # Generate alt-text
        alt_text = generate_alt_text(args.image_path)
        
        # Print the result
        print(f"\n📋 Generated Alt-Text:")
        print(f"   {alt_text}\n")
        
        # Update post file if requested
        if args.post_path:
            update_post_file(args.post_path, alt_text)
            print(f"\n✅ Done! Alt-text has been added to the post file.")
        else:
            print(f"💡 Tip: Use --update-post to automatically update a photo post file")
            print(f"   Example: --update-post '_posts/2025-11-18-Photo-Post.md'")
        
        return 0
        
    except Exception as e:
        print(f"\n❌ Error: {e}", file=sys.stderr)
        return 1


if __name__ == '__main__':
    sys.exit(main())

