var View     = require("./view"),
    Recipe   = require("../models/recipe"),
    Product  = require("../models/product"),
    Products = require("../models/products"),
    template = require("./templates/recipe");

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
    },

    "destroy": function () {
        var that = this,
            i,
            product,
            products = this.model.get("products"),
            details = [];

        for (var i = 0; i < products.length; i++) {
            product = products[i];
            details.push({ "label": product.name, "amount": -1 })
        }
        Products.prototype.removeProducts(details, function () {
            var cooked,
                toCook;
            // TODO: increment and decrement toCook in a model function
            //       to prevent < 0
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
        });
    }
});
