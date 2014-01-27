var View     = require('./view'),
    template = require('./templates/home');

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

    "goPage": function (pageName) {
        $("#content").removeClass();
        $("#content").addClass(pageName);
    },

    "goShop": function () {
        this.goPage("shop");

        return false;
    },

    "goFridge": function () {
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
