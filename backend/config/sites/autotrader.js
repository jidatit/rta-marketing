// config/sites/autotrader.js
module.exports = {
  name: "AutoTrader.ca",
  baseUrl: "https://www.autotrader.ca",
  urlTemplate: "/cars/{make}/{model}/{year}/{province}/{city}/",
  queryParams:
    "?rcp=0&rcs=0&prx={radius}&loc={postal}&pRng={minPrice}%2C{maxPrice}&hprc=True&wcp=True&sts=New-Used&inMarket=advancedSearch",
  getSlugs: (postal) => {
    const map = {
      A1A: { province: "nl", city: "st.%20john%27s" },
      M5V: { province: "on", city: "toronto" },
      V6B: { province: "bc", city: "vancouver" },
    };
    const key = postal.slice(0, 3).toUpperCase();
    return map[key] || { province: "on", city: "toronto" };
  },
  selectors: {
    item: ".result-item",
    title: "h2 a",
    price: ".price",
    year: ".year",
    mileage: ".odometer",
    link: "h2 a",
  },
  pagination: { next: ".pagination-next" },
};
