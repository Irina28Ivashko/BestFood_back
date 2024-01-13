import { body } from 'express-validator';  //с помощью нее проверяем есть ли в теле запроса какая-то информация и ее валидировать

//при входе в профиль
export const loginValidation = [
    body('email', 'Неверный формат почты').isEmail(),
    body('password', 'Пароль должен быть минимум 5 символов').isLength({ min: 5 }),
   
];

//при регистрации
export const registerValidation = [
    body('email', 'Неверный формат почты').isEmail(),
    body('password', 'Пароль должен быть минимум 5 символов').isLength({ min: 5 }),
    body('fullName', 'Укажите имя').isLength({ min: 3 }),
    body('avatarUrl', 'Неверная ссылка на аватарку').optional().isURL(),
];

//валидация на создание статьи
export const postCreateValidation = [
    body('title', 'Введите заголовок статьи').isLength({ min:3 }).isString(), //если будет title, то передаем такое сообщение 
    body('text', 'Введите текст статить').isLength({ min: 3 }).isString(),
    body('tags', 'Неверный формат тэгов').optional().isString(),
    body('imageUrl', 'Неверная ссылка на изображение').optional().isString(),
]; 