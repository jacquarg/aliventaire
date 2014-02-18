var View           = require("./view"),
    Product        = require("../models/product"),
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

    "iBarCode": function (bar12) {
        var even,
            odd,
            checksum = "",
            i;

        if (bar12.lenght === 12) {
            even = 0 ;
            odd  = 0 ;

            for (i = 0; i < 6; i++) {
                even += parseInt(bar12[2 * i + 1]);
                odd  += parseInt(bar12[2 * i]);
            }
            checksum = 10 - (3 * even + odd) % 10 ;
        }

        return "0" + bar12 + checksum.toString() ;
    },

    "addProduct": function (product) {
        var iUrl = Product.prototype.urlImageRoot,
            iExt = Product.prototype.urlImageExt,
            product;

        product = new Product ({
            "name": product.label,
            "quantity": product.amount,
            "price": product.price,
            "image": iUrl + this.iBarCode(product.barcode) + iExt
        });
        if ($.trim(product.get("name").toLowerCase()) !== "nr") {
            product.save();
        }
    },

    "updateProduct": function (data, detail) {
        var product = new Product(data);
        product.set("quantity", product.get("quantity") + detail.amount);
        product.set("price", detail.price / detail.amount);
        product.save();
    },

    "updateProducts": function (details) {
        // TODO: add a field without special caracters different
        //       from the full name
        var that = this,
            label,
            detail;

        if (details.length) {
            detail = details[0];
            if (detail.label && detail.label) {
                label = Product.prototype.normalizeName(detail.label);
                $.ajax({
                    "dataType": "json",
                    "url": "products/name/" + label,
                    "success": function (data) {
                        if (data.length === 0) {
                            that.addProduct(detail);
                        } else {
                            that.updateProduct(data[0], detail);
                        }
                        that.updateProducts(details.slice(1));
                    }
                });
            }
        }
    },

    "validate": function () {
        var that = this;

        this.model.fetch({ 
            "success": function (detailed) {
                that.updateProducts(detailed.get("details"));
            }
        });
        return false;
    }
});
