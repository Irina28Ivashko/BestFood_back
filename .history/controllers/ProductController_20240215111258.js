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
  try {
    const { productId } = req.params;
    await ProductModel.findByIdAndDelete(productId);
    res.json({ message: 'Продукт удален' });
  } catch (error) {
    res.status(500).json({ message: 'Ошибка при удалении продукта', error });
  }
};
