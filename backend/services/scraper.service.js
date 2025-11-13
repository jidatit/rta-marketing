// services/scraper.service.js
const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
const { scrapeAutoTrader } = require("./scrapers/autotrader.scraper");
const { scrapeHumberview } = require("./scrapers/humberview.scraper");
const { scrapeAutoPlanet } = require("./scrapers/autoplanet.scraper");
const { scrapeCarGurus } = require("./scrapers/carguru.scraper");
const { logAsync } = require("../utils/logger");
const { scrapeYorkdaleVW } = require("./scrapers/scrapeyorkdale.scrapper");
puppeteer.use(StealthPlugin());
let browser = null;

const getBrowser = async () => {
  if (!browser) {
    browser = await puppeteer.launch({
      headless: false, // can test with 'new' later for performance
      defaultViewport: { width: 1920, height: 1080 },
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-gpu",
        "--disable-blink-features=AutomationControlled",
        "--disable-features=IsolateOrigins,site-per-process",
        "--disable-web-security",
        "--window-size=1920,1080",
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
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
        "(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    );
    await page.setExtraHTTPHeaders({
      "Accept-Language": "en-CA,en;q=0.9",
      "Upgrade-Insecure-Requests": "1",
    });

    await page.emulateTimezone("America/Toronto");

    // ✅ Pretend we are Brave or real Chrome
    await page.evaluateOnNewDocument(() => {
      Object.defineProperty(navigator, "webdriver", { get: () => false });
      Object.defineProperty(navigator, "platform", { get: () => "Win32" });
      Object.defineProperty(navigator, "languages", {
        get: () => ["en-CA", "en"],
      });
      Object.defineProperty(navigator, "permissions", {
        get: () => ({
          query: (parameters) =>
            parameters.name === "notifications"
              ? Promise.resolve({ state: "denied" })
              : Promise.resolve({ state: "granted" }),
        }),
      });
    });

    // Optional: also fake geolocation (if the site uses it)
    await page.setGeolocation({ latitude: 43.6532, longitude: -79.3832 }); // Toronto
    await page.setExtraHTTPHeaders({
      "Accept-Language": "en-CA,en;q=0.9",
    });

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
    } else if (siteName === "YorkdaleVW") {
      result = await scrapeYorkdaleVW(page, url);
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
