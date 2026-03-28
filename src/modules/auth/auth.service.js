import {
  generateToken,
  generateRefreshToken
} from "../../utils/jwt.js";

export const login = async (email, password) => {
  //TODO: Validar contra la base de datos que el usuario exista
  const user = { id: 1, email };

  const payload = { userId: user.id };

  const accessToken = generateToken(payload);
  const refreshToken = generateRefreshToken(payload);

  return { accessToken, refreshToken };
};

export const refresh = async (refreshToken) => {
  try {
    const decoded = verifyToken(
      refreshToken,
      process.env.JWT_REFRESH_SECRET
    );

    const newAccessToken = generateAccessToken({
      userId: decoded.userId
    });

    return { accessToken: newAccessToken };

  } catch {
    throw new Error("Invalid refresh token");
  }
};