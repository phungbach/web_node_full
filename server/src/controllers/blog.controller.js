import {
  createPost,
  deletePost,
  getPostBySlug,
  getPosts,
  updatePost,
} from '../services/blog.service.js';

export const listPosts = async (req, res, next) => {
  try {
    const posts = await getPosts();
    res.json({ success: true, message: 'Success', data: posts });
  } catch (error) {
    next(error);
  }
};

export const getSinglePost = async (req, res, next) => {
  try {
    const post = await getPostBySlug(req.params.slug);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found', data: null });
    }

    res.json({ success: true, message: 'Success', data: post });
  } catch (error) {
    next(error);
  }
};

export const createNewPost = async (req, res, next) => {
  try {
    const post = await createPost(req.body);
    res.status(201).json({ success: true, message: 'Post created', data: post });
  } catch (error) {
    next(error);
  }
};

export const updateExistingPost = async (req, res, next) => {
  try {
    const post = await updatePost(req.params.id, req.body);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found', data: null });
    }

    res.json({ success: true, message: 'Post updated', data: post });
  } catch (error) {
    next(error);
  }
};

export const deleteExistingPost = async (req, res, next) => {
  try {
    const post = await deletePost(req.params.id);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found', data: null });
    }

    res.json({ success: true, message: 'Post deleted', data: post });
  } catch (error) {
    next(error);
  }
};
