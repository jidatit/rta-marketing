const { parse } = require("csv-parse");
const axios = require("axios");

class ParserService {
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

  async detectSchema(csvBuffer) {
    return new Promise((resolve, reject) => {
      parse(
        csvBuffer,
        {
          delimiter: ",",
          quote: '"',
          skip_empty_lines: true,
          relax_column_count: true, // prevents crash on uneven rows
          relax_quotes: true,
          trim: true,
          max_record_size: 1048576,
        },
        (err, records) => {
          if (err)
            return reject(new Error(`Schema detection failed: ${err.message}`));
          if (!records || records.length === 0)
            return reject(new Error("Empty CSV file"));
          const headers = records[0].map((h) => h.trim());
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

  async parseCSV(csvBuffer, options = {}) {
    return new Promise((resolve, reject) => {
      const records = [];
      const errors = [];
      let successCount = 0;

      parse(csvBuffer, {
        delimiter: ",",
        quote: '"',
        columns: true,
        skip_empty_lines: true,
        relax_column_count: true,
        relax_quotes: true,
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

  validateRecord(record) {
    if (!record || typeof record !== "object")
      throw new Error("Invalid record format");
  }
}

module.exports = new ParserService();
