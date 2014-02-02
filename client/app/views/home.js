var View         = require("./view"),
    Product      = require("../models/product"),
    Products     = require("../models/products"),
    ProductsView = require("./products"),
    Recipe       = require("../models/recipe"),
    Recipes      = require("../models/recipes"),
    RecipesView  = require("./recipes"),
    Cart         = require("../models/cart"),
    Carts        = require("../models/carts"),
    CartsView    = require("./carts"),
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


        this.carts = new Carts();
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
                "recipes": this.recipes,
            });
            this.cartsView.render();
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
