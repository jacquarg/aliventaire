exports.config =
  # Edit the next line to change default build path.
  paths:
    public: 'public'

  files:
    javascripts:
      # Defines what file will be generated with `brunch generate`.
      defaultExtension: 'js'
      # Describes how files will be compiled & joined together.
      # Available formats:
      # * 'outputFilePath'
      # * map of ('outputFilePath': /regExp that matches input path/)
      # * map of ('outputFilePath': function that takes input path)
      joinTo:
        'javascripts/app.js': /^app/
        'javascripts/vendor.js': /^vendor/
      # Defines compilation order.
      # `vendor` files will be compiled before other ones
      # even if they are not present here.
      order:
        before: [
          'vendor/javascripts/jquery-2.1.0.min.js',
          'vendor/javascripts/console-helper.js',
          'vendor/javascripts/underscore-1.5.2.min.js',
          'vendor/javascripts/backbone-1.1.0.min.js',
          'vendor/javascripts/backbone-mediator.js',
          'vendor/javascripts/bootstrap-3.0.3.min.js',
          'vendor/javascripts/bootstrap-select.min.js',
          'vendor/javascripts/idangerous.swiper.min.js',
          'vendor/javascripts/list.js',
          'vendor/javascripts/date.js',
          'vendor/javascripts/raphael-2.1.2.min.js',
        ]

    stylesheets:
      defaultExtension: 'styl'
      joinTo: 'stylesheets/app.css'
      order:
        before: ['vendor/stylesheets/normalize.css']
        after: ['vendor/stylesheets/helpers.css']
    templates:
      defaultExtension: 'jade'
      joinTo: 'javascripts/app.js'

  # Change this if you're using something other than backbone (e.g. 'ember').
  # Content of files, generated with `brunch generate` depends on the setting.
  # framework: 'backbone'

  # Settings of web server that will run with `brunch watch [--server]`.
  # server:
  #   # Path to your server node.js module.
  #   # If it's commented-out, brunch will use built-in express.js server.
  #   path: 'server.coffee'
  #   port: 3333
  #   # Run even without `--server` option?
  #   run: yes
