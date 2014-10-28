/* =====================================
 * Database Model
 *
 * Shared between the client and server
 * ===================================== */
/* global Meteor */
/* global TwitterTokens */
/* global TwitterTrends */
/* global TwitterTweets */
/* global TwitterUsers */
/* global Searches */
/* global Logger */

'use strict';

TwitterTokens = new Meteor.Collection( 'twitter_tokens' );
TwitterTrends = new Meteor.Collection( 'twitter_trends' );
TwitterTweets = new Meteor.Collection( 'twitter_tweets' );
TwitterUsers  = new Meteor.Collection( 'twitter_users' );
Searches      = new Meteor.Collection( 'searches' );
Logger        = new Meteor.Collection( 'log' );


if (Meteor.isServer) {
  var blackoutRules = {
    insert : function () { return false; },
    update : function () { return false; },
    remove : function () { return false; },
    fetch : []
  };
  var allowRules = {
    insert : function () { return true; },
    update : function () { return true; },
    remove : function () { return true; }
  };

  // Dont expose Tweets, Tokens, or Users
  TwitterTokens.deny ( blackoutRules );
  Meteor.publish("twitter_tokens", function () {
    return null;
  });

  TwitterTweets.deny ( blackoutRules );
  Meteor.publish( "twitter_tweets", function () {
    return null;
  } );

  TwitterUsers.deny ( blackoutRules );
  Meteor.publish("twitter_users", function () {
    return null;
  });

  // Limit Trend exposure
  TwitterTrends.allow ( allowRules );
  Meteor.publish( "twitter_trends", function () {
    return TwitterTrends.find( { 
      date_created : { 
        $exists : true 
      } 
    }, { 
      sort : {
        date_created : -1
      },
      limit : 10 } );
    });

  // Limit Trend exposure
  Searches.allow ( allowRules );
  Meteor.publish("searches", function () {
    return Searches.find( { 
      date_created : { 
        $exists : true 
      } 
    }, { 
      sort : {
        date_created : -1
      },
      limit : 10 } );
    });
}