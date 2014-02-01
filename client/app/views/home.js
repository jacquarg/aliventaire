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
        "click .menu .cart": "goCart",
        "click .menu .fridge": "goFridge",
        "click .menu .cook": "goCook",
        "click .menu .recipe": "goRecipe",
    },

    "afterRender": function () {
        this.products = new Products();
        this.products.fetch({
            "error": function (obj, response) {
                console.log(response.responseText)
            }
        });

        this.recipes = new Recipes([ 
            { "name": "Tarte au citron", "description": "Mélanger pendant quelques minutes les jaunes et les oeufs entiers avec le sucre et la Fleur de Maïs Maïzena. Sans cesser de fouetter, ajouter la crème, le jus et les zestes de citron.\nVerser la préparation sur le fond de tarte, et enfourner 35 à 40 minutes.\nDéguster bien frais.",
              "products": [ "Pate sablee", 
                            "Boite de 6 oeufs", 
                            "Fleur de mais",
                            "Citron jaune 500g" ] },
        ]);

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

    "goCart": function () {
        if (!this.cartsView) {
            this.cartsView = new CartsView({ 
                "el": $("#cart")[0],
                "collection": this.carts,
                "recipes": this.recipes,
            });
            this.cartsView.render();
        }
        this.goPage("cart");

        return false;
    },

    "goFridge": function () {
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
        this.recipesView = new RecipesView({ 
            "el": $("#recipe")[0],
            "collection": this.recipes,
            "products": this.products
        });
        this.recipesView.render();
        this.goPage("recipe");

        return false;
    },

    "goMenu": function () {
        this.goPage("menu");

        return false;
    }

});
