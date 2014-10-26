
/**
 * Load Configurations
 * ===================
 */
function loadConfigurations () {
  "use strict";

  for (var config in configuration) {
    Session.set( config, configuration[config] )
  }

  Session.setDefault( 'current_search', '' )
  Session.setDefault( 'current_search_term', '' ) 

  Tracker.autorun(function () {
    Meteor.subscribe("twitter_trends");
    Meteor.subscribe("searches");
  });

  Template.page.helpers( {

  } )

  Template.header.helpers( {
    app_name : function () {
      return Session.get( 'app_name' )
    },
    tag_line : function () {
      return Session.get( 'tag_line' )
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
          date_created : -1
        },
        limit : 10 } )
    },
    recent_searches : function () {
      return Searches.find( { 
        date_created : { 
          $exists : true 
        } 
      }, { 
        sort : {
          date_created : -1
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
    },
    current_search_term : function () {
      return Session.get( 'current_search_term' )
    },
    count_output : function ( counts ) {
      if (counts == 1) {
        return " Tweet"
      } else {
        return " Tweets"
      }
    }
  } )

  Template.sidebar.events( {
    'click #popular_list a, click #recent_list a' : function ( event ) {
      var search = $( event.target ).text()
      $( '#searcher' ).val( search )
      $( '#searcher-go' ).click()
    },
    'click #searcher-go' : function ( event ) {
      var search = $( '#searcher' ).val()

      // Hashbang it
      window.location.hash = '!/' + encodeURIComponent ( search )

      Session.set( 'current_search_term',  )
      Session.set( 'current_search', 'Loading...' )
      
      Meteor.call ( 'search', $( '#searcher' ).val(), function ( error, response ) {
        Session.set( 'current_search', response )
      } )
    },
    'submit #search-form' : function ( event ) {
      $( '#searcher-go' ).click()
      return false;
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
