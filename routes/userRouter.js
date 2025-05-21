const router = require("express").Router();
const {
  handleRegister,
  handleVerifyEmail,
  handelLogin,
  resendVerificationEmail,
  handleForgotPassword,
  handleResetPassword,
} = require("../controllers/userController");

router.post("/register", handleRegister);
router.post("/verify-email/:token", handleVerifyEmail);
router.post("/login", handelLogin);
router.post("/resend-email", resendVerificationEmail);
router.post("/forgot-password", handleForgotPassword);
router.post("/reset-password", handleResetPassword); 

module.exports = router;
