
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

  // Header
  // ======
  Template.header.helpers( {
    app_name : function () {
      return Session.get( 'app_name' )
    },
    tag_line : function () {
      return Session.get( 'tag_line' )
    }
  } )

  Template.header.events( {
    'click #searcher-go' : function ( event ) {
      var search = $( '#searcher' ).val()

      loadSearch ( search )

      return false
    },
    'submit #search-form' : function ( event ) {
      var search = $( '#searcher' ).val()

      loadSearch ( search )

      return false
    }
  } )

  // Sidebar
  // ======
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

  Template.sidebar.events( {
    'click #popular_list a, click #recent_list a' : function ( event ) {
      var search = $( event.target ).text()
      $( '#searcher' ).val( search )

      loadSearch ( search )

      return false
    }
  } )

  // Content
  // ======
  Template.content.helpers( {
    current_search : function () {
      return Session.get( 'current_search' )
    },
    is_current_search : function ( type ) {
      return typeof Session.get( 'current_search' ) === type
    },
    is_current_search_empty : function ( ) {
      return Session.get( 'current_search' ) === ''
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
    },
    rendered : function () {
      Meteor.defer( function () {
        // Force Twitter buttons that were
        // added to the dom to render
        !function(d,s,id){
          var js,fjs=d.getElementsByTagName(s)[0],p=/^http:/.test(d.location)?'http':'https';js=d.createElement(s);js.id=id;js.src=p+'://platform.twitter.com/widgets.js';fjs.parentNode.insertBefore(js,fjs);
        }(document, 'script', 'twitter-wjs');
      } )
      return [] || Session.get ( 'curent_search' )
    },
    get_large_image : function ( url ) {
      return url.replace( 'normal', '400x400' )
    }
  } )


  
}

function loadSearch ( search ) {

  // Hashbang it
  window.location.hash = '!/' + encodeURIComponent ( search )

  document.title = "Circle Flock | " + search

  Session.set( 'current_search_term',  search )
  Session.set( 'current_search', 'Loading...' )
  
  Meteor.call ( 'search', search, function ( error, response ) {
    Session.set( 'current_search', response )
  } )
}

/**
 * Client Boot
 * ===========
 */
if (Meteor.isClient) {
  // Load in data
  loadConfigurations();

  // Load initial search
  var hashbangSearch = (window.location.hash !== "" ? window.location.hash : false);
  
  if (hashbangSearch !== false) {
    hashbangSearch = hashbangSearch.replace('#', '')
    hashbangSearch = hashbangSearch.replace('!/', '')

    hashbangSearch = decodeURIComponent ( hashbangSearch )

    $( '#searcher' ).val( hashbangSearch )

    loadSearch( hashbangSearch );
  }

}