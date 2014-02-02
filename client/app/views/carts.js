var View     = require("./view"),
    Cart     = require("../models/cart"),
    Carts    = require("../models/carts"),
    CartView = require("./cart"),
    template = require("./templates/carts");

module.exports = View.extend({
    "collection": Carts,
    
    "template": template,

    "initialize": function (params) {
        this.recipes = params.recipes.models;
    },

    "getRenderData": function () {
        return { "recipes": this.recipes }
    },

    "render": function () {
        this.$el.html(this.template(this.getRenderData()));
    },

    "events": {
        "click .recipe": "updateCart",
        "click .order": "order",
    },

    "findRecipe": function (recipeName) {
        return _(this.recipes).find(function (recipe) { 
            return recipe.get("name") == recipeName;
        });
    },

    "updateCart": function (evt) {
        var $target    = $(evt.currentTarget),
            $button    = $target.find(".btn"),
            recipeName = $target.find(".name").html(),
            recipe,
            products;

        recipe   = this.findRecipe(recipeName);
        products = recipe.get("products");

        $button.toggleClass("glyphicon-unchecked");
        $button.toggleClass("glyphicon-check");

        if ($button.hasClass("glyphicon-check")) {
            _(products).each(function (product) {
                var productContainer = $("<div class='product' />");
                productContainer.html(product.id);
                $("#shop .products").append(productContainer);
            });
        } else {
            $("#shop .products .product").remove();
        }
    },

    "order": function (evt) {
        var checked      = $("#shop .recipe .glyphicon-check"),
            recipesNames = checked.parents(".recipe").find(".name");

        console.log(recipesNames)
        _(recipesNames).each(function (recipeName) {
            var recipe = this.findRecipe($(recipeName).html());
            recipe.save({ "toCook": true }, {
                "success": function () {
                    var info = $("<div class='alert alert-success'>");
                    info.html("Nouvelle recette à préparer ajoutée." +
                              "<button type='button' class='close' " + 
                              "data-dismiss='alert' aria-hidden='true'>" + 
                              "&times;</button>");
                    $(evt.target).after(info);
                    info.alert();
                }
            });
        }, this);
        console.log(recipesNames)
    }
});
