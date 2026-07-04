import { Request, Response, NextFunction } from "express";
import { User } from "server/models/User";

interface AuthRequest extends Request {
  userId?: string;
}

export const adminAuthorize = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(401).json({
        message: "Unauthorized",
      });

      return;
    }

    const user = await User.findById(req.userId).select("role");

    if (!user) {
      res.status(401).json({
        message: "User not found",
      });

      return;
    }

    if (user.role !== "admin") {
      res.status(403).json({
        message: "Access denied. Admins only.",
      });

      return;
    }

    next();
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Authorization failed",
    });
  }
};
