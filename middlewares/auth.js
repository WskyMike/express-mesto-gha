const jwt = require('jsonwebtoken');
const Auth = require('../errors/Auth');

const { NODE_ENV, JWT_SECRET } = process.env;

function auth(req, res, next) {
  const { authorization } = req.headers; // Авторизационный заголовок

  if (!authorization) {
    next(new Auth('Необходима авторизация 1'));
  }

  const token = authorization.replace('Bearer ', '');

  let payload;

  try {
    payload = jwt.verify(token, NODE_ENV === 'production' ? JWT_SECRET : 'secret-key');
  } catch (err) {
    throw new Auth('Необходима авторизация 2');
  }

  req.user = payload; // записываем пейлоуд в объект запроса

  next();
}

module.exports = auth;
