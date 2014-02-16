var Collection = require("./collection"),
    Receipt    = require("./receipt");

module.exports = Collection.extend({
    "model": Receipt,
    "url": "receipts"
});
