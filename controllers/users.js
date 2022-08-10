const User = require('../models/users');

// Получить всех юзеров из БД
function getUsers(req, res) {
  User.find({})
    .then((users) => res.send(users))
    .catch(() => res.status(500).send({ message: 'Произошла ошибка' }));
}

// Найти юзера по ID
function getUserById(req, res) {
  User.findById(req.params._id)
    .orFail(() => res.status(404).send({ message: 'Пользователь с таким ID не найден' }))
    .then((user) => res.send(user))
    .catch((err) => {
      if (err.name === 'CastError') {
        res
          .status(400)
          .send({
            message: 'Переданы некорректные данные для поиска пользователя',
          });
      } else {
        res
          .status(500)
          .send({ message: 'Произошла ошибка' });
      }
    });
}

// Cоздать юзера
function createUser(req, res) {
  const { name, about, avatar } = req.body;
  User.create({ name, about, avatar })
    .then((user) => res.send(user))
    .catch((err) => {
      if (err.name === 'CastError') {
        res
          .status(400)
          .send({
            message: 'Переданы некорректные данные при создании пользователя',
          });
      } else {
        res
          .status(500)
          .send({ message: 'Произошла ошибка' });
      }
    });
}

// Обновить юзера
function updateUser(req, res) {
  const { name, about } = req.body;
  const userId = req.user._id;
  User.findByIdAndUpdate(userId, { name, about }, { new: true })
    .orFail(() => res.status(404).send({ message: 'Пользователь с таким ID не найден' }))
    .then((user) => res.send(user))
    .catch((err) => {
      if (err.name === 'CastError') {
        res
          .status(400)
          .send({
            message: 'Переданы некорректные данные при обновлении профиля',
          });
      } else {
        res
          .status(500)
          .send({ message: 'Произошла ошибка' });
      }
    });
}

// Обновить аватар
function updateAvatar(req, res) {
  const { avatar } = req.body;
  const userId = req.user._id;
  User.findByIdAndUpdate(userId, { avatar }, { new: true })
    .orFail(() => res.status(404).send({ message: 'Пользователь с таким ID не найден' }))
    .then((avatarData) => res.send(avatarData))
    .catch((err) => {
      if (err.name === 'CastError') {
        res
          .status(400)
          .send({
            message: 'Переданы некорректные данные при обновлении аватара',
          });
      } else {
        res
          .status(500)
          .send({ message: 'Произошла ошибка' });
      }
    });
}

module.exports = {
  createUser,
  getUsers,
  getUserById,
  updateUser,
  updateAvatar,
};
