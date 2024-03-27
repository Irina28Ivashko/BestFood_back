import mongoose from 'mongoose';
import ProductModel from './Product.js';

//создание схемы со свойствами пользователя
const RecipeSchema = new mongoose.Schema(
  {
    //хранит информацию, что fullname является строчкой и считается обязательной при создании пользователя
    title: {
      type: String,
      required: true, // заголовок рецепта обязателен
    },

    text: {
      type: String,
      required: true, //описание рецепта обязательно
    },

    imageUrl: String, // URL изображения рецепта
    videoUrl: String, // URL видео рецепта (необязательно)
    //у любого рецепта есть автор, ссылаться на id из бд
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true, // Связь с моделью пользователя (автора рецепта)
    },

    // есть возможность оставить комментарии
    comments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comment',
      },
    ],

    ingredients: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
        amount: { type: Number, required: true },
        unit: { type: String, required: true },
      },
    ],

    totalCalories: { type: Number, default: 0 }, // Общее количество калорий для всего рецепта
    totalProteins: { type: Number, default: 0 }, // Общее количество белков для всего рецепта
    totalFats: { type: Number, default: 0 }, // Общее количество жиров для всего рецепта
    totalCarbohydrates: { type: Number, default: 0 }, // Общее количество углеводов для всего рецепта

    portionsCalculator: Number, // Калькулятор порций
    ingredientsList: Array, // Список ингредиентов
    calories: Number, // Количество калорий
    cookingTime: Number, // Время приготовления
    stepByStepInstructions: Array, // Пошаговая инструкция

    //есть информация о пароле, которая зашифрованна
    tags: {
      type: Array,
      default: [], // категории рецепта из каталога
    },

    //Количество просмотров у рецепта
    viewsCount: {
      type: Number,
      default: 0,
    },

    // кол-во лайков
    likesCount: {
      type: Number,
      default: 0,
    },

    // likes: [{ type: Schema.Types.ObjectId, ref: 'User' }],

    // кол-во порций в рецепте
    portionsCount: {
      type: Number,
      required: true,
      default: 1, // Значение по умолчанию, если не указано
    },
  },
  {
    //помимо этих свойств выше, должны быть еще ифнормация о создании и обновлении
    timestamps: true, // Включение временных меток (для createdAt и updatedAt)
  },
);

// Pre-save хук для расчета питательных веществ
RecipeSchema.pre('save', async function (next) {
  let totalWeightGrams = 0;
  let totalCalories = 0,
    totalProteins = 0,
    totalFats = 0,
    totalCarbohydrates = 0;

  for (const ingredient of this.ingredients) {
    const product = await ProductModel.findById(ingredient.product);
    if (!product) continue;

    let weightGrams = 0;
    switch (ingredient.unit) {
      case 'гр':
        weightGrams = ingredient.amount;
        break;
      case 'шт':
        weightGrams = product.unitWeight ? ingredient.amount * product.unitWeight : 0;
        break;
      case 'ст.л':
        weightGrams = product.measurements?.tablespoon?.gramsEquivalent * ingredient.amount || 0;
        break;
      case 'ч.л':
        weightGrams = product.measurements?.teaspoon?.gramsEquivalent * ingredient.amount || 0;
        break;
      case 'стакан':
        weightGrams = product.measurements?.cup?.gramsEquivalent * ingredient.amount || 0;
        break;
      case 'мл':
        weightGrams = product.isLiquid ? ingredient.amount : 0; // Предполагаем, что 1 мл = 1 г для жидкостей
        break;
      default:
        console.error(`Неизвестная единица измерения: ${ingredient.unit}`);
    }

    totalWeightGrams += weightGrams;
    totalCalories += (product.calories * weightGrams) / 100;
    totalProteins += (product.proteins * weightGrams) / 100;
    totalFats += (product.fats * weightGrams) / 100;
    totalCarbohydrates += (product.carbohydrates * weightGrams) / 100;
  }

  if (totalWeightGrams > 0) {
    this.totalCalories = (totalCalories / totalWeightGrams) * 100;
    this.totalProteins = (totalProteins / totalWeightGrams) * 100;
    this.totalFats = (totalFats / totalWeightGrams) * 100;
    this.totalCarbohydrates = (totalCarbohydrates / totalWeightGrams) * 100;
  }

  next();
});

//всю эту схему необходмо экспортировать/ саму схему называем как ресип и указываем саму схему
export default mongoose.model('Recipe', RecipeSchema);
