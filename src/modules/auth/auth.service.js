import { generateToken } from "../../utils/jwt.js";

export const login = async (email, password) => {
  // mock inicial
  const user = { id: 1, email };

  const token = generateToken({
    userId: user.id
  });

  return { token };
};