var View     = require("./view"),
    Cart     = require("../models/cart"),
    template = require("./templates/cart");

module.exports = View.extend({
    "tagName": "li",
    "className": "cart col-xs-4",
    "template": template,

    "model": Cart,

    "getRenderData": function () { 
        var attributes = this.model.attributes;
        return attributes;
    },

    "initialize": function () {
        this.render();
    },

    "events": {
        "click .delete": "destroy",
    },

    "destroy": function () {
        var that = this;

        that.model.destroy({
            "success": function () {
                that.remove();
            }
        });
    },

});

