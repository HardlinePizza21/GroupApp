import prisma from '../../config/db.js'
import bcrypt from 'bcrypt'
import {
  generateToken,
  generateRefreshToken
} from "../../utils/jwt.js";

export const login = async (email, password) => {
  //Buscar el usuario con el ORM de prisma
  const user = await prisma.user.findUnique({
    where: { email }
  })

  if (!user) {
    throw new Error("Invalid Credentials")
  }

  //Comparar contraseñas encriptadas
  const isValidPassword = await bcrypt.compare(password, user.password)

  if (!isValidPassword) {
    throw new Error("Invalid credentials")
  }

  //Crea un payload minimo 
  const payload = { userId: user.id };

  const accessToken = generateToken(payload);
  const refreshToken = generateRefreshToken(payload);

  return {
    accessToken,
    refreshToken,
    user: {
      id: user.id,
      email: user.email,
      username: user.username
    }
  }
}

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