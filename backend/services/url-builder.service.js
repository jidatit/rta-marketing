// services/url-builder.service.js
const autotraderBuilder = require("./url-builders/autotrader.builder");
const humberviewBuilder = require("./url-builders/humberview.builder");

const buildUrls = (filters) => ({
  // autotrader: autotraderBuilder.buildUrl(filters),
  humberview: humberviewBuilder.buildUrl(filters),
});
module.exports = { buildUrls };
