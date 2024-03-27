import ProductModel from '../models/Product.js'; // Убедитесь, что путь к модели продукта корректен

// Создание нового продукта
export const createProduct = async (req, res) => {
  try {
    const product = new ProductModel(req.body);
    await product.save();
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: 'Ошибка при создании продукта', error });
  }
};

// Получение списка всех продуктов
export const getAllProducts = async (req, res) => {
  try {
    const products = await ProductModel.find().populate('category');
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Ошибка при получении списка продуктов', error });
  }
};

// Обновление продукта
export const updateProduct = async (req, res) => {
  const { productId } = req.params;

  try {
    const updatedProduct = await ProductModel.findByIdAndUpdate(productId, req.body, { new: true });

    // Проверяем, найден ли продукт
    if (!updatedProduct) {
      return res.status(404).json({ message: 'Продукт не найден' });
    }

    // Отправляем обновленный продукт как ответ
    res.json(updatedProduct);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Ошибка при обновлении продукта', error });
  }
};

// Удаление продукта
export const deleteProduct = async (req, res) => {
  const { productId } = req.params;

  try {
    const deletedProduct = await ProductModel.findByIdAndDelete(productId);

    // Проверяем, был ли продукт найден и удален
    if (!deletedProduct) {
      return res.status(404).json({ message: 'Продукт не найден' });
    }

    // Отправляем подтверждение успешного удаления
    res.json({ message: 'Продукт успешно удален' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Ошибка при удалении продукта', error });
  }
};

// Получение продуктов по категории
export const getProductsByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params; // Получаем ID категории из параметров URL
    // Находим все продукты, принадлежащие этой категории
    const products = await ProductModel.find({ category: categoryId }).populate('category', 'name');
    // Возвращаем найденные продукты или пустой массив, если продукты не найдены
    res.json(products);
  } catch (error) {
    console.error('Ошибка при получении продуктов по категории:', error);
    res.status(500).json({ message: 'Ошибка при получении продуктов по категории', error });
  }
};

// получение продуктов от разных категорий
export const getProductsByIds = async (req, res) => {
  try {
    const { ids } = req.body; // Предполагается, что ids - это массив идентификаторов
    const products = await ProductModel.find({
      _id: { $in: ids },
    }).populate('category', 'name');

    res.json(products);
  } catch (error) {
    console.error('Ошибка при получении продуктов по идентификаторам:', error);
    res.status(500).json({ message: 'Ошибка при получении продуктов по идентификаторам', error });
  }
};

// поиск по названию продукта
export const searchProducts = async (req, res) => {
  try {
    const searchQuery = req.query.query;
    const regex = new RegExp(searchQuery, 'i'); // Создаем регулярное выражение для поиска без учета регистра
    const products = await ProductModel.find({ name: { $regex: regex } });
    res.json(products);
  } catch (error) {
    console.error('Ошибка при поиске продуктов:', error);
    res.status(500).json({ message: 'Ошибка при поиске продуктов', error });
  }
};
