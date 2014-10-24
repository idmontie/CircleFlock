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
    this.creator = _$.User.Nil
    this.type = _$.PostType.Root
    this.tags = []
    this.children = []
    this.timestamp = Date.now()
    this.last_edited = Date.now()

    this.construct ( data )
  }

  _$.Post.prototype.construct = function ( data ) {
    if (data.name !== undefined)
      this.name = data.name
    if (data.content !== undefined)
      this.content = data.content
    if (data.creator !== undefined)
      this.creator = data.creator
    if (data.type !== undefined)
      this.type = data.type
    if (data.tags !== undefined)
      this.tags = data.tags
    if (data.children !== undefined)
      this.children = data.children
    if (data.timestamp !== undefined)
      this.timestamp = data.timestamp
    if (data.last_edited !== undefined)
      this.last_edited = data.last_edited
  }
  
  _$.Post.newPost = function (callback) {
    // Create a form for the user to fill out
    var url = window.location.origin + '/views/SquawkPost.html?' + Date.now
    Meteor.http.get( url, function ( _, obj ) {
      var html = obj.content

      var data = {
        "html" : html
      }

      callback( data )
    } )
  }
}();
