"""Prompt templates for AI content generation."""

from datetime import datetime

TODAY = datetime.now().strftime("%Y-%m-%d")

ARTICLE_PROMPT = """You are an experienced ski travel writer based in Vienna, Austria. Write an SEO-optimized blog post.

TOPIC: {topic}
TARGET KEYWORD: {keyword}
HERO IMAGE FILENAME: {image_filename}

Use this resort data for factual accuracy (prices, distances, slopes):
{resort_data}

FORMAT YOUR RESPONSE AS A COMPLETE MARKDOWN FILE starting with YAML frontmatter.

FRONTMATTER (between --- markers):
- title: compelling title, max 60 characters, include the main keyword naturally
- description: meta description, max 155 characters, make it click-worthy
- date: {today}
- tags: pick 2-4 from [family-skiing, budget, luxury, night-skiing, train-accessible, beginners, hidden-gems, day-trips, weekend-trips, ski-resorts, resort-reviews]
- heroImage: {image_filename}
- heroAlt: descriptive alt text for the hero image (for accessibility and SEO)
- faq: list of 3-5 question/answer pairs that people actually search for

CONTENT RULES:
1. Write 1800-2500 words in a warm, first-person voice as if you have personally visited these resorts
2. Open with a compelling personal anecdote or vivid scene-setting paragraph
3. Use H2 (##) for main sections and H3 (###) for subsections
4. Include at least one comparison table using Markdown table syntax
5. Add practical details: exact prices in euros, drive times, train connections
6. Include a "Getting There" section with transport options
7. Include a "What to Expect" or "What I Loved" section with personal observations
8. End with a clear recommendation and call to action
9. Write naturally -- avoid keyword stuffing but include the target keyword 3-5 times
10. Every sentence must add value. No filler, no generic travel writing cliches
11. Where relevant, suggest related articles using relative links like [article name](/slug/)
12. Include specific tips that only someone who has been there would know
13. Mention specific restaurants, lodges, or scenic spots by name where possible

EXAMPLE FRONTMATTER:
---
title: "Best Family Ski Resorts Near Vienna"
description: "Discover 5 family-friendly ski resorts within 2 hours of Vienna with kids programs, gentle slopes, and affordable day passes."
date: {today}
tags:
  - family-skiing
  - ski-resorts
  - day-trips
heroImage: family-ski-resorts-near-vienna.webp
heroAlt: "Family skiing together on a gentle slope in the Austrian Alps"
faq:
  - q: "What is the closest ski resort to Vienna?"
    a: "Hohe Wand Wiese is just 30 minutes from central Vienna, right within the city limits."
  - q: "Can you reach ski resorts from Vienna by train?"
    a: "Yes, several resorts like Semmering and Stuhleck are accessible via direct train from Wien Hauptbahnhof."
  - q: "How much does a day of skiing near Vienna cost?"
    a: "Day passes at resorts near Vienna range from 32 to 42 euros for adults and 16 to 21 euros for children."
---

Now write the complete article."""

IMAGE_PROMPT = """Generate a stunning, photorealistic hero image for a travel magazine article about skiing near Vienna, Austria.

The scene should show: {image_scene}

Style requirements:
- Editorial travel photography quality (National Geographic style)
- Rich, natural colors with warm golden or blue-hour lighting
- Wide 16:9 landscape composition
- Sense of scale and grandeur
- Inviting and aspirational atmosphere
- Sharp focus on the main subject with natural depth of field
"""
