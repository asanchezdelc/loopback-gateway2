'use strict';

/**
 * Override LoopBack's Built-in AccessToken
 * model definition to contain two additional columns.  
 */

module.exports = function(app) {

	var AccessToken = app.models.AccessToken;
	var Application = app.models.Application;
	var User = app.models.User;
	var UserIdentity = app.models.UserIdentity;
	var UserCredential = app.models.UserCredential;

	AccessToken.defineProperty('expiresIn', {
		type: Number
	});

	AccessToken.defineProperty('parameters', {
		type: String
	});

	AccessToken.defineProperty('authorizationCode', {
		type: String, index: true
	});

	AccessToken.defineProperty('refreshToken', {
		type: String, index: true
	});

	AccessToken.defineProperty('tokenType', {
		type: String, enum: [ "Bearer", "MAC" ]
	});

	AccessToken.defineProperty('scopes', {
		type: [String]
	});

	AccessToken.defineProperty('hash', {
		type: String
	});

	AccessToken.defineProperty('appId', {
		type: String, index: true
	});

	//relations	
	User.hasMany(AccessToken, {foreignKey: 'userId'});
	User.hasMany(UserIdentity, {foreignKey: 'userId'});
	User.hasMany(UserCredential, {foreignKey: 'userId'});
	AccessToken.belongsTo(Application, {foreignKey: 'appId'});

};