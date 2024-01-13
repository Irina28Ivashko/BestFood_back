//структура списка пользователей

import mongoose from "mongoose";

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
    }, 
    {
     //помимо этих свойств выше, должны быть еще ифнормация о создании и обновлении
        timestamps: true,
    },
);

//всю эту схему необходмо экспортировать/ саму схему называем как юзер и указываем саму схему
export default mongoose.model('User', UserSchema);