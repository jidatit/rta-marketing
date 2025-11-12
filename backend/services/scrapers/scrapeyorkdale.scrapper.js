// services/scrapers/yorkdale.scraper.js
const { logAsync } = require("../../utils/logger");

// Helper function to wait
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const scrapeYorkdaleVW = async (page, baseUrl) => {
  const result = { cars: [], total: 0, serverError: null };

  try {
    await logAsync("info", "START: YorkdaleVW scraper", { url: page.url() });

    // -------------------------------------------------
    // 1. Wait for initial load
    // -------------------------------------------------
    try {
      await page.waitForSelector(".vlp-cards-base .cell.card", {
        timeout: 60_000,
      });
    } catch (e) {
      await logAsync("error", "Initial load timeout", { error: e.message });
      throw new Error("Initial load timeout – no cards found");
    }

    // Wait for content to stabilize
    await wait(5000);

    // -------------------------------------------------
    // 2. Check if we have results
    // -------------------------------------------------
    const initialCardCount = await page.evaluate(() => {
      return document.querySelectorAll(".vlp-cards-base .cell.card").length;
    });

    if (initialCardCount === 0) {
      await logAsync("info", "Zero results detected on first load");
      return { cars: [], total: 0, serverError: null };
    }

    await logAsync("info", `Initial cards found: ${initialCardCount}`);

    const allCars = [];
    let currentPage = 1;
    let previousCardCount = 0;
    let noNewCardsCount = 0;
    const MAX_NO_NEW_CARS = 3; // Stop if no new cars for 3 attempts
    const CARDS_PER_PAGE = 12; // Default cards per page

    // -------------------------------------------------
    // 3. Infinite scroll pagination loop
    // -------------------------------------------------
    while (true) {
      await logAsync("info", `Processing page ${currentPage}`);

      // Wait for cards to be visible
      try {
        await page.waitForSelector(".vlp-cards-base .cell.card", {
          timeout: 60_000,
        });
      } catch (e) {
        await logAsync("error", `No cards found on page ${currentPage}`, {
          error: e.message,
        });
        break;
      }

      // Wait for cards to have data attributes with retries
      let cardsReady = false;
      for (let attempt = 1; attempt <= 3; attempt++) {
        try {
          await page.waitForFunction(
            () => {
              const cards = document.querySelectorAll(
                ".vlp-cards-base .cell.card"
              );
              const cardsWithData = Array.from(cards).filter(
                (card) =>
                  card.dataset.inventoryitemid &&
                  card.dataset.inventoryitemid.trim() !== ""
              ).length;
              // Accept if at least 80% of cards have data
              return cards.length > 0 && cardsWithData >= cards.length * 0.8;
            },
            { timeout: 20_000, polling: 500 }
          );
          cardsReady = true;
          break;
        } catch (e) {
          if (attempt === 3) {
            await logAsync(
              "warn",
              `Page ${currentPage}: Card data not fully loaded after 3 attempts, continuing anyway`
            );
          } else {
            await logAsync(
              "debug",
              `Page ${currentPage}: Attempt ${attempt} - waiting for card data...`
            );
            await wait(3000);
          }
        }
      }

      // Additional wait for dynamic content
      await wait(3000);

      // Get current card count
      const currentCardCount = await page.evaluate(() => {
        return document.querySelectorAll(".vlp-cards-base .cell.card").length;
      });

      await logAsync(
        "info",
        `Current total cards on page: ${currentCardCount}`
      );

      // Check if we got new cards
      if (currentCardCount === previousCardCount) {
        noNewCardsCount++;
        await logAsync(
          "warn",
          `No new cards loaded (attempt ${noNewCardsCount}/${MAX_NO_NEW_CARS})`
        );

        if (noNewCardsCount >= MAX_NO_NEW_CARS) {
          await logAsync(
            "info",
            "No new cards after multiple attempts, stopping"
          );
          break;
        }
      } else {
        noNewCardsCount = 0; // Reset counter
      }

      // Extract cars from current page
      const carsOnPage = await page.evaluate((baseUrl) => {
        const results = [];
        const cards = document.querySelectorAll(".vlp-cards-base .cell.card");

        cards.forEach((card, index) => {
          try {
            // Get data attributes
            const inventoryId = card.dataset.inventoryitemid || "";
            const name = card.dataset.name || "";
            const price = card.dataset.price || "";
            const year = card.dataset.year || "";
            const make = card.dataset.make || "";
            const model = card.dataset.model || "";
            const trim = card.dataset.trim || "";
            const color = card.dataset.color || "";
            const transmission = card.dataset.transmission || "";
            const drivetrain = card.dataset.drivetrain || "";
            const engine = card.dataset.engine || "";
            const condition = card.dataset.condition || "";
            const vin = card.dataset.vin || "";
            const stockNumber = card.dataset.stocknumber || "";

            // Get mileage from the mileage tag
            const mileageEl = card.querySelector(".mileage-tag .body-2");
            const odometer = mileageEl ? mileageEl.textContent.trim() : "";

            // Get image
            const img = card.querySelector(".img-lazy-load");
            const image = img?.src || img?.dataset?.src || "";

            // Get link
            const linkEl = card.querySelector("a.img-lazy-load-container");
            const link = linkEl?.href ? new URL(linkEl.href, baseUrl).href : "";

            // Get price from pricing container if not in data attribute
            let finalPrice = price;
            if (!finalPrice) {
              const priceEl = card.querySelector(".price-info .value");
              finalPrice = priceEl ? priceEl.textContent.trim() : "";
            }

            // Only add if we have essential data
            if (inventoryId && name) {
              results.push({
                adId: inventoryId,
                title: name,
                price: finalPrice,
                image,
                odometer,
                link,
                dealer: "Yorkdale Volkswagen",
                isUsed: condition.toUpperCase() === "USED",
                proximity: "",
                color,
                transmission,
                drivetrain,
                engine,
                year,
                make,
                model,
                trim,
                vin,
                stockNumber,
              });
            }
          } catch (e) {
            console.warn(`Parse error on card ${index + 1}:`, e.message);
          }
        });

        return results;
      }, baseUrl);

      await logAsync(
        "info",
        `Extracted ${carsOnPage.length} cars from page ${currentPage}`
      );

      // Add only new cars (avoid duplicates)
      const existingIds = new Set(allCars.map((car) => car.adId));
      const newCars = carsOnPage.filter((car) => !existingIds.has(car.adId));

      allCars.push(...newCars);
      await logAsync(
        "info",
        `Added ${newCars.length} new cars. Total: ${allCars.length}`
      );

      previousCardCount = currentCardCount;

      // -------------------------------------------------
      // 4. Check if we need to load more (scroll or navigate)
      // -------------------------------------------------

      // Check if there are more pages to load
      const hasMoreToLoad = currentCardCount >= CARDS_PER_PAGE * currentPage;

      if (!hasMoreToLoad) {
        await logAsync(
          "info",
          "All cards loaded (no more pagination expected)"
        );
        break;
      }

      // -------------------------------------------------
      // 5. Navigate to next page
      // -------------------------------------------------
      currentPage++;
      const currentUrl = page.url();
      const urlObj = new URL(currentUrl);

      // Add or update page parameter
      urlObj.searchParams.set("page", currentPage.toString());
      const nextPageUrl = urlObj.toString();

      await logAsync(
        "info",
        `Navigating to page ${currentPage}: ${nextPageUrl}`
      );

      try {
        // Navigate to next page
        await page.goto(nextPageUrl, {
          waitUntil: "domcontentloaded",
          timeout: 60_000,
        });

        // Wait for new content to load
        await wait(5000);

        // Wait for cards to appear
        await page.waitForSelector(".vlp-cards-base .cell.card", {
          timeout: 60_000,
        });

        // Verify new cards loaded
        const newCardCount = await page.evaluate(() => {
          return document.querySelectorAll(".vlp-cards-base .cell.card").length;
        });

        if (newCardCount === 0) {
          await logAsync(
            "warn",
            `No cards found after navigating to page ${currentPage}`
          );
          break;
        }

        await logAsync(
          "info",
          `Page ${currentPage} loaded with ${newCardCount} cards`
        );
      } catch (e) {
        await logAsync("error", `Navigation failed for page ${currentPage}`, {
          error: e.message,
        });
        break;
      }

      // Safety check: don't scrape more than 100 pages
      if (currentPage > 100) {
        await logAsync("warn", "Reached maximum page limit (100), stopping");
        break;
      }
    }

    // -------------------------------------------------
    // 6. Return all results
    // -------------------------------------------------
    result.cars = allCars;
    result.total = allCars.length;

    await logAsync("success", "✅ YorkdaleVW scraping COMPLETE", {
      totalCars: result.total,
      pagesScraped: currentPage,
      finalUrl: page.url(),
    });

    return result;
  } catch (err) {
    // -------------------------------------------------
    // ERROR: Take screenshot + log full context
    // -------------------------------------------------
    await logAsync("error", "YorkdaleVW scraper FAILED - capturing state", {
      error: err.message,
      url: page.url(),
      stack: err.stack,
    });

    // Try to capture page state for debugging
    try {
      const pageState = await page.evaluate(() => {
        return {
          cardCount: document.querySelectorAll(".vlp-cards-base .cell.card")
            .length,
          hasCardsContainer: !!document.querySelector(".vlp-cards-base"),
          url: window.location.href,
        };
      });
      await logAsync("info", "Page state at error", pageState);
    } catch (evalErr) {
      await logAsync("warn", "Could not capture page state", {
        error: evalErr.message,
      });
    }

    await page
      .screenshot({ path: "ERROR-yorkdale.png", fullPage: true })
      .catch(() => {});

    result.serverError = err.message;

    await logAsync("error", "YorkdaleVW scraper final error", {
      error: err.message,
      carsScrapedBeforeError: result.cars.length,
    });

    return result;
  }
};

module.exports = { scrapeYorkdaleVW };
