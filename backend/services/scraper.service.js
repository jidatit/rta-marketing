// services/scraper.service.js
const puppeteer = require("puppeteer");
const { scrapeAutoTrader } = require("./scrapers/autotrader.scraper");
const { scrapeHumberview } = require("./scrapers/humberview.scraper");
const { scrapeAutoPlanet } = require("./scrapers/autoplanet.scraper");
const { scrapeCarGurus } = require("./scrapers/carguru.scraper");
const { logAsync } = require("../utils/logger");

let browser = null;

const getBrowser = async () => {
  if (!browser) {
    browser = await puppeteer.launch({
      headless: false,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-gpu",
        "--disable-features=IsolateOrigins,site-per-process",
        "--disable-web-security", // Helps with some sites
      ],
    });

    await logAsync("info", "Browser launched successfully");
  }
  return browser;
};

const scrapeSite = async (url, siteName) => {
  const browser = await getBrowser();

  // ✅ CRITICAL FIX: Create a NEW page for each scraper
  const page = await browser.newPage();

  try {
    await logAsync("info", `${siteName}: Creating new page and navigating...`, {
      url,
    });

    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    );
    await page.setViewport({ width: 1920, height: 1080 });

    // Navigate with better error handling
    try {
      await page.goto(url, {
        waitUntil: "domcontentloaded",
        timeout: 60_000,
      });
      await logAsync("debug", `${siteName}: Page loaded successfully`);
    } catch (navError) {
      await logAsync("error", `${siteName}: Navigation failed`, {
        error: navError.message,
        url,
      });
      throw new Error(`Navigation failed: ${navError.message}`);
    }

    let result;

    if (siteName === "AutoTrader") {
      result = await scrapeAutoTrader(page, url);
    } else if (siteName === "HumberviewVW") {
      result = await scrapeHumberview(page, url);
    } else if (siteName === "AutoPlanet") {
      result = await scrapeAutoPlanet(page, url);
    } else if (siteName === "CarGurus") {
      result = await scrapeCarGurus(page, url);
    } else {
      throw new Error(`Unknown site: ${siteName}`);
    }

    await logAsync("success", `${siteName}: Scraping completed`, {
      carsFound: result.total,
      hasError: !!result.serverError,
    });

    return result; // { cars, total, serverError }
  } catch (err) {
    await logAsync("error", `${siteName}: Scraper failed`, {
      url,
      error: err.message,
      stack: err.stack,
    });

    // Try to take screenshot for debugging
    try {
      await page.screenshot({
        path: `ERROR-${siteName}-${Date.now()}.png`,
        fullPage: true,
      });
    } catch (screenshotErr) {
      await logAsync("warn", `${siteName}: Could not take screenshot`);
    }

    return {
      cars: [],
      total: 0,
      serverError: err.message,
    };
  } finally {
    // ✅ IMPORTANT: Close the page after scraping to free up resources
    try {
      await page.close();
      await logAsync("debug", `${siteName}: Page closed`);
    } catch (closeErr) {
      await logAsync("warn", `${siteName}: Error closing page`, {
        error: closeErr.message,
      });
    }
  }
};

// Graceful shutdown
process.on("SIGINT", async () => {
  await logAsync("info", "Shutting down browser...");
  if (browser) {
    await browser.close();
  }
  process.exit(0);
});

process.on("exit", async () => {
  if (browser) {
    await browser.close();
  }
});

module.exports = { getBrowser, scrapeSite };
