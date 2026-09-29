const express = require("express");
const {
  createCoupon,
  getAllCoupons,
  getCoupon,
  updateCoupon,
  deleteCoupon,
  applyCoupon
} = require("../controllers/couponController");
const { protect, restrictTo } = require("../middlewares/authMiddleware");

const router = express.Router();

router.use(protect, restrictTo("admin", "super-admin"));

router.route("/").post(createCoupon).get(getAllCoupons);

router.post("/apply-coupon", applyCoupon)

router.route("/:id").get(getCoupon).patch(updateCoupon).delete(deleteCoupon);

module.exports = router;