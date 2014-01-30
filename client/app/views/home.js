var View         = require("./view"),
    Product      = require("../models/product"),
    Products     = require("../models/products"),
    ProductsView = require("./products"),
    Recipe       = require("../models/recipe"),
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
        "click .menu .cook": "goCook",
        "click .menu .recipe": "goRecipe",
    },

    "afterRender": function () {
        this.products = new Products([ 
            { "name": "Pate sablee", "number": 1, "price": 0.96 },
            { "name": "Boite de 6 oeufs", "number": 1, "price": 1.49 },
            { "name": "Fleur de mais", "number": 1, "price": 1.97 },
            { "name": "Citron jaune 500g", "number": 1, "price": 3.40 },
            { "name": "Pates 500g", "number": 4, "price": 1.46 },
            { "name": "Riz 400g", "number": 0, "price": 2.04 },
        ]);
        this.recipes = new Recipes([ 
            { "name": "Tarte au citron", "description": "Mélanger pendant quelques minutes les jaunes et les oeufs entiers avec le sucre et la Fleur de Maïs Maïzena. Sans cesser de fouetter, ajouter la crème, le jus et les zestes de citron.\nVerser la préparation sur le fond de tarte, et enfourner 35 à 40 minutes.\nDéguster bien frais.",
              "products": [ "Pate sablee", 
                            "Boite de 6 oeufs", 
                            "Fleur de mais",
                            "Citron jaune 500g" ] },
        ]);
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
