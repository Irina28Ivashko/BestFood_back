import CategoryModel from '../models/Category.js';

// Создание новой категории
export const createCategory = async (req, res) => {
  try {
    const { name } = req.body;

    // Проверка на уникальность имени категории
    const existingCategory = await CategoryModel.findOne({ name });
    if (existingCategory) {
      return res.status(400).json({ message: 'Категория с таким именем уже существует' });
    }

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
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: 'Ошибка при получении списка категорий', error });
  }
};

// Обновление категории
export const updateCategory = async (req, res) => {
  const { categoryId } = req.params;

  try {
    // Находим категорию по ID и обновляем её данными из запроса
    const updatedCategory = await CategoryModel.findByIdAndUpdate(categoryId, req.body, {
      new: true,
    });

    // Проверяем, найдена ли категория
    if (!updatedCategory) {
      return res.status(404).json({ message: 'Категория не найдена' });
    }

    // Отправляем обновленную категорию как ответ
    res.json(updatedCategory);
  } catch (error) {
    console.error(error); // Логирование ошибки для отладки
    res.status(500).json({ message: 'Не удалось обновить категорию', error });
  }
};

// Удаление категории
export const deleteCategory = async (req, res) => {
  const { categoryId } = req.params;

  try {
    // Находим категорию по ID и удаляем её
    const deletedCategory = await CategoryModel.findByIdAndDelete(categoryId);

    // Проверяем, была ли категория найдена и удалена
    if (!deletedCategory) {
      return res.status(404).json({ message: 'Категория не найдена' });
    }

    // Отправляем подтверждение успешного удаления
    res.json({ message: 'Категория успешно удалена' });
  } catch (error) {
    console.error(error); // Логирование ошибки для отладки
    res.status(500).json({ message: 'Не удалось удалить категорию', error });
  }
};
