#!/usr/bin/env python3
"""Regenerate all hero images using Nano Banana (Gemini 2.5 Flash Image)."""

import os
import sys
import json
import time
import io
from pathlib import Path
from slugify import slugify

sys.path.insert(0, str(Path(__file__).parent))
from prompts import IMAGE_PROMPT

PROJECT_ROOT = Path(__file__).parent.parent
IMAGES_DIR = PROJECT_ROOT / "src" / "images"
SCRIPTS_DIR = Path(__file__).parent

def main():
    from google import genai
    from google.genai import types
    from PIL import Image as PILImage

    client = genai.Client(api_key=os.environ["GEMINI_API_KEY"])

    with open(SCRIPTS_DIR / "topics.json") as f:
        topics = json.load(f)

    total = len(topics)
    for i, entry in enumerate(topics, 1):
        slug = slugify(entry["keyword"])
        image_filename = f"{slug}.webp"
        image_scene = entry.get("image_scene", entry["topic"])
        prompt = IMAGE_PROMPT.format(image_scene=image_scene)

        print(f"\n[{i}/{total}] Generating: {image_filename}")
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
                    print(f"  Saved: {image_filename}")
                    break
            else:
                print(f"  Warning: No image in response")

        except Exception as e:
            print(f"  ERROR: {e}")

        # Small delay between requests
        if i < total:
            time.sleep(3)

    print(f"\nDone! Regenerated {total} images.")

if __name__ == "__main__":
    main()
