import PostModel from '../models/Post.js';

//получение всех статей
export const getAll = async (req, res) => {
    try {
        const posts = await PostModel.find().populate('user').exec();

      res.json(posts);
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
            { new: true } // используйте new вместо returnDocument
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
        await PostModel.updateOne({
            _id: postId,
         }, 
         {
            title: req.body.title,
            text: req.body.text,
            imageUrl: req.body.imageUrl,
            user: req.userId,
            tags: req.body.tags/*.split(',')*/,
            
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
            tags: req.body.tags,
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