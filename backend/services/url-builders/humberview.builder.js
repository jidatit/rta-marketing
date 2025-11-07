// services/url-builders/humberview.builder.js
const siteConfig = require("../../config/sites/humberview");

/**
 * Build Humberview VW inventory URL from filters.
 * Only supports: make, model, year (single), maxPrice, keyword.
 */
const buildUrl = (filters) => {
  const {
    make,
    model,
    year, // ← single year only (e.g. 2025)
    maxPrice,
    keyword,
    // Ignored: yearMin, yearMax, minPrice, postal, radius
  } = filters;

  // --- Build path ---
  let path = "/en/group-all-inventory";

  if (make) {
    path += `/${encodeURIComponent(make.toLowerCase())}`;
  }
  if (model) {
    path += `/${encodeURIComponent(model.toLowerCase().replace(/\s+/g, "-"))}`;
  }

  // --- Build query params ---
  const params = new URLSearchParams();

  if (year != null) {
    params.append("year", year.toString());
  }
  if (maxPrice != null) {
    params.append("maxPrice", maxPrice.toString());
  }
  if (keyword) {
    params.append("text", keyword);
  }

  // Always ask for max results
  params.append("perPage", "100");

  const query = params.toString();
  return `${siteConfig.baseUrl}${path}${query ? `?${query}` : ""}`;
};

module.exports = { buildUrl };
