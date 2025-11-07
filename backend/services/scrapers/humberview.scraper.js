// services/scrapers/humberview.scraper.js
const { logAsync } = require("../../utils/logger");

const scrapeHumberview = async (page, baseUrl) => {
  const result = { cars: [], total: 0, serverError: null };

  try {
    await logAsync("info", "START: HumberviewVW scraper", { url: page.url() });

    // -------------------------------------------------
    // 1. Wait for initial load (counter or cards)
    // -------------------------------------------------
    await logAsync("debug", "Waiting for initial load...");
    await page
      .waitForSelector(".il-totalVehicles__count, article.vc-alpha", {
        timeout: 60_000,
      })
      .catch(() => {
        throw new Error("Initial load timeout – no counter or cards found");
      });
    await logAsync("debug", "Initial load complete");

    // -------------------------------------------------
    // 2. Read total count
    // -------------------------------------------------
    const initialCount = await page.evaluate(() => {
      const el = document.querySelector(".il-totalVehicles__count");
      return el ? parseInt(el.textContent.trim(), 10) : 0;
    });
    await logAsync("info", `Initial vehicle count: ${initialCount}`);

    if (initialCount === 0) {
      await logAsync("info", "Zero results detected on first load");
      return { cars: [], total: 0, serverError: null };
    }

    let need100 = initialCount > 12;
    let changedPerPage = false;

    // -------------------------------------------------
    // 3. CHANGE TO 100 PER PAGE IF NEEDED
    // -------------------------------------------------
    if (need100) {
      await logAsync("info", `Forcing 100 per page (current: ${initialCount})`);

      await page.evaluate(() => {
        const hidden = document.querySelector('input[name="pageSorting"]');
        const react = document.querySelector("#react-select-pageSorting-input");
        if (hidden) hidden.value = "100";
        if (react) {
          react.focus();
          react.value = "100";
          react.dispatchEvent(new Event("input", { bubbles: true }));
          react.dispatchEvent(new Event("change", { bubbles: true }));
        }

        const btn =
          document.querySelector('button[type="submit"]') ||
          document.querySelector(".il-pageSorting__select button");
        if (btn) btn.click();
        else
          document.body.dispatchEvent(new Event("submit", { bubbles: true }));
      });

      changedPerPage = true;

      // -------------------------------------------------
      // 4. WAIT FOR RELOAD + NEW RESULTS
      // -------------------------------------------------
      await logAsync("debug", "Waiting for perPage=100 reload...");

      // Wait for URL update + network idle
      await Promise.all([
        page
          .waitForFunction(
            () => window.location.search.includes("perPage=100"),
            { timeout: 30_000 }
          )
          .catch(() => {
            throw new Error("URL did not update to perPage=100");
          }),
        page
          .waitForNavigation({ waitUntil: "networkidle0", timeout: 30_000 })
          .catch(() => {}),
      ]);

      await logAsync("debug", "Reload complete. Waiting for new cards...");

      // Wait for new count + cards
      await page
        .waitForFunction(
          () => {
            const countEl = document.querySelector(".il-totalVehicles__count");
            const count = countEl
              ? parseInt(countEl.textContent.trim(), 10)
              : 0;
            const cards = document.querySelectorAll("article.vc-alpha");
            return count > 12 && cards.length > 12;
          },
          { timeout: 30_000, polling: "mutation" }
        )
        .catch(async () => {
          await logAsync(
            "warn",
            "Timeout waiting for 100+ cards – falling back to current page"
          );
        });

      await logAsync("info", "100 per page loaded successfully");
    } else {
      await logAsync(
        "info",
        `Only ${initialCount} cars → no need for 100 per page`
      );
    }

    // -------------------------------------------------
    // 5. Final wait for cards
    // -------------------------------------------------
    await page
      .waitForSelector("article.vc-alpha", { timeout: 15_000 })
      .catch(() => {
        throw new Error("No car cards found after final wait");
      });
    await logAsync("debug", "Car cards are visible");

    // -------------------------------------------------
    // 6. EXTRACT CARS
    // -------------------------------------------------
    const cars = await page.evaluate((baseUrl) => {
      return Array.from(document.querySelectorAll("article.vc-alpha"))
        .map((card) => {
          try {
            const jsonEl = card.querySelector(
              'script[type="application/ld+json"]'
            );
            if (!jsonEl) return null;

            const d = JSON.parse(jsonEl.textContent.trim());

            const img = card.querySelector(".vc-vehicleImage img");
            const image = img?.src?.includes("http")
              ? img.src
              : img?.dataset?.src || d.image || "";

            return {
              adId: d.sku || null,
              title: d.name || "",
              price: d.offers?.price
                ? `$${Number(d.offers.price).toLocaleString()}`
                : "",
              image,
              odometer: d.mileageFromOdometer?.value
                ? `${Number(d.mileageFromOdometer.value).toLocaleString()} KM`
                : "",
              link: d.offers?.url ? new URL(d.offers.url, baseUrl).href : "",
              dealer: d.manufacturer?.name || "Humberview Group",
              isUsed: true,
              proximity: "",
              color: d.color?.name || "",
              transmission: d.vehicleTransmission?.name || "",
              drivetrain: d.driveWheelConfiguration?.name || "",
              engine: d.vehicleEngine?.description || "",
            };
          } catch (e) {
            console.warn("Parse error on card:", e.message);
            return null;
          }
        })
        .filter(Boolean);
    }, baseUrl);

    result.cars = cars;
    result.total = cars.length;

    await logAsync("success", "HumberviewVW scraping SUCCESS", {
      totalCars: result.total,
      perPageChanged: changedPerPage,
      finalUrl: page.url(),
    });

    return result;
  } catch (err) {
    // -------------------------------------------------
    // ERROR: Take screenshot + log full context
    // -------------------------------------------------
    await page
      .screenshot({ path: "ERROR-humberview.png", fullPage: true })
      .catch(() => {});
    result.serverError = err.message;

    await logAsync("error", "HumberviewVW scraper FAILED", {
      error: err.message,
      url: page.url(),
      stack: err.stack,
    });

    return result;
  }
};

module.exports = { scrapeHumberview };
