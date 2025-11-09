import { StatusCodes } from "http-status-codes";
import UserModel from "../models/user.model.js";
import sendEmail from "../utils/sendEmail.js";
import { register as registerEmail } from "../Emails/register.js";
// import { login as loginEmail } from "../Emails/login.js";
import { resendOtpEmail } from "../Emails/resendOtpEmail.js";
import jwt from "jsonwebtoken"
import process from "process"

export const register = async (req, res) => {
  const { name, email, phone } = req.body;

  if (!name || !email || !phone) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      message: "All fields are required",
    });
  }

  try {
    const existingUser = await UserModel.findOne({
      $or: [{ email }, { phone }],
    });

    if (existingUser) {
      const conflictField =
        existingUser.email === email ? "email" : "phone number";
      return res.status(StatusCodes.CONFLICT).json({
        message: `User with this ${conflictField} already exists!`,
      });
    }

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const otpCodeExpires = new Date(Date.now() + 10 * 60 * 1000);

    const user = await UserModel.create({
      name,
      email,
      phone,
      otpCode,
      otpCodeExpires,
    });

    await sendEmail(
      user.email,
      "User Registration",
      registerEmail(user.name, user.email, otpCode)
    );

    return res.status(StatusCodes.CREATED).json({
      message: "OTP sent to your email",
      success: true,
    });
  } catch (error) {
    console.error("Registration error:", error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Internal server error",
    });
  }
};

export const verifyOtp = async (req, res) => {
  const { email, otpCode } = req.body;
  try {
    const user = await UserModel.findOne({ email });
    if (!user) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: "User not found" });
    }
    if (user.otpCode !== otpCode) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: "Invalid OTP" });
    }
    if (user.otpCodeExpires < Date.now()) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: "OTP expired" });
    }
    user.isVerified = true;
    user.otpCode = "",
    user.otpCodeExpires = "",

    await user.save();
    const token = jwt.sign({ userId: user.id }, process.env.SECRET, {
      expiresIn: "7d",
    });

    res.status(StatusCodes.OK).json({
      message: "OTP verified successfully!",
      success: true,
      token,
      user,
    });
  } catch (error) {
    console.log(error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: "Internal server error" });
  }
};

export const resendOtp = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await UserModel.findOne({ email });
    if (!user) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: "User not found" });
    }
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const otpCodeExpires = new Date(Date.now() + 10 * 60 * 1000);
    user.otpCode = otpCode;
    user.otpCodeExpires = otpCodeExpires;
    await user.save();
    await sendEmail(
      user.email,
      "Resend OTP",
      resendOtpEmail(user.name, user.email, otpCode)
    );
    res.status(StatusCodes.OK).json({
      message: "OTP sent to your email",
      success: true,
    });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Internal server error",
      error: error.message,
      success: false,
    });
  }
};

export const login = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await UserModel.findOne({ email });
    if (!user) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: "User not found" });
    }
    const token = jwt.sign({ userId: user.id }, process.env.SECRET, {
      expiresIn: "7d",
    });

    // await sendEmail(user.email, "Questpay Login", loginEmail(user.name));

    res.status(StatusCodes.OK).json({
      message: "Login successful",
      user,
      token,
      success: true,
    });
  } catch (error) {
    console.log(error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Internal server error",
      error: error.message,
      success: false,
    });
  }
};

export const checkAuth = async (req, res) => {
  try {
    const user = await UserModel.findById(req.user.id);
    res.status(StatusCodes.OK).json({
      message: "User is authenticated",
      success: true,
      user,
      token: req.token,
    });
  } catch (error) {
    console.log(error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Internal server error",
      error: error.message,
      success: false,
    });
  }
};
