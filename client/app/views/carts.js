var View            = require("./view"),
    Cart            = require("../models/cart"),
    Carts           = require("../models/carts"),
    Recipes         = require("../models/recipes"),
    CartView        = require("./cart"),
    template        = require("./templates/carts"),
    templateRecipes = require("./templates/carts-recipes");
    templateProduct = require("./templates/product-to-buy");

module.exports = View.extend({
    "collection": Carts,
    
    "template": template,
    "templateRecipes": templateRecipes,
    "templateProduct": templateProduct,

    "initialize": function (params) {
        this.allRecipes = params.recipes;
        this.tags       = [];
        this.recipes    = new Recipes();
        this.selectPrice();
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
                             value / total, ", .85)"),
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

    "redrawChart": function () {
        var total,
            R = this.R,
            recipe,
            tag,
            tags,
            i,
            j,
            byTag = { "organic": 0, 
                      "cheap": 0, 
                      "quick": 0, 
                      "light": 0,
                      "vegetarian": 0,
                      "sugar": 0 };

        total = 6;
        for (i = 0; i < this.allRecipes.models.length; i++) {
            recipe = this.allRecipes.models[i];
            tags   = recipe.get("tags");
            for (j = 0; j < tags.length; j++) {
                tag = tags[j];
                if (recipe.get("cooked")) {
                    byTag[tag.id] += recipe.get("cooked");
                    total += recipe.get("cooked");
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
        this.updateValue(byTag["vegetarian"], R, total, "végétarien");
        R -= this.RDecrement;
        this.updateValue(byTag["sugar"], R, total, "sucré");
    },

    "updateRender": function (data) {
        var that = this,
            i;
        $(".checked").removeClass("checked");
        this.checkedProducts = {};
        if (!data) {
            $(".selected").removeClass("selected");
            this.allRecipes.fetch({ 
                "success": function (data) {
                    that.updateRender(that.getRenderData());
                }
            });
        } else {
            this.$el.find(".carts-recipes").html(this.templateRecipes(data));
            this.redrawChart(data);
        }
    },

    "add": function (cart) {
        var cartView = new CartView({ "model": cart });
        this.$el.find("ul.carts").prepend(cartView.el)
    },

    "events": {
        "click .recipe": "updateCart",
        "click .product-to-buy": "updateProduct",
        "click .order": "order",
        "click .tag": "selectTag",
        "submit .price": "selectPrice",
    },

    "updateProduct": function (evt) {
        var $number = $(evt.currentTarget).find(".quantity"),
            currentNumber;
        currentNumber = parseInt($.trim($number.text()));
        if ($(evt.target).hasClass("glyphicon-minus")) {
            currentNumber--;
            if (currentNumber < 0) {
                currentNumber = 0;
            }
        } else {
            currentNumber++;
        }
        $number.text(currentNumber);
    },

    "query": function () {
        var that = this;

        this.recipes.fetch({ 
            "data": { "tags": this.tags,
                      "price": this.price },
            "success": function (data) {
                that.updateRender(that.getRenderData());
            }
        });
    },

    "selectTag": function (evt) {
        var $elem = $(evt.currentTarget),
            selected,
            that = this;
        $elem.toggleClass("selected");
        selected  = $(".tag.selected img");
        that.tags = [];
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
            return recipe.get("name").replace(/ /g, "") == 
                recipeName.replace(/ /g, "");
        });
    },

    "checkedProducts": {},

    "addProductsToCart": function (recipe, products, recipeNumber) {
        // TODO: quantity of products and same product in diff recipe
        this.removeProductsFromCart(recipe);
        if (!this.checkedProducts.recipe) {
            this.checkedProducts[recipe] = {};
        }
        _(products).each(function (product) {
            var productContainer,
                quantity = product.quantity;
            if (quantity < recipeNumber) {
                productContainer = $(this.templateProduct({ 
                    "name": product.name, 
                    "recipe": recipe.replace(/ /g, ""),
                    "quantity": recipeNumber - quantity 
                }));
                this.checkedProducts[recipe][product.name] = productContainer;
                $("#shop .products").prepend(productContainer);
            }
        }, this);
    },

    "removeProductsFromCart": function (recipe) {
        delete this.checkedProducts[recipe];
        $(".product-to-buy." + recipe.replace(/ /g, "")).remove();
    },

    "updateCart": function (evt) {
        var $target     = $(evt.currentTarget),
            $button     = $target.find(".btn"),
            recipeName  = $target.find(".name").text(),
            recipe,
            products,
            currentNumber,
            $number;

        recipe   = this.findRecipe(recipeName);
        products = recipe.get("products");

        $number = $target.find(".to-cook");
        currentNumber = parseInt($.trim($number.text()));
        if ($(evt.target).hasClass("glyphicon-minus")) {
            currentNumber--;
            if (currentNumber < 0) {
                currentNumber = 0;
                $target.removeClass("checked");
            }
        } else {
            currentNumber++;
            $target.addClass("checked");
        }
        $number.text(currentNumber);

        recipeName = $.trim(recipeName);
        if ($target.hasClass("checked")) {
            this.addProductsToCart(recipeName, products, currentNumber);
        } else {
            this.removeProductsFromCart(recipeName);
        }
    },

    "order": function (evt) {
        var that         = this,
            recipesNames = [],
            recipeName,
            cart,
            products = [],
            productsNames,
            productName,
            productQuantity,
            i, j;

        recipesNames = Object.keys(this.checkedProducts);
        for (i = 0; i < recipesNames.length; i++) {
            recipeName    = recipesNames[i];
            productsNames = Object.keys(this.checkedProducts[recipeName]);
            for (j = 0; j < productsNames.length; j++) {
                productName = productsNames[j];
                productQuantity = 
                    this.checkedProducts[recipeName][productName]
                        .find(".quantity")
                        .text();
                if (parseInt(productQuantity) > 0) {
                    if (parseInt(productQuantity) > 1) {
                        productName = 
                            $.trim(productQuantity) + " x " + productName;
                    }
                    products.push(productName);
                }
            }
        }

        cart = new Cart ({
            "name": recipesNames.join(", "),
             "products": products
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
