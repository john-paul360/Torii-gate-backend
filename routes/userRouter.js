const router = require("express").Router();
const {
  handleRegister,
  handleVerifyEmail,
  handelLogin,
  resendVerificationEmail,
} = require("../controllers/userController");

router.post("/register", handleRegister);
router.post("/verify-email/:token", handleVerifyEmail);
router.post("/login", handelLogin);
router.post("/resend-email", resendVerificationEmail);

module.exports = router;
