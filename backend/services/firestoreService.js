const { db } = require("../config/firebaseAdmin");

class FirestoreService {
  // Create FTP download log
  async createDownloadLog(logData) {
    try {
      const docRef = db.collection("ftp_download_logs").doc();
      await docRef.set({ ...logData, downloadId: docRef.id });
      console.log(
        `${new Date().toISOString()} - Created download log: ${docRef.id}`
      );
      return docRef.id;
    } catch (error) {
      throw new Error(`Failed to create download log: ${error.message}`);
    }
  }

  // Update FTP download log
  async updateDownloadLog(downloadId, updates) {
    try {
      await db.collection("ftp_download_logs").doc(downloadId).update(updates);
      console.log(
        `${new Date().toISOString()} - Updated download log: ${downloadId}`
      );
    } catch (error) {
      throw new Error(`Failed to update download log: ${error.message}`);
    }
  }

  // Get download logs by status
  async getDownloadLogsByStatus(status) {
    try {
      const snapshot = await db
        .collection("ftp_download_logs")
        .where("syncStatus", "==", status)
        .get();
      const logs = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      console.log(
        `${new Date().toISOString()} - Fetched ${
          logs.length
        } logs with status: ${status}`
      );
      return logs;
    } catch (error) {
      throw new Error(`Failed to fetch download logs: ${error.message}`);
    }
  }

  // Create parse result
  async createParseResult(parseData) {
    try {
      const docRef = db.collection("inventory_parsed_data").doc();
      await docRef.set({ ...parseData, parseId: docRef.id });
      console.log(
        `${new Date().toISOString()} - Created parse result: ${docRef.id}`
      );
      return docRef.id;
    } catch (error) {
      throw new Error(`Failed to create parse result: ${error.message}`);
    }
  }

  // Batch write parsed records
  async batchWriteRecords(records, parseId) {
    try {
      const batchSize = 500; // Firestore batch limit
      for (let i = 0; i < records.length; i += batchSize) {
        const batch = db.batch();
        const chunk = records.slice(i, i + batchSize);
        chunk.forEach((record, index) => {
          const docRef = db
            .collection("inventory_parsed_data")
            .doc(parseId)
            .collection("records")
            .doc();
          batch.set(docRef, { ...record, recordId: docRef.id, parseId });
        });
        await batch.commit();
        console.log(
          `${new Date().toISOString()} - Committed batch of ${
            chunk.length
          } records`
        );
      }
    } catch (error) {
      throw new Error(`Batch write failed: ${error.message}`);
    }
  }
}

module.exports = new FirestoreService();
