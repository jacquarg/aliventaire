var americano = require("americano");

var Cart = americano.getModel("Cart", {
    "name": String,
    "products": [String]
});

module.exports = Cart;
