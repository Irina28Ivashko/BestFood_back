import mongoose from 'mongoose';

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

    portionsCalculator: Number, // Калькулятор порций
    ingredientsList: Array, // Список ингредиентов
    calories: Number, // Количество калорий
    cookingTime: Number, // Время приготовления
    stepByStepInstructions: Array, // Пошаговая инструкция
    comments: Array, // Комментарии к рецепту

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

//всю эту схему необходмо экспортировать/ саму схему называем как ресип и указываем саму схему
export default mongoose.model('Recipe', RecipeSchema);