Cart = require("../models/cart");

module.exports.all = function (req, res) {
    return Cart.all(function (error, carts) {
        if (error) {
            console.log(error);
            return res.send({ 
                "error": true, 
                "msg": "Server error occured while retrieving data." 
            });
        } else {
            return res.send(carts);
        }
    });
};

module.exports.create = function (req, res) {
    return Cart.create(req.body, function(error, cart) {
        if (error) {
            console.log(error);
            return res.send({
                "error": true,
                "msg": "Server error while creating cart."
            }, 500);
        } else {
            return res.send(cart);
        }
    });
};

module.exports.read = function(req, res) {
    return Cart.find(req.params.id, function (error, cart) {
        if (error || !cart) {
            return res.send({
                "error": true,
                "msg": "Cart not found"
            }, 404);
        } else {
            res.send(cart);
            return cart;
        }
    });
};

module.exports.update = function(req, res) {
    return Cart.find(req.body.id, function (error, cart) {
        if (error || !cart) {
            return res.send({
                "error": true,
                "msg": "Cart not found"
            }, 404);
        } else {
            return cart.updateAttributes(req.body, function (error) {
                if (error) {
                    console.log(error);
                    res.send({
                        "error": true,
                        "msg": "Cannot update cart"
                    }, 500);
                } else {
                    res.send(cart);
                }
                return cart;
            });
        }
    });
};

module.exports.del = function(req, res) {
    return Cart.find(req.params.id, function (error, cart) {
        if (error || !cart) {
            return res.send({
                "error": true,
                "msg": "Cart not found"
            }, 404);
        } else {
            return cart.destroy(function (error) {
                if (error) {
                    console.log(error);
                    res.send({
                        "error": true,
                        "msg": "Cannot destroy cart"
                    }, 500);
                } else {
                    res.send({
                        "success": true,
                        "msg": "Cart succesfuly deleted"
                    });
                }
                return cart = null;
            });
        }
    });
};
