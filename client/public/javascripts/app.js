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
    var HomeView = require('views/home_view'), Router = require('lib/router');
    // Ideally, initialized classes should be kept in controllers & mediator.
    // If you're making big webapp, here's more sophisticated skeleton
    // https://github.com/paulmillr/brunch-with-chaplin
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
var application = require('application');

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

;require.register("views/home_view", function(exports, require, module) {
var View         = require("./view"),
    Product      = require("../models/product"),
    Products     = require("../models/products"),
    ProductsView = require("./products_view"),
    template     = require("./templates/home");

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

    "swipers": {},

    "goPage": function (pageName) {
        var that = this, 
            pageClass = "." + pageName;

        $("#content").removeClass();
        $("#content").addClass(pageName);

        if (!that.swipers[pageName]) {
            that.swipers[pageName] = $(".swiper-container:visible").swiper({
                "loop": false,
                "grabCursor": true,
                "pagination": pageClass + "> .pagination",
                "paginationClickable": true,
                "keyboardControl": true
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

    "goShop": function () {
        this.goPage("shop");

        return false;
    },

    "goFridge": function () {
        this.products = new Products([ 
            { "name": "pates", "number": 4, "price": 0.59 },
            { "name": "riz", "number": 0, "price": 1.32 },
        ]);
        this.productsView = new ProductsView({ 
            "el": $("#fridge")[0],
            "collection": this.products
        });
        this.productsView.render();
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

});

;require.register("views/product_view", function(exports, require, module) {
var View     = require("./view"),
    Product  = require("../models/product"),
    template = require("./templates/product");

module.exports = View.extend({
    "tagName": "li",
    "className": "row",
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
    }

});


});

;require.register("views/products_view", function(exports, require, module) {
var View        = require("./view"),
    Product     = require("../models/product"),
    Products    = require("../models/products"),
    ProductView = require("./product_view"),
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
                "number": $("#product-number").val(),
                "price": $("#product-price").val(),
            });

        this.collection.push(product);
        this.add(product);

        return false;
    },

});

});

;require.register("views/templates/home", function(exports, require, module) {
module.exports = function anonymous(locals, attrs, escape, rethrow, merge) {
attrs = attrs || jade.attrs; escape = escape || jade.escape; rethrow = rethrow || jade.rethrow; merge = merge || jade.merge;
var buf = [];
with (locals || {}) {
var interp;
buf.push('<div id="content" class="menu"><div class="header"><div class="menu"><img src="images/titre.png" alt="aliventaire" title="Aliventaire"/></div><div class="shop"><img src="images/shop.png" alt="shop" title="Retour au menu" class="menu"/><h1>Mes courses</h1><div class="pagination"></div></div><div class="fridge"><img src="images/fridge.png" alt="fridge" title="Retour au menu" class="menu"/><h1>Mon placard</h1><div class="pagination"></div></div><div class="cook"><img src="images/cook.png" alt="cook" title="Retour au menu" class="menu"/><h1>Ma cuisine</h1><div class="pagination"></div></div><div class="recipe"><img src="images/recipe.png" alt="recipe" title="Retour au menu" class="menu"/><h1>Mes recettes</h1><div class="pagination"></div></div></div><div class="page"><div class="menu"><div class="row"><img src="images/shop.png" alt="shop" title="Mes courses" class="shop"/><img src="images/fridge.png" alt="fridge" title="Mon placard" class="fridge"/></div><div class="row"><img src="images/cook.png" alt="cook" title="Ma cuisine" class="cook"/><img src="images/recipe.png" alt="recipe" title="Mes recettes" class="recipe"/></div></div><div class="shop"><div class="navigation left"></div><div class="swiper-container"><div class="swiper-wrapper"><div class="swiper-slide"> <p>shop 1</p></div><div class="swiper-slide"> <p>shop 2</p></div><div class="swiper-slide"> <p>shop 3</p></div></div></div><div class="navigation right"></div></div><div id="fridge" class="fridge"></div><div class="cook"><div class="navigation left"></div><div class="swiper-container"><div class="swiper-wrapper"><div class="swiper-slide"> <p>cook 1</p></div><div class="swiper-slide"> <p>cook 2</p></div></div></div><div class="navigation right"></div></div><div class="recipe">"recipe"</div></div></div>');
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
buf.push('<span class="image col-xs-2"> <img');
buf.push(attrs({ 'src':("" + (image) + ""), 'alt':("image"), 'title':("" + (name) + "") }, {"src":true,"alt":true,"title":true}));
buf.push('/></span><span class="name col-xs-6">' + escape((interp = name) == null ? '' : interp) + '</span><span class="number col-xs-2">' + escape((interp = number) == null ? '' : interp) + '</span><span class="price col-xs-2">' + escape((interp = price) == null ? '' : interp) + '</span>');
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
buf.push('<form role="form" class="form-inline"><div class="row"><div class="form-group col-xs-7"><input id="product-name" type="text" required="required" placeholder="Produit" class="form-control"/></div><div class="form-group col-xs-2"><input id="product-number" type="text" pattern="[0-9]+" title="le nombre de produit de ce type" placeholder="Nombre" class="form-control"/></div><div class="form-group col-xs-2"><input id="product-price" type="text" required="required" pattern="[0-9]+(.[0-9]+)?" title="le prix unitaire de ce produit (ex: 3.2)" placeholder="Prix unitaire" class="form-control"/></div><div class="form-group col-xs-1"><button type="submit" title="ajouter" class="col-xs-1 btn btn-default glyphicon glyphicon-plus"></button></div></div></form><ul class="products"></ul>');
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