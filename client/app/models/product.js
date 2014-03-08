var Model = require("./model");

module.exports = Model.extend({
    "urlRoot": "products",

    // TODO: allow different places
    "urlImageRoot": 
        "http://drive.intermarche.com/ressources/images/produit/zoom/",
    "noImageUrl": "images/product.png",
    "urlImageExt": ".jpg", 

    "normalizeName": function (name) {
        return name.replace(/[\/&?%= ]/g, "-");
    },

    "initialize": function (params) {
        if (!params.normalizedName) {
            this.set("normalizedName", this.normalizeName(params.name));
        }
        if (!params.image) {
            this.set("image", this.noImageUrl);
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
    }

});
