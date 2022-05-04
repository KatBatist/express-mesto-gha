const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const usersRoutes = require('./routes/users');
const cardsRoutes = require('./routes/cards');
const notFoundRouter = require('./routes/notFound');

const { PORT = 3000 } = process.env;

const app = express();

mongoose.connect('mongodb://localhost:27017/mestodb');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use((req, res, next) => {
  req.user = { _id: '6270eabedb852ba2c3f8d9c1' };

  next();
});

app.use('/', usersRoutes);
app.use('/', cardsRoutes);
app.all('*', notFoundRouter);

app.listen(PORT);
