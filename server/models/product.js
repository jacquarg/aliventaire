var americano = require("americano");

var Product = americano.getModel("Product", {
    "name": String,
    "image": String,
    "quantity": Number,
    "price": Number
});

module.exports = Product;
