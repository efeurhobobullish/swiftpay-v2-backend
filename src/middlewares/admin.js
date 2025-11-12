import { StatusCodes } from "http-status-codes";

/**
 * Ensures user is authenticated and has admin privileges.
 */
export const isAdmin = (req, res, next) => {
  try {
    if (!req.user || !req.user.isAdmin) {
      return res.status(StatusCodes.FORBIDDEN).json({
        success: false,
        message: "Access denied. Admins only.",
      });
    }
    next();
  } catch {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ success: false, message: "Internal server error" });
  }
};