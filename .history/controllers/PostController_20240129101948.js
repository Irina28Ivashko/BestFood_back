import PostModel from '../models/Post.js';
import formatDate from '../utils/formatDate.js'; //для форматирования даты

//получение тэгов
export const getLastTags = async (req, res) => {
  try {
    const posts = await PostModel.find().limit(5).exec();

    const tags = posts
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

//получение всех статей
export const getAll = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 9;

    const totalDocs = await PostModel.countDocuments(); // Общее количество документов
    const totalPages = Math.ceil(totalDocs / limit); // Вычисление общего количества страниц
    const offset = (page - 1) * limit;

    const posts = await PostModel.find()
      .populate('user')
      .sort({ createdAt: -1 }) // Сортировка по дате создания (от новых к старым)
      .skip(offset)
      .limit(limit)
      .exec();

    // Форматирование даты для каждой статьи
    const formattedPosts = posts.map((post) => {
      return {
        ...post.toJSON(), // Преобразование документа Mongoose в объект JS
        createdAt: formatDate(post.createdAt), // Форматирование даты
      };
    });

    res.json({ items: formattedPosts, totalPages });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: 'Не удалось получить статьи',
    });
  }
};

// получение статей текущего пользователя
export const getMyPosts = async (req, res) => {
  try {
    // ID пользователя берется из токена
    const userId = req.userId;

    // Ищем статьи, где поле 'user' совпадает с ID пользователя
    const myPosts = await PostModel.find({ user: userId }).sort({ createdAt: -1 });

    res.json(myPosts);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: 'Не удалось получить статьи',
    });
  }
};

//получение одной статьи
export const getOne = async (req, res) => {
  try {
    const postId = req.params.id;

    //получаем и обновляем статью
    const doc = await PostModel.findOneAndUpdate(
      { _id: postId },
      { $inc: { viewsCount: 1 } },
      { new: true }, // используйте new вместо returnDocument
    ).populate('user');

    //если статья не найдена, то оповещаем об этом
    if (!doc) {
      return res.status(404).json({
        message: 'Статья не найдена',
      });
    }

    //если статься найдена, то возвращаем документ
    res.json(doc);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: 'Не удалось вернуть статью',
    });
  }
};

//удаление статьи
export const remove = async (req, res) => {
  try {
    const postId = req.params.id;

    //находит документ и удаляет его
    const doc = await PostModel.findOneAndDelete({ _id: postId });

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
