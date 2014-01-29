var Collection = require("./collection"),
    Product    = require("./product");

module.exports = Collection.extend({
    "model": Product,
    "url": "products"
});
