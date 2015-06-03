var loopback = require('loopback');
var boot = require('loopback-boot');

var app = module.exports = loopback();
var middleware = require('./middleware/index');


var oauth2 = require('loopback-component-oauth2');


// Set up the /favicon.ico
app.middleware('initial', loopback.favicon());

// request pre-processing middleware
app.middleware('initial', loopback.compress());



// Bootstrap the application, configure models, datasources and middleware.
// Sub-apps like REST API are mounted via boot scripts.
boot(app, __dirname);


var options = { 
  dataSource: app.dataSources.db, // Data source for oAuth2 metadata persistence
  loginPage: '/login', // The login page url
  loginPath: '/login', // The login form processing url
  useAccessTokenModel: true
};

oauth2.oAuth2Provider(
  app, // The app instance
  options // The options
);


//setting up passport
middleware.passport.setup(app);

//user login
app.get('/coordinator', function(req, res) {
	console.log(req.query);
	res.send('OK');
});

//custom auth middleware
//app.middleware('auth:before', ['/protected', '/api', '/me', '/_internal'], middleware.auth.authenticate);
var auth = oauth2.authenticate({session: false, scope: ['web', 'demo']});
app.middleware('auth:before', ['/protected', '/api', '/me', '/_internal'],
  auth);


//setting up proxy middleware
var proxy = require('./middleware/proxy');
var proxyOptions = require('./middleware/proxy/config.json');
app.middleware('routes:after', proxy(proxyOptions));


// that will be handled later down the chain.
app.middleware('final', loopback.urlNotFound());

// The ultimate error handler.
app.middleware('final', loopback.errorHandler());


app.start = function() {
  // start the web server
  return app.listen(function() {
    app.emit('started');
    console.log('Web server listening at: %s', app.get('url'));
  });
};




if (require.main === module) {
  app.start();
}
