// services/scraper.service.js
const puppeteer = require("puppeteer");
const { logAsync } = require("../utils/logger");
const { delay } = require("../utils/delay");

let browser = null;

const getBrowser = async () => {
  if (!browser) {
    browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
  }
  return browser;
};

const scrapeSite = async (url, config, siteName) => {
  const start = Date.now();
  const page = await browser.newPage();
  await page.setUserAgent(
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
  );

  try {
    await page.goto(url, { waitUntil: "networkidle2", timeout: 30000 });
    await page.waitForSelector(config.selectors.item, { timeout: 10000 });

    const cars = await page.evaluate((sel) => {
      return Array.from(document.querySelectorAll(sel.item)).map((el) => ({
        title: el.querySelector(sel.title)?.innerText?.trim() || "",
        price: el.querySelector(sel.price)?.innerText?.trim() || "",
        year: el.querySelector(sel.year)?.innerText?.trim() || "",
        mileage: el.querySelector(sel.mileage)?.innerText?.trim() || "",
        link: el.querySelector(sel.link)?.getAttribute("href") || "",
      }));
    }, config.selectors);

    logAsync("info", `${siteName}: ${cars.length} cars scraped`, {
      url,
      duration: Date.now() - start,
      count: cars.length,
    });
    return cars;
  } catch (err) {
    logAsync("error", `${siteName} failed`, {
      url,
      error: err.message,
    });
    return { error: "Failed to load" };
  } finally {
    await page.close();
  }
};

module.exports = { getBrowser, scrapeSite };
