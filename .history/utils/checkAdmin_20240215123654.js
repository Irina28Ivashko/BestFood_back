const checkAdmin = async (req, res, next) => {
  try {
    const user = await UserModel.findById(req.userId);
    if (!user || !user.isAdmin) {
      return res.status(403).json({ message: 'Нет прав для выполнения этого действия' });
    }
    next();
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: 'Произошла ошибка при проверке прав' });
  }
};
