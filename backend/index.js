const express = require("express");
const bodyParser = require("body-parser");
const admin = require("firebase-admin");
const cors = require("cors");
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

const app = express();
app.use(cors({ origin: process.env.CORS_ORIGIN }));
app.use(bodyParser.json());

app.get("/", (req, res) => {
  return res.send("Hello World");
});

app.post("/disableUser", async (req, res) => {
  // console.log("Block User");

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
  // console.log("unBlock User");

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

const port = process.env.PORT || 5000;
app.listen(port, () => {
  // console.log(`Server running on port ${port}`);
});
