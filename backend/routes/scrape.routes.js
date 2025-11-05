// routes/scrape.routes.js
const express = require("express");
const { buildUrls } = require("../services/url-builder.service");
const { getBrowser, scrapeSite } = require("../services/scraper.service");
const autotraderConfig = require("../config/sites/autotrader");
const humberviewConfig = require("../config/sites/humberview");
const { logAsync } = require("../utils/logger");

const router = express.Router();

router.post("/run", async (req, res) => {
  const filters = req.body;
  const start = Date.now();

  await getBrowser();
  const urls = buildUrls(filters);

  const [atCars, hvCars] = await Promise.all([
    scrapeSite(urls.autotrader, autotraderConfig, "AutoTrader"),
    scrapeSite(urls.humberview, humberviewConfig, "HumberviewVW"),
  ]);

  logAsync("info", "Scrape job completed", {
    filters,
    totalDuration: Date.now() - start,
    autotrader: Array.isArray(atCars) ? atCars.length : 0,
    humberview: Array.isArray(hvCars) ? hvCars.length : 0,
  });

  res.json({ autotrader: atCars, humberview: hvCars, filters });
});

module.exports = router;
