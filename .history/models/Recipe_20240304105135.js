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
  let totalWeight = 0; // Добавляем переменную для общего веса рецепта
  let totalCalories = 0,
    totalProteins = 0,
    totalFats = 0,
    totalCarbohydrates = 0;

  for (const ingredient of this.ingredients) {
    const product = await ProductModel.findById(ingredient.product);
    if (!product) continue;

    let weight =
      ingredient.unit === 'гр'
        ? ingredient.amount
        : ingredient.unit === 'шт'
        ? ingredient.amount * product.unitWeight
        : 0;
    totalWeight += weight; // Суммируем вес каждого ингредиента

    // Пересчетный коэффициент для расчета на 100 грамм продукта
    totalCalories += (product.calories * weight) / 100;
    totalProteins += (product.proteins * weight) / 100;
    totalFats += (product.fats * weight) / 100;
    totalCarbohydrates += (product.carbohydrates * weight) / 100;
  }
  // Приведение питательных веществ к 100 граммам общего веса рецепта
  if (totalWeight > 0) {
    // Убедитесь, что общий вес больше 0, чтобы избежать деления на ноль
    // Приведение питательных веществ к 100 граммам общего веса рецепта
    this.totalCalories = (totalCalories * 100) / totalWeight;
    this.totalProteins = (totalProteins * 100) / totalWeight;
    this.totalFats = (totalFats * 100) / totalWeight;
    this.totalCarbohydrates = (totalCarbohydrates * 100) / totalWeight;
  }

  next();
});

//всю эту схему необходмо экспортировать/ саму схему называем как ресип и указываем саму схему
export default mongoose.model('Recipe', RecipeSchema);
