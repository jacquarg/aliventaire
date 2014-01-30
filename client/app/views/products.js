var View        = require("./view"),
    Product     = require("../models/product"),
    Products    = require("../models/products"),
    ProductView = require("./product"),
    template    = require("./templates/products");

module.exports = View.extend({
    "collection": Products,
    
    "template": template,

    "render": function () {
        this.$el.html(this.template(this.getRenderData()));
        this.collection.each(function (product){
            this.add(product);
        }, this);
    },

    "add": function (product) {
        var productView = new ProductView({ "model": product });
        this.$el.find("ul.products").prepend(productView.el)
    },

    "events": {
        "submit form": "addProduct",
    },

    "addProduct": function (evt) {
        var $form = $(evt.target),
            product = new Product ({
                "name": $("#product-name").val(),
                "number": $("#product-number").val(),
                "price": $("#product-price").val(),
            });

        this.collection.push(product);
        this.add(product);

        return false;
    },

});
