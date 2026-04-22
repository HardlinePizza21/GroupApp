import prisma from './config/db.js'
import bcrypt from 'bcrypt'
import {
  generateToken,
  generateRefreshToken,
  verifyToken
} from "./utils/jwt.js";

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

  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      userId: user.id
    }
  });

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

export const register = async (username, email, password) => {
  // 1. Verificar si ya existe
  const existingUser = await prisma.user.findUnique({
    where: { email }
  });

  if (existingUser) {
    throw new Error("User already exists");
  }

  // 2. Hashear contraseña
  const hashedPassword = await bcrypt.hash(password, 10);

  // 3. Crear usuario
  const user = await prisma.user.create({
    data: {
      username,
      email,
      password: hashedPassword
    }
  });

  return {
    id: user.id,
    email: user.email,
    username: user.username
  };
};

export const refresh = async (refreshToken) => {
  try {

    const decoded = verifyToken(
      refreshToken,
      process.env.JWT_REFRESH_SECRET
    );

    // 2. Verificar que exista en DB
    const storedToken = await prisma.refreshToken.findUnique({
      where: { token: refreshToken }
    });

    if (!storedToken) {
      throw new Error("Invalid refresh token");
    }

    // 3. Generar nuevo access token
    const newAccessToken = generateToken({
      userId: decoded.userId
    });

    return { accessToken: newAccessToken };

  } catch {
    throw new Error("Invalid refresh token");
  }
};

export const logout = async (refreshToken) => {
  await prisma.refreshToken.deleteMany({
    where: { token: refreshToken }
  });
};