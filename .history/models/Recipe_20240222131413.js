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
      // {
      //   // Массив ингредиентов с ссылками на продукты и их количеством
      //   product: {
      //     type: mongoose.Schema.Types.ObjectId,
      //     ref: 'Product',
      //     required: true,
      //   },
      //   amount: {
      //     // Количество продукта в граммах
      //     type: Number,
      //     required: true,
      //     unit: String, // Единица измерения (граммы, штуки и т.д.)
      //   },
      // },
      {
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
        amount: { type: Number, required: true },
        unit: { type: String, required: true },
      },
    ],
    totalCalories: Number, // Общее количество калорий
    totalProteins: Number, // Общее количество белков
    totalFats: Number, // Общее количество жиров
    totalCarbohydrates: Number, // Общее количество углеводов

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
  console.log('Pre-save hook activated for recipe:', this.title);
  let totalCalories = 0,
    totalProteins = 0,
    totalFats = 0,
    totalCarbohydrates = 0;

  for (const ingredient of this.ingredients) {
    const product = await ProductModel.findById(ingredient.product);
    if (!product) continue;

    const amountFactor =
      ingredient.unit === 'г'
        ? ingredient.amount / 100
        : product.unitWeight
        ? (ingredient.amount * product.unitWeight) / 100
        : 0;
    totalCalories += product.calories * amountFactor;
    totalProteins += product.proteins * amountFactor;
    totalFats += product.fats * amountFactor;
    totalCarbohydrates += product.carbohydrates * amountFactor;
  }

  this.totalCalories = totalCalories;
  this.totalProteins = totalProteins;
  this.totalFats = totalFats;
  this.totalCarbohydrates = totalCarbohydrates;

  next();
});

// RecipeSchema.pre('save', async function (next) {
//   let totalCalories = 0,
//     totalProteins = 0,
//     totalFats = 0,
//     totalCarbohydrates = 0;

//   for (const ingredient of this.ingredientsList) {
//     // Поиск продукта по имени. Убедитесь, что имена продуктов уникальны.
//     const product = await ProductModel.findOne({ name: ingredient.name });

//     if (!product) continue; // Если продукт не найден, пропускаем его.

//     let amountFactor = ingredient.amount / 100;
//     if (ingredient.unit === 'шт') {
//       // Если ингредиент измеряется в штуках и для продукта указан вес одной единицы, используем его для расчетов.
//       amountFactor = (ingredient.amount * (product.unitWeight || 100)) / 100;
//     }

//     // Расчет питательных веществ с учетом количества ингредиента.
//     totalCalories += product.calories * amountFactor;
//     totalProteins += product.proteins * amountFactor;
//     totalFats += product.fats * amountFactor;
//     totalCarbohydrates += product.carbohydrates * amountFactor;
//   }

//   // Сохранение рассчитанных значений в документе рецепта.
//   this.totalCalories = totalCalories;
//   this.totalProteins = totalProteins;
//   this.totalFats = totalFats;
//   this.totalCarbohydrates = totalCarbohydrates;

//   next();
// });

// RecipeSchema.pre('save', async function (next) {
//   let totalCalories = 0,
//     totalProteins = 0,
//     totalFats = 0,
//     totalCarbohydrates = 0;

//   // Расчет на основе ингредиентов
//   for (const ingredient of this.ingredients) {
//     const product = await ProductModel.findById(ingredient.product);
//     if (!product) continue; // Если продукт не найден, пропустить его

//     const amountFactor = ingredient.amount / 100; // Количество продукта в расчете на 100 грамм
//     totalCalories += product.calories * amountFactor;
//     totalProteins += product.proteins * amountFactor;
//     totalFats += product.fats * amountFactor;
//     totalCarbohydrates += product.carbohydrates * amountFactor;
//   }

//   // Сохранение рассчитанных значений
//   this.totalCalories = totalCalories;
//   this.totalProteins = totalProteins;
//   this.totalFats = totalFats;
//   this.totalCarbohydrates = totalCarbohydrates;

//   next();
// });

//всю эту схему необходмо экспортировать/ саму схему называем как ресип и указываем саму схему
export default mongoose.model('Recipe', RecipeSchema);
