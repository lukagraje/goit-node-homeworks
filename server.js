require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const apiRouter = require("./routes/api");
const setJWTStrategy = require("./config/jwt.js");
const path = require("path");


const { setupFolder } = require("./helpers/helpers.js");
const PORT = process.env.PORT || 3000;
const storeImageDir = path.join(__dirname, "/public/images");
const tempDir = path.join(__dirname, "/tmp");

const app = express();
app.use(express.static(path.resolve(__dirname, "./public")));

app.use(cors());
app.use(express.json());
setJWTStrategy();
const DB_HOST = process.env.DB_HOST;

const connection = mongoose
  .connect(DB_HOST, { dbName: "db-contacts" })
  .then(() => {
    console.log("Database connection successful");
  })
  .catch((error) => {
    console.error("Database connection error:", error.message);
    process.exit(1);
  });

app.use("/api", apiRouter);

app.use((_req, res) => {
  res.status(404).json({ message: "Not found" });
});

app.use((err, _req, res, _next) => {
  console.error(err.stack);
  res.status(500).json({ message: err.message });
});

app.listen(PORT, async () => {
  await setupFolder(tempDir);
  await setupFolder(storeImageDir);
  console.log(`Server is running on port ${PORT}.`);
});

module.exports = app;
