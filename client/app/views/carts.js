var View            = require("./view"),
    Cart            = require("../models/cart"),
    Carts           = require("../models/carts"),
    Recipes         = require("../models/recipes"),
    CartView        = require("./cart"),
    template        = require("./templates/carts"),
    templateRecipes = require("./templates/carts-recipes");

module.exports = View.extend({
    "collection": Carts,
    
    "template": template,
    "templateRecipes": templateRecipes,

    "initialize": function (params) {
        this.allRecipes = params.recipes;
        this.recipes    = new Recipes();
    },

    "getRenderData": function () {
        return { "recipes": this.recipes.models }
    },

    "R": 200,
    "RDecrement": 25,
    "RTotal": 50,

    "drawMarks": function (R, total) {
        var out = this.r.set(),
            marksAttr = { "fill": "#aaa", "stroke": "none"};

        for (var value = 0; value < total; value++) {
            var alpha = 360 / total * value,
                    a = (90 - alpha) * Math.PI / 180,
                    x = 300 + R * Math.cos(a),
                    y = 300 - R * Math.sin(a);
            out.push(this.r.circle(x, y, 1).attr(marksAttr));
        }
        return out;
    },

    "render": function () {
        var data = this.getRenderData(),
            R = this.R;

        this.$el.html(this.template(data));
        this.collection.each(function (cart){
            this.add(cart);
        }, this);

        this.r = Raphael("holder", 600, 600);
        this.r.customAttributes.arc = function (value, total, R, name) {
            var alpha = 360 / total * value,
                a = (90 - alpha) * Math.PI / 180,
                x = 300 + R * Math.cos(a),
                y = 300 - R * Math.sin(a),
                color = "hsb(".concat(Math.round(R) / 200, ",", 
                             value / total, ", .75)"),
                path;
            if (total == value) {
                path = [["M", 300, 300 - R], 
                        ["A", R, R, 0, 1, 1, 299.99, 300 - R]]; 
            } else {
                path = [["M", 300, 300 - R], 
                        ["A", R, R, 0, +(alpha > 180), 1, x, y]];
            }
            return { "path": path, "stroke": color, "title": name };
        };

        for (var i = 0; i < 6; i++) {
            this.drawMarks(R, this.RTotal);
            R -= this.RDecrement;
        }
        this.updateRender(data);
    },

    "updateValue": function (value, R, total, name) {
        var hand,
            param = { "stroke": "#fff", "stroke-width": 20 };
        name += " : " + value + " repas.";
        hand = this.r.path().attr(param).attr({ "arc": [0, total, R, name] });
        hand.animate({ "arc": [value, total, R, name] }, 750, "elastic");
    },

    "updateRender": function (data) {
        var data  = data || this.getRenderData(),
            total = this.RTotal,
            R     = this.R,
            recipe,
            tag,
            tags,
            i,
            j,
            byTag = { "organic": 0, "cheap": 0, "quick": 0, "light": 0 };

        // TODO : check already checked recipes
        this.$el.find(".carts-recipes").html(this.templateRecipes(data));

        for (i = 0; i < this.allRecipes.models.length; i++) {
            recipe = this.allRecipes.models[i];
            tags   = recipe.get("tags");
            for (j = 0; j < tags.length; j++) {
                tag = tags[j];
                if (recipe.get("cooked")) {
                    byTag[tag.id] += recipe.get("cooked");
                }
            }
        }

        this.updateValue(byTag["organic"], R, total, "bio");
        R -= this.RDecrement;
        this.updateValue(byTag["cheap"], R, total, "pas cher");
        R -= this.RDecrement;
        this.updateValue(byTag["quick"], R, total, "rapide");
        R -= this.RDecrement;
        this.updateValue(byTag["light"], R, total, "light");
        R -= this.RDecrement;
        this.updateValue(47, R, total, "???");
        R -= this.RDecrement;
        this.updateValue(12, R, total, "???");
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
                    recipe.save({ "toCook": recipe.get("toCook") + 1 });
                });
                that.add(cart);
            }
        });
    },

});
