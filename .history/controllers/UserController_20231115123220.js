import jwt from 'jsonwebtoken';   //генерация специального токена
import bcrypt from 'bcrypt';   //шифруем пароль 

import UserModel from '../models/User.js'; //создаем пользователя

export const register = async (req, res) => {
    //оборачиваем в try и catch, чтобы можно было обрабатывать ошибки, которые присылают монгодб и nodejs
    try {
    // перед созданием пароля необходимо выташить пароль и создаем соль (алгоритм шифромания нашего пароля)
    const password = req.body.password;
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    //создаем документ на создание пользователя c помощью монгодб
    const doc = new UserModel({
        email: req.body.email,
        fullName: req.body.fullName,
        avatarUrl: req.body.avatarUrl,
        passwordHash: hash,
    });
      

    //создаем пользователя в монгодб
    const user = await doc.save();
    

    // после того,как документ был создан с бд, создаем токен с помощью jwt и указать, что токен хранит зашифрованную инфу
    const token = jwt.sign(
        {
            _id: user._id,
        }, 
        //указыаем ключ, благодаря которому шифруем токен
        'secret123',
        {
            //указать срок жизни токена, через сколько он перестанет быть валидным
            expiresIn: '30d',
        },
    );

    //вытаскиваем с помощью диструктурищации хэш
    const { passwordHash, ...userData } = user._doc;

    //необходимо вернуть инфо об пользователе и сам токен
    res.json({
        ...userData,
        token,
    });

    } catch (err) {
        //для себя в консоли передаем
        console.log(err);
        //передаем пользователю сообщение
        res.status(500).json({
            message: 'Не удалось зарегестрироваться',
        });
    }
};

//делаем авторизацию
export const login = async (req, res) => {
    try {
        // ищем пользователя по email
        const user = await UserModel.findOne({ email: req.body.email });

        if (!user) {
            return res.status(404).json({
                message: 'Пользователь не найден',
            });
        }

        const isValidPass = await bcrypt.compare(req.body.password, user._doc.passwordHash);

        if (!isValidPass) {
            return res.status(400).json({
                message: 'Неверный логин или пароль',
            });
        }

        const token = jwt.sign(
            {
                _id: user._id,
            }, 
            //указыаем ключ, благодаря которому шифруем токен
            'secret123',
            {
                //указать срок жизни токена, через сколько он перестанет быть валидным
                expiresIn: '30d',
            },
        );
        const { passwordHash, ...userData } = user._doc;

        res.json({
            ...userData,
            token,
        });
    } catch (err) {
        console.log(err);
        
        res.status(500).json({
            message: 'Не удалось авторизоваться',
        });
    }
};

//получаем инфу о себе
export const getMe = async (req, res) => {
    try {
        // передаем что userModel должен с помощью findById вытащить пользователя и найти его в бд
         const user = await UserModel.findById(req.userId);

         //если такого пользователя нет, то сообщаем об этом
         if (!user) {
             return res.status(404).json({
                message: 'Пользователь не найден',
             });
         }

         //если пользоваетль найден, то возвращаем отыет
          const { passwordHash, ...userData } = user._doc;

          res.json(userData);

        } catch (err) {
            console.log(err);
            res.status(500).json({
             message: 'Нет доступа',
            });
        }
};