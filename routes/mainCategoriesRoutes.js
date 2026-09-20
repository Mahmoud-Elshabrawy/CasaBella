const express = require("express");
const { protect, restrictTo } = require("../middlewares/authMiddleware");
const {
  getAllMainCategories,
  createMainCategory,
  getMainCategory,
  updateMainCategory,
  deleteMainCategory,
} = require("../controllers/mainCategoryController");

const router = express.Router();

router.get("/", getAllMainCategories);
router.post("/", protect, restrictTo("admin"), createMainCategory);
router
  .route("/:id")
  .get(getMainCategory)
  .patch(protect, restrictTo("admin"), updateMainCategory)
  .delete(protect, restrictTo("admin"), deleteMainCategory);

module.exports = router;
