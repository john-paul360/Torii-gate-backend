const USER = require("../models/user");
const bcrypt = require("bcryptjs");
const generateToken = require("../helpers/generateToken");
const { sendWelcomeEmail } = require("../email/sendEmail");
const jwt = require("jsonwebtoken");

const handleRegister = async (req, res) => {
  const { fullName, email, password, phoneNumber, role } = req.body;
  try {
    //check if user exists (email and phoneNumber)
    //$or
    const existingUser = await USER.findOne({
      $or: [{ email: email || null }, { phoneNumber: phoneNumber || null }],
    });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "Email or Phone number already exists" });
    }

    //protect users password
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);
    //verify process
    const verificationToken = generateToken();
    const verificationTokenExpires = Date.now() + 24 * 60 * 60 * 1000;
    //save to db
    const user = await USER.create({
      fullName,
      email,
      password: hashedPassword,
      role: role || "tenant",
      phoneNumber,
      verificationToken,
      verificationTokenExpires,
    });

    //Send an email
    const clientUrl = `${process.env.FRONTEND_URL}/verify-email/${verificationToken}`;
    await sendWelcomeEmail({
      email: user.email,
      fullName: user.fullName,
      clientUrl,
    });

    return res
      .status(201)
      .json({ success: true, message: "User Registered successfully", user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

const handleVerifyEmail = async (req, res) => {
  const { token } = req.params;
  try {
    //1. find user by token
    const user = await USER.findOne({
      verificationToken: token,
    });
    if (!user) {
      return res.status(404).json({ message: "Invalid Verification token" });
    }
    // 2. check if token have expired
    if (user.verificationTokenExpires < Date.now()) {
      return res
        .status(400)
        .json({ message: "Verification token has expired", email: user.email });
    }
    // 3. check if user is already verified
    if (user.isVerified) {
      return res.status(400).json({ message: "Email is already verified" });
    }
    //mark the user as verified
    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;
    await user.save();
    return res.status(200).json({
      success: true,
      message: "Email verified successfully",
    });
  } catch (error) {
    console.error(error);
  }
};

// handleLogin

const handelLogin = async (req, res) => {
  const { email, password, role } = req.body;
  if (!email || !password || !role) {
    return res
      .status(400)
      .json({ message: "Email, Password and role are required" });
  }
  try {
    const user = await USER.findOne({ email });
    if (!user) {
      return res
        .status(403)
        .json({ message: "Account Not Found, please click to Register" });
    }
    if (user.role !== role) {
      return res.status(401).json({ mesage: "Access Denied for this Role" });
    }
    if (!user.isVerified) {
      return res
        .status(403)
        .json({ message: "Email not Verified, Check your mail" });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (!isPasswordCorrect) {
      return res.status(401).json({ message: "Invalide email or Password" });
    }
    // generating a token (validity, period)
    const token = jwt.sign({email: user.email, role: user.role},
      process.env.JWT_SECRET, {expireIn: "3 days"})

    return res.status(200).json({
      success: true,
      token,
      user: {
        fullName: user.fullName,
        email: user.email,
        profilePicture: user.profilePicture,
        role: user.role,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = { handleRegister, handleVerifyEmail, handelLogin };
