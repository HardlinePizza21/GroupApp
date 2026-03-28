import * as authService from "./auth.service.js";

export const login = async (req, res) => {
  const { email, password } = req.body;

  const result = await authService.login(email, password);

  res.json(result);
};

export const refresh = async (req, res) => {
  const { refreshToken } = req.body;

  const result = await authService.refresh(refreshToken);

  res.json(result);
};