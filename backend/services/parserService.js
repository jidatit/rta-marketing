const { parse } = require("csv-parse");
const axios = require("axios");

class ParserService {
  // Fetch file from Firebase Storage URL
  async fetchFileFromUrl(downloadUrl) {
    try {
      const response = await axios.get(downloadUrl, {
        responseType: "arraybuffer",
      });
      console.log(`${new Date().toISOString()} - Fetched file from URL`);
      return Buffer.from(response.data);
    } catch (error) {
      throw new Error(`Failed to fetch file: ${error.message}`);
    }
  }

  // Detect CSV schema (headers)
  async detectSchema(csvBuffer) {
    return new Promise((resolve, reject) => {
      parse(
        csvBuffer,
        { delimiter: [",", "\t", ";"], max_record_size: 1048576 },
        (err, records) => {
          if (err)
            return reject(new Error(`Schema detection failed: ${err.message}`));
          if (!records || records.length === 0)
            return reject(new Error("Empty CSV file"));
          const headers = records[0];
          console.log(
            `${new Date().toISOString()} - Detected schema: ${headers.join(
              ", "
            )}`
          );
          resolve(headers);
        }
      );
    });
  }

  // Parse CSV file
  async parseCSV(csvBuffer, options = {}) {
    return new Promise((resolve, reject) => {
      const records = [];
      const errors = [];
      let successCount = 0;

      parse(csvBuffer, {
        delimiter: [",", "\t", ";"],
        columns: true,
        skip_empty_lines: true,
        trim: true,
        ...options,
      })
        .on("data", (record) => {
          try {
            this.validateRecord(record);
            records.push(record);
            successCount++;
          } catch (error) {
            errors.push({ record, error: error.message });
          }
        })
        .on("end", () => {
          console.log(
            `${new Date().toISOString()} - Parsed ${successCount} records`
          );
          resolve({ records, errors, successCount });
        })
        .on("error", (err) =>
          reject(new Error(`CSV parsing failed: ${err.message}`))
        );
    });
  }

  // Validate a single record (basic validation, can be extended)
  validateRecord(record) {
    if (!record || typeof record !== "object") {
      throw new Error("Invalid record format");
    }
    // Add custom validation logic here if needed
  }
}

module.exports = new ParserService();
