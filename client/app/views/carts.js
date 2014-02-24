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
        this.recipes = params.recipes;
    },

    "getRenderData": function () {
        return { "recipes": this.recipes.models }
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
        "click .tag": "selectTag",
        "submit .price": "selectPrice",
    },

    "query": function () {
        var that = this;
        
        this.recipes.fetch({ 
            "data": { "tags": this.tags,
                      "price": this.price },
            "success": function (data) {
                that.updateRender();
            }
        });
    },

    "selectTag": function (evt) {
        var $elem = $(evt.currentTarget),
            selected,
            that = this;
        $(".selected").removeClass("selected");
        $elem.addClass("selected");
        selected  = $(".tag.selected img");
        this.tags = [];
        selected.each(function () {
            var tag = $(this).attr("class");
            that.tags.push(tag);
        });
        this.query();
    },

    "selectPrice": function () {
        this.price = $("#cart-price").val();
        this.query();

        return false;
    },

    "findRecipe": function (recipeName) {
        return _(this.recipes.models).find(function (recipe) { 
            return $.trim(recipe.get("name")) == $.trim(recipeName);
        });
    },

    "checkedProducts": {},

    "addProductsToCart": function (products) {
        // TODO: quantity of products and same product in diff recipe
        _(products).each(function (product) {
            var productContainer = $("<div class='product' />");
            productContainer.html(product.name);
            this.checkedProducts[product.name] = productContainer;
            $("#shop .products").append(productContainer);
        }, this);
    },

    "removeProductsFromCart": function (products) {
        _(products).each(function (product) {
            $(this.checkedProducts[product.name]).remove();
            delete this.checkedProducts[product.name];
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
            recipesNames.push($(elem).text());
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
    },

});
