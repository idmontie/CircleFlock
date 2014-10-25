
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
      return TwitterTrends.find( {}, { limit : 10 } )
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
