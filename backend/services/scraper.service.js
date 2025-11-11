// services/scraper.service.js
const puppeteer = require("puppeteer");
const { scrapeAutoTrader } = require("./scrapers/autotrader.scraper");
const { scrapeHumberview } = require("./scrapers/humberview.scraper");

const { logAsync } = require("../utils/logger");
const { scrapeAutoPlanet } = require("./scrapers/autoplanet.scraper");
const { scrapeCarGurus } = require("./scrapers/carguru.scraper");

let browser = null;
let sharedPage = null; // <- reused across calls

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
      ],
    });

    // One page that lives for the whole process
    sharedPage = await browser.newPage();
    await sharedPage.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
    );
    await sharedPage.setViewport({ width: 1920, height: 1080 });
  }
  return { browser, page: sharedPage };
};

const scrapeSite = async (url, siteName) => {
  const { page } = await getBrowser();

  try {
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60_000 });

    let result;
    if (siteName === "AutoTrader") {
      result = await scrapeAutoTrader(page, url);
    } else if (siteName === "HumberviewVW") {
      // <-- NEW
      result = await scrapeHumberview(page, url);
    } else if (siteName === "AutoPlanet") {
      // <-- NEW
      result = await scrapeAutoPlanet(page, url);
    } else if (siteName === "CarGurus") {
      result = await scrapeCarGurus(page, url);
    }
    // future sites … just add here

    return result; // { cars, total, serverError }
  } catch (err) {
    await logAsync("error", `${siteName} page failed`, {
      url,
      error: err.message,
    });
    return {
      cars: [],
      total: 0,
      serverError: "Failed to load page: " + err.message,
    };
  }
  // NOTE: page is **not** closed – it is reused
};

process.on("exit", async () => {
  if (browser) await browser.close();
});

module.exports = { getBrowser, scrapeSite };
