// routes/scrape.routes.js
const express = require("express");
const { buildUrls } = require("../services/url-builder.service");
const { getBrowser, scrapeSite } = require("../services/scraper.service");
const { logAsync } = require("../utils/logger");

const router = express.Router();

router.post("/run", async (req, res) => {
  const filters = req.body;
  const start = Date.now();

  await getBrowser();
  const urls = buildUrls(filters);

  const results = {};

  if (urls.autotrader) {
    results.autotrader = await scrapeSite(urls.autotrader, "AutoTrader");
  }
  if (urls.humberview) {
    results.humberview = await scrapeSite(urls.humberview, "HumberviewVW"); // <-- NEW
  }
  if (urls.autoplanet) {
    results.autoplanet = await scrapeSite(urls.autoplanet, "AutoPlanet"); // <-- NEW
  }
  if (urls.carguru) {
    results.carguru = await scrapeSite(urls.carguru, "");
  }
  logAsync("info", "Scrape job completed", {
    filters,
    duration: Date.now() - start,
    sites: Object.keys(results),
  });

  res.json({
    results,
    urls,
    filters,
  });
});

module.exports = router;
