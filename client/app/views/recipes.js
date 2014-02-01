var View       = require("./view"),
    Recipe     = require("../models/recipe"),
    Recipes    = require("../models/recipes"),
    RecipeView = require("./recipe"),
    template   = require("./templates/recipes");

module.exports = View.extend({
    "collection": Recipes,
    
    "template": template,

    "initialize": function (params) {
        this.products = params.products.models;
    },

    "getRenderData": function () {
        return { "products": this.products };
    },

    "render": function () {
        this.$el.html(this.template(this.getRenderData()));
        this.collection.each(function (recipe){
            this.add(recipe);
        }, this);
    },

    "add": function (recipe) {
        var recipeView = new RecipeView({ "model": recipe });
        this.$el.find("ul.recipes").prepend(recipeView.el)
    },

    "events": {
        "submit form": "addRecipe",
    },

    "addRecipe": function (evt) {
        var $form = $(evt.target),
            recipe = new Recipe ({
                "name": $("#recipe-name").val(),
                "description": $("#recipe-description").val(),
                "products": $("#recipe-products").val()
            });

        this.collection.push(recipe);
        this.add(recipe);

        return false;
    },

});