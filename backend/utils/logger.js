// utils/logger.js

const { logsRef } = require("../config/firebaseAdmin");

const logAsync = async (level, message, data = {}) => {
  logsRef
    .add({
      level,
      message,
      data,
      // timestamp:serverTimestamp(),
    })
    .catch(() => {}); // Silent fail
};

module.exports = { logAsync };
