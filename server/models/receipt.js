var americano = require("americano");

var Receipt = americano.getModel("Receipt", {
    "receiptId": String,
    "transactionCode": String,
    "transaction": String,
    "transactionId": String,
    "timestamp": Date,
    "checkoutId": String,
    "checkoutReceiptId": String,
    "cashierId": String,
    "articlesCount": Number,
    "amount": Number,
    "loyaltyBalance": Number,
    "convertedPoints": Number,
    "acquiredPoints": Number,
    "intermarcheShopId": String,
    "total": Number,
    "paidAmound": Number,
    "isOnline": Boolean,
    "snippet": String
});

Receipt.byReceiptId = function(receiptId, callback) {
    Receipt
        .request("byReceiptId", 
                { "keys": [receiptId] },
                function(err, instances) {
                    callback(null, instances);
                });
};

module.exports = Receipt;
