const Card = require('../models/cards');

// ERRORS
const BadRequest = require('../errors/BadRequest');
const NotFound = require('../errors/NotFound');
const Forbidden = require('../errors/Forbidden');

//  Получить все карточки
function getCards(req, res, next) {
  Card.find({})
    .then((cards) => res.send(cards))
    .catch(next);
}

// Найти карточку по ID и удалить
function deleteCard(req, res, next) {
  const userId = req.user._id;
  const cardId = req.params._id;

  Card.findById(cardId)
    .orFail(() => {
      throw new NotFound('Карточка с таким id не найдена');
    })
    .then((card) => {
      if (card.owner.toString() === userId) {
        Card.findByIdAndRemove(cardId)
          .then((cardData) => res.send(cardData))
          .catch(next);
      } else {
        next(new Forbidden('Недостаточно прав!'));
      }
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        next(new BadRequest('Переданы некорректные данные при удалении карточки'));
      } else {
        next(err);
      }
    });
}

// Создать карточку
function createCard(req, res, next) {
  const { name, link } = req.body;
  const owner = req.user._id;

  Card.create({ name, link, owner })
    .then((card) => res.send(card))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new BadRequest('Ошибка валидации'));
      } else {
        next(err);
      }
    });
}

// Поставить лайк
function likeCard(req, res, next) {
  Card.findByIdAndUpdate(
    req.params._id,
    { $addToSet: { likes: req.user._id } }, // добавить _id в массив, если его там нет
    { new: true },
  )
    .orFail(() => {
      throw new NotFound('Карточка с таким ID не найдена');
    })
    .then((like) => res.send(like))
    .catch((err) => {
      if (err.name === 'CastError') {
        next(new BadRequest('Переданы некорректные данные для добавления лайка'));
      } else {
        next(err);
      }
    });
}

// Удалить лайк
function dislikeCard(req, res, next) {
  Card.findByIdAndUpdate(
    req.params._id,
    { $pull: { likes: req.user._id } }, // убрать _id из массива
    { new: true },
  )
    .orFail(() => {
      throw new NotFound('Карточка с таким ID не найдена');
    })
    .then((like) => res.send(like))
    .catch((err) => {
      if (err.name === 'CastError') {
        next(new BadRequest('Переданы некорректные данные для снятия лайка'));
      } else {
        next(err);
      }
    });
}

module.exports = {
  getCards,
  createCard,
  deleteCard,
  likeCard,
  dislikeCard,
};
