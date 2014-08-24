var bcrypt = require('bcrypt');
var mongoose = require('mongoose');
var db = require('../config');
var Q = require('q');

// static salt
var SALT_WORK_FACTOR = 10;

// create the user schema for new users
var UserSchema = new mongoose.Schema({
  username: { type: String, required: true, index: { unique: true } },
  password: { type: String, required: true},
  timestamp: {type: Date, default: Date.now},
  salt: String
});

UserSchema.methods.comparePassword = function(candidatePassword) {
  var defer = Q.defer();
  var savedPassword = this.password;
  bcrypt.compare(candidatePassword, savedPassword, function (err, isMatch) {
    if (err) {
      defer.reject(err);
    } else {
      defer.resolve(isMatch);
    }
  });
  return defer.promise;
};

UserSchema.pre('save', function(next) {
  var user = this;

  // only hash the password if it has been modified (or new)
  if (!user.isModified('password')) {
    return next();
  }

  // generate a salt
  bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
    if (err) {
      return next(err);
    }

    // hash the password with salt
    bcrypt.hash(user.password, salt, function(err, hash) {
      if (err) {
        return next(err);
      }

      // overwrite the cleartext password with the hashed one
      user.password = hash;
      user.salt = salt;
      next();
    });
  });
});


// define user model (mongoose models are equivalent of collections, so users file is irrelevant)
var User = mongoose.model('User', UserSchema);

// export for use in handler functions
module.exports = User;


