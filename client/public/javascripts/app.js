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
    "urlRoot": "products"
});

});

;require.register("models/products", function(exports, require, module) {
var Collection = require("./collection"),
    Product    = require("./product");

module.exports = Collection.extend({
    "model": Product,
    "url": "products"
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

;require.register("views/cart", function(exports, require, module) {
var View     = require("./view"),
    Cart     = require("../models/cart"),
    template = require("./templates/cart");

module.exports = View.extend({
    "tagName": "li",
    "className": "row",
    "template": template,

    "model": Cart,

});


});

;require.register("views/carts", function(exports, require, module) {
var View     = require("./view"),
    Cart     = require("../models/cart"),
    Carts    = require("../models/carts"),
    CartView = require("./cart"),
    template = require("./templates/carts");

module.exports = View.extend({
    "collection": Carts,
    
    "template": template,

    "initialize": function (params) {
        this.recipes = params.recipes.models;
    },

    "getRenderData": function () {
        return { "recipes": this.recipes }
    },

    "render": function () {
        this.$el.html(this.template(this.getRenderData()));
        this.collection.each(function (cart){
            this.add(cart);
        }, this);
    },

    "add": function (cart) {
        var cartView = new CartView({ "model": cart });
        this.$el.find("ul.carts").prepend(cartView.el)
    },

    "addCart": function (evt) {
        var $form = $(evt.target),
            cart = new Cart ({
                "name": $("#cart-name").val(),
                "description": $("#cart-description").val(),
                "products": $("#cart-products").val()
            });

        this.collection.push(cart);
        this.add(cart);

        return false;
    },

    "events": {
        "click .recipe": "updateCart",
    },

    "updateCart": function (evt) {
        var $target = $(evt.currentTarget),
            $button = $target.find(".btn"),
            products = this.recipes[0].attributes.products;

        $button.toggleClass("glyphicon-unchecked");
        $button.toggleClass("glyphicon-check");

        if ($button.hasClass("glyphicon-check")) {
            _(products).each(function (product) {
                var productContainer = $("<div class='product' />");
                productContainer.html(product);
                $("#cart .products").append(productContainer);
            });
        } else {
            $("#cart .products .product").remove();
        }
    }
});

});

;require.register("views/home", function(exports, require, module) {
var View         = require("./view"),
    Product      = require("../models/product"),
    Products     = require("../models/products"),
    ProductsView = require("./products"),
    Recipe       = require("../models/recipe"),
    Recipes      = require("../models/recipes"),
    RecipesView  = require("./recipes"),
    Cart         = require("../models/cart"),
    Carts        = require("../models/carts"),
    CartsView    = require("./carts"),
    template     = require("./templates/home");

module.exports = View.extend({
    "id": "home-view",
    "template": template,

    "events": {
        "click .menu": "goMenu",
        "click .menu .cart": "goCart",
        "click .menu .fridge": "goFridge",
        "click .menu .cook": "goCook",
        "click .menu .recipe": "goRecipe",
    },

    "afterRender": function () {
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


        this.carts = new Carts();
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
    },

    "goCart": function () {
        if (!this.cartsView) {
            this.cartsView = new CartsView({ 
                "el": $("#cart")[0],
                "collection": this.carts,
                "recipes": this.recipes,
            });
            this.cartsView.render();
        }
        this.goPage("cart");

        return false;
    },

    "goFridge": function () {
        if (!this.productsView) {
            this.productsView = new ProductsView({ 
                "el": $("#fridge")[0],
                "collection": this.products
            });
        }
        this.productsView.render();
        this.goPage("fridge");

        return false;
    },

    "goCook": function () {
        this.goPage("cook");

        return false;
    },

    "goRecipe": function () {
        if (!this.recipesView) {
            this.recipesView = new RecipesView({ 
                "el": $("#recipe")[0],
                "collection": this.recipes,
                "products": this.products
            });
        }
        this.recipesView.render();
        this.goPage("recipe");

        return false;
    },

    "goMenu": function () {
        this.goPage("menu");

        return false;
    }

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
            attributes.image = "images/fridge.png";
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
        this.collection.each(function (product){
            this.add(product);
        }, this);
    },

    "add": function (product) {
        var productView = new ProductView({ "model": product });
        this.$el.find("ul.products").prepend(productView.el)
    },

    "events": {
        "submit form": "addProduct",
    },

    "addProduct": function (evt) {
        var $form = $(evt.target),
            product = new Product ({
                "name": $("#product-name").val(),
                "quantity": $("#product-quantity").val(),
                "price": $("#product-price").val(),
            }),
            that = this;

        this.collection.create(product, {
            "success": function (product) {
                that.add(product);
            }
        });

        return false;
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
        var that = this;

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
            }),
            that = this;

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
buf.push('<div class="cart"><div class="navigation left"></div><div class="swiper-container"><div class="swiper-wrapper"><div class="swiper-slide"> <h2>Information de consomation</h2></div><div class="swiper-slide"> <h2>Choix des cat�gories</h2></div><div class="swiper-slide"> <h2>Choix du prix</h2></div><div class="swiper-slide"> <h2>Choix de la recette</h2>');
// iterate recipes
;(function(){
  if ('number' == typeof recipes.length) {
    for (var $index = 0, $$l = recipes.length; $index < $$l; $index++) {
      var recipe = recipes[$index];

buf.push('<div class="recipe"> \n' + escape((interp = recipe.attributes.name) == null ? '' : interp) + '<div class="btn glyphicon glyphicon-unchecked"> </div></div>');
    }
  } else {
    for (var $index in recipes) {
      var recipe = recipes[$index];

buf.push('<div class="recipe"> \n' + escape((interp = recipe.attributes.name) == null ? '' : interp) + '<div class="btn glyphicon glyphicon-unchecked"> </div></div>');
   }
  }
}).call(this);

buf.push('</div><div class="swiper-slide cart"><h2>Panier</h2><div class="products"></div><hr/><div class="btn btn-primary">Valider</div></div></div></div><div class="navigation right"></div></div>');
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
buf.push('<div id="content" class="menu"><div class="header"><div class="menu"><img src="images/titre.png" alt="aliventaire" title="Aliventaire"/></div><div class="cart"><img src="images/cart.png" alt="cart" title="Retour au menu" class="menu"/><h1>Mes courses</h1><div class="pagination"></div></div><div class="fridge"><img src="images/fridge.png" alt="fridge" title="Retour au menu" class="menu"/><h1>Mon placard</h1><div class="pagination"></div></div><div class="cook"><img src="images/cook.png" alt="cook" title="Retour au menu" class="menu"/><h1>Ma cuisine</h1><div class="pagination"></div></div><div class="recipe"><img src="images/recipe.png" alt="recipe" title="Retour au menu" class="menu"/><h1>Mes recettes</h1><div class="pagination"></div></div></div><div class="page"><div class="menu"><div class="row"><img src="images/cart.png" alt="cart" title="Mes courses" class="cart"/><img src="images/fridge.png" alt="fridge" title="Mon placard" class="fridge"/></div><div class="row"><img src="images/cook.png" alt="cook" title="Ma cuisine" class="cook"/><img src="images/recipe.png" alt="recipe" title="Mes recettes" class="recipe"/></div></div><div id="cart" class="cart"></div><div id="fridge" class="fridge"></div><div class="cook"><div class="navigation left"></div><div class="swiper-container"><div class="swiper-wrapper"><div class="swiper-slide"> <p>cook 1</p></div><div class="swiper-slide"> <p>cook 2</p></div></div></div><div class="navigation right"></div></div><div id="recipe" class="recipe"></div></div></div>');
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
buf.push('<span title="supprimer" class="delete col-xs-1"><button class="btn btn-danger glyphicon glyphicon-remove"></button></span><span class="image col-xs-1"> <img');
buf.push(attrs({ 'src':("" + (image) + ""), 'alt':("image"), 'title':("" + (name) + "") }, {"src":true,"alt":true,"title":true}));
buf.push('/></span><span class="name col-xs-5">' + escape((interp = name) == null ? '' : interp) + '</span><span class="price col-xs-2">' + escape((interp = price) == null ? '' : interp) + '</span><span class="quantity col-xs-3">' + escape((interp = quantity) == null ? '' : interp) + '<span class="actions"><button class="minus btn glyphicon glyphicon-minus"></button><button class="plus btn glyphicon glyphicon-plus"></button></span></span>');
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
buf.push('<form role="form" class="form-inline"><div class="row"><div class="form-group col-xs-7"><input id="product-name" type="text" required="required" placeholder="Produit" class="form-control"/></div><div class="form-group col-xs-2"><input id="product-price" type="text" required="required" pattern="[0-9]+(.[0-9]+)?" title="le prix unitaire de ce produit (ex: 3.2)" placeholder="Prix unitaire" class="form-control"/></div><div class="form-group col-xs-2"><input id="product-quantity" type="text" pattern="[0-9]+" title="le nombre de produits de ce type" placeholder="Quantit�" class="form-control"/></div><div class="form-group col-xs-1"><button type="submit" title="ajouter" class="col-xs-1 btn btn-default glyphicon glyphicon-plus"></button></div></div></form><ul class="products"></ul>');
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
buf.push('<span title="supprimer" class="delete col-xs-1"><button class="btn btn-danger glyphicon glyphicon-remove"></button></span><div class="image col-xs-3"> <img');
buf.push(attrs({ 'src':("" + (image) + ""), 'alt':("image"), 'title':("" + (name) + "") }, {"src":true,"alt":true,"title":true}));
buf.push('/></div><div class="col-xs-8"> <div class="name">' + escape((interp = name) == null ? '' : interp) + '</div><div class="description">' + ((interp = description) == null ? '' : interp) + '</div><hr/><div class="recipe-products">Produits :<ul>');
// iterate products
;(function(){
  if ('number' == typeof products.length) {
    for (var $index = 0, $$l = products.length; $index < $$l; $index++) {
      var product = products[$index];

buf.push('<li>' + escape((interp = product.id) == null ? '' : interp) + '</li>');
    }
  } else {
    for (var $index in products) {
      var product = products[$index];

buf.push('<li>' + escape((interp = product.id) == null ? '' : interp) + '</li>');
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
buf.push('<form role="form"><div class="form-group"><input id="recipe-name" type="text" required="required" placeholder="Nom de la recette" class="form-control"/></div><div class="form-group"><textarea id="recipe-description" type="text" placeholder="Description de la recette" class="form-control"></textarea></div><div class="form-group"><select id="recipe-products" multiple="multiple" class="form-control">');
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

buf.push('</select></div><div class="form-group"><button type="submit" title="ajouter" class="btn btn-default glyphicon glyphicon-plus"></button></div></form><ul class="recipes"></ul>');
}
return buf.join("");
};
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