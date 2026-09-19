const express = require("express");
const authRoutes = require("./authRoutes");
const mainCategoriesRoutes = require("./mainCategoriesRoutes");

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/main-categories", mainCategoriesRoutes);

module.exports = router;
