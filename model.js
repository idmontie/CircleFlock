/* =====================================
 * Database Model
 *
 * Shared between the client and server
 * ===================================== */

TwitterTokens = new Meteor.Collection( 'twitter_tokens' )
TwitterTrends = new Meteor.Collection( 'twitter_trends' )
TwitterTweets = new Meteor.Collection( 'twitter_tweets' )
TwitterUsers = new Meteor.Collection( 'twitter_users' )

Logger = new Meteor.Collection( 'log' )


if (Meteor.isServer) {
  // Dont expose Tweets, Tokens, or Users
  TwitterTokens.deny ( {
    insert : function () { return false },
    update : function () { return false },
    remove : function () { return false },
    fetch : []
  } )
  Meteor.publish("twitter_tokens", function () {
    return null
  });

  TwitterTweets.deny ( {
    insert : function () { return false },
    update : function () { return false },
    remove : function () { return false },
    fetch : []
  } )
  Meteor.publish("twitter_tweets", function () {
    return null
  });

  TwitterUsers.deny ( {
    insert : function () { return false },
    update : function () { return false },
    remove : function () { return false },
    fetch : []
  } )
  Meteor.publish("twitter_users", function () {
    return null
  });

  // Limit Trend exposure
  TwitterTrends.allow ( {
    insert : function () { return true },
    update : function () { return true },
    remove : function () { return true }
  } )
  Meteor.publish("twitter_trends", function () {
    return TwitterTrends.find( { 
      date_created : { 
        $exists : true 
      } 
    }, { 
      sort : {
        date_created : 1
      },
      limit : 10 } )
    });
}