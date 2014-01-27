var americano = require('americano');

var port = process.env.PORT || 31440;
americano.start({name: 'template', port: port});
