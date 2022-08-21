const userRouter = require('express').Router();
const {
  getUsers,
  getUserById,
  updateUser,
  updateAvatar,
  getCurrentUser,
} = require('../controllers/users');
const { userAboutValidation, avatarValidation, idValidation } = require('../middlewares/validate');

userRouter.get('/users', getUsers);
userRouter.get('/users/me', idValidation, getCurrentUser);
userRouter.get('/users/:_id/', idValidation, getUserById);
userRouter.patch('/users/me', userAboutValidation, updateUser);
userRouter.patch('/users/me/avatar', avatarValidation, updateAvatar);

module.exports = { userRouter };
