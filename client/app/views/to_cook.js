var View     = require("./view"),
    Recipe   = require("../models/recipe"),
    Product  = require("../models/product"),
    Products = require("../models/products"),
    template = require("./templates/recipe-to-cook");

module.exports = View.extend({
    "tagName": "li",
    "className": "row recipe",
    "template": template,

    "model": Recipe,

    "getRenderData": function () { 
        var attributes = this.model.attributes;
        if (!attributes.image) {
            attributes.image = "images/recipe.png";
        }
        if (attributes.description) {
            attributes.description = 
                attributes.description.replace(/[\r\n]+/g, "<br>");
        }
        return attributes;
    },

    "initialize": function () {
        this.render();
    },

    "events": {
        "click .delete": "destroy",
        "click .plus": "plus",
        "click .minus": "minus",
    },

    "change": function (evt, amount) {
        var that = this,
            details = [],
            $target = $(evt.currentTarget).parents(".row:first");
            $product = $target.find(".name"),
            $quantity = $target.find(".quantity"),
            productName = $.trim($product.text());

        details.push({ "label": productName, "amount": amount });

        Products.prototype.removeProducts(details, function (data) {
            var newQuantity = parseInt($.trim($quantity.text())) + amount;
            if (newQuantity >= 0) {
                $quantity.html(newQuantity);
            }
        });
    },

    "minus": function (evt) {
        this.change(evt, -1);
    },

    "plus": function (evt) {
        this.change(evt, 1);
    },

    "destroy": function () {
        var that = this,
            i,
            product,
            products = this.model.get("products"),
            details = [];

        toCook = that.model.get("toCook") - 1;
        cooked = that.model.get("cooked");
        if (cooked) {
            cooked++;
        } else {
            cooked = 1;
        }
        that.model.save({ "toCook": toCook, "cooked": cooked }, {
            "success": function (data) {
                if (!data.attributes.toCook) {
                    that.remove();
                }
            }
        });
    }
});
