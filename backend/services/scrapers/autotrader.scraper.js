// scrapers/autotrader.scraper.js
const { delay } = require("../../utils/delay");
const { logAsync } = require("../../utils/logger");

const scrapeAutoTrader = async (page, baseUrl) => {
  const result = {
    cars: [],
    total: 0,
    serverError: null,
  };

  try {
    await logAsync("info", "Scraping AutoTrader (DOM version)", {
      url: page.url(),
    });

    // === 1. Setup ===
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
    );
    await page.setViewport({ width: 1920, height: 1080 });

    // === 2. Load page ===
    await page.goto(page.url(), { waitUntil: "networkidle0", timeout: 60000 });

    // // === 3. Dismiss cookie banner ===
    // await page.evaluate(() => {
    //   const banner = document.getElementById("cookie-banner");
    //   if (banner) {
    //     const btn = banner.querySelector("button.close-button");
    //     if (btn) btn.click();
    //   }
    // });

    await delay(3000);

    // === 4. Execute DOM-based scraper ===
    const cars = await page.evaluate(async (baseUrl) => {
      const delay = (ms) => new Promise((r) => setTimeout(r, ms));
      const result = [];

      // --- Wait for car cards ---
      let retry = 0;
      const maxRetries = 6;

      while (retry < maxRetries) {
        const count = document.querySelectorAll(".result-item.enhanced").length;
        if (count > 0) {
          break;
        }
        await delay(1500);
        retry++;
      }

      // --- Select all main result cards ---
      const cards = document.querySelectorAll(".result-item.enhanced");

      cards.forEach((card) => {
        const adId = card.querySelector("[data-adid]")?.dataset.adid || null;
        const title =
          card
            .querySelector(".result-title, .title-with-trim")
            ?.innerText.trim() || "";
        const price =
          card.querySelector(".price-amount")?.innerText.trim() || "";
        const img = card.querySelector(".main-photo img")?.src || "";

        const rawLink =
          Array.from(card.querySelectorAll("a.inner-link"))
            .map((a) => a.getAttribute("href"))
            .find((href) => href && href.includes("/a/")) || "";

        const fullLink = rawLink ? new URL(rawLink, baseUrl).href : "";

        const proximity = Array.from(card.querySelectorAll(".proximity-text"))
          .map((t) => t.innerText.trim())
          .filter(Boolean)
          .join(" ");

        const odometer =
          card.querySelector(".odometer-proximity")?.innerText.trim() || "";

        const dealer =
          card.querySelector(".seller-name")?.innerText.trim() || "";

        const yearMatch = title.match(/^\d{4}/);
        const year = yearMatch ? +yearMatch[0] : null;
        const isUsed = year && year < new Date().getFullYear();

        result.push({
          adId,
          title,
          price,
          image: img,
          proximity,
          odometer,
          link: fullLink,
          dealer,
          isUsed,
        });
      });

      return result;
    }, baseUrl);

    result.cars = cars;
    result.total = cars.length;

    await logAsync("success", "AutoTrader scraping complete", {
      totalCars: result.total,
    });

    return result;
  } catch (err) {
    result.serverError = err.message;
    await logAsync("error", "AutoTrader scraper failed", {
      error: err.message,
    });
    return result;
  }
};

module.exports = { scrapeAutoTrader };
