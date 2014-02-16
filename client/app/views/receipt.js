var View     = require("./view"),
    Receipt  = require("../models/receipt"),
    template = require("./templates/receipt");

module.exports = View.extend({
    "tagName": "li",
    "className": "row receipt",
    "template": template,

    "model": Receipt,

    "initialize": function () {
        this.render();
    },

    "getRenderData": function () { 
        var attributes = this.model.attributes;
        attributes.date = new Date(attributes.timestamp).toString("d/M/yyyy");
        return attributes;
    },

    "render": function () {
        this.$el.html(this.template(this.getRenderData()));
    },

    "events": {
        "click .validate": "validate",
    },

    "validate": function () {
        console.log("validate")
    }
});

