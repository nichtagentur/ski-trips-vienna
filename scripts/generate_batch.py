#!/usr/bin/env python3
"""Generate multiple blog articles from the topics list."""

import json
import time
import subprocess
import sys
from pathlib import Path

SCRIPTS_DIR = Path(__file__).parent
TOPICS_FILE = SCRIPTS_DIR / "topics.json"
GENERATE_SCRIPT = SCRIPTS_DIR / "generate_article.py"


def main():
    with open(TOPICS_FILE) as f:
        topics = json.load(f)

    total = len(topics)
    print(f"=== Generating {total} articles ===\n")

    successes = 0
    failures = []

    for i, item in enumerate(topics):
        print(f"--- Article {i + 1}/{total} ---")
        try:
            result = subprocess.run(
                [
                    sys.executable,
                    str(GENERATE_SCRIPT),
                    item["topic"],
                    item["keyword"],
                    item.get("image_scene", item["topic"]),
                ],
                check=True,
                capture_output=False,
            )
            successes += 1
        except subprocess.CalledProcessError as e:
            print(f"  FAILED: {e}")
            failures.append(item["topic"])

        # Rate limit buffer between articles
        if i < total - 1:
            wait = 10
            print(f"  Waiting {wait}s before next article...")
            time.sleep(wait)

    print(f"\n=== Results ===")
    print(f"  Successes: {successes}/{total}")
    if failures:
        print(f"  Failures: {len(failures)}")
        for f in failures:
            print(f"    - {f}")
    else:
        print(f"  All articles generated successfully!")
    print(f"\nNext steps:")
    print(f"  1. Preview: npm start")
    print(f"  2. Publish: bash scripts/publish.sh")


if __name__ == "__main__":
    main()
