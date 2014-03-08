var Collection = require("./collection"),
    Product    = require("./product");

module.exports = Collection.extend({
    "model": Product,
    "url": "products",

    "addProduct": function (product) {
        var iUrl = Product.prototype.urlImageRoot,
            iExt = Product.prototype.urlImageExt,
            product;

        product = new Product ({
            "name": product.label,
            "quantity": product.amount,
            "price": product.price,
            "image": iUrl + Product.prototype.iBarCode(product.barcode) + iExt
        });
        if ($.trim(product.get("name").toLowerCase()) !== "nr") {
            product.save();
        }
    },

    "updateProduct": function (data, detail) {
        var product = new Product(data);
        if (detail.amount) {
            product.set("quantity", product.get("quantity") + detail.amount);
            if (detail.price) {
                product.set("price", detail.price / detail.amount);
            }
        }
        product.save();
    },

    "updateProducts": function (details, callback, update) {
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
                        update.apply(this, [data, detail])
                        that.updateProducts(details.slice(1), callback, update);
                    }
                });
            }
        } else {
            callback.call();
        }
    },

    "addProducts": function (details, callback) {
        var that = this;
        this.updateProducts(details, callback, function (data, detail) {
            if (data.length === 0) {
                that.addProduct(detail);
            } else {
                that.updateProduct(data[0], detail);
            }
        });
    },

    "removeProducts": function (details, callback) {
        var that = this;
        this.updateProducts(details, callback, function (data, detail) {
            if (data.length > 0) {
                that.updateProduct(data[0], detail);
            }
        });
    }

});
