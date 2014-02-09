var View            = require("./view"),
    Cart            = require("../models/cart"),
    Carts           = require("../models/carts"),
    CartView        = require("./cart"),
    template        = require("./templates/carts"),
    templateRecipes = require("./templates/carts-recipes");

module.exports = View.extend({
    "collection": Carts,
    
    "template": template,
    "templateRecipes": templateRecipes,

    "initialize": function (params) {
        this.recipes = params.recipes.models;
    },

    "getRenderData": function () {
        return { "recipes": this.recipes }
    },

    "render": function () {
        var data = this.getRenderData();

        this.$el.html(this.template(data));
        this.collection.each(function (cart){
            this.add(cart);
        }, this);
        this.updateRender(data);
    },

    "updateRender": function (data) {
        var data = data || this.getRenderData();
        // TODO : check already checked recipes
        this.$el.find(".carts-recipes").html(this.templateRecipes(data));
    },

    "add": function (cart) {
        var cartView = new CartView({ "model": cart });
        this.$el.find("ul.carts").prepend(cartView.el)
    },

    "events": {
        "click .recipe": "updateCart",
        "click .order": "order",
    },

    "findRecipe": function (recipeName) {
        return _(this.recipes).find(function (recipe) { 
            return $.trim(recipe.get("name")) == $.trim(recipeName);
        });
    },

    "checkedProducts": {},

    "addProductsToCart": function (products) {
        // TODO: quantity of products and same product in diff recipe
        _(products).each(function (product) {
            var productContainer = $("<div class='product' />");
            productContainer.html(product.id);
            this.checkedProducts[product.id] = productContainer;
            $("#shop .products").append(productContainer);
        }, this);
    },

    "removeProductsFromCart": function (products) {
        _(products).each(function (product) {
            $(this.checkedProducts[product.id]).remove();
            delete this.checkedProducts[product.id];
        }, this);
    },

    "updateCart": function (evt) {
        var $target    = $(evt.currentTarget),
            $button    = $target.find(".btn"),
            recipeName = $target.find(".name").text(),
            recipe,
            products;

        recipe   = this.findRecipe(recipeName);
        products = recipe.get("products");

        $button.toggleClass("glyphicon-unchecked");
        $button.toggleClass("glyphicon-check");

        if ($button.hasClass("glyphicon-check")) {
            this.addProductsToCart(products);
        } else {
            this.removeProductsFromCart(products);
        }
    },

    "order": function (evt) {
        var checked      = $("#shop .recipe .glyphicon-check"),
            that         = this,
            recipesNames = [],
            cart;

        checked.parents(".recipe").find(".name").each(function (index, elem) {
            recipesNames.push($(elem).html());
        });
        cart = new Cart ({
            "name": "Commande : " + recipesNames.join(", "),
             "products": Object.keys(this.checkedProducts)
            // TODO: quantity of products and same product in diff recipe
        });

        that.collection.create(cart, {
            "success": function (cart) {
                _(recipesNames).each(function (recipeName) {
                    var recipe = that.findRecipe(recipeName);
                    recipe.save({ "toCook": true });
                });
                that.add(cart);
            }
        });
    }
});
