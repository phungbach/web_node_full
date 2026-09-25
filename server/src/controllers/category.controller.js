import { createCategory, deleteCategory, getCategories, updateCategory } from '../services/category.service.js';

export const listCategories = async (req, res, next) => {
  try {
    const categories = await getCategories();
    res.json({ success: true, message: 'Success', data: categories });
  } catch (error) {
    next(error);
  }
};

export const createCategoryEntry = async (req, res, next) => {
  try {
    const category = await createCategory(req.body);
    res.status(201).json({ success: true, message: 'Category created', data: category });
  } catch (error) {
    next(error);
  }
};

export const updateCategoryEntry = async (req, res, next) => {
  try {
    const category = await updateCategory(req.params.id, req.body);
    if (!category) return res.status(404).json({ success: false, message: 'Category not found', data: null });
    res.json({ success: true, message: 'Category updated', data: category });
  } catch (error) {
    next(error);
  }
};

export const deleteCategoryEntry = async (req, res, next) => {
  try {
    const category = await deleteCategory(req.params.id);
    if (!category) return res.status(404).json({ success: false, message: 'Category not found', data: null });
    res.json({ success: true, message: 'Category deleted', data: category });
  } catch (error) {
    next(error);
  }
};
