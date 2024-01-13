import { body } from 'express-validator'; //с помощью нее проверяем есть ли в теле запроса какая-то информация и ее валидировать

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
  body('title', 'Введите заголовок статьи').isLength({ min: 3 }).isString(), //если будет title, то передаем такое сообщение
  body('text', 'Введите текст статить').isLength({ min: 3 }).isString(),
  body('tags', 'Неверный формат тэгов').optional().isString(),
  body('imageUrl', 'Неверная ссылка на изображение').optional().isString(),
];

// Валидация для создания рецепта
export const recipeCreateValidation = [
  body('title', 'Введите название рецепта').isLength({ min: 3 }).isString(),
  body('text', 'Введите описание рецепта').isLength({ min: 10 }).isString(),
  body('imageUrl', 'Неверная ссылка на изображение').optional().isString(),
  body('videoUrl', 'Неверная ссылка на видео').optional().isString(),
  body('tags', 'Неверный формат тэгов').optional().isArray(),
  body('portionsCalculator', 'Неверное значение калькулятора порций').optional().isNumeric(),
  body('ingredientsList', 'Неверный формат списка ингредиентов').optional().isArray(),
  body('calories', 'Неверное значение калорий').optional().isNumeric(),
  body('cookingTime', 'Неверное значение времени приготовления').optional().isNumeric(),
  body('stepByStepInstructions', 'Неверный формат пошаговых инструкций').optional().isArray(),
  body('comments', 'Неверный формат комментариев').optional().isArray(),
  body('portionsCount', 'Неверное значение количества порций')
    .optional()
    .isNumeric()
    .isInt({ min: 1 }),
];

// Валидация для добавления рецепта в избранное
export const addFavoriteRecipeValidation = [
  body('recipeId', 'Неверный формат идентификатора рецепта').isMongoId(),
];
