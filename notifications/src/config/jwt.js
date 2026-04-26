import jwt from "jsonwebtoken";

export const verifyToken = (token) => {
  const secret = process.env.JWT_SECRET;
  
  if (!secret) {
    throw new Error("JWT_SECRET not configured");
  }

  return jwt.verify(token, secret);
};
