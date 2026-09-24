const express = require("express");
const authRoutes = require("./authRoutes");
const mainCategoriesRoutes = require("./mainCategoriesRoutes");
const categoriesRoutes = require("./categoryRoutes");
const productsRoutes = require("./productRoutes");
const favouriteRoutes = require("./favouriteRoutes");
const cartRoutes = require("./cartRoutes")
const orderRoutes = require("./orderRoutes")

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/main-categories", mainCategoriesRoutes);
router.use("/categories", categoriesRoutes);
router.use("/products", productsRoutes);
router.use("/favourites", favouriteRoutes);
router.use("/cart", cartRoutes);
router.use("/orders", orderRoutes);

module.exports = router;
