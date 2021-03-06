var americano = require("americano");

var Recipe = americano.getModel("Recipe", {
    "name": String,
    "image": String,
    "description": String,
    "tags": [String],
    "products": [String],
    "toCook": Number,
    // this should be a list of dates ... later
    "cooked": Number
});

Recipe.allToCook = function (params, callback) {
    Recipe.request("allToCook", params, callback);
};

Recipe.byTag = function (tags, callback) {
    Recipe.request("byTag", { "keys": tags }, callback);
};

module.exports = Recipe;
