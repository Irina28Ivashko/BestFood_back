//структура списка пользователей

import mongoose from 'mongoose';

//создание схемы со свойствами пользователя
const UserSchema = new mongoose.Schema(
  {
    //хранит информацию, что fullname является строчкой и считается обязательной при создании пользователя
    fullName: {
      type: String,
      required: true,
    },

    //есть почта, она должна быть уникальной
    email: {
      type: String,
      required: true,
      unique: true,
    },

    //есть информация о пароле, которая зашифрованна
    passwordHash: {
      type: String,
      required: true,
    },

    //есть аватар, но не обязательный, поэтому передаем сразу тип стринг
    avatarUrl: String,

    //для административных прав пользователя
    isAdmin: {
      type: Boolean,
      default: false, // По умолчанию пользователи не являются администраторами
    },

    //  поле для хранения избранных рецептов
    favoriteRecipes: [
      {
        type: mongoose.Schema.Types.ObjectId, // Ссылка на ID рецепта
        ref: 'Recipe', // Связь с моделью Recipe
      },
    ],

    //  поле для хранения понравившихся рецептов (likes)
    likeRecipes: [
      {
        type: mongoose.Schema.Types.ObjectId, // Ссылка на ID рецепта
        ref: 'Recipe', // Связь с моделью Recipe
      },
    ],
  },

  {
    //помимо этих свойств выше, должны быть еще ифнормация о создании и обновлении (дата и время)
    timestamps: true,
  },
);

//всю эту схему необходмо экспортировать/ саму схему называем как юзер и указываем саму схему
export default mongoose.model('User', UserSchema);
