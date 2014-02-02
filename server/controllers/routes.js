// See documentation on https://github.com/frankrousseau/americano#routes

var index    = require("./index"),
    products = require("./products"),
    recipes  = require("./recipes");

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
    "recipes/:id": {
        "get": recipes.read,
        "put": recipes.update,
        "del": recipes.del
    }
};
