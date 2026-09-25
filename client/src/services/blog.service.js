import api from './api';

export const getPosts = async () => {
  try {
    const response = await api.get('/posts');
    return response.data?.data ?? [];
  } catch (error) {
    return [];
  }
};

export const getPostBySlug = async (slug) => {
  try {
    const response = await api.get(`/posts/${slug}`);
    return response.data?.data ?? null;
  } catch (error) {
    return null;
  }
};
