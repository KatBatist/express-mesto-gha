const Card = require('../models/card');
const User = require('../models/user');

const NotFoundError = require('../errors/not-found-err');
const NotReqError = require('../errors/not-req-err');
const ForbiddenError = require('../errors/forbidden-err');

const getCards = (req, res, next) => {
  Card.find({})
    .then((cards) => {
      if (cards.length === 0) {
        throw new NotFoundError('Карточки не найдены');
      }
      res.status(200).send({ data: cards });
    })
    .catch(next);
};

const createCard = (req, res, next) => {
  const { name, link } = req.body;
  const owner = req.user._id;
  Card.create({ name, link, owner })
    .then((card) => {
      res.status(200).send({ data: card });
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        throw new NotReqError(`Переданы некорректные данные при создании карточки: ${err}`);
      }
    })
    .catch(next);
};

const deleteCard = (req, res, next) => {
  const id = req.user._id;
  Card.findById(req.params.cardId)
    .then((card) => {
      if (!card) {
        throw new NotFoundError('Карточка с указанным _id не найдена');
      }
      if (card.owner.toString() !== id) {
        throw new ForbiddenError('Недостаточно прав для удаления карточки');
      } else {
        Card.findByIdAndRemove(req.params.cardId) //  Card.findByIdAndDelete
          .then((cardDelete) => {
            res.status(200).send({ data: cardDelete });
          })
          .catch(next);
      }
    })
    .catch(next);
};

const likeCard = (req, res, next) => {
  const { cardId } = req.params;
  User.findById(req.user._id)
    .then((user) => {
      Card.findByIdAndUpdate(
        { _id: cardId },
        { $addToSet: { likes: user._id } },
        { new: true },
      ).then((card) => {
        if (!card) {
          throw new NotFoundError('Передан несуществующий _id карточки');
        }
        res.status(200).send({ data: card });
      }).catch((err) => {
        if (err.name === 'CastError') {
          throw new NotReqError(`Переданы некорректные данные для постановки лайка: ${err}`);
        }
      }).catch(next);
    })
    .catch(next);
};

const dislikeCard = (req, res, next) => {
  const { cardId } = req.params;
  User.findById(req.user._id)
    .then((user) => {
      Card.findByIdAndUpdate(
        { _id: cardId },
        { $pull: { likes: user._id } },
        { new: true },
      ).then((card) => {
        if (!card) {
          throw new NotFoundError('Передан несуществующий _id карточки');
        }
        res.status(200).send({ data: card });
      }).catch((err) => {
        if (err.name === 'CastError') {
          throw new NotReqError(`Переданы некорректные данные для снятия лайка: ${err}`);
        }
      }).catch(next);
    })
    .catch(next);
};

module.exports = {
  getCards,
  createCard,
  deleteCard,
  likeCard,
  dislikeCard,
};
