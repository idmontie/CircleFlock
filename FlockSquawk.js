
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
    
  });
}
