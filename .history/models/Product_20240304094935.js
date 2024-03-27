import mongoose from 'mongoose';

//модель продуктов питания
const ProductSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    calories: { type: Number, required: true }, //калорий
    proteins: { type: Number, required: true }, //белик
    fats: { type: Number, required: true }, // жиры
    carbohydrates: { type: Number, required: true }, //углеводы
    // glycemicIndex: { type: Number, default: null }, // гликемический индекс
    glycemicIndex: {
      default: { type: Number, default: null }, // гликемический индекс по умолчанию (если применимо)
      perCup: { type: Number, default: null }, // гликемический индекс на 1 стакан
      perTablespoon: { type: Number, default: null }, // гликемический индекс на 1 столовую ложку
    },
    unitWeight: { type: Number, default: null }, //  вес одной единицы продукта
    unit: { type: String, default: 'гр' }, // единицу измерения
  },
  { timestamps: true },
);

export default mongoose.model('Product', ProductSchema);
