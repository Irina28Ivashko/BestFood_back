import RecipeModel from '../models/Recipe.js';

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

//получение всех рецептов
export const getAll = async (req, res) => {
  try {
    const recipes = await RecipeModel.find().populate('user').exec();

    res.json(recipes);
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
    ).populate('user');

    //если рецепт не найден, то оповещаем об этом
    if (!recipe) {
      return res.status(404).json({
        message: 'Рецепт не найден',
      });
    }

    //если рецепт найден, то возвращаем документ
    res.json(recipe);
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
  console.log(req.body);
  try {
    //подготавливаем документ, в котором есть заголовок, текст, картинку, тэг ...
    const doc = new RecipeModel({
      title: req.body.title,
      text: req.body.text,
      imageUrl: req.body.imageUrl,
      videoUrl: req.body.videoUrl,
      tags: req.body.tags,
      user: req.userId,
      ingredientsList: req.body.ingredientsList,
      stepByStepInstructions: req.body.stepByStepInstructions,
      cookingTime: req.body.cookingTime,
    });

    //создаем документ
    const recipe = await doc.save();

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
