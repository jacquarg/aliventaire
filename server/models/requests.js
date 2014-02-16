/* See documentation on
 https://github.com/frankrousseau/americano-cozy/#requests */

var americano = require("americano");

module.exports = {
    "product": {
        "all": americano.defaultRequests.all,
    },
    "cart": {
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
    "receipt": {
        "all": function(doc) {
            if (doc.timestamp) {
                emit(doc.timestamp, doc);
            }
        },
        "byReceiptId": function(doc) {
            if (doc.receiptId) {
                emit(doc.receiptId, doc);
            }
        },
    },
    "receipt_detail": {
        "all": americano.defaultRequests.all,
        "byReceiptId": function(doc) {
            if (doc.receiptId) {
                emit(doc.receiptId, doc);
            } else {
                // Old receiptDetail format.
                // doc.receiptId = doc.ticketId;
                emit(doc.ticketId, doc);
            }
        },
    },
};
