var mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/shortlydb');
var db = mongoose.connection;

db.once('open', function() {
  console.log("in the database");
});

module.exports = db;
