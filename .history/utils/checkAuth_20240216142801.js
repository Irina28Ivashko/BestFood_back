import jwt from 'jsonwebtoken';
import UserModel from '../models/User.js';

//спарсить и в дальнейшем его расшифровать
export default (req, res, next) => {
  const token = (req.headers.authorization || '').replace(/Bearer\s?/, '');

  if (token) {
    //если токен есть, от мы его расшифровываем с помощью функции jwt
    try {
      const decoded = jwt.verify(token, 'secret123');

      //если токен расшифрован, то в req передаем, точто смогли расшифровать
      req.userId = decoded._id;
      req.isAdmin = decoded.isAdmin; // Добавляем информацию о статусе администратора

      //если токен расшифрован и сохранен его id, то выполянем следующую фун-.
      next();
      //если токен не расшифрован, то оповещаем об этом
    } catch (e) {
      return res.status(403).json({
        message: 'Нет доступа',
      });
    }
  } else {
    console.log('Токен не предоставлен');
    return res.status(403).json({
      message: 'Нет доступа',
    });
  }
};

// для проверки администратора
export const checkAdmin = async (req, res, next) => {
  try {
    // Проверяем, есть ли информация о пользователе
    if (!req.userId) {
      return res.status(403).json({ message: 'Нет доступа' });
    }

    // Находим пользователя по ID
    const user = await UserModel.findById(req.userId);

    // Проверяем, является ли пользователь администратором
    if (!user.isAdmin) {
      return res.status(403).json({ message: 'Недостаточно прав для выполнения данной операции' });
    }

    // Если пользователь является администратором, продолжаем обработку запроса
    next();
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: 'Произошла ошибка при проверке прав администратора' });
  }
};
