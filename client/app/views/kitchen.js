var View         = require("./view"),
    Receipts     = require("../models/receipts"),
    ReceiptsView = require("./receipts"),
    ToCooksView  = require("./to_cooks"),
    template     = require("./templates/kitchen");

module.exports = View.extend({
    "id": "kitchen",
    "template": template,

    "initialize": function (params) {
        this.receipts = params.receipts;
        this.toCook   = params.toCook;

    },

    "render": function () {
        this.$el.html(this.template());

        this.receiptsView = new ReceiptsView({ 
            "el": $("#receipts")[0],
            "collection": this.receipts
        });
        this.receiptsView.render();

        this.toCooksView = new ToCooksView({ 
            "el": $("#recipes-to-cook")[0],
            "collection": this.toCook
        });
        this.toCooksView.render();
    },

    "updateRender": function (swiper) {
        this.receiptsView.updateRender();
        this.toCooksView.updateRender();
    },
});
