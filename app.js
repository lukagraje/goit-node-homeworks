const express = require("express");
const logger = require("morgan");
const cors = require("cors");
const router = express.Router();
require("dotenv").config();

const contactsRouter = require("./routes/api/contactsRouter");

const PORT = process.env.PORT || 3000;

const app = express();

const formatsLogger = app.get("env") === "development" ? "dev" : "short";

app.use(logger(formatsLogger));
app.use(cors());
app.use(express.json());

app.use("/api/contacts", contactsRouter);

app.use((_req, res) => {
  res.status(404).json({ message: "Not found" });
});

app.use((err, _req, res, _next) => {
  res.status(500).json({ message: err.message });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`)
})

module.exports = app;
