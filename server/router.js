const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  res.header("Access-Control-Allow-Origin", "http://localhost:3000");
  res.send(`server is up and running`);
});

module.exports = router;
