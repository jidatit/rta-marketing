const ftp = require("basic-ftp");
const { validateEnv } = require("../utils/envValidator");

// Required environment variables
const REQUIRED_ENV = [
  "FTP_HOST",
  "FTP_USER",
  "FTP_PASSWORD",
  "FTP_FILE_NAME",
  "FTP_FILE_PATH",
];

class FTPService {
  constructor() {
    validateEnv(REQUIRED_ENV);
    this.client = new ftp.Client();
    this.client.ftp.verbose = false; // Set to true for debugging
  }

  // Connect to FTP server
  async connectToFTP() {
    try {
      await this.client.access({
        host: process.env.FTP_HOST,
        user: process.env.FTP_USER,
        password: process.env.FTP_PASSWORD,
        secure: false, // Adjust for FTPS if needed
      });
      console.log(`${new Date().toISOString()} - Connected to FTP server`);
    } catch (error) {
      throw new Error(`FTP connection failed: ${error.message}`);
    }
  }

  // Download file and return buffer and metadata
  async downloadFile(fileName) {
    try {
      const filePath = `${process.env.FTP_FILE_PATH}${fileName}`;
      const buffer = await this.client.downloadToBuffer(filePath);
      const metadata = await this.getFileMetadata(filePath);
      console.log(`${new Date().toISOString()} - Downloaded file: ${fileName}`);
      return { buffer, metadata };
    } catch (error) {
      throw new Error(`FTP download failed: ${error.message}`);
    }
  }

  // Get file metadata (last modified date)
  async getFileMetadata(fileName) {
    try {
      const response = await this.client.lastMod(fileName);
      return { lastModified: response };
    } catch (error) {
      throw new Error(`FTP metadata fetch failed: ${error.message}`);
    }
  }

  // Disconnect from FTP server
  async disconnect() {
    try {
      await this.client.close();
      console.log(`${new Date().toISOString()} - Disconnected from FTP server`);
    } catch (error) {
      console.error(
        `${new Date().toISOString()} - FTP disconnect failed: ${error.message}`
      );
    }
  }
}

module.exports = new FTPService();
