import { body, param } from 'express-validator'; //с помощью нее проверяем есть ли в теле запроса какая-то информация и ее валидировать

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

// Валидация для сброса пароля
export const resetPasswordValidation = [
  body('email', 'Неверный формат почты').isEmail(),
  body('newPassword', 'Пароль должен быть минимум 6 символов').isLength({ min: 6 }),
  body('confirmNewPassword', 'Подтверждение пароля обязательно').exists(),
  body('newPassword').custom((value, { req }) => {
    if (value !== req.body.confirmNewPassword) {
      throw new Error('Новый пароль и подтверждение пароля не совпадают');
    }
    return true;
  }),
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

// Валидация для удаления рецепта из избранного
export const removeFavoriteRecipeValidation = [
  // Здесь валидация осуществляется для параметра URL
  param('recipeId', 'Неверный формат идентификатора рецепта').isMongoId(),
];

// Валидация для добавления рецепта в список понравившихся (likes)
export const addLikeRecipeValidation = [
  body('recipeId', 'Неверный формат идентификатора рецепта').isMongoId(),
];

// Валидация для удаления рецепта из спика likes
export const removeLikeRecipeValidation = [
  // Здесь валидация осуществляется для параметра URL
  param('recipeId', 'Неверный формат идентификатора рецепта').isMongoId(),
];

// для создания комментария
export const commentCreateValidation = [
  body('text', 'Текст комментария не может быть пустым').isLength({ min: 1 }).isString(),
  body('postId', 'Неверный формат идентификатора поста').optional().isMongoId(),
  body('recipeId', 'Неверный формат идентификатора рецепта').optional().isMongoId(),
];

// для редактирования комментария
export const commentUpdateValidation = [
  param('id', 'Неверный формат идентификатора комментария').isMongoId(),
  body('text', 'Текст комментария не может быть пустым').isLength({ min: 1 }).isString(),
];

//  для создания категории
export const categoryCreateValidation = [
  body('name', 'Название категории не может быть пустым').notEmpty().isString(),
];

//  для обновления категории
export const categoryUpdateValidation = [
  body('name', 'Название категории не может быть пустым').optional().notEmpty().isString(),
];

//  для создания продукта
export const productCreateValidation = [
  body('name', 'Название продукта не может быть пустым').notEmpty().isString(),
  body('category', 'Укажите категорию продукта').isMongoId(),
  body('calories', 'Укажите калорийность продукта').isNumeric(),
  body('proteins', 'Укажите количество белков в продукте').isNumeric(),
  body('fats', 'Укажите количество жиров в продукте').isNumeric(),
  body('carbohydrates', 'Укажите количество углеводов в продукте').isNumeric(),
];

//  для обновления продукта
export const productUpdateValidation = [
  body('name', 'Название продукта не может быть пустым').optional().isString(),
  body('category', 'Укажите категорию продукта').optional().isMongoId(),
  body('calories', 'Укажите калорийность продукта').optional().isNumeric(),
  body('proteins', 'Укажите количество белков в продукте').optional().isNumeric(),
  body('fats', 'Укажите количество жиров в продукте').optional().isNumeric(),
  body('carbohydrates', 'Укажите количество углеводов в продукте').optional().isNumeric(),
];
