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
        return Session.get( "post_form" )
      }
    } )

    Template.home.events( {
      'click .new-post' : function () {

        Post.newPost( function ( data ) {
          
          Session.set( "post_form", data.html )
          $( data.modalId ).modal( 'show' )

        } )

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

  Session.setDefault( "post_form" , "" )

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

/**
 * Server Boot
 * ===========
 */
if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
  });
}
