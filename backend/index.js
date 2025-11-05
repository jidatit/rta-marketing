const express = require("express");
const bodyParser = require("body-parser");
const { admin, db, auth } = require("./config/firebaseAdmin");
const cors = require("cors");
const swaggerJSDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
const swaggerOptions = require("./config/SwaggerOptions");
const inventoryScheduler = require("./schedulers/inventoryScheduler");
const { fork } = require("child_process");
const puppeteer = require("puppeteer");
require("dotenv").config();

// admin.initializeApp({
//   credential: admin.credential.cert({
//     type: process.env.type,
//     project_id: process.env.project_id,
//     private_key_id: process.env.private_key_id,
//     private_key: process.env.private_key.replace(/\\n/g, "\n"),
//     client_email: process.env.client_email,
//     client_id: process.env.client_id,
//     auth_uri: process.env.auth_uri,
//     token_uri: process.env.token_uri,
//     auth_provider_x509_cert_url: process.env.auth_provider_x509_cert_url,
//     client_x509_cert_url: process.env.client_x509_cert_url,
//     universe_domain: process.env.universe_domain,
//   }),
// });
// const db = admin.firestore();
// const auth = admin.auth();

const swaggerDocs = swaggerJSDoc(swaggerOptions);
const app = express();
const publicCors = cors(); // allows all origins

app.use(bodyParser.json());
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

app.get("/", (req, res) => {
  res.send(`
    <html>
      <head>
        <title>RTA Backend</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            text-align: center;
            padding-top: 50px;
          }
          button {
            padding: 10px 20px;
            font-size: 16px;
            background-color: #003160;
            color: white;
            border: none;
            border-radius: 5px;
            cursor: pointer;
          }
          button:hover {
            background-color: #0056b3;
          }
        </style>
      </head>
      <body>
        <h2>RTA Backend</h2>
        <p>Please click below to view the API documentation:</p>
        <button onclick="location.href='/api-docs'">Go to API Docs</button>
      </body>
    </html>
  `);
});

/**
 * @swagger
 * tags:
 *   name: Leads
 *   description: Leads management endpoints
 */

/**
 * @swagger
 * /leads:
 *   post:
 *     summary: Create a new lead
 *     tags: [Leads]
 *     security:
 *       - bearerAuth: []
 *     description: |
 *       This endpoint allows you to create a new lead in the system.
 *       All fields are required.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Lead'
 *           examples:
 *             example1:
 *               summary: Basic lead example
 *               value:
 *                 leadAmount: 50000
 *                 leadCost: 500
 *                 leadSource: "Website Form"
 *                 receivedDate: "2023-05-15T10:00:00Z"
 *     responses:
 *       201:
 *         description: Lead created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             examples:
 *               successResponse:
 *                 value:
 *                   success: true
 *                   message: "Lead created successfully"
 *                   id: "abc123def456"
 *       400:
 *         description: Bad request - missing or invalid parameters
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: "All fields are required"
 *       401:
 *         description: Unauthorized - missing or invalid authentication
 *       500:
 *         description: Internal server error
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: "Error creating lead"
 */
app.post("/leads", publicCors, async (req, res) => {
  const { appid } = req.query; // Get API key from query string

  const expectedKey = process.env.PUBLIC_LEAD_API_KEY;

  if (appid !== expectedKey) {
    return res
      .status(401)
      .json({ error: "Unauthorized: Invalid or Missing API Key" });
  }
  const { leadAmount, leadCost, leadSource, receivedDate } = req.body;

  if (!leadAmount || !leadCost || !leadSource || !receivedDate) {
    return res.status(400).send("All fields are required");
  }

  try {
    const docRef = await db.collection("apiLeads").add({
      leadAmount,
      leadCost,
      leadSource,
      receivedDate,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    return res.status(201).json({
      success: true,
      message: "Lead created successfully",
      id: docRef.id,
    });
  } catch (error) {
    console.error("Error creating lead:", error);
    return res.status(500).send("Error creating lead");
  }
});

app.use(cors({ origin: process.env.CORS_ORIGIN }));

app.post("/disableUser", async (req, res) => {
  const { uid } = req.body;

  if (!uid) {
    return res.status(400).send("User ID is required");
  }

  try {
    await admin.auth().updateUser(uid, { disabled: true });
    res.status(200).send(`User ${uid} has been disabled.`);
  } catch (error) {
    console.error("Error disabling user:", error);
    res.status(500).send("Error disabling user");
  }
});

app.post("/enableUser", async (req, res) => {
  const { uid } = req.body;

  if (!uid) {
    return res.status(400).send("User ID is required");
  }

  try {
    await admin.auth().updateUser(uid, { disabled: false });
    res.status(200).send(`User ${uid} has been enabled.`);
  } catch (error) {
    console.error("Error enabling user:", error);
    res.status(500).send("Error enabling user");
  }
});

app.post("/deleteUser", async (req, res) => {
  try {
    const { uid } = req.body;

    const collections = ["employees", "virtual-assistants"];
    let userDocRef = null;
    let userData = null;

    for (const collection of collections) {
      const querySnapshot = await db
        .collection(collection)
        .where("uid", "==", uid)
        .limit(1)
        .get();

      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        userDocRef = doc.ref;
        userData = doc.data();
        break;
      }
    }

    if (!userDocRef || !userData) {
      return res.status(404).json({ error: "User not found in collections" });
    }

    if (!userData.email) {
      return res
        .status(400)
        .json({ error: "Email not found in user document" });
    }

    // ✅ Delete user from Firebase Auth (Admin SDK)
    await auth.deleteUser(uid);

    // ✅ Mark document as deleted
    await userDocRef.update({ isDeleted: true });

    return res.status(200).json({ success: true });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// Manual trigger endpoint for FTP download
app.post("/trigger-ftp-download", async (req, res) => {
  try {
    const { token } = req.body;
    if (token !== process.env.API_SECRET_TOKEN) {
      return res.status(401).json({ error: "Invalid token" });
    }

    // Fork FTP download job and wait for completion
    const job = fork("jobs/ftpDownloadJob.js", [], {
      env: { ...process.env, TRIGGER_TYPE: "MANUAL" },
    });

    job.on("message", (message) => {
      // Handle messages from the child process
      if (message.status === "success") {
        res.status(200).json({
          status: "success",
          message: "FTP download completed successfully",
          downloadUrl: message.downloadUrl,
        });
      } else if (message.status === "error") {
        res.status(500).json({
          status: "error",
          error: message.error || "FTP download failed",
        });
      }
    });

    job.on("exit", (code) => {
      console.log(
        `${new Date().toISOString()} - Manual FTP download job exited with code ${code}`
      );
      if (!res.headersSent) {
        // Fallback in case the job exits without sending a message
        res.status(500).json({
          status: "error",
          error: `FTP download job exited unexpectedly with code ${code}`,
        });
      }
    });

    job.on("error", (error) => {
      console.error(
        `${new Date().toISOString()} - Manual trigger failed: ${error.message}`
      );
      if (!res.headersSent) {
        res.status(500).json({
          status: "error",
          error: `Failed to trigger FTP download: ${error.message}`,
        });
      }
    });
  } catch (error) {
    console.error(
      `${new Date().toISOString()} - Manual trigger failed: ${error.message}`
    );
    res.status(500).json({
      status: "error",
      error: `Failed to trigger FTP download: ${error.message}`,
    });
  }
});

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function scrapeFilters() {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();

  await page.goto("https://www.humberviewvw.com/en", {
    waitUntil: "networkidle2",
  });

  // Wait for the make dropdown
  await page.waitForSelector('[data-dropdown-type="makeId"]');

  // Click to open make dropdown
  await page.click('[data-dropdown-type="makeId"] .dropdown__label');
  await delay(1000); // Wait for dropdown to open

  // Scrape all makes
  const makes = await page.evaluate(() => {
    return Array.from(
      document.querySelectorAll(
        '[data-dropdown-type="makeId"] .dropdown__options li'
      )
    ).map((el) => ({
      name: el.innerText.trim(),
      id: el.getAttribute("data-value"),
    }));
  });

  console.log("Scraped Makes:", makes);

  const result = {};

  for (const make of makes) {
    console.log(`\nFetching models for: ${make.name} (ID: ${make.id})`);

    try {
      // Open make dropdown if closed
      const isMakeDropdownOpen = await page.evaluate(() => {
        const dropdown = document.querySelector(
          '[data-dropdown-type="makeId"] .dropdown__options'
        );
        return dropdown && dropdown.classList.contains("active");
      });

      if (!isMakeDropdownOpen) {
        await page.click('[data-dropdown-type="makeId"] .dropdown__label');
        await delay(500);
      }

      // Click the specific make
      await page.evaluate((makeId) => {
        const makeOption = document.querySelector(
          `[data-dropdown-type="makeId"] .dropdown__options li[data-value="${makeId}"]`
        );
        if (makeOption) makeOption.click();
      }, make.id);

      console.log(`Clicked on ${make.name}, waiting for models to load...`);

      // Wait for model dropdown to populate with data
      await page.waitForFunction(
        () => {
          const modelDropdown = document.querySelector(
            '[data-dropdown-type="modelId"]'
          );
          const modelOptions = modelDropdown?.querySelectorAll(
            "ul.dropdown__options li"
          );
          return modelOptions && modelOptions.length > 0;
        },
        { timeout: 10000 }
      );

      await delay(1000); // Extra wait for stability

      // Scrape models from the model dropdown
      const models = await page.evaluate(() => {
        const modelOptions = document.querySelectorAll(
          '[data-dropdown-type="modelId"] ul.dropdown__options li'
        );
        return Array.from(modelOptions).map((el) => ({
          name: el.innerText.trim(),
          id: el.getAttribute("data-value"),
        }));
      });

      result[make.name] = models;
      console.log(`✓ Fetched ${models.length} models for ${make.name}`);
      console.log("Models:", models.map((m) => m.name).join(", "));
    } catch (err) {
      console.error(`✗ Failed for ${make.name}:`, err.message);
      result[make.name] = [];
    }
  }

  console.log("\n=== Final Result ===");
  console.log(JSON.stringify(result, null, 2));

  await browser.close();
  return result;
}

scrapeFilters().catch(console.error);

// Start cron scheduler
inventoryScheduler.start();
const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
