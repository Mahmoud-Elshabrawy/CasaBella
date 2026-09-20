const express = require("express");
const authRoutes = require("./authRoutes");
const mainCategoriesRoutes = require("./mainCategoriesRoutes");
const categoriesRoutes = require("./categoryRoutes");

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/main-categories", mainCategoriesRoutes);
router.use("/categories", categoriesRoutes);

module.exports = router;
