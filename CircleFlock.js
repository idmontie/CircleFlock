
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

  Template.content.rendered = function () {
    !function(d,s,id){
      var js,fjs=d.getElementsByTagName(s)[0],p=/^http:/.test(d.location)?'http':'https';if(!d.getElementById(id)){js=d.createElement(s);js.id=id;js.src=p+'://platform.twitter.com/widgets.js';fjs.parentNode.insertBefore(js,fjs);}
    }(document, 'script', 'twitter-wjs');
  }

  Template.sidebar.events( {
    'click #popular_list a, click #recent_list a' : function ( event ) {
      var search = $( event.target ).text()
      $( '#searcher' ).val( search )

      loadSearch ( search )
    },
    'click #searcher-go' : function ( event ) {
      var search = $( '#searcher' ).val()

      loadSearch ( search )
    },
    'submit #search-form' : function ( event ) {
      var search = $( '#searcher' ).val()

      loadSearch ( search )

      return false;
    }
  } )
}

function loadSearch ( search ) {

  // Hashbang it
  window.location.hash = '!/' + encodeURIComponent ( search )

  Session.set( 'current_search_term',  search )
  Session.set( 'current_search', 'Loading...' )
  
  Meteor.call ( 'search', $( '#searcher' ).val(), function ( error, response ) {
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