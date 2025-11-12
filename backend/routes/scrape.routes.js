const express = require("express");
const { buildUrls } = require("../services/url-builder.service");
const { scrapeSite } = require("../services/scraper.service");
const { logAsync } = require("../utils/logger");

const router = express.Router();

router.post("/run", async (req, res) => {
  const filters = req.body;
  const start = Date.now();

  try {
    const urls = buildUrls(filters);

    const sitesToScrape = Object.keys(urls).filter((key) => urls[key]);

    await logAsync("info", "🚀 Starting parallel scraping", {
      sites: sitesToScrape,
      filters,
      urls,
    });

    // Create scraping promises for all sites
    const scrapePromises = [];

    if (urls.autotrader) {
      scrapePromises.push(
        scrapeSite(urls.autotrader, "AutoTrader")
          .then((result) => ({ site: "autotrader", result }))
          .catch((error) => {
            logAsync("error", "AutoTrader promise rejected", {
              error: error.message,
            });
            return {
              site: "autotrader",
              result: { cars: [], total: 0, serverError: error.message },
            };
          })
      );
    }

    if (urls.humberview) {
      scrapePromises.push(
        scrapeSite(urls.humberview, "HumberviewVW")
          .then((result) => ({ site: "humberview", result }))
          .catch((error) => {
            logAsync("error", "HumberviewVW promise rejected", {
              error: error.message,
            });
            return {
              site: "humberview",
              result: { cars: [], total: 0, serverError: error.message },
            };
          })
      );
    }

    if (urls.autoplanet) {
      scrapePromises.push(
        scrapeSite(urls.autoplanet, "AutoPlanet")
          .then((result) => ({ site: "autoplanet", result }))
          .catch((error) => {
            logAsync("error", "AutoPlanet promise rejected", {
              error: error.message,
            });
            return {
              site: "autoplanet",
              result: { cars: [], total: 0, serverError: error.message },
            };
          })
      );
    }

    const scrapeResults = await Promise.all(scrapePromises);

    // Convert array results back to object format
    const results = {};
    scrapeResults.forEach(({ site, result }) => {
      results[site] = result;
    });

    const duration = Date.now() - start;
    const totalCars = Object.values(results).reduce(
      (sum, r) => sum + r.total,
      0
    );
    const summary = Object.entries(results).map(([site, data]) => ({
      site,
      cars: data.total,
      error: data.serverError || null,
    }));

    await logAsync("success", "✅ All scrapers completed", {
      filters,
      duration: `${(duration / 1000).toFixed(2)}s`,
      sites: Object.keys(results),
      totalCars,
      summary,
    });

    res.json({
      success: true,
      results,
      urls,
      filters,
      duration: `${(duration / 1000).toFixed(2)}s`,
      totalCars,
      summary,
    });
  } catch (error) {
    await logAsync("error", "❌ Scrape job failed", {
      error: error.message,
      stack: error.stack,
      filters,
    });

    res.status(500).json({
      success: false,
      error: error.message,
      filters,
    });
  }
});

module.exports = router;
