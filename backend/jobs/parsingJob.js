const { v4: uuidv4 } = require("uuid");
const parserService = require("../services/parserService");
const firestoreService = require("../services/firestoreService");

const RETRY_DELAYS = [0, 60000, 180000]; // 0s, 1min, 3min

async function processFileWithRetry(log) {
  let retryCount = 0;
  let lastError = null;

  for (const delay of RETRY_DELAYS) {
    try {
      // Fetch and parse CSV
      const csvBuffer = await parserService.fetchFileFromUrl(log.downloadUrl);
      const headers = await parserService.detectSchema(csvBuffer);
      const { records, errors, successCount } = await parserService.parseCSV(
        csvBuffer
      );

      // Store parse results
      const parseId = await firestoreService.createParseResult({
        parseId: "",
        downloadId: log.id,
        sourceFileUrl: log.downloadUrl,
        parseTimestamp: new Date().toISOString(),
        recordCount: records.length + errors.length,
        successCount,
        failedCount: errors.length,
        schema: headers,
        data: [], // Store metadata, not full data (records saved separately)
        errors,
        status:
          errors.length === 0
            ? "SUCCESS"
            : errors.length === records.length
            ? "FAILED"
            : "PARTIAL",
      });

      // Batch write records
      await firestoreService.batchWriteRecords(records, parseId);

      // Update download log
      await firestoreService.updateDownloadLog(log.id, {
        syncStatus: "PARSED",
      });
      console.log(`${new Date().toISOString()} - Parsed file: ${log.id}`);
      return;
    } catch (error) {
      retryCount++;
      lastError = error.message;
      console.error(
        `${new Date().toISOString()} - Attempt ${retryCount} failed for ${
          log.id
        }: ${lastError}`
      );
      if (retryCount < RETRY_DELAYS.length) {
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  // Log failure after max retries
  await firestoreService.createParseResult({
    parseId: "",
    downloadId: log.id,
    sourceFileUrl: log.downloadUrl,
    parseTimestamp: new Date().toISOString(),
    recordCount: 0,
    successCount: 0,
    failedCount: 0,
    schema: [],
    data: [],
    errors: [{ error: lastError }],
    status: "FAILED",
  });
  await firestoreService.updateDownloadLog(log.id, {
    syncStatus: "FAILED",
    error: lastError,
  });
}

async function main() {
  try {
    const pendingLogs = await firestoreService.getDownloadLogsByStatus(
      "PENDING"
    );
    console.log(
      `${new Date().toISOString()} - Found ${pendingLogs.length} pending files`
    );

    for (const log of pendingLogs) {
      await processFileWithRetry(log);
    }
    console.log(`${new Date().toISOString()} - Parsing job completed`);
    process.exit(0);
  } catch (error) {
    console.error(
      `${new Date().toISOString()} - Fatal error: ${error.message}`
    );
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { processFileWithRetry };
