var request = require('request');
var crypto = require('crypto');
var bcrypt = require('bcrypt');
var util = require('../lib/utility');
var Q = require('q');

var db = require('../app/config');
var User = require('../app/models/user');
var Link = require('../app/models/link');

exports.renderIndex = function(req, res) {
  res.render('index');
};

exports.signupUserForm = function(req, res) {
  res.render('signup');
};

exports.loginUserForm = function(req, res) {
  res.render('login');
};

exports.logoutUser = function(req, res) {
  req.session.destroy(function(){
    res.redirect('/login');
  });
};

exports.fetchLinks = function(req, res) {
  Link.find(function(err, links) {
    if (err) {
      console.error(err);
    }
    res.send(200, links);
  });
};

// exports.fetchLinks = function(req, res) {
//   Links.reset().fetch().then(function(links) {
//     res.send(200, links.models);
//   })
// };

exports.saveLink = function(req, res) {
  var uri = req.body.url;

  if (!util.isValidUrl(uri)) {
    console.log('Not a valid url: ', uri);
    return res.send(404);
  }

  Link.findOne({ url: uri }, function(err, linkFound) {
    if (err) {
      console.error(err);
    }
    if (linkFound) {
      res.send(200, linkFound);
    } else {
      util.getUrlTitle(uri, function(err, title) {
        if (err) {
          console.log('Error reading URL heading: ', err);
          return res.send(404);
        }

        var newLink = new Link({
          url: uri,
          title: title,
          base_url: req.headers.origin
        });

        newLink.save(function(err, link) {
          if (err) {
            return console.error(err);
          }
          res.send(200, link);
        });
      });
    }
  });
};

// exports.saveLink = function(req, res) {
//   var uri = req.body.url;

//   if (!util.isValidUrl(uri)) {
//     console.log('Not a valid url: ', uri);
//     return res.send(404);
//   }

//   new Link({ url: uri }).fetch().then(function(found) {
//     if (found) {
//       res.send(200, found.attributes);
//     } else {
//       util.getUrlTitle(uri, function(err, title) {
//         if (err) {
//           console.log('Error reading URL heading: ', err);
//           return res.send(404);
//         }

//         var link = new Link({
//           url: uri,
//           title: title,
//           base_url: req.headers.origin
//         });

//         link.save().then(function(newLink) {
//           Links.add(newLink);
//           res.send(200, newLink);
//         });
//       });
//     }
//   });
// };

exports.loginUser = function(req, res) {
  console.log("inside login");
  var username = req.body.username;
  var password = req.body.password;

  var findUser = Q.nbind(User.findOne, User);

  findUser({username: username})
    .then(function(err, user) {
      console.log("inside find");

      if (err) {
        return console.error(err);
      }
      if (!user) {
        console.log("User does not exist!");
        res.redirect('/login');
      } else {
        return user.comparePassword(password);
      }
    })
    .then(function(foundUser) {
      if (foundUser) {
        console.log('logged in user');
        util.createSession(req, res, user);
      } else {
        res.redirect('/login');
      }
    });
};

exports.signupUser = function(req, res) {
  console.log("inside signupUser");

  var username = req.body.username;
  var password = req.body.password;

  User.findOne({username: username}, function(err, user) {
    console.log("inside find");

    if (err) {
      return console.error(err);
    }
    if (!user) {
      console.log("inside creating new user");

      var newUser = new User({
        username: username,
        password: password
      });

      newUser.save(function(err, user) {
        console.log("inside saving new user");

        if (err) {
          return console.error(err);
        }
      });
        util.createSession(req, res, newUser);
    } else {
      console.log('Account already exists');
      res.redirect('/signup');
    }
  });
};

exports.navToLink = function(req, res) {
  Link.findOne({code: req.params[0]}, function(err, link) {
    if (err) {
      console.error(err);
    }
    if (!link) {
      res.redirect('/');
    } else {
      link.visits = link.visits + 1;
      return res.direct(link.url);
    }
  });
};

// exports.navToLink = function(req, res) {
//   new Link({ code: req.params[0] }).fetch().then(function(link) {
//     if (!link) {
//       res.redirect('/');
//     } else {
//       link.set({ visits: link.get('visits') + 1 })
//         .save()
//         .then(function() {
//           return res.redirect(link.get('url'));
//         });
//     }
//   });
// };
