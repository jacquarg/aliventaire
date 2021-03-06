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
        this.oldProducts = this.$el.find("ul.products.old");
        this.newProducts = this.$el.find("ul.products.new");
        this.collection.each(function (product){
            this.add(product, this.oldProducts);
        }, this);
        this.searchList = new List(this.$el.find(".products-list")[0], 
                                   { "valueNames": ["name", 
                                                    "price", 
                                                    "quantity"] });
    },

    "add": function (product, list) {
        var productView = new ProductView({ "model": product });
        if (!list) {
            list = this.newProducts;
        }
        list.prepend(productView.el);
    },

    "events": {
        "submit form": "addProduct",
        "click .old .delete": "removeFromList"
    },

    "addProduct": function (evt) {
        var $form = $(evt.target),
            price = $("#product-price").val() ? $("#product-price").val() : "0",
            product = new Product ({
                "name": $("#product-name").val(),
                "quantity": $("#product-quantity").val(),
                "price": price.replace(",", "."),
                "image": $("#product-image").val()
            }),
            that = this;

        this.collection.create(product, {
            "success": function (product) {
                that.add(product);
                $("#product-name").val("");
                $("#product-quantity").val("");
                $("#product-price").val("");
                $("#product-image").val("");
            }
        });

        return false;
    },

    "removeFromList": function (evt) {
        var productName = $(evt.target).parents("li").find(".name").text();
        this.searchList.remove("name", $.trim(productName));
    }
});
