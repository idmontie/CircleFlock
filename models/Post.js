/**
 * Post
 * ====
 *
 * Posts is a felxible data structure. Everything in Flock Squawk 
 * is a Post
 *
 * @ see PostType
 */

var _$ = this;

+function () {
  "use strict";

  _$.Post = function ( data ) {
    this.name = 'Post Name'
    this.content = 'Post Content'
    this.creator = User.Nil
    this.type = PostType.Root
    this.tags = []
    this.children = []
    this.timestamp = Date.now()
    this.last_edited = Date.now()

    this.construct ( data )
  }

  _$.Post.prototype.construct = function ( data ) {
    this.name = data.name
    this.content = 'Post Content'
    this.creator = data.creator
    this.type = data.type
    this.tags = data.tags
    this.children = data.children
    this.timestamp = data.timestamp
    this.last_edited = data.last_edited
  }
  
  _$.Post.newPost = function (callback) {
    // Create a form for the user to fill out
    Meteor.http.get( window.location.origin + '/views/SquawkPost.html', function ( _, obj ) {
      var html = obj.content

      var data = {
        "html" : html,
        "modalId" : "#squawk_post"
      }

      callback( data )
    } )
  }
}();