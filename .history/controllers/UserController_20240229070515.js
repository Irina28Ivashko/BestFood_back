import jwt from 'jsonwebtoken'; //генерация специального токена
import bcrypt from 'bcrypt'; //шифруем пароль
import formatDate from '../utils/formatDate.js'; //для форматирования даты
import UserModel from '../models/User.js'; //создаем пользователя
import RecipeModel from '../models/Recipe.js';
import PostModel from '../models/Post.js';
import CommentModel from '../models/Comment.js';

export const register = async (req, res) => {
  //оборачиваем в try и catch, чтобы можно было обрабатывать ошибки, которые присылают монгодб и nodejs
  try {
    // перед созданием пароля необходимо выташить пароль и создаем соль (алгоритм шифромания нашего пароля)
    const password = req.body.password;
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    //создаем документ на создание пользователя c помощью монгодб
    const doc = new UserModel({
      email: req.body.email,
      fullName: req.body.fullName,
      avatarUrl: req.body.avatarUrl,
      passwordHash: hash,
    });

    //создаем пользователя в монгодб
    const user = await doc.save();

    // после того,как документ был создан с бд, создаем токен с помощью jwt и указать, что токен хранит зашифрованную инфу
    const token = jwt.sign(
      {
        _id: user._id,
        isAdmin: user.isAdmin,
      },
      //указыаем ключ, благодаря которому шифруем токен
      'secret123',
      {
        //указать срок жизни токена, через сколько он перестанет быть валидным
        expiresIn: '30d',
      },
    );

    //вытаскиваем с помощью диструктурищации хэш
    const { passwordHash, ...userData } = user._doc;

    //необходимо вернуть инфо об пользователе и сам токен
    res.json({
      ...userData,
      token,
    });
  } catch (err) {
    //для себя в консоли передаем
    console.log(err);
    //передаем пользователю сообщение
    res.status(500).json({
      message: 'Не удалось зарегестрироваться',
    });
  }
};

//делаем авторизацию
export const login = async (req, res) => {
  try {
    // ищем пользователя по email
    const user = await UserModel.findOne({ email: req.body.email });

    if (!user) {
      return res.status(404).json({
        message: 'Пользователь не найден',
      });
    }

    const isValidPass = await bcrypt.compare(req.body.password, user._doc.passwordHash);

    if (!isValidPass) {
      return res.status(400).json({
        message: 'Неверный логин или пароль',
      });
    }

    const token = jwt.sign(
      {
        _id: user._id,
      },
      //указыаем ключ, благодаря которому шифруем токен
      'secret123',
      {
        //указать срок жизни токена, через сколько он перестанет быть валидным
        expiresIn: '30d',
      },
    );
    const { passwordHash, ...userData } = user._doc;

    res.json({
      ...userData,
      token,
    });
  } catch (err) {
    console.log(err);

    res.status(500).json({
      message: 'Не удалось авторизоваться',
    });
  }
};

// восстановление пароля
export const resetPassword = async (req, res) => {
  try {
    // Проверка, что пользователь существует
    const { email, newPassword } = req.body;
    const user = await UserModel.findOne({ email });
    // Валидация нового пароля
    if (!user) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }

    // Шифрование нового пароля
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(newPassword, salt);

    // Обновление пароля пользователя в базе данных
    await UserModel.updateOne({ _id: user._id }, { $set: { passwordHash: hash } });

    res.json({ message: 'Пароль успешно изменен' });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: 'Ошибка при сбросе пароля' });
  }
};

// проверяем админ ли пользователь
export const isAdmin = async (req, res, next) => {
  try {
    const user = await UserModel.findById(req.userId);

    if (!user) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }

    if (user.isAdmin) {
      next(); // Пользователь админ, продолжаем обработку запроса
    } else {
      res.status(403).json({ message: 'Недостаточно прав для выполнения действия' });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: 'Произошла ошибка при проверке прав администратора' });
  }
};

//получаем инфу о себе
export const getMe = async (req, res) => {
  try {
    // передаем что userModel должен с помощью findById вытащить пользователя и найти его в бд
    const user = await UserModel.findById(req.userId);

    //если такого пользователя нет, то сообщаем об этом
    if (!user) {
      return res.status(404).json({
        message: 'Пользователь не найден',
      });
    }

    //если пользоваетль найден, то возвращаем отыет
    const { passwordHash, ...userData } = user._doc;

    res.json(userData);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: 'Нет доступа',
    });
  }
};

// Обновление профиля в настройках профиля
export const updateProfile = async (req, res) => {
  try {
    const userId = req.userId; // ID пользователя из токена
    const updateData = req.body; // Получаем обновляемые данные
    console.log('Обновление данных пользователя:', updateData);
    // Обновляем пользователя
    const updatedUser = await UserModel.findByIdAndUpdate(userId, updateData, { new: true });
    // const updatedUser = await UserModel.findByIdAndUpdate(userId, updateData);

    res.json({
      success: true,
      message: 'Профиль обновлен',
      user: updatedUser,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: 'Ошибка при обновлении профиля',
    });
  }
};

// для получения списка всех пользователей
export const getAllUsers = async (req, res) => {
  try {
    const users = await UserModel.find({}); // Извлекаем всех пользователей
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Ошибка при получении пользователей' });
  }
};

// инфо о пользователе
export const getUserProfile = async (req, res) => {
  try {
    const userId = req.params.userId; // Получаем ID пользователя из параметров запроса
    const user = await UserModel.findById(userId); // Ищем пользователя по ID

    if (!user) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }

    // Возвращаем данные пользователя без хэша пароля
    const { passwordHash, ...userProfile } = user._doc;
    res.json(userProfile);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: 'Ошибка при получении профиля пользователя' });
  }
};

// инфо о всех пользователей, у котор. есть рецепты и статьи
export const getUsersWithActivity = async (req, res) => {
  try {
    const usersWithActivity = await UserModel.aggregate([
      {
        $lookup: {
          from: 'recipes', // Имя коллекции рецептов
          localField: '_id', // Поле в коллекции пользователей для связи
          foreignField: 'user', // Поле в коллекции рецептов, ссылающееся на пользователя
          as: 'recipes', // Название нового поля, содержащего связанные данные
        },
      },

      {
        $lookup: {
          from: 'posts', // Имя коллекции статей
          localField: '_id',
          foreignField: 'user',
          as: 'posts', // Название нового поля для статей
        },
      },

      {
        $project: {
          _id: 1,
          fullName: 1,
          email: 1,
          avatarUrl: 1,
          recipeCount: { $size: '$recipes' }, // Подсчитываем количество рецептов
          postCount: { $size: '$posts' }, // Подсчитываем количество статей
          recipes: 1, // Включаем информацию о рецептах
          posts: 1, // Включаем информацию о статьях
        },
      },
    ]);

    // Форматируем дату последней активности
    const lastActivityFormatted = lastActivity ? formatDate(lastActivity) : 'Неизвестно';

    // Возвращаем данные о рецептах, статьях и форматированной дате последней активности
    res.json({ recipes, posts, lastActivity: lastActivityFormatted });

    // res.json(usersWithActivity);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: 'Ошибка при получении данных о пользователях' });
  }
};

//  для получения топ кулинаров
export const getTopCooks = async (req, res) => {
  try {
    const topCooks = await UserModel.aggregate([
      // Присоединяем коллекцию рецептов
      {
        $lookup: {
          from: 'recipes',
          localField: '_id',
          foreignField: 'user',
          as: 'recipes',
        },
      },
      // Присоединяем коллекцию статей
      {
        $lookup: {
          from: 'posts',
          localField: '_id',
          foreignField: 'user',
          as: 'posts',
        },
      },
      // Добавляем новые поля для подсчета количества рецептов и статей
      {
        $addFields: {
          recipeCount: { $size: '$recipes' },
          postCount: { $size: '$posts' },
        },
      },
      // Добавляем поле для общего количества активностей
      {
        $addFields: {
          totalActivities: { $add: ['$recipeCount', '$postCount'] },
        },
      },

      // Присоединяем последний рецепт
      {
        $lookup: {
          from: 'recipes',
          let: { userId: '$_id' },
          pipeline: [
            { $match: { $expr: { $eq: ['$user', '$$userId'] } } },
            { $sort: { createdAt: -1 } },
            { $limit: 1 },
          ],
          as: 'lastRecipe',
        },
      },
      // Присоединяем последнюю статью
      {
        $lookup: {
          from: 'posts',
          let: { userId: '$_id' },
          pipeline: [
            { $match: { $expr: { $eq: ['$user', '$$userId'] } } },
            { $sort: { createdAt: -1 } },
            { $limit: 1 },
          ],
          as: 'lastPost',
        },
      },
      // Добавляем поле для даты последней активности
      {
        $addFields: {
          lastActivity: {
            $cond: {
              if: {
                $gt: [
                  { $arrayElemAt: ['$lastRecipe.createdAt', 0] },
                  { $arrayElemAt: ['$lastPost.createdAt', 0] },
                ],
              },
              then: { $arrayElemAt: ['$lastRecipe.createdAt', 0] },
              else: { $arrayElemAt: ['$lastPost.createdAt', 0] },
            },
          },
        },
      },
      // Сортируем пользователей по общему количеству активностей
      {
        $sort: { totalActivities: -1 },
      },
      // Ограничиваем поля, которые возвращаются
      {
        $project: {
          fullName: 1,
          email: 1,
          avatarUrl: 1,
          recipeCount: 1,
          postCount: 1,
          totalActivities: 1,
          lastActivity: 1,
        },
      },
    ]);

    // Перед отправкой ответа преобразуем даты:
    const formattedTopCooks = topCooks.map((cook) => {
      // Форматируем дату последней активности
      const lastActivityFormatted = cook.lastActivity ? formatDate(cook.lastActivity) : null;
      return {
        ...cook,
        lastActivity: lastActivityFormatted, // Используем форматированную дату
      };
    });

    res.json(formattedTopCooks);

    // res.json(topCooks);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: 'Ошибка при получении списка топ кулинаров' });
  }
};

// Добавление рецепта в избранное
export const addFavoriteRecipe = async (req, res) => {
  try {
    const userId = req.userId; // ID пользователя, полученный из токена
    const { recipeId } = req.body; // ID рецепта для добавления

    // Обновляем пользователя, добавляя рецепт в список избранных
    await UserModel.updateOne(
      { _id: userId },
      { $addToSet: { favoriteRecipes: recipeId } }, // Используем $addToSet, чтобы избежать дублирования
    );

    res.json({ message: 'Рецепт добавлен в избранное' });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: 'Не удалось добавить рецепт в избранное' });
  }
};

// для получения информации о рецептах и статьях от активного пользователя
export const getUserActivity = async (req, res) => {
  try {
    const userId = req.params.userId; // ID пользователя берется из параметров запроса

    // Находим все рецепты и статьи пользователя, сортируем их по дате создания (от новых к старым)
    const recipes = await RecipeModel.find({ user: userId })
      .populate('user')
      .sort({ createdAt: -1 })
      .lean();
    const posts = await PostModel.find({ user: userId })
      .populate('user')
      .sort({ createdAt: -1 })
      .lean();

    // Подготавливаем данные для передачи: форматируем дату создания для каждого рецепта
    const formattedRecipes = await Promise.all(
      recipes.map(async (recipe) => {
        const commentsCount = await CommentModel.countDocuments({ recipe: recipe._id });
        return {
          ...recipe,
          commentsCount,
        };
      }),
    );

    // и статьи
    const formattedPosts = await Promise.all(
      posts.map(async (post) => {
        const commentsCount = await CommentModel.countDocuments({ post: post._id });
        return {
          ...post,
          commentsCount,
        };
      }),
    );

    // Определяем дату последней активности (самую последнюю дату из рецептов и статей)
    let lastActivity;
    if (recipes.length > 0 && posts.length > 0) {
      lastActivity = new Date(
        Math.max(...recipes.map((r) => r.createdAt), ...posts.map((p) => p.createdAt)),
      );
    } else if (recipes.length > 0) {
      lastActivity = new Date(Math.max(...recipes.map((r) => r.createdAt)));
    } else if (posts.length > 0) {
      lastActivity = new Date(Math.max(...posts.map((p) => p.createdAt)));
    }

    // Форматируем дату последней активности
    const lastActivityFormatted = lastActivity ? formatDate(lastActivity) : null;

    // Возвращаем отформатированные данные
    res.json({
      recipes: formattedRecipes,
      posts: formattedPosts,
      lastActivity: lastActivityFormatted,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: 'Ошибка при получении активности пользователя',
    });
  }
};

// Удаление рецепта из избранного
export const removeFavoriteRecipe = async (req, res) => {
  try {
    const userId = req.userId; // ID пользователя, полученный из токена
    const { recipeId } = req.params; // ID рецепта для удаления

    // Обновляем пользователя, удаляя рецепт из списка избранных
    await UserModel.updateOne({ _id: userId }, { $pull: { favoriteRecipes: recipeId } });

    res.json({ message: 'Рецепт удален из избранного' });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: 'Не удалось удалить рецепт из избранного' });
  }
};

// Получение избранных рецептов
export const getFavoriteRecipes = async (req, res) => {
  try {
    // Находим пользователя по ID из токена
    const user = await UserModel.findById(req.userId)
      .populate('favoriteRecipes')
      .sort({ createdAt: -1 });

    const favoriteRecipes = await RecipeModel.find({
      _id: { $in: user.favoriteRecipes },
    }).lean();

    const favoriteRecipesWithCommentsCount = await Promise.all(
      favoriteRecipes.map(async (recipe) => {
        const commentsCount = await CommentModel.countDocuments({ recipe: recipe._id });
        return {
          ...recipe,
          commentsCount,
        };
      }),
    );

    // Отправляем список избранных рецептов
    res.json(favoriteRecipesWithCommentsCount);
    // res.json(user.favoriteRecipes);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: 'Ошибка при получении избранных рецептов' });
  }
};

// добавить лайк на рецепту
export const addLikeRecipe = async (req, res) => {
  try {
    const userId = req.userId; // ID пользователя, полученный из токена
    const { recipeId } = req.body; // ID рецепта для добавления

    console.log(`[Add Like] User: ${userId} is adding a like to Recipe: ${recipeId}`);

    // Обновляем пользователя, проставляя лайк рецепту
    await UserModel.updateOne(
      { _id: userId },
      { $addToSet: { likeRecipes: recipeId } }, // Используем $addToSet, чтобы избежать дублирования
    );

    // Увеличиваем счетчик лайков у рецепта
    await RecipeModel.updateOne({ _id: recipeId }, { $inc: { likesCount: 1 } });
    // Получаем обновленный рецепт, чтобы узнать новое количество лайков
    const updatedRecipe = await RecipeModel.findById(recipeId);
    console.log(`[Add Like] New likesCount for Recipe: ${recipeId} is ${updatedRecipe.likesCount}`);

    res.json({ message: 'Мне нравится' });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: 'Не удалось поставить like' });
  }
};

// Удалить лайк у рецепта
export const removeLikeRecipe = async (req, res) => {
  try {
    const userId = req.userId; // ID пользователя, полученный из токена
    const { recipeId } = req.params; // ID рецепта для удаления
    console.log(`[Remove Like] User: ${userId} is removing a like from Recipe: ${recipeId}`);
    // Обновляем пользователя, удаляя рецепт из списка likes
    await UserModel.updateOne({ _id: userId }, { $pull: { likeRecipes: recipeId } });

    // Уменьшаем счетчик лайков у рецепта
    await RecipeModel.updateOne({ _id: recipeId }, { $inc: { likesCount: -1 } });
    // Получаем обновленный рецепт, чтобы узнать новое количество лайков
    const updatedRecipe = await RecipeModel.findOne({ _id: recipeId });
    console.log(
      `[Remove Like] New likesCount for Recipe: ${recipeId} is ${updatedRecipe.likesCount}`,
    );

    res.json({ message: 'Мне больше не нравится' });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: 'Не удалось удалить like' });
  }
};

// Получение  рецептов всех рецептов likes
export const getLikeRecipes = async (req, res) => {
  try {
    // Находим пользователя по ID из токена
    const user = await UserModel.findById(req.userId)
      .populate('likeRecipes')
      .sort({ createdAt: -1 });

    const likeRecipes = await RecipeModel.find({
      _id: { $in: user.likeRecipes },
    }).lean();

    const likeRecipesWithCommentsCount = await Promise.all(
      likeRecipes.map(async (recipe) => {
        const commentsCount = await CommentModel.countDocuments({ recipe: recipe._id });
        return {
          ...recipe,
          commentsCount,
        };
      }),
    );

    res.json(likeRecipesWithCommentsCount);
    // Отправляем список понравившихся рецептов
    // res.json(user.likeRecipes);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: 'Ошибка при получении понравившихся рецептов' });
  }
};
