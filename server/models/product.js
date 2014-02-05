var americano = require("americano");

var Product = americano.getModel("Product", {
    "image": String,
    "name": String,
    "quantity": Number,
    "price": Number
});

module.exports = Product;
