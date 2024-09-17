const express = require("express");
const bodyParser = require("body-parser");
const admin = require("firebase-admin");
const cors = require("cors");
require("dotenv").config();

admin.initializeApp({
  credential: admin.credential.cert(
    require("./rta-marketing-firebase-adminsdk-d363b-850ec4a6e7.json")
  ),
});

const app = express();
app.use(cors({ origin: "https://rta-web.jidatit.uk/" }));
app.use(bodyParser.json());

app.get("/", (req, res) => {
  return res.send("Hello World");
});

app.post("/disableUser", async (req, res) => {
  console.log("Block User");

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

// Route to enable a user
app.post("/enableUser", async (req, res) => {
  console.log("unBlock User");

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
  console.log(`Server running on port ${port}`);
});
