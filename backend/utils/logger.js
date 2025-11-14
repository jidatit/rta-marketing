// utils/logger.js

const { logsRef, admin } = require("../config/firebaseAdmin");

const logAsync = async (level, message, data = {}) => {
  logsRef
    .add({
      level,
      message,
      data,
      timestamp: admin.firestore.FieldValue.serverTimestamp(), // ✅ server-side timestamp
    })
    .catch(() => {}); // Silent fail
};

module.exports = { logAsync };
