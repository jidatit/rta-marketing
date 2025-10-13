const { v4: uuidv4 } = require("uuid");
const ftpService = require("../services/ftpService");
const storageService = require("../services/storageService");
const firestoreService = require("../services/firestoreService");

const RETRY_DELAYS = [0, 120000, 300000]; // 0s, 2min, 5min

async function downloadWithRetry() {
  let retryCount = 0;
  let lastError = null;

  for (const delay of RETRY_DELAYS) {
    try {
      await ftpService.connectToFTP();
      const fileName = process.env.FTP_FILE_NAME;
      const { buffer, metadata } = await ftpService.downloadFile(fileName);

      // Generate unique storage path
      const date = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
      const uuid = uuidv4();
      const storagePath = `inventory-files/${date}/${fileName}_${uuid}.csv`;

      // Upload to Firebase Storage
      const { downloadUrl } = await storageService.uploadFile(
        buffer,
        storagePath,
        {
          ftpLastModified: metadata.lastModified.toISOString(),
        }
      );

      // Log to Firestore
      const downloadId = await firestoreService.createDownloadLog({
        downloadId: "", // Will be set by Firestore
        fileName,
        downloadUrl,
        storagePath,
        fileSize: buffer.length,
        downloadTimestamp: new Date().toISOString(),
        syncStatus: "PENDING",
        ftpLastModified: metadata.lastModified.toISOString(),
        retryCount,
        error: null,
      });

      console.log(
        `${new Date().toISOString()} - FTP download completed: ${downloadId}`
      );
      return;
    } catch (error) {
      retryCount++;
      lastError = error.message;
      console.error(
        `${new Date().toISOString()} - Attempt ${retryCount} failed: ${lastError}`
      );
      if (retryCount < RETRY_DELAYS.length) {
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    } finally {
      await ftpService.disconnect();
    }
  }

  // Log failure after max retries
  await firestoreService.createDownloadLog({
    downloadId: "",
    fileName: process.env.FTP_FILE_NAME,
    downloadUrl: null,
    storagePath: null,
    fileSize: 0,
    downloadTimestamp: new Date().toISOString(),
    syncStatus: "FAILED",
    ftpLastModified: null,
    retryCount,
    error: lastError,
  });
  throw new Error(
    `FTP download failed after ${retryCount} attempts: ${lastError}`
  );
}

async function main() {
  try {
    await downloadWithRetry();
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

module.exports = { downloadWithRetry };
