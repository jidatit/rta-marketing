const { logAsync } = require("../../utils/logger");

/**
 * Scraper for CarGurus.com
 * Handles dynamic loading and extracts comprehensive vehicle data
 */
const scrapeCarGurus = async (page, baseUrl) => {
  const result = { cars: [], total: 0, serverError: null };

  const delay = (ms) => new Promise((r) => setTimeout(r, ms));

  try {
    await logAsync("info", "Navigating to CarGurus search page...", {
      baseUrl,
    });

    // Load page with extended timeout for CarGurus
    await page.goto(baseUrl, {
      waitUntil: "domcontentloaded",
      timeout: 60_000,
    });

    try {
      await page.waitForNetworkIdle({ idleTime: 1500, timeout: 60_000 });
    } catch {}

    await logAsync("info", "Waiting for CarGurus listings to load...", {
      url: page.url(),
    });

    // Wait for listing tiles to appear
    await page
      .waitForFunction(
        () => {
          const tiles = document.querySelectorAll(
            '[data-testid="srp-listing-tile"]'
          );
          return tiles.length > 0;
        },
        { timeout: 60_000, polling: 1000 }
      )
      .catch(() => {});

    await logAsync(
      "info",
      "Initial listings detected, confirming DOM readiness..."
    );
    await delay(3000);

    const hasListings = await page.evaluate(() => {
      return (
        document.querySelectorAll('[data-testid="srp-listing-tile"]').length > 0
      );
    });

    if (!hasListings) {
      await logAsync("warn", "No listings detected — waiting longer...");
      await delay(5000);
    }

    // -------------------------------------------------
    // Scroll to load all listings (lazy loading)
    // -------------------------------------------------
    await logAsync(
      "info",
      "Scrolling through listings to load all vehicles..."
    );
    await page.evaluate(async () => {
      const delay = (ms) => new Promise((r) => setTimeout(r, ms));
      let lastCount = 0;
      let retries = 0;
      const maxRetries = 10;

      while (retries < maxRetries) {
        window.scrollTo(0, document.body.scrollHeight);
        await delay(2500);

        const currentCount = document.querySelectorAll(
          '[data-testid="srp-listing-tile"]'
        ).length;
        if (currentCount === lastCount) {
          retries++;
        } else {
          retries = 0;
          lastCount = currentCount;
        }
      }

      // Scroll back to top
      window.scrollTo(0, 0);
      await delay(2000);
    });

    // -------------------------------------------------
    // Extract vehicle data
    // -------------------------------------------------
    const cars = await page.evaluate(() => {
      const out = [];
      const tiles = document.querySelectorAll(
        '[data-testid="srp-listing-tile"]'
      );

      tiles.forEach((tile) => {
        try {
          // Basic info from title
          const titleEl = tile.querySelector(
            '[data-cg-ft="srp-listing-blade-title"]'
          );
          const title = titleEl?.textContent.trim() || "";

          // Trim/Package info
          const trimEl = tile.querySelector('[data-cg-ft="vehicle"]');
          const trim =
            trimEl?.getAttribute("title") || trimEl?.textContent.trim() || "";

          // Mileage
          const mileageEl = tile.querySelector(
            '[data-testid="srp-tile-mileage"]'
          );
          const mileage = mileageEl?.textContent.trim() || "";

          // Price
          const priceEl = tile.querySelector('[data-testid="srp-tile-price"]');
          const price = priceEl?.textContent.trim() || "";

          // Monthly payment
          const monthlyEl = tile.querySelector("._monthlyPayment_1n8r8_7 span");
          const monthlyPayment = monthlyEl?.textContent.trim() || "";

          // Deal rating
          const dealRatingEl = tile.querySelector(
            '[data-testid="srp-tile-deal-rating"] ._7TM2f'
          );
          const dealRating = dealRatingEl?.textContent.trim() || "";

          // Location
          const locationFirstLine =
            tile
              .querySelector('[data-testid="LocationSection-firstLine"] span')
              ?.textContent.trim() || "";
          const locationSecondLine =
            tile
              .querySelector('[data-testid="LocationSection-secondLine"] span')
              ?.textContent.trim() || "";
          const location =
            locationFirstLine +
            (locationSecondLine ? ` (${locationSecondLine})` : "");

          // Image
          const imageEl = tile.querySelector(
            '[data-cg-ft="srp-listing-blade-image"]'
          );
          const image = imageEl?.src || "";

          // Link
          const linkEl = tile.querySelector('[data-testid="car-blade-link"]');
          const link = linkEl?.href || "";

          // Phone number
          const phoneEl = tile.querySelector(
            '[data-testid="button-phone-number"]'
          );
          const phone =
            phoneEl?.getAttribute("title") || phoneEl?.textContent.trim() || "";

          // Extract detailed properties from dl list
          const propsList = tile.querySelector("._propertiesList_7inth_1");
          const properties = {};

          if (propsList) {
            const dts = propsList.querySelectorAll("dt");
            const dds = propsList.querySelectorAll("dd");

            dts.forEach((dt, idx) => {
              const key = dt.textContent.replace(":", "").trim().toLowerCase();
              const value = dds[idx]?.textContent.trim() || "";
              properties[key] = value;
            });
          }

          // Sponsored status
          const sponsoredEl = tile.querySelector(
            '[data-testid="sponsored-text"]'
          );
          const isSponsored =
            sponsoredEl && sponsoredEl.textContent.includes("Sponsored");
          const dealer =
            sponsoredEl?.querySelector("em")?.textContent.trim() || "";

          out.push({
            title,
            year: properties.year || "",
            make: properties.make || "",
            model: properties.model || "",
            trim,
            bodyType: properties["body type"] || "",
            drivetrain: properties.drivetrain || "",
            engine: properties.engine || "",
            transmission: properties.transmission || "",
            fuelType: properties["fuel type"] || "",
            exteriorColor: properties["exterior color"] || "",
            interiorColor: properties["interior color"] || "",
            mpg: properties["combined gas mileage"] || "",
            mileage,
            price,
            monthlyPayment,
            dealRating,
            stock: properties["stock #"] || "",
            vin: properties.vin || "",
            location,
            phone,
            dealer,
            isSponsored,
            link,
            image,
          });
        } catch (err) {
          console.error("Error parsing tile:", err);
        }
      });

      return out;
    });

    // -------------------------------------------------
    // Extract total count (if available)
    // -------------------------------------------------
    const totalCount = await page.evaluate(() => {
      // CarGurus doesn't always show a clear total count
      // We'll use the actual scraped count
      return document.querySelectorAll('[data-testid="srp-listing-tile"]')
        .length;
    });

    result.cars = cars;
    result.total = totalCount || cars.length;

    await logAsync("success", "CarGurus scraping complete", {
      totalCars: result.total,
    });

    return result;
  } catch (err) {
    result.serverError = err.message;
    await logAsync("error", "CarGurus scraper failed", {
      error: err.message,
    });
    return result;
  }
};

module.exports = { scrapeCarGurus };
