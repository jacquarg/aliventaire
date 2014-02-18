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
    }
});
