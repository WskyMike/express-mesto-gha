/* eslint-disable no-console */
require('dotenv').config();
const rateLimit = require('express-rate-limit');
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const app = express();
const { PORT } = process.env;

// DDoS protector
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

app.use(limiter);

// Сonfiguring headers for protection
const helmet = require('helmet');

app.use(helmet());

// Временное решение авторизации
app.use((req, res, next) => {
  req.user = {
    _id: '62f0bcfe8c4f431c85df63ff',
  };
  next();
});

// Подключение к MongoDB
async function connection() {
  await mongoose.connect('mongodb://localhost:27017/mestodb');
  console.log('Connected to DB');
  await app.listen(PORT);
  console.log(`Example app listening on port ${PORT}`);
}
connection();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Роуты
const { userRouter } = require('./routes/users');
const { cardRouter } = require('./routes/cards');

app.use('/', userRouter);
app.use('/', cardRouter);

// Обработка неправильного пути
app.use('*', (req, res) => {
  res.status(404).send({ message: 'Запрашиваемый ресурс не найден' });
});
