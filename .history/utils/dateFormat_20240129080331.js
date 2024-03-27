import moment from 'moment';

const formatDate = (date, format = 'DD.MM.YYYY HH:mm') => {
  return date ? moment(date).format(format) : null;
};

export default formatDate;
