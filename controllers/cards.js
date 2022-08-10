const Card = require('../models/cards');

//  Получить все карточки
function getCards(req, res) {
  Card.find({})
    .then((cards) => res.send(cards))
    .catch(() => {
      res
        .status(500)
        .send({ message: 'На сервере произошла ошибка' });
    });
}

// Найти карточку по ID и удалить
function deleteCard(req, res) {
  const userId = req.user._id;
  const cardId = req.params._id;

  Card.findById(cardId)
    .orFail(() => {
      res
        .status(404)
        .send({ message: 'Карточка с таким ID не найдена' });
    })
    .then((card) => {
      if (card.owner.toString() === userId) {
        Card.findByIdAndRemove(cardId)
          .then((cardData) => res.send(cardData));
      } else {
        res
          .status(400)
          .send({ message: 'Недостаточно прав' });
      }
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        res
          .status(400)
          .send({ message: 'Переданы некорректные данные при удалении карточки' });
      } else {
        res
          .status(500)
          .send({ message: 'На сервере произошла ошибка' });
      }
    });
}

// Создать карточку
function createCard(req, res) {
  const { name, link } = req.body;
  const owner = req.user._id;

  Card.create({ name, link, owner })
    .then((card) => res.send(card))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        res
          .status(400)
          .send({
            message: 'Переданы некорректные данные при создании карточки',
          });
      } else {
        res
          .status(500)
          .send({ message: 'На сервере произошла ошибка' });
      }
    });
}

// Поставить лайк
function likeCard(req, res) {
  Card.findByIdAndUpdate(
    req.params._id,
    { $addToSet: { likes: req.user._id } }, // добавить _id в массив, если его там нет
    { new: true },
  )
    .orFail(() => res.status(404).send({ message: 'Карточка с таким ID не найдена' }))
    .then((like) => res.send(like))
    .catch((err) => {
      if (err.name === 'CastError') {
        res
          .status(400).send({ message: 'Переданы некорректные данные для добавления лайка' });
      } else {
        res
          .status(500).send({ message: 'На сервере произошла ошибка' });
      }
    });
}

// Удалить лайк
function dislikeCard(req, res) {
  Card.findByIdAndUpdate(
    req.params._id,
    { $pull: { likes: req.user._id } }, // убрать _id из массива
    { new: true },
  )
    .orFail(() => res.status(404).send({ message: 'Карточка с таким ID не найдена' }))
    .then((like) => res.send(like))
    .catch((err) => {
      if (err.name === 'CastError') {
        res
          .status(400).send({ message: 'Переданы некорректные данные для удаления лайка' });
      } else {
        res
          .status(500).send({ message: 'На сервере произошла ошибка' });
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
