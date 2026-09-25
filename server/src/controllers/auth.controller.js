import { changeAdminPassword, loginAdmin } from '../services/auth.service.js';

export const login = async (req, res, next) => {
  try {
    const result = await loginAdmin(req.body);
    if (!result.success) {
      return res.status(401).json(result);
    }

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const updatePassword = async (req, res, next) => {
  try {
    const result = await changeAdminPassword(req.body);
    if (!result.success) {
      return res.status(400).json(result);
    }

    res.status(200).json(result);
  } catch (error) {
    if (error.code === 'ADMIN_AUTH_CONFIG_MISSING') {
      return res.status(500).json({ success: false, message: error.message });
    }
    next(error);
  }
};
