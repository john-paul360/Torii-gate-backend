const router = require("express").Router();
const {
  handleRegister,
  handleVerifyEmail,
  handelLogin,
  resendVerificationEmail,
  handleForgotPassword,
  handleResetPassword,
  handleGetUser,
  handleUpdateUser,
} = require("../controllers/userController");
const { isLoggedIn, requirePermissions } = require("../middleware/auth");

router.post("/register", handleRegister);
router.post("/verify-email/:token", handleVerifyEmail);
router.post("/login", handelLogin);
router.post("/resend-email", resendVerificationEmail);
router.post("/forgot-password", handleForgotPassword);
router.post("/reset-password", handleResetPassword);
router.get("/user", isLoggedIn, handleGetUser);
router.patch(
  "/user",
  isLoggedIn,
  requirePermissions("landlord"),
  handleUpdateUser
);

module.exports = router;
