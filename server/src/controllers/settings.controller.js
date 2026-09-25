import { getSettings, updateSettings } from '../services/settings.service.js';

export const getSiteSettings = async (req, res, next) => {
  try {
    const settings = await getSettings();
    res.json({ success: true, message: 'Success', data: settings });
  } catch (error) {
    next(error);
  }
};

export const updateSiteSettings = async (req, res, next) => {
  try {
    const settings = await updateSettings(req.body);
    res.json({ success: true, message: 'Settings updated', data: settings });
  } catch (error) {
    next(error);
  }
};
