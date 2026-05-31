module.exports = function (eleventyConfig) {
  // Inject a Cloudinary transform between /upload/ and the /v.../ segment.
  // Store the PLAIN url Cloudinary gives you in projects.js; this builds every width.
  eleventyConfig.addFilter("cld", (url, width) =>
    url.replace("/upload/", `/upload/f_auto,q_auto,w_${width}/`)
  );

  // Static assets straight through (move eb.css + project.css into src/css/).
  eleventyConfig.addPassthroughCopy("src/css");
  // Anything in src/static/ lands at the site root (og-image.png, favicons, robots.txt...).
  eleventyConfig.addPassthroughCopy({ "src/static": "/" });

  return {
    dir: { input: "src", includes: "_includes", data: "_data", output: "_site" },
    htmlTemplateEngine: "njk",
    markdownTemplateEngine: "njk",
  };
};
