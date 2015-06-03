var loopback = require('loopback');
var path = require('path');
var PassportConfigurator = require('loopback-component-passport').PassportConfigurator;
var createToken = require('../../helpers').createToken;

exports.setup = function(app) {

	var AccessToken = app.models.AccessToken;

	var passportConfigurator = new PassportConfigurator(app);

	// Load the provider configurations
	var providers = {};
	try {
		providers = require('./providers.json');
	} catch(err) {
		console.error('Please configure your passport strategy in `providers.json`.');
		process.exit(1);
	}

	// Initialize passport
	var passport = passportConfigurator.init();
	 
	// Set up related models
	passportConfigurator.setupModels({
		userModel: app.models.user,
		userIdentityModel: app.models.userIdentity,
		userCredentialModel: app.models.userCredential		
	});

	Object.keys(providers).forEach(function(strategy) {


	  // opts will be in the scope of the callback below. 
	  var opts = providers[strategy];
	  opts.session = false;

	  //we defined a custom token creation method to add
	  //additional required properties for oauth2
	  opts.createAccessToken = function(user, ttl, cb) {
	   	if (arguments.length === 2 && typeof ttl === 'function') {
      	cb = ttl;
    	}

			AccessToken.create({
				ttl: 1209600, //2 weeks,
				refreshToken: createToken(32),
				expiresIn: 1209600,
				userId: user.id,
				scopes: ['web']
			}, cb);

		};
	  
	  //custom callback definition to redirect to other consumers if needed.
	  opts.customCallback = function (req, res, next) {
	  	
	    // We need url, because we want to use to to parse the url and then reformat it with params.
	    var url = require('url');

	    // Note that we have to only use variables that are in scope right now, like opts.
	    passport.authenticate(
	      strategy,
	      {session: false},
	      //See http://passportjs.org/guide/authenticate/
	      // err, user, and info are passed to this by passport
	      function(err, user, info) {

	        if (err) {
	          return next(err);
	        }
	        if (!user) {
	          // TODO - we might want to add some params here too for failures.
	          return res.redirect(opts.failureRedirect);
	        }
	        // Add the tokens to the callback as params.
	        var redirect = url.parse(opts.successRedirect, true);

	        // this is needed or query is ignored. See url module docs.
	        delete redirect.search;

	        redirect.query = {
	          'access_token': info.accessToken.id,
	          'refresh_token': info.accessToken.refreshToken,
	          // Note the .toString here is necessary.
	          'userId': user.id.toString()
	        };
	        // Put the url back together. It should now have params set.
	        redirect = url.format(redirect);

	        return res.redirect(redirect);
	      }
	    )(req, res, next);

	  };
		
	
  	// Now that we added the opts.customCallback, got ahead and run the Configurator.
  	passportConfigurator.configureProvider(strategy, opts);
	});
}
