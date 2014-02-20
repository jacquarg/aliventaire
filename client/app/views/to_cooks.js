var View       = require("./view"),
    Recipe     = require("../models/recipe"),
    ToCook     = require("../models/to_cook"),
    ToCookView = require("./to_cook"),
    template   = require("./templates/to_cooks");

module.exports = View.extend({
    "collection": ToCook,
    
    "template": template,

    "render": function () {
        var that = this;
        this.$el.html(this.template(this.getRenderData()));

        this.recipesList = this.$el.find("ul.recipes");
        this.collection.each(function (recipe){
            that.add(recipe);
        });
    },

    "updateRender": function (swiper) {
        var that = this,
            $recipes = this.recipesList;

        $recipes.html("");
        that.collection.fetch({
            "success": function (collection) {
                that.collection = collection;
                that.height = 0;
                collection.each(function (recipe){
                    that.add(recipe);
                });
                // TODO: see how to solve this :
                // idangerous doesnt update his heigth after dom change ...
                $recipes.height(that.height);
                $recipes.parents(".swiper-slide").height(that.height + 500);
                $recipes.parents(".swiper-wrapper").height(that.height + 500);
                swiper.resizeFix();
            }
        });
    },

    "add": function (recipe) {
        var recipeView = new ToCookView({ "model": recipe }),
            $recipes = this.recipesList;
        $recipes.prepend(recipeView.el);

        this.height = this.height + recipeView.$el.height();
    },
});
