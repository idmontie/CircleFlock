/**
 * Load Template
 * =============
 *
 * Templates available:
 * - home
 */
function loadTemplate ( name ) {
  "use strict";

  if ('home' === name) {
    var closure = {
      newPost : ''
    }

    Template.home.helpers( {
      app_name: function () {
        return Session.get( "app_name" )
      },
      post_action: function () {
        return Session.get( "post_action" )
      },
      root_posts: function () {
        return Meteor.posts.find()
      },
      modal: function () {
        return closure.newPost
      }
    } )

    Template.home.events( {
      'click .new-post' : function () {
        Session.set( "app_name", "test" )
        Post.newPost( function ( data ) {

          closure.newPost = data.html

          $( data.modalId ).modal( 'show' )
        } );
      }
    } )
  }
}


/**
 * Load Configurations
 * ===================
 */
function loadConfigurations () {
  "use strict";

  for (var config in configuration) {
    Session.set( config, configuration[config] )
  }

  // Call Template Set Up
  loadTemplate( 'home' )
}

/**
 * Client Boot
 * ===========
 */
if (Meteor.isClient) {
  // Load in data
  loadConfigurations();
}

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
  });
}
