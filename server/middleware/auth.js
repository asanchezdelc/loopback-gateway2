'use strict';


function tokenIdForRequest(req, options) {
    var params = options.params || [];
    var headers = options.headers || [];
    var cookies = options.cookies || [];
    var i = 0;
    var length;
    var id;

    params = params.concat(['access_token']);
    headers = headers.concat(['X-Access-Token', 'authorization']);
    cookies = cookies.concat(['access_token', 'authorization']);

    for (length = params.length; i < length; i++) {
      var param = params[i];
      // replacement for deprecated req.param()
      id = req.params && req.params[param] !== undefined ? req.params[param] :
        req.body && req.body[param] !== undefined ? req.body[param] :
        req.query && req.query[param] !== undefined ? req.query[param] :
        undefined;

      if (typeof id === 'string') {
        return id;
      }
    }

    for (i = 0, length = headers.length; i < length; i++) {
      id = req.header(headers[i]);

      if (typeof id === 'string') {
        // Add support for oAuth 2.0 bearer token
        // http://tools.ietf.org/html/rfc6750
        if (id.indexOf('Bearer ') === 0) {
          id = id.substring(7);
          // Decode from base64
          var buf = new Buffer(id, 'base64');
          id = buf.toString('utf8');
        } else if (/^Basic /i.test(id)) {
          id = id.substring(6);
          id = (new Buffer(id, 'base64')).toString('utf8');
          // The spec says the string is user:pass, so if we see both parts
          // we will assume the longer of the two is the token, so we will
          // extract "a2b2c3" from:
          //   "a2b2c3"
          //   "a2b2c3:"   (curl http://a2b2c3@localhost:3000/)
          //   "token:a2b2c3" (curl http://token:a2b2c3@localhost:3000/)
          //   ":a2b2c3"
          var parts = /^([^:]*):(.*)$/.exec(id);
          if (parts) {
            id = parts[2].length > parts[1].length ? parts[2] : parts[1];
          }
        }
        return id;
      }
    }

    if (req.signedCookies) {
      for (i = 0, length = cookies.length; i < length; i++) {
        id = req.signedCookies[cookies[i]];

        if (typeof id === 'string') {
          return id;
        }
      }
    }
    return null;
}


exports.authenticate = function(req, res, next) {
	var token = tokenIdForRequest(req, {});
  var AccessToken = req.app.models.AccessToken;
  var cookie = '';
  var userAgent = req.headers['user-agent'];


	AccessToken.authenticate(token, userAgent, cookie, function(err, token) {
     if (err) {
        res.sendStatus(500);
      } else if (token) {
        next();
      } else {
        res.sendStatus(401);
      }
	});
};
