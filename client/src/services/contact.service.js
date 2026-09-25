import api from './api';

export const submitContact = async (payload) => {
  try {
    const response = await api.post('/contact', payload);
    return response.data;
  } catch (error) {
    return {
      success: false,
      message: 'Không thể gửi tin nhắn lúc này. Vui lòng gọi trực tiếp.',
      error,
    };
  }
};
