module.exports = {
  globDirectory: "dist/",
  globPatterns: ["**/*.{js,css,html,svg}"],
  swDest: "dist/sw.js",
  ignoreURLParametersMatching: [/^utm_/, /^fbclid$/],
};
