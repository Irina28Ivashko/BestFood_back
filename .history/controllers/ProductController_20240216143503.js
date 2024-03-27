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
// export const getProductsByCategory = async (req, res) => {
//   try {
//     const { categoryId } = req.params; // Получаем ID категории из параметров URL
//     // Находим все продукты, принадлежащие этой категории
//     const products = await ProductModel.find({ category: categoryId }).populate('category', 'name');
//     if (products.length === 0) {
//       // Если продукты не найдены, отправляем ответ с пустым массивом
//       return res.status(404).json({ message: 'Продукты в этой категории не найдены' });
//     }
//     res.json(products); // Отправляем найденные продукты в ответе
//   } catch (error) {
//     console.error('Ошибка при получении продуктов по категории:', error);
//     res.status(500).json({ message: 'Ошибка при получении продуктов по категории', error });
//   }
// };

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
