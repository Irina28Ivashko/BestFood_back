import moment from 'moment';

// const formatDate = (date, format = 'DD.MM.YYYY HH:mm') => {
//   return date ? moment(date).format(format) : null;
// };

const formatDate = (date) => {
  if (!date) return null;

  // Создаем объект даты
  const d = new Date(date);

  // Форматируем дату
  const day = d.getDate().toString().padStart(2, '0');
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const year = d.getFullYear();
  const hours = d.getHours().toString().padStart(2, '0');
  const minutes = d.getMinutes().toString().padStart(2, '0');

  // Возвращаем дату в формате DD.MM.YYYY HH:mm
  return `${day}.${month}.${year} ${hours}:${minutes}`;
};

export default formatDate;
