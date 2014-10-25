
/**
 * Load Configurations
 * ===================
 */
function loadConfigurations () {
  "use strict";

  for (var config in configuration) {
    Session.set( config, configuration[config] )
  }

  Session.get( 'current_search', '' )

  Tracker.autorun(function () {
    Meteor.subscribe("twitter_trends");
  });

  Template.page.helpers( {

  } )

  Template.header.helpers( {
    app_name : function () {
      return Session.get( 'app_name' )
    }
  } )

  Template.sidebar.helpers( {
    popular_searches : function () {
      return TwitterTrends.find( { 
        date_created : { 
          $exists : true 
        } 
      }, { 
        sort : {
          date_created : 1
        },
        limit : 10 } )
    }
  } )

  Template.content.helpers( {
    current_search : function () {
      return Session.get( 'current_search' )
    },
    is_current_search : function ( type ) {
      return typeof Session.get( 'current_search' ) === type
    }
  } )

  Template.sidebar.events( {
    'click #popular_list a' : function ( event ) {
      var search = $( event.target ).text()
      $( '#searcher' ).val( search )
      $( '#searcher-go' ).click()
    },
    'click #searcher-go' : function ( event ) {
      Session.set( 'current_search', 'Loading...' )
      Session.set( 'current_search_loaded', false )
      
      Meteor.call ( 'search', $( '#searcher' ).val(), function ( error, response ) {
        Session.set( 'current_search', response )
        Session.set( 'current_search_loaded', true )
      } )
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
