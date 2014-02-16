var View           = require("./view"),
    Receipt        = require("../models/receipt"),
    template       = require("./templates/receipt"),
    templateDetail = require("./templates/receipt-detail");

module.exports = View.extend({
    "tagName": "li",
    "className": "row receipt",
    "template": template,
    "templateDetail": templateDetail,

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
        "click": "details"
    },

    "details": function () {
        var that = this;
        if (that.$el.find(".details").length) {
            that.$el.find(".details").remove();
        } else {
            this.model.fetch({ 
                "success": function (detailed) {
                    var $ul = $("<ul class='details' />"),
                        $li,
                        detail,
                        details,
                        i;
                    that.$el.append($ul);
                    details = detailed.get("details");
                    for (i = 0; i < details.length; i++) {
                        detail = details[i];
                        if (!detail.label) {
                            detail.label = "";
                        }
                        $ul.append(that.templateDetail(details[i]));
                    }
                }
            });
        }
    },

    "validate": function () {
        console.log("validate")
        return false;
    }
});

