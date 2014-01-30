var Collection = require("./collection"),
    Recipe     = require("./recipe");

module.exports = Collection.extend({
    "model": Recipe,
    "url": "recipes"
});
