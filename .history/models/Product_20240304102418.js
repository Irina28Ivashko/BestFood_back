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

    name: { type: String, required: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    calories: { type: Number, required: true }, // калорийность
    proteins: { type: Number, required: true }, // белки
    fats: { type: Number, required: true }, // жиры
    carbohydrates: { type: Number, required: true }, // углеводы
    glycemicIndex: {
      default: { type: Number, default: null },
      perCup: { type: Number, default: null },
      perTablespoon: { type: Number, default: null },
    },
    isLiquid: { type: Boolean, default: false }, // Является ли продукт жидкостью
    volume: {
      // Объемные характеристики продукта, если это жидкость
      perCup: { type: Number, default: null }, // объем в мл на 1 стакан
      perTablespoon: { type: Number, default: null }, // объем в мл на 1 столовую ложку
    },
    unit: { type: String, default: 'гр' }, // единица измерения, гр для твердых продуктов, мл для жидкостей
  },
  { timestamps: true },
);

export default mongoose.model('Product', ProductSchema);
