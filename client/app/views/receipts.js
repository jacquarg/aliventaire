var View        = require("./view"),
    Receipt     = require("../models/receipt"),
    Receipts    = require("../models/receipts"),
    ReceiptView = require("./receipt"),
    template    = require("./templates/receipts");

module.exports = View.extend({
    "collection": Receipts,
    
    "template": template,

    "render": function () {
        this.$el.html(this.template(this.getRenderData()));
        this.receiptsList = this.$el.find("ul.receipts");
        this.collection.each(function (receipt){
            this.add(receipt);
        }, this);
    },

    "updateRender": function (swiper) {
        console.log("this is a prototype, recepts list doesnt update")
    },

    "add": function (receipt) {
        var receiptView = new ReceiptView({ "model": receipt, 
                                            "products": this.products });
        this.receiptsList.prepend(receiptView.el);
    },
});
