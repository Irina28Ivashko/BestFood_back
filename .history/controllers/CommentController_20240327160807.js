import formatDate from '../utils/formatDate.js'; //для форматирования даты

import CommentModel from '../models/Comment.js'; //создаем пользователя
import RecipeModel from '../models/Recipe.js';
import PostModel from '../models/Post.js';

// создание комментария

export const addComment = async (req, res) => {
  try {
    const { text, contentId, contentType } = req.body;
    const userId = req.userId;

    if (!text) {
      return res.status(400).json({ message: 'Текст комментария не может быть пустым' });
    }

    const contentModel = contentType === 'post' ? PostModel : RecipeModel;
    const content = await contentModel.findById(contentId);

    if (!content) {
      return res.status(404).json({ message: 'Контент не найден' });
    }

    const comment = new CommentModel({
      text,
      user: userId,
      [contentType]: contentId,
    });

    await comment.save();

    // Включаем ID контента в ответ
    const populatedComment = await CommentModel.findById(comment._id)
      .populate('user', 'fullName avatarUrl')
      .lean(); // Используем метод lean() для получения JavaScript-объекта

    const commentWithFormattedDate = {
      ...populatedComment,
      createdAt: formatDate(populatedComment.createdAt), // Форматирование даты
    };

    console.log('Комментарий успешно добавлен:', commentWithFormattedDate);

    res.json(commentWithFormattedDate);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Ошибка при добавлении комментария' });
  }
};

// получение всех комментариев
export const getComments = async (req, res) => {
  try {
    const { contentId, contentType } = req.params;
    console.log(`Fetching comments for ${contentType} with ID ${contentId}`);

    const query = {};
    if (contentType === 'post') {
      query.post = contentId;
    } else if (contentType === 'recipe') {
      query.recipe = contentId;
    }

    // Проверяем наличие комментариев
    const comments = await CommentModel.find(query)
      .populate('user', 'fullName avatarUrl')
      .sort({ createdAt: -1 })
      .lean();

    // Форматирование даты для каждого комментария
    const formattedComments = comments.map((comment) => ({
      ...comment,
      createdAt: formatDate(comment.createdAt),
      updatedAt: formatDate(comment.updatedAt),
    }));
    console.log('Formatted Comments:', formattedComments);

    res.json({ comments: formattedComments, commentsCount: formattedComments.length });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Ошибка при получении комментариев' });
  }
};

// Получение одного комментария по ID
export const fetchOneComment = async (req, res) => {
  try {
    const { id } = req.params;
    const comment = await CommentModel.findById(id).populate('user', 'fullName avatarUrl');

    if (!comment) {
      return res.status(404).json({ message: 'Комментарий не найден' });
    }

    const formattedComment = {
      ...comment.toJSON(),
      createdAt: formatDate(comment.createdAt),
      updatedAt: formatDate(comment.updatedAt),
    };

    res.json(formattedComment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Ошибка при получении комментария' });
  }
};

// удаление комментария
export const deleteComment = async (req, res) => {
  try {
    const { id } = req.params;

    // Пытаемся найти и удалить комментарий
    const comment = await CommentModel.findOne({ _id: id });

    // Если комментарий не найден, отправляем сообщение об ошибке
    if (!comment) {
      return res.status(404).json({ message: 'Комментарий не найден' });
    }

    // Проверка прав пользователя на удаление комментария
    if (comment.user.toString() !== req.userId) {
      return res.status(403).json({ message: 'У вас нет прав на удаление этого комментария' });
    }

    // Удаление комментария
    await CommentModel.deleteOne({ _id: id });

    // Обновление поста или рецепта, удаляя ID комментария
    if (comment.post) {
      await PostModel.findByIdAndUpdate(comment.post, { $pull: { comments: id } });
    } else if (comment.recipe) {
      await RecipeModel.findByIdAndUpdate(comment.recipe, { $pull: { comments: id } });
    }

    res.json({ message: 'Комментарий удален' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Ошибка при удалении комментария' });
  }
};

// редактирование комментария
export const updateComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { text } = req.body;
    const comment = await CommentModel.findById(id);

    // Проверка прав пользователя на редактирование комментария
    if (comment.user.toString() !== req.userId) {
      return res
        .status(403)
        .json({ message: 'У вас нет прав на редактирование этого комментария' });
    }

    comment.text = text;
    await comment.save();

    // Получаем комментарий с данными пользователя
    const populatedComment = await CommentModel.findById(id).populate('user', 'fullName avatarUrl');

    const commentWithFormattedDate = {
      ...populatedComment.toJSON(),
      createdAt: formatDate(populatedComment.createdAt), // Форматирование даты
      updatedAt: formatDate(populatedComment.updatedAt), // Форматирование даты обновления
    };

    res.json(commentWithFormattedDate);
  } catch (err) {
    res.status(500).json({ message: 'Ошибка при редактировании комментария' });
  }
};
