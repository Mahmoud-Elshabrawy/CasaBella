const express = require("express");

const {
  addToCart,
  getMyCart,
  updateProductQuantity,
  removeFromCart,
  clearCart
} = require("../controllers/cartController");

const router = express.Router();

const { protect } = require("../middlewares/authMiddleware");

router.use(protect);

router.get("/my", getMyCart);
router.post("/:productId", addToCart);
router.patch("/:productId", updateProductQuantity);
router.delete("/clear", clearCart)
router.delete("/:productId", removeFromCart);

module.exports = router;
