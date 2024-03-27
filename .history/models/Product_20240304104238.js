import mongoose from 'mongoose';

//модель продуктов питания
const ProductSchema = new mongoose.Schema(
  {
    //     name: { type: String, required: true },
    //     category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    //     calories: { type: Number, required: true }, //калорий
    //     proteins: { type: Number, required: true }, //белик
    //     fats: { type: Number, required: true }, // жиры
    //     carbohydrates: { type: Number, required: true }, //углеводы
    //     glycemicIndex: { type: Number, default: null }, // гликемический индекс
    //
    //     unitWeight: { type: Number, default: null }, //  вес одной единицы продукта
    //     unit: { type: String, default: 'гр' }, // единицу измерения
    //   },
    //   { timestamps: true },
    // );

    // Название продукта
    name: {
      type: String,
      required: true,
    },

    // Ссылка на категорию продукта
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
    },

    // Калорийность продукта на 100 грамм/мл
    calories: {
      type: Number,
      required: true,
    },

    // Количество белков на 100 грамм/мл
    proteins: {
      type: Number,
      required: true,
    },

    // Количество жиров на 100 грамм/мл
    fats: {
      type: Number,
      required: true,
    },

    // Количество углеводов на 100 грамм/мл
    carbohydrates: {
      type: Number,
      required: true,
    },

    // Является ли продукт жидкостью
    isLiquid: {
      type: Boolean,
      default: false,
    },

    // Объект, содержащий информацию о различных мерах измерения и их эквивалентах
    measurements: {
      cup: {
        value: Number, // Количество в "стаканах"
        gramsEquivalent: Number, // Эквивалент в граммах
        mlEquivalent: Number, // Эквивалент в миллилитрах
      },
      tablespoon: {
        value: Number, // Количество в "столовых ложках"
        gramsEquivalent: Number, // Эквивалент в граммах
        mlEquivalent: Number, // Эквивалент в миллилитрах
      },
      teaspoon: {
        value: Number, // Количество в "чайных ложках"
        gramsEquivalent: Number, // Эквивалент в граммах
        mlEquivalent: Number, // Эквивалент в миллилитрах
      },
      // Можно добавить дополнительные меры измерения по необходимости
    },

    // Единица измерения (по умолчанию: граммы для твердых продуктов, мл для жидкостей)
    unit: {
      type: String,
      default: 'гр',
    },
  },
  { timestamps: true },
); // Включаем временные метки для отслеживания создания и обновления записей

export default mongoose.model('Product', ProductSchema);
