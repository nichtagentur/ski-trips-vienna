#!/usr/bin/env python3
"""Generate a single SEO-optimized ski blog article with hero image."""

import os
import sys
import json
from datetime import datetime
from pathlib import Path
from slugify import slugify
import httpx

# Add scripts dir to path for imports
sys.path.insert(0, str(Path(__file__).parent))
from prompts import ARTICLE_PROMPT, IMAGE_PROMPT, TODAY

# Project paths
PROJECT_ROOT = Path(__file__).parent.parent
POSTS_DIR = PROJECT_ROOT / "src" / "posts"
IMAGES_DIR = PROJECT_ROOT / "src" / "images"
DATA_DIR = PROJECT_ROOT / "src" / "_data"


def load_resort_data():
    """Load resort data for factual accuracy in articles."""
    with open(DATA_DIR / "resorts.json") as f:
        return json.load(f)


def generate_article_content(topic, keyword, image_filename, resort_data):
    """Call Claude via OpenRouter to write the article."""
    resort_text = json.dumps(resort_data, indent=2)
    prompt = ARTICLE_PROMPT.format(
        topic=topic,
        keyword=keyword,
        image_filename=image_filename,
        resort_data=resort_text,
        today=TODAY,
    )

    print("  Calling Claude (via OpenRouter) to write article...")
    response = httpx.post(
        "https://openrouter.ai/api/v1/chat/completions",
        headers={"Authorization": f"Bearer {os.environ['OPENROUTER_API_KEY']}"},
        json={
            "model": "anthropic/claude-sonnet-4",
            "max_tokens": 4096,
            "messages": [{"role": "user", "content": prompt}],
        },
        timeout=120,
    )
    response.raise_for_status()
    data = response.json()
    return data["choices"][0]["message"]["content"]


def generate_hero_image(image_scene, image_filename):
    """Call Nano Banana (Gemini 2.5 Flash Image) to generate a hero image."""
    from google import genai
    from google.genai import types
    from PIL import Image as PILImage
    import io

    client = genai.Client(api_key=os.environ["GEMINI_API_KEY"])
    prompt = IMAGE_PROMPT.format(image_scene=image_scene)

    print("  Calling Nano Banana (Gemini 2.5 Flash) to generate hero image...")
    try:
        response = client.models.generate_content(
            model="gemini-2.5-flash-image",
            contents=prompt,
            config=types.GenerateContentConfig(
                response_modalities=["IMAGE"],
            ),
        )

        for part in response.candidates[0].content.parts:
            if hasattr(part, "inline_data") and part.inline_data and part.inline_data.mime_type.startswith("image/"):
                pil_img = PILImage.open(io.BytesIO(part.inline_data.data))
                pil_img.save(IMAGES_DIR / image_filename, "WEBP", quality=82)
                print(f"  Hero image saved: {image_filename}")
                return True

        print("  Warning: No image in response")
    except Exception as e:
        print(f"  Image generation failed: {e}")

    # Fallback: create a styled placeholder
    try:
        from PIL import ImageDraw

        img = PILImage.new("RGB", (1200, 675), color=(26, 26, 46))
        draw = ImageDraw.Draw(img)
        points_bg = [(0, 675), (0, 350), (200, 250), (400, 300), (600, 200), (800, 280), (1000, 180), (1200, 300), (1200, 675)]
        draw.polygon(points_bg, fill=(45, 80, 22))
        points_fg = [(0, 675), (0, 450), (150, 380), (350, 420), (500, 350), (700, 400), (900, 320), (1100, 380), (1200, 400), (1200, 675)]
        draw.polygon(points_fg, fill=(196, 168, 130))
        draw.text((400, 280), "Vienna Ski Weekends", fill=(250, 250, 250))
        img.save(IMAGES_DIR / image_filename, "WEBP", quality=85)
        print(f"  Placeholder image saved: {image_filename}")
        return True
    except Exception as e2:
        print(f"  Placeholder creation failed: {e2}")
        return False


def main():
    if len(sys.argv) < 3:
        print("Usage: python3 generate_article.py <topic> <keyword> [image_scene]")
        sys.exit(1)

    topic = sys.argv[1]
    keyword = sys.argv[2]
    image_scene = sys.argv[3] if len(sys.argv) > 3 else topic

    slug = slugify(keyword)
    image_filename = f"{slug}.webp"
    post_filename = f"{slug}.md"

    print(f"\nGenerating: {topic}")
    print(f"  Keyword: {keyword}")
    print(f"  Slug: {slug}")

    resort_data = load_resort_data()

    # Generate article text
    article = generate_article_content(topic, keyword, image_filename, resort_data)

    # Generate hero image
    generate_hero_image(image_scene, image_filename)

    # Save article
    post_path = POSTS_DIR / post_filename
    post_path.write_text(article)
    print(f"  Article saved: src/posts/{post_filename}")
    print(f"  Done!\n")


if __name__ == "__main__":
    main()
