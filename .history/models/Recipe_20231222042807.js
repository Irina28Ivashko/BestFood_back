//структура списка пользователей

import mongoose from 'mongoose';

//создание схемы со свойствами пользователя
const RecipeSchema = new mongoose.Schema(
  {
    //хранит информацию, что fullname является строчкой и считается обязательной при создании пользователя
    title: {
      type: String,
      required: true, // заголовок рецепта обязателен
    },

    //есть почта, она должна быть уникальной
    text: {
      type: String,
      required: true, //описание рецепта обязательно
      unique: true,
    },

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

    //у любого рецепта есть автор, ссылаться на id из бд
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true, // Связь с моделью пользователя (автора рецепта)
    },

    //есть картина, но не обязательный, поэтому передаем сразу тип стринг
    imageUrl: String,
    videoUrl: String, // URL видео рецепта (необязательно)
  },
  {
    //помимо этих свойств выше, должны быть еще ифнормация о создании и обновлении
    timestamps: true, // Включение временных меток (для createdAt и updatedAt)
  },
);

//всю эту схему необходмо экспортировать/ саму схему называем как юзер и указываем саму схему
export default mongoose.model('Recipe', RecipeSchema);
