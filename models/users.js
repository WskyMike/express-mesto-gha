/* eslint-disable func-names */
const { Schema, model } = require('mongoose');
const { isEmail } = require('validator');
const bcrypt = require('bcrypt');
const { linkRegExp } = require('../middlewares/validate');
const Auth = require('../errors/Auth');

const userSchema = new Schema({
  name: {
    type: String,
    minlength: 2,
    maxlength: 30,
    default: 'Жак-Ив Кусто',
  },
  about: {
    type: String,
    minlength: 2,
    maxlength: 30,
    default: 'Исследователь',
  },
  avatar: {
    type: String,
    validate: {
      validator(link) {
        return linkRegExp.test(link);
      },
      message: 'Здесь должна быть ссылка',
    },
    default: 'https://esquire.kz/wp-content/uploads/2019/06/e5d59868-71df-4389-bb85-9ba52baa934a.jpeg',
  },
  email: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator(email) {
        return isEmail(email);
      },
    },
  },
  password: {
    type: String,
    required: true,
    unique: true,
    select: false, // По умолчанию хеш пароля пользователя не будет возвращаться из базы.
  },
}, {
  versionKey: false, // убрать версию из схемы
});

// В случае аутентификации вернем хэш пароля
userSchema.statics.findUserByCredentials = function (email, password) {
  return this.findOne({ email }).select('+password')
    .then((user) => {
      if (!user) {
        throw new Auth('Неправильные почта или пароль');
      }

      return bcrypt.compare(password, user.password)
        .then((matched) => {
          if (!matched) {
            throw new Auth('Неправильные почта или пароль');
          }
          return user;
        });
    });
};

module.exports = model('user', userSchema);
