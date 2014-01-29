var View         = require("./view"),
    Product      = require("../models/product"),
    Products     = require("../models/products"),
    ProductsView = require("./products_view"),
    template     = require("./templates/home");

module.exports = View.extend({
    "id": "home-view",
    "template": template,

    "events": {
        "click .menu": "goMenu",
        "click .menu .shop": "goShop",
        "click .menu .fridge": "goFridge",
        "click .menu .cook": "goCook",
        "click .menu .recipe": "goRecipe",
    },

    "swipers": {},

    "goPage": function (pageName) {
        var that = this, 
            pageClass = "." + pageName;

        $("#content").removeClass();
        $("#content").addClass(pageName);

        if (!that.swipers[pageName]) {
            that.swipers[pageName] = $(".swiper-container:visible").swiper({
                "loop": false,
                "grabCursor": true,
                "pagination": pageClass + "> .pagination",
                "paginationClickable": true,
                "keyboardControl": true
            });
            $(pageClass + "> .navigation.left").on("click", function (evt) {
                evt.preventDefault()
                that.swipers[pageName].swipePrev()
            });
            $(pageClass + "> .navigation.right").on("click", function (evt) {
                evt.preventDefault()
                that.swipers[pageName].swipeNext()
            });
        }
    },

    "goShop": function () {
        this.goPage("shop");

        return false;
    },

    "goFridge": function () {
        this.products = new Products([ 
            { "name": "pates", "number": 4, "price": 0.59 },
            { "name": "riz", "number": 0, "price": 1.32 },
        ]);
        this.productsView = new ProductsView({ 
            "el": $("#fridge")[0],
            "collection": this.products
        });
        this.productsView.render();
        this.goPage("fridge");

        return false;
    },

    "goCook": function () {
        this.goPage("cook");

        return false;
    },

    "goRecipe": function () {
        this.goPage("recipe");

        return false;
    },

    "goMenu": function () {
        this.goPage("menu");

        return false;
    }

});
