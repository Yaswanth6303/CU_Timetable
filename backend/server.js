const express = require("express");
const cors = require("cors");
const app = express();
const path = require("path");
const db = require("./config/mongoose");
const dotenv = require("dotenv");

// Load environment variables
dotenv.config();

const port = process.env.PORT || 5000;

// Enable CORS with specific origin
app.use(cors())

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from uploads directory
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.use("/", require("./routes"));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something broke!" });
});

app.listen(port, function (err) {
  if (err) {
    console.log("Error:", err);
    return;
  }
  console.log("Server is running on port:", port);
});
