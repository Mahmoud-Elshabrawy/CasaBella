const express = require("express");
const authRoutes = require("./authRoutes");
const mainCategoriesRoutes = require("./mainCategoriesRoutes");
const categoriesRoutes = require("./categoryRoutes");
const productsRoutes = require("./productRoutes");

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/main-categories", mainCategoriesRoutes);
router.use("/categories", categoriesRoutes);
router.use("/products", productsRoutes);

module.exports = router;
