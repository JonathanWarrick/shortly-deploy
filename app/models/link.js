var crypto = require('crypto');
var mongoose = require('mongoose');

// create the user schema for new users
var LinkSchema = new mongoose.Schema({
  url: { type: String, required: true },
  base_url : { type: String, required: true },
  code: { type: String },
  title: { type: String },
  visits: { type: Number },
  timestamp: {type: Date, default: Date.now},
  salt: String
});

var createShaSum = function(url) {
  var shasum = crypto.createHash('sha1');
  shasum.update(url);
  return shasum.digest('hex').slice(0, 5);
};

LinkSchema.pre('save', function(next) {
  var code = createShaSum(this.url);
  this.code = code;
  next();
});

var Link = mongoose.model("Link", LinkSchema);

module.exports = Link;
