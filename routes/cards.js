const cardRouter = require('express').Router();
const {
  getCards,
  createCard,
  deleteCard,
  likeCard,
  dislikeCard,
} = require('../controllers/cards');
const { cardValidation, idValidation } = require('../middlewares/validate');

cardRouter.get('/cards', getCards);
cardRouter.post('/cards', cardValidation, createCard);
cardRouter.delete('/cards/:_id', idValidation, deleteCard);
cardRouter.put('/cards/:_id/likes', idValidation, likeCard);
cardRouter.delete('/cards/:_id/likes', idValidation, dislikeCard);

module.exports = { cardRouter };
