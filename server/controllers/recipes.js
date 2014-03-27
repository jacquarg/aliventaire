async  = require("async");

Recipe  = require("../models/recipe");
Product = require("../models/product");

// TODO: move to model
function getFull(recipe, callback) {
    var products = [],
        product,
        name,
        i,
        price = 0;
    for (i = 0; i < recipe.products.items.length; i++) {
        name = recipe.products.items[i].name;
        if (!name) {
            name = recipe.products.items[i].id;
        }
        products.push(name);
    }

    Product.byFullName(products, function (err, products) {
        for (i = 0; i < products.length; i++) {
            product = products[i];
            price += product.price;
        }
        recipe = JSON.parse(JSON.stringify(recipe));
        recipe.products = products;
        recipe.price    = price;
        callback(null, recipe);
    });
}

function filterPrice(recipes, price, callback) {

    // dunno how to do that with couchdb ...
    if (!price) {
        async.map(recipes, getFull, function (error, results) {
            if (error) {
                callback({ 
                    "error": true, 
                    "msg": "Server error occured while retrieving data." 
                });
            } else {
                callback(results);
            }
        });
    } else {
        async.map(recipes, getFull, function (error, results) {
            if (error) {
                callback({ 
                    "error": true, 
                    "msg": "Server error occured while retrieving data." 
                });
            } else {
                var filtered = [], 
                    i,
                    result;
                for (i = 0; i < results.length; i++) {
                    result = results[i];
                    if (result.price <= price) {
                        filtered.push(result);
                    }
                }
                callback(filtered);
            }
        });
    }
}

module.exports.all = function (req, res) {
    if (req.query && req.query.tags) {
        result = Recipe.byTag(req.query.tags, function (error, recipes) {
            if (error) {
                console.log(error);
                return res.send({ 
                    "error": true, 
                    "msg": "Server error occured while retrieving data." 
                });
            } else {
                return filterPrice(recipes, req.query.price, function (result) {
                    res.send(result);
                });
            }
        });
    } else {
        result = Recipe.all(function (error, recipes) {
            if (error) {
                console.log(error);
                return res.send({ 
                    "error": true, 
                    "msg": "Server error occured while retrieving data." 
                });
            } else {
                return filterPrice(recipes, req.query.price, function (result) {
                    res.send(result);
                });
            }
        });
    }
    return result;
};

module.exports.toCook = function (req, res) {
    return Recipe.allToCook(function (error, recipes) {
        if (error) {
            console.log(error);
            return res.send({ 
                "error": true, 
                "msg": "Server error occured while retrieving data." 
            });
        } else {
            return filterPrice(recipes, undefined, function (result) {
                res.send(result);
            });
        }
    });
};

module.exports.create = function (req, res) {
    return Recipe.create(req.body, function(error, recipe) {
        if (error) {
            console.log(error);
            return res.send({
                "error": true,
                "msg": "Server error while creating recipe."
            }, 500);
        } else {
            return getFull(recipe, function (error, recipe) {
                res.send(recipe);
            });
        }
    });
};

module.exports.read = function(req, res) {
    return Recipe.find(req.params.id, function (error, recipe) {
        if (error || !recipe) {
            return res.send({
                "error": true,
                "msg": "Recipe not found"
            }, 404);
        } else {
            return getFull(recipe, function (error, recipe) {
                res.send(recipe);
            });
        }
    });
};

module.exports.update = function(req, res) {
    return Recipe.find(req.body.id, function (error, recipe) {
        if (error || !recipe) {
            return res.send({
                "error": true,
                "msg": "Recipe to update not found"
            }, 404);
        } else {
            return recipe.updateAttributes(req.body, function (error) {
                if (error) {
                    console.log(error);
                    res.send({
                        "error": true,
                        "msg": "Cannot update recipe"
                    }, 500);
                } else {
                    res.send(recipe);
                }
                return recipe;
            });
        }
    });
};

module.exports.del = function(req, res) {
    return Recipe.find(req.params.id, function (error, recipe) {
        if (error || !recipe) {
            return res.send({
                "error": true,
                "msg": "Recipe to delete not found"
            }, 404);
        } else {
            return recipe.destroy(function (error) {
                if (error) {
                    console.log(error);
                    res.send({
                        "error": true,
                        "msg": "Cannot destroy recipe"
                    }, 500);
                } else {
                    res.send({
                        "success": true,
                        "msg": "Recipe succesfuly deleted"
                    });
                }
                return recipe = null;
            });
        }
    });
};
