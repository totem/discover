var winston = require('winston');

before(function () {
  // Prevent winston from logging while testing
  //winston.level = 'debug';
  winston.remove(winston.transports.Console);
});

