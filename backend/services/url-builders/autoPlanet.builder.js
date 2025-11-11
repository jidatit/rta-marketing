const siteConfig = require("../../config/sites/autoplanet");

const buildUrl = (filters = {}) => {
  const {
    query = "", // ✅ text search (qs)
    minPrice,
    maxPrice,
    year,
    make,
    model,
    bodyStyle,
    exteriorColor,
    passengers,
    driveTrain,
    transmission,
    cylinders,
    fuelType,
    vehicleType = "Passenger Vehicles",
    sort = "price,asc",
    view = "grid",
    odometer = "", // ✅ added odometer param
  } = filters;

  const params = new URLSearchParams();

  // ✅ Base query params required by site
  params.set("qs", query);
  params.set("fn", "");

  if (minPrice != null && maxPrice != null)
    params.set("pr", `${minPrice},${maxPrice}`);

  if (make) params.set("mk", make);
  if (model) params.set("md", model); // ✅ correct param for model
  params.set("tr", ""); // ✅ trim always exists, empty if none

  if (bodyStyle) params.set("bs", bodyStyle);
  params.set("od", odometer); // ✅ include odometer always (even empty)
  if (year) {
    if (Array.isArray(year) && year.length === 2)
      params.set("yr", `${year[0]},${year[1]}`);
    else params.set("yr", year);
  } else {
    params.set("yr", ""); // ✅ keep empty when missing
  }

  if (exteriorColor) params.set("ec", exteriorColor);
  if (passengers) params.set("pa", passengers);
  if (driveTrain) params.set("dt", driveTrain);
  if (transmission) params.set("tm", transmission);
  if (cylinders) params.set("cy", cylinders);
  if (fuelType) params.set("ft", fuelType);

  params.set("v1", vehicleType);
  params.set("st", sort);
  params.set("view", view);

  return `${siteConfig.baseUrl}/vehicles/?${params.toString()}`;
};

module.exports = { buildUrl };
