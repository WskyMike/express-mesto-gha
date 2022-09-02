const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/users');

const { NODE_ENV, JWT_SECRET } = process.env;

// ERRORS
// const Auth = require('../errors/Auth');
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
    .catch((err) => {
      if (err.name === 'CastError') {
        next(new BadRequest('Переданы некорректные данные для поиска пользователя'));
      } else {
        next(err);
      }
    });
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
        next(new Conflict('Пользователь с таким e-mail уже существует'));
      } else if (err.name === 'ValidationError') {
        next(new BadRequest('Переданы некорректные данные при создании пользователя'));
      } else {
        next(err);
      }
    });
}
// Обновить юзера
function updateUser(req, res, next) {
  const { name, about } = req.body;
  const userId = req.user._id;
  User.findByIdAndUpdate(userId, { name, about }, { new: true, runValidators: true })
    .then((user) => res.send(user))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new BadRequest('Переданы некорректные данные при обновлении пользователя'));
      } else {
        next(err);
      }
    });
}

// Обновить аватар
function updateAvatar(req, res, next) {
  const { avatar } = req.body;
  const userId = req.user._id;
  User.findByIdAndUpdate(userId, { avatar }, { new: true, runValidators: true })
    .then((avatarData) => res.send(avatarData))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new BadRequest('Переданы некорректные данные при обновлении аватара'));
      } else {
        next(err);
      }
    });
}
// Залогиниться
function logIn(req, res, next) {
  const { email, password } = req.body;

  return User.findUserByCredentials(email, password)
    .then((user) => {
      res.send({
        token: jwt.sign(
          { _id: user._id },
          NODE_ENV === 'production' ? JWT_SECRET : 'secret-key',
          { expiresIn: '7d' },
        ),
      });
      // .cookie('jwt', token, {
      //   maxAge: 604800 * 24 * 7,
      //   httpOnly: true,
      // })
    })
    .catch(next);
}

// Получить инфо текущего пользователя
function getCurrentUser(req, res, next) {
  User.findById(req.user._id)
    .orFail(() => {
      throw new NotFound('Пользователь с таким ID не найден');
    })
    .then((user) => res.send(user))
    .catch(next);
}

module.exports = {
  createUser,
  getUsers,
  getUserById,
  updateUser,
  updateAvatar,
  logIn,
  getCurrentUser,
};
