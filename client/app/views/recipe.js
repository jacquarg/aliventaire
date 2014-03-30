var View     = require("./view"),
    Recipe   = require("../models/recipe"),
    template = require("./templates/recipe");

module.exports = View.extend({
    "tagName": "li",
    "className": "row recipe well",
    "template": template,

    "model": Recipe,

    "getRenderData": function () { 
        var attributes = $.extend(true, {}, this.model.attributes),
            i,
            tag,
            tagName;
        if (!attributes.image) {
            attributes.image = "images/recipe.png";
        }
        if (attributes.description) {
            attributes.description = 
                attributes.description.replace(/[\r\n]+/g, "<br>");
        }
        if (attributes.tags) {
            for (i = 0; i < attributes.tags.length; i++) {
                tag = attributes.tags[i];
                tagName = tag["id"];
                tagName = tagName.replace("cheap", "pas cher");
                tagName = tagName.replace("quick", "rapide");
                tagName = tagName.replace("organic", "bio");
                tagName = tagName.replace("light", "light");
                tagName = tagName.replace("vegetarian", "végétarien");
                tagName = tagName.replace("sugar", "sucré");
                tag["id"] = tagName;
            }
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

