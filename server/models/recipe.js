var americano = require("americano");

var Recipe = americano.getModel("Recipe", {
  name: String,
  description: String,
  products: [String]
});

module.exports = Recipe;
