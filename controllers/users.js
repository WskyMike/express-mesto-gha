const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/users');
// ERRORS
const Auth = require('../errors/Auth');
const BadRequest = require('../errors/BadRequest');
const NotFound = require('../errors/NotFound');
const Conflict = require('../errors/Conflict');
// Получить всех юзеров из БД
function getUsers(req, res, next) {
  User.find({})
    .then((users) => res.send(users))
    .catch(next);
}
// Найти юзера по ID
function getUserById(req, res, next) {
  User.findById(req.params._id)
    .orFail(() => {
      throw new NotFound('Пользователь с таким ID не найден');
    })
    .then((user) => res.send(user))
    .catch(next);
}
// Cоздать юзера
function createUser(req, res, next) {
  const {
    name,
    about,
    avatar,
    email,
    password,
  } = req.body;
  bcrypt.hash(password, 10)
    .then((hash) => User.create({
      name,
      about,
      avatar,
      email,
      password: hash,
    }))
    .then((user) => {
      res.send({
        name: user.name,
        about: user.about,
        avatar: user.avatar,
        email: user.email,
      });
    })
    .catch((err) => {
      if (err.code === 11000) {
        throw new Conflict('Пользователь с таким e-mail уже существует');
      } else if (err.name === 'ValidationError') {
        throw new BadRequest('Переданы некорректные данные при создании пользователя');
      }
    })
    .catch(next);
}
// Обновить юзера
function updateUser(req, res, next) {
  const { name, about } = req.body;
  const userId = req.user._id;
  User.findByIdAndUpdate(userId, { name, about }, { new: true, runValidators: true })
    .then((user) => res.send(user))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        throw new BadRequest('Переданы некорректные данные при обновлении пользователя');
      }
    })
    .catch(next);
}
// Обновить аватар
function updateAvatar(req, res, next) {
  const { avatar } = req.body;
  const userId = req.user._id;
  User.findByIdAndUpdate(userId, { avatar }, { new: true, runValidators: true })
    .then((avatarData) => res.send(avatarData))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        throw new BadRequest('Переданы некорректные данные при обновлении аватара');
      }
    })
    .catch(next);
}
function logIn(req, res, next) {
  const { email, password } = req.body;
  return User.findUserByCredentials(email, password)
    .then((user) => {
      const token = jwt.sign({ _id: user._id }, 'secret-key', {
        expiresIn: '7d',
      });
      res
        .cookie('jwt', token, {
          maxAge: 604800 * 24 * 7,
          httpOnly: true,
        })
        .send({ message: 'Авторизация прошла успешно!' });
    })
    .catch(() => {
      throw new Auth('Ошибка авторизации');
    })
    .catch(next);
}
// Получить инфо текущего пользователя
const getCurrentUser = (req, res, next) => {
  User.findById(req.user._id)
    .orFail()
    .catch(() => {
      throw new NotFound('Пользователь с таким ID не найден');
    })
    .then((currentUser) => res.send(currentUser))
    .catch(next);
};
module.exports = {
  createUser,
  getUsers,
  getUserById,
  updateUser,
  updateAvatar,
  logIn,
  getCurrentUser,
};
