var americano = require("americano");

var Product = americano.getModel("Product", {
    "name": String,
    "normalizedName": String,
    "image": String,
    "quantity": Number,
    "price": Number
});

Product.byName = function(name, callback) {
    Product
        .request("byName", 
                { "keys": [name] },
                function(err, instances) {
                    callback(null, instances);
                });
};

Product.byFullName = function(name, callback) {
    Product
        .request("byFullName", 
                { "keys": name },
                function(err, instances) {
                    callback(null, instances);
                });
};

module.exports = Product;
