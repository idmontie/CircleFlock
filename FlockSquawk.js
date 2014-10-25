
/**
 * Load Configurations
 * ===================
 */
function loadConfigurations () {
  "use strict";

  for (var config in configuration) {
    Session.set( config, configuration[config] )
  }


  Template.page.helpers( {

  } )

  Template.header.helpers( {
    app_name : function () {
      return Session.get( 'app_name' )
    }
  } )

  Template.sidebar.helpers( {
    popular_searches : function () {
      return PopularSearches.find( {}, { limit : 10 } )
    }
  } )
}

/**
 * Client Boot
 * ===========
 */
if (Meteor.isClient) {
  // Load in data
  loadConfigurations();
}

/**
 * Server Boot
 * ===========
 */
if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup

    // TODO refactor
    var textBlob = Assets.getText( 'ConfigurationTwitter.json' )
    var twitterConfig = JSON.parse( textBlob )

    var credentials = twitterConfig.consumerKey + ":" + twitterConfig.consumerSecret

    var base64Creds = Base64.encode( credentials )


    console.log(base64Creds)
    var bearer = HTTP.call(
      'POST', 
      'https://api.twitter.com/oauth2/token',
      {
        'headers' : {
          'Authorization' : 'Basic ' + base64Creds,
          'Content-Type' : 'application/x-www-form-urlencoded;charset=UTF-8'
        },
        'content' : 'grant_type=client_credentials'
      }
      )

    console.log( bearer )

    // TODO nonce?
    var nonce = '5485d7184c2cb43f96d34b9ad0ba69a8'
    // TODO oauth signature?
    var siggy = 'dGn6Xrxe3Por85dyklMGff9ngRY%3D' 

    var oauth = 'OAuth oauth_consumer_key="'
    oauth += twitterConfig.consumerKey
    oauth += '", oauth_nonce="'
    oauth += nonce
    oauth += '", oauth_signature="'
    oauth += siggy
    oauth += '", oauth_signature_method="HMAC-SHA1", oauth_timestamp="1414215527", oauth_token="'
    oauth += twitterConfig.accessToken
    oauth +='", oauth_version="1.0"'
    
  });
}
