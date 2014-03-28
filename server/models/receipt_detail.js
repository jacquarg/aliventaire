var americano = require("americano");

var ReceiptDetail = americano.getModel("ReceiptDetail", {
    "origin": String,
    "order": Number,
    "barcode": String,
    "label": String,
    "family": String,
    "familyLabel": String,
    "section": String,
    "sectionLabel": String,
    "amount": Number,
    "price": Number,
    "type": String,
    "typeLabel": String,
    "receiptId": String,
    "intermarcheShopId": String,
    "timestamp": Date,
    "isOnlineBuy": Boolean
});

ReceiptDetail.byReceiptId = function(receiptId, callback) {
    ReceiptDetail
        .request("byReceiptId", 
                { "keys": [receiptId,  receiptId.slice(0, -1)] },
                function(err, instances) {
                    callback(null, instances);
                });
};

module.exports = ReceiptDetail
