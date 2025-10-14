const ftpService = require("../services/ftpService");
const storageService = require("../services/storageService");
const firestoreService = require("../services/firestoreService");

(async () => {
  try {
    // Connect to FTP server
    await ftpService.connectToFTP();

    // Download file
    const { buffer, metadata } = await ftpService.downloadFile(
      process.env.FTP_FILE_NAME
    );

    // Upload to Firebase Storage (overwrite existing file)
    const storagePath = process.env.STORAGE_PATH;
    const downloadUrl = await storageService.uploadFile(buffer, storagePath);

    // Update or create Firestore log
    const logData = {
      downloadId: "latest_inventory",
      fileName: process.env.FTP_FILE_NAME,
      downloadUrl,
      storagePath,
      fileSize: buffer.length,
      downloadTimestamp: new Date().toISOString(),
      ftpLastModified: metadata.lastModified.toISOString(),
      syncStatus: "DOWNLOADED",
      triggerType: process.env.TRIGGER_TYPE || "SCHEDULED",
      error: null,
    };

    await firestoreService.createDownloadLog(logData, true); // Upsert with merge
    console.log(
      `${new Date().toISOString()} - Created/updated download log: latest_inventory`
    );

    // Disconnect from FTP
    await ftpService.disconnect();
    process.exit(0);
  } catch (error) {
    console.error(
      `${new Date().toISOString()} - FTP download job failed: ${error.message}`
    );

    // Update Firestore with error
    await firestoreService.createDownloadLog(
      {
        downloadId: "latest_inventory",
        fileName: process.env.FTP_FILE_NAME,
        downloadUrl: null,
        storagePath: process.env.STORAGE_PATH,
        fileSize: 0,
        downloadTimestamp: new Date().toISOString(),
        ftpLastModified: null,
        syncStatus: "FAILED",
        triggerType: process.env.TRIGGER_TYPE || "SCHEDULED",
        error: error.message,
      },
      true
    );

    await ftpService.disconnect();
    process.exit(1);
  }
})();
