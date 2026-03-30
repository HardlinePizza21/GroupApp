import * as authService from "./auth.service.js";

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const result = await authService.login(email, password);

    res.json(result);

  } catch (error) {
    res.status(401).json({
      error: error.message
    });
  }

};

export const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // validación básica (suficiente para universidad)
    if (!username || !email || !password) {
      return res.status(400).json({
        error: "All fields are required"
      });
    }

    const result = await authService.register(username, email, password);

    res.status(201).json(result);
  } catch (error) {
    res.status(400).json({
      error: error.message
    });
  }
}

export const refresh = async (req, res) => {

  const { refreshToken } = req.body;

  const result = await authService.refresh(refreshToken);

  res.json(result);
};