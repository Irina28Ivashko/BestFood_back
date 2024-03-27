import CategoryModel from '../models/Category.js';

// Создание новой категории
export const createCategory = async (req, res) => {
  try {
    const { name } = req.body;
    const category = new CategoryModel({ name });
    await category.save();
    res.json(category); // успешное создание
  } catch (error) {
    res.status(500).json({ message: 'Ошибка при создании категории', error });
  }
};

// Получение списка всех категорий
export const getAllCategories = async (req, res) => {
  try {
    const categories = await CategoryModel.find();
    res.status(200).json(categories);
  } catch (error) {
    res.status(500).json({ message: 'Ошибка при получении списка категорий', error });
  }
};

// Обновление категории
export const updateCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const updatedCategory = await CategoryModel.findByIdAndUpdate(categoryId, req.body, {
      new: true,
    });
    res.status(200).json(updatedCategory);
  } catch (error) {
    res.status(500).json({ message: 'Ошибка при обновлении категории', error });
  }
};

// Удаление категории
export const deleteCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    await CategoryModel.findByIdAndDelete(categoryId);
    res.status(200).json({ message: 'Категория удалена' });
  } catch (error) {
    res.status(500).json({ message: 'Ошибка при удалении категории', error });
  }
};
