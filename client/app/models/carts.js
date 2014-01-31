var Collection = require("./collection"),
    Cart       = require("./cart");

module.exports = Collection.extend({
    "model": Cart,
    "url": "carts"
});
