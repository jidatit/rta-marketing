// services/url-builders/autotrader.builder.js
const siteConfig = require("../../config/sites/autotrader");

const buildUrl = (filters) => {
  const {
    make,
    model,
    yearMin,
    yearMax,
    minPrice,
    maxPrice,
    postal,
    radius = 100,
    keyword,
  } = filters;

  const slugs = siteConfig.getSlugs(postal || "A1A1A1");
  let path = "/cars";
  if (make) path += `/${encodeURIComponent(make.toLowerCase())}`;
  if (model)
    path += `/${encodeURIComponent(
      model.toLowerCase().replace(/\s+/g, "%20")
    )}`;
  //   path += `/${slugs.province}/${slugs.city}/`;

  const params = new URLSearchParams({
    rcp: "200",
    rcs: "0",
    prx: radius.toString(),
    // prv: slugs.provinceName,
    loc: postal || "A1A1A1",
    hprc: "True",
    wcp: "True",
    sts: "New-Used",
  });

  if (make && model) {
    params.append("inMarket", "advancedSearch");
  } else {
    params.append("inMarket", "basicSearch");
  }

  if (yearMin && yearMax) params.append("yRng", `${yearMin},${yearMax}`);
  if (minPrice != null && maxPrice != null)
    params.append("pRng", `${minPrice},${maxPrice}`);
  if (keyword) params.append("kwd", keyword);
  params.append("srt", "39");

  return `${siteConfig.baseUrl}${path}?${params.toString()}`;
};

module.exports = { buildUrl };
