Recipe = require("../models/recipe");

module.exports.all = function (req, res) {
    return Recipe.all(function (error, recipes) {
        if (error) {
            console.log(error);
            return res.send({ 
                "error": true, 
                "msg": "Server error occured while retrieving data." 
            });
        } else {
            return res.send(recipes);
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
            return res.send(recipe);
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
            res.send(recipe);
            return recipe;
        }
    });
};

module.exports.update = function(req, res) {
    return Recipe.find(req.body.id, function (error, recipe) {
        if (error || !recipe) {
            return res.send({
                "error": true,
                "msg": "Recipe not found"
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
                "msg": "Recipe not found"
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
