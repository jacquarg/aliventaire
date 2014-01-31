var View     = require("./view"),
    Cart     = require("../models/cart"),
    Carts    = require("../models/carts"),
    CartView = require("./cart"),
    template = require("./templates/carts");

module.exports = View.extend({
    "collection": Carts,
    
    "template": template,

    "initialize": function (params) {
        this.recipes = params.recipes.models;
    },

    "getRenderData": function () {
        return { "recipes": this.recipes }
    },

    "render": function () {
        this.$el.html(this.template(this.getRenderData()));
        this.collection.each(function (cart){
            this.add(cart);
        }, this);
    },

    "add": function (cart) {
        var cartView = new CartView({ "model": cart });
        this.$el.find("ul.carts").prepend(cartView.el)
    },

    "addCart": function (evt) {
        var $form = $(evt.target),
            cart = new Cart ({
                "name": $("#cart-name").val(),
                "description": $("#cart-description").val(),
                "products": $("#cart-products").val()
            });

        this.collection.push(cart);
        this.add(cart);

        return false;
    },

    "events": {
        "click .recipe": "updateCart",
    },

    "updateCart": function (evt) {
        var $target = $(evt.currentTarget),
            $button = $target.find(".btn"),
            products = this.recipes[0].attributes.products;

        $button.toggleClass("glyphicon-unchecked");
        $button.toggleClass("glyphicon-check");

        if ($button.hasClass("glyphicon-check")) {
            _(products).each(function (product) {
                var productContainer = $("<div class='product' />");
                productContainer.html(product);
                $("#cart .products").append(productContainer);
            });
        } else {
            $("#cart .products .product").remove();
        }
    }
});
