var americano = require("americano");

var Recipe = americano.getModel("Recipe", {
    "name": String,
    "image": String,
    "description": String,
    "tags": [String],
    "products": [String],
    "toCook": Boolean
});

Recipe.allToCook = function (params, callback) {
    Recipe.request("allToCook", params, callback);
};

Recipe.allToCook = function (params, callback) {
    Recipe.request("byTag", params, callback);
};

module.exports = Recipe;
