// scrapers/autotrader.scraper.js
const { logAsync } = require("../../utils/logger");

const scrapeAutoTrader = async (page, baseUrl) => {
  const result = { cars: [], total: 0, serverError: null };

  try {
    await logAsync("info", "Scraping AutoTrader (DOM version)", {
      url: page.url(),
    });

    // -------------------------------------------------
    // 1. Wait for at least one card (same as before)
    // -------------------------------------------------
    await page
      .waitForSelector(".result-item.enhanced", { timeout: 30_000 })
      .catch(() => {});

    // -------------------------------------------------
    // 2. DOM extraction + retry loop (unchanged)
    // -------------------------------------------------
    const cars = await page.evaluate((baseUrl) => {
      const out = [];

      let attempts = 0;
      const maxAttempts = 4;

      while (attempts < maxAttempts) {
        const cards = document.querySelectorAll(".result-item.enhanced");
        if (cards.length) {
          cards.forEach((card) => {
            const adId =
              card.querySelector("[data-adid]")?.dataset.adid ?? null;
            const title =
              card
                .querySelector(".result-title, .title-with-trim")
                ?.innerText.trim() ?? "";
            const price =
              card.querySelector(".price-amount")?.innerText.trim() ?? "";
            const img = card.querySelector(".main-photo img")?.src ?? "";

            const rawLink =
              Array.from(card.querySelectorAll("a.inner-link"))
                .map((a) => a.getAttribute("href"))
                .find((h) => h?.includes("/a/")) ?? "";

            const fullLink = rawLink ? new URL(rawLink, baseUrl).href : "";

            const proximity = Array.from(
              card.querySelectorAll(".proximity-text")
            )
              .map((t) => t.innerText.trim())
              .filter(Boolean)
              .join(" ");

            const odometer =
              card.querySelector(".odometer-proximity")?.innerText.trim() ?? "";
            const dealer =
              card.querySelector(".seller-name")?.innerText.trim() ?? "";

            const yearMatch = title.match(/^\d{4}/);
            const year = yearMatch ? +yearMatch[0] : null;
            const isUsed = year && year < new Date().getFullYear();

            out.push({
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
          break;
        }

        // sync delay inside page context
        const syncDelay = (ms) => {
          const start = Date.now();
          while (Date.now() - start < ms) {}
        };
        syncDelay(800);
        attempts++;
      }
      return out;
    }, baseUrl);

    // -------------------------------------------------
    // 3. FINAL ZERO-CHECK: Only if title says "0"
    // -------------------------------------------------
    const titleCount = await page.evaluate(() => {
      const el = document.querySelector("#titleCount");
      return el ? el.textContent.trim() : null;
    });

    if (titleCount === "0") {
      await logAsync("info", "Zero results confirmed via title count", {
        url: page.url(),
      });
      return { cars: [], total: 0, serverError: null };
    }

    // -------------------------------------------------
    // 4. Return scraped data
    // -------------------------------------------------
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
