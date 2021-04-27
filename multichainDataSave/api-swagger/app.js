'use strict';

var SwaggerExpress = require('swagger-express-mw');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const swaggerDocument = YAML.load('./api/swagger/swagger.yaml');
var express = require('express');
const app = express()
module.exports = app; // for testing


var config = {
  appRoot: __dirname // required config
};

SwaggerExpress.create(config, function(err, swaggerExpress) {
  if (err) { throw err; }

  // install middleware
  swaggerExpress.register(app);

  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

  var port = process.env.PORT || 10010;
  app.listen(port);
});
