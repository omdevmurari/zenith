import User from "../models/User.js";
import jwt from "jsonwebtoken";

export default async function auth(req, res, next) {

  try {

    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({
        message: "No token, authorization denied"
      });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "secret"
    );

    const user = await User.findById(decoded.id).select("role isDisabled");

    if (!user) {
      return res.status(401).json({
        message: "User not found"
      });
    }

    if (user.isDisabled) {
      return res.status(403).json({
        message: "Account disabled"
      });
    }

    decoded.role = user.role;
    req.user = decoded;

    next();

  } catch (error) {

    res.status(401).json({
      message: "Token not valid"
    });

  }

}
