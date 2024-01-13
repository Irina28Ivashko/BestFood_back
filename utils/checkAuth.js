import jwt from 'jsonwebtoken';

//спарсить и в дальнейшем его расшифровать
export default (req, res, next) => {
    const token = (req.headers.authorization || '').replace(/Bearer\s?/, '');

    if (token) {
        //если токен есть, от мы его расшифровываем с помощью функции jwt
        try {
            const decoded = jwt.verify(token, 'secret123');

            //если токен расшифрован, то в req передаем, точто смогли расшифровать
            req.userId = decoded._id;

            //если токен расшифрован и сохранен его id, то выполянем следующую фун-.
            next();
            //если токен не расшифрован, то оповещаем об этом
        } catch (e) {
            return res.status(403).json({
                message: 'Нет доступа',
            });
        }

    } else {
        return res.status(403).json({
            message: 'Нет доступа',
        });
    }
};


