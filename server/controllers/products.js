Product = require("../models/product");

module.exports.all = function (req, res) {
    return Product.all(function (error, products) {
        if (error) {
            console.log(error);
            return res.send({ 
                "error": true, 
                "msg": "Server error occured while retrieving data." 
            });
        } else {
            return res.send(products);
        }
    });
};

module.exports.create = function (req, res) {
    return Product.create(req.body, function(error, product) {
        if (error) {
            console.log(error);
            return res.send({
                "error": true,
                "msg": "Server error while creating product."
            }, 500);
        } else {
            return res.send(product);
        }
    });
};

module.exports.read = function(req, res) {
    return Product.find(req.params.id, function (error, product) {
        if (error || !product) {
            return res.send({
                "error": true,
                "msg": "Product not found"
            }, 404);
        } else {
            res.send(product);
            return product;
        }
    });
};

module.exports.byName = function(req, res) {
    return Product.byName(req.params.name, function (error, product) {
        if (error || !product) {
            return res.send({
                "error": true,
                "msg": "Product not found"
            }, 404);
        } else {
            res.send(product);
            return product;
        }
    });
};

module.exports.update = function(req, res) {
    return Product.find(req.body.id, function (error, product) {
        if (error || !product) {
            return res.send({
                "error": true,
                "msg": "Product not found"
            }, 404);
        } else {
            return product.updateAttributes(req.body, function (error) {
                if (error) {
                    console.log(error);
                    res.send({
                        "error": true,
                        "msg": "Cannot update product"
                    }, 500);
                } else {
                    res.send(product);
                }
                return product;
            });
        }
    });
};

module.exports.del = function(req, res) {
    return Product.find(req.params.id, function (error, product) {
        if (error || !product) {
            return res.send({
                "error": true,
                "msg": "Product not found"
            }, 404);
        } else {
            return product.destroy(function (error) {
                if (error) {
                    console.log(error);
                    res.send({
                        "error": true,
                        "msg": "Cannot destroy product"
                    }, 500);
                } else {
                    res.send({
                        "success": true,
                        "msg": "Product succesfuly deleted"
                    });
                }
                return product = null;
            });
        }
    });
};
