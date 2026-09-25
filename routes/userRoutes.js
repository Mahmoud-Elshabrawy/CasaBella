const express = require("express")

const {protect, restrictTo} = require("../middlewares/authMiddleware")
const {getAllUsers, getUser, createUser, updateUser, getMe, updateMe} = require("../controllers/userController")

const router = express.Router()

router.use(protect)

router.route("/me").get(getMe).patch(updateMe)

router.route("/", restrictTo("admin")).get(getAllUsers).post(createUser)
router.route("/:id").get(getUser).patch(updateUser)

module.exports = router