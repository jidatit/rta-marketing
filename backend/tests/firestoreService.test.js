const firestoreService = require("../services/firestoreService");
jest.mock("../config/firebaseAdmin", () => ({
  db: {
    collection: () => ({
      doc: () => ({
        set: jest.fn().mockResolvedValue(),
        id: "test-id",
      }),
      where: () => ({
        get: jest.fn().mockResolvedValue({
          docs: [{ id: "test-id", data: () => ({ syncStatus: "PENDING" }) }],
        }),
      }),
    }),
    batch: jest.fn().mockReturnValue({
      set: jest.fn(),
      commit: jest.fn().mockResolvedValue(),
    }),
  },
}));

describe("Firestore Service", () => {
  test("createDownloadLog creates a log entry", async () => {
    const logData = { fileName: "test.csv", syncStatus: "PENDING" };
    const id = await firestoreService.createDownloadLog(logData);
    expect(id).toBe("test-id");
  });

  test("batchWriteRecords handles batch writes", async () => {
    const records = [{ id: 1 }, { id: 2 }];
    await firestoreService.batchWriteRecords(records, "parse-id");
    expect(firestoreService.db.batch).toHaveBeenCalled();
  });
});
