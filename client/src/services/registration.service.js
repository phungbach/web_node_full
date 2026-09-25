import api from './api';

export const submitRegistration = async (payload) => {
  try {
    const response = await api.post('/registrations', payload);
    return response.data;
  } catch (error) {
    return {
      success: false,
      message: 'Không thể gửi đăng ký lúc này. Vui lòng gọi trực tiếp.',
      error,
    };
  }
};
