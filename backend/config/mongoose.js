const mongoose = require("mongoose");
const dotenv = require("dotenv")
dotenv.config();

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("Connection successful!");
  })
  .catch((error) => console.log("No connection " + error));

const db = mongoose.connection;

db.on("error", console.error.bind(console, "Error connecting to DB"));

db.once("open", function () {
  console.log("Successfully connected to DB");
});

module.exports = db;
