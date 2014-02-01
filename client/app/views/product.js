var View     = require("./view"),
    Product  = require("../models/product"),
    template = require("./templates/product");

module.exports = View.extend({
    "tagName": "li",
    "className": "row product",
    "template": template,

    "model": Product,

    "getRenderData": function () { 
        var attributes = this.model.attributes;
        if (!attributes.image) {
            attributes.image = "images/fridge.png";
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

    "destroy": function () {
        var that = this;

        that.model.destroy({
            "success": function () {
                that.remove();
            }
        });
    },

    "plus": function () {
        var that = this;

        that.model.save({ "quantity": this.model.get("quantity") + 1 }, {
            "success": function (product) {
                that.render();
            },
            "error": function (obj, response) {
                console.log(response.responseText)
            }
        });
    },

    "minus": function () {
        var that = this;

        that.model.save({ "quantity": this.model.get("quantity") - 1 }, {
            "success": function (product) {
                that.render();
            },
            "error": function (obj, response) {
                console.log(response.responseText)
            }
        });
    }
});
