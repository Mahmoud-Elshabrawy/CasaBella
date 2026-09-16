const express = require("express");
const authroutes = require("./authroutes");

const router = express.Router();

router.use("/auth", authroutes);

module.exports = router;
