import express from 'express';
import multer from 'multer'; //библиотека для загрузки файлов

import cors from 'cors'; //для доступа к запросам на бэкенд от фронтенда

import mongoose from 'mongoose'; //позволяет работать с бд монгодб

import {
  registerValidation,
  loginValidation,
  resetPasswordValidation,
  postCreateValidation,
  recipeCreateValidation,
  addFavoriteRecipeValidation,
  removeFavoriteRecipeValidation,
  addLikeRecipeValidation,
  removeLikeRecipeValidation,
  commentCreateValidation,
  commentUpdateValidation,
  categoryCreateValidation,
  categoryUpdateValidation,
  productCreateValidation,
  productUpdateValidation,
} from './validations.js';

import { handleValidationErrors, checkAuth, checkAdmin } from './utils/index.js';
import {
  UserController,
  PostController,
  RecipeController,
  CommentController,
  CategoryBJUController,
  ProductController,
} from './controllers/index.js';

//подключаем бд
mongoose
  .connect(
    'mongodb+srv://irannna129:FX1bYNIC3Rym0cRj@cluster0.xnxbrhe.mongodb.net/bestfood?retryWrites=true&w=majority',
  )
  .then(() => console.log('DB ok'))
  .catch((err) => console.log('DB error', err));

const app = express(); //создаем экспресс приложение app

//создаем хранилище для картинок
const storage = multer.diskStorage({
  //сохр все загружен. файлы в папку uploads
  destination: (_, __, cb) => {
    cb(null, 'uploads');
  },
  //перед тем как файл сохранит , объясняет как назвать этот файл
  filename: (_, file, cb) => {
    console.log('Загружаемый файл:', file.originalname);
    cb(null, file.originalname);
  },
});

// Загрузка аватара пользователя

//применяем логику на express. у multer есть хранилище storage
const upload = multer({ storage });

//в приложении нужно использовать формат джейсон
app.use(express.json());

app.use(cors());

//если придет запрос на любой uplods, то тогда с помощью фун-и static проверь есть ли в это папке то что передаю
app.use('/uploads', express.static('uploads'));

//делаем авторизацию
app.post('/auth/login', loginValidation, handleValidationErrors, UserController.login);
//отправляем пост запрос и получу ответ в формате джейсон
// если придет запрос на /auth/register, то проверяем есть
// ли в registerValidation то что нам нужно и если есть,
//то выполняем запрос req, res
app.post('/auth/register', registerValidation, handleValidationErrors, UserController.register);
app.post(
  '/auth/reset_password',
  resetPasswordValidation,
  handleValidationErrors,
  UserController.resetPassword,
); // сброс и установка нового пароля
app.get('/auth/me', checkAuth, UserController.getMe); //получаем инфу о себе
app.get('/auth/admin/me', checkAuth, checkAdmin, UserController.getMe); // получаем инфу об администраторе
app.post('/upload', checkAuth, upload.single('image'), (req, res) => {
  console.log(req.file);
  res.json({
    //если загрузка прошла успешна, то даем клиенту ссылку на картинку
    url: `/uploads/${req.file.originalname}`,
  });
});

app.get('/users', UserController.getAllUsers); //Получение списка всех пользователй
app.patch('/users/update', checkAuth, UserController.updateProfile); //обновление профиля
app.get('/users/:userId/profile', UserController.getUserProfile); //получение информации о профиле пользователя
app.get('/users-with-activity', UserController.getUsersWithActivity); //получение всех активных пользов. со стьями и рецептами
app.get('/top-cooks', UserController.getTopCooks); //Топ кулинаров
app.get('/users/:userId/activity', UserController.getUserActivity); //получаем все рецепты и статьи от активного пользоваетя

app.get('/tags', PostController.getLastTags);

app.get('/posts', PostController.getAll); //получаем все статьи
app.get('/posts/tags', PostController.getLastTags); //получаем все теги
app.get('/posts/my', checkAuth, PostController.getMyPosts); //  для получения статей пользователя
app.get('/posts/:id', PostController.getOne); //получаем одну статью
app.post('/posts', checkAuth, postCreateValidation, handleValidationErrors, PostController.create); //сoздание статьи (без выполнения checkAuth не происходит)
app.delete('/posts/:id', checkAuth, PostController.remove); //удаление статьи
app.patch(
  '/posts/:id',
  checkAuth,
  postCreateValidation,
  handleValidationErrors,
  PostController.update,
); //обновление статьи

// Маршруты для работы с рецептами
app.get('/recipes', RecipeController.getAll); // Получение всех рецептов
app.get('/recipe-tags', RecipeController.getLastTags); // Получение последних тэгов из рецептов
app.get('/recipes/tag/:tag', RecipeController.getByTag); // Получение рецептов по тегу
app.get('/recipes/category/:category', RecipeController.getByCategory); // Получение рецептов по категории тегов
app.get('/recipes/search', RecipeController.searchRecipes); // Маршрут для поиска рецептов

app.get('/recipes/my', checkAuth, RecipeController.getMyRecipes); //  для получения рецептов пользователя
app.get('/recipes/:id', RecipeController.getOne); // Получение одного рецепта
app.post(
  '/recipes',
  checkAuth,
  recipeCreateValidation,
  handleValidationErrors,
  RecipeController.create,
); // Создание рецепта
app.delete('/recipes/:id', checkAuth, RecipeController.remove); // Удаление рецепта
app.patch(
  '/recipes/:id',
  checkAuth,
  recipeCreateValidation,
  handleValidationErrors,
  RecipeController.update,
); // Обновление рецепта

//  для добавления рецепта в избранное
app.post(
  '/users/favorites',
  checkAuth,
  addFavoriteRecipeValidation,
  handleValidationErrors,
  UserController.addFavoriteRecipe,
);
// Маршрут для удаления рецепта из избранного
app.delete(
  '/users/favorites/:recipeId',
  checkAuth,

  removeFavoriteRecipeValidation,
  handleValidationErrors,
  UserController.removeFavoriteRecipe,
);
// Маршрут для получения избранных рецептов
app.get('/users/favorites', checkAuth, UserController.getFavoriteRecipes);

//  для добавления рецепта в список likes
app.post(
  '/users/likes',
  checkAuth,
  addLikeRecipeValidation,
  handleValidationErrors,
  UserController.addLikeRecipe,
);

// Маршрут для удаления рецепта из списка likes
app.delete(
  '/users/likes/:recipeId',
  checkAuth,

  removeLikeRecipeValidation,
  handleValidationErrors,
  UserController.removeLikeRecipe,
);
// Маршрут для получения списка likes
app.get('/users/likes', checkAuth, UserController.getLikeRecipes);

app.post(
  '/comments',
  checkAuth,
  commentCreateValidation,
  handleValidationErrors,
  CommentController.addComment,
); // Добавление комментария
app.get('/comments/:contentType/:contentId', CommentController.getComments); // Получение комментариев
app.get('/comments/:id', CommentController.fetchOneComment); //получение одного комментария
app.delete('/comments/:id', checkAuth, CommentController.deleteComment); // Удаление комментария
app.patch(
  '/comments/:id',
  checkAuth,
  commentUpdateValidation,
  handleValidationErrors,
  CommentController.updateComment,
); // Редактирование комментария

// Добавление маршрутов для категорий
app.post(
  '/categories',
  checkAuth,
  checkAdmin,
  categoryCreateValidation,
  handleValidationErrors,
  CategoryBJUController.createCategory,
); //создание категории
app.get('/categories', CategoryBJUController.getAllCategories); //получение всех категорий
app.patch(
  '/categories/:categoryId',
  checkAuth,
  checkAdmin,
  categoryUpdateValidation,
  handleValidationErrors,
  CategoryBJUController.updateCategory,
); //редактирование категории
app.delete('/categories/:categoryId', checkAuth, checkAdmin, CategoryBJUController.deleteCategory); //удаление категории

// Добавление маршрутов для продуктов
app.post(
  '/products',
  checkAuth,
  checkAdmin,
  productCreateValidation,
  handleValidationErrors,
  ProductController.createProduct,
); //создание продукта
app.get('/products', ProductController.getAllProducts); //получение всех продуктов
app.get('/products/category/:categoryId', ProductController.getProductsByCategory); //получение продуктов по определенной категори
app.post('/products/byIds', ProductController.getProductsByIds); //получение продуктов от разных категорий
app.get('/products/search', ProductController.searchProducts); // поиск по названию продутка
app.patch(
  '/products/:productId',
  checkAuth,
  checkAdmin,
  productUpdateValidation,
  handleValidationErrors,
  ProductController.updateProduct,
); //редактивароние продукта
app.delete('/products/:productId', checkAuth, checkAdmin, ProductController.deleteProduct); //удаление продукта

//по этой команде запускаем сервер
app.listen(4445, (err) => {
  //если сервер не смог запуститься, то возвращаем сообщение об этом
  if (err) {
    return console.log(err);
  }

  //если сервер заупстился, то значит все ок
  console.log('Server ok');
});
