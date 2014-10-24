Pages = {
  Home : 'home',
  Thread : 'thread'
}

function showSquawks () {
  if ( ! showSquawks['listening'] ) {
    // Hack to show squawks

    // 500 ms after load
    setTimeout( function () {
      $( '#squawk-load').hide()
      $( '.squawk-post-well' ).show( 'slow' )
    }, 500 )

    // every 10 seconds
    setInterval( function () {
      // TODO, this should just ask if they want to load the new stuff
      $( '#squawk-load').hide()
      $( '.squawk-post-well' ).show( 'slow' )
    }, 10000 )
  }

  showSquawks['listening'] = true
}

/**
 * Load Template
 * =============
 *
 * Templates available:
 * - home
 */
function loadTemplate ( name ) {
  "use strict";

  Session.set( 'current_template', name )

  // Home Template
  // =============
  Template.home.helpers( {
    app_name: function () {
      return Session.get( "app_name" )
    },
    post_action: function () {
      return Session.get( "post_action" )
    },
    root_posts: function () {
      showSquawks()
      
      
      return Posts.find({}, {sort: {timestamp: -1}})
    },
    logged_in: function () {
      // TODO
      return true
    },
    modal: function () {
      Post.newPost( function ( data ) {
        Session.set( "post_form", data.html )
      })

      return Session.get( "post_form" )
    },
    active: function () {
      return Session.get( 'current_template' ) == Pages.Home
    }
  } )

  Template.home.events( {
    'click .new-post' : function () {
      $( '#squawk_post' ).modal( 'show' )
    },

    'click #squawk_post button[type=submit]' : function () {
      // Add post
      var $post = $( '#squawk_post' )
      var post = new Post( {
        'name' : $post.find( 'input[name=post_title]' ).val(),
        'content' : $post.find( 'textarea[name=post_content]' ).val()
        // TODO user data
      } )

      // Meteor.posts
      Posts.insert( post )

      $( '#squawk_post' ).modal( 'hide' )
      $post.find( 'input, textarea' ).val( '' )
    }
  } )

  // Thread Template
  // ===============
  Template.thread.helpers( {
    app_name: function () {
      return Session.get( "app_name" )
    },
  } )
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

  Session.set( "post_form" , "" )

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
