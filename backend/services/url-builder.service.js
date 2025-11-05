// services/url-builder.service.js
const autotrader = require("../config/sites/autotrader");
const humberview = require("../config/sites/humberview");

const buildUrls = (filters) => {
  const urls = {};

  // AutoTrader
  const at = autotrader;
  const slugs = at.getSlugs(filters.postal);
  const atPath = at.urlTemplate
    .replace("{make}", filters.make.toLowerCase())
    .replace("{model}", filters.model.toLowerCase())
    .replace("{year}", filters.year)
    .replace("{province}", slugs.province)
    .replace("{city}", slugs.city);
  urls.autotrader =
    at.baseUrl +
    atPath +
    at.queryParams
      .replace("{radius}", filters.radius || 100)
      .replace("{postal}", filters.postal)
      .replace("{minPrice}", filters.minPrice || 0)
      .replace("{maxPrice}", filters.maxPrice || 100000);

  // Humberview
  const hv = humberview;
  const hvPath = hv.urlTemplate
    .replace("{make}", filters.make.toLowerCase())
    .replace("{model}", filters.model.toLowerCase());
  urls.humberview =
    hv.baseUrl +
    hvPath +
    hv.queryParams
      .replace("{year}", filters.year)
      .replace("{maxPrice}", filters.maxPrice || 749990);

  return urls;
};

module.exports = { buildUrls };
