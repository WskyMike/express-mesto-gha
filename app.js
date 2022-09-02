/* eslint-disable no-console */
require('dotenv').config();
const rateLimit = require('express-rate-limit');
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
// const cookieParser = require('cookie-parser');
const { errors } = require('celebrate');

const app = express();
const { PORT = 3000 } = process.env;

// CORS
const cors = require('cors');

app.use(cors()); // если не указать corsOptions, то запросы смогут слать все

// app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
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

// Логгирование
const { requestLogger, errorLogger } = require('./middlewares/logger');

app.use(requestLogger); // Запросы

// Роуты
const { userRouter } = require('./routes/users');
const { cardRouter } = require('./routes/cards');
const { logIn, createUser } = require('./controllers/users');
const auth = require('./middlewares/auth');
const { loginValidation, userValidation } = require('./middlewares/validate');

app.get('/crash-test', () => {
  setTimeout(() => {
    throw new Error('Сервер сейчас упадёт');
  }, 0);
});

app.post('/signin', loginValidation, logIn);
app.post('/signup', userValidation, createUser);

app.use('/', auth, userRouter);
app.use('/', auth, cardRouter);

// Обработка неправильного пути
const NotFound = require('./errors/NotFound');

app.use('*', () => {
  throw new NotFound('Запрашиваемый ресурс не найден');
});

app.use(errorLogger); // Ошибки

// Централизованная обработка ошибок
app.use(errors()); // JOI

app.use((err, req, res, next) => {
  const { statusCode = 500, message } = err;
  res
    .status(statusCode)
    .send({
      message: statusCode === 500
        ? 'На сервере произошла ошибка'
        : message,
    });
  next();
});

// Подключение к MongoDB
async function connection() {
  await mongoose.connect('mongodb://localhost:27017/mestodb', {
    useNewUrlParser: true,
  });
  console.log('Connected to DB');
  await app.listen(PORT);
  console.log(`Example app listening on port ${PORT}`);
}
connection();
