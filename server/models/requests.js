/* See documentation on
 https://github.com/frankrousseau/americano-cozy/#requests */

var americano = require("americano");

module.exports = {
    "product": {
        "all": americano.defaultRequests.all,
    },
    "recipe": {
        "all": americano.defaultRequests.all,
        "allToCook": function (doc) {
            if (doc.toCook) {
                return emit(doc._id, doc);
            }
        } 
    },
};
