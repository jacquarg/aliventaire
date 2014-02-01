// See documentation on https://github.com/frankrousseau/americano#routes

var index    = require("./index"),
    products = require("./products");

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
    }
};
