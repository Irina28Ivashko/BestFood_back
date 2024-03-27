import multer from 'multer';
import path from 'path';

// Функция валидации файлов
const fileFilter = (req, file, cb, limitSize, allowedTypes) => {
  if (!allowedTypes.includes(file.mimetype)) {
    cb(new Error('Недопустимый формат файла.'));
  } else if (file.size > limitSize) {
    cb(new Error(`Файл слишком большой. Максимальный размер файла: ${limitSize / 1024 / 1024}MB.`));
  } else {
    cb(null, true);
  }
};

// Конфигурации multer
const storageAvatar = multer.diskStorage({
  destination: 'uploads/avatars',
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Название файла
  },
});

const storageImage = multer.diskStorage({
  destination: 'uploads/images',
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Название файла
  },
});

// Экспорт конфигураций
export const uploadAvatar = multer({
  storage: storageAvatar,
  limits: { fileSize: 1024 * 100 }, // Ограничение размера файла для аватара
  fileFilter: (req, file, cb) => fileFilter(req, file, cb, 1024 * 100, ['image/jpeg', 'image/png']),
});

export const uploadImage = multer({
  storage: storageImage,
  limits: { fileSize: 1024 * 1024 * 5 }, // Ограничение размера файла для изображений
  fileFilter: (req, file, cb) =>
    fileFilter(req, file, cb, 1024 * 1024 * 5, ['image/jpeg', 'image/png']),
});
