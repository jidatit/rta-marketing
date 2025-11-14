// services/url-builders/humberview.builder.js
const siteConfig = require("../../config/sites/humberview");
const { exteriorColorId } = require("../../data/exteriorColorId");
const { frameStyleId } = require("../../data/frameStyleId");
const { transmissionId } = require("../../data/transmissionId");

// Helper function to find key by label in array
const findKeyByLabel = (array, label) => {
  if (!label) return null;
  const item = array.find(
    (item) => item.label.toLowerCase() === label.toLowerCase()
  );
  return item ? item.key : null;
};

/**
 * Build Humberview VW inventory URL from filters.
 * Supports: make, model, year, price range, mileage range, transmission, exterior color, body style, keyword
 */
const buildUrl = (filters) => {
  const {
    make,
    model,
    year, // single year (e.g. 2022)
    minPrice,
    maxPrice,
    keywords = "",
    minMileage,
    maxMileage,
    transmission,
    exteriorColor,
    bodyStyle,
  } = filters;

  // --- Build path ---
  let path = "/en/group-all-inventory";

  if (make) {
    path += `/${encodeURIComponent(make.toLowerCase())}`;
  }
  if (model) {
    path += `/${encodeURIComponent(model.toLowerCase().replace(/\s+/g, "-"))}`;
  }

  // --- Build query params ---
  const params = new URLSearchParams();

  // Year
  if (year != null) {
    params.append("year", year.toString());
  }

  // Body style (frameStyleId)
  if (bodyStyle) {
    const frameStyleKey = findKeyByLabel(frameStyleId, bodyStyle);
    console.log("bodyStyle:", bodyStyle, "-> frameStyleId:", frameStyleKey);
    if (frameStyleKey && frameStyleKey !== -1) {
      params.append("frameStyleId", frameStyleKey.toString());
    }
  }

  // Price range
  if (minPrice != null) {
    params.append("minPrice", minPrice.toString());
  }
  if (maxPrice != null) {
    params.append("maxPrice", maxPrice.toString());
  }

  // Mileage range (odometer)
  if (maxMileage != null) {
    params.append("maxOdometer", maxMileage.toString());
  }
  if (minMileage != null) {
    params.append("minOdometer", minMileage.toString());
  }

  // Transmission (transmissionId)
  if (transmission) {
    const transmissionKey = findKeyByLabel(transmissionId, transmission);
    console.log(
      "transmission:",
      transmission,
      "-> transmissionId:",
      transmissionKey
    );
    if (transmissionKey && transmissionKey !== -1) {
      params.append("transmissionId", transmissionKey.toString());
    }
  }

  // Exterior color (exteriorColorId)
  if (exteriorColor) {
    const exteriorColorKey = findKeyByLabel(exteriorColorId, exteriorColor);
    console.log(
      "exteriorColor:",
      exteriorColor,
      "-> exteriorColorId:",
      exteriorColorKey
    );
    if (exteriorColorKey && exteriorColorKey !== -1) {
      params.append("exteriorColorId", exteriorColorKey.toString());
    }
  }

  // Keyword search
  if (keywords) {
    params.append("text", keywords);
  }

  const query = params.toString();
  return `${siteConfig.baseUrl}${path}${query ? `?${query}` : ""}`;
};

module.exports = { buildUrl };
