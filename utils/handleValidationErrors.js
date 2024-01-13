import { validationResult } from 'express-validator';  //рповеряет есть ли ошибки или нет при проверке валидации и формы регистрации

export default (req, res, next) => {
    //объясняем, что тут хотим получить все ошибки, для этого нужно все вытащить из запроса
    const errors = validationResult(req);
    //если валиция не прошла, то верни мне список ошибок
    if (!errors.isEmpty()) {
      return res.status(400).json(errors.array());
     }

     //если ошибок нет, то идем дальше
     next();
};