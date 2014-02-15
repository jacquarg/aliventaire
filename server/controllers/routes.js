// See documentation on https://github.com/frankrousseau/americano#routes

var index    = require("./index"),
    carts    = require("./carts"),
    products = require("./products"),
    recipes  = require("./recipes"),
    receipts = require("./receipts");

module.exports = {
    "foo": {
        "get": index.main
    },
    "products": {
        "get": products.all,
        "post": products.create
    },
    "products/:id": {
        "get": products.read,
        "put": products.update,
        "del": products.del
    },
    "recipes": {
        "get": recipes.all,
        "post": recipes.create
    },
    "recipes/to-cook": {
        "get": recipes.toCook,
    },
    "recipes/:id": {
        "get": recipes.read,
        "put": recipes.update,
        "del": recipes.del
    },
    "carts": {
        "get": carts.all,
        "post": carts.create
    },
    "carts/:id": {
        "get": carts.read,
        "put": carts.update,
        "del": carts.del
    },
    "receipts": {
        "get": receipts.all,
    },
    "receipts/:id": {
        "get": receipts.read,
    },
};
