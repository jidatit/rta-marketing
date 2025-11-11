// services/url-builder.service.js
const autotraderBuilder = require("./url-builders/autotrader.builder");
const humberviewBuilder = require("./url-builders/humberview.builder");
const autoPlanetBuilder = require("./url-builders/autoPlanet.builder");
const cargurusBuilder = require("./url-builders/cargurus.builder");
const buildUrls = (filters) => ({
  autotrader: autotraderBuilder.buildUrl(filters),
  autoplanet: autoPlanetBuilder.buildUrl(filters),
  humberview: humberviewBuilder.buildUrl(filters),
  // carguru: cargurusBuilder.buildUrl(filters),
});
module.exports = { buildUrls };
