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
  // Spam protection's browser half (§128, item 9) — served at /js/, and
  // referenced by that path from the-commission.njk. Two copies of these
  // files exist, one here and one in elena-blair-forms, because the two
  // sites share no build; they must stay byte-identical, and the field names
  // in them are the contract with netlify/functions/lib/spam-guard.js.
  eleventyConfig.addPassthroughCopy("src/js");

  return {
    dir: { input: "src", includes: "_includes", data: "_data", output: "_site" },
    htmlTemplateEngine: "njk",
    markdownTemplateEngine: "njk",
  };
};
