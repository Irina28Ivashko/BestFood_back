import express from 'express';
import multer from 'multer'; //библиотека для загрузки файлов

import cors from 'cors'; //для доступа к запросам на бэкенд от фронтенда

import mongoose from 'mongoose'; //позволяет работать с бд монгодб

import {
  registerValidation,
  loginValidation,
  postCreateValidation,
  recipeCreateValidation,
  addFavoriteRecipeValidation,
  removeFavoriteRecipeValidation,
} from './validations.js';

import { handleValidationErrors, checkAuth } from './utils/index.js';
import { UserController, PostController, RecipeController } from './controllers/index.js';

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
    cb(null, file.originalname);
  },
});

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

//получаем инфу о себе
app.get('/auth/me', checkAuth, UserController.getMe);

app.post('/upload', checkAuth, upload.single('image'), (req, res) => {
  res.json({
    //если загрузка прошла успешна, то даем клиенту ссылку на картинку
    url: `/uploads/${req.file.originalname}`,
  });
});

app.get('/tags', PostController.getLastTags);

app.get('/posts', PostController.getAll); //получаем все статьи
app.get('/posts/tags', PostController.getLastTags); //получаем все теги
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

// Маршрут для добавления рецепта в избранное
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
  (req, res, next) => {
    console.log(req.body); // Логируем тело запроса
    next(); // Продолжаем обработку запроса
  },
  removeFavoriteRecipeValidation,
  handleValidationErrors,
  UserController.removeFavoriteRecipe,
);

//по этой команде запускаем сервер
app.listen(4445, (err) => {
  //если сервер не смог запуститься, то возвращаем сообщение об этом
  if (err) {
    return console.log(err);
  }

  //если сервер заупстился, то значит все ок
  console.log('Server ok');
});
