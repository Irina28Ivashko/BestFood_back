import CategoryModel from '../models/Category.js';

// Создание новой категории
export const createCategory = async (req, res) => {
  if (!req.user) {
    return res.status(403).json({ message: 'Неавторизованный доступ' });
  }
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
// export const updateCategory = async (req, res) => {
//   if (!req.user) {
//     return res.status(401).json({ message: 'Неавторизованный доступ' });
//   }
//   const { categoryId } = req.params;
//   if (!mongoose.Types.ObjectId.isValid(categoryId)) {
//     return res.status(400).json({ message: 'Некорректный ID категории' });
//   }

//   try {
//     const { categoryId } = req.params;
//     const updatedCategory = await CategoryModel.findByIdAndUpdate(categoryId, req.body, {
//       new: true,
//     });
//     res.status(200).json(updatedCategory);
//   } catch (error) {
//     res.status(500).json({ message: 'Ошибка при обновлении категории', error });
//   }
// };

export const updateCategory = async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Неавторизованный доступ' });
  }
  const { categoryId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(categoryId)) {
    return res.status(400).json({ message: 'Некорректный ID категории' });
  }
  try {
    const updatedCategory = await CategoryModel.findByIdAndUpdate(categoryId, req.body, {
      new: true,
    });
    if (!updatedCategory) {
      return res.status(404).json({ message: 'Категория не найдена' });
    }
    res.status(200).json(updatedCategory);
  } catch (error) {
    res.status(500).json({ message: 'Ошибка при обновлении категории', error });
  }
};

// Удаление категории
export const deleteCategory = async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Неавторизованный доступ' });
  }
  const { categoryId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(categoryId)) {
    return res.status(400).json({ message: 'Некорректный ID категории' });
  }
  try {
    const deletedCategory = await CategoryModel.findByIdAndDelete(categoryId);
    if (!deletedCategory) {
      return res.status(404).json({ message: 'Категория не найдена' });
    }
    res.status(200).json({ message: 'Категория удалена' });
  } catch (error) {
    res.status(500).json({ message: 'Ошибка при удалении категории', error });
  }
};
// export const deleteCategory = async (req, res) => {
//   try {
//     const { categoryId } = req.params;
//     await CategoryModel.findByIdAndDelete(categoryId);
//     res.status(200).json({ message: 'Категория удалена' });
//   } catch (error) {
//     res.status(500).json({ message: 'Ошибка при удалении категории', error });
//   }
// };
