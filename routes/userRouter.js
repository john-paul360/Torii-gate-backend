const router = require("express").Router();
const {
  handleRegister,
  handleVerifyEmail,
  handelLogin
} = require("../controllers/userController");

router.post("/register", handleRegister);
router.post("/verify-email/:token", handleVerifyEmail);
router.post("/login", handelLogin)

module.exports = router;
