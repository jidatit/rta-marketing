const express = require("express");
const bodyParser = require("body-parser");
const admin = require("firebase-admin");
const cors = require("cors");
const swaggerJSDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

require("dotenv").config();

admin.initializeApp({
  credential: admin.credential.cert({
    type: process.env.type,
    project_id: process.env.project_id,
    private_key_id: process.env.private_key_id,
    private_key: process.env.private_key.replace(/\\n/g, "\n"),
    client_email: process.env.client_email,
    client_id: process.env.client_id,
    auth_uri: process.env.auth_uri,
    token_uri: process.env.token_uri,
    auth_provider_x509_cert_url: process.env.auth_provider_x509_cert_url,
    client_x509_cert_url: process.env.client_x509_cert_url,
    universe_domain: process.env.universe_domain,
  }),
});
const db = admin.firestore();
const auth = admin.auth();

const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Leads API",
      // version: "1.0.0",
      description: "API for Posting leads in the RTA marketing",
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 5000}`,
        description: "Local development server",
      },
      {
        url: "https://your-production-url.com",
        description: "Production server",
      },
    ],
    components: {
      schemas: {
        Lead: {
          type: "object",
          properties: {
            leadAmount: {
              type: "number",
              description: "The monetary amount associated with the lead",
              example: 50000,
            },
            leadCost: {
              type: "number",
              description: "The cost incurred to acquire this lead",
              example: 500,
            },
            leadSource: {
              type: "string",
              description: "The source from which the lead was acquired",
              example: "Website Form",
              enum: [
                "Website Form",
                "Social Media",
                "Referral",
                "Cold Call",
                "Other",
              ],
            },
            receivedDate: {
              type: "string",
              format: "date-time",
              description: "The date when the lead was received",
              example: "2023-05-15T10:00:00Z",
            },
          },
          required: ["leadAmount", "leadCost", "leadSource", "receivedDate"],
          example: {
            leadAmount: 50000,
            leadCost: 500,
            leadSource: "Website Form",
            receivedDate: "2023-05-15T10:00:00Z",
          },
        },
        ApiResponse: {
          type: "object",
          properties: {
            success: {
              type: "boolean",
              description: "Indicates if the request was successful",
              example: true,
            },
            message: {
              type: "string",
              description: "A message describing the result",
              example: "Lead created successfully",
            },
            id: {
              type: "string",
              description: "The ID of the created lead",
              example: "abc123def456",
            },
          },
          required: ["success", "message"],
          example: {
            success: true,
            message: "Lead created successfully",
            id: "abc123def456",
          },
        },
        ErrorResponse: {
          type: "object",
          properties: {
            success: {
              type: "boolean",
              example: false,
            },
            message: {
              type: "string",
              example: "Error creating lead",
            },
          },
          example: {
            success: false,
            message: "Error creating lead",
          },
        },
      },
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description:
            'JWT Authorization header using the Bearer scheme. Example: "Authorization: Bearer {token}"',
        },
      },
      examples: {
        LeadExample: {
          value: {
            leadAmount: 50000,
            leadCost: 500,
            leadSource: "Website Form",
            receivedDate: "2023-05-15T10:00:00Z",
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ["./index.js"],
};

const swaggerDocs = swaggerJSDoc(swaggerOptions);
const app = express();
app.use(cors({ origin: process.env.CORS_ORIGIN }));
app.use(bodyParser.json());
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// app.get("/", (req, res) => {
//   return res.send("RTA Backend.please head to /api-docs for more details");
// });
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
app.post("/leads", async (req, res) => {
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

const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
