/* =====================================
 * Database Model
 *
 * Shared between the client and server
 * ===================================== */

Posts = new Meteor.Collection('posts')

if ( Meteor.isServer ) {
  Meteor.publish('posts', function () {
    // TODO make more restrictive
    return Posts.find()
  } )
}