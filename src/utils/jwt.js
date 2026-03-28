import jwt from "jsonwebtoken";

export const generateToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: "1h"
  });
};

export const generateRefreshToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
    expiresIn: "7d"
  });
};

export const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};