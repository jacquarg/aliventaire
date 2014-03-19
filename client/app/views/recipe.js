var View     = require("./view"),
    Recipe   = require("../models/recipe"),
    template = require("./templates/recipe");

module.exports = View.extend({
    "tagName": "li",
    "className": "row recipe",
    "template": template,

    "model": Recipe,

    "getRenderData": function () { 
        var attributes = this.model.attributes;
        if (!attributes.image) {
            attributes.image = "images/recipe.png";
        }
        if (attributes.description) {
            attributes.description = 
                attributes.description.replace(/[\r\n]+/g, "<br>");
        }
        return attributes;
    },

    "initialize": function () {
        this.render();
    },

    "events": {
        "click .delete": "destroy",
    },

    "destroy": function () {
        var that = this,
            $recipesProducts = $("#recipe-products"),
            $recipesTags = $("#recipe-tags");

        $("#recipe-image")
            .val(that.$el.find(".image img").attr("src"));
        $("#recipe-name").val(that.$el.find(".name").text());
        $("#recipe-description")
            .val(that.$el.find(".description")
                    .html()
                    .replace(/<br>/gi, "\n"));

        $recipesProducts.find("options:selected").prop("selected", false);
        that.$el.find(".recipe-products li").each(function () {
            $recipesProducts.find("option[value='" + $(this).text() + "']")
                .prop("selected", true);
        });
        that.$el.find(".recipe-tags span").each(function () {
            $recipesTags.find("option[value='" + $.trim($(this).text()) + "']")
                .prop("selected", true);
        });
        $(".select-picker").selectpicker("refresh");

        that.model.destroy({
            "success": function () {
                that.remove();
            }
        });
    }
});

