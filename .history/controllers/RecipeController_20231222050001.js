import RecipeModel from '../models/Recipe.js';

//получение тэгов
export const getLastTags = async (req, res) => {
  try {
    const posts = await PostModel.find().limit(5).exec();

    const tags = recipes
      .map((obj) => obj.tags)
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
    const recipe = await RecipeModel.findOneAndDelete({ _id: postId });

    if (!doc) {
      return res.status(404).json({
        message: 'Статья не найдена',
      });
    }

    //если саться нашлась и удалилась, то пишем true
    res.json({
      success: true,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: 'Не удалось удалить статью',
    });
  }
};

//обновить статью
export const update = async (req, res) => {
  try {
    const postId = req.params.id;
    //находим статью с помощью id и обновляем ее
    await PostModel.updateOne(
      {
        _id: postId,
      },
      {
        title: req.body.title,
        text: req.body.text,
        imageUrl: req.body.imageUrl,
        user: req.userId,
        tags: req.body.tags.split(', '),
      },
    );

    //если обновится, то пишем так
    res.json({
      success: true,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: 'Не удалось обновить статью',
    });
  }
};

//создаем статью
export const create = async (req, res) => {
  try {
    //подготавливаем документ, в котором есть заголовок, текст, картинку, тэг
    const doc = new PostModel({
      title: req.body.title,
      text: req.body.text,
      imageUrl: req.body.imageUrl,
      tags: req.body.tags.split(', '),
      user: req.userId,
    });

    //создаем документ
    const post = await doc.save();

    //возвращает ответ, если все ок
    res.json(post);

    //если произошла ошибка, то возвращаем ответ
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: 'Не удалось создать статью',
    });
  }
};
