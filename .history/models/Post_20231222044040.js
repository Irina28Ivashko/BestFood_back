//структура списка пользователей

import mongoose from 'mongoose';

//создание схемы со свойствами пользователя
const PostSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },

    //есть почта, она должна быть уникальной
    text: {
      type: String,
      required: true,
      unique: true,
    },

    //есть информация о пароле, которая зашифрованна
    tags: {
      type: Array,
      default: [],
    },

    //Количество просмотров у статьи
    viewsCount: {
      type: Number,
      default: 0,
    },

    //у любой статьи есть автор, ссылаться на id из бд
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    //есть картина, но не обязательный, поэтому передаем сразу тип стринг
    imageUrl: String,
  },
  {
    //помимо этих свойств выше, должны быть еще ифнормация о создании и обновлении
    timestamps: true,
  },
);

//всю эту схему необходмо экспортировать/ саму схему называем как юзер и указываем саму схему
export default mongoose.model('Post', PostSchema);
