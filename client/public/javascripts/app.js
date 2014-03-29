(function(/*! Brunch !*/) {
  'use strict';

  var globals = typeof window !== 'undefined' ? window : global;
  if (typeof globals.require === 'function') return;

  var modules = {};
  var cache = {};

  var has = function(object, name) {
    return ({}).hasOwnProperty.call(object, name);
  };

  var expand = function(root, name) {
    var results = [], parts, part;
    if (/^\.\.?(\/|$)/.test(name)) {
      parts = [root, name].join('/').split('/');
    } else {
      parts = name.split('/');
    }
    for (var i = 0, length = parts.length; i < length; i++) {
      part = parts[i];
      if (part === '..') {
        results.pop();
      } else if (part !== '.' && part !== '') {
        results.push(part);
      }
    }
    return results.join('/');
  };

  var dirname = function(path) {
    return path.split('/').slice(0, -1).join('/');
  };

  var localRequire = function(path) {
    return function(name) {
      var dir = dirname(path);
      var absolute = expand(dir, name);
      return globals.require(absolute, path);
    };
  };

  var initModule = function(name, definition) {
    var module = {id: name, exports: {}};
    cache[name] = module;
    definition(module.exports, localRequire(name), module);
    return module.exports;
  };

  var require = function(name, loaderPath) {
    var path = expand(name, '.');
    if (loaderPath == null) loaderPath = '/';

    if (has(cache, path)) return cache[path].exports;
    if (has(modules, path)) return initModule(path, modules[path]);

    var dirIndex = expand(path, './index');
    if (has(cache, dirIndex)) return cache[dirIndex].exports;
    if (has(modules, dirIndex)) return initModule(dirIndex, modules[dirIndex]);

    throw new Error('Cannot find module "' + name + '" from '+ '"' + loaderPath + '"');
  };

  var define = function(bundle, fn) {
    if (typeof bundle === 'object') {
      for (var key in bundle) {
        if (has(bundle, key)) {
          modules[key] = bundle[key];
        }
      }
    } else {
      modules[bundle] = fn;
    }
  };

  var list = function() {
    var result = [];
    for (var item in modules) {
      if (has(modules, item)) {
        result.push(item);
      }
    }
    return result;
  };

  globals.require = require;
  globals.require.define = define;
  globals.require.register = define;
  globals.require.list = list;
  globals.require.brunch = true;
})();
require.register("application", function(exports, require, module) {
// Application bootstrapper.
var Application = {
    initialize: function () {
        var HomeView = require('views/home'), Router = require('lib/router');
        this.homeView = new HomeView();
        this.router = new Router();
        if (typeof Object.freeze === 'function') {
            Object.freeze(this);
        }
    }
};

module.exports = Application;

});

;require.register("initialize", function(exports, require, module) {
var application = require('application');

$(function () {
  application.initialize();
  Backbone.history.start();
});

});

;require.register("lib/router", function(exports, require, module) {
var application = require("application");

module.exports = Backbone.Router.extend({
    routes: {
        "": "home"
    },

    home: function () {
        $("body").html(application.homeView.render().el);
    }
});

});

;require.register("lib/view_helper", function(exports, require, module) {
// Put your handlebars.js helpers here.

});

;require.register("models/cart", function(exports, require, module) {
var Model = require("./model");

module.exports = Model.extend({
    "urlRoot": "carts"
});

});

;require.register("models/carts", function(exports, require, module) {
var Collection = require("./collection"),
    Cart       = require("./cart");

module.exports = Collection.extend({
    "model": Cart,
    "url": "carts"
});

});

;require.register("models/collection", function(exports, require, module) {
// Base class for all collections.
module.exports = Backbone.Collection.extend({
});

});

;require.register("models/model", function(exports, require, module) {
// Base class for all models.
module.exports = Backbone.Model.extend({
});

});

;require.register("models/product", function(exports, require, module) {
var Model = require("./model");

module.exports = Model.extend({
    "urlRoot": "products",

    // TODO: allow different places
    "urlImageRoot": 
        "http://drive.intermarche.com/ressources/images/produit/zoom/",
    "noImageUrl": "images/product.png",
    "urlImageExt": ".jpg", 

    "normalizeName": function (name) {
        return name.replace(/[\/&?%= ]/g, "-");
    },

    "initialize": function (params) {
        if (!params.normalizedName) {
            this.set("normalizedName", this.normalizeName(params.name));
        }
        if (!params.image) {
            this.set("image", this.noImageUrl);
        }
    },

    "iBarCode": function (bar12) {
        var even,
            odd,
            checksum = "",
            i;

        if (bar12.lenght === 12) {
            even = 0 ;
            odd  = 0 ;

            for (i = 0; i < 6; i++) {
                even += parseInt(bar12[2 * i + 1]);
                odd  += parseInt(bar12[2 * i]);
            }
            checksum = 10 - (3 * even + odd) % 10 ;
        }

        return "0" + bar12 + checksum.toString() ;
    }

});

});

;require.register("models/products", function(exports, require, module) {
var Collection = require("./collection"),
    Product    = require("./product");

module.exports = Collection.extend({
    "model": Product,
    "url": "products",

    "addProduct": function (product) {
        var iUrl = Product.prototype.urlImageRoot,
            iExt = Product.prototype.urlImageExt,
            product;

        product = new Product ({
            "name": product.label,
            "quantity": product.amount,
            "price": product.price,
            "image": iUrl + Product.prototype.iBarCode(product.barcode) + iExt
        });
        if ($.trim(product.get("name").toLowerCase()) !== "nr") {
            product.save();
        }
    },

    "updateProduct": function (data, detail) {
        var product = new Product(data);
        if (detail.amount) {
            product.set("quantity", product.get("quantity") + detail.amount);
            if (detail.price) {
                product.set("price", detail.price / detail.amount);
            }
        }
        product.save();
    },

    "updateProducts": function (details, callback, update) {
        // TODO: add a field without special caracters different
        //       from the full name
        var that = this,
            label,
            detail;

        if (details.length) {
            detail = details[0];
            if (detail.label && detail.label) {
                label = Product.prototype.normalizeName(detail.label);
                $.ajax({
                    "dataType": "json",
                    "url": "products/name/" + label,
                    "success": function (data) {
                        update.apply(this, [data, detail])
                        that.updateProducts(details.slice(1), callback, update);
                    }
                });
            }
        } else {
            callback.call();
        }
    },

    "addProducts": function (details, callback) {
        var that = this;
        this.updateProducts(details, callback, function (data, detail) {
            if (data.length === 0) {
                that.addProduct(detail);
            } else {
                that.updateProduct(data[0], detail);
            }
        });
    },

    "removeProducts": function (details, callback) {
        var that = this;
        this.updateProducts(details, callback, function (data, detail) {
            if (data.length > 0) {
                that.updateProduct(data[0], detail);
            }
        });
    }

});

});

;require.register("models/receipt", function(exports, require, module) {
var Model = require("./model");

module.exports = Model.extend({
    "urlRoot": "receipts"
});

});

;require.register("models/receipts", function(exports, require, module) {
var Collection = require("./collection"),
    Receipt    = require("./receipt");

module.exports = Collection.extend({
    "model": Receipt,
    "url": "receipts"
});

});

;require.register("models/recipe", function(exports, require, module) {
var Model = require("./model");

module.exports = Model.extend({
    "urlRoot": "recipes"
});

});

;require.register("models/recipes", function(exports, require, module) {
var Collection = require("./collection"),
    Recipe     = require("./recipe");

module.exports = Collection.extend({
    "model": Recipe,
    "url": "recipes"
});

});

;require.register("models/to_cook", function(exports, require, module) {
var Collection = require("./collection"),
    Recipe     = require("./recipe");

module.exports = Collection.extend({
    "model": Recipe,
    "url": "recipes/to-cook"
});

});

;require.register("views/cart", function(exports, require, module) {
var View     = require("./view"),
    Cart     = require("../models/cart"),
    template = require("./templates/cart");

module.exports = View.extend({
    "tagName": "li",
    "className": "cart col-xs-6",
    "template": template,

    "model": Cart,

    "getRenderData": function () { 
        var attributes = this.model.attributes;
        return attributes;
    },

    "initialize": function () {
        this.render();
    },

    "events": {
        "click .delete": "destroy",
    },

    "destroy": function () {
        var that = this;

        that.model.destroy({
            "success": function () {
                that.remove();
            }
        });
    },

});


});

;require.register("views/carts", function(exports, require, module) {
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

    "updateRender": function (data) {
        var data  = data || this.getRenderData(),
            total,
            R     = this.R,
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


        // TODO : check already checked recipes
        this.$el.find(".carts-recipes").html(this.templateRecipes(data));

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
        var checked      = $("#shop .recipe .glyphicon-check"),
            that         = this,
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

});

;require.register("views/home", function(exports, require, module) {
var View         = require("./view"),
    Carts        = require("../models/carts"),
    CartsView    = require("./carts"),
    Products     = require("../models/products"),
    ProductsView = require("./products"),
    Receipts     = require("../models/receipts"),
    ToCook       = require("../models/to_cook"),
    KitchenView  = require("./kitchen"),
    Recipes      = require("../models/recipes"),
    RecipesView  = require("./recipes"),
    template     = require("./templates/home");

module.exports = View.extend({
    "id": "home-view",
    "template": template,

    "events": {
        "click .menu": "goMenu",
        "click .menu .shop": "goShop",
        "click .menu .fridge": "goFridge",
        "click .menu .kitchen": "goKitchen",
        "click .menu .recipes": "goRecipes",
    },

    "afterRender": function () {
        this.carts = new Carts();
        this.carts.fetch({
            "error": function (obj, response) {
                console.log(response.responseText)
            }
        });

        this.products = new Products();
        this.products.fetch({
            "error": function (obj, response) {
                console.log(response.responseText)
            }
        });

        this.recipes = new Recipes();
        this.recipes.fetch({
            "error": function (obj, response) {
                console.log(response.responseText)
            }
        });

        this.toCook = new ToCook();
        this.toCook.fetch({
            "error": function (obj, response) {
                console.log(response.responseText)
            }
        });

        this.receipts = new Receipts();
        this.receipts.fetch({
            "error": function (obj, response) {
                console.log(response.responseText)
            }
        });
    },

    "swipers": {},

    "goPage": function (pageName) {
        var that = this, 
            pageClass = "." + pageName;

        $("#content").removeClass();
        $("#content").addClass(pageName);

        if (!that.swipers[pageName] && pageName !== "menu") {
            that.swipers[pageName] = $(".swiper-container:visible").swiper({
                "loop": false,
                "grabCursor": true,
                "pagination": pageClass + "> .pagination",
                "paginationClickable": true,
                "keyboardControl": true,
            });
            $(pageClass + "> .navigation.left").on("click", function (evt) {
                evt.preventDefault()
                that.swipers[pageName].swipePrev()
            });
            $(pageClass + "> .navigation.right").on("click", function (evt) {
                evt.preventDefault()
                that.swipers[pageName].swipeNext()
            });
        } 
        $(".tooltips").tooltip();
    },

    "goShop": function () {
        if (!this.cartsView) {
            this.cartsView = new CartsView({ 
                "el": $("#shop")[0],
                "collection": this.carts,
                "recipes": this.recipes
            });
            this.cartsView.render();
        } else {
            this.cartsView.updateRender();
        }
        this.goPage("shop");

        return false;
    },

    "goFridge": function () {
        var that = this;

        this.products.fetch({
            "success": function () {
                if (!that.productsView) {
                    that.productsView = new ProductsView({ 
                        "el": $("#fridge")[0],
                        "collection": that.products
                    });
                    that.productsView.render();
                }
                that.productsView.render();
                that.goPage("fridge");
            }
        });

        return false;
    },

    "goKitchen": function () {
        if (!this.kitchenView) {
            this.kitchenView = new KitchenView({ 
                "el": $("#kitchen")[0],
                "receipts": this.receipts,
                "toCook": this.toCook
            });
            this.kitchenView.render();
        } else {
            this.kitchenView.updateRender(this.swipers["kitchen"]);
        }
        this.goPage("kitchen");

        return false;
    },

    "goRecipes": function () {
        var that = this;

        this.products.fetch({
            "success": function () {
                if (!that.recipesView) {
                    that.recipesView = new RecipesView({ 
                        "el": $("#recipes")[0],
                        "collection": that.recipes,
                        "products": that.products
                    });
                }
                that.recipesView.render();
                that.goPage("recipes");
            }
        });

        return false;
    },

    "goMenu": function () {
        this.goPage("menu");

        return false;
    }

});

});

;require.register("views/kitchen", function(exports, require, module) {
var View         = require("./view"),
    Receipts     = require("../models/receipts"),
    ReceiptsView = require("./receipts"),
    ToCooksView  = require("./to_cooks"),
    template     = require("./templates/kitchen");

module.exports = View.extend({
    "id": "kitchen",
    "template": template,

    "initialize": function (params) {
        this.receipts = params.receipts;
        this.toCook   = params.toCook;

    },

    "render": function () {
        this.$el.html(this.template());

        this.receiptsView = new ReceiptsView({ 
            "el": $("#receipts")[0],
            "collection": this.receipts
        });
        this.receiptsView.render();

        this.toCooksView = new ToCooksView({ 
            "el": $("#recipes-to-cook")[0],
            "collection": this.toCook
        });
        this.toCooksView.render();
    },

    "updateRender": function (swiper) {
        this.receiptsView.updateRender();
        this.toCooksView.updateRender();
    },
});

});

;require.register("views/product", function(exports, require, module) {
var View     = require("./view"),
    Product  = require("../models/product"),
    template = require("./templates/product");

module.exports = View.extend({
    "tagName": "li",
    "className": "row product",
    "template": template,

    "model": Product,

    "getRenderData": function () { 
        var attributes = this.model.attributes;
        if (!attributes.image) {
            attributes.image = "images/product.png";
        }
        return attributes;
    },

    "initialize": function () {
        this.render();
    },

    "events": {
        "click .delete": "destroy",
        "click .plus": "plus",
        "click .minus": "minus",
    },

    "destroy": function () {
        var that = this;

        $("#product-image")
            .val(that.$el.find(".image img").attr("src"));
        $("#product-name").val(that.$el.find(".name").text());
        $("#product-quantity").val(that.$el.find(".quantity").text());
        $("#product-price").val(that.$el.find(".price").text());

        that.model.destroy({
            "success": function () {
                that.remove();
            }
        });
    },

    "plus": function () {
        var that = this;

        that.model.save({ "quantity": this.model.get("quantity") + 1 }, {
            "success": function (product) {
                that.render();
            },
            "error": function (obj, response) {
                console.log(response.responseText)
            }
        });
    },

    "minus": function () {
        var that = this;

        that.model.save({ "quantity": this.model.get("quantity") - 1 }, {
            "success": function (product) {
                that.render();
            },
            "error": function (obj, response) {
                console.log(response.responseText)
            }
        });
    }
});


});

;require.register("views/products", function(exports, require, module) {
var View        = require("./view"),
    Product     = require("../models/product"),
    Products    = require("../models/products"),
    ProductView = require("./product"),
    template    = require("./templates/products");

module.exports = View.extend({
    "collection": Products,
    
    "template": template,

    "render": function () {
        this.$el.html(this.template(this.getRenderData()));
        this.oldProducts = this.$el.find("ul.products.old");
        this.newProducts = this.$el.find("ul.products.new");
        this.collection.each(function (product){
            this.add(product, this.oldProducts);
        }, this);
        this.searchList = new List(this.$el.find(".products-list")[0], 
                                   { "valueNames": ["name", 
                                                    "price", 
                                                    "quantity"] });
    },

    "add": function (product, list) {
        var productView = new ProductView({ "model": product });
        if (!list) {
            list = this.newProducts;
        }
        list.prepend(productView.el);
    },

    "events": {
        "submit form": "addProduct",
        "click .old .delete": "removeFromList"
    },

    "addProduct": function (evt) {
        var $form = $(evt.target),
            price = $("#product-price").val() ? $("#product-price").val() : "0",
            product = new Product ({
                "name": $("#product-name").val(),
                "quantity": $("#product-quantity").val(),
                "price": price.replace(",", "."),
                "image": $("#product-image").val()
            }),
            that = this;

        this.collection.create(product, {
            "success": function (product) {
                that.add(product);
                $("#product-name").val("");
                $("#product-quantity").val("");
                $("#product-price").val("");
                $("#product-image").val("");
            }
        });

        return false;
    },

    "removeFromList": function (evt) {
        var productName = $(evt.target).parents("li").find(".name").text();
        this.searchList.remove("name", $.trim(productName));
    }
});

});

;require.register("views/receipt", function(exports, require, module) {
var View           = require("./view"),
    Product        = require("../models/product"),
    Products       = require("../models/products"),
    Receipt        = require("../models/receipt"),
    template       = require("./templates/receipt"),
    templateDetail = require("./templates/receipt-detail");

module.exports = View.extend({
    "tagName": "li",
    "className": "row receipt",
    "template": template,
    "templateDetail": templateDetail,

    "model": Receipt,

    "initialize": function () {
        this.render();
    },

    "getRenderData": function () { 
        var attributes = this.model.attributes;
        attributes.date = new Date(attributes.timestamp).toString("d/M/yyyy");
        return attributes;
    },

    "render": function () {
        this.$el.html(this.template(this.getRenderData()));
    },

    "events": {
        "click .validate": "validate",
        "click": "displayDetails"
    },

    "displayDetails": function () {
        var that = this;

        if (that.$el.find(".details").length) {
            that.$el.find(".details").remove();
        } else {
            this.model.fetch({ 
                "success": function (detailed) {
                    var $ul = $("<ul class='details' />"),
                        $li,
                        detail,
                        details,
                        i;
                    that.$el.append($ul);
                    details = detailed.get("details");
                    for (i = 0; i < details.length; i++) {
                        detail = details[i];
                        if (!detail.label) {
                            detail.label = "";
                        }
                        $ul.append(that.templateDetail(details[i]));
                    }
                }
            });
        }
    },

    "validate": function (evt) {
        var that    = this,
            $target = $(evt.target);

        $target.removeClass("btn-info");
        $target.addClass("btn-warning");
        this.model.fetch({ 
            "success": function (detailed) {
                Products.prototype.addProducts(detailed.get("details"), 
                                               function () {
                    $target.removeClass("btn-warning");
                    $target.addClass("btn-success");
                });
            },
            "error": function (data) {
                $target.removeClass("btn-warning");
                $target.addClass("btn-error");
            }
        });
        return false;
    }
});

});

;require.register("views/receipts", function(exports, require, module) {
var View        = require("./view"),
    Receipt     = require("../models/receipt"),
    Receipts    = require("../models/receipts"),
    ReceiptView = require("./receipt"),
    template    = require("./templates/receipts");

module.exports = View.extend({
    "collection": Receipts,
    
    "template": template,

    "render": function () {
        this.$el.html(this.template(this.getRenderData()));
        this.receiptsList = this.$el.find("ul.receipts");
        this.collection.each(function (receipt){
            this.add(receipt);
        }, this);
    },

    "updateRender": function (swiper) {
        console.log("this is a prototype, recepts list doesnt update")
    },

    "add": function (receipt) {
        var receiptView = new ReceiptView({ "model": receipt, 
                                            "products": this.products });
        this.receiptsList.prepend(receiptView.el);
    },
});

});

;require.register("views/recipe", function(exports, require, module) {
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


});

;require.register("views/recipes", function(exports, require, module) {
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
        this.$el.find(".select-picker").selectpicker({
            "title": "aucun produit",
            "noneResultsText": "aucun produit contenant"
        });
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
                "products": $("#recipe-products").val(),
                "tags": $("#recipe-tags").val(),
                "image": $("#recipe-image").val(),
                "toCook": false
            }),
            that = this;

        if (!recipe.get("image")) {
            recipe.image = "images/recipe.png";
        }
        that.collection.create(recipe, {
            "success": function (recipe) {
                that.add(recipe);
            }
        });

        return false;
    },

});

});

;require.register("views/templates/cart", function(exports, require, module) {
module.exports = function anonymous(locals, attrs, escape, rethrow, merge) {
attrs = attrs || jade.attrs; escape = escape || jade.escape; rethrow = rethrow || jade.rethrow; merge = merge || jade.merge;
var buf = [];
with (locals || {}) {
var interp;
buf.push('<span title="supprimer" class="delete"><button class="btn btn-danger glyphicon glyphicon-remove"></button></span><span class="name">Recettes : ' + escape((interp = name) == null ? '' : interp) + '</span><ul>');
// iterate products
;(function(){
  if ('number' == typeof products.length) {
    for (var $index = 0, $$l = products.length; $index < $$l; $index++) {
      var product = products[$index];

buf.push('<li class="product">+ ' + escape((interp = product.id) == null ? '' : interp) + ' </li>');
    }
  } else {
    for (var $index in products) {
      var product = products[$index];

buf.push('<li class="product">+ ' + escape((interp = product.id) == null ? '' : interp) + ' </li>');
   }
  }
}).call(this);

buf.push('</ul>');
}
return buf.join("");
};
});

;require.register("views/templates/carts-recipes", function(exports, require, module) {
module.exports = function anonymous(locals, attrs, escape, rethrow, merge) {
attrs = attrs || jade.attrs; escape = escape || jade.escape; rethrow = rethrow || jade.rethrow; merge = merge || jade.merge;
var buf = [];
with (locals || {}) {
var interp;
// iterate recipes
;(function(){
  if ('number' == typeof recipes.length) {
    for (var $index = 0, $$l = recipes.length; $index < $$l; $index++) {
      var recipe = recipes[$index];

buf.push('<div');
buf.push(attrs({ "class": ('recipe') + ' ' + ('row') + ' ' + ("" + (recipe.attributes.name) + "") }, {"class":true}));
buf.push('><span class="name col-xs-8">' + escape((interp = recipe.attributes.name) == null ? '' : interp) + '</span><div class="btn col-xs-1 glyphicon glyphicon-minus"> </div><div class="btn col-xs-1 glyphicon glyphicon-plus"> </div><span class="col-xs-2 to-cook">0</span></div>');
    }
  } else {
    for (var $index in recipes) {
      var recipe = recipes[$index];

buf.push('<div');
buf.push(attrs({ "class": ('recipe') + ' ' + ('row') + ' ' + ("" + (recipe.attributes.name) + "") }, {"class":true}));
buf.push('><span class="name col-xs-8">' + escape((interp = recipe.attributes.name) == null ? '' : interp) + '</span><div class="btn col-xs-1 glyphicon glyphicon-minus"> </div><div class="btn col-xs-1 glyphicon glyphicon-plus"> </div><span class="col-xs-2 to-cook">0</span></div>');
   }
  }
}).call(this);

}
return buf.join("");
};
});

;require.register("views/templates/carts", function(exports, require, module) {
module.exports = function anonymous(locals, attrs, escape, rethrow, merge) {
attrs = attrs || jade.attrs; escape = escape || jade.escape; rethrow = rethrow || jade.rethrow; merge = merge || jade.merge;
var buf = [];
with (locals || {}) {
var interp;
buf.push('<div class="navigation left"></div><div class="swiper-container"><div class="swiper-wrapper"><div class="swiper-slide"> <h2>Informations de consommation</h2><div class="history"><div id="holder"></div></div></div><div class="swiper-slide"> <h2>Choix des catégories</h2><div class="tags"><div class="row"><div class="col-xs-offset-4 col-xs-2"><span class="tag"><img alt="pas cher" class="cheap"/></span></div><div class="col-xs-2"><span class="tag"><img alt="rapide" class="quick"/></span></div></div><div class="row"><div class="col-xs-offset-4 col-xs-2"><span class="tag"><img alt="bio" class="organic"/></span></div><div class="col-xs-2"><span class="tag"><img alt="light" class="light"/></span></div></div><div class="row"><div class="col-xs-offset-4 col-xs-2"><span class="tag"><img alt="végétarien" class="vegetarian"/></span></div><div class="col-xs-2"><span class="tag"><img alt="sucré" class="sugar"/></span></div></div></div><h2>Choix du prix</h2><form class="price row"><div class="form-group col-xs-offset-4 col-xs-4"><input id="cart-price" placeholder="Prix" required="required" value="10" name="price" class="form-control"/></div></form></div><div class="swiper-slide carts"><div class="row"><div class="choose-recipe col-xs-6"><h2>Choix de la recette</h2><div class="carts-recipes"></div></div><div class="choose-products col-xs-6"><h2>Panier</h2><div class="products"></div></div></div><hr/><div class="btn btn-primary order">Créer une liste de courses</div><hr/><h2>Listes de courses</h2><ul class="carts row"></ul></div></div></div><div class="navigation right"></div>');
}
return buf.join("");
};
});

;require.register("views/templates/home", function(exports, require, module) {
module.exports = function anonymous(locals, attrs, escape, rethrow, merge) {
attrs = attrs || jade.attrs; escape = escape || jade.escape; rethrow = rethrow || jade.rethrow; merge = merge || jade.merge;
var buf = [];
with (locals || {}) {
var interp;
buf.push('<div id="content" class="menu"><div class="header"><div class="menu"><a class="menu"><img src="images/title.png" alt="aliventaire" title="Aliventaire"/></a></div><div class="shop"><a href="/" class="menu"><img src="images/shop.png" alt="shop" title="Retour au menu" class="menu"/></a><h1>Mes courses</h1><div class="pagination"></div></div><div class="fridge"><a href="/" class="menu"><img src="images/fridge.png" alt="fridge" title="Retour au menu" class="menu"/></a><h1>Mon placard</h1><div class="pagination"></div></div><div class="kitchen"><a href="/" class="menu"><img src="images/kitchen.png" alt="kitchen" title="Retour au menu" class="menu"/></a><h1>Ma cuisine</h1><div class="pagination"></div></div><div class="recipes"><a href="/" class="menu"><img src="images/recipes.png" alt="recipes" title="Retour au menu" class="menu"/></a><h1>Mes recettes</h1><div class="pagination"></div></div></div><div class="page"><div class="menu"><div class="row"><a href="/" class="shop"><img src="images/shop.png" alt="shop" title="Mes courses" class="shop"/></a><a href="/" class="fridge"><img src="images/fridge.png" alt="fridge" title="Mon placard" class="fridge"/></a></div><div class="row"><a href="/" class="kitchen"><img src="images/kitchen.png" alt="kitchen" title="Ma cuisine" class="kitchen"/></a><a href="/" class="recipes"><img src="images/recipes.png" alt="recipes" title="Mes recettes" class="recipes"/></a></div></div><div id="shop" class="shop"></div><div id="fridge" class="fridge"></div><div id="kitchen" class="kitchen"></div><div id="recipes" class="recipes"></div></div></div>');
}
return buf.join("");
};
});

;require.register("views/templates/kitchen", function(exports, require, module) {
module.exports = function anonymous(locals, attrs, escape, rethrow, merge) {
attrs = attrs || jade.attrs; escape = escape || jade.escape; rethrow = rethrow || jade.rethrow; merge = merge || jade.merge;
var buf = [];
with (locals || {}) {
var interp;
buf.push('<div class="kitchen"><div class="navigation left"></div><div class="swiper-container"><div class="swiper-wrapper"><div class="swiper-slide"> <h2>Tickets de caisse</h2><h3>Validez les tickets de caisse pour mettre les produits dans le frigo !</h3><div id="receipts"></div></div><div class="swiper-slide"> <h2>Recette à cuisiner</h2><h3>Validez les recettes à cuisiner pour enlever les produits du frigo !</h3><div id="recipes-to-cook"></div></div></div></div><div class="navigation right"></div></div>');
}
return buf.join("");
};
});

;require.register("views/templates/product-to-buy", function(exports, require, module) {
module.exports = function anonymous(locals, attrs, escape, rethrow, merge) {
attrs = attrs || jade.attrs; escape = escape || jade.escape; rethrow = rethrow || jade.rethrow; merge = merge || jade.merge;
var buf = [];
with (locals || {}) {
var interp;
buf.push('<div');
buf.push(attrs({ "class": ('product-to-buy') + ' ' + ("" + (recipe) + "") }, {"class":true}));
buf.push('><span class="name col-xs-8">' + escape((interp = name) == null ? '' : interp) + '</span><div class="btn col-xs-1 glyphicon glyphicon-minus"> </div><div class="btn col-xs-1 glyphicon glyphicon-plus"> </div><span class="col-xs-2 quantity">' + escape((interp = quantity) == null ? '' : interp) + '</span></div>');
}
return buf.join("");
};
});

;require.register("views/templates/product", function(exports, require, module) {
module.exports = function anonymous(locals, attrs, escape, rethrow, merge) {
attrs = attrs || jade.attrs; escape = escape || jade.escape; rethrow = rethrow || jade.rethrow; merge = merge || jade.merge;
var buf = [];
with (locals || {}) {
var interp;
buf.push('<div title="supprimer et placer dans le formulaire d\'ajout" class="delete col-xs-1"><button class="btn btn-danger"><span class="glyphicon glyphicon-remove"></span></button></div><div class="image col-xs-1"><span class="img well"><img');
buf.push(attrs({ 'src':("" + (image) + ""), 'alt':("X"), 'title':("" + (name) + "") }, {"src":true,"alt":true,"title":true}));
buf.push('/></span></div><div class="name col-xs-5">' + escape((interp = name) == null ? '' : interp) + '</div><div class="price col-xs-2">' + escape((interp = price) == null ? '' : interp) + '</div><div class="quantity col-xs-3">' + escape((interp = quantity) == null ? '' : interp) + '<span class="actions"><button class="minus btn btn-default"><span class="glyphicon glyphicon-minus"></span></button><button class="plus btn btn-default"><span class="glyphicon glyphicon-plus"></span></button></span></div>');
}
return buf.join("");
};
});

;require.register("views/templates/products", function(exports, require, module) {
module.exports = function anonymous(locals, attrs, escape, rethrow, merge) {
attrs = attrs || jade.attrs; escape = escape || jade.escape; rethrow = rethrow || jade.rethrow; merge = merge || jade.merge;
var buf = [];
with (locals || {}) {
var interp;
buf.push('<form role="form" class="form-inline"><div class="row">Ajouter un produit<span data-toggle="tooltip" data-placement="bottom" title="Pour ajouter un produit, remplissez les champs ci-dessous et validez en cliquant sur l\'icone \'+\'. Il apparaîtra tout d\'abord sous le formulaire, et rejoindra les autres produits par la suite. Une fois ajouté, il sera disponible pour faire partie d\'une recette." class="tooltips"><span class="glyphicon glyphicon-question-sign"></span></span></div><div class="row"><div class="form-group col-xs-7"><input id="product-name" type="text" required="required" title="Veuillez entrer le nom du produit à ajouter" placeholder="Produit" class="form-control"/></div><div class="form-group col-xs-2"><input id="product-price" type="text" required="required" pattern="[0-9]+(.[0-9]+)?" title="Veuillez entrer le prix unitaire de ce produit (ex: 3.2)" placeholder="Prix unitaire" class="form-control"/></div><div class="form-group col-xs-2"><input id="product-quantity" type="text" pattern="[0-9]+" title="Veuillez entrer le nombre de produits de ce type que vous possédez" placeholder="Quantité" class="form-control"/></div><div class="col-xs-1"><button type="submit" title="ajouter" class="btn btn-default"><span class="glyphicon glyphicon-plus"></span></button></div></div><div class="row"><div class="form-group col-xs-11"><input id="product-image" type="text" title="Veuillez entrer l\'adresse de l\'image du produit si il y en a une (ex : http://monimage.fr/monimage.png)" placeholder="adresse de l\'image" class="form-control"/></div></div></form><div class="products-list"><ul class="products new"></ul><hr/><span>Les produits de mon frigo</span><span data-toggle="tooltip" data-placement="bottom" title="Ceci est la liste des produits de votre frigo, gérez les quantités avec les boutons \'+\' et \'-\', Pour éditer le nom ou le prix d\'un produit, supprimez le en cliquant sur la croix rouge qui apparait lorsque vous passez la souris dessus. Le produit est alors supprimé, mais ces informations sont placées dans le formulaire d\'ajout, il ne reste plus qu\'à les modifier et ajouter le produit de nouveau." class="tooltips"><span class="glyphicon glyphicon-question-sign"></span></span><hr/><div class="row"><div class="form-group col-xs-10 col-xs-offset-2"><input type="text" placeholder="filtrer" title="filtrer la liste des produit" class="search form-control"/></div></div><div class="row"><button title="trier par nom" data-sort="name" class="sort btn btn-default col-xs-5 col-xs-offset-2"><span class="glyphicon glyphicon-sort"></span>nom</button><button title="trier par prix" data-sort="price" class="sort btn btn-default col-xs-2"> <span class="glyphicon glyphicon-sort"></span>prix (€)</button><button title="trier par quantité" data-sort="quantity" class="sort btn btn-default col-xs-3"> <span class="glyphicon glyphicon-sort"></span>quantité</button></div><ul class="products old list"></ul></div>');
}
return buf.join("");
};
});

;require.register("views/templates/receipt-detail", function(exports, require, module) {
module.exports = function anonymous(locals, attrs, escape, rethrow, merge) {
attrs = attrs || jade.attrs; escape = escape || jade.escape; rethrow = rethrow || jade.rethrow; merge = merge || jade.merge;
var buf = [];
with (locals || {}) {
var interp;
buf.push('<li class="row"><span class="col-xs-1">' + escape((interp = amount) == null ? '' : interp) + '</span><span class="col-xs-8">' + escape((interp = label) == null ? '' : interp) + '</span><span class="col-xs-3">' + escape((interp = price) == null ? '' : interp) + '</span></li>');
}
return buf.join("");
};
});

;require.register("views/templates/receipt", function(exports, require, module) {
module.exports = function anonymous(locals, attrs, escape, rethrow, merge) {
attrs = attrs || jade.attrs; escape = escape || jade.escape; rethrow = rethrow || jade.rethrow; merge = merge || jade.merge;
var buf = [];
with (locals || {}) {
var interp;
buf.push('<div class="transaction col-xs-3">' + escape((interp = date) == null ? '' : interp) + '</div><div title="afficher le détail du ticket de caisse" class="receipt-id col-xs-3">' + escape((interp = receiptId) == null ? '' : interp) + '</div><div class="total col-xs-3">' + escape((interp = total) == null ? '' : interp) + '</div><div title="valider" class="validate col-xs-3"><button class="btn btn-info"><span class="glyphicon glyphicon-check"></span></button></div>');
}
return buf.join("");
};
});

;require.register("views/templates/receipts", function(exports, require, module) {
module.exports = function anonymous(locals, attrs, escape, rethrow, merge) {
attrs = attrs || jade.attrs; escape = escape || jade.escape; rethrow = rethrow || jade.rethrow; merge = merge || jade.merge;
var buf = [];
with (locals || {}) {
var interp;
buf.push('<ul class="receipts"></ul>');
}
return buf.join("");
};
});

;require.register("views/templates/recipe-to-cook", function(exports, require, module) {
module.exports = function anonymous(locals, attrs, escape, rethrow, merge) {
attrs = attrs || jade.attrs; escape = escape || jade.escape; rethrow = rethrow || jade.rethrow; merge = merge || jade.merge;
var buf = [];
with (locals || {}) {
var interp;
buf.push('<div class="image col-xs-3"> <img');
buf.push(attrs({ 'src':("" + (image) + ""), 'alt':("image"), 'title':("" + (name) + "") }, {"src":true,"alt":true,"title":true}));
buf.push('/></div><div class="col-xs-8"> <div class="name"> <span title="supprimer" class="delete"><button class="btn btn-danger"><span class="glyphicon glyphicon-remove"></span></button></span><span>' + escape((interp = name) == null ? '' : interp) + '</span></div><div class="recipe-tags"> ');
// iterate tags
;(function(){
  if ('number' == typeof tags.length) {
    for (var $index = 0, $$l = tags.length; $index < $$l; $index++) {
      var tag = tags[$index];

buf.push('<span class="tag">' + escape((interp = tag.id) == null ? '' : interp) + ' </span>');
    }
  } else {
    for (var $index in tags) {
      var tag = tags[$index];

buf.push('<span class="tag">' + escape((interp = tag.id) == null ? '' : interp) + ' </span>');
   }
  }
}).call(this);

buf.push('</div><div class="description">' + ((interp = description) == null ? '' : interp) + '</div><hr/></div><div class="recipe-products">Produits :<ul></ul>');
// iterate products
;(function(){
  if ('number' == typeof products.length) {
    for (var $index = 0, $$l = products.length; $index < $$l; $index++) {
      var product = products[$index];

buf.push('<li class="row"> <span class="name col-xs-8">' + escape((interp = product.name) == null ? '' : interp) + '</span><span class="quantity col-xs-2">' + escape((interp = product.quantity) == null ? '' : interp) + '</span><span class="actions col-xs-2"><button class="minus btn btn-default"><span class="glyphicon glyphicon-minus"></span></button><button class="plus btn btn-default"><span class="glyphicon glyphicon-plus"></span></button></span></li>');
    }
  } else {
    for (var $index in products) {
      var product = products[$index];

buf.push('<li class="row"> <span class="name col-xs-8">' + escape((interp = product.name) == null ? '' : interp) + '</span><span class="quantity col-xs-2">' + escape((interp = product.quantity) == null ? '' : interp) + '</span><span class="actions col-xs-2"><button class="minus btn btn-default"><span class="glyphicon glyphicon-minus"></span></button><button class="plus btn btn-default"><span class="glyphicon glyphicon-plus"></span></button></span></li>');
   }
  }
}).call(this);

buf.push('</div>');
}
return buf.join("");
};
});

;require.register("views/templates/recipe", function(exports, require, module) {
module.exports = function anonymous(locals, attrs, escape, rethrow, merge) {
attrs = attrs || jade.attrs; escape = escape || jade.escape; rethrow = rethrow || jade.rethrow; merge = merge || jade.merge;
var buf = [];
with (locals || {}) {
var interp;
buf.push('<div class="image col-xs-3"> <img');
buf.push(attrs({ 'src':("" + (image) + ""), 'alt':("image"), 'title':("" + (name) + "") }, {"src":true,"alt":true,"title":true}));
buf.push('/></div><div class="col-xs-8"> <div class="name"> <span title="supprimer" class="delete"><button class="btn btn-danger"><span class="glyphicon glyphicon-remove"></span></button></span><span>' + escape((interp = name) == null ? '' : interp) + '</span></div><div class="recipe-tags"> ');
// iterate tags
;(function(){
  if ('number' == typeof tags.length) {
    for (var $index = 0, $$l = tags.length; $index < $$l; $index++) {
      var tag = tags[$index];

buf.push('<span class="tag">' + escape((interp = tag.id) == null ? '' : interp) + ' </span>');
    }
  } else {
    for (var $index in tags) {
      var tag = tags[$index];

buf.push('<span class="tag">' + escape((interp = tag.id) == null ? '' : interp) + ' </span>');
   }
  }
}).call(this);

buf.push('</div><div class="description">' + ((interp = description) == null ? '' : interp) + '</div><hr/><div class="recipe-products">Produits :<ul>');
// iterate products
;(function(){
  if ('number' == typeof products.length) {
    for (var $index = 0, $$l = products.length; $index < $$l; $index++) {
      var product = products[$index];

buf.push('<li>' + escape((interp = product.name) == null ? '' : interp) + '</li>');
    }
  } else {
    for (var $index in products) {
      var product = products[$index];

buf.push('<li>' + escape((interp = product.name) == null ? '' : interp) + '</li>');
   }
  }
}).call(this);

buf.push('</ul></div></div>');
}
return buf.join("");
};
});

;require.register("views/templates/recipes", function(exports, require, module) {
module.exports = function anonymous(locals, attrs, escape, rethrow, merge) {
attrs = attrs || jade.attrs; escape = escape || jade.escape; rethrow = rethrow || jade.rethrow; merge = merge || jade.merge;
var buf = [];
with (locals || {}) {
var interp;
buf.push('<form role="form"><div class="form-group"><input id="recipe-name" type="text" required="required" placeholder="Nom de la recette" class="form-control"/></div><div class="form-group col-xs-6"><textarea id="recipe-description" type="text" placeholder="Description de la recette" class="form-control"></textarea></div><div class="form-group col-xs-6"><label for="recipe-products">Produits nécessaires :</label><select id="recipe-products" multiple="multiple" data-live-search="true" class="form-control select-picker">');
// iterate products
;(function(){
  if ('number' == typeof products.length) {
    for (var $index = 0, $$l = products.length; $index < $$l; $index++) {
      var product = products[$index];

buf.push('<option');
buf.push(attrs({ 'value':("" + (product.attributes.name) + "") }, {"value":true}));
buf.push('> \n' + escape((interp = product.attributes.name) == null ? '' : interp) + '</option>');
    }
  } else {
    for (var $index in products) {
      var product = products[$index];

buf.push('<option');
buf.push(attrs({ 'value':("" + (product.attributes.name) + "") }, {"value":true}));
buf.push('> \n' + escape((interp = product.attributes.name) == null ? '' : interp) + '</option>');
   }
  }
}).call(this);

buf.push('</select><label for="recipe-products">Catégoriess :</label><select id="recipe-tags" multiple="multiple" class="form-control select-picker"><option value="cheap">pas cher</option><option value="quick">rapide</option><option value="organic">bio</option><option value="light">light</option><option value="vegetarian">végétarien</option><option value="sugar">sucré</option></select></div><div class="form-group"><input id="recipe-image" type="text" placeholder="adresse de l\'image" class="form-control"/></div><div class="form-group"><button type="submit" title="ajouter" class="btn btn-default"><span class="glyphicon glyphicon-plus"></span></button></div></form><ul class="recipes"></ul>');
}
return buf.join("");
};
});

;require.register("views/templates/to_cooks", function(exports, require, module) {
module.exports = function anonymous(locals, attrs, escape, rethrow, merge) {
attrs = attrs || jade.attrs; escape = escape || jade.escape; rethrow = rethrow || jade.rethrow; merge = merge || jade.merge;
var buf = [];
with (locals || {}) {
var interp;
buf.push('<ul class="recipes"></ul>');
}
return buf.join("");
};
});

;require.register("views/to_cook", function(exports, require, module) {
var View     = require("./view"),
    Recipe   = require("../models/recipe"),
    Product  = require("../models/product"),
    Products = require("../models/products"),
    template = require("./templates/recipe-to-cook");

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
        "click .plus": "plus",
        "click .minus": "minus",
    },

    "change": function (evt, amount) {
        var that = this,
            details = [],
            $target = $(evt.currentTarget).parents(".row:first");
            $product = $target.find(".name"),
            $quantity = $target.find(".quantity"),
            productName = $.trim($product.text());

        details.push({ "label": productName, "amount": amount });

        Products.prototype.removeProducts(details, function (data) {
            var newQuantity = parseInt($.trim($quantity.text())) + amount;
            if (newQuantity >= 0) {
                $quantity.html(newQuantity);
            }
        });
    },

    "minus": function (evt) {
        this.change(evt, -1);
    },

    "plus": function (evt) {
        this.change(evt, 1);
    },

    "destroy": function () {
        var that = this,
            i,
            product,
            products = this.model.get("products"),
            details = [];

        toCook = that.model.get("toCook") - 1;
        cooked = that.model.get("cooked");
        if (cooked) {
            cooked++;
        } else {
            cooked = 1;
        }
        that.model.save({ "toCook": toCook, "cooked": cooked }, {
            "success": function (data) {
                if (!data.attributes.toCook) {
                    that.remove();
                }
            }
        });
    }
});

});

;require.register("views/to_cooks", function(exports, require, module) {
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

});

;require.register("views/view", function(exports, require, module) {
require('lib/view_helper');

// Base class for all views.
module.exports = Backbone.View.extend({
    "initialize": function () {
        this.render = _.bind(this.render, this);
    },

    "template": function () { return null; },
    "getRenderData": function () { return null; },

    "render": function () {
        this.$el.html(this.template(this.getRenderData()));
        this.afterRender();
        return this;
    },

    "afterRender": function () { return null; }
});

});

;
//# sourceMappingURL=app.js.map