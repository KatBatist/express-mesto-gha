const Card = require('../models/card');

const getCards = (req, res) => {
  Card.find({})
    .then((cards) => {
      if (cards.length === 0) {
        res.status(404).send({ message: 'Карточки не найдены' });
        return;
      }
      res.status(200).send({ data: cards });
    })
    .catch((err) => {
      res.status(500).send({ message: `На сервере произошла ошибка: ${err}` });
    });
};

const createCard = (req, res) => {
  const { name, link } = req.body;
  const owner = req.user._id;
  Card.create({ name, link, owner })
    .then((card) => {
      res.status(200).send({ data: card });
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        res.status(400).send({ message: `Переданы некорректные данные при создании карточки: ${err}` });
        return;
      }
      res.status(500).send({ message: `На сервере произошла ошибка: ${err}` });
    });
};

const deleteCard = (req, res) => {
  const id = req.params.cardId;
  Card.findByIdAndRemove(id)
    .then((card) => {
      if (!card) {
        res.status(404).send({ message: 'Карточка с указанным _id не найдена' });
        return;
      }
      res.status(200).send({ data: card });
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        res.status(400).send({ message: `Карточка с указанным _id не найдена: ${err}` });
        return;
      }
      res.status(500).send({ message: `На сервере произошла ошибка: ${err}` });
    });
};

const likeCard = (req, res) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $addToSet: { likes: req.user._id } },
    { new: true },
  ).then((card) => {
    if (!card) {
      res.status(404).send({ message: 'Передан несуществующий _id карточки' });
      return;
    }
    res.status(200).send({ data: card });
  }).catch((err) => {
    if (err.name === 'CastError') {
      res.status(400).send({ message: `Переданы некорректные данные для постановки лайка: ${err}` });
      return;
    }
    res.status(500).send({ message: `На сервере произошла ошибка: ${err}` });
  });
};

const dislikeCard = (req, res) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $pull: { likes: req.user._id } },
    { new: true },
  ).then((card) => {
    if (!card) {
      res.status(404).send({ message: 'Передан несуществующий _id карточки' });
      return;
    }
    res.status(200).send({ data: card });
  }).catch((err) => {
    if (err.name === 'CastError') {
      res.status(400).send({ message: `Переданы некорректные данные для снятия лайка: ${err}` });
      return;
    }
    res.status(500).send({ message: `Произошла ошибка: ${err}` });
  });
};

module.exports = {
  getCards,
  createCard,
  deleteCard,
  likeCard,
  dislikeCard,
};
