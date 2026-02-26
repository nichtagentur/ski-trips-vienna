export default function(eleventyConfig) {
  eleventyConfig.addPassthroughCopy("src/css");
  eleventyConfig.addPassthroughCopy("src/images");
  eleventyConfig.addPassthroughCopy("src/js");

  // Date filters
  eleventyConfig.addFilter("readableDate", (dateObj) => {
    const d = new Date(dateObj);
    return d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  });

  eleventyConfig.addFilter("htmlDateString", (dateObj) => {
    const d = new Date(dateObj);
    return d.toISOString().split("T")[0];
  });

  // Excerpt for meta descriptions
  eleventyConfig.addFilter("excerpt", (content) => {
    if (!content) return "";
    const text = content.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
    return text.substring(0, 155) + (text.length > 155 ? "..." : "");
  });

  // Limit filter
  eleventyConfig.addFilter("limit", (arr, count) => arr.slice(0, count));

  // Related posts by shared tags
  eleventyConfig.addFilter("relatedPosts", (collection, currentTags, currentUrl) => {
    if (!currentTags) return [];
    return collection
      .filter(p => p.url !== currentUrl && p.data.tags)
      .map(p => {
        const shared = p.data.tags.filter(t => currentTags.includes(t) && t !== "posts");
        return { post: p, score: shared.length };
      })
      .filter(r => r.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map(r => r.post);
  });

  // Post collection sorted by date
  eleventyConfig.addCollection("posts", (collectionApi) => {
    return collectionApi.getFilteredByTag("posts").sort((a, b) => b.date - a.date);
  });

  // All unique tags (excluding internal ones)
  eleventyConfig.addCollection("tagList", (collectionApi) => {
    const tags = new Set();
    collectionApi.getAll().forEach(item => {
      (item.data.tags || []).forEach(tag => {
        if (tag !== "posts" && tag !== "all") tags.add(tag);
      });
    });
    return [...tags].sort();
  });

  return {
    dir: { input: "src", output: "_site", includes: "_includes", data: "_data" },
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk"
  };
}
