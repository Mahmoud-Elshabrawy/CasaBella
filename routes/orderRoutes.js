const express = require("express");
const {
  getMyOrders,
  createOrder,
  getOrder,
  getAllOrders,
  updateOrderStatus,
  getOrderByAdmin,
} = require("../controllers/orderController");
const { protect, restrictTo } = require("../middlewares/authMiddleware");

const router = express.Router();

router
  .route("/")
  .get(protect, restrictTo("admin"), getAllOrders)
  .post(protect, createOrder);
router.get("/my-orders", protect, getMyOrders);
router.patch("/update-status/:id", protect, restrictTo("admin"), updateOrderStatus)
router.get("/admin/:id", protect, restrictTo("admin"), getOrderByAdmin)
router.route("/:id").get(protect, getOrder)



module.exports = router;
