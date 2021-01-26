const express = require("express");
const app = express();
const db = require("./config/connection");

// Database Connection
db.connect(() => {
  console.log("Database Connected");
});
// Server setup
const PORT = process.env.PORT || 3001;
app.listen(PORT);
