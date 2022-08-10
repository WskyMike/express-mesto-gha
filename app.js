require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const app = express();
const { PORT } = process.env;

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
