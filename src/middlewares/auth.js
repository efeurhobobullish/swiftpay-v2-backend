import jwt from "jsonwebtoken";
import { StatusCodes } from "http-status-codes";
import process from "process";
import User from "../models/user.model.js";

export const isAuthenticated = async (req, res, next) => {
  const { authorization } = req.headers;
  if (!authorization) {
    return res.status(401).json({
      success: false,
      message: "Authorization header is required",
    });
  }
  const token = authorization.split(" ")[1];
  try {
    if (!token) {
      return res
        .status(StatusCodes.UNAUTHORIZED)
        .json({ error: "Token is required" });
    }
    const decoded = jwt.verify(token, process.env.SECRET);
    if (!decoded) {
      return res.status(401).json({
        success: false,
        message: "Session expired",
      });
    }
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res
        .status(StatusCodes.UNAUTHORIZED)
        .json({ error: "User not found!" });
    }
    req.user = user;
    req.token = token;
    next();
  } catch (error) {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: error.message });
  }
};
