const express = require("express");
const bodyParser = require("body-parser");
const Favorites = require("../models/favorites");
var authenticate = require("../authenticate");
const cors = require("./cors");
const favoriteRouter = express.Router();

favoriteRouter.use(bodyParser.json());

favoriteRouter
  .route("/")
  .options(cors.corsWithOptions, (req, res) => {
    res.sendStatus(200);
  })
  .get(cors.cors, authenticate.verifyUser, (req, res, next) => {
    Favorites.findOne({ user: req.user._id })
      .populate("user")
      .populate("dishes")
      .then(
        favorite => {
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.json(favorite);
        },
        err => next(err)
      )
      .catch(err => next(err));
  })
  .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorites.findOne({ user: req.user._id })
      .then(
        favorite => {
          if (favorite) {
            req.body.forEach(dish => {
              if (favorite.dishes.indexOf(dish._id) === -1) {
                favorite.dishes.push(dish._id);
              }
            });
            favorite.save().then(updatedFavorite => {
              res.json(updatedFavorite);
            });
          } else {
            Favorites.create({ user: req.user._id, dishes: req.body }).then(newFavorite => {
              res.json(newFavorite);
            });
          }
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
        },
        err => next(err)
      )
      .catch(err => next(err));
  })
  .put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end("PUT operation not supported on /favorites");
  })
  .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorites.deleteOne({ user: req.user._id })
      .then(
        resp => {
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.json(resp);
        },
        err => next(err)
      )
      .catch(err => next(err));
  });

favoriteRouter
  .route("/:dishId")
  .options(cors.corsWithOptions, (req, res) => {
    res.sendStatus(200);
  })
  .get(cors.cors, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end("GET operation not supported on /favorites/" + req.params.dishId);
  })
  .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorites.findOne({ user: req.user._id })
      .then(
        favorite => {
          if (favorite) {
            if (favorite.dishes.indexOf(req.params.dishId) === -1) {
              favorite.dishes.push(req.params.dishId);
            }
            favorite.save().then(updatedFavorite => {
              res.json(updatedFavorite);
            });
          } else {
            Favorites.create({ user: req.user._id, dishes: [req.params.dishId] }).then(newFavorite => {
              res.json(newFavorite);
            });
          }
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
        },
        err => next(err)
      )
      .catch(err => next(err));
  })
  .put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end("PUT operation not supported on /favorites/" + req.params.dishId);
  })
  .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorites.findOne({ user: req.user._id })
      .then(
        favorite => {
          var index = favorite.dishes.indexOf(req.params.dishId);
          if (index > -1) {
            favorite.dishes.splice(index, 1);
          }
          favorite.save().then(favorite => {
            res.statusCode = 200;
            res.setHeader("Content-Type", "application/json");
            res.json(favorite);
          });
        },
        err => next(err)
      )
      .catch(err => next(err));
  });

module.exports = favoriteRouter;
