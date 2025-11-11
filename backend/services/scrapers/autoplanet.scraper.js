const { logAsync } = require("../../utils/logger");

/**
 * Optimized Scraper for AutoPlanet.ca
 * Faster loading with minimal waits
 */
const scrapeAutoPlanet = async (page, baseUrl) => {
  const result = { cars: [], total: 0, serverError: null };

  const delay = (ms) => new Promise((r) => setTimeout(r, ms));

  try {
    await logAsync("info", "Navigating to AutoPlanet search page...", {
      baseUrl,
    });

    // Load page with networkidle2 (faster than networkidle0)
    await page.goto(baseUrl, {
      waitUntil: "networkidle2",
      timeout: 30_000,
    });

    await logAsync("info", "Waiting for vehicle cards...", {
      url: page.url(),
    });

    // Wait for vehicle cards to appear (more direct check)
    await page
      .waitForSelector(".vehicle-card", {
        timeout: 20_000,
      })
      .catch(async () => {
        // Fallback: check if there's a "no results" message
        const noResults = await page.$(".no-results, .empty-state");
        if (noResults) {
          await logAsync("warn", "No vehicles found on page");
          return result;
        }
      });

    // Quick check if we have initial vehicles
    const initialCount = await page.evaluate(
      () => document.querySelectorAll(".vehicle-card").length
    );

    await logAsync(
      "info",
      `Initial cards loaded: ${initialCount}. Loading remaining...`
    );

    // -------------------------------------------------
    // Optimized lazy loading - faster scrolling
    // -------------------------------------------------
    await page.evaluate(async () => {
      const delay = (ms) => new Promise((r) => setTimeout(r, ms));
      let lastCount = 0;
      let noChangeCount = 0;

      // Faster scroll loop with reduced delays
      while (noChangeCount < 3) {
        // Reduced from 10 to 3 retries
        window.scrollBy(0, window.innerHeight * 2); // Scroll 2 viewports at once
        await delay(800); // Reduced from 2500ms to 800ms

        const currentCount = document.querySelectorAll(".vehicle-card").length;
        if (currentCount === lastCount) {
          noChangeCount++;
        } else {
          noChangeCount = 0;
          lastCount = currentCount;
        }
      }
    });

    await logAsync("info", "All vehicles loaded, extracting data...");

    // -------------------------------------------------
    // Extract car data (no changes needed here)
    // -------------------------------------------------
    const cars = await page.evaluate(() => {
      const out = [];
      const cards = document.querySelectorAll(".vehicle-card");

      cards.forEach((card) => {
        const title =
          card.querySelector(".vehicle-card__title")?.innerText.trim() || "";
        const price =
          card
            .querySelector('[convertus-data-id="srp__dealer-price"]')
            ?.innerText.trim() || "";
        const link =
          card.querySelector("a.vehicle-card__image-link")?.href || "";
        const image = card.querySelector(".vehicle-card__image")?.src || "";
        const stock =
          card
            .querySelector(".vehicle-card__stock")
            ?.innerText.replace("Stock #:", "")
            .trim() || "";
        const location =
          card
            .querySelector(".vehicle-card__location")
            ?.innerText.replace("This vehicle is located in", "")
            .trim() || "";
        const odometer =
          card
            .querySelector('[data-spec="odometer"] .detailed-specs__value')
            ?.innerText.trim() || "";
        const year = card.dataset.vehicleYear || "";
        const make = card.dataset.vehicleMake || "";
        const model = card.dataset.vehicleModel || "";
        const trim = card.dataset.vehicleTrim || "";
        const colour = card.dataset.vehicleColour || "";
        const vin = card.dataset.vehicleVin || "";
        const carfaxVin = card.querySelector(".carfax a p")?.dataset.vin || "";
        const finance =
          card
            .querySelector(".price-block__single--finance .df.aifs")
            ?.innerText.trim() || "";
        const financeTerm =
          card.querySelector(".price-block__sub")?.innerText.trim() || "";

        out.push({
          title,
          year,
          make,
          model,
          trim,
          colour,
          vin,
          stock,
          price,
          finance,
          financeTerm,
          odometer,
          location,
          link,
          image,
          carfax: carfaxVin,
        });
      });

      return out;
    });

    // -------------------------------------------------
    // Extract total count
    // -------------------------------------------------
    const totalCount = await page.evaluate(() => {
      const el = document.querySelector(".inventory-listing__header-count");
      if (!el) return 0;
      const match = el.innerText.match(/\d+/);
      return match ? parseInt(match[0], 10) : 0;
    });

    result.cars = cars;
    result.total = totalCount || cars.length;

    await logAsync("success", "AutoPlanet scraping complete", {
      totalCars: result.total,
      carsScraped: cars.length,
    });

    return result;
  } catch (err) {
    result.serverError = err.message;
    await logAsync("error", "AutoPlanet scraper failed", {
      error: err.message,
    });
    return result;
  }
};

module.exports = { scrapeAutoPlanet };
