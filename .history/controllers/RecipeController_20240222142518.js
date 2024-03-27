import RecipeModel from '../models/Recipe.js';
import formatDate from '../utils/formatDate.js'; //для форматирования даты
import CommentModel from '../models/Comment.js';

//получение тэгов
export const getLastTags = async (req, res) => {
  try {
    const recipes = await RecipeModel.find().limit(5).exec();

    const tags = recipes
      .map((recipe) => recipe.tags)
      .flat()
      .slice(0, 5);

    res.json(tags);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: 'Не удалось получить тэги',
    });
  }
};

// Получение рецептов по определенному тегу
export const getByTag = async (req, res) => {
  try {
    const tag = req.params.tag;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 9;
    const sortBy = req.query.sort || '-createdAt';

    const totalDocs = await RecipeModel.countDocuments({ tags: tag });
    const totalPages = Math.ceil(totalDocs / limit);
    const offset = (page - 1) * limit;

    const recipes = await RecipeModel.find({ tags: tag })
      .sort(sortBy)
      .skip(offset)
      .limit(limit)
      .lean()
      .exec();

    const formattedRecipes = await Promise.all(
      recipes.map(async (recipe) => {
        const commentsCount = await CommentModel.countDocuments({ recipe: recipe._id });
        return {
          ...recipe,
          createdAt: formatDate(recipe.createdAt), // Форматирование даты создания статьи
          commentsCount, // Добавление количества комментариев к статье
        };
      }),
    );

    res.json({ items: formattedRecipes, totalPages });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: 'Ошибка при получении рецептов по тегу' });
  }
};

// Получение рецептов по родительской категории
const getTagsByParentCategory = (parentCategory) => {
  // Словарь для сопоставления родительских категорий и тегов
  const categoryToTagsMap = {
    'По категориям блюд': [
      'Закуски',
      'Салаты',
      'Супы и бульоны',
      'Основные блюда',
      'Десерты',
      'Изделия из теста',
      'Соуса',
      'Напитки',
    ],
    'Блюда на каждый день': ['Завтрак', 'Обед', 'Полдник', 'Ужин'],
    'По праздникам': ['Новый год', 'День рождения', 'Масленица', 'Пасха'],
    'По способу приготовления': [
      'Гриль и барбекю',
      'Запеченные блюда',
      'Тушенные блюда',
      'Варенные блюда',
      'Жаренные блюда',
      'Замороженные блюда',
    ],
    'Тип питания': ['Детское меню', 'Вегетарианское меню', 'Диетическое меню', 'Здоровое питание'],
  };

  // Возвращаем теги, соответствующие родительской категории
  return categoryToTagsMap[parentCategory] || [];
};

// Получение рецептов по определенной категории
export const getByCategory = async (req, res) => {
  try {
    console.log('Received params:', req.query);
    const category = req.params.category;
    const tags = getTagsByParentCategory(category);

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 9;
    const sortBy = req.query.sort || '-createdAt';

    const totalDocs = await RecipeModel.countDocuments({ tags: { $in: tags } });
    const totalPages = Math.ceil(totalDocs / limit);
    const offset = (page - 1) * limit;

    const recipes = await RecipeModel.find({ tags: { $in: tags } })
      .sort(sortBy)
      .skip(offset)
      .limit(limit)
      .lean()
      .exec();

    const formattedRecipes = await Promise.all(
      recipes.map(async (recipe) => {
        const commentsCount = await CommentModel.countDocuments({ recipe: recipe._id });
        return {
          ...recipe,
          createdAt: formatDate(recipe.createdAt), // Форматирование даты создания статьи
          commentsCount, // Добавление количества комментариев к статье
        };
      }),
    );

    res.json({ items: formattedRecipes, totalPages });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: 'Ошибка при получении рецептов по категории' });
  }
};

// получение всех рецептов
export const getAll = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 9;

    const totalDocs = await RecipeModel.countDocuments(); // Общее количество документов
    const totalPages = Math.ceil(totalDocs / limit); // Вычисление общего количества страниц
    const offset = (page - 1) * limit;

    const recipes = await RecipeModel.find()
      .populate('user')
      .populate({
        path: 'comments', // строка для подсчета комментариев
        select: '_id',
      })
      // .populate('likes')
      .sort({ createdAt: -1 }) // Сортировка по дате создания (от новых к старым)
      .skip(offset)
      .limit(limit)
      .lean()
      .exec();

    const formattedRecipes = await Promise.all(
      recipes.map(async (recipe) => {
        const commentsCount = await CommentModel.countDocuments({ recipe: recipe._id });
        return {
          ...recipe,
          createdAt: formatDate(recipe.createdAt), // Форматирование даты создания статьи
          commentsCount, // Добавление количества комментариев к статье
        };
      }),
    );

    res.json({ items: formattedRecipes, totalPages });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: 'Не удалось получить рецепты',
    });
  }
};

//  Поиск рецептов по названию
export const searchRecipes = async (req, res) => {
  try {
    const searchQuery = req.query.query; // Получаем поисковый запрос

    // Проверяем, содержит ли запрос только кириллицу и пробелы
    const validPattern = /^[а-яё\s]+$/i; // Флаг 'i' для игнорирования регистра
    if (!validPattern.test(searchQuery)) {
      return res.status(400).json({
        message: 'Некорректно введенные параметры поиска. Используйте только кириллицу и пробелы.',
      });
    }

    // Создаем регулярное выражение для поиска (без учета регистра)
    const regex = new RegExp(`\\s*${searchQuery.trim()}\\s*`, 'i');

    const recipes = await RecipeModel.find({ title: { $regex: regex } }); // Ищем рецепты, соответствующие регулярному выражению

    // Подсчёт комментариев для каждого рецепта
    const recipesWithCommentsCount = await Promise.all(
      recipes.map(async (recipe) => {
        const commentsCount = await CommentModel.countDocuments({ recipe: recipe._id });
        return {
          ...recipe,
          commentsCount,
        };
      }),
    );

    res.json(recipesWithCommentsCount); // Отправляем найденные рецепты
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: 'Ошибка при выполнении поиска' });
  }
};

// получение рецептов текущего пользователя
export const getMyRecipes = async (req, res) => {
  try {
    // ID пользователя берется из токена
    const userId = req.userId;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 9;

    const totalDocs = await RecipeModel.countDocuments();
    const totalPages = Math.ceil(totalDocs / limit);
    const offset = (page - 1) * limit;

    // Ищем рецепты, где поле 'user' совпадает с ID пользователя
    const myRecipes = await RecipeModel.find({ user: userId })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    // Форматирование даты для каждого рецепта
    // Подсчет количества комментариев для каждого рецепта
    const formattedRecipes = await Promise.all(
      myRecipes.map(async (recipe) => {
        const commentsCount = await CommentModel.countDocuments({ recipe: recipe._id });
        return {
          ...recipe,
          commentsCount,
        };
      }),
    );

    res.json({ items: formattedRecipes, totalPages });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: 'Не удалось получить рецепты',
    });
  }
};

//получение одного рецепта
export const getOne = async (req, res) => {
  try {
    const recipeId = req.params.id;

    //получаем и обновляем рецепт
    const recipe = await RecipeModel.findOneAndUpdate(
      { _id: recipeId },
      { $inc: { viewsCount: 1 } },
      { new: true },
    )
      .populate('user')
      .lean();

    //если рецепт не найден, то оповещаем об этом
    if (!recipe) {
      return res.status(404).json({
        message: 'Рецепт не найден',
      });
    }

    // Подсчет количества комментариев для рецепта
    const commentsCount = await CommentModel.countDocuments({ recipe: recipeId });

    // Форматирование даты создания рецепта
    const formattedRecipe = {
      ...recipe,
      createdAt: formatDate(recipe.createdAt), // Форматирование даты
      commentsCount,
    };

    res.json(formattedRecipe);
    //если рецепт найден, то возвращаем документ
    // res.json(recipe);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: 'Не удалось вернуть рецепт',
    });
  }
};

//удаление рецепта
export const remove = async (req, res) => {
  try {
    const recipeId = req.params.id;

    //находит документ и удаляет его
    const recipe = await RecipeModel.findOneAndDelete({ _id: recipeId });

    if (!recipe) {
      return res.status(404).json({
        message: 'Рецепт не найден',
      });
    }

    //если рецепт нашелся и удалился, то пишем true
    res.json({
      success: true,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: 'Не удалось удалить рецепт',
    });
  }
};

//обновить рецепт
export const update = async (req, res) => {
  try {
    const recipeId = req.params.id;
    //находим рецепт с помощью id и обновляем ее
    await RecipeModel.updateOne(
      {
        _id: recipeId,
      },
      {
        title: req.body.title,
        text: req.body.text,
        imageUrl: req.body.imageUrl,
        videoUrl: req.body.videoUrl,
        user: req.userId,
        tags: req.body.tags,
        ingredientsList: req.body.ingredientsList,
        stepByStepInstructions: req.body.stepByStepInstructions,
        cookingTime: req.body.cookingTime,
        portionsCount: req.body.portionsCount,
      },
    );

    //если обновится, то пишем так
    res.json({
      success: true,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: 'Не удалось обновить рецепт',
    });
  }
};

//создаем рецепт
export const create = async (req, res) => {
  try {
    console.log('Received request body:', req.body);

    // Проверяем наличие ингредиентов в запросе
    if (!req.body.ingredients || !req.body.ingredients.length) {
      console.log('No ingredients provided in the request.');
      return res.status(400).json({
        message: 'Необходимо предоставить данные об ингредиентах.',
      });
    }

    //подготавливаем документ, в котором есть заголовок, текст, картинку, тэг ...
    const doc = new RecipeModel({
      title: req.body.title,
      text: req.body.text,
      imageUrl: req.body.imageUrl,
      videoUrl: req.body.videoUrl,
      tags: req.body.tags,
      user: req.userId,
      ingredients: req.body.ingredients,
      // ingredientsList: req.body.ingredientsList,
      stepByStepInstructions: req.body.stepByStepInstructions,
      cookingTime: req.body.cookingTime,
      portionsCount: req.body.portionsCount,
    });

    //создаем документ
    const recipe = await doc.save();

    console.log('Recipe created successfully:', recipe);

    //возвращает ответ, если все ок
    res.json(recipe);

    //если произошла ошибка, то возвращаем ответ
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: 'Не удалось создать рецепт',
    });
  }
};
