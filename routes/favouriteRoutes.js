const express = require("express");

const { addToFavourite , getMyFavourite, removeFromFavourite } = require("../controllers/favouriteController");

const { protect } = require("../middlewares/authMiddleware");

const router = express.Router({ mergeParams: true });

router.use(protect);

router.get("/my", getMyFavourite);

router.post("/:id", addToFavourite);
router.delete("/:id", removeFromFavourite);

module.exports = router;
