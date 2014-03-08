var View           = require("./view"),
    Product        = require("../models/product"),
    Products       = require("../models/products"),
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
        "click": "displayDetails"
    },

    "displayDetails": function () {
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

    "validate": function (evt) {
        var that    = this,
            $target = $(evt.target);

        $target.removeClass("btn-info");
        $target.addClass("btn-warning");
        this.model.fetch({ 
            "success": function (detailed) {
                Products.prototype.addProducts(detailed.get("details"), 
                                               function () {
                    $target.removeClass("btn-warning");
                    $target.addClass("btn-success");
                });
            },
            "error": function (data) {
                $target.removeClass("btn-warning");
                $target.addClass("btn-error");
            }
        });
        return false;
    }
});
