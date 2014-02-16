var View         = require("./view"),
    Carts        = require("../models/carts"),
    CartsView    = require("./carts"),
    Products     = require("../models/products"),
    ProductsView = require("./products"),
    Receipts     = require("../models/receipts"),
    ToCook       = require("../models/to_cook"),
    KitchenView  = require("./kitchen"),
    Recipes      = require("../models/recipes"),
    RecipesView  = require("./recipes"),
    template     = require("./templates/home");

module.exports = View.extend({
    "id": "home-view",
    "template": template,

    "events": {
        "click .menu": "goMenu",
        "click .menu .shop": "goShop",
        "click .menu .fridge": "goFridge",
        "click .menu .kitchen": "goKitchen",
        "click .menu .recipes": "goRecipes",
    },

    "afterRender": function () {
        this.carts = new Carts();
        this.carts.fetch({
            "error": function (obj, response) {
                console.log(response.responseText)
            }
        });

        this.products = new Products();
        this.products.fetch({
            "error": function (obj, response) {
                console.log(response.responseText)
            }
        });

        this.recipes = new Recipes();
        this.recipes.fetch({
            "error": function (obj, response) {
                console.log(response.responseText)
            }
        });

        this.toCook = new ToCook();
        this.toCook.fetch({
            "error": function (obj, response) {
                console.log(response.responseText)
            }
        });

        this.receipts = new Receipts();
        this.receipts.fetch({
            "error": function (obj, response) {
                console.log(response.responseText)
            }
        });
    },

    "swipers": {},

    "goPage": function (pageName) {
        var that = this, 
            pageClass = "." + pageName;

        $("#content").removeClass();
        $("#content").addClass(pageName);

        if (!that.swipers[pageName] && pageName !== "menu") {
            that.swipers[pageName] = $(".swiper-container:visible").swiper({
                "loop": false,
                "grabCursor": true,
                "pagination": pageClass + "> .pagination",
                "paginationClickable": true,
                "keyboardControl": true,
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
        if (!this.cartsView) {
            this.cartsView = new CartsView({ 
                "el": $("#shop")[0],
                "collection": this.carts,
                "recipes": this.recipes
            });
            this.cartsView.render();
        } else {
            this.cartsView.updateRender();
        }
        this.goPage("shop");

        return false;
    },

    "goFridge": function () {
        if (!this.productsView) {
            this.productsView = new ProductsView({ 
                "el": $("#fridge")[0],
                "collection": this.products
            });
        }
        this.productsView.render();
        this.goPage("fridge");

        return false;
    },

    "goKitchen": function () {
        if (!this.kitchenView) {
            this.kitchenView = new KitchenView({ 
                "el": $("#kitchen")[0],
                "receipts": this.receipts,
                "toCook": this.toCook
            });
            this.kitchenView.render();
        } else {
            this.kitchenView.updateRender(this.swipers["kitchen"]);
        }
        this.goPage("kitchen");

        return false;
    },

    "goRecipes": function () {
        if (!this.recipesView) {
            this.recipesView = new RecipesView({ 
                "el": $("#recipes")[0],
                "collection": this.recipes,
                "products": this.products
            });
        }
        this.recipesView.render();
        this.goPage("recipes");

        return false;
    },

    "goMenu": function () {
        this.goPage("menu");

        return false;
    }

});
