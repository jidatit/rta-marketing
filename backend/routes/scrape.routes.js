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
