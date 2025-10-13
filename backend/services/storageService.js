const { storage } = require("../config/firebaseAdmin");
const { validateEnv } = require("../utils/envValidator");

// Required environment variables
const REQUIRED_ENV = ["FIREBASE_STORAGE_BUCKET"];

class StorageService {
  constructor() {
    validateEnv(REQUIRED_ENV);
    this.bucket = storage.bucket();
  }

  // Upload file to Firebase Storage
  async uploadFile(buffer, fileName, metadata = {}) {
    try {
      const file = this.bucket.file(fileName);
      await file.save(buffer, {
        metadata: { metadata },
        contentType: "text/csv",
      });
      const [url] = await file.getSignedUrl({
        action: "read",
        expires: "12-31-2099", // Long-lived URL for simplicity
      });
      console.log(
        `${new Date().toISOString()} - Uploaded file to Storage: ${fileName}`
      );
      return { storagePath: fileName, downloadUrl: url };
    } catch (error) {
      throw new Error(`Storage upload failed: ${error.message}`);
    }
  }

  // Get download URL for a file
  async getDownloadUrl(storagePath) {
    try {
      const file = this.bucket.file(storagePath);
      const [url] = await file.getSignedUrl({
        action: "read",
        expires: "12-31-2099",
      });
      return url;
    } catch (error) {
      throw new Error(`Failed to get download URL: ${error.message}`);
    }
  }

  // Delete file from Storage
  async deleteFile(storagePath) {
    try {
      await this.bucket.file(storagePath).delete();
      console.log(
        `${new Date().toISOString()} - Deleted file from Storage: ${storagePath}`
      );
    } catch (error) {
      console.error(
        `${new Date().toISOString()} - Storage delete failed: ${error.message}`
      );
    }
  }
}

module.exports = new StorageService();
