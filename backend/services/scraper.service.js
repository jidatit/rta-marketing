// services/scraper.service.js
const puppeteer = require("puppeteer");
const { scrapeAutoTrader } = require("./scrapers/autotrader.scraper");
// const { scrapeHumberview } = require("../scrapers/humberview.scraper");
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
      ],
    });
  }
  return browser;
};

const scrapeSite = async (url, siteName) => {
  const page = await browser.newPage();
  await page.setUserAgent(
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
  );

  try {
    await page.goto(url, { waitUntil: "networkidle2", timeout: 60000 });

    let result;
    if (siteName === "AutoTrader") {
      result = await scrapeAutoTrader(page, url);
    } else if (siteName === "HumberviewVW") {
      // result = await scrapeHumberview(page);
    }

    return result; // Always return { cars, total, serverError }
  } catch (err) {
    logAsync("error", `${siteName} page failed`, { url, error: err.message });
    return {
      cars: [],
      total: 0,
      serverError: "Failed to load page: " + err.message,
    };
  } finally {
    await page.close();
  }
};

module.exports = { getBrowser, scrapeSite };
